//! Mono bass synth. Two band-limited oscillators (saw and pulse, blended by `wave`),
//! a sine sub an octave down, a zero-delay-feedback ladder filter with its own
//! envelope, and glide on legato notes the way a 303 or a Minimoog slides.
//! The voice runs at 2x and is decimated, so the filter and oscillators stay clean
//! all the way up.

use crate::dsp::env::Adsr;
use crate::dsp::filter::{CharFilter, FilterDrive, OnePoleHp};
use crate::dsp::osc::{MinBlepOsc as BlepOsc, Sine};
use crate::dsp::oversample::{BassDecimator, BASS_DECIM_DELAY, DRIVE_DELAY};
use crate::dsp::smooth::Smooth;
use crate::dsp::{note_hz, tau_coef, Rng};
use crate::params::*;

const STACK: usize = 16;

pub struct Bass {
    sr: f32,
    os: f32,
    stack: [u8; STACK],
    held: usize,
    pitch: f32,
    target: f32,
    glide_coef: f32,
    vel: f32,
    amp: Adsr,
    fenv: Adsr,
    osc: BlepOsc,
    sub: Sine,
    filt: CharFilter,
    fdrive: FilterDrive,
    fdrive_amt: Smooth,
    dc: OnePoleHp,
    dec: BassDecimator,
    rng: Rng,
    drift: f32,
    drift_target: f32,
    drift_count: u32,
    // smoothed controls
    cutoff: Smooth,
    res: Smooth,
    env_amt: Smooth,
    wave: Smooth,
    sub_lvl: Smooth,
    glide_ms: f32,
    decay_ms: f32,
    drift_amt: f32,
    /// Lines the bass up with the drum rack, which runs through one more 2x stage.
    pdc: [f32; 32],
    pdc_pos: usize,
}

impl Bass {
    pub fn new(sr: f32) -> Self {
        let os = sr * 2.0;
        let mut b = Bass {
            sr,
            os,
            stack: [0; STACK],
            held: 0,
            pitch: 33.0,
            target: 33.0,
            glide_coef: 0.0,
            vel: 0.0,
            amp: Adsr::new(os),
            fenv: Adsr::new(os),
            osc: BlepOsc::new(),
            sub: Sine::default(),
            filt: CharFilter::default(),
            fdrive: FilterDrive::default(),
            fdrive_amt: Smooth::new(0.0),
            dc: OnePoleHp::default(),
            dec: BassDecimator::new(),
            rng: Rng::new(0xBA55),
            drift: 0.0,
            drift_target: 0.0,
            drift_count: 0,
            cutoff: Smooth::new(800.0),
            res: Smooth::new(0.3),
            env_amt: Smooth::new(0.45),
            wave: Smooth::new(0.0),
            sub_lvl: Smooth::new(0.35),
            glide_ms: 60.0,
            decay_ms: 300.0,
            drift_amt: 0.2,
            pdc: [0.0; 32],
            pdc_pos: 0,
        };
        b.dc.set(18.0, sr);
        for s in [&mut b.cutoff, &mut b.res, &mut b.env_amt, &mut b.wave, &mut b.sub_lvl, &mut b.fdrive_amt] {
            s.set_time(8.0, os);
        }
        for (i, spec) in BASS_PARAMS.iter().enumerate() {
            b.set_param(i, spec.to_value(spec.default));
        }
        b.cutoff.reset(b.cutoff.target);
        b.res.reset(b.res.target);
        b.env_amt.reset(b.env_amt.target);
        b.wave.reset(b.wave.target);
        b.sub_lvl.reset(b.sub_lvl.target);
        b.fdrive_amt.reset(b.fdrive_amt.target);
        b.update_envs();
        b
    }

    /// `i` counts from the instrument block, value in real units.
    pub fn set_param(&mut self, i: usize, v: f32) {
        match i {
            B_CUTOFF => self.cutoff.set(v),
            B_RES => self.res.set(v),
            B_ENV => self.env_amt.set(v),
            B_GLIDE => self.glide_ms = v,
            B_DECAY => {
                self.decay_ms = v;
                self.update_envs();
            }
            B_WAVE => self.wave.set(v),
            B_SUB => self.sub_lvl.set(v),
            B_DRIFT => self.drift_amt = v,
            B_CHAR => self.filt.set_mode(step3(v)),
            B_FDRIVE => self.fdrive_amt.set(v),
            _ => {}
        }
    }

    fn update_envs(&mut self) {
        let d = self.decay_ms * 0.001;
        self.amp.set(0.0015, d * 1.6, 0.55, 0.045);
        self.fenv.set(0.001, d, 0.0, d * 0.6);
    }

    pub fn note_on(&mut self, note: u8, vel: f32) {
        let legato = self.held > 0;
        // Move the note to the top of the stack.
        self.remove(note);
        if self.held < STACK {
            self.stack[self.held] = note;
            self.held += 1;
        }
        self.target = note as f32;
        if legato && self.glide_ms > 0.5 {
            // Constant-time glide: same time for any interval.
            self.glide_coef = tau_coef(self.glide_ms * 0.001 / 3.0, self.os);
        } else {
            self.glide_coef = 0.0;
            self.pitch = self.target;
        }
        if !legato || !self.amp.is_active() {
            self.vel = vel;
            self.amp.gate_on();
            self.fenv.gate_on();
        }
    }

    pub fn note_off(&mut self, note: u8) {
        self.remove(note);
        if self.held > 0 {
            // Fall back to the note still held, gliding if glide is on.
            self.target = self.stack[self.held - 1] as f32;
            if self.glide_ms > 0.5 {
                self.glide_coef = tau_coef(self.glide_ms * 0.001 / 3.0, self.os);
            } else {
                self.pitch = self.target;
            }
        } else {
            self.amp.gate_off();
            self.fenv.gate_off();
        }
    }

    pub fn all_off(&mut self) {
        self.held = 0;
        self.amp.gate_off();
        self.fenv.gate_off();
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

    pub fn is_active(&self) -> bool {
        self.amp.is_active()
    }

    /// One oversampled sample.
    #[inline]
    fn tick_os(&mut self) -> f32 {
        self.pitch = self.target + (self.pitch - self.target) * self.glide_coef;
        let p = self.pitch + self.drift;
        let f = note_hz(p);
        let dt = f / self.os;
        let w = self.wave.next();
        let wave = self.osc.next_mix(dt, w);
        let sub = self.sub.next(dt * 0.5);
        let osc = wave + sub * self.sub_lvl.next() * 0.9;

        let fe = self.fenv.next();
        let amp = self.amp.next();
        let env_oct = self.env_amt.next() * 6.0 * fe * (0.45 + 0.55 * self.vel);
        let key_oct = (p - 45.0) / 12.0 * 0.5;
        let fc = (self.cutoff.next() * (env_oct + key_oct).exp2()).clamp(20.0, self.os * 0.45);
        self.filt.set(fc, self.res.next(), self.os);
        let d = self.fdrive_amt.next();
        let x = self.fdrive.pre(osc * 0.55, d);
        let y = self.fdrive.post(self.filt.tick(x), d);
        y * amp * (0.35 + 0.65 * self.vel)
    }

    /// One sample at the engine rate.
    #[inline]
    pub fn tick(&mut self) -> f32 {
        let y = if self.amp.is_active() { self.voice() } else { 0.0 };
        // Pad the voice so bass and drums reach the strip with the same delay: the drum
        // pads' drive is two 2x stages, the bass decimator one longer stage.
        let n = (crate::engine::VOICE_LATENCY as f64 - DRIVE_DELAY - BASS_DECIM_DELAY) as usize;
        let out = self.pdc[(self.pdc_pos + 32 - n) % 32];
        self.pdc[self.pdc_pos] = y;
        self.pdc_pos = (self.pdc_pos + 1) % 32;
        out
    }

    #[inline]
    fn voice(&mut self) -> f32 {
        // Drift: a slow random walk, a few cents, like an analogue oscillator warming up.
        if self.drift_count == 0 {
            self.drift_count = (self.sr * 0.05) as u32;
            self.drift_target = self.rng.bipolar() * self.drift_amt * 0.08;
        }
        self.drift_count -= 1;
        self.drift += (self.drift_target - self.drift) * 0.0005;

        let a = self.tick_os();
        let b = self.tick_os();
        self.dc.tick(self.dec.process(a, b))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn pitch_after(b: &mut Bass, ms: f32) -> f32 {
        let n = (b.sr * ms / 1000.0) as usize;
        for _ in 0..n {
            b.tick();
        }
        b.pitch
    }

    #[test]
    fn legato_glides_and_staccato_jumps() {
        let mut b = Bass::new(48_000.0);
        b.set_param(B_GLIDE, 100.0);
        b.note_on(33, 1.0);
        pitch_after(&mut b, 20.0);
        b.note_on(45, 1.0); // legato: still holding 33
        let mid = pitch_after(&mut b, 15.0);
        assert!(mid > 34.0 && mid < 44.0, "mid-glide {mid}");
        let end = pitch_after(&mut b, 200.0);
        assert!((end - 45.0).abs() < 0.1);

        b.note_off(45);
        b.note_off(33);
        pitch_after(&mut b, 300.0);
        b.note_on(40, 1.0); // nothing held: jump, no glide
        assert_eq!(b.pitch, 40.0);
    }

    #[test]
    fn releasing_top_note_returns_to_held_note() {
        let mut b = Bass::new(48_000.0);
        b.set_param(B_GLIDE, 0.0);
        b.note_on(33, 1.0);
        b.note_on(36, 1.0);
        b.note_off(36);
        assert_eq!(b.target, 33.0);
        assert!(b.amp.is_active());
    }

    #[test]
    fn output_is_finite_and_audible() {
        let mut b = Bass::new(48_000.0);
        b.note_on(33, 0.9);
        let mut peak = 0.0f32;
        for _ in 0..24_000 {
            let y = b.tick();
            assert!(y.is_finite());
            peak = peak.max(y.abs());
        }
        assert!(peak > 0.05 && peak < 1.5, "peak {peak}");
    }
}
