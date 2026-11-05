//! Band-limited oscillators (PolyBLEP). Run inside a 2x oversampled voice, so what
//! aliasing PolyBLEP leaves lands above the audible band and the decimator removes it.

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

/// Minimum-phase band-limited steps (minBLEP, Eli Brandt, "Hard Sync Without Aliasing", ICMC 2001).
///
/// The sound shootout (design/sound-shootout.md, 5 Nov) measured our PolyBLEP saw at -56 dB of energy off
/// its harmonics at note 84 and -49 dB at note 108, against -77 to -91 dB for Surge XT and Vitalium. PolyBLEP
/// corrects one sample either side of each jump; a minBLEP corrects the whole band-limited step: a windowed
/// sinc (12 zero crossings, Blackman-Harris), made minimum phase through its real cepstrum so it needs no
/// look-ahead (no added latency), integrated into a step, and stored as the step's difference from an ideal
/// one, 64 points a sample. At the voice's 96 kHz the step is flat to about 30 kHz and gone above 64 kHz, so
/// nothing folds back under 24 kHz, where the decimator keeps the audio.
pub struct MinBlep {
    /// The step's residual, (MB_LEN * MB_OS + 1) points.
    res: Vec<f32>,
    /// The residual's sum over one jump (in samples), for the saw's dc: a minimum-phase step arrives a
    /// little late, so the ramp it sits on needs the same small offset.
    pub dc: f32,
}

/// Samples a step's correction lasts, and table points per sample.
pub const MB_LEN: usize = 24;
const MB_OS: usize = 64;
const MB_ZC: usize = 12;

impl MinBlep {
    fn build() -> Self {
        use super::wavetable::ifft;
        let n = 2 * MB_ZC * MB_OS + 1;
        let m = 1 << 15;
        let mut re = vec![0.0f64; m];
        let mut im = vec![0.0f64; m];
        // Windowed sinc, zero crossings every MB_OS points (one sample), Blackman-Harris.
        for i in 0..n {
            let x = (i as f64 - (n - 1) as f64 / 2.0) / MB_OS as f64;
            let s = if x.abs() < 1e-12 { 1.0 } else { (std::f64::consts::PI * x).sin() / (std::f64::consts::PI * x) };
            let t = std::f64::consts::TAU * i as f64 / (n - 1) as f64;
            let w = 0.35875 - 0.48829 * t.cos() + 0.14128 * (2.0 * t).cos() - 0.01168 * (3.0 * t).cos();
            re[i] = s * w;
        }
        // Forward FFT through the inverse one: conj, ifft, conj.
        let fft = |re: &mut [f64], im: &mut [f64]| {
            for v in im.iter_mut() {
                *v = -*v;
            }
            ifft(re, im);
            for v in im.iter_mut() {
                *v = -*v;
            }
        };
        fft(&mut re, &mut im);
        // Real cepstrum of the log magnitude.
        for k in 0..m {
            let mag = (re[k] * re[k] + im[k] * im[k]).sqrt().max(1e-100);
            re[k] = mag.ln();
            im[k] = 0.0;
        }
        ifft(&mut re, &mut im);
        for k in 0..m {
            re[k] /= m as f64;
            im[k] = 0.0;
        }
        // Fold: keep c[0] and c[m/2], double the causal half, drop the rest.
        for k in 1..m / 2 {
            re[k] *= 2.0;
        }
        for k in m / 2 + 1..m {
            re[k] = 0.0;
        }
        fft(&mut re, &mut im);
        // exp of the complex spectrum, back to time: the minimum-phase impulse.
        for k in 0..m {
            let (a, b) = (re[k].exp(), im[k]);
            re[k] = a * b.cos();
            im[k] = a * b.sin();
        }
        ifft(&mut re, &mut im);
        let len = MB_LEN * MB_OS + 1;
        let imp: Vec<f64> = (0..len).map(|i| re[i] / m as f64).collect();
        // Integrate into a step that ends at 1.
        let total: f64 = imp.iter().sum();
        let mut acc = 0.0;
        let res: Vec<f32> = imp.iter().map(|v| { acc += v / total; (acc - 1.0) as f32 }).collect();
        let dc = (0..MB_LEN).map(|k| res[k * MB_OS] as f64).sum::<f64>() as f32;
        MinBlep { res, dc }
    }

    pub fn get() -> &'static MinBlep {
        static T: std::sync::OnceLock<MinBlep> = std::sync::OnceLock::new();
        T.get_or_init(MinBlep::build)
    }

    /// The residual `t` samples after the jump (0 <= t < MB_LEN).
    #[inline]
    fn at(&self, t: f32) -> f32 {
        let x = t * MB_OS as f32;
        let i = x as usize;
        if i >= MB_LEN * MB_OS {
            return 0.0;
        }
        let f = x - i as f32;
        self.res[i] + (self.res[i + 1] - self.res[i]) * f
    }
}

/// A saw and a pulse from one phase, band-limited with minBLEPs: the same waves as `BlepOsc` (saw from -1
/// up to 1, pulse +1 then -1 at the pulse width), much cleaner on high notes. Each jump adds its correction
/// to the next MB_LEN samples of a small ring.
#[derive(Clone, Copy)]
pub struct MinBlepOsc {
    pub phase: f32,
    pw: f32,
    saw: [f32; MB_LEN],
    sq: [f32; MB_LEN],
    at: usize,
    tab: &'static MinBlep,
    /// The pulse's corrections are being kept (`next_saw` skips them, for a saw alone).
    sq_live: bool,
}

impl MinBlepOsc {
    pub fn new() -> Self {
        MinBlepOsc { phase: 0.0, pw: 0.5, saw: [0.0; MB_LEN], sq: [0.0; MB_LEN], at: 0, tab: MinBlep::get(), sq_live: true }
    }

    /// Jump to a phase: the corrections still pending from before are dropped, as a reset oscillator's are.
    pub fn reset(&mut self, phase: f32) {
        self.phase = phase;
        self.saw = [0.0; MB_LEN];
        self.sq = [0.0; MB_LEN];
    }

    pub fn set_pulse_width(&mut self, pw: f32) {
        self.pw = pw.clamp(0.05, 0.95);
    }

    #[inline]
    fn add(buf: &mut [f32; MB_LEN], at: usize, tab: &MinBlep, frac: f32, jump: f32) {
        for k in 0..MB_LEN {
            let j = at + k;
            let j = if j >= MB_LEN { j - MB_LEN } else { j };
            buf[j] += jump * tab.at(k as f32 + frac);
        }
    }

    /// The saw alone: the same samples as `next(dt).0`, without the pulse's work.
    #[inline]
    pub fn next_saw(&mut self, dt: f32) -> f32 {
        let dt = dt.clamp(0.0, 0.49);
        self.sq_live = false;
        let t = self.phase;
        let i = self.at;
        let saw = 2.0 * t - 1.0 + self.saw[i] + (2.0 * self.tab.dc + 1.0) * dt;
        self.saw[i] = 0.0;
        self.at = if i + 1 >= MB_LEN { 0 } else { i + 1 };
        let next = t + dt;
        if next >= 1.0 && dt > 0.0 {
            Self::add(&mut self.saw, self.at, self.tab, (next - 1.0) / dt, -2.0);
        }
        self.phase = if next >= 1.0 { next - 1.0 } else { next };
        saw
    }

    /// The synths' wave knob: saw into pulse by `w` (pulse at 0.8). At 0 the pulse isn't worked out.
    #[inline]
    pub fn next_mix(&mut self, dt: f32, w: f32) -> f32 {
        if w <= 0.0 {
            return self.next_saw(dt);
        }
        let (saw, sq) = self.next(dt);
        saw * (1.0 - w) + sq * w * 0.8
    }

    /// Returns (saw, square) for this sample and advances. `dt` = freq / sample rate.
    #[inline]
    pub fn next(&mut self, dt: f32) -> (f32, f32) {
        if !self.sq_live {
            // The pulse was skipped: start its corrections afresh.
            self.sq = [0.0; MB_LEN];
            self.sq_live = true;
        }
        let dt = dt.clamp(0.0, 0.49);
        let t = self.phase;
        let i = self.at;
        // The ramp carries the step's small lateness (see MinBlep::dc), and sampling a ramp at the start of
        // each step reads it half a step low: both offsets taken off, so the saw has no dc.
        let saw = 2.0 * t - 1.0 + self.saw[i] + (2.0 * self.tab.dc + 1.0) * dt;
        let sq = (if t < self.pw { 1.0 } else { -1.0 }) + self.sq[i];
        self.saw[i] = 0.0;
        self.sq[i] = 0.0;
        self.at = if i + 1 >= MB_LEN { 0 } else { i + 1 };
        // Advance, and place the jumps that happen before the next sample.
        let next = t + dt;
        if dt > 0.0 {
            if t < self.pw && next >= self.pw {
                // The pulse falls from +1 to -1, (next - pw) / dt samples before the next sample.
                Self::add(&mut self.sq, self.at, self.tab, (next - self.pw) / dt, -2.0);
            }
            if next >= 1.0 {
                let after = next - 1.0;
                let frac = after / dt;
                // The saw falls by 2, the pulse rises by 2 (it is back under the width).
                Self::add(&mut self.saw, self.at, self.tab, frac, -2.0);
                Self::add(&mut self.sq, self.at, self.tab, frac, 2.0);
                if after >= self.pw {
                    Self::add(&mut self.sq, self.at, self.tab, (after - self.pw) / dt, -2.0);
                }
            }
        }
        self.phase = if next >= 1.0 { next - 1.0 } else { next };
        (saw, sq)
    }
}

impl Default for MinBlepOsc {
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
        let s = super::sin_cycle(self.phase);
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
    use crate::dsp::TAU;

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
