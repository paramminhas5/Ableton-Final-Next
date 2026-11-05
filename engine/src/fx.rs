//! Shared return effects: a tempo-synced ping-pong echo and two reverbs (a feedback-delay-network
//! hall and a Dattorro plate). Buffers are allocated once, when the engine is created.

use crate::dsp::filter::{OnePoleHp, OnePoleLp};
use crate::dsp::flush_denormal;

struct Line {
    buf: Vec<f32>,
    pos: usize,
}

impl Line {
    fn new(len: usize) -> Self {
        Line { buf: vec![0.0; len.max(2)], pos: 0 }
    }
    #[inline]
    fn write(&mut self, x: f32) {
        self.buf[self.pos] = x;
        self.pos += 1;
        if self.pos >= self.buf.len() {
            self.pos = 0;
        }
    }
    /// Read `d` samples back (fractional, linear interpolation).
    #[inline]
    fn read(&self, d: f32) -> f32 {
        let n = self.buf.len();
        let d = d.clamp(1.0, (n - 2) as f32);
        let i = d as usize;
        let f = d - i as f32;
        let a = self.buf[(self.pos + n - i) % n];
        let b = self.buf[(self.pos + n - i - 1) % n];
        a + (b - a) * f
    }
    #[inline]
    fn read_int(&self, d: usize) -> f32 {
        let n = self.buf.len();
        self.buf[(self.pos + n - d.min(n - 1)) % n]
    }
    fn clear(&mut self) {
        for v in self.buf.iter_mut() {
            *v = 0.0;
        }
    }
}

/// The echo's three styles (engine 2, item 11).
pub const ECHO_CLEAN: u8 = 0;
pub const ECHO_TAPE: u8 = 1;
pub const ECHO_BBD: u8 = 2;

/// Dotted-eighth ping-pong on the shared return. Clean is the echo as it was before engine 2 (each
/// repeat through a one-pole low-pass, nothing else). Tape and analogue are the hardware it imitated:
/// - tape: the delay drifts with the tape's speed (wow, a slow wander, and flutter, a fast shimmer),
///   by a share of the delay time, as a real tape's speed error is; every repeat goes back through the
///   record head, so it saturates and loses top and bottom.
/// - analogue (bucket brigade): darker repeats (two poles, the chip's anti-alias filters), a gentler
///   clock wobble, also a share of the delay time.
/// Both duck: the repeats dip while you play into them and come up in the gaps.
pub struct Echo {
    l: Line,
    r: Line,
    sr: f32,
    time: f32,
    target: f32,
    lp_l: OnePoleLp,
    lp_r: OnePoleLp,
    hp: OnePoleHp,
    pub feedback: f32,
    kind: u8,
    lp2_l: OnePoleLp,
    lp2_r: OnePoleLp,
    hpf_l: OnePoleHp,
    hpf_r: OnePoleHp,
    sat_in: crate::dsp::Adaa,
    sat_l: crate::dsp::Adaa,
    sat_r: crate::dsp::Adaa,
    wow: f32,
    flutter: f32,
    drift: f32,
    drift_target: f32,
    drift_count: u32,
    rng: crate::dsp::Rng,
    duck_env: f32,
    duck_att: f32,
    duck_rel: f32,
    /// The delay's deviation from its set time right now, as a share of it (for tests and drawing).
    pub dev: f32,
    /// The repeats' gain from ducking right now.
    pub duck: f32,
}

/// Tape: wow (0.55 Hz) and flutter (6.5 Hz) depth as a share of the delay time, and the random wander.
const WOW: f32 = 0.001_2;
const FLUTTER: f32 = 0.000_1;
const WANDER: f32 = 0.000_8;
/// Bucket brigade: the clock's triangle wobble.
const BBD_WOBBLE: f32 = 0.001_5;
/// Ducking: how far the repeats dip (0.65 is about -9 dB) and the send level that dips them fully.
const DUCK_DEPTH: f32 = 0.65;
const DUCK_FULL: f32 = 0.2;

impl Echo {
    pub fn new(sr: f32) -> Self {
        let n = (sr * 2.5) as usize;
        let mut e = Echo {
            l: Line::new(n),
            r: Line::new(n),
            sr,
            time: sr * 0.375,
            target: sr * 0.375,
            lp_l: OnePoleLp::default(),
            lp_r: OnePoleLp::default(),
            hp: OnePoleHp::default(),
            feedback: 0.42,
            kind: ECHO_CLEAN,
            lp2_l: OnePoleLp::default(),
            lp2_r: OnePoleLp::default(),
            hpf_l: OnePoleHp::default(),
            hpf_r: OnePoleHp::default(),
            sat_in: crate::dsp::Adaa::new(),
            sat_l: crate::dsp::Adaa::new(),
            sat_r: crate::dsp::Adaa::new(),
            wow: 0.0,
            flutter: 0.0,
            drift: 0.0,
            drift_target: 0.0,
            drift_count: 0,
            rng: crate::dsp::Rng::new(0x7A9E),
            duck_env: 0.0,
            duck_att: crate::dsp::tau_coef(0.005, sr),
            duck_rel: crate::dsp::tau_coef(0.25, sr),
            dev: 0.0,
            duck: 1.0,
        };
        e.lp_l.set(3_200.0, sr);
        e.lp_r.set(3_200.0, sr);
        e.hp.set(180.0, sr);
        e
    }

    pub fn set_tempo(&mut self, bpm: f32) {
        let beats = 0.75;
        self.target = (60.0 / bpm.max(20.0) * beats * self.sr).min(self.sr * 2.4);
    }

    /// Clean, tape or analogue.
    pub fn set_kind(&mut self, k: u8) {
        if k == self.kind {
            return;
        }
        self.kind = k;
        let sr = self.sr;
        let (lp, lp2, hp) = match k {
            ECHO_TAPE => (3_000.0, 7_000.0, 110.0),
            ECHO_BBD => (2_900.0, 2_900.0, 160.0),
            _ => (3_200.0, 20_000.0, 20.0),
        };
        for f in [&mut self.lp_l, &mut self.lp_r] {
            f.set(lp, sr);
        }
        for f in [&mut self.lp2_l, &mut self.lp2_r] {
            f.set(lp2, sr);
        }
        for f in [&mut self.hpf_l, &mut self.hpf_r] {
            f.set(hp, sr);
        }
    }

    pub fn kind(&self) -> u8 {
        self.kind
    }

    #[inline]
    pub fn tick(&mut self, input: f32) -> (f32, f32) {
        self.time += (self.target - self.time) * 0.0002;
        if self.kind == ECHO_CLEAN {
            let a = self.l.read(self.time);
            let b = self.r.read(self.time);
            let x = self.hp.tick(input);
            // Ping-pong: input enters left, each side feeds the other.
            self.l.write(flush_denormal(x + self.lp_r.tick(b) * self.feedback));
            self.r.write(flush_denormal(self.lp_l.tick(a) * self.feedback));
            return (a, b);
        }
        // The delay's wander, as a share of the delay time.
        let sr = self.sr;
        self.dev = if self.kind == ECHO_TAPE {
            self.wow = (self.wow + 0.55 / sr).fract();
            self.flutter = (self.flutter + 6.5 / sr).fract();
            if self.drift_count == 0 {
                self.drift_count = (sr * 0.3) as u32;
                self.drift_target = self.rng.bipolar() * WANDER;
            }
            self.drift_count -= 1;
            self.drift += (self.drift_target - self.drift) * (1.0 / (sr * 0.4));
            WOW * crate::dsp::sin_cycle(self.wow) + FLUTTER * crate::dsp::sin_cycle(self.flutter) + self.drift
        } else {
            self.wow = (self.wow + 0.4 / sr).fract();
            BBD_WOBBLE * (4.0 * (self.wow - 0.5).abs() - 1.0)
        };
        let d = self.time * (1.0 + self.dev);
        let a = self.l.read(d);
        let b = self.r.read(d);
        // Ducking follows what goes in.
        let x = self.hp.tick(input);
        let lvl = x.abs();
        let c = if lvl > self.duck_env { self.duck_att } else { self.duck_rel };
        self.duck_env = lvl + (self.duck_env - lvl) * c;
        self.duck = 1.0 - DUCK_DEPTH * (self.duck_env / DUCK_FULL).min(1.0);
        // The record head: a soft saturation going in, and on every repeat on its way back.
        let drive = if self.kind == ECHO_TAPE { 1.8 } else { 1.3 };
        let x = self.sat_in.process(x * drive) / drive;
        let rep_r = self.lp2_r.tick(self.lp_r.tick(self.hpf_r.tick(b)));
        let rep_l = self.lp2_l.tick(self.lp_l.tick(self.hpf_l.tick(a)));
        let rep_r = self.sat_r.process(rep_r * drive) / drive;
        let rep_l = self.sat_l.process(rep_l * drive) / drive;
        self.l.write(flush_denormal(x + rep_r * self.feedback));
        self.r.write(flush_denormal(rep_l * self.feedback));
        (a * self.duck, b * self.duck)
    }
}

/// The two reverbs on the shared return (engine 2, item 9): a hall and a plate.
pub const HALL: u8 = 0;
pub const PLATE: u8 = 1;

pub struct Reverb {
    kind: u8,
    hall: Hall,
    plate: Plate,
}

impl Reverb {
    pub fn new(sr: f32) -> Self {
        Reverb { kind: HALL, hall: Hall::new(sr), plate: Plate::new(sr) }
    }

    /// `rt60` in seconds, at the middle of the band; the top of the band dies faster (darker).
    pub fn set(&mut self, rt60: f32) {
        self.hall.set(rt60);
        self.plate.set(rt60);
    }

    /// Hall or plate. The one you leave starts silent next time.
    pub fn set_kind(&mut self, k: u8) {
        if k != self.kind {
            self.kind = k;
            self.hall.clear();
            self.plate.clear();
        }
    }

    pub fn kind(&self) -> u8 {
        self.kind
    }

    #[inline]
    pub fn tick(&mut self, input: f32) -> (f32, f32) {
        if self.kind == PLATE { self.plate.tick(input) } else { self.hall.tick(input) }
    }
}

/// The hall: an eight-line feedback delay network with a Hadamard mix, input diffusion, slow drift on
/// every line (0.1 to 0.5 Hz, a quarter of a millisecond, so no mode rings in place) and a two-band loss
/// per line (a first-order shelf set from the reverb time under and over a 6 kHz crossover, after Jot),
/// so the decay is as long as asked through the middle of the band and darker at the top.
///
/// The sound shootout (design/sound-shootout.md, 5 Nov) found it slow to fill: the first sound came
/// 65 ms after the hit and the echo density took 145 ms to fill in, against 18 ms and 45 ms for
/// Dragonfly's hall. Four things fix that, each a known technique written here from the papers:
/// - early reflections: a tapped delay line on the diffused input, starting at the predelay and thinning
///   out over 80 ms, with its own times on each side (Moorer, "About this reverberation business", 1979);
/// - an allpass inside every line's loop (Gardner's nested diffusion; Dattorro's and Lexicon's in-tank
///   allpasses), so every lap multiplies the echoes instead of only adding eight more; the loss counts
///   the allpass's delay as part of the lap, so the time knob stays honest;
/// - the input goes into the lines with its own sign on each, so the eight first arrivals differ;
/// - each side reads all eight lines with its own signs (two rows of a Hadamard matrix, which are
///   orthogonal), so left and right are uncorrelated and the output is twice as dense as half the lines,
///   and reads them again part of the way along, so the late sound starts on the first pass.
pub struct Hall {
    pre: Line,
    diff: [Line; 4],
    lines: [Line; 8],
    lens: [f32; 8],
    /// The in-loop allpasses and their lengths (samples).
    ap: [Line; 8],
    ap_len: [usize; 8],
    /// The diffused input, smeared again by three more allpasses, for the early reflections.
    er: Line,
    er_diff: [Line; 3],
    er_taps: [(usize, f32, usize, f32); ER_TAPS],
    /// Loss per line: gain under the crossover and over it, and the crossover's one-pole state.
    g_lo: [f32; 8],
    g_hi: [f32; 8],
    xg: f32,
    lp: [f32; 8],
    lfo: [f32; 8],
    lfo_inc: [f32; 8],
    depth: f32,
    hp: OnePoleHp,
    sr: f32,
}

const LINE_MS: [f32; 8] = [29.7, 37.1, 41.1, 43.7, 53.3, 59.9, 67.3, 73.1];
const DIFF_MS: [f32; 4] = [4.7, 3.6, 12.7, 9.3];
const MOD_HZ: [f32; 8] = [0.11, 0.17, 0.23, 0.29, 0.31, 0.37, 0.41, 0.47];
/// In-loop allpass lengths (ms, mutually prime in samples at 48 kHz) and gain.
const AP_MS: [f32; 8] = [3.1, 4.3, 5.3, 6.1, 7.3, 8.9, 9.7, 11.3];
const AP_G: f32 = 0.7;
/// Signs the input takes into each line, and each side's signs reading them out (rows 1 and 2 of the
/// 8-point Hadamard matrix after the first).
const IN_SIGN: [f32; 8] = [1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0];
const L_SIGN: [f32; 8] = [1.0, -1.0, 1.0, -1.0, 1.0, -1.0, 1.0, -1.0];
const R_SIGN: [f32; 8] = [1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, -1.0];
/// Early reflections: this many taps a side, from the predelay to 80 ms after it.
const ER_TAPS: usize = 24;
const ER_MS: f32 = 80.0;
const ER_LEVEL: f32 = 0.5;
/// The early reflections' own diffusers (ms) and their gain.
const ER_DIFF_MS: [f32; 3] = [2.3, 5.9, 8.3];
const ER_DIFF_G: f32 = 0.72;
/// Each side also reads every line a quarter and half of the way along (taps inside the tank, as
/// Dattorro's outputs are), so the late sound starts with the first pass instead of after a lap.
const MID_TAPS: [f32; 2] = [0.27, 0.53];
const MID_LEVEL: f32 = 0.5;
/// Reverb time over the crossover against under it: the hall darkens as it dies.
const HALL_TOP: f32 = 0.18;
const HALL_XOVER: f32 = 6_000.0;
/// Output level: the hall sits where it did before the shootout on the same send (tests/shootout.rs).
const HALL_OUT: f32 = 0.23;

impl Hall {
    pub fn new(sr: f32) -> Self {
        let ms = |m: f32| (m * 0.001 * sr) as usize;
        let depth = 0.000_25 * sr;
        let ap_len: [usize; 8] = core::array::from_fn(|i| ms(AP_MS[i]).max(2));
        // The lines are shortened by their allpass, so a lap is as long as before.
        let lens: [f32; 8] = core::array::from_fn(|i| (ms(LINE_MS[i] * 1.6) - ap_len[i]) as f32);
        // Early reflection times: spread out, denser near the start, each side at its own times; gains
        // fall 26 dB over the 80 ms with alternating signs (a seeded hash, so the hall is the same every time).
        let er_taps = core::array::from_fn(|k| {
            let u = (k as f32 + 0.5) / ER_TAPS as f32;
            let h = |s: u32| { let mut x = (k as u32 + 1).wrapping_mul(0x9E37_79B9) ^ s; x ^= x >> 13; x = x.wrapping_mul(0x5BD1_E995); x ^= x >> 15; (x & 0xFFFF) as f32 / 65_535.0 };
            let tl = ER_MS * u.powf(1.4) * (0.85 + 0.3 * h(7));
            let tr = ER_MS * u.powf(1.4) * (0.85 + 0.3 * h(31));
            let g = |t: f32| 10f32.powf(-1.3 * t / ER_MS);
            (ms(tl).max(1), g(tl) * if h(11) < 0.5 { 1.0 } else { -1.0 }, ms(tr).max(1), g(tr) * if h(23) < 0.5 { 1.0 } else { -1.0 })
        });
        let mut h = Hall {
            pre: Line::new(ms(120.0)),
            diff: core::array::from_fn(|i| Line::new(ms(DIFF_MS[i]) + 1)),
            lines: core::array::from_fn(|i| Line::new(lens[i] as usize + depth as usize + 4)),
            lens,
            ap: core::array::from_fn(|i| Line::new(ap_len[i] + 1)),
            ap_len,
            er: Line::new(ms(ER_MS * 1.2) + 2),
            er_diff: core::array::from_fn(|i| Line::new(ms(ER_DIFF_MS[i]) + 1)),
            er_taps,
            g_lo: [0.0; 8],
            g_hi: [0.0; 8],
            xg: { let g = (core::f32::consts::PI * HALL_XOVER / sr).tan(); g / (1.0 + g) },
            lp: [0.0; 8],
            lfo: core::array::from_fn(|i| i as f32 * 0.125),
            lfo_inc: core::array::from_fn(|i| MOD_HZ[i] / sr),
            depth,
            hp: OnePoleHp::default(),
            sr,
        };
        h.hp.set(220.0, sr);
        h.set(2.4);
        h
    }

    pub fn set(&mut self, rt60: f32) {
        for i in 0..8 {
            // A lap is the line and its allpass.
            let lap = self.lens[i] + self.ap_len[i] as f32;
            let g = |rt: f32| 10f32.powf(-3.0 * lap / (rt.max(0.05) * self.sr));
            // The diffusers and the crossover's skirt shave about a tenth off the middle: asked for.
            self.g_lo[i] = g(rt60 * 1.12);
            self.g_hi[i] = g(rt60 * HALL_TOP);
        }
    }

    pub fn clear(&mut self) {
        for l in self.lines.iter_mut().chain(self.diff.iter_mut()).chain(self.ap.iter_mut()).chain(self.er_diff.iter_mut()).chain([&mut self.pre, &mut self.er]) {
            l.clear();
        }
        self.lp = [0.0; 8];
    }

    #[inline]
    pub fn tick(&mut self, input: f32) -> (f32, f32) {
        let x = self.hp.tick(input);
        self.pre.write(x);
        let mut d = self.pre.read_int((0.018 * self.sr) as usize);
        // Schroeder allpass diffusers smear the onset.
        for (k, ap) in self.diff.iter_mut().enumerate() {
            let len = (DIFF_MS[k] * 0.001 * self.sr) as usize;
            let delayed = ap.read_int(len);
            let g = 0.62;
            let w = d + delayed * g;
            ap.write(flush_denormal(w));
            d = delayed - w * g;
        }
        let mut e = d;
        for (k, ap) in self.er_diff.iter_mut().enumerate() {
            let delayed = ap.read_int((ER_DIFF_MS[k] * 0.001 * self.sr) as usize);
            let w = flush_denormal(e + delayed * ER_DIFF_G);
            ap.write(w);
            e = delayed - w * ER_DIFF_G;
        }
        self.er.write(e);
        let (mut el, mut er) = (0.0f32, 0.0f32);
        for &(tl, gl, tr, gr) in self.er_taps.iter() {
            el += self.er.read_int(tl) * gl;
            er += self.er.read_int(tr) * gr;
        }
        let mut o = [0.0f32; 8];
        for i in 0..8 {
            self.lfo[i] += self.lfo_inc[i];
            if self.lfo[i] >= 1.0 {
                self.lfo[i] -= 1.0;
            }
            let m = crate::dsp::sin_cycle(self.lfo[i]) * self.depth;
            let z = self.lines[i].read(self.lens[i] + m);
            // The line's allpass: v = z + g v[-n], out = v[-n] - g v.
            let late = self.ap[i].read_int(self.ap_len[i]);
            let v = flush_denormal(z + AP_G * late);
            self.ap[i].write(v);
            o[i] = late - AP_G * v;
        }
        // Fast Hadamard transform (8 points), scaled to stay lossless.
        let mut h = o;
        let mut step = 1;
        while step < 8 {
            let mut i = 0;
            while i < 8 {
                for j in i..i + step {
                    let a = h[j];
                    let b = h[j + step];
                    h[j] = a + b;
                    h[j + step] = a - b;
                }
                i += step * 2;
            }
            step *= 2;
        }
        let norm = 0.353_553_4; // 1/sqrt(8)
        let (mut l, mut r) = (0.0f32, 0.0f32);
        for i in 0..8 {
            // Loss: split at the crossover, the lows lose g_lo per pass, the highs g_hi.
            let x = h[i] * norm;
            let v = (x - self.lp[i]) * self.xg;
            let lo = v + self.lp[i];
            self.lp[i] = flush_denormal(lo + v);
            let y = self.g_lo[i] * lo + self.g_hi[i] * (x - lo);
            self.lines[i].write(flush_denormal(y + d * 0.35 * IN_SIGN[i]));
            l += o[i] * L_SIGN[i];
            r += o[i] * R_SIGN[i];
            // Inside the line, each side at its own place along it.
            let len = self.lens[i];
            l += self.lines[i].read_int((len * MID_TAPS[0]) as usize) * L_SIGN[i] * MID_LEVEL;
            r += self.lines[i].read_int((len * MID_TAPS[1]) as usize) * R_SIGN[i] * MID_LEVEL;
        }
        ((l + el * ER_LEVEL) * HALL_OUT, (r + er * ER_LEVEL) * HALL_OUT)
    }
}

/// Jon Dattorro's plate ("Effect Design, Part 1", J. Audio Eng. Soc., 1997): four input diffusers,
/// then a figure-eight tank of two branches, each a modulated allpass, a delay, a damping low-pass, a
/// second allpass and a delay, feeding each other. Delay lengths are the paper's at 29761 Hz, scaled to
/// the engine's rate; the stereo outputs are the paper's taps. Bright, dense from the first instant.
pub struct Plate {
    pre: Line,
    bw: f32,
    inap: [Line; 4],
    ap1: [Line; 2],
    d1: [Line; 2],
    ap2: [Line; 2],
    d2: [Line; 2],
    damp_s: [f32; 2],
    fb: [f32; 2],
    lfo: f32,
    lfo_inc: f32,
    k: f32,
    decay: f32,
    sr: f32,
}

/// The paper's lengths, in samples at 29761 Hz.
const P_IN: [f32; 4] = [142.0, 107.0, 379.0, 277.0];
const P_AP1: [f32; 2] = [672.0, 908.0];
const P_D1: [f32; 2] = [4453.0, 4217.0];
const P_AP2: [f32; 2] = [1800.0, 2656.0];
const P_D2: [f32; 2] = [3720.0, 3163.0];
const P_EXCURSION: f32 = 16.0;
/// Damping inside the tank (the paper's "damping" coefficient): highs die faster than lows.
const P_DAMP: f32 = 0.45;
const PLATE_OUT: f32 = 0.235;

impl Plate {
    pub fn new(sr: f32) -> Self {
        let k = sr / 29_761.0;
        let line = |n: f32, extra: f32| Line::new((n * k + extra) as usize + 4);
        let ex = P_EXCURSION * k;
        let mut p = Plate {
            pre: Line::new((0.05 * sr) as usize),
            bw: 0.0,
            inap: core::array::from_fn(|i| line(P_IN[i], 0.0)),
            ap1: core::array::from_fn(|i| line(P_AP1[i], ex)),
            d1: core::array::from_fn(|i| line(P_D1[i], 0.0)),
            ap2: core::array::from_fn(|i| line(P_AP2[i], 0.0)),
            d2: core::array::from_fn(|i| line(P_D2[i], 0.0)),
            damp_s: [0.0; 2],
            fb: [0.0; 2],
            lfo: 0.0,
            lfo_inc: 0.9 / sr,
            k,
            decay: 0.5,
            sr,
        };
        p.set(2.4);
        p
    }

    /// The tank passes the decay gain four times a lap; a lap is the sum of its delays.
    pub fn set(&mut self, rt60: f32) {
        let lap: f32 = (P_AP1.iter().chain(&P_D1).chain(&P_AP2).chain(&P_D2).sum::<f32>()) / 29_761.0;
        self.decay = 10f32.powf(-3.0 * lap / (4.0 * rt60.max(0.05))).min(0.97);
    }

    pub fn clear(&mut self) {
        for l in self.inap.iter_mut().chain(self.ap1.iter_mut()).chain(self.d1.iter_mut()).chain(self.ap2.iter_mut()).chain(self.d2.iter_mut()).chain(core::iter::once(&mut self.pre)) {
            l.clear();
        }
        self.damp_s = [0.0; 2];
        self.fb = [0.0; 2];
        self.bw = 0.0;
    }

    /// Allpass with delay `d` (fractional): v = x - g v[-d], y = g v + v[-d].
    #[inline]
    fn ap(line: &mut Line, x: f32, d: f32, g: f32) -> f32 {
        let z = line.read(d);
        let v = flush_denormal(x - g * z);
        line.write(v);
        z + g * v
    }

    #[inline]
    pub fn tick(&mut self, input: f32) -> (f32, f32) {
        let k = self.k;
        self.pre.write(input);
        let x = self.pre.read_int((0.008 * self.sr) as usize);
        self.bw += 0.9995 * (x - self.bw);
        let mut x = self.bw;
        for (i, (l, g)) in self.inap.iter_mut().zip([0.75, 0.75, 0.625, 0.625]).enumerate() {
            x = Self::ap(l, x, P_IN[i] * k, g);
        }
        self.lfo += self.lfo_inc;
        if self.lfo >= 1.0 {
            self.lfo -= 1.0;
        }
        let ex = P_EXCURSION * k;
        let mods = [crate::dsp::sin_cycle(self.lfo) * ex, crate::dsp::sin_cycle((self.lfo + 0.25).fract()) * ex];
        let decay = self.decay;
        let dd2 = (decay + 0.15).clamp(0.25, 0.5);
        let fb = self.fb;
        for b in 0..2 {
            // Each branch takes the input and the other branch's output.
            let t = x + fb[1 - b];
            let a = Self::ap(&mut self.ap1[b], t, P_AP1[b] * k + mods[b], -0.7);
            self.d1[b].write(a);
            let y = self.d1[b].read_int((P_D1[b] * k) as usize);
            self.damp_s[b] = flush_denormal(y * (1.0 - P_DAMP) + self.damp_s[b] * P_DAMP);
            let c = Self::ap(&mut self.ap2[b], self.damp_s[b] * decay, P_AP2[b] * k, dd2);
            self.d2[b].write(c);
            self.fb[b] = flush_denormal(self.d2[b].read_int((P_D2[b] * k) as usize) * decay);
        }
        // The paper's output taps (left from both branches, right likewise, crossed).
        let t = |line: &Line, n: f32| line.read_int((n * k) as usize);
        let l = t(&self.d1[1], 266.0) + t(&self.d1[1], 2974.0) - t(&self.ap2[1], 1913.0) + t(&self.d2[1], 1996.0) - t(&self.d1[0], 1990.0) - t(&self.ap2[0], 187.0) - t(&self.d2[0], 1066.0);
        let r = t(&self.d1[0], 353.0) + t(&self.d1[0], 3627.0) - t(&self.ap2[0], 1228.0) + t(&self.d2[0], 2673.0) - t(&self.d1[1], 2111.0) - t(&self.ap2[1], 335.0) - t(&self.d2[1], 121.0);
        (l * PLATE_OUT, r * PLATE_OUT)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reverb_tail_decays() {
        let sr = 48_000.0;
        let mut r = Reverb::new(sr);
        r.set(1.0);
        r.tick(1.0);
        let mut early = 0.0f32;
        for _ in 0..(sr * 0.3) as usize {
            let (a, b) = r.tick(0.0);
            early = early.max(a.abs().max(b.abs()));
        }
        let mut late = 0.0f32;
        for i in 0..(sr * 3.0) as usize {
            let (a, b) = r.tick(0.0);
            assert!(a.is_finite() && b.is_finite());
            if i > (sr * 2.5) as usize {
                late = late.max(a.abs().max(b.abs()));
            }
        }
        assert!(early > 1e-3, "no reverb {early}");
        assert!(late < early * 0.01, "tail did not decay: {late} vs {early}");
    }

    #[test]
    fn echo_repeats_on_the_beat() {
        let sr = 48_000.0;
        let mut e = Echo::new(sr);
        e.set_tempo(120.0);
        e.time = e.target;
        e.tick(1.0);
        let expect = (0.375 * sr) as usize; // dotted eighth at 120
        let mut first = 0;
        for i in 1..(sr as usize) {
            let (a, _) = e.tick(0.0);
            if a.abs() > 0.1 {
                first = i;
                break;
            }
        }
        assert!((first as i64 - expect as i64).abs() < 4, "first repeat at {first}, want {expect}");
    }
}
