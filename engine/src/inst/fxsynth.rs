//! The fx layer: impacts, sub drops, noise hits, sweeps, a riser and a few one-shots.
//!
//! Eight pads, `FX_NOTE_BASE` upward. Hits last a fixed time scaled by `length`; sweeps and
//! the riser last `length` bars at the tempo. The riser also has a build fader: pushed by
//! hand it opens the filter, lifts the pitch and brings the level up. Playing the riser pad
//! pushes it for you, over the length.
//!
//! The reverb is the layer's own, so a sweep can tail off without the shared return.

use crate::dsp::filter::{OnePoleHp, Svf};
use crate::dsp::osc::{BlepOsc, Sine};
use crate::dsp::oversample::Drive;
use crate::dsp::smooth::Smooth;
use crate::dsp::{soft_clip, Rng, PI};
use crate::fx::Reverb;
use crate::params::*;

const SLOTS: usize = 8;
const RISER: usize = (FX_RISER_NOTE - FX_NOTE_BASE) as usize;

#[derive(Clone, Copy, Default)]
struct Slot {
    on: bool,
    t: u32,
    dur: u32,
    vel: f32,
    osc: Sine,
    filt: Svf,
}

pub struct FxSynth {
    sr: f32,
    bpm: f32,
    slots: [Slot; SLOTS],
    rng: Rng,
    // Controls in real units.
    length: f32,
    noise: f32,
    filter: f32,
    reverb: f32,
    tune: f32,
    manual: f32,
    // The riser.
    auto_on: bool,
    auto_t: u32,
    auto_dur: u32,
    bsm: Smooth,
    r_filt: Svf,
    r_osc: BlepOsc,
    r_sub: Sine,
    // Output.
    rev: Box<Reverb>,
    rev_hp: OnePoleHp,
    tail: u32,
    drive: Drive,
}

impl FxSynth {
    pub fn new(sr: f32) -> Self {
        let mut bsm = Smooth::new(0.0);
        bsm.set_time(12.0, sr);
        let mut f = FxSynth {
            sr,
            bpm: 120.0,
            slots: [Slot::default(); SLOTS],
            rng: Rng::new(0xF8_0001),
            length: 4.0,
            noise: 0.6,
            filter: 8_000.0,
            reverb: 0.3,
            tune: 0.0,
            manual: 0.0,
            auto_on: false,
            auto_t: 0,
            auto_dur: 1,
            bsm,
            r_filt: Svf::default(),
            r_osc: BlepOsc::new(),
            r_sub: Sine::default(),
            rev: Box::new(Reverb::new(sr)),
            rev_hp: OnePoleHp::default(),
            tail: 0,
            drive: Drive::new(),
        };
        f.rev_hp.set(120.0, sr);
        for (i, s) in FX_PARAMS.iter().enumerate() {
            f.set_param(i, s.to_value(s.default));
        }
        f
    }

    pub fn set_tempo(&mut self, bpm: f32) {
        self.bpm = bpm.clamp(20.0, 300.0);
    }

    /// `i` counts from the instrument block, value in real units.
    pub fn set_param(&mut self, i: usize, v: f32) {
        match i {
            F_LENGTH => self.length = v.round().clamp(1.0, 8.0),
            F_NOISE => self.noise = v,
            F_FILTER => self.filter = v,
            F_REVERB => {
                self.reverb = v;
                self.rev.set(1.2 + v * 3.2);
            }
            F_BUILD => self.manual = v,
            F_TUNE => self.tune = v,
            _ => {}
        }
    }

    fn ratio(&self) -> f32 {
        (self.tune / 12.0).exp2()
    }

    fn bar_samples(&self) -> u32 {
        (self.length * 4.0 * 60.0 / self.bpm * self.sr) as u32
    }

    pub fn note_on(&mut self, note: u8, vel: f32) {
        if note < FX_NOTE_BASE || note as usize >= FX_NOTE_BASE as usize + SLOTS {
            return;
        }
        let k = (note - FX_NOTE_BASE) as usize;
        let scale = self.length / 4.0;
        let secs = |s: f32| ((s * scale).max(0.03) * self.sr) as u32;
        let dur = match k {
            0 => secs(1.4),
            1 => secs(1.2),
            2 => secs(0.5),
            3 | 4 => self.bar_samples(),
            RISER => {
                self.auto_on = true;
                self.auto_t = 0;
                self.auto_dur = self.bar_samples().max(1);
                self.r_osc.reset(0.0);
                self.tail = (4.0 * self.sr) as u32;
                return;
            }
            6 => secs(0.18),
            _ => secs(1.0),
        };
        let s = &mut self.slots[k];
        s.on = true;
        s.t = 0;
        s.dur = dur.max(64);
        s.vel = vel.clamp(0.0, 1.0);
        s.osc.phase = 0.0;
        s.filt.reset();
        self.tail = (4.0 * self.sr) as u32;
    }

    /// Hits ring out and sweeps run their length, like a one-shot in a sampler.
    pub fn note_off(&mut self, _note: u8) {}

    pub fn all_off(&mut self) {
        for s in self.slots.iter_mut() {
            s.on = false;
        }
        self.auto_on = false;
    }

    pub fn is_active(&self) -> bool {
        self.tail > 0 || self.auto_on || self.manual > 0.002 || self.slots.iter().any(|s| s.on)
    }

    /// The riser's build, 0..1, as heard now.
    pub fn build(&self) -> f32 {
        self.bsm.value
    }

    #[inline]
    fn slot(&mut self, k: usize) -> f32 {
        let sr = self.sr;
        let r = self.ratio();
        let (filter, noise_amt) = (self.filter, self.noise);
        let n = self.rng.bipolar();
        let s = &mut self.slots[k];
        let t_s = s.t as f32 / sr;
        let p = s.t as f32 / s.dur as f32;
        let fade = ((s.dur - s.t) as f32 / (0.012 * sr)).min(1.0);
        let atk = (s.t as f32 / (0.002 * sr)).min(1.0);
        let y = match k {
            0 => {
                // Impact: a sub thump with a burst of dark noise on top.
                let f = 41.2 * r * (1.0 + 1.8 * (-t_s * 38.0).exp());
                let body = s.osc.next(f / sr) * (-p * 5.0).exp();
                s.filt.set(filter.min(4_000.0), 0.9, sr);
                let burst = s.filt.tick(n).lp * (-p * 14.0).exp() * noise_amt;
                body * 0.9 + burst * 0.8
            }
            1 => {
                // Sub drop: a long sine falling two octaves.
                let f = (28.0 + 64.0 * (-p * 4.5).exp()) * r;
                s.osc.next(f / sr) * (-p * 2.5).exp() * 0.95
            }
            2 => {
                s.filt.set(filter, 0.8, sr);
                s.filt.tick(n).lp * (-p * 7.0).exp() * atk
            }
            3 | 4 => {
                let q = if k == 3 { p } else { 1.0 - p };
                let fc = 200.0 * (filter.max(400.0) / 200.0).powf(q * q.sqrt());
                s.filt.set(fc, 2.2, sr);
                let env = if k == 3 { p.powf(0.7) } else { (1.0 - p).powf(0.7) * atk };
                s.filt.tick(n).bp * env * (0.5 + noise_amt)
            }
            6 => {
                // Zap: a sine bent down fast and pushed into the clipper.
                let f = (60.0 + 2_400.0 * (-p * 6.0).exp()) * r;
                soft_clip(s.osc.next(f / sr) * 3.0) * (1.0 - p) * 0.6
            }
            _ => {
                // Whoosh: noise through a band that rises and falls.
                let bell = (PI * p).sin();
                let fc = 250.0 * (filter.max(500.0) / 250.0).powf(bell);
                s.filt.set(fc, 1.2, sr);
                s.filt.tick(n).bp * bell.powf(1.5) * (0.5 + noise_amt)
            }
        };
        s.t += 1;
        if s.t >= s.dur {
            s.on = false;
        }
        y * fade * (0.35 + 0.65 * s.vel)
    }

    #[inline]
    fn riser(&mut self) -> f32 {
        let mut target = self.manual;
        if self.auto_on {
            let p = self.auto_t as f32 / self.auto_dur as f32;
            target = target.max(p.min(1.0));
            self.auto_t += 1;
            if self.auto_t >= self.auto_dur {
                self.auto_on = false;
            }
        }
        self.bsm.set(target);
        let b = self.bsm.next();
        if b < 0.0005 {
            return 0.0;
        }
        let sr = self.sr;
        let n = self.rng.bipolar();
        let fc = 200.0 * (self.filter.max(600.0) / 200.0).powf(b);
        self.r_filt.set(fc, 2.8, sr);
        let noise = self.r_filt.tick(n).bp * (0.4 + self.noise);
        // Two oscillators an octave apart climbing two octaves as the build rises.
        let pitch = 45.0 + self.tune + b * 24.0;
        let f = 440.0 * ((pitch - 69.0) / 12.0).exp2();
        let saw = self.r_osc.next(f / sr).0;
        let sub = self.r_sub.next(f * 0.5 / sr);
        let tone = (saw * 0.25 + sub * 0.3) * (1.0 - self.noise * 0.6);
        (noise + tone) * b.powf(1.6) * 0.9
    }

    #[inline]
    pub fn tick(&mut self) -> f32 {
        if !self.is_active() {
            return self.drive.process(0.0, 0.0);
        }
        let mut dry = 0.0;
        for k in 0..SLOTS {
            if k != RISER && self.slots[k].on {
                dry += self.slot(k);
            }
        }
        dry += self.riser();
        dry *= 0.55;
        let wet = if self.reverb > 0.001 || self.tail > 0 {
            let (l, r) = self.rev.tick(self.rev_hp.tick(dry));
            (l + r) * 0.5 * self.reverb * 1.4
        } else {
            0.0
        };
        let busy = self.auto_on || self.manual > 0.002 || self.slots.iter().any(|s| s.on);
        if busy {
            self.tail = (4.0 * self.sr) as u32;
        } else if self.tail > 0 {
            self.tail -= 1;
        }
        self.drive.process(soft_clip(dry + wet), 0.0)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn render(f: &mut FxSynth, n: usize) -> Vec<f32> {
        (0..n).map(|_| f.tick()).collect()
    }

    fn peak(y: &[f32]) -> f32 {
        y.iter().fold(0.0, |a, b| a.max(b.abs()))
    }

    #[test]
    fn every_pad_makes_clean_sound() {
        for note in FX_NOTE_BASE..FX_NOTE_BASE + 8 {
            let mut f = FxSynth::new(48_000.0);
            f.set_tempo(140.0);
            f.set_param(F_LENGTH, 1.0);
            f.note_on(note, 0.9);
            let y = render(&mut f, 48_000 * 3);
            assert!(y.iter().all(|v| v.is_finite()), "note {note}");
            let pk = peak(&y);
            assert!(pk > 0.02 && pk < 1.0, "note {note} peak {pk}");
            // No click: the largest step between samples stays small.
            let step = y.windows(2).fold(0.0f32, |a, w| a.max((w[1] - w[0]).abs()));
            assert!(step < 0.5, "note {note} step {step}");
        }
    }

    #[test]
    fn it_goes_quiet_afterwards() {
        let mut f = FxSynth::new(48_000.0);
        f.set_param(F_LENGTH, 1.0);
        f.note_on(FX_IMPACT_NOTE, 1.0);
        render(&mut f, 48_000 * 12);
        assert!(!f.is_active());
        let y = render(&mut f, 4_800);
        assert!(peak(&y) < 1e-4);
    }

    #[test]
    fn riser_builds_over_its_length_and_the_fader_works_by_hand() {
        let mut f = FxSynth::new(48_000.0);
        f.set_tempo(120.0);
        f.set_param(F_LENGTH, 2.0); // 2 bars at 120 = 4 s
        f.set_param(F_REVERB, 0.0);
        f.note_on(FX_RISER_NOTE, 1.0);
        let y = render(&mut f, 48_000 * 4);
        let q = 48_000;
        let early = peak(&y[..q / 2]);
        let late = peak(&y[y.len() - q..]);
        assert!(late > early * 3.0, "early {early} late {late}");
        assert!(f.build() > 0.8);

        let mut g = FxSynth::new(48_000.0);
        g.set_param(F_REVERB, 0.0);
        g.set_param(F_BUILD, 0.9);
        let y = render(&mut g, 24_000);
        assert!(peak(&y[12_000..]) > 0.05);
        g.set_param(F_BUILD, 0.0);
        render(&mut g, 24_000);
        assert!(peak(&render(&mut g, 4_800)) < 1e-3);
    }

    #[test]
    fn sweeps_follow_the_tempo() {
        let mut slow = FxSynth::new(48_000.0);
        slow.set_tempo(60.0);
        slow.set_param(F_LENGTH, 1.0);
        slow.note_on(FX_NOTE_BASE + 3, 1.0);
        let mut fast = FxSynth::new(48_000.0);
        fast.set_tempo(120.0);
        fast.set_param(F_LENGTH, 1.0);
        fast.note_on(FX_NOTE_BASE + 3, 1.0);
        assert_eq!(slow.slots[3].dur, fast.slots[3].dur * 2);
    }
}
