//! Tuned resonators for plucks, mallets and keys (engine 2, item 10): a Karplus-Strong string, or
//! two of them for the struck sounds (the idea behind physical-modelling instruments like Collision).
//!
//! One resonator is a delay line one period long with a loss filter in the loop. The loop is tuned to
//! the exact period: a whole-sample delay, a 3-tap symmetric loss filter (exactly one sample of delay,
//! so it never pulls the pitch) and a first-order Thiran allpass for the fraction. The loss filter's
//! taper sets how much faster the overtones die than the fundamental (bright or dark), and the loop
//! gain is set from the decay time asked for at the fundamental, after the filter's own loss there.

/// Longest period a resonator holds, in samples at the voice rate (96 kHz: 23.4 Hz).
pub const MAX_PERIOD: usize = 4_096;

pub struct Comb {
    buf: Vec<f32>,
    pos: usize,
    n: usize,
    /// Thiran allpass coefficient and state.
    a: f32,
    ax1: f32,
    ay1: f32,
    /// Loss filter taper (0 flat .. 0.25 darkest) and its two taps of memory.
    b: f32,
    z1: f32,
    z2: f32,
    g: f32,
}

impl Comb {
    /// Allocates: build voices before the audio starts.
    pub fn new() -> Self {
        Comb { buf: vec![0.0; MAX_PERIOD + 4], pos: 0, n: 100, a: 0.0, ax1: 0.0, ay1: 0.0, b: 0.1, z1: 0.0, z2: 0.0, g: 0.99 }
    }

    pub fn clear(&mut self) {
        for v in self.buf.iter_mut() {
            *v = 0.0;
        }
        self.ax1 = 0.0;
        self.ay1 = 0.0;
        self.z1 = 0.0;
        self.z2 = 0.0;
    }

    /// Tune to `hz` at rate `sr`, with `taper` (0..0.25) and a decay of `t60` seconds at the fundamental.
    pub fn tune(&mut self, hz: f32, sr: f32, taper: f32, t60: f32) {
        self.b = taper.clamp(0.0, 0.25);
        self.retune(hz, sr);
        // Loss filter gain at the fundamental: 1 - 2b(1 - cos w).
        let w = core::f32::consts::TAU * hz / sr;
        let h = 1.0 - 2.0 * self.b * (1.0 - w.cos());
        let per_period = 10f32.powf(-3.0 / (hz * t60.max(0.01)));
        self.g = (per_period / h.max(1e-3)).min(0.9999);
    }

    /// Follow a pitch that moves (glide, drift, vibrato): the period only, cheap enough every sample.
    #[inline]
    pub fn retune(&mut self, hz: f32, sr: f32) {
        let period = (sr / hz.max(1.0)).clamp(4.0, MAX_PERIOD as f32);
        // The loss filter takes one sample; the allpass takes the fraction, kept in 0.5..1.5 where a
        // first-order Thiran allpass is at its most accurate.
        let d = period - 1.0;
        let n = (d - 0.5).floor().max(1.0);
        let frac = d - n;
        self.n = n as usize;
        self.a = (1.0 - frac) / (1.0 + frac);
    }

    /// Damp the ring quickly (a note off on a damped string), by `t60` seconds at the fundamental.
    pub fn damp(&mut self, hz: f32, t60: f32) {
        self.g = self.g.min(10f32.powf(-3.0 / (hz.max(1.0) * t60.max(0.005))));
    }

    #[inline]
    pub fn tick(&mut self, x: f32) -> f32 {
        let len = self.buf.len();
        let o = self.buf[(self.pos + len - self.n) % len];
        // Loss: [b, 1 - 2b, b], one sample of delay.
        let f = self.b * o + (1.0 - 2.0 * self.b) * self.z1 + self.b * self.z2;
        self.z2 = self.z1;
        self.z1 = o;
        // The fraction of a sample: y = a x + x1 - a y1.
        let ap = self.a * f + self.ax1 - self.a * self.ay1;
        self.ax1 = f;
        self.ay1 = super::flush_denormal(ap);
        self.buf[self.pos] = super::flush_denormal(x + self.g * ap);
        self.pos = (self.pos + 1) % len;
        o
    }
}

impl Default for Comb {
    fn default() -> Self {
        Self::new()
    }
}
