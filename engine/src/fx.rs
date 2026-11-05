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

/// Dotted-eighth ping-pong, darkened on each repeat like a tape echo.
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
}

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

    #[inline]
    pub fn tick(&mut self, input: f32) -> (f32, f32) {
        self.time += (self.target - self.time) * 0.0002;
        let a = self.l.read(self.time);
        let b = self.r.read(self.time);
        let x = self.hp.tick(input);
        // Ping-pong: input enters left, each side feeds the other.
        self.l.write(flush_denormal(x + self.lp_r.tick(b) * self.feedback));
        self.r.write(flush_denormal(self.lp_l.tick(a) * self.feedback));
        (a, b)
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

/// The hall: an eight-line feedback delay network with a Hadamard mix and input diffusion, as before
/// engine 2, made smoother. Every line's length drifts slowly (its own rate, 0.1 to 0.5 Hz, a quarter
/// of a millisecond), so no mode rings in place; and every line's loss is a first-order shelf set from
/// the reverb time under and over a 6 kHz crossover (a two-band absorbent filter, after Jot), so the
/// decay is as long as asked through the middle of the band and shorter, darker, at the top.
pub struct Hall {
    pre: Line,
    diff: [Line; 4],
    lines: [Line; 8],
    lens: [f32; 8],
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
/// Reverb time over the crossover against under it: the hall darkens as it dies.
const HALL_TOP: f32 = 0.18;
const HALL_XOVER: f32 = 6_000.0;
/// Output level: the new hall sits where the old one did on the same send.
const HALL_OUT: f32 = 0.41;

impl Hall {
    pub fn new(sr: f32) -> Self {
        let ms = |m: f32| (m * 0.001 * sr) as usize;
        let depth = 0.000_25 * sr;
        let lens: [f32; 8] = core::array::from_fn(|i| ms(LINE_MS[i] * 1.6) as f32);
        let mut h = Hall {
            pre: Line::new(ms(120.0)),
            diff: core::array::from_fn(|i| Line::new(ms(DIFF_MS[i]) + 1)),
            lines: core::array::from_fn(|i| Line::new(lens[i] as usize + depth as usize + 4)),
            lens,
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
            let g = |rt: f32| 10f32.powf(-3.0 * self.lens[i] / (rt.max(0.05) * self.sr));
            // The diffusers and the crossover's skirt shave about a tenth off the middle: asked for.
            self.g_lo[i] = g(rt60 * 1.12);
            self.g_hi[i] = g(rt60 * HALL_TOP);
        }
    }

    pub fn clear(&mut self) {
        for l in self.lines.iter_mut().chain(self.diff.iter_mut()).chain(core::iter::once(&mut self.pre)) {
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
        let mut o = [0.0f32; 8];
        for i in 0..8 {
            self.lfo[i] += self.lfo_inc[i];
            if self.lfo[i] >= 1.0 {
                self.lfo[i] -= 1.0;
            }
            let m = crate::dsp::sin_cycle(self.lfo[i]) * self.depth;
            o[i] = self.lines[i].read(self.lens[i] + m);
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
        for i in 0..8 {
            // Loss: split at the crossover, the lows lose g_lo per pass, the highs g_hi.
            let x = h[i] * norm;
            let v = (x - self.lp[i]) * self.xg;
            let lo = v + self.lp[i];
            self.lp[i] = flush_denormal(lo + v);
            let y = self.g_lo[i] * lo + self.g_hi[i] * (x - lo);
            self.lines[i].write(flush_denormal(y + d * 0.35));
        }
        let l = o[0] + o[2] + o[4] + o[6];
        let r = o[1] + o[3] + o[5] + o[7];
        (l * HALL_OUT, r * HALL_OUT)
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
