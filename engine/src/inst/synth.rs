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
use crate::dsp::filter::{CharFilter, FilterDrive, OnePoleHp};
use crate::dsp::resonator::Comb;
use crate::dsp::wavetable::{phase_distort, FbFm, Tables};
use crate::dsp::osc::{MinBlepOsc as BlepOsc, Sine};
use crate::dsp::oversample::{BassDecimator, BASS_DECIM_DELAY, DRIVE_DELAY};
use crate::dsp::smooth::Smooth;
use crate::dsp::{flush_denormal, note_hz, tau_coef, Rng};
use crate::params::*;

pub const CHORD_VOICES: usize = 6;
const STACK: usize = 16;

/// The JP-8000 supersaw, measured by Adam Szabo ("How to Emulate the Super Saw", 2010): six side
/// saws at these offsets (as fractions of the detune amount) around a centre saw.
const SIDE_OFFSETS: [f32; 6] = [-0.110_023_13, -0.062_884_39, -0.019_523_56, 0.019_912_21, 0.062_165_38, 0.107_452_42];

/// Szabo's fit of the JP-8000 detune knob: gentle over most of its travel (the sweet spot), then
/// steep. Our knob covers 0 to 0.92 of it, so full detune is a wide 70 cents, not a whole tone.
fn jp_detune(x: f32) -> f32 {
    let x = (x * 0.92) as f64;
    const C: [f64; 12] = [
        10_028.731_289_163_4, -50_818.865_204_592_4, 111_363.480_872_936_8, -138_150.676_108_054_8,
        106_649.667_915_829_2, -53_046.964_275_187_5, 17_019.951_858_008, -3_425.083_659_131_8,
        404.270_393_838_8, -24.187_882_439_1, 0.671_741_763_4, 0.003_011_559_6,
    ];
    C.iter().fold(0.0, |acc, c| acc * x + c) as f32
}
/// Szabo's mix laws: the centre saw fades a little and the side saws come up as detune rises.
fn jp_centre(x: f32) -> f32 {
    -0.553_66 * x + 0.997_85
}
fn jp_side(x: f32) -> f32 {
    -0.737_64 * x * x + 1.284_1 * x + 0.044_372
}

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
    /// Detune knob, 0..1 (the supersaw curve is applied in the voice).
    spread: f32,
    wave: f32,
    /// Lfo now: octaves on the cutoff, semitones on the pitch, gain on the volume.
    lfo_oct: f32,
    lfo_semi: f32,
    lfo_gain: f32,
    /// Fm amount (0 is the normal voice, 1 is all fm) and the modulator ratio.
    fm: f32,
    ratio: f32,
    /// Filter character (warm, scream, smooth) and the drive into the filter, 0..1.
    character: u8,
    fdrive: f32,
    /// What makes the sound (`voice_model`), the resonator's ring at middle c (s) and the strike's brightness.
    model: u8,
    ring: f32,
    bright: f32,
    /// Which oscillator (`osc_kind`).
    osc: u8,
}

/// Resonator voices: output gains that put each at about the level of the synth voice (tests/sound.rs).
const PLUCK_GAIN: f32 = 3.80;
const MALLET_GAIN: f32 = 0.617;
const KEYS_GAIN: f32 = 1.95;
/// Keys: the two strings sit this far either side of the note (1.2 cents), so they beat slowly.
const KEYS_SPLIT: f32 = 0.000_7;

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
    filt: CharFilter,
    fdrive: FilterDrive,
    amp: Adsr,
    fenv: Adsr,
    car: f32,
    modp: f32,
    /// The six side saws of the supersaw.
    side: [BlepOsc; 6],
    /// High-pass at the fundamental on the saw stack (the JP-8000 does this): no rumble under it.
    hp_s: f32,
    /// The resonators (engine 2, item 10) and their strike: samples since the strike, its length, a
    /// one-pole state for the pluck's noise, and the voice's own noise.
    res: [Comb; 2],
    exc_t: u32,
    exc_len: u32,
    exc_lp: f32,
    /// Mallet: the note it struck and the second mode's own strike this sample.
    exc_f: f32,
    exc_x1: f32,
    noise: Rng,
    /// The resonators have rung since they were last cleared.
    res_dirty: bool,
    /// Item 12: the table and phase-distortion phase, the feedback fm's memory, and the tables.
    wt_ph: f32,
    fbfm: FbFm,
    tables: &'static Tables,
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
            filt: CharFilter::default(),
            fdrive: FilterDrive::default(),
            amp: Adsr::new(os),
            fenv: Adsr::new(os),
            car: 0.0,
            modp: 0.0,
            side: [BlepOsc::new(); 6],
            hp_s: 0.0,
            res: [Comb::new(), Comb::new()],
            exc_t: u32::MAX,
            exc_len: 0,
            exc_lp: 0.0,
            exc_f: 440.0,
            exc_x1: 0.0,
            noise: Rng::new(0x5EED + slot as u32 * 7_919),
            res_dirty: false,
            wt_ph: 0.0,
            fbfm: FbFm::default(),
            tables: Tables::get(),
        }
    }

    /// Strike the resonators for a new note: tune their loss and decay, and start the exciter.
    fn strike(&mut self, c: &Ctl, os: f32) {
        let f = note_hz(self.pitch + self.drift + self.card.semis);
        let mid = 261.63;
        let br = c.bright;
        self.exc_t = 0;
        self.exc_lp = 0.0;
        match c.model {
            1 => {
                // Pluck: a burst of noise one period long, darker with less brightness; low strings ring longer.
                self.exc_len = (os / f) as u32;
                let t60 = (c.ring * (mid / f).powf(0.5)).min(20.0);
                self.res[0].tune(f, os, 0.02 + 0.2 * (1.0 - br), t60);
            }
            2 => {
                // Mallet: two resonators, a bar's first mode and its overtone four times up (dying three
                // times faster), each struck at its own mode by a short windowed sine, so each rings close
                // to a single mode as a bar does; a click on top for the mallet's hardness.
                self.exc_len = ((2.0 / f).max(0.0015) * os) as u32;
                self.exc_f = f;
                let t60 = (c.ring * (mid / f).powf(0.3)).min(20.0);
                self.res[0].tune(f, os, 0.15, t60);
                self.res[1].tune(f * 4.0, os, 0.15, t60 / 3.0);
            }
            _ => {
                // Keys: a hammer (shorter, so brighter, when struck hard) on two strings a hair apart.
                self.exc_len = ((0.0008 + 0.0025 * (1.0 - br * (0.4 + 0.6 * self.vel))).min(0.6 / f) * os) as u32;
                let t60 = (c.ring * (mid / f).powf(0.6)).min(20.0);
                let taper = 0.03 + 0.15 * (1.0 - br);
                self.res[0].tune(f * (1.0 + KEYS_SPLIT), os, taper, t60);
                self.res[1].tune(f * (1.0 - KEYS_SPLIT), os, taper, t60);
            }
        }
    }

    /// One sample of the resonator voice at pitch `f`.
    #[inline]
    fn resonate(&mut self, c: &Ctl, f: f32, os: f32) -> f32 {
        // The strike.
        let x = if self.exc_t < self.exc_len {
            let t = self.exc_t as f32 / self.exc_len as f32;
            self.exc_t += 1;
            match c.model {
                1 => {
                    let k = 0.1 + 0.85 * c.bright;
                    self.exc_lp += k * (self.noise.bipolar() - self.exc_lp);
                    self.exc_lp
                }
                2 => {
                    // The bar's strike: a windowed sine at each mode (the second goes in below), and a
                    // click in the first millisecond as hard as the brightness asks.
                    let ts = self.exc_t as f32 / os;
                    let win = 0.5 - 0.5 * (core::f32::consts::TAU * t).cos();
                    self.exc_x1 = win * crate::dsp::sin_cycle((ts * self.exc_f * 4.0).fract()) * 0.6;
                    let click = if ts < 0.001 { (0.5 - 0.5 * (core::f32::consts::TAU * ts * 1_000.0).cos()) * c.bright } else { 0.0 };
                    win * crate::dsp::sin_cycle((ts * self.exc_f).fract()) + click
                }
                // A raised-cosine pulse and a little noise (the felt).
                _ => (0.5 - 0.5 * (core::f32::consts::TAU * t).cos()) + 0.15 * self.noise.bipolar(),
            }
        } else {
            self.exc_x1 = 0.0;
            0.0
        };
        let x = x * (0.3 + 0.7 * self.vel);
        self.res_dirty = true;
        match c.model {
            1 => {
                self.res[0].retune(f, os);
                self.res[0].tick(x) * PLUCK_GAIN
            }
            2 => {
                self.res[0].retune(f, os);
                self.res[1].retune(f * 4.0, os);
                let x1 = self.exc_x1 * (0.3 + 0.7 * self.vel);
                (self.res[0].tick(x) + self.res[1].tick(x1)) * MALLET_GAIN
            }
            _ => {
                self.res[0].retune(f * (1.0 + KEYS_SPLIT), os);
                self.res[1].retune(f * (1.0 - KEYS_SPLIT), os);
                // Unequal strings, as in a piano's unison: they beat without ever cancelling.
                (self.res[0].tick(x) * 0.62 + self.res[1].tick(x) * 0.38) * KEYS_GAIN
            }
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
            // The JP-8000 starts its side saws at random phases on every note.
            for (i, o) in self.side.iter_mut().enumerate() {
                o.reset((phase * (i as f32 + 2.0) * 7.31 + i as f32 * 0.137).fract());
            }
            self.hp_s = 0.0;
            self.filt.reset();
            self.fdrive.reset();
            // A resonator may still hold the last note under the envelope's end: start it silent.
            if self.res_dirty {
                for r in self.res.iter_mut() {
                    r.clear();
                }
                self.res_dirty = false;
            }
            self.car = 0.0;
            self.modp = 0.0;
            self.wt_ph = phase;
            self.fbfm.reset();
        }
        self.amp.gate_on();
        self.fenv.gate_on();
        // The resonators are struck on the next sample, when the controls are at hand.
        self.exc_t = u32::MAX - 1;
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
        if c.model > 0 {
            if self.exc_t == u32::MAX - 1 {
                self.strike(c, os);
            }
            let s = self.resonate(c, f, os);
            let fe = self.fenv.next();
            return self.finish(s, fe, c, os);
        }
        let dt = f / os;
        let w = c.wave;

        let fe = self.fenv.next();
        let main = if c.osc == 0 {
            self.osc[0].next_mix(dt, w)
        } else {
            // Item 12: the wavetable, feedback fm or phase distortion, on their own phase.
            let ph = self.wt_ph;
            self.wt_ph += dt;
            self.wt_ph -= self.wt_ph.floor();
            match c.osc {
                1 => self.tables.sample(w, f, ph),
                2 => self.fbfm.next(ph, w * 4.5),
                _ => phase_distort(ph, w * (0.35 + 0.65 * fe), dt),
            }
        };
        // The supersaw: centre saw plus six side saws on the JP-8000 curve and mix laws (classic only).
        let x = if c.osc == 0 { c.spread } else { 0.0 };
        let mut stack = main;
        if x > 0.002 {
            let amt = jp_detune(x);
            let mut sides = 0.0;
            for (o, off) in self.side.iter_mut().zip(SIDE_OFFSETS) {
                sides += o.next_mix(dt * (1.0 + amt * off), w);
            }
            stack = main * jp_centre(x) + sides * jp_side(x) * 0.42;
            // One-pole high-pass at the fundamental, as on the JP-8000, blended in as detune rises so
            // the first touch of the knob doesn't thin the sound all at once; level made up to match.
            let a = (-core::f32::consts::TAU * f / os).exp();
            let hp = stack - self.hp_s;
            self.hp_s = flush_denormal(self.hp_s + (1.0 - a) * hp);
            let k = smoothstep(0.0, 0.35, x);
            stack = (stack + (hp - stack) * k) * (1.0 + 0.4 * k);
        }
        let v = c.voicing;
        let w_sub = smoothstep(0.0, 0.5, v) * 0.8;
        let w_oct = smoothstep(0.35, 0.85, v) * 0.5;
        let w_fifth = smoothstep(0.7, 1.0, v) * 0.4;
        let mut s = stack * 0.75 + self.sub.next(dt * 0.5) * w_sub * 0.6;
        if w_oct > 0.001 {
            s += self.osc[3].next_saw(dt * 2.0) * w_oct * 0.5;
        }
        if w_fifth > 0.001 {
            s += self.osc[4].next_saw(dt * 1.5) * w_fifth * 0.5;
        }
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
        self.finish(s, fe, c, os)
    }

    /// The filter, its drive and the amp: the same for every voice model. `fe` is the filter envelope now.
    #[inline]
    fn finish(&mut self, s: f32, fe: f32, c: &Ctl, os: f32) -> f32 {
        let env_oct = c.env_amt * 5.0 * fe * (0.45 + 0.55 * self.vel);
        let key_oct = (self.pitch - 60.0) / 12.0 * 0.4;
        let fc = (c.cutoff * (env_oct + key_oct + c.lfo_oct + self.card.cut_oct).exp2()).clamp(30.0, os * 0.45);
        self.filt.set_mode(c.character);
        self.filt.set(fc, c.res, os);
        let x = self.fdrive.pre(s * 0.5, c.fdrive);
        let y = self.fdrive.post(self.filt.tick(x), c.fdrive);
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
    fdrive: Smooth,
    character: u8,
    model: u8,
    ring: f32,
    bright: f32,
    osc: u8,
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
            fdrive: Smooth::new(0.0),
            character: 0,
            model: 0,
            ring: 2.0,
            bright: 0.5,
            osc: 0,
            lfo_rate: 1.4,
            lfo_to: 0,
            lfo_phase: 0.0,
            ratio: 2.0,
            os,
        };
        for s in [&mut c.cutoff, &mut c.res, &mut c.env_amt, &mut c.voicing, &mut c.spread, &mut c.wave, &mut c.lfo_amt, &mut c.fm, &mut c.fdrive] {
            s.set_time(10.0, os);
        }
        c
    }

    fn reset(&mut self) {
        for s in [&mut self.cutoff, &mut self.res, &mut self.env_amt, &mut self.voicing, &mut self.spread, &mut self.wave, &mut self.lfo_amt, &mut self.fm, &mut self.fdrive] {
            s.reset(s.target);
        }
    }

    #[inline]
    fn next(&mut self) -> Ctl {
        let spread = self.spread.next();
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
            character: self.character,
            fdrive: self.fdrive.next(),
            model: self.model,
            ring: self.ring,
            bright: self.bright,
            osc: self.osc,
            cutoff: self.cutoff.next(),
            res: self.res.next(),
            env_amt: self.env_amt.next(),
            voicing: self.voicing.next(),
            spread,
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
            C_CHAR => self.ctl.character = step3(v),
            C_FDRIVE => self.ctl.fdrive.set(v),
            C_VOICE => self.ctl.model = voice_model(v),
            C_RING => self.ctl.ring = v * 0.001,
            C_BRIGHT => self.ctl.bright = v,
            C_OSC => self.ctl.osc = osc_kind(v),
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

    /// Where the lfo is in its cycle (0..1), for modulation routed from it (engine.rs).
    pub fn lfo_phase(&self) -> f32 {
        self.ctl.lfo_phase
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
            LD_CHAR => self.ctl.character = step3(v),
            LD_FDRIVE => self.ctl.fdrive.set(v),
            LD_VOICE => self.ctl.model = voice_model(v),
            LD_RING => self.ctl.ring = v * 0.001,
            LD_BRIGHT => self.ctl.bright = v,
            LD_OSC => self.ctl.osc = osc_kind(v),
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

    /// Where the lfo is in its cycle (0..1), for modulation routed from it (engine.rs).
    pub fn lfo_phase(&self) -> f32 {
        self.ctl.lfo_phase
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
