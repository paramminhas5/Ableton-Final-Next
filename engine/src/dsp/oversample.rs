//! 2x oversampling. Voices and saturators run at twice the rate, then a half-band
//! FIR brings them back down with everything above the original Nyquist removed.

const TAPS: usize = 49; // odd, half-band: every other tap is zero except the centre

/// Delay added by one interpolator or one decimator, in base-rate samples.
/// (TAPS - 1) / 2 samples at 2x. Kept even so it is a whole number at the base rate,
/// which lets the engine compensate it exactly, like a DAW's delay compensation.
pub const LATENCY: usize = (TAPS - 1) / 4;

/// Windowed-sinc half-band low pass at a quarter of the oversampled rate.
fn halfband() -> [f32; TAPS] {
    let mut h = [0.0f32; TAPS];
    let m = (TAPS - 1) as f64 / 2.0;
    let mut sum = 0.0f64;
    for (i, v) in h.iter_mut().enumerate() {
        let n = i as f64 - m;
        let sinc = if n == 0.0 { 0.5 } else { (std::f64::consts::PI * n * 0.5).sin() / (std::f64::consts::PI * n) };
        // Blackman-Harris window: about -92 dB sidelobes.
        let x = i as f64 / (TAPS - 1) as f64 * std::f64::consts::TAU;
        let w = 0.35875 - 0.48829 * x.cos() + 0.14128 * (2.0 * x).cos() - 0.01168 * (3.0 * x).cos();
        let c = sinc * w;
        *v = c as f32;
        sum += c;
    }
    for v in h.iter_mut() {
        *v = (*v as f64 / sum) as f32;
    }
    h
}

#[derive(Clone, Copy)]
pub struct Decimator2x {
    h: [f32; TAPS],
    buf: [f32; TAPS * 2],
    pos: usize,
}

impl Decimator2x {
    pub fn new() -> Self {
        Decimator2x { h: halfband(), buf: [0.0; TAPS * 2], pos: 0 }
    }

    #[inline]
    fn push(&mut self, x: f32) {
        self.pos = if self.pos == 0 { TAPS - 1 } else { self.pos - 1 };
        // Mirror so the convolution reads one contiguous slice.
        self.buf[self.pos] = x;
        self.buf[self.pos + TAPS] = x;
    }

    /// Feed two oversampled samples, get one at the base rate.
    #[inline]
    pub fn process(&mut self, a: f32, b: f32) -> f32 {
        // Output lines up with `a` (the even sample), so the delay is a whole number of
        // base-rate samples. `b` joins the history for the next call.
        self.push(a);
        let acc = self.conv();
        self.push(b);
        acc
    }

    #[inline]
    fn conv(&self) -> f32 {
        let w = &self.buf[self.pos..self.pos + TAPS];
        let mut acc = 0.0;
        // Half-band: odd offsets from the centre are zero, skip them.
        let c = TAPS / 2;
        acc += w[c] * self.h[c];
        let mut i = (c + 1) % 2;
        while i < TAPS {
            if i != c {
                acc += w[i] * self.h[i];
            }
            i += 2;
        }
        acc
    }
}

impl Default for Decimator2x {
    fn default() -> Self {
        Self::new()
    }
}

/// Upsampler for processing an existing signal at 2x (used by the drive stage).
#[derive(Clone, Copy)]
pub struct Interpolator2x {
    h: [f32; TAPS],
    buf: [f32; TAPS * 2],
    pos: usize,
}

impl Interpolator2x {
    pub fn new() -> Self {
        Interpolator2x { h: halfband(), buf: [0.0; TAPS * 2], pos: 0 }
    }

    #[inline]
    fn conv(&self, phase: usize) -> f32 {
        let w = &self.buf[self.pos..self.pos + TAPS];
        let c = TAPS / 2;
        if phase == c % 2 {
            // Half-band: on this phase every tap but the centre is zero.
            return w[c] * self.h[c] * 2.0;
        }
        let mut acc = 0.0;
        let mut i = phase;
        while i < TAPS {
            acc += w[i] * self.h[i];
            i += 2;
        }
        acc * 2.0
    }

    /// One base-rate sample in, two oversampled out.
    #[inline]
    pub fn process(&mut self, x: f32) -> (f32, f32) {
        // Zero-stuffed: push x then 0, convolve after each.
        self.pos = if self.pos == 0 { TAPS - 1 } else { self.pos - 1 };
        self.buf[self.pos] = x;
        self.buf[self.pos + TAPS] = x;
        let a = self.conv(0);
        self.pos = if self.pos == 0 { TAPS - 1 } else { self.pos - 1 };
        self.buf[self.pos] = 0.0;
        self.buf[self.pos + TAPS] = 0.0;
        let b = self.conv(1);
        (a, b)
    }
}

impl Default for Interpolator2x {
    fn default() -> Self {
        Self::new()
    }
}

/// Saturator that runs at 2x so its harmonics do not fold back.
#[derive(Clone, Copy, Default)]
pub struct Drive {
    up: Option<Interpolator2x>,
    down: Option<Decimator2x>,
    /// Plain delay with the same length as the 2x path, used while drive is off.
    /// Saves the filters' CPU without moving the timing.
    bypass: [f32; 2 * LATENCY + 1],
    bpos: usize,
    on: bool,
}

impl Drive {
    pub fn new() -> Self {
        Drive { up: Some(Interpolator2x::new()), down: Some(Decimator2x::new()), bypass: [0.0; 2 * LATENCY + 1], bpos: 0, on: false }
    }

    /// `amount` 0..1. The signal always goes through the 2x path, so the delay is the
    /// same with the knob at zero as at full (no timing jump when you touch it).
    #[inline]
    pub fn process(&mut self, x: f32, amount: f32) -> f32 {
        // Delay line always runs (it's cheap) so switching paths never jumps in time.
        let n = self.bypass.len();
        let delayed = self.bypass[(self.bpos + 1) % n];
        self.bypass[self.bpos] = x;
        self.bpos = (self.bpos + 1) % n;
        let (Some(up), Some(down)) = (self.up.as_mut(), self.down.as_mut()) else { return x };
        if amount <= 0.001 {
            if !self.on {
                return delayed;
            }
            // Let the 2x path finish what is in it before switching over.
            self.on = false;
        } else {
            self.on = true;
        }
        let (a, b) = up.process(x);
        if amount <= 0.001 {
            return down.process(a, b);
        }
        let gain = 1.0 + amount * amount * 24.0;
        // Level-matched: turning drive up adds harmonics, not volume.
        let makeup = 0.25 / super::soft_clip(gain * 0.25);
        let a = super::soft_clip(a * gain) * makeup;
        let b = super::soft_clip(b * gain) * makeup;
        down.process(a, b)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::dsp::osc::Sine;

    #[test]
    fn decimator_passes_dc_and_removes_top_band() {
        let mut d = Decimator2x::new();
        let mut y = 0.0;
        for _ in 0..200 {
            y = d.process(1.0, 1.0);
        }
        assert!((y - 1.0).abs() < 1e-3, "dc gain {y}");

        // A tone at 0.8 of the oversampled Nyquist (above the base Nyquist) must vanish.
        let sr2 = 96_000.0;
        let mut s = Sine::default();
        let f = 0.4 * sr2;
        let mut d = Decimator2x::new();
        let mut peak = 0.0f32;
        for i in 0..4000 {
            let a = s.next(f / sr2);
            let b = s.next(f / sr2);
            let y = d.process(a, b);
            if i > 100 {
                peak = peak.max(y.abs());
            }
        }
        assert!(peak < 0.01, "stopband leak {peak}");
    }

    #[test]
    fn drive_delay_is_constant_and_whole() {
        let mut d = Drive::new();
        let mut first = None;
        for i in 0..200 {
            let y = d.process(if i == 0 { 1.0 } else { 0.0 }, 0.0);
            if first.is_none() || y.abs() > first.map(|(_, v): (usize, f32)| v.abs()).unwrap_or(0.0) {
                first = Some((i, y));
            }
        }
        assert_eq!(first.unwrap().0, 2 * LATENCY, "peak of the impulse response");
    }
}
