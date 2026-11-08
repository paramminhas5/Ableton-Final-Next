//! Zero-delay-feedback filters (topology-preserving transform, after Zavalishin,
//! "The Art of VA Filter Design"). They keep their shape all the way up to Nyquist and
//! can be modulated every sample without blowing up.

use super::{flush_denormal, PI};

#[inline]
fn prewarp(fc: f32, sr: f32) -> f32 {
    super::fast_tan(PI * (fc / sr).clamp(1e-5, 0.49))
}

/// State-variable filter. One instance gives low, band and high pass at once.
#[derive(Clone, Copy, Default)]
pub struct Svf {
    s1: f32,
    s2: f32,
    g: f32,
    k: f32,
    a1: f32,
    a2: f32,
    a3: f32,
}

pub struct SvfOut {
    pub lp: f32,
    pub bp: f32,
    pub hp: f32,
}

impl Svf {
    /// `q` around 0.707 is flat; higher rings.
    pub fn set(&mut self, fc: f32, q: f32, sr: f32) {
        self.g = prewarp(fc, sr);
        self.k = 1.0 / q.max(0.05);
        self.a1 = 1.0 / (1.0 + self.g * (self.g + self.k));
        self.a2 = self.g * self.a1;
        self.a3 = self.g * self.a2;
    }

    pub fn reset(&mut self) {
        self.s1 = 0.0;
        self.s2 = 0.0;
    }

    #[inline]
    pub fn tick(&mut self, x: f32) -> SvfOut {
        let v3 = x - self.s2;
        let v1 = self.a1 * self.s1 + self.a2 * v3;
        let v2 = self.s2 + self.a2 * self.s1 + self.a3 * v3;
        self.s1 = flush_denormal(2.0 * v1 - self.s1);
        self.s2 = flush_denormal(2.0 * v2 - self.s2);
        SvfOut { lp: v2, bp: v1, hp: x - self.k * v1 - v2 }
    }

    #[inline]
    pub fn k(&self) -> f32 {
        self.k
    }
}

/// Shelving and bell EQ built from the SVF outputs (gain in dB).
#[derive(Clone, Copy, Default)]
pub struct EqBand {
    svf: Svf,
    mode: u8, // 0 low shelf, 1 bell, 2 high shelf
    a: f32,
}

impl EqBand {
    pub fn low_shelf() -> Self {
        EqBand { mode: 0, a: 1.0, ..Default::default() }
    }
    pub fn bell() -> Self {
        EqBand { mode: 1, a: 1.0, ..Default::default() }
    }
    pub fn high_shelf() -> Self {
        EqBand { mode: 2, a: 1.0, ..Default::default() }
    }

    pub fn set(&mut self, fc: f32, q: f32, gain_db: f32, sr: f32) {
        self.a = (gain_db * 0.057_564_63).exp(); // 10^(dB/40)
        // Shelves place the corner so the half-gain point stays at fc.
        let f = match self.mode {
            0 => fc / self.a.sqrt(),
            2 => fc * self.a.sqrt(),
            _ => fc,
        };
        // Bell: widen the band as it boosts so the curve is symmetric in dB (k = 1/(Q*A)).
        let q = if self.mode == 1 { q * self.a } else { q };
        self.svf.set(f, q, sr);
    }

    #[inline]
    pub fn tick(&mut self, x: f32) -> f32 {
        let o = self.svf.tick(x);
        let k = self.svf.k();
        let a = self.a;
        match self.mode {
            0 => x + (a * a - 1.0) * o.lp + (a - 1.0) * k * o.bp,
            2 => x + (a * a - 1.0) * o.hp + (a - 1.0) * k * o.bp,
            _ => x + (a * a - 1.0) * k * o.bp,
        }
    }
}

/// 4-pole transistor-ladder low pass with resolved zero-delay feedback.
/// Resonance 0..1 maps to feedback 0..4.1, so the top of the knob self-oscillates.
/// A soft clip on the feedback path keeps self-oscillation musical and bounded.
///
/// Since the sound shootout (5 Nov) the soft clip is anti-aliased: with the filter open, a bright high note
/// through the clip made harmonics past the voice's Nyquist that folded back into the audible band, -55 dB
/// of the sound at note 108. Only what the clip takes away from a straight line (clip(u) - u) goes through
/// first-order ADAA (its average over each step), so small signals pass with no added delay and the
/// resonance is where it was; the distortion, where the aliasing comes from, is averaged.
///
/// Round 2 of the shootout (8 Nov): a synth voice's ladder can run second-order ADAA (Bilbao, Esqueda,
/// Parker and Valimaki, "Antiderivative antialiasing for memoryless nonlinearities", IEEE SPL 2017) on the
/// same residual, at twice the voice's rate (`CharFilter::set_oversampled`): at note 108 with the filter
/// open, -67 dB off the harmonics before, -79 after (tests/gaps.rs).
#[derive(Clone, Copy)]
pub struct Ladder {
    s: [f32; 4],
    g: f32,
    g1: f32,
    k: f32,
    comp: f32,
    /// The clip's last two inputs, and whether the residual takes second-order ADAA.
    u1: f32,
    u2: f32,
    order2: bool,
    /// Second-order ADAA's memory: the second antiderivative at the last input and the last divided
    /// difference, so each fast step works out one new antiderivative instead of three (same numbers).
    f2_1: f64,
    d_1: f64,
    memo: bool,
}

impl Default for Ladder {
    fn default() -> Self {
        Ladder { s: [0.0; 4], g: 0.0, g1: 0.0, k: 0.0, comp: 1.0, u1: 0.0, u2: 0.0, order2: false, f2_1: 0.0, d_1: 0.0, memo: false }
    }
}

/// The same antiderivative in f64 (second-order ADAA divides differences of it).
#[inline]
fn clip_residual_ad64(x: f64) -> f64 {
    let a = x.abs();
    let at = |v: f64| v * v / 18.0 + (4.0 / 3.0) * (v * v / 3.0).ln_1p();
    let f = if a <= 3.0 { at(a) } else { at(3.0) + (a - 3.0) };
    f - 0.5 * x * x
}

/// The second antiderivative of clip(x) - x (odd): on |x| <= 3, -4 x^3 / 27 + 4/3 (x ln(1 + x^2/3) - 2x +
/// 2 sqrt(3) atan(x / sqrt(3))); past 3 the first antiderivative is a quadratic, integrated on from there.
#[inline]
fn clip_residual_ad2(x: f64) -> f64 {
    let a = x.abs();
    let s3 = 1.732_050_807_568_877_2f64;
    let g = |t: f64| -4.0 * t * t * t / 27.0 + (4.0 / 3.0) * (t * (t * t / 3.0).ln_1p() - 2.0 * t + 2.0 * s3 * (t / s3).atan());
    let at3 = 0.5 + (4.0 / 3.0) * 4f64.ln();
    let v = if a <= 3.0 { g(a) } else { g(3.0) + at3 * (a - 3.0) + 0.5 * (a - 3.0) * (a - 3.0) - (a * a * a - 27.0) / 6.0 };
    if x < 0.0 { -v } else { v }
}

/// Antiderivative of what the soft clip takes from a straight line, clip(x) - x. The clip is
/// x (27 + x^2) / (27 + 9 x^2) = x / 9 + 24 x / (9 x^2 + 27), whose antiderivative is
/// x^2 / 18 + 4/3 ln(1 + x^2 / 3) (less its value at 0); past the clamp at 3 the clip is flat at 1.
#[inline]
fn clip_residual_ad(x: f32) -> f32 {
    let a = x.abs();
    let at = |v: f32| v * v / 18.0 + (4.0 / 3.0) * (v * v / 3.0).ln_1p();
    let f = if a <= 3.0 { at(a) } else { at(3.0) + (a - 3.0) };
    f - 0.5 * x * x
}

/// The divided difference of the second antiderivative between `p` (whose antiderivative is `fp`) and `q`.
#[inline]
fn d1_of(p: f64, fp: f64, q: f64, fq: f64) -> f64 {
    if (p - q).abs() > 1e-4 { (fp - fq) / (p - q) } else { clip_residual_ad64(0.5 * (p + q)) }
}

impl Ladder {
    /// Second-order ADAA of the residual over the last three inputs: the residual's average under a triangle
    /// centred on the middle one (so a sample of delay on the residual only).
    #[inline]
    fn residual_adaa2(&mut self, x0: f32) -> f32 {
        let (x1, x2) = (self.u1, self.u2);
        // Slow steps: the triangle's average is the residual at the triangle's centre of mass to within -110 dB.
        if (x0 - x1).abs() <= 0.01 && (x1 - x2).abs() <= 0.01 {
            self.memo = false;
            let m = 0.25 * (x0 + 2.0 * x1 + x2);
            return super::soft_clip(m) - m;
        }
        let (a, b, c) = (x0 as f64, x1 as f64, x2 as f64);
        let fa = clip_residual_ad2(a);
        let fb = if self.memo { self.f2_1 } else { clip_residual_ad2(b) };
        let dab = d1_of(a, fa, b, fb);
        let dbc = if self.memo { self.d_1 } else { d1_of(b, fb, c, clip_residual_ad2(c)) };
        self.f2_1 = fa;
        self.d_1 = dab;
        self.memo = true;
        let r = if (a - c).abs() > 1e-4 {
            2.0 / (a - c) * (dab - dbc)
        } else {
            // x0 and x2 meet: the paper's fallback around their mean.
            let m = 0.5 * (a + c);
            let dl = m - b;
            if dl.abs() > 1e-4 {
                2.0 / dl * (clip_residual_ad64(m) + (fb - clip_residual_ad2(m)) / dl)
            } else {
                let q = 0.5 * (m + b);
                super::soft_clip(q as f32) as f64 - q
            }
        };
        r as f32
    }
}

impl Ladder {
    pub fn set(&mut self, fc: f32, res: f32, sr: f32) {
        self.g = prewarp(fc, sr);
        self.g1 = self.g / (1.0 + self.g);
        let r = res.clamp(0.0, 1.0);
        self.k = 4.1 * r * r.sqrt().max(r);
        // Classic ladders lose bass as resonance rises. Give some back.
        self.comp = 1.0 + 0.55 * self.k;
    }

    pub fn reset(&mut self) {
        self.s = [0.0; 4];
        self.u1 = 0.0;
        self.u2 = 0.0;
        self.memo = false;
    }

    #[inline]
    pub fn tick(&mut self, x: f32) -> f32 {
        let g1 = self.g1;
        let d = 1.0 / (1.0 + self.g);
        // Instantaneous response of the 4 stages to their states.
        let big_g = g1 * g1 * g1 * g1;
        let s_sum = g1 * g1 * g1 * self.s[0] * d + g1 * g1 * self.s[1] * d + g1 * self.s[2] * d + self.s[3] * d;
        // Solve the feedback loop, then saturate what goes in.
        let u = (x * self.comp - self.k * s_sum) / (1.0 + self.k * big_g);
        // When the input barely moves, the average over the step is the midpoint's value to within
        // -110 dB, so the logs are only worked out on fast steps (high notes, edges): most samples skip them.
        let r = if self.order2 {
            self.residual_adaa2(u)
        } else {
            let du = u - self.u1;
            if du.abs() > 0.01 { (clip_residual_ad(u) - clip_residual_ad(self.u1)) / du } else { let m = 0.5 * (u + self.u1); super::soft_clip(m) - m }
        };
        let mut y = u + r;
        self.u2 = self.u1;
        self.u1 = u;
        for st in self.s.iter_mut() {
            let v = (y - *st) * g1;
            let out = v + *st;
            *st = flush_denormal(out + v);
            y = out;
        }
        y
    }
}

/// MS-20 style low pass (the Korg35 Sallen-Key circuit), zero-delay feedback: two one-pole low passes
/// with positive feedback from the output through a one-pole high pass, so the loop peaks right at the
/// cutoff. Resonance 0..1 maps to loop gain 0..2.05: it self-oscillates near the top. A soft clipper in
/// the loop (where the MS-20 has its diodes) bounds it, and is what makes it scream when pushed. Unlike
/// the ladder it keeps its bass as the resonance rises. 12 dB per octave.
#[derive(Clone, Copy, Default)]
pub struct Ms20 {
    s1: f32,
    s2: f32,
    sh: f32,
    big_g: f32,
    k: f32,
}

impl Ms20 {
    pub fn set(&mut self, fc: f32, res: f32, sr: f32) {
        let g = prewarp(fc, sr);
        self.big_g = g / (1.0 + g);
        self.k = 2.05 * res.clamp(0.0, 1.0);
    }

    pub fn reset(&mut self) {
        self.s1 = 0.0;
        self.s2 = 0.0;
        self.sh = 0.0;
    }

    #[inline]
    pub fn tick(&mut self, x: f32) -> f32 {
        let gg = self.big_g;
        let ig = 1.0 - gg;
        let k = self.k;
        // First low pass: outside the loop.
        let v1 = (x - self.s1) * gg;
        let y1 = v1 + self.s1;
        self.s1 = flush_denormal(y1 + v1);
        // Solve the loop (input of the second low pass), then clip it.
        let u = (y1 + ig * (k * ig * self.s2 - self.sh)) / (1.0 - k * gg * ig);
        let u = super::sat(u);
        let v2 = (u - self.s2) * gg;
        let lp = v2 + self.s2;
        self.s2 = flush_denormal(lp + v2);
        // The high pass in the feedback path hears the loop's output.
        let y = k * lp;
        let vh = (y - self.sh) * gg;
        let lph = vh + self.sh;
        self.sh = flush_denormal(lph + vh);
        lp
    }
}

/// The three filter characters a synth can pick (`params::step3` of its character knob).
pub const WARM: u8 = 0;
pub const SCREAM: u8 = 1;
pub const SMOOTH: u8 = 2;

/// One of three low passes, chosen by character: warm (the 4-pole transistor ladder, loses bass as the
/// resonance rises), scream (MS-20 style, 2-pole, screams when driven) or smooth (an Oberheim SEM style
/// 2-pole state-variable filter: sweet, keeps its bass, rings but never self-oscillates).
#[derive(Clone, Copy, Default)]
pub struct CharFilter {
    mode: u8,
    ladder: Ladder,
    ms20: Ms20,
    sem: Svf,
    /// Round 2 (8 Nov): run at twice the rate it is given (a synth voice: 192 kHz), every circuit, so the
    /// delay is the same whichever is picked; the ladder's clip then takes second-order ADAA.
    os2: bool,
    up: super::oversample::Interpolator2x,
    dn: super::oversample::Decimator2x,
}

impl CharFilter {
    pub fn set_mode(&mut self, m: u8) {
        if m != self.mode {
            self.mode = m;
            self.ladder.reset();
            self.ms20.reset();
            self.sem.reset();
        }
    }

    pub fn mode(&self) -> u8 {
        self.mode
    }

    /// Run at twice the rate `set` is given (see the struct). Its delay grows by `OS2_DELAY` samples at that rate.
    pub fn set_oversampled(&mut self, on: bool) {
        self.os2 = on;
        self.ladder.order2 = on;
    }

    pub fn oversampled(&self) -> bool {
        self.os2
    }

    /// Second-order ADAA on the ladder's clip, at the rate it is given.
    pub fn set_adaa2(&mut self, on: bool) {
        self.ladder.order2 = on;
    }

    pub fn reset(&mut self) {
        self.ladder.reset();
        self.ms20.reset();
        self.sem.reset();
        if self.os2 {
            self.up = Default::default();
            self.dn = Default::default();
        }
    }

    #[inline]
    pub fn set(&mut self, fc: f32, res: f32, sr: f32) {
        let sr = if self.os2 { sr * 2.0 } else { sr };
        match self.mode {
            SCREAM => self.ms20.set(fc, res, sr),
            SMOOTH => {
                let r = res.clamp(0.0, 1.0);
                self.sem.set(fc, 0.55 + 9.0 * r * r, sr)
            }
            _ => self.ladder.set(fc, res, sr),
        }
    }

    #[inline]
    pub fn tick(&mut self, x: f32) -> f32 {
        if self.os2 {
            let (a, b) = self.up.process(x);
            let (ya, yb) = (self.tick1(a), self.tick1(b));
            return self.dn.process(ya, yb);
        }
        self.tick1(x)
    }

    #[inline]
    fn tick1(&mut self, x: f32) -> f32 {
        match self.mode {
            // Gains so the three sit at about the same loudness on a bass line (tests/sound.rs).
            SCREAM => self.ms20.tick(x) * MS20_GAIN,
            SMOOTH => self.sem.tick(x).lp * SEM_GAIN,
            _ => self.ladder.tick(x),
        }
    }
}

/// What running at twice the rate adds to a filter's delay, in samples at the rate it is given.
pub const OS2_DELAY: f64 = super::oversample::DRIVE_DELAY;
const MS20_GAIN: f32 = 0.794;
const SEM_GAIN: f32 = 0.668;

/// Drive into a filter, the way Drift does it: an asymmetric, anti-aliased saturator (it adds even
/// harmonics as well as odd), and a second, gentler stage after the filter that takes up to 6 dB of
/// gain, so resonant peaks round off instead of spiking. At zero both are bypassed exactly.
#[derive(Clone, Copy, Default)]
pub struct FilterDrive {
    pre: super::Adaa,
    post: super::Adaa,
}

/// Offset into the first stage: makes it asymmetric.
const BIAS: f32 = 0.35;

impl FilterDrive {
    /// Before the filter. `amt` 0..1 is up to +24 dB into the saturator, level-matched.
    #[inline]
    pub fn pre(&mut self, x: f32, amt: f32) -> f32 {
        if amt <= 0.001 {
            return x;
        }
        let g = 1.0 + amt * amt * 15.0;
        // Matched on the swing of a half-scale sine, both sides (the offset squashes one more).
        // and squared off it carries more power, so a little less as the knob goes up.
        let makeup = 1.0 / ((super::sat(0.5 * g + BIAS) - super::sat(BIAS - 0.5 * g)) * (1.0 + 0.4 * amt));
        (self.pre.process(x * g + BIAS) - super::sat(BIAS)) * makeup
    }

    /// After the filter: up to +6 dB into a soft saturator, then back down.
    #[inline]
    pub fn post(&mut self, y: f32, amt: f32) -> f32 {
        if amt <= 0.001 {
            return y;
        }
        let g = 1.0 + amt;
        self.post.process(y * g) / g
    }

    pub fn reset(&mut self) {
        self.pre.reset();
        self.post.reset();
    }
}

/// One-pole high pass, for DC blocking and low cut.
#[derive(Clone, Copy, Default)]
pub struct OnePoleHp {
    s: f32,
    g: f32,
}

impl OnePoleHp {
    pub fn set(&mut self, fc: f32, sr: f32) {
        let g = prewarp(fc, sr);
        self.g = g / (1.0 + g);
    }
    #[inline]
    pub fn tick(&mut self, x: f32) -> f32 {
        let v = (x - self.s) * self.g;
        let lp = v + self.s;
        self.s = flush_denormal(lp + v);
        x - lp
    }
}

/// One-pole low pass, for tone controls and smoothing audio-rate signals.
#[derive(Clone, Copy, Default)]
pub struct OnePoleLp {
    s: f32,
    g: f32,
}

impl OnePoleLp {
    pub fn set(&mut self, fc: f32, sr: f32) {
        let g = prewarp(fc, sr);
        self.g = g / (1.0 + g);
    }
    #[inline]
    pub fn tick(&mut self, x: f32) -> f32 {
        let v = (x - self.s) * self.g;
        let lp = v + self.s;
        self.s = flush_denormal(lp + v);
        lp
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::dsp::osc::Sine;

    fn rms_through(mut f: impl FnMut(f32) -> f32, freq: f32, sr: f32) -> f32 {
        let mut s = Sine::default();
        let n = (sr * 0.5) as usize;
        let mut acc = 0.0;
        for i in 0..n {
            let y = f(s.next(freq / sr));
            if i > n / 2 {
                acc += y * y;
            }
        }
        (acc / (n / 2) as f32).sqrt()
    }

    #[test]
    fn ladder_passes_lows_and_cuts_highs() {
        let sr = 96_000.0;
        let mut l = Ladder::default();
        l.set(500.0, 0.0, sr);
        let low = rms_through(|x| l.tick(x * 0.3), 60.0, sr);
        l.reset();
        let high = rms_through(|x| l.tick(x * 0.3), 8_000.0, sr);
        assert!(low > 0.15, "low {low}");
        assert!(high < low * 0.01, "24 dB/oct should crush 8k: {high} vs {low}");
    }

    #[test]
    fn ladder_self_oscillates_bounded() {
        let sr = 96_000.0;
        let mut l = Ladder::default();
        l.set(1000.0, 1.0, sr);
        let mut peak = 0.0f32;
        let mut y = l.tick(0.1);
        for _ in 0..sr as usize {
            y = l.tick(0.0);
            peak = peak.max(y.abs());
        }
        assert!(y.is_finite());
        assert!(peak > 0.05, "should ring at full res, peak {peak}");
        assert!(peak < 4.0, "bounded, peak {peak}");
    }

    #[test]
    fn eq_bell_boosts_by_gain() {
        let sr = 48_000.0;
        let mut b = EqBand::bell();
        b.set(1000.0, 0.7, 6.0, sr);
        let g = rms_through(|x| b.tick(x), 1000.0, sr) / (0.5f32).sqrt();
        let db = 20.0 * g.log10();
        assert!((db - 6.0).abs() < 0.6, "bell gave {db} dB");
    }

    #[test]
    fn low_shelf_flat_at_zero_db() {
        let sr = 48_000.0;
        let mut b = EqBand::low_shelf();
        b.set(120.0, 0.707, 0.0, sr);
        let g = rms_through(|x| b.tick(x), 80.0, sr) / (0.5f32).sqrt();
        assert!((g - 1.0).abs() < 0.02);
    }
}
