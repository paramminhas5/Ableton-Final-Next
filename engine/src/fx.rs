//! Shared return effects: a tempo-synced ping-pong echo and a feedback-delay-network
//! reverb. Buffers are allocated once, when the engine is created.

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

/// Eight-line FDN reverb with a Hadamard mix, input diffusion and damping.
pub struct Reverb {
    pre: Line,
    diff: [Line; 4],
    lines: [Line; 8],
    lens: [usize; 8],
    gains: [f32; 8],
    damp: [OnePoleLp; 8],
    hp: OnePoleHp,
    sr: f32,
}

const LINE_MS: [f32; 8] = [29.7, 37.1, 41.1, 43.7, 53.3, 59.9, 67.3, 73.1];
const DIFF_MS: [f32; 4] = [4.7, 3.6, 12.7, 9.3];

impl Reverb {
    pub fn new(sr: f32) -> Self {
        let ms = |m: f32| (m * 0.001 * sr) as usize;
        let lens: [usize; 8] = core::array::from_fn(|i| ms(LINE_MS[i] * 1.6));
        let mut r = Reverb {
            pre: Line::new(ms(120.0)),
            diff: core::array::from_fn(|i| Line::new(ms(DIFF_MS[i]) + 1)),
            lines: core::array::from_fn(|i| Line::new(lens[i] + 1)),
            lens,
            gains: [0.0; 8],
            damp: [OnePoleLp::default(); 8],
            hp: OnePoleHp::default(),
            sr,
        };
        r.hp.set(220.0, sr);
        r.set(2.4, 6_500.0);
        r
    }

    /// `rt60` seconds, `damp_hz` where the tail starts to darken.
    pub fn set(&mut self, rt60: f32, damp_hz: f32) {
        for i in 0..8 {
            self.gains[i] = 10f32.powf(-3.0 * self.lens[i] as f32 / (rt60 * self.sr));
            self.damp[i].set(damp_hz, self.sr);
        }
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
            o[i] = self.lines[i].read_int(self.lens[i]);
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
            let fb = self.damp[i].tick(h[i] * norm) * self.gains[i];
            self.lines[i].write(flush_denormal(fb + d * 0.35));
        }
        let l = o[0] + o[2] + o[4] + o[6];
        let r = o[1] + o[3] + o[5] + o[7];
        (l * 0.35, r * 0.35)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn reverb_tail_decays() {
        let sr = 48_000.0;
        let mut r = Reverb::new(sr);
        r.set(1.0, 6_000.0);
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
