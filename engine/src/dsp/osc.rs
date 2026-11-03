//! Band-limited oscillators (PolyBLEP). Run inside a 2x oversampled voice, so what
//! aliasing PolyBLEP leaves lands above the audible band and the decimator removes it.

use super::TAU;

/// Two-sample polynomial band-limited step residual.
#[inline]
fn poly_blep(t: f32, dt: f32) -> f32 {
    if t < dt {
        let x = t / dt;
        x + x - x * x - 1.0
    } else if t > 1.0 - dt {
        let x = (t - 1.0) / dt;
        x * x + x + x + 1.0
    } else {
        0.0
    }
}

#[derive(Clone, Copy)]
pub struct BlepOsc {
    pub phase: f32,
    /// Leaky integrator state, used to shape the square into a smoother analogue-style edge.
    pw: f32,
}

impl BlepOsc {
    pub fn new() -> Self {
        BlepOsc { phase: 0.0, pw: 0.5 }
    }

    pub fn reset(&mut self, phase: f32) {
        self.phase = phase;
    }

    pub fn set_pulse_width(&mut self, pw: f32) {
        self.pw = pw.clamp(0.05, 0.95);
    }

    /// Returns (saw, square) for this sample and advances. `dt` = freq / sample rate.
    #[inline]
    pub fn next(&mut self, dt: f32) -> (f32, f32) {
        let dt = dt.clamp(0.0, 0.49);
        let t = self.phase;
        let mut saw = 2.0 * t - 1.0;
        saw -= poly_blep(t, dt);

        let mut sq = if t < self.pw { 1.0 } else { -1.0 };
        sq += poly_blep(t, dt);
        let mut t2 = t - self.pw;
        if t2 < 0.0 {
            t2 += 1.0;
        }
        sq -= poly_blep(t2, dt);

        self.phase += dt;
        if self.phase >= 1.0 {
            self.phase -= 1.0;
        }
        (saw, sq)
    }
}

impl Default for BlepOsc {
    fn default() -> Self {
        Self::new()
    }
}

/// Plain sine with a phase accumulator. Used for subs and kicks.
#[derive(Clone, Copy, Default)]
pub struct Sine {
    pub phase: f32,
}

impl Sine {
    #[inline]
    pub fn next(&mut self, dt: f32) -> f32 {
        let s = (self.phase * TAU).sin();
        self.phase += dt;
        if self.phase >= 1.0 {
            self.phase -= 1.0;
        }
        s
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Energy above `cut` Hz relative to total, via a naive DFT over a window.
    fn high_band_ratio(sig: &[f32], sr: f32, cut: f32) -> f32 {
        let n = sig.len();
        let (mut hi, mut all) = (0.0f64, 0.0f64);
        for k in 1..n / 2 {
            let f = k as f32 * sr / n as f32;
            let (mut re, mut im) = (0.0f64, 0.0f64);
            for (i, &x) in sig.iter().enumerate() {
                let w = 0.5 - 0.5 * (TAU * i as f32 / n as f32).cos(); // hann
                let a = -std::f64::consts::TAU * (k * i) as f64 / n as f64;
                re += (x * w) as f64 * a.cos();
                im += (x * w) as f64 * a.sin();
            }
            let p = re * re + im * im;
            all += p;
            if f > cut {
                hi += p;
            }
        }
        (hi / all) as f32
    }

    #[test]
    fn saw_is_less_aliased_than_naive() {
        let sr = 48_000.0;
        let f = 3_520.0; // A7: where a naive saw aliases badly
        let n = 1024;
        let mut o = BlepOsc::new();
        let blep: Vec<f32> = (0..n).map(|_| o.next(f / sr).0).collect();
        let mut ph = 0.0f32;
        let naive: Vec<f32> = (0..n)
            .map(|_| {
                let v = 2.0 * ph - 1.0;
                ph = (ph + f / sr) % 1.0;
                v
            })
            .collect();
        // Inharmonic content: energy that is not near a multiple of f.
        let inharmonic = |sig: &[f32]| {
            let mut bad = 0.0f64;
            let mut all = 0.0f64;
            for k in 1..n / 2 {
                let freq = k as f32 * sr / n as f32;
                let (mut re, mut im) = (0.0f64, 0.0f64);
                for (i, &x) in sig.iter().enumerate() {
                    let w = 0.5 - 0.5 * (TAU * i as f32 / n as f32).cos();
                    let a = -std::f64::consts::TAU * (k * i) as f64 / n as f64;
                    re += (x * w) as f64 * a.cos();
                    im += (x * w) as f64 * a.sin();
                }
                let p = re * re + im * im;
                all += p;
                let h = freq / f;
                if (h - h.round()).abs() * f > 200.0 {
                    bad += p;
                }
            }
            bad / all
        };
        let a = inharmonic(&blep);
        let b = inharmonic(&naive);
        assert!(a < b * 0.5, "blep {a} naive {b}");
        let _ = high_band_ratio; // kept for other tests
    }
}
