//! The chord synth (polyphonic) and the lead (mono, with glide), built from one voice.
//!
//! A voice is five band-limited oscillators (three detuned saws or pulses, a sub and the
//! voicing partials), a zero-delay-feedback ladder and two envelopes. It runs at 2x and
//! the sum is decimated once, like the bass, so the filter and oscillators stay clean up
//! the keyboard.
//!
//! "voicing" is how the voice is stacked: 0 is three saws, then a sub octave comes in,
//! then the octave above and the fifth, like pulling out the drawbars of an organ.
//! "spread" is how far the three saws are detuned from each other (0 to 36 cents).

use crate::dsp::env::{Adsr, Stage};
use crate::dsp::filter::{Ladder, OnePoleHp};
use crate::dsp::osc::{BlepOsc, Sine};
use crate::dsp::oversample::{BassDecimator, BASS_DECIM_DELAY, DRIVE_DELAY};
use crate::dsp::smooth::Smooth;
use crate::dsp::{note_hz, tau_coef, Rng};
use crate::params::*;

pub const CHORD_VOICES: usize = 6;
const STACK: usize = 16;

#[inline]
fn smoothstep(a: f32, b: f32, x: f32) -> f32 {
    let t = ((x - a) / (b - a)).clamp(0.0, 1.0);
    t * t * (3.0 - 2.0 * t)
}

/// Controls for one oversampled sample, already smoothed.
#[derive(Clone, Copy)]
struct Ctl {
    cutoff: f32,
    res: f32,
    env_amt: f32,
    voicing: f32,
    /// Detune ratio between the saws.
    spread: f32,
    wave: f32,
    /// Lfo now: octaves on the cutoff, semitones on the pitch, gain on the volume.
    lfo_oct: f32,
    lfo_semi: f32,
    lfo_gain: f32,
    /// Fm amount (0 is the normal voice, 1 is all fm) and the modulator ratio.
    fm: f32,
    ratio: f32,
}

/// A voice card: the small fixed differences between the voices of a real polysynth, where each
/// voice is its own circuit board with its own component tolerances. Voice 3 is always a touch sharp,
/// voice 5 a touch darker, so a chord beats gently and a saved song recalls exactly. Deterministic.
#[derive(Clone, Copy, Default)]
pub struct Card {
    /// Tuning offset in semitones (a few cents).
    pub semis: f32,
    /// Filter cutoff offset in octaves.
    pub cut_oct: f32,
    /// Envelope time scale.
    pub env: f32,
}

impl Card {
    pub fn of(slot: usize) -> Card {
        // A small hash per slot, three numbers in -1..1.
        let h = |k: u32| {
            let mut x = (slot as u32 + 1).wrapping_mul(0x9E37_79B9) ^ k.wrapping_mul(0x85EB_CA6B);
            x ^= x >> 15;
            x = x.wrapping_mul(0x2C1B_3C6D);
            x ^= x >> 12;
            (x as f32 / u32::MAX as f32) * 2.0 - 1.0
        };
        let c = Card { semis: h(1) * 0.035, cut_oct: h(2) * 0.08, env: 1.0 + h(3) * 0.06 }; c
    }
}

struct Voice {
    card: Card,
    note: u8,
    age: u32,
    pitch: f32,
    target: f32,
    glide_coef: f32,
    vel: f32,
    drift: f32,
    drift_target: f32,
    osc: [BlepOsc; 5],
    sub: Sine,
    ladder: Ladder,
    amp: Adsr,
    fenv: Adsr,
    car: f32,
    modp: f32,
}

impl Voice {
    fn new(os: f32, slot: usize) -> Self {
        Voice {
            card: Card::of(slot),
            note: 0,
            age: 0,
            pitch: 60.0,
            target: 60.0,
            glide_coef: 0.0,
            vel: 0.0,
            drift: 0.0,
            drift_target: 0.0,
            osc: [BlepOsc::new(); 5],
            sub: Sine::default(),
            ladder: Ladder::default(),
            amp: Adsr::new(os),
            fenv: Adsr::new(os),
            car: 0.0,
            modp: 0.0,
        }
    }

    fn active(&self) -> bool {
        self.amp.is_active()
    }

    fn gated(&self) -> bool {
        self.amp.is_active() && self.amp.stage != Stage::Release
    }

    /// `phase` is where the free-running oscillators happen to be (0..1): real oscillators never stop,
    /// so a new note starts wherever they are, and no two notes start identically.
    fn start(&mut self, note: u8, vel: f32, age: u32, phase: f32) {
        self.note = note;
        self.vel = vel;
        self.age = age;
        self.pitch = note as f32;
        self.target = note as f32;
        self.glide_coef = 0.0;
        // Spread the starting phases so the saws do not add up into a spike.
        if !self.amp.is_active() {
            for (i, o) in self.osc.iter_mut().enumerate() {
                // Spread so the saws don't add up into a spike, then turned by where the oscillators are.
                o.reset(([0.0, 0.31, 0.67, 0.12, 0.49][i] + phase).fract());
            }
            self.ladder.reset();
            self.car = 0.0;
            self.modp = 0.0;
        }
        self.amp.gate_on();
        self.fenv.gate_on();
    }

    fn release(&mut self) {
        self.amp.gate_off();
        self.fenv.gate_off();
    }

    /// One oversampled sample.
    #[inline]
    fn tick(&mut self, c: &Ctl, os: f32) -> f32 {
        self.pitch = self.target + (self.pitch - self.target) * self.glide_coef;
        let f = note_hz(self.pitch + self.drift + c.lfo_semi + self.card.semis);
        let dt = f / os;
        let w = c.wave;
        let mix = |(saw, sq): (f32, f32)| saw * (1.0 - w) + sq * w * 0.8;
        let main = mix(self.osc[0].next(dt));
        let up = mix(self.osc[1].next(dt * c.spread));
        let down = mix(self.osc[2].next(dt / c.spread));
        let v = c.voicing;
        let w_sub = smoothstep(0.0, 0.5, v) * 0.8;
        let w_oct = smoothstep(0.35, 0.85, v) * 0.5;
        let w_fifth = smoothstep(0.7, 1.0, v) * 0.4;
        let mut s = main * 0.45 + (up + down) * 0.3 + self.sub.next(dt * 0.5) * w_sub * 0.6;
        if w_oct > 0.001 {
            s += self.osc[3].next(dt * 2.0).0 * w_oct * 0.5;
        }
        if w_fifth > 0.001 {
            s += self.osc[4].next(dt * 1.5).0 * w_fifth * 0.5;
        }
        let fe = self.fenv.next();
        // Two-operator fm, like Operator's simplest algorithm: a sine modulator bends a sine
        // carrier's phase. The filter envelope opens the index too, so it starts bright and settles.
        if c.fm > 0.001 {
            self.car += dt;
            self.car -= self.car.floor();
            self.modp += dt * c.ratio;
            self.modp -= self.modp.floor();
            let index = c.fm * 5.0 * (0.3 + 0.7 * fe);
            let m = (core::f32::consts::TAU * self.modp).sin();
            let carrier = (core::f32::consts::TAU * self.car + index * m).sin();
            let mix = (c.fm * 3.0).min(1.0);
            s = s * (1.0 - mix) + carrier * mix * 0.9;
        }
        let env_oct = c.env_amt * 5.0 * fe * (0.45 + 0.55 * self.vel);
        let key_oct = (self.pitch - 60.0) / 12.0 * 0.4;
        let fc = (c.cutoff * (env_oct + key_oct + c.lfo_oct + self.card.cut_oct).exp2()).clamp(30.0, os * 0.45);
        self.ladder.set(fc, c.res, os);
        let y = self.ladder.tick(s * 0.5);
        y * self.amp.next() * (0.4 + 0.6 * self.vel) * c.lfo_gain
    }
}

/// The smoothed controls both synths share.
struct Controls {
    cutoff: Smooth,
    res: Smooth,
    env_amt: Smooth,
    voicing: Smooth,
    spread: Smooth,
    wave: Smooth,
    lfo_amt: Smooth,
    fm: Smooth,
    /// Lfo rate in Hz, where it goes (lfo_dest) and its phase (0..1).
    lfo_rate: f32,
    lfo_to: u8,
    lfo_phase: f32,
    ratio: f32,
    os: f32,
}

impl Controls {
    fn new(os: f32) -> Self {
        let mut c = Controls {
            cutoff: Smooth::new(2000.0),
            res: Smooth::new(0.2),
            env_amt: Smooth::new(0.3),
            voicing: Smooth::new(0.3),
            spread: Smooth::new(0.2),
            wave: Smooth::new(0.0),
            lfo_amt: Smooth::new(0.0),
            fm: Smooth::new(0.0),
            lfo_rate: 1.4,
            lfo_to: 0,
            lfo_phase: 0.0,
            ratio: 2.0,
            os,
        };
        for s in [&mut c.cutoff, &mut c.res, &mut c.env_amt, &mut c.voicing, &mut c.spread, &mut c.wave, &mut c.lfo_amt, &mut c.fm] {
            s.set_time(10.0, os);
        }
        c
    }

    fn reset(&mut self) {
        for s in [&mut self.cutoff, &mut self.res, &mut self.env_amt, &mut self.voicing, &mut self.spread, &mut self.wave, &mut self.lfo_amt, &mut self.fm] {
            s.reset(s.target);
        }
    }

    #[inline]
    fn next(&mut self) -> Ctl {
        // spread is 0..1 -> up to 36 cents between the saws.
        let cents = self.spread.next() * 36.0;
        let amt = self.lfo_amt.next();
        self.lfo_phase += self.lfo_rate / self.os;
        self.lfo_phase -= self.lfo_phase.floor();
        let w = (core::f32::consts::TAU * self.lfo_phase).sin();
        let (lfo_oct, lfo_semi, lfo_gain) = match self.lfo_to {
            0 => (amt * 3.0 * w, 0.0, 1.0),
            1 => (0.0, amt * 2.0 * w, 1.0),
            _ => (0.0, 0.0, 1.0 - amt * (0.5 + 0.5 * w)),
        };
        Ctl {
            lfo_oct,
            lfo_semi,
            lfo_gain,
            fm: self.fm.next(),
            ratio: self.ratio,
            cutoff: self.cutoff.next(),
            res: self.res.next(),
            env_amt: self.env_amt.next(),
            voicing: self.voicing.next(),
            spread: (cents / 1200.0).exp2(),
            wave: self.wave.next(),
        }
    }
}

/// Line the synth up with the drum rack: the voice's half-band plus this pad make up the
/// same delay a drum pad's drive stage has.
fn pdc_samples() -> usize {
    (crate::engine::VOICE_LATENCY as f64 - DRIVE_DELAY - BASS_DECIM_DELAY) as usize
}

struct Out {
    dec: BassDecimator,
    dc: OnePoleHp,
    pdc: [f32; 32],
    pos: usize,
    n: usize,
}

impl Out {
    fn new(sr: f32) -> Self {
        let mut dc = OnePoleHp::default();
        dc.set(18.0, sr);
        Out { dec: BassDecimator::new(), dc, pdc: [0.0; 32], pos: 0, n: pdc_samples() }
    }

    #[inline]
    fn push(&mut self, a: f32, b: f32) -> f32 {
        let y = self.dc.tick(self.dec.process(a, b));
        let out = self.pdc[(self.pos + 32 - self.n) % 32];
        self.pdc[self.pos] = y;
        self.pos = (self.pos + 1) % 32;
        out
    }
}

// ── Chords ───────────────────────────────────────────────────────────────────

pub struct Poly {
    sr: f32,
    os: f32,
    voices: [Voice; CHORD_VOICES],
    ctl: Controls,
    out: Out,
    clock: u32,
    rng: Rng,
    drift_amt: f32,
    drift_count: u32,
    attack_s: f32,
    release_s: f32,
    fdecay_s: f32,
    frel_s: f32,
}

impl Poly {
    pub fn new(sr: f32) -> Self {
        let os = sr * 2.0;
        let mut p = Poly {
            sr,
            os,
            voices: core::array::from_fn(|i| Voice::new(os, i)),
            ctl: Controls::new(os),
            out: Out::new(sr),
            clock: 0,
            rng: Rng::new(0xC40D),
            drift_amt: 0.25,
            drift_count: 0,
            attack_s: 0.05,
            release_s: 0.4,
            fdecay_s: 0.6,
            frel_s: 0.4,
        };
        for (i, s) in CHORD_PARAMS.iter().enumerate() {
            p.set_param(i, s.to_value(s.default));
        }
        p.ctl.reset();
        p
    }

    /// `i` counts from the instrument block, value in real units.
    pub fn set_param(&mut self, i: usize, v: f32) {
        match i {
            C_VOICING => self.ctl.voicing.set(v),
            C_SPREAD => self.ctl.spread.set(v),
            C_ATTACK => {
                self.attack_s = v * 0.001;
                self.update_envs();
            }
            C_RELEASE => {
                self.release_s = v * 0.001;
                self.update_envs();
            }
            C_CUTOFF => self.ctl.cutoff.set(v),
            C_RES => self.ctl.res.set(v),
            C_ENV => self.ctl.env_amt.set(v),
            C_DRIFT => self.drift_amt = v,
            C_LFO_RATE => self.ctl.lfo_rate = v,
            C_LFO => self.ctl.lfo_amt.set(v),
            C_LFO_TO => self.ctl.lfo_to = lfo_dest(v),
            C_FM => self.ctl.fm.set(v),
            C_RATIO => self.ctl.ratio = fm_ratio(v),
            C_FDECAY => {
                self.fdecay_s = v * 0.001;
                self.update_envs();
            }
            C_FREL => {
                self.frel_s = v * 0.001;
                self.update_envs();
            }
            _ => {}
        }
    }

    fn update_envs(&mut self) {
        let (a, r) = (self.attack_s, self.release_s);
        let _ = r;
        for v in self.voices.iter_mut() {
            let k = v.card.env;
            v.amp.set(a * k, 0.4 * k, 0.85, r * k);
            v.fenv.set((0.002 + a * 0.5) * k, self.fdecay_s * k, 0.35, self.frel_s * k);
        }
    }

    pub fn note_on(&mut self, note: u8, vel: f32) {
        self.clock = self.clock.wrapping_add(1);
        // The same note again: take its voice back, so it never doubles up.
        let mut pick = self.voices.iter().position(|v| v.active() && v.note == note);
        if pick.is_none() {
            pick = self.voices.iter().position(|v| !v.active());
        }
        if pick.is_none() {
            // Steal: the oldest voice that is already releasing, else the oldest of all.
            let mut best: Option<(usize, u32, bool)> = None;
            for (i, v) in self.voices.iter().enumerate() {
                let releasing = !v.gated();
                let better = match best {
                    None => true,
                    Some((_, age, rel)) => (releasing && !rel) || (releasing == rel && v.age < age),
                };
                if better {
                    best = Some((i, v.age, releasing));
                }
            }
            pick = best.map(|b| b.0);
        }
        if let Some(i) = pick {
            let age = self.clock;
            let ph = (self.rng.bipolar() + 1.0) * 0.5;
            self.voices[i].start(note, vel, age, ph);
        }
    }

    pub fn note_off(&mut self, note: u8) {
        for v in self.voices.iter_mut() {
            if v.note == note && v.gated() {
                v.release();
            }
        }
    }

    pub fn all_off(&mut self) {
        for v in self.voices.iter_mut() {
            if v.gated() {
                v.release();
            }
        }
    }

    /// Voices that are making sound (held or ringing out).
    pub fn active_voices(&self) -> usize {
        self.voices.iter().filter(|v| v.active()).count()
    }

    pub fn is_active(&self) -> bool {
        self.voices.iter().any(|v| v.active())
    }

    #[inline]
    pub fn tick(&mut self) -> f32 {
        if !self.is_active() {
            // Keep the delay line moving so the tail of the last note is not cut.
            return self.out.push(0.0, 0.0);
        }
        // Each voice drifts a few cents on its own, like analogue oscillators warming up.
        if self.drift_count == 0 {
            self.drift_count = (self.sr * 0.05) as u32;
            let amt = self.drift_amt * 0.08;
            for v in self.voices.iter_mut() {
                v.drift_target = self.rng.bipolar() * amt;
            }
        }
        self.drift_count -= 1;
        for v in self.voices.iter_mut() {
            v.drift += (v.drift_target - v.drift) * 0.0005;
        }
        let mut sum = [0.0f32; 2];
        for k in 0..2 {
            let c = self.ctl.next();
            let mut s = 0.0;
            for v in self.voices.iter_mut() {
                if v.active() {
                    s += v.tick(&c, self.os);
                }
            }
            sum[k] = s;
        }
        // Six voices at full velocity would clip a strip; keep the headroom of one note.
        self.out.push(sum[0] * 0.42, sum[1] * 0.42)
    }
}

// ── Lead ─────────────────────────────────────────────────────────────────────

pub struct Lead {
    sr: f32,
    os: f32,
    voice: Voice,
    stack: [u8; STACK],
    held: usize,
    ctl: Controls,
    out: Out,
    glide_ms: f32,
    release_s: f32,
    attack_s: f32,
    fdecay_s: f32,
    frel_s: f32,
    rng: Rng,
}

impl Lead {
    pub fn new(sr: f32) -> Self {
        let os = sr * 2.0;
        let mut l = Lead {
            sr,
            os,
            // One voice: it keeps its card's filter and envelope character but stays exactly in tune,
            // since there is no other voice for it to beat against.
            voice: { let mut v = Voice::new(os, 0); v.card.semis = 0.0; v },
            stack: [0; STACK],
            held: 0,
            ctl: Controls::new(os),
            out: Out::new(sr),
            glide_ms: 60.0,
            release_s: 0.3,
            attack_s: 0.005,
            fdecay_s: 0.35,
            frel_s: 0.3,
            rng: Rng::new(0x1EAD),
        };
        l.ctl.voicing.set(0.15);
        for (i, s) in LEAD_PARAMS.iter().enumerate() {
            l.set_param(i, s.to_value(s.default));
        }
        l.ctl.reset();
        l
    }

    pub fn set_param(&mut self, i: usize, v: f32) {
        match i {
            LD_CUTOFF => self.ctl.cutoff.set(v),
            LD_RES => self.ctl.res.set(v),
            LD_ATTACK => {
                self.attack_s = v * 0.001;
                self.update_envs();
            }
            LD_RELEASE => {
                self.release_s = v * 0.001;
                self.update_envs();
            }
            LD_GLIDE => self.glide_ms = v,
            LD_WAVE => self.ctl.wave.set(v),
            LD_DETUNE => self.ctl.spread.set(v),
            LD_ENV => self.ctl.env_amt.set(v),
            LD_LFO_RATE => self.ctl.lfo_rate = v,
            LD_LFO => self.ctl.lfo_amt.set(v),
            LD_LFO_TO => self.ctl.lfo_to = lfo_dest(v),
            LD_FM => self.ctl.fm.set(v),
            LD_RATIO => self.ctl.ratio = fm_ratio(v),
            LD_FDECAY => {
                self.fdecay_s = v * 0.001;
                self.update_envs();
            }
            LD_FREL => {
                self.frel_s = v * 0.001;
                self.update_envs();
            }
            _ => {}
        }
    }

    fn update_envs(&mut self) {
        self.voice.amp.set(self.attack_s, 0.3, 0.9, self.release_s);
        self.voice.fenv.set(0.001, self.fdecay_s, 0.4, self.frel_s);
    }

    fn remove(&mut self, note: u8) {
        let mut j = 0;
        for i in 0..self.held {
            if self.stack[i] != note {
                self.stack[j] = self.stack[i];
                j += 1;
            }
        }
        self.held = j;
    }

    pub fn note_on(&mut self, note: u8, vel: f32) {
        let legato = self.held > 0 && self.voice.gated();
        self.remove(note);
        if self.held < STACK {
            self.stack[self.held] = note;
            self.held += 1;
        }
        if legato {
            self.voice.target = note as f32;
            self.voice.note = note;
            self.voice.glide_coef = if self.glide_ms > 0.5 { tau_coef(self.glide_ms * 0.001 / 3.0, self.os) } else { 0.0 };
            if self.voice.glide_coef == 0.0 {
                self.voice.pitch = self.voice.target;
            }
        } else {
            let ph = (self.rng.bipolar() + 1.0) * 0.5;
            self.voice.start(note, vel, 0, ph);
        }
    }

    pub fn note_off(&mut self, note: u8) {
        self.remove(note);
        if self.held > 0 {
            // Fall back to the note still held.
            let n = self.stack[self.held - 1];
            self.voice.target = n as f32;
            self.voice.note = n;
            self.voice.glide_coef = if self.glide_ms > 0.5 { tau_coef(self.glide_ms * 0.001 / 3.0, self.os) } else { 0.0 };
            if self.voice.glide_coef == 0.0 {
                self.voice.pitch = self.voice.target;
            }
        } else {
            self.voice.release();
        }
    }

    pub fn all_off(&mut self) {
        self.held = 0;
        self.voice.release();
    }

    pub fn is_active(&self) -> bool {
        self.voice.active()
    }

    #[inline]
    pub fn tick(&mut self) -> f32 {
        if !self.voice.active() {
            return self.out.push(0.0, 0.0);
        }
        let _ = self.sr;
        let c0 = self.ctl.next();
        let a = self.voice.tick(&c0, self.os);
        let c1 = self.ctl.next();
        let b = self.voice.tick(&c1, self.os);
        self.out.push(a * 0.6, b * 0.6)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn run(mut f: impl FnMut() -> f32, n: usize) -> Vec<f32> {
        (0..n).map(|_| f()).collect()
    }

    #[test]
    fn four_note_chord_uses_four_voices_and_is_audible() {
        let mut p = Poly::new(48_000.0);
        for n in [57, 60, 64, 67] {
            p.note_on(n, 0.9);
        }
        assert_eq!(p.active_voices(), 4);
        let y = run(|| p.tick(), 24_000);
        assert!(y.iter().all(|v| v.is_finite()));
        let peak = y.iter().fold(0.0f32, |a, b| a.max(b.abs()));
        assert!(peak > 0.05 && peak < 1.0, "peak {peak}");
    }

    #[test]
    fn same_note_does_not_double_up_and_seventh_chord_steals_cleanly() {
        let mut p = Poly::new(48_000.0);
        p.note_on(60, 1.0);
        p.note_on(60, 1.0);
        assert_eq!(p.active_voices(), 1);
        for n in 40..48 {
            p.note_on(n, 1.0);
        }
        assert_eq!(p.active_voices(), CHORD_VOICES);
    }

    #[test]
    fn note_off_releases_and_ends() {
        let mut p = Poly::new(48_000.0);
        p.note_on(60, 1.0);
        run(|| p.tick(), 4_800);
        p.note_off(60);
        run(|| p.tick(), 48_000 * 6);
        assert!(!p.is_active());
    }

    #[test]
    fn lead_glides_on_legato() {
        let mut l = Lead::new(48_000.0);
        l.set_param(LD_GLIDE, 120.0);
        l.note_on(60, 1.0);
        run(|| l.tick(), 2_000);
        l.note_on(72, 1.0);
        run(|| l.tick(), 1_000);
        assert!(l.voice.pitch > 60.5 && l.voice.pitch < 71.5, "pitch {}", l.voice.pitch);
        run(|| l.tick(), 48_000);
        assert!((l.voice.pitch - 72.0).abs() < 0.1);
    }

    #[test]
    fn lead_returns_to_the_held_note() {
        let mut l = Lead::new(48_000.0);
        l.set_param(LD_GLIDE, 0.0);
        l.note_on(60, 1.0);
        l.note_on(64, 1.0);
        l.note_off(64);
        assert_eq!(l.voice.target, 60.0);
        assert!(l.is_active());
    }

    fn rms(y: &[f32]) -> f32 {
        (y.iter().map(|v| v * v).sum::<f32>() / y.len() as f32).sqrt()
    }
    /// Energy of the first difference over the energy of the signal: a rough brightness.
    fn bright(y: &[f32]) -> f32 {
        let d: f32 = y.windows(2).map(|w| (w[1] - w[0]).powi(2)).sum();
        d / y.iter().map(|v| v * v).sum::<f32>().max(1e-9)
    }

    #[test]
    fn lfo_on_volume_pulses_the_level() {
        let mut l = Lead::new(48_000.0);
        l.set_param(LD_LFO_RATE, 4.0);
        l.set_param(LD_LFO, 1.0);
        l.set_param(LD_LFO_TO, 1.0);
        l.note_on(57, 1.0);
        let y = run(|| l.tick(), 96_000);
        // 10 ms windows across half a second, once the envelopes settle: loud and quiet ones.
        let w: Vec<f32> = y[48_000..72_000].chunks(480).map(rms).collect();
        let (lo, hi) = w.iter().fold((f32::MAX, 0.0f32), |(a, b), v| (a.min(*v), b.max(*v)));
        assert!(hi > lo * 4.0, "lo {lo} hi {hi}");
        // and off (detune off too, or the saws beat against each other), it holds steady
        let mut m = Lead::new(48_000.0);
        m.set_param(LD_DETUNE, 0.0);
        m.note_on(57, 1.0);
        let y = run(|| m.tick(), 96_000);
        let w: Vec<f32> = y[48_000..72_000].chunks(480).map(rms).collect();
        let (lo, hi) = w.iter().fold((f32::MAX, 0.0f32), |(a, b), v| (a.min(*v), b.max(*v)));
        assert!(hi < lo * 1.5, "lo {lo} hi {hi}");
    }

    #[test]
    fn lfo_on_the_filter_moves_the_brightness() {
        let mut l = Lead::new(48_000.0);
        l.set_param(LD_LFO_RATE, 2.0);
        l.set_param(LD_LFO, 1.0);
        l.set_param(LD_LFO_TO, 0.0);
        l.note_on(45, 1.0);
        let y = run(|| l.tick(), 48_000);
        let b: Vec<f32> = y[12_000..36_000].chunks(1_200).map(bright).collect();
        let (lo, hi) = b.iter().fold((f32::MAX, 0.0f32), |(a, c), v| (a.min(*v), c.max(*v)));
        assert!(hi > lo * 2.0, "lo {lo} hi {hi}");
    }

    #[test]
    fn fm_changes_the_tone_and_ratio_matters() {
        let take = |fm: f32, ratio: f32| {
            let mut l = Lead::new(48_000.0);
            l.set_param(LD_CUTOFF, 12_000.0);
            l.set_param(LD_FM, fm);
            l.set_param(LD_RATIO, ratio);
            l.note_on(45, 1.0);
            run(|| l.tick(), 24_000)
        };
        let plain = take(0.0, 0.25);
        let fm2 = take(1.0, 0.25);
        let fm7 = take(1.0, 0.85);
        assert!(fm2.iter().chain(&fm7).all(|v| v.is_finite()));
        assert!(fm2.iter().chain(&fm7).fold(0.0f32, |a, b| a.max(b.abs())) < 1.0);
        let (bp, b2, b7) = (bright(&plain[4_800..]), bright(&fm2[4_800..]), bright(&fm7[4_800..]));
        assert!((b2 - bp).abs() > bp * 0.2, "plain {bp} fm2 {b2}");
        assert!((b7 - b2).abs() > b2 * 0.2, "fm2 {b2} fm7 {b7}");
    }

    #[test]
    fn filter_decay_is_its_own_knob() {
        let take = |fdecay: f32| {
            let mut l = Lead::new(48_000.0);
            l.set_param(LD_CUTOFF, 300.0);
            l.set_param(LD_ENV, 1.0);
            l.set_param(LD_FDECAY, fdecay);
            l.note_on(45, 1.0);
            let y = run(|| l.tick(), 48_000);
            bright(&y[19_200..24_000]) // 0.4 to 0.5 s in
        };
        let (short, long) = (take(60.0), take(2_500.0));
        assert!(long > short * 1.5, "short {short} long {long}");
    }

    #[test]
    fn chords_take_the_lfo_and_fm_too() {
        let mut p = Poly::new(48_000.0);
        p.set_param(C_FM, 1.0);
        p.set_param(C_LFO, 1.0);
        p.set_param(C_LFO_TO, 0.5);
        for n in [57, 60, 64] {
            p.note_on(n, 0.9);
        }
        let y = run(|| p.tick(), 24_000);
        assert!(y.iter().all(|v| v.is_finite()));
        let peak = y.iter().fold(0.0f32, |a, b| a.max(b.abs()));
        assert!(peak > 0.05 && peak < 1.0, "peak {peak}");
        assert!(rms(&y[12_000..]) > 0.01);
    }
}
