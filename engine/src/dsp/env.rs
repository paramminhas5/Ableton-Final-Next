//! Exponential envelopes, shaped like an analogue RC circuit.
//!
//! Attack charges toward an overshoot target so the curve is convex and arrives on time.
//! Retrigger starts from the current level, never from zero, so there is no click.

use super::tau_coef;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Stage {
    Idle,
    Attack,
    Decay,
    Sustain,
    Release,
}

#[derive(Clone, Copy)]
pub struct Adsr {
    pub stage: Stage,
    pub level: f32,
    sr: f32,
    a_coef: f32,
    d_coef: f32,
    r_coef: f32,
    sustain: f32,
}

const ATTACK_OVERSHOOT: f32 = 1.2;

impl Adsr {
    pub fn new(sr: f32) -> Self {
        let mut e = Adsr { stage: Stage::Idle, level: 0.0, sr, a_coef: 0.0, d_coef: 0.0, r_coef: 0.0, sustain: 1.0 };
        e.set(0.002, 0.2, 1.0, 0.05);
        e
    }

    /// Times are in seconds, to roughly 95% of the way (3 time constants for decay/release).
    pub fn set(&mut self, attack: f32, decay: f32, sustain: f32, release: f32) {
        // Attack: reach 1.0 when charging toward 1.2 takes ln(6) time constants.
        self.a_coef = tau_coef(attack.max(0.0005) / 1.791_759, self.sr);
        self.d_coef = tau_coef(decay.max(0.001) / 3.0, self.sr);
        self.r_coef = tau_coef(release.max(0.001) / 3.0, self.sr);
        self.sustain = sustain.clamp(0.0, 1.0);
    }

    pub fn gate_on(&mut self) {
        self.stage = Stage::Attack;
    }

    pub fn gate_off(&mut self) {
        if self.stage != Stage::Idle {
            self.stage = Stage::Release;
        }
    }

    pub fn is_active(&self) -> bool {
        self.stage != Stage::Idle
    }

    #[inline]
    pub fn next(&mut self) -> f32 {
        match self.stage {
            Stage::Idle => {}
            Stage::Attack => {
                self.level = ATTACK_OVERSHOOT + (self.level - ATTACK_OVERSHOOT) * self.a_coef;
                if self.level >= 1.0 {
                    self.level = 1.0;
                    self.stage = Stage::Decay;
                }
            }
            Stage::Decay => {
                self.level = self.sustain + (self.level - self.sustain) * self.d_coef;
                if (self.level - self.sustain).abs() < 1e-4 {
                    self.level = self.sustain;
                    self.stage = Stage::Sustain;
                }
            }
            Stage::Sustain => {
                self.level = self.sustain;
                if self.sustain <= 0.0 {
                    self.stage = Stage::Idle;
                }
            }
            Stage::Release => {
                self.level *= self.r_coef;
                if self.level < 1e-5 {
                    self.level = 0.0;
                    self.stage = Stage::Idle;
                }
            }
        }
        self.level
    }
}

/// Exponential decay with an instant (but declicked) start. For drums and pitch sweeps.
#[derive(Clone, Copy)]
pub struct Decay {
    pub level: f32,
    coef: f32,
    /// Short linear ramp at the start so a retrigger never clicks.
    ramp: f32,
    ramp_step: f32,
    from: f32,
}

impl Decay {
    pub fn new() -> Self {
        Decay { level: 0.0, coef: 0.0, ramp: 1.0, ramp_step: 0.0, from: 0.0 }
    }

    /// `seconds` is the time to fall by 60 dB.
    pub fn trigger(&mut self, seconds: f32, sr: f32, declick_s: f32) {
        self.coef = (-6.907_755 / (seconds.max(0.001) * sr)).exp();
        self.from = self.level;
        self.ramp = 0.0;
        self.ramp_step = 1.0 / (declick_s * sr).max(1.0);
        self.level = 1.0;
    }

    pub fn set_time(&mut self, seconds: f32, sr: f32) {
        self.coef = (-6.907_755 / (seconds.max(0.001) * sr)).exp();
    }

    #[inline]
    pub fn next(&mut self) -> f32 {
        let out = if self.ramp < 1.0 {
            self.ramp = (self.ramp + self.ramp_step).min(1.0);
            self.from + (self.level - self.from) * self.ramp
        } else {
            self.level
        };
        self.level *= self.coef;
        if self.level < 1e-6 {
            self.level = 0.0;
        }
        out
    }

    pub fn is_active(&self) -> bool {
        self.level > 0.0 || self.ramp < 1.0
    }
}

impl Default for Decay {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn attack_reaches_peak_on_time() {
        let sr = 48_000.0;
        let mut e = Adsr::new(sr);
        e.set(0.010, 0.1, 0.5, 0.1);
        e.gate_on();
        let mut n = 0;
        while e.stage == Stage::Attack {
            e.next();
            n += 1;
        }
        let ms = n as f32 / sr * 1000.0;
        assert!((ms - 10.0).abs() < 0.5, "attack took {ms} ms");
    }

    #[test]
    fn retrigger_does_not_drop_to_zero() {
        let mut e = Adsr::new(48_000.0);
        e.set(0.005, 0.2, 0.6, 0.2);
        e.gate_on();
        for _ in 0..4800 {
            e.next();
        }
        let before = e.level;
        e.gate_on();
        let after = e.next();
        assert!(after >= before - 1e-3);
    }

    #[test]
    fn release_ends_idle() {
        let mut e = Adsr::new(48_000.0);
        e.set(0.001, 0.05, 0.7, 0.05);
        e.gate_on();
        for _ in 0..2000 {
            e.next();
        }
        e.gate_off();
        for _ in 0..48_000 {
            e.next();
        }
        assert_eq!(e.stage, Stage::Idle);
    }
}
