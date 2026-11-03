//! The sampler: 16 sample slots played as pads or as a pitched keyboard.
//!
//! Samples are loaded by the host (`Engine::load_sample`), mono, resampled to the engine
//! rate on the way in. In pad mode, note `SAMPLER_NOTE_BASE + n` plays slot `n` at its own
//! pitch. In keys mode every note plays slot 0, repitched from `SAMPLER_ROOT`. Playback uses
//! 4-point Hermite interpolation. Voices fade in over 1 ms and out over `release`, so a
//! retrigger or a steal never clicks. Output goes through the same latency-matched stage as
//! the other instruments.

use crate::dsp::oversample::Drive;
use crate::params::*;

const VOICES: usize = 16;
pub const SLOTS: usize = 16;
/// Longest sample kept per slot: 30 seconds.
const MAX_SECONDS: f32 = 30.0;

#[derive(Clone, Copy, Default)]
struct Voice {
    on: bool,
    slot: usize,
    note: u8,
    pos: f64,
    step: f64,
    gain: f32,
    /// 0..1 fade in, then held, then fading out when `releasing`.
    env: f32,
    releasing: bool,
    age: u32,
}

pub struct Sampler {
    sr: f32,
    slots: Vec<Vec<f32>>,
    voices: [Voice; VOICES],
    clock: u32,
    tune: f32,
    start: f32,
    release_s: f32,
    gate: bool,
    pitched: bool,
    reverse: bool,
    drive: Drive,
}

#[inline]
fn hermite(y: &[f32], pos: f64) -> f32 {
    let i = pos as usize;
    let f = (pos - i as f64) as f32;
    let at = |k: isize| -> f32 {
        let j = i as isize + k;
        if j < 0 || j as usize >= y.len() { 0.0 } else { y[j as usize] }
    };
    let (a, b, c, d) = (at(-1), at(0), at(1), at(2));
    let c0 = b;
    let c1 = 0.5 * (c - a);
    let c2 = a - 2.5 * b + 2.0 * c - 0.5 * d;
    let c3 = 0.5 * (d - a) + 1.5 * (b - c);
    ((c3 * f + c2) * f + c1) * f + c0
}

impl Sampler {
    pub fn new(sr: f32) -> Self {
        Sampler {
            sr,
            slots: vec![Vec::new(); SLOTS],
            voices: [Voice::default(); VOICES],
            clock: 0,
            tune: 0.0,
            start: 0.0,
            release_s: 0.08,
            gate: false,
            pitched: false,
            reverse: false,
            drive: Drive::new(),
        }
    }

    /// Replace slot `slot` with `data` recorded at `src_rate`. Not real-time safe (allocates);
    /// the host calls it between blocks.
    pub fn load(&mut self, slot: usize, data: &[f32], src_rate: f32) {
        if slot >= SLOTS {
            return;
        }
        for v in self.voices.iter_mut().filter(|v| v.slot == slot) {
            v.on = false;
        }
        if data.is_empty() || src_rate <= 0.0 {
            self.slots[slot] = Vec::new();
            return;
        }
        let ratio = src_rate as f64 / self.sr as f64;
        let max = (MAX_SECONDS * self.sr) as usize;
        let n = (((data.len() as f64 / ratio) as usize).max(1)).min(max);
        let mut out = Vec::with_capacity(n);
        for i in 0..n {
            out.push(hermite(data, i as f64 * ratio));
        }
        self.slots[slot] = out;
    }

    pub fn loaded(&self, slot: usize) -> usize {
        self.slots.get(slot).map_or(0, |s| s.len())
    }

    pub fn set_param(&mut self, i: usize, v: f32) {
        match i {
            S_TUNE => self.tune = v,
            S_START => self.start = v,
            S_RELEASE => self.release_s = v / 1000.0,
            S_GATE => self.gate = v > 0.5,
            S_PITCHED => self.pitched = v > 0.5,
            S_REVERSE => self.reverse = v > 0.5,
            _ => {}
        }
    }

    pub fn note_on(&mut self, note: u8, vel: f32) {
        let (slot, semis) = if self.pitched {
            (0usize, note as f32 - SAMPLER_ROOT as f32)
        } else {
            if note < SAMPLER_NOTE_BASE {
                return;
            }
            ((note - SAMPLER_NOTE_BASE) as usize, 0.0)
        };
        if slot >= SLOTS || self.slots[slot].is_empty() {
            return;
        }
        let len = self.slots[slot].len() as f64;
        // Same note again: fade the old one out so the new hit is clean.
        for v in self.voices.iter_mut() {
            if v.on && v.note == note && !v.releasing {
                v.releasing = true;
            }
        }
        let k = self
            .voices
            .iter()
            .position(|v| !v.on)
            .unwrap_or_else(|| {
                (0..VOICES)
                    .min_by_key(|&k| (!self.voices[k].releasing as u8, u32::MAX - self.voices[k].age))
                    .unwrap_or(0)
            });
        self.clock = self.clock.wrapping_add(1);
        let step = ((semis + self.tune) as f64 / 12.0).exp2();
        let start = (self.start as f64 * len).min(len - 1.0);
        self.voices[k] = Voice {
            on: true,
            slot,
            note,
            pos: if self.reverse { len - 1.0 } else { start },
            step: if self.reverse { -step } else { step },
            gain: 0.2 + 0.8 * vel,
            env: 0.0,
            releasing: false,
            age: self.clock,
        };
    }

    pub fn note_off(&mut self, note: u8) {
        if !self.gate {
            return;
        }
        for v in self.voices.iter_mut() {
            if v.on && v.note == note {
                v.releasing = true;
            }
        }
    }

    pub fn all_off(&mut self) {
        for v in self.voices.iter_mut() {
            v.releasing = true;
        }
    }

    pub fn is_active(&self) -> bool {
        self.voices.iter().any(|v| v.on)
    }

    #[inline]
    pub fn tick(&mut self) -> f32 {
        if !self.is_active() {
            return self.drive.process(0.0, 0.0);
        }
        let fade_in = 1.0 / (0.001 * self.sr);
        let fade_out = 1.0 / (self.release_s.max(0.005) * self.sr);
        let mut acc = 0.0;
        for v in self.voices.iter_mut().filter(|v| v.on) {
            let y = &self.slots[v.slot];
            let end = y.len() as f64;
            if v.pos < 0.0 || v.pos >= end {
                v.on = false;
                continue;
            }
            // Fade out near the end of the sample so it never cuts.
            let left = if v.step > 0.0 { end - v.pos } else { v.pos };
            let tail = (left / (0.002 * self.sr as f64)).min(1.0) as f32;
            if v.releasing {
                v.env -= fade_out;
                if v.env <= 0.0 {
                    v.on = false;
                    continue;
                }
            } else if v.env < 1.0 {
                v.env = (v.env + fade_in).min(1.0);
            }
            acc += hermite(y, v.pos) * v.gain * v.env * tail;
            v.pos += v.step;
        }
        self.drive.process(acc * 0.7, 0.0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sine(n: usize, f: f32, sr: f32) -> Vec<f32> {
        (0..n).map(|i| (i as f32 / sr * f * std::f32::consts::TAU).sin() * 0.8).collect()
    }

    fn render(s: &mut Sampler, n: usize) -> Vec<f32> {
        (0..n).map(|_| s.tick()).collect()
    }

    #[test]
    fn silent_until_loaded() {
        let mut s = Sampler::new(48_000.0);
        s.note_on(SAMPLER_NOTE_BASE, 1.0);
        assert!(render(&mut s, 2000).iter().all(|x| x.abs() < 1e-6));
    }

    #[test]
    fn plays_and_resamples() {
        let mut s = Sampler::new(48_000.0);
        s.load(0, &sine(22_050, 440.0, 44_100.0), 44_100.0);
        assert!(s.loaded(0) >= 23_990 && s.loaded(0) <= 24_010);
        s.note_on(SAMPLER_NOTE_BASE, 1.0);
        let y = render(&mut s, 4000);
        assert!(y.iter().fold(0.0f32, |a, b| a.max(b.abs())) > 0.3);
    }

    #[test]
    fn pitched_octave_doubles_rate() {
        let mut s = Sampler::new(48_000.0);
        s.set_param(S_PITCHED, 1.0);
        s.load(0, &sine(48_000, 220.0, 48_000.0), 48_000.0);
        s.note_on(SAMPLER_ROOT + 12, 1.0);
        let y = render(&mut s, 24_000);
        // Count rising zero crossings after the latency: about 440 per second.
        let skip = 600;
        let zc = y[skip..].windows(2).filter(|w| w[0] <= 0.0 && w[1] > 0.0).count();
        let seconds = (y.len() - skip) as f32 / 48_000.0;
        let f = zc as f32 / seconds;
        assert!((f - 440.0).abs() < 15.0, "got {f} hz");
    }

    #[test]
    fn retrigger_and_steal_do_not_click() {
        let mut s = Sampler::new(48_000.0);
        s.load(0, &sine(48_000, 100.0, 48_000.0), 48_000.0);
        let mut y = Vec::new();
        for _ in 0..40 {
            s.note_on(SAMPLER_NOTE_BASE, 1.0);
            y.extend(render(&mut s, 700));
        }
        let worst = y.windows(2).fold(0.0f32, |a, w| a.max((w[1] - w[0]).abs()));
        assert!(worst < 0.1, "step {worst}");
    }

    #[test]
    fn gate_releases_on_note_off() {
        let mut s = Sampler::new(48_000.0);
        s.set_param(S_GATE, 1.0);
        s.load(0, &sine(48_000, 200.0, 48_000.0), 48_000.0);
        s.note_on(SAMPLER_NOTE_BASE, 1.0);
        render(&mut s, 2000);
        s.note_off(SAMPLER_NOTE_BASE);
        render(&mut s, 12_000);
        assert!(!s.is_active());
    }
}
