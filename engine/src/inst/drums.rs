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
/// The TR-808's six square-wave oscillators for hats and cymbals, at their measured nominal
/// frequencies (Werner, Abel and Smith, ICMC/SMC 2014). Tightly packed and inharmonic: that cluster,
/// filtered, is the metal. The 808 has no noise generator in its hats.
const METAL: [f32; 6] = [205.3, 304.4, 369.6, 522.7, 540.0, 800.0];
/// The two band-passes the 808 puts the cluster through: the high one for hats, both for cymbals.
const METAL_BP_HI: f32 = 7_100.0;
const METAL_BP_LO: f32 = 3_440.0;

pub struct Pad {
    pub model: Model,
    sr: f32,
    amp: Decay,
    pitch_env: Decay,
    noise_env: Decay,
    /// Kick: the 808's 6 ms attack bump, a fast extra rise in pitch on top of the main sweep.
    bump_env: Decay,
    /// Kick: the slow pitch "sigh" over the tail as the bridged-T circuit rings down.
    sigh_env: Decay,
    /// Kick: the body's second, slower decay, so the tail rings out at a low level after the punch.
    ring_env: Decay,
    /// Kick: samples the body holds at full level before it starts to decay.
    hold: u32,
    osc: Sine,
    osc2: Sine,
    metal: [BlepOsc; 6],
    rng: Rng,
    bp: Svf,
    bp2: Svf,
    /// Resonant high-pass after the 808's "swing" stage (peak near 10 kHz on the hats).
    hpr: Svf,
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
    /// Stretches the length, so the closed hat can be opened with the rack's open knob.
    pub len_mul: f32,
    /// Kick body: 0 round, 1 tight, 2 hard. Perc pads: their own sound, a bell, metal (`DRUM_PAD2_PARAMS`).
    pub shape: u8,
    /// Anti-aliased saturator that rounds or clips the kick's body.
    body_sat: crate::dsp::Adaa,
    /// The tone and noise layers (item 8), knob values: noise 0..1 (0.5 is the pad as designed),
    /// snap 0..1, color -1..1, sweep 0..1, wobble 0..1, random 0..1.
    pub noise: f32,
    pub snap: f32,
    pub color: f32,
    pub sweep: f32,
    pub wobble: f32,
    pub random: f32,
    /// This hit's own differences when random is up: pitch ratio, gain, length and color factors.
    hit: [f32; 4],
    wob_phase: f32,
    /// A third sine and a fast envelope for the bell and metal percussion.
    osc3: Sine,
    fast_env: Decay,
    /// The noise layer's own filter where the sound had none (toms, cymbal wash).
    nf: Svf,
    /// The tone layer's own filter (a gentle low-pass on the snare's body).
    tf: crate::dsp::filter::OnePoleLp,
}

/// The tone/noise balance as two gains: at 0.5 both layers play as designed.
#[inline]
fn layer_gains(noise: f32) -> (f32, f32) {
    ((2.0 * (1.0 - noise)).min(1.0), (2.0 * noise).min(1.0))
}

/// Kick body shapes: drive into the saturator, the make-up that keeps the body's level (RMS) where
/// the round one is, and the pitch sweep's time to fall. Round is the 808's bridged-T sine; tight is
/// rounded off towards a square and sweeps faster, the way a 909's body sounds; hard is clipped almost
/// square, for harder styles.
const BODY: [(f32, f32, f32); 3] = [(0.0, 1.0, 0.11), (1.5, 1.060, 0.07), (9.0, 0.750, 0.09)];

impl Pad {
    pub fn new(model: Model, sr: f32, seed: u32) -> Self {
        let mut p = Pad {
            model,
            sr,
            amp: Decay::new(),
            pitch_env: Decay::new(),
            noise_env: Decay::new(),
            bump_env: Decay::new(),
            sigh_env: Decay::new(),
            ring_env: Decay::new(),
            hold: 0,
            osc: Sine::default(),
            osc2: Sine::default(),
            metal: [BlepOsc::new(); 6],
            rng: Rng::new(seed),
            bp: Svf::default(),
            bp2: Svf::default(),
            hpr: Svf::default(),
            hp: OnePoleHp::default(),
            drive: Drive::new(),
            vel: 0.0,
            t: 0,
            len: 0,
            tune: 0.0,
            decay: 0.5,
            drive_amt: 0.0,
            level: 1.0,
            len_mul: 1.0,
            shape: 0,
            body_sat: crate::dsp::Adaa::new(),
            noise: 0.5,
            snap: 0.5,
            color: 0.0,
            sweep: 0.5,
            wobble: 0.0,
            random: 0.0,
            hit: [1.0; 4],
            wob_phase: 0.0,
            osc3: Sine::default(),
            fast_env: Decay::new(),
            nf: Svf::default(),
            tf: crate::dsp::filter::OnePoleLp::default(),
        };
        p.setup_filters();
        p
    }

    fn ratio(&self) -> f32 {
        (self.tune / 12.0).exp2() * self.hit[0]
    }

    /// Noise layer decay scale: a quarter to four times as long.
    fn snap_k(&self) -> f32 {
        4f32.powf((self.snap - 0.5) * 2.0)
    }

    /// Noise filter shift: two octaves either way, and this hit's own nudge.
    fn color_k(&self) -> f32 {
        (self.color * 2.0).exp2() * self.hit[3]
    }

    /// Pitch sweep depth against the pad as designed (1 at the middle of the knob).
    fn sweep_k(&self) -> f32 {
        2.0 * self.sweep
    }

    /// Bell or metal, on the perc pads.
    fn metallic(&self) -> u8 {
        if matches!(self.model, Model::Blip | Model::Wood) { self.shape.min(2) } else { 0 }
    }

    fn setup_filters(&mut self) {
        let r = self.ratio();
        let c = self.color_k();
        let sr = self.sr;
        self.bp2.set(7_500.0, 0.7, sr);
        // Item 8: `c` moves each noise layer's filter (1 at the middle of the color knob).
        match self.model {
            Model::Snare => {
                self.bp.set(3_200.0 * r * c, 0.8, sr);
                self.hp.set(900.0 * c, sr);
                self.tf.set(1_800.0 * r, sr);
            }
            Model::Clap => {
                self.bp.set(1_150.0 * r * c, 2.2, sr);
                self.hp.set(500.0 * c, sr);
            }
            Model::Rim => {
                self.bp.set(2_800.0 * r * c, 4.0, sr);
                self.hp.set(400.0, sr);
            }
            Model::ClosedHat | Model::OpenHat => {
                self.bp.set(METAL_BP_HI * r, 1.8, sr);
                self.hpr.set(9_000.0 * r.sqrt(), 1.3, sr);
                self.nf.set(8_000.0 * c, 0.7, sr);
            }
            Model::Shaker => {
                self.bp.set(9_000.0 * r * c, 0.9, sr);
                self.hp.set(5_500.0 * c, sr);
            }
            Model::Ride => {
                self.bp.set(METAL_BP_HI * r, 1.6, sr);
                self.bp2.set(METAL_BP_LO * r, 1.4, sr);
                self.hpr.set(3_200.0, 0.9, sr);
                self.nf.set(6_000.0 * c, 0.7, sr);
            }
            Model::Crash => {
                self.bp.set(METAL_BP_HI * r, 1.2, sr);
                self.bp2.set(METAL_BP_LO * r, 1.0, sr);
                self.hpr.set(4_200.0, 0.8, sr);
                self.nf.set(6_000.0 * c, 0.7, sr);
            }
            Model::Wood => {
                self.bp.set(1_800.0 * r * c, 6.0, sr);
                self.hp.set(300.0, sr);
                self.nf.set(2_640.0 * r, 1.2, sr);
            }
            Model::Blip => {
                self.hp.set(30.0, sr);
                self.bp.set(3_000.0 * r * c, 1.0, sr);
                self.nf.set(2_640.0 * r, 1.2, sr);
            }
            Model::Sweep | Model::Reverse => {
                self.bp.set(2_000.0, 2.0, sr);
                self.hp.set(150.0, sr);
            }
            Model::Kick => {
                self.hp.set(3_000.0 * c, sr);
            }
            Model::Tom(_) => {
                self.hp.set(30.0, sr);
                self.nf.set(1_500.0, 0.7, sr);
            }
        }
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
        let base = match self.metallic() {
            1 => 0.35,
            2 => 0.5,
            _ => self.base_len(),
        };
        base * (4.0f32).powf((self.decay - 0.5) * 2.0) * self.len_mul * self.hit[2]
    }

    pub fn trigger(&mut self, vel: f32) {
        // Item 8, random: this hit's own pitch (up to a semitone either way at full), level (3 dB),
        // length (20%) and noise color (half an octave). Nothing is drawn when random is off, so the
        // noise a pad makes stays the same as before.
        self.hit = if self.random > 0.001 {
            let k = self.random;
            [
                ((self.rng.bipolar() * k) / 12.0).exp2(),
                crate::params::db_to_gain(self.rng.bipolar() * k * 3.0),
                1.0 + self.rng.bipolar() * k * 0.2,
                (self.rng.bipolar() * k * 0.5).exp2(),
            ]
        } else {
            [1.0; 4]
        };
        self.wob_phase = 0.0;
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
                self.pitch_env.trigger(BODY[self.shape.min(2) as usize].2, sr, 0.0002);
                self.noise_env.trigger(0.012 * self.snap_k(), sr, 0.0002);
                self.bump_env.trigger(0.006 * 3.0, sr, 0.0001);
                self.sigh_env.trigger((len * 1.2).max(0.3), sr, 0.0002);
                // Engine 2 item 5, part two: a short hold at full level (4 to 30 ms, longer on a long
                // kick), then two decays: the punch, and a slower ring under it.
                self.hold = ((len * 0.04).clamp(0.004, 0.03) * sr) as u32;
                self.ring_env.trigger(len * 1.6, sr, 0.0015);
                self.osc.phase = 0.0;
            }
            Model::Tom(_) => {
                self.pitch_env.trigger(0.18, sr, 0.0002);
                self.noise_env.trigger(0.02 * self.snap_k(), sr, 0.0002);
                self.osc.phase = 0.0;
            }
            Model::Snare => {
                self.pitch_env.trigger(0.05, sr, 0.0002);
                self.noise_env.trigger(len * 1.1 * self.snap_k(), sr, 0.0005);
            }
            Model::Rim | Model::Blip | Model::Wood => {
                self.pitch_env.trigger(0.02, sr, 0.0002);
                self.noise_env.trigger(0.008 * self.snap_k(), sr, 0.0002);
                // The bell's first, fast drop (the 808 cowbell's two-stage decay).
                self.fast_env.trigger(0.06, sr, 0.0002);
                self.osc.phase = 0.0;
                self.osc2.phase = 0.0;
                self.osc3.phase = 0.0;
            }
            Model::ClosedHat | Model::OpenHat | Model::Ride | Model::Crash => {
                self.pitch_env.trigger(0.05, sr, 0.0002);
                self.noise_env.trigger(len * 0.7 * self.snap_k(), sr, 0.0005);
            }
            Model::Sweep => self.pitch_env.trigger(len, sr, 0.0002),
            _ => {}
        }
    }

    /// Stop fast (choke). 4 ms so it does not click.
    pub fn choke(&mut self) {
        self.amp.set_time(0.004, self.sr);
        self.ring_env.set_time(0.004, self.sr);
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
        // Item 8, wobble: a 5.5 Hz pitch wobble from the start of every hit, up to 6% (a semitone).
        let wob = if self.wobble > 0.001 {
            let w = 1.0 + self.wobble * 0.06 * crate::dsp::sin_cycle(self.wob_phase);
            self.wob_phase = (self.wob_phase + 5.5 / sr).fract();
            w
        } else {
            1.0
        };
        let r = self.ratio() * wob;
        let (tg, ng) = layer_gains(self.noise);
        let sw = self.sweep_k();
        // Sounds that had no pitch sweep get one from the top half of the sweep knob.
        let extra_sweep = 0.6 * (sw - 1.0).max(0.0);
        let mut a = self.amp.next();
        if self.model == Model::Kick {
            // Hold: once the declick ramp is done, keep the punch at full level until the hold ends.
            let ramp = (0.0015 * sr) as u32;
            if self.t >= ramp && self.t < self.hold {
                self.amp.level = 1.0;
                self.ring_env.level = 1.0;
            }
            // 0.9 keeps the kick where it sat in a mix: the longer ring adds about 1 dB over a bar.
            a = (0.78 * a + 0.22 * self.ring_env.next()) * 0.9;
        }
        let v = self.vel;
        let tsec = self.t as f32 / sr;
        self.t = self.t.saturating_add(1);
        let metallic = self.metallic();
        let y = match self.model {
            _ if metallic > 0 => {
                // Item 8: metallic percussion on the perc pads, the tone layer; a short filtered click
                // of noise is the noise layer.
                let pe = self.pitch_env.next();
                let f = r * (1.0 + extra_sweep * pe);
                let tone = if metallic == 1 {
                    // The 808 cowbell: two of the cymbal's square waves (540 and 800 Hz) through a band
                    // pass, with a fast first drop and a slower ring.
                    let m = (self.metal[4].next(540.0 * f / sr).1 + self.metal[5].next(800.0 * f / sr).1) * 0.5;
                    self.nf.tick(m).bp * 2.2 * (0.25 + 0.75 * self.fast_env.next())
                } else {
                    // Metal: the first three modes of a free metal bar (1, 2.756, 5.404 times the
                    // fundamental: inharmonic, which is what makes it metal), the upper ones dying
                    // faster, ring-modulated by a square at 1.37 times for clang.
                    let base = 580.0 * f;
                    let p = self.osc.next(base / sr) + 0.6 * a * self.osc2.next(base * 2.756 / sr) + 0.35 * a * a * self.osc3.next(base * 5.404 / sr);
                    let rm = self.metal[0].next(base * 1.37 / sr).1;
                    p * (0.75 + 0.25 * rm) * 0.45
                };
                let n = self.bp.tick(self.rng.bipolar()).bp * self.noise_env.next() * 0.3;
                (tone * tg + n * ng) * a
            }
            Model::Kick => {
                // Engine 2, item 5 (part one), after the published analysis of the 808 bass drum:
                // a 6 ms bump on top of the main sweep makes the attack punch, and the pitch keeps
                // sighing down up to 10% as the tail rings out instead of sitting dead still.
                let pe = self.pitch_env.next();
                let bump = self.bump_env.next();
                let sigh = 1.0 - 0.1 * (1.0 - self.sigh_env.next());
                let f = 50.0 * r * (1.0 + sw * (4.5 * pe * pe + 1.2 * pe) + 1.6 * bump) * sigh;
                let s = self.osc.next(f / sr);
                // Item 5, part three: the body's shape (round passes the sine straight through).
                let (drive, makeup, _) = BODY[self.shape.min(2) as usize];
                let body = if drive > 0.0 { self.body_sat.process(s * drive) * makeup } else { s };
                // The click is a shaped pulse (a 1 ms raised cosine) with a little noise on it, not a burst of hiss.
                // Item 8: the body is the tone layer, the click the noise layer.
                let pulse = if tsec < 0.001 { 0.5 - 0.5 * (tsec * 2_000.0 * core::f32::consts::PI).cos() } else { 0.0 };
                let click = (pulse * 0.55 + self.hp.tick(self.rng.bipolar()) * self.noise_env.next() * 0.4) * (0.25 + 0.35 * v);
                (body * 1.05 * tg + click * ng) * a
            }
            Model::Tom(i) => {
                let pe = self.pitch_env.next();
                let base = [92.0, 132.0, 184.0][i as usize] * r;
                let f = base * (1.0 + 0.55 * pe * sw);
                let body = self.osc.next(f / sr) + 0.25 * self.osc2.next(f * 1.5 / sr);
                // The noise layer's filter tilts dark or bright from the middle of the color knob.
                let raw = self.rng.bipolar();
                let c = self.color;
                let n = if c.abs() < 0.001 {
                    raw
                } else {
                    let o = self.nf.tick(raw);
                    if c > 0.0 { raw + c * (o.hp - raw) } else { raw - c * (o.lp - raw) }
                };
                let n = n * self.noise_env.next() * 0.2;
                (body * 0.8 * tg + n * ng) * a
            }
            Model::Snare => {
                // Item 8: body (two tuned sines with a pitch drop) and snap (band-passed noise, its own
                // envelope and filter), mixed by the noise knob.
                let pe = self.pitch_env.next();
                let body = 0.6 * self.osc.next(185.0 * r * (1.0 + 0.3 * pe * sw) / sr) + 0.35 * self.osc2.next(330.0 * r / sr);
                let tone = body * (a * a);
                let n = self.rng.bipolar();
                let n = self.hp.tick(self.bp.tick(n).bp * 1.3 + n * 0.4);
                tone * tg + n * self.noise_env.next() * (0.6 + 0.4 * v) * ng
            }
            Model::Clap => {
                // Three quick bursts, then the room. All noise layer; snap sets how fast each burst dies.
                let burst = if tsec < 0.03 {
                    let ph = (tsec / 0.01).fract();
                    (-ph * 9.0 / self.snap_k()).exp()
                } else {
                    1.0
                };
                let n = self.bp.tick(self.rng.bipolar()).bp;
                self.hp.tick(n) * 2.2 * burst * a * ng
            }
            Model::Rim => {
                let pe = self.pitch_env.next();
                let n = self.bp.tick(self.rng.bipolar()).bp * self.noise_env.next();
                let body = self.osc.next(1_700.0 * r * (1.0 + extra_sweep * pe) / sr) * 0.5;
                self.hp.tick(body * tg + n * 2.0 * ng) * a
            }
            Model::ClosedHat | Model::OpenHat | Model::Ride | Model::Crash => {
                // The 808 cluster: six squares, summed. Item 8: this is the tone layer (its filters are
                // the 808's band-passes); the noise layer is a wash of filtered noise from the top half
                // of the noise knob, with its own envelope (snap) and filter (color).
                let pe = self.pitch_env.next();
                let fr = r * (1.0 + extra_sweep * pe);
                let mut m = 0.0;
                for (o, f) in self.metal.iter_mut().zip(METAL) {
                    m += o.next(f * fr / sr).1;
                }
                m *= 1.0 / 6.0;
                let hi = self.bp.tick(m).bp;
                let src = match self.model {
                    // Cymbals take both bands; a breath of noise gives the crash its wash.
                    Model::Crash => hi + 0.9 * self.bp2.tick(m).bp + self.rng.bipolar() * 0.06 * ng,
                    Model::Ride => 0.7 * hi + self.bp2.tick(m).bp,
                    _ => hi,
                };
                let wash = if self.noise > 0.5 { self.nf.tick(self.rng.bipolar()).hp * (2.0 * self.noise - 1.0) * 0.3 * self.noise_env.next() } else { 0.0 };
                // The "swing" VCA: the envelope opens it, and when hit hard it clips softly, on purpose.
                let swing = soft_clip((src * tg + wash) * a * 4.0 * (0.55 + 0.45 * v));
                // Trimmed so the new hats sit at the same loudness as the old ones in a mix.
                self.hpr.tick(swing).hp * 0.8
            }
            Model::Shaker => {
                let rise = (tsec / (0.008 * self.snap_k())).min(1.0);
                let n = self.bp.tick(self.rng.bipolar()).bp;
                self.hp.tick(n) * 1.6 * a * rise * ng
            }
            Model::Blip => {
                // Two-operator FM blip.
                let pe = self.pitch_env.next();
                let f = 760.0 * r * (1.0 + extra_sweep * pe);
                let m = self.osc2.next(f * 1.41 / sr) * (2.5 * pe + 0.3);
                self.osc.phase = (self.osc.phase + m * 0.02).rem_euclid(1.0);
                self.osc.next(f / sr) * a * 0.8 * tg
            }
            Model::Wood => {
                let pe = self.pitch_env.next();
                let n = self.bp.tick(self.rng.bipolar()).bp * self.noise_env.next();
                let body = self.osc.next(1_150.0 * r * (1.0 + extra_sweep * pe) / sr) * 0.6;
                (body * tg + n * ng) * a
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
        soft_clip(y * 0.9) * self.level * self.hit[1]
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

    /// `i` counts from the instrument block: pad * 4 + knob, then the rack, then each pad's second page.
    pub fn set_param(&mut self, i: usize, v: f32) {
        if i >= DRUM_PAD2_BASE {
            let pad = (i - DRUM_PAD2_BASE) / DRUM_PAD2_STRIDE;
            let k = (i - DRUM_PAD2_BASE) % DRUM_PAD2_STRIDE;
            if let Some(p) = self.pads.get_mut(pad) {
                set_pad2(p, k, v);
            }
            return;
        }
        if i >= DRUM_RACK_BASE {
            // Rack-wide knobs. open: the closed hat rings out up to 10x longer.
            if i - DRUM_RACK_BASE == D_OPEN {
                self.pads[4].len_mul = 1.0 + v * 9.0;
            }
            return;
        }
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

fn set_pad2(p: &mut Pad, k: usize, v: f32) {
    match k {
        DP_SHAPE => p.shape = step3(v),
        DP_NOISE => p.noise = v.clamp(0.0, 1.0),
        DP_SNAP => p.snap = v.clamp(0.0, 1.0),
        DP_COLOR => p.color = v.clamp(-1.0, 1.0),
        DP_SWEEP => p.sweep = v.clamp(0.0, 1.0),
        DP_WOBBLE => p.wobble = v.clamp(0.0, 1.0),
        DP_RANDOM => p.random = v.clamp(0.0, 1.0),
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
