//! Drum rack: 16 pads, each its own synthesised voice with tune, decay, drive and level.
//! Built so a sampled pad (multisampled, velocity layers, round robin) can slot in per
//! pad later without changing the rack. The closed hat chokes the open hat.

use crate::dsp::env::Decay;
use crate::dsp::filter::{OnePoleHp, Svf};
use crate::dsp::osc::{BlepOsc, Sine};
use crate::dsp::oversample::Drive;
use crate::dsp::{note_hz, soft_clip, Rng};
use crate::params::*;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Model {
    Kick,
    Snare,
    Clap,
    Rim,
    ClosedHat,
    OpenHat,
    Shaker,
    Ride,
    Tom(u8),
    Crash,
    Blip,
    Wood,
    Sweep,
    Reverse,
}

pub const MODELS: [Model; DRUM_PADS] = [
    Model::Kick,
    Model::Snare,
    Model::Clap,
    Model::Rim,
    Model::ClosedHat,
    Model::OpenHat,
    Model::Shaker,
    Model::Ride,
    Model::Tom(0),
    Model::Tom(1),
    Model::Tom(2),
    Model::Crash,
    Model::Blip,
    Model::Wood,
    Model::Sweep,
    Model::Reverse,
];

/// TR-808 cymbal oscillator frequencies.
const METAL: [f32; 6] = [205.3, 304.4, 369.6, 522.7, 540.0, 800.0];

pub struct Pad {
    pub model: Model,
    sr: f32,
    amp: Decay,
    pitch_env: Decay,
    noise_env: Decay,
    osc: Sine,
    osc2: Sine,
    metal: [BlepOsc; 6],
    rng: Rng,
    bp: Svf,
    bp2: Svf,
    hp: OnePoleHp,
    drive: Drive,
    vel: f32,
    t: u32,
    len: u32,
    // per pad controls (real units)
    pub tune: f32,
    pub decay: f32,
    pub drive_amt: f32,
    pub level: f32,
}

impl Pad {
    pub fn new(model: Model, sr: f32, seed: u32) -> Self {
        let mut p = Pad {
            model,
            sr,
            amp: Decay::new(),
            pitch_env: Decay::new(),
            noise_env: Decay::new(),
            osc: Sine::default(),
            osc2: Sine::default(),
            metal: [BlepOsc::new(); 6],
            rng: Rng::new(seed),
            bp: Svf::default(),
            bp2: Svf::default(),
            hp: OnePoleHp::default(),
            drive: Drive::new(),
            vel: 0.0,
            t: 0,
            len: 0,
            tune: 0.0,
            decay: 0.5,
            drive_amt: 0.15,
            level: 1.0,
        };
        p.setup_filters();
        p
    }

    fn ratio(&self) -> f32 {
        (self.tune / 12.0).exp2()
    }

    fn setup_filters(&mut self) {
        let r = self.ratio();
        let sr = self.sr;
        match self.model {
            Model::Snare => {
                self.bp.set(3_200.0 * r, 0.8, sr);
                self.hp.set(900.0, sr);
            }
            Model::Clap => {
                self.bp.set(1_150.0 * r, 2.2, sr);
                self.hp.set(500.0, sr);
            }
            Model::Rim => {
                self.bp.set(2_800.0 * r, 4.0, sr);
                self.hp.set(400.0, sr);
            }
            Model::ClosedHat | Model::OpenHat => {
                self.bp.set(10_000.0 * r.sqrt(), 1.2, sr);
                self.hp.set(7_000.0, sr);
            }
            Model::Shaker => {
                self.bp.set(9_000.0 * r, 0.9, sr);
                self.hp.set(5_500.0, sr);
            }
            Model::Ride => {
                self.bp.set(4_800.0 * r, 1.4, sr);
                self.hp.set(3_000.0, sr);
            }
            Model::Crash => {
                self.bp.set(6_500.0 * r, 0.7, sr);
                self.hp.set(3_500.0, sr);
            }
            Model::Wood => {
                self.bp.set(1_800.0 * r, 6.0, sr);
                self.hp.set(300.0, sr);
            }
            Model::Sweep | Model::Reverse => {
                self.bp.set(2_000.0, 2.0, sr);
                self.hp.set(150.0, sr);
            }
            Model::Kick => {
                self.hp.set(3_000.0, sr);
            }
            _ => self.hp.set(30.0, sr),
        }
        self.bp2.set(7_500.0, 0.7, sr);
    }

    /// Base length in seconds for decay = 0.5; the knob scales it 0.25x..4x.
    fn base_len(&self) -> f32 {
        match self.model {
            Model::Kick => 0.45,
            Model::Snare => 0.22,
            Model::Clap => 0.3,
            Model::Rim => 0.05,
            Model::ClosedHat => 0.07,
            Model::OpenHat => 0.6,
            Model::Shaker => 0.09,
            Model::Ride => 2.0,
            Model::Tom(_) => 0.5,
            Model::Crash => 2.6,
            Model::Blip => 0.12,
            Model::Wood => 0.07,
            Model::Sweep => 0.9,
            Model::Reverse => 0.6,
        }
    }

    fn length(&self) -> f32 {
        self.base_len() * (4.0f32).powf((self.decay - 0.5) * 2.0)
    }

    pub fn trigger(&mut self, vel: f32) {
        self.setup_filters();
        self.vel = vel.clamp(0.0, 1.0);
        self.t = 0;
        let len = self.length();
        self.len = (len * self.sr) as u32;
        let sr = self.sr;
        match self.model {
            Model::Reverse => {
                // Rising swell, handled by t/len below; amp stays full.
                self.amp.trigger(len * 30.0, sr, 0.002);
            }
            _ => self.amp.trigger(len, sr, 0.0015),
        }
        match self.model {
            Model::Kick => {
                self.pitch_env.trigger(0.11, sr, 0.0002);
                self.noise_env.trigger(0.012, sr, 0.0002);
                self.osc.phase = 0.0;
            }
            Model::Tom(_) => {
                self.pitch_env.trigger(0.18, sr, 0.0002);
                self.noise_env.trigger(0.02, sr, 0.0002);
                self.osc.phase = 0.0;
            }
            Model::Snare => {
                self.pitch_env.trigger(0.05, sr, 0.0002);
                self.noise_env.trigger(len * 1.1, sr, 0.0005);
            }
            Model::Rim | Model::Blip | Model::Wood => {
                self.pitch_env.trigger(0.02, sr, 0.0002);
                self.noise_env.trigger(0.008, sr, 0.0002);
            }
            Model::Sweep => self.pitch_env.trigger(len, sr, 0.0002),
            _ => {}
        }
    }

    /// Stop fast (choke). 4 ms so it does not click.
    pub fn choke(&mut self) {
        self.amp.set_time(0.004, self.sr);
    }

    pub fn is_active(&self) -> bool {
        self.amp.is_active()
    }

    #[inline]
    pub fn tick(&mut self) -> f32 {
        if !self.amp.is_active() {
            return 0.0;
        }
        let sr = self.sr;
        let r = self.ratio();
        let a = self.amp.next();
        let v = self.vel;
        let tsec = self.t as f32 / sr;
        self.t = self.t.saturating_add(1);
        let y = match self.model {
            Model::Kick => {
                let pe = self.pitch_env.next();
                let f = 48.0 * r * (1.0 + 4.5 * pe * pe + 1.2 * pe);
                let body = self.osc.next(f / sr);
                let click = self.hp.tick(self.rng.bipolar()) * self.noise_env.next() * (0.25 + 0.35 * v);
                (body * 1.05 + click) * a
            }
            Model::Tom(i) => {
                let pe = self.pitch_env.next();
                let base = [92.0, 132.0, 184.0][i as usize] * r;
                let f = base * (1.0 + 0.55 * pe);
                let body = self.osc.next(f / sr) + 0.25 * self.osc2.next(f * 1.5 / sr);
                let n = self.rng.bipolar() * self.noise_env.next() * 0.2;
                (body * 0.8 + n) * a
            }
            Model::Snare => {
                let pe = self.pitch_env.next();
                let body = 0.6 * self.osc.next(185.0 * r * (1.0 + 0.3 * pe) / sr) + 0.35 * self.osc2.next(330.0 * r / sr);
                let tone = body * (a * a);
                let n = self.rng.bipolar();
                let n = self.hp.tick(self.bp.tick(n).bp * 1.3 + n * 0.4);
                tone + n * self.noise_env.next() * (0.6 + 0.4 * v)
            }
            Model::Clap => {
                // Three quick bursts, then the room.
                let burst = if tsec < 0.03 {
                    let ph = (tsec / 0.01).fract();
                    (-ph * 9.0).exp()
                } else {
                    1.0
                };
                let n = self.bp.tick(self.rng.bipolar()).bp;
                self.hp.tick(n) * 2.2 * burst * a
            }
            Model::Rim => {
                let n = self.bp.tick(self.rng.bipolar()).bp * self.noise_env.next();
                let body = self.osc.next(1_700.0 * r / sr) * 0.5;
                self.hp.tick(body + n * 2.0) * a
            }
            Model::ClosedHat | Model::OpenHat | Model::Ride | Model::Crash => {
                let mut m = 0.0;
                for (o, f) in self.metal.iter_mut().zip(METAL) {
                    m += o.next(f * r * 1.65 / sr).1;
                }
                m *= 1.0 / 6.0;
                let noise = self.rng.bipolar();
                let mix = match self.model {
                    Model::Crash => m * 0.6 + noise * 0.5,
                    Model::Ride => m * 0.85 + noise * 0.12,
                    _ => m * 0.8 + noise * 0.25,
                };
                let b = self.bp.tick(mix).bp;
                self.hp.tick(b) * 2.0 * a * (0.55 + 0.45 * v)
            }
            Model::Shaker => {
                let rise = (tsec / 0.008).min(1.0);
                let n = self.bp.tick(self.rng.bipolar()).bp;
                self.hp.tick(n) * 1.6 * a * rise
            }
            Model::Blip => {
                // Two-operator FM blip.
                let pe = self.pitch_env.next();
                let f = 760.0 * r;
                let m = self.osc2.next(f * 1.41 / sr) * (2.5 * pe + 0.3);
                self.osc.phase = (self.osc.phase + m * 0.02).rem_euclid(1.0);
                self.osc.next(f / sr) * a * 0.8
            }
            Model::Wood => {
                let n = self.bp.tick(self.rng.bipolar()).bp * self.noise_env.next();
                let body = self.osc.next(1_150.0 * r / sr) * 0.6;
                (body + n) * a
            }
            Model::Sweep => {
                let pe = self.pitch_env.next();
                let fc = 300.0 + 7_000.0 * pe * r;
                self.bp.set(fc, 3.0, sr);
                let n = self.bp.tick(self.rng.bipolar()).bp;
                n * 1.4 * a
            }
            Model::Reverse => {
                let x = (tsec / (self.len as f32 / sr).max(0.01)).min(1.0);
                if x >= 1.0 {
                    self.amp.set_time(0.003, sr);
                }
                let swell = x * x * x;
                let n = self.bp2.tick(self.rng.bipolar()).lp;
                let tone = self.osc.next(220.0 * r / sr) * 0.4;
                (n * 0.8 + tone) * swell * a
            }
        };
        let y = self.drive.process(y, self.drive_amt);
        soft_clip(y * 0.9) * self.level
    }
}

pub struct DrumRack {
    pub pads: [Pad; DRUM_PADS],
}

impl DrumRack {
    pub fn new(sr: f32) -> Self {
        let pads = core::array::from_fn(|i| {
            let mut p = Pad::new(MODELS[i], sr, 0x1234 + i as u32 * 7919);
            for (k, spec) in DRUM_PAD_PARAMS.iter().enumerate() {
                set_pad(&mut p, k, spec.to_value(spec.default));
            }
            p
        });
        DrumRack { pads }
    }

    pub fn pad_for_note(note: u8) -> Option<usize> {
        DRUM_PAD_NOTES.iter().position(|&n| n == note)
    }

    pub fn note_on(&mut self, note: u8, vel: f32) {
        if let Some(i) = Self::pad_for_note(note) {
            if MODELS[i] == Model::ClosedHat {
                self.pads[5].choke();
            }
            self.pads[i].trigger(vel);
        }
    }

    /// `i` counts from the instrument block: pad * 4 + knob.
    pub fn set_param(&mut self, i: usize, v: f32) {
        let pad = i / DRUM_PAD_PARAMS.len();
        let k = i % DRUM_PAD_PARAMS.len();
        if let Some(p) = self.pads.get_mut(pad) {
            set_pad(p, k, v);
        }
    }

    pub fn is_active(&self) -> bool {
        self.pads.iter().any(|p| p.is_active())
    }

    #[inline]
    pub fn tick(&mut self) -> f32 {
        let mut s = 0.0;
        for p in self.pads.iter_mut() {
            s += p.tick();
        }
        s * 0.7
    }
}

fn set_pad(p: &mut Pad, k: usize, v: f32) {
    match k {
        0 => p.tune = v,
        1 => p.decay = v,
        2 => p.drive_amt = v,
        3 => p.level = fader_gain(DRUM_PAD_PARAMS[3].from_value(v)),
        _ => {}
    }
}

/// Hz of a note, for tests and tools.
pub fn hz(n: f32) -> f32 {
    note_hz(n)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn every_pad_sounds_and_stops() {
        let sr = 48_000.0;
        let mut rack = DrumRack::new(sr);
        for (i, &note) in DRUM_PAD_NOTES.iter().enumerate() {
            rack.note_on(note, 1.0);
            let mut peak = 0.0f32;
            for _ in 0..(sr * 1.0) as usize {
                let y = rack.tick();
                assert!(y.is_finite());
                peak = peak.max(y.abs());
            }
            assert!(peak > 0.01, "pad {i} ({}) silent", DRUM_PAD_NAMES[i]);
            for _ in 0..(sr * 14.0) as usize {
                rack.tick();
            }
            assert!(!rack.pads[i].is_active(), "pad {i} still ringing");
        }
    }

    #[test]
    fn closed_hat_chokes_open_hat() {
        let sr = 48_000.0;
        let mut rack = DrumRack::new(sr);
        rack.note_on(46, 1.0);
        for _ in 0..2400 {
            rack.tick();
        }
        rack.note_on(42, 1.0);
        for _ in 0..(sr * 0.05) as usize {
            rack.tick();
        }
        assert!(!rack.pads[5].is_active(), "open hat should be choked");
    }
}
