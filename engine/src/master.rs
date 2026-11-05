//! Master bus: a program-dependent glue compressor, the out fader, and a true-peak
//! limiter that estimates the signal between samples (at 8x, beyond the 4x that
//! ITU-R BS.1770 asks for) so peaks between samples never pass the ceiling.
//! Replaces the old safety clip.
//!
//! Order: sum -> trim -> glue -> out fader -> limiter -> out.

use crate::dsp::filter::Svf;
use crate::dsp::smooth::Smooth;
use crate::dsp::tau_coef;
use crate::params::{db_to_gain, fader_gain, FADER_UNITY};

/// Ceiling, in dB true peak. -1 dBTP is what streaming services ask for.
pub const CEILING_DB: f32 = -1.0;
/// Oversampling of the peak estimator. The spec (ITU-R BS.1770) asks for at least 4x;
/// a 4x reading can still miss up to 0.7 dB on content near the top of the band.
pub const TP_OS: usize = OS_FACTOR;
const OS_FACTOR: usize = 8;
/// Taps per phase of the peak estimator.
const TP_TAPS: usize = 16;
/// The estimator looks this many samples ahead of the point it measures.
pub const TP_DELAY: usize = TP_TAPS / 2;
/// Length of the gain's box smoothing, in samples. Short on purpose: everything you
/// play goes through the master, so it is part of touch-to-sound.
pub const LOOKAHEAD: usize = 8;
/// The gain on a sample must also be low enough for peaks this many samples either
/// side of it: an inter-sample peak is built from its neighbours.
const REACH: usize = 3;
const MIN_WIN: usize = LOOKAHEAD + 1 + 2 * REACH;
/// Total delay the master adds, in samples (0.375 ms at 48 kHz).
pub const MASTER_DELAY: usize = TP_DELAY + LOOKAHEAD + REACH - 1;
/// Fixed trim on the sum, as before (the old safety stage ran at 0.85).
const TRIM: f32 = 0.85;

/// Kaiser-windowed sinc for the fractional positions 1/8 .. 7/8.
fn tp_phases() -> [[f32; TP_TAPS]; OS_FACTOR - 1] {
    fn bessel_i0(x: f64) -> f64 {
        let (mut sum, mut term, mut k) = (1.0, 1.0, 1.0);
        while term > 1e-12 * sum {
            term *= (x / (2.0 * k)) * (x / (2.0 * k));
            sum += term;
            k += 1.0;
        }
        sum
    }
    let beta = 6.0;
    let half = TP_DELAY as f64 + 0.5;
    let mut out = [[0.0f32; TP_TAPS]; OS_FACTOR - 1];
    for (p, row) in out.iter_mut().enumerate() {
        let frac = (p + 1) as f64 / OS_FACTOR as f64;
        let mut taps = [0.0f64; TP_TAPS];
        for (k, t) in taps.iter_mut().enumerate() {
            // History slot k holds the sample k back from the newest; the point we want
            // sits TP_DELAY back plus `frac` forward.
            let d = k as f64 - TP_DELAY as f64 + frac;
            let sinc = if d.abs() < 1e-12 { 1.0 } else { (std::f64::consts::PI * d).sin() / (std::f64::consts::PI * d) };
            let r = d / half;
            let w = if r.abs() >= 1.0 { 0.0 } else { bessel_i0(beta * (1.0 - r * r).sqrt()) / bessel_i0(beta) };
            *t = sinc * w;
        }
        let s: f64 = taps.iter().sum();
        for (k, t) in taps.iter().enumerate() {
            row[k] = (t / s) as f32;
        }
    }
    out
}

/// True-peak estimate of a stereo signal: the largest of the sample and the seven
/// points between it and the next, on either channel. Reports `TP_DELAY` late.
#[derive(Clone)]
pub struct TruePeak {
    taps: [[f32; TP_TAPS]; OS_FACTOR - 1],
    hl: [f32; TP_TAPS * 2],
    hr: [f32; TP_TAPS * 2],
    pos: usize,
}

impl TruePeak {
    pub fn new() -> Self {
        TruePeak { taps: tp_phases(), hl: [0.0; TP_TAPS * 2], hr: [0.0; TP_TAPS * 2], pos: 0 }
    }

    #[inline]
    pub fn push(&mut self, l: f32, r: f32) -> f32 {
        self.pos = if self.pos == 0 { TP_TAPS - 1 } else { self.pos - 1 };
        self.hl[self.pos] = l;
        self.hl[self.pos + TP_TAPS] = l;
        self.hr[self.pos] = r;
        self.hr[self.pos + TP_TAPS] = r;
        let wl = &self.hl[self.pos..self.pos + TP_TAPS];
        let wr = &self.hr[self.pos..self.pos + TP_TAPS];
        let mut m = wl[TP_DELAY].abs().max(wr[TP_DELAY].abs());
        for ph in &self.taps {
            let (mut a, mut b) = (0.0f32, 0.0f32);
            for k in 0..TP_TAPS {
                a += wl[k] * ph[k];
                b += wr[k] * ph[k];
            }
            m = m.max(a.abs()).max(b.abs());
        }
        m
    }
}

impl Default for TruePeak {
    fn default() -> Self {
        Self::new()
    }
}

/// Bus compressor in the manner of the classic console bus compressors. Feed-forward, stereo-linked,
/// soft knee, with a choice of three ratios (2, 4 and 10 to 1). The release follows the music: short
/// hits let go fast, sustained compression lets go slowly (auto release, two envelopes). The detector
/// listens through a steep high-pass (the sidechain cut), so the kick's low end does not pull the whole mix
/// down on every beat, and a mix knob blends the compressed bus with the dry one (parallel compression).
pub struct Glue {
    amount: f32,
    ratio: f32,
    sr: f32,
    sc_hz: f32,
    hp_l: [Svf; 2],
    hp_r: [Svf; 2],
    mix: Smooth,
    ms: f32,
    ms_coef: f32,
    fast: f32,
    slow: f32,
    fa: f32,
    fr: f32,
    sa: f32,
    sr_: f32,
    /// Gain reduction right now, dB (positive).
    pub gr_db: f32,
}

/// The ratios the ratio switch steps through.
pub const GLUE_RATIOS: [f32; 3] = [2.0, 4.0, 10.0];
pub fn glue_ratio(n: f32) -> f32 {
    GLUE_RATIOS[(n.clamp(0.0, 1.0) * 2.0).round() as usize]
}
/// The sidechain cut is off at the bottom of its knob.
pub const SC_OFF_HZ: f32 = 21.0;

impl Glue {
    pub fn new(sr: f32) -> Self {
        let mut mix = Smooth::new(1.0);
        mix.set_time(15.0, sr);
        Glue {
            amount: 0.0,
            ratio: 2.0,
            sr,
            sc_hz: 20.0,
            hp_l: [Svf::default(); 2],
            hp_r: [Svf::default(); 2],
            mix,
            ms: 0.0,
            ms_coef: tau_coef(0.005, sr),
            fast: 0.0,
            slow: 0.0,
            fa: tau_coef(0.010, sr),
            fr: tau_coef(0.120, sr),
            sa: tau_coef(0.400, sr),
            sr_: tau_coef(1.200, sr),
            gr_db: 0.0,
        }
    }

    pub fn set_amount(&mut self, a: f32) {
        self.amount = a.clamp(0.0, 1.0);
    }

    pub fn set_ratio(&mut self, r: f32) {
        self.ratio = r.max(1.0);
    }

    /// High-pass on what the compressor listens to, Hz. At or under `SC_OFF_HZ` it hears everything.
    pub fn set_sidechain(&mut self, hz: f32) {
        self.sc_hz = hz;
        if hz > SC_OFF_HZ {
            // Fourth-order Butterworth (24 dB per octave): a kick's 50 Hz body reaches the detector
            // about 20 dB down from a 90 Hz cut, while a chord at 200 Hz and up is heard in full.
            for (k, q) in [0.541_196_1, 1.306_563].into_iter().enumerate() {
                self.hp_l[k].set(hz, q, self.sr);
                self.hp_r[k].set(hz, q, self.sr);
            }
        }
    }

    /// 0 dry, 1 all compressed.
    pub fn set_mix(&mut self, m: f32, jump: bool) {
        if jump { self.mix.reset(m.clamp(0.0, 1.0)) } else { self.mix.set(m.clamp(0.0, 1.0)) }
    }

    fn slope(&self) -> f32 {
        1.0 - 1.0 / self.ratio
    }

    /// Static curve: gain reduction in dB for a level in dB.
    pub fn curve(&self, level_db: f32) -> f32 {
        let t = -2.0 - 16.0 * self.amount;
        let knee = 8.0;
        let over = level_db - t;
        let s = self.slope();
        if 2.0 * over <= -knee {
            0.0
        } else if 2.0 * over >= knee {
            over * s
        } else {
            s * (over + knee / 2.0) * (over + knee / 2.0) / (2.0 * knee)
        }
    }

    /// Make-up gain, dB: the knob's old make-up at its old 2.5:1, scaled with the ratio so the bus
    /// stays at about the same level whichever ratio you pick.
    pub fn makeup_db(&self) -> f32 {
        self.amount * 2.5 * self.slope() / 0.6
    }

    /// Gain to apply to this sample (the mix knob already folded in).
    #[inline]
    pub fn tick(&mut self, l: f32, r: f32) -> f32 {
        let (dl, dr) = if self.sc_hz > SC_OFF_HZ {
            let a = self.hp_l[0].tick(l).hp;
            let b = self.hp_r[0].tick(r).hp;
            (self.hp_l[1].tick(a).hp, self.hp_r[1].tick(b).hp)
        } else {
            (l, r)
        };
        let x = (dl * dl).max(dr * dr);
        self.ms = x + (self.ms - x) * self.ms_coef;
        let mix = self.mix.next();
        if self.amount < 0.001 && self.fast < 0.01 && self.slow < 0.01 {
            self.gr_db = 0.0;
            return 1.0;
        }
        // +3 dB so a full-scale sine reads 0 dB.
        let level = 10.0 * (self.ms + 1e-12).log10() + 3.01;
        let target = if self.amount < 0.001 { 0.0 } else { self.curve(level) };
        let c = if target > self.fast { self.fa } else { self.fr };
        self.fast = target + (self.fast - target) * c;
        let c = if target > self.slow { self.sa } else { self.sr_ };
        self.slow = target + (self.slow - target) * c;
        self.gr_db = self.fast.max(self.slow);
        let wet = db_to_gain(self.makeup_db() - self.gr_db);
        1.0 + (wet - 1.0) * mix
    }
}

/// Look-ahead true-peak limiter at 8x. The gain is the running minimum of what each
/// estimated peak needs, smoothed by a box filter, so it is always at or below what
/// every peak within `REACH` samples needs, and never steps.
pub struct Limiter {
    det: TruePeak,
    ceil: f32,
    need: [f32; MIN_WIN],
    need_pos: usize,
    box_: [f32; LOOKAHEAD],
    box_pos: usize,
    box_sum: f32,
    dl: [f32; MASTER_DELAY + 1],
    dr: [f32; MASTER_DELAY + 1],
    dpos: usize,
    g: f32,
    /// Release, like the glue's: a fast envelope for single peaks and a slow one that
    /// only charges when limiting goes on, so a long stretch of limiting lets go slowly
    /// instead of pumping back up in every gap (which would also fill in the duck).
    fast: f32,
    slow: f32,
    fr: f32,
    sa: f32,
    sr_: f32,
    /// Gain reduction right now, dB (positive).
    pub gr_db: f32,
}

impl Limiter {
    pub fn new(sr: f32) -> Self {
        Limiter {
            det: TruePeak::new(),
            ceil: db_to_gain(CEILING_DB),
            need: [1.0; MIN_WIN],
            need_pos: 0,
            box_: [1.0; LOOKAHEAD],
            box_pos: 0,
            box_sum: LOOKAHEAD as f32,
            dl: [0.0; MASTER_DELAY + 1],
            dr: [0.0; MASTER_DELAY + 1],
            dpos: 0,
            g: 1.0,
            fast: 0.0,
            slow: 0.0,
            fr: tau_coef(0.050, sr),
            sa: tau_coef(0.150, sr),
            sr_: tau_coef(0.600, sr),
            gr_db: 0.0,
        }
    }

    #[inline]
    pub fn tick(&mut self, l: f32, r: f32) -> (f32, f32) {
        // What the peak around (now - TP_DELAY) needs.
        let tp = self.det.push(l, r);
        let need = if tp > self.ceil { self.ceil / tp } else { 1.0 };
        self.need[self.need_pos] = need;
        self.need_pos = (self.need_pos + 1) % MIN_WIN;
        let mut m = 1.0f32;
        for v in &self.need {
            m = m.min(*v);
        }
        self.box_sum += m - self.box_[self.box_pos];
        self.box_[self.box_pos] = m;
        self.box_pos = (self.box_pos + 1) % LOOKAHEAD;
        // Rounding in the running sum must never let it creep above what was asked.
        let gbox = (self.box_sum / LOOKAHEAD as f32).min(1.0);
        if gbox < 0.99999 || self.fast > 1e-4 || self.slow > 1e-4 {
            let want = -20.0 * gbox.max(1e-6).log10();
            // Attack is instant on the fast envelope: the gain never rises above gbox.
            self.fast = if want > self.fast { want } else { want + (self.fast - want) * self.fr };
            let c = if want > self.slow { self.sa } else { self.sr_ };
            self.slow = want + (self.slow - want) * c;
            self.g = db_to_gain(-self.fast.max(self.slow)).min(gbox);
        } else {
            self.g = 1.0;
        }

        // The audio, delayed to line up with the gain.
        let n = self.dl.len();
        let out_l = self.dl[(self.dpos + 1) % n];
        let out_r = self.dr[(self.dpos + 1) % n];
        self.dl[self.dpos] = l;
        self.dr[self.dpos] = r;
        self.dpos = (self.dpos + 1) % n;
        self.gr_db = if self.g < 0.9999 { -20.0 * self.g.log10() } else { 0.0 };
        let g = self.g;
        ((out_l * g).clamp(-self.ceil, self.ceil), (out_r * g).clamp(-self.ceil, self.ceil))
    }
}

pub const M_OUT: usize = 0;
pub const M_GLUE: usize = 1;
pub const M_RATIO: usize = 2;
pub const M_SIDECHAIN: usize = 3;
pub const M_GLUE_MIX: usize = 4;
/// The shared reverb (engine 2, item 9): hall or plate, and its time. The engine applies these to
/// the return; the master only keeps their values.
pub const M_SPACE: usize = 5;
pub const M_VERB_TIME: usize = 6;
/// The shared echo (item 11): clean, tape or analogue, and its feedback.
pub const M_ECHO_TYPE: usize = 7;
pub const M_REPEATS: usize = 8;
/// Room for master params (compare snapshots hold this many).
pub const MASTER_SLOTS: usize = 16;

pub struct Master {
    pub glue: Glue,
    pub limiter: Limiter,
    out: Smooth,
    /// Normalised values, by `MASTER_PARAMS` index.
    pub params: [f32; MASTER_SLOTS],
}

impl Master {
    pub fn new(sr: f32) -> Self {
        let mut out = Smooth::new(fader_gain(FADER_UNITY));
        out.set_time(15.0, sr);
        let mut m = Master { glue: Glue::new(sr), limiter: Limiter::new(sr), out, params: [0.0; MASTER_SLOTS] };
        for (i, s) in crate::params::MASTER_PARAMS.iter().enumerate() {
            m.set_param(i, s.default, true);
        }
        m
    }

    pub fn set_param(&mut self, i: usize, n: f32, jump: bool) {
        if i >= crate::params::MASTER_PARAMS.len() {
            return;
        }
        let n = n.clamp(0.0, 1.0);
        self.params[i] = n;
        match i {
            M_OUT => {
                let g = fader_gain(n);
                if jump { self.out.reset(g) } else { self.out.set(g) }
            }
            M_GLUE => self.glue.set_amount(n),
            M_RATIO => self.glue.set_ratio(glue_ratio(n)),
            M_SIDECHAIN => self.glue.set_sidechain(crate::params::MASTER_PARAMS[M_SIDECHAIN].to_value(n)),
            M_GLUE_MIX => self.glue.set_mix(n, jump),
            _ => {}
        }
    }

    #[inline]
    pub fn tick(&mut self, l: f32, r: f32) -> (f32, f32) {
        let (l, r) = (l * TRIM, r * TRIM);
        let g = self.glue.tick(l, r) * self.out.next();
        self.limiter.tick(l * g, r * g)
    }
}

/// Offline true-peak meters, for tests and the render tool.
pub mod reference {
    /// The true-peak meter from ITU-R BS.1770-4, Annex 2: 4x, 48 taps in 4 phases.
    /// This is how dBTP is defined.
    pub fn bs1770_true_peak(x: &[f32]) -> f32 {
        const H: [[f64; 12]; 4] = [
            [0.0017089843750, 0.0109863281250, -0.0196533203125, 0.0332031250000, -0.0594482421875, 0.1373291015625, 0.9721679687500, -0.1022949218750, 0.0476074218750, -0.0266113281250, 0.0148925781250, -0.0083007812500],
            [-0.0291748046875, 0.0292968750000, -0.0517578125000, 0.0891113281250, -0.1665039062500, 0.4650878906250, 0.7797851562500, -0.2003173828125, 0.1015625000000, -0.0582275390625, 0.0330810546875, -0.0189208984375],
            [-0.0189208984375, 0.0330810546875, -0.0582275390625, 0.1015625000000, -0.2003173828125, 0.7797851562500, 0.4650878906250, -0.1665039062500, 0.0891113281250, -0.0517578125000, 0.0292968750000, -0.0291748046875],
            [-0.0083007812500, 0.0148925781250, -0.0266113281250, 0.0476074218750, -0.1022949218750, 0.9721679687500, 0.1373291015625, -0.0594482421875, 0.0332031250000, -0.0196533203125, 0.0109863281250, 0.0017089843750],
        ];
        let mut peak = 0.0f32;
        for n in 11..x.len() {
            for ph in &H {
                let mut acc = 0.0f64;
                for (k, h) in ph.iter().enumerate() {
                    acc += x[n - k] as f64 * h;
                }
                peak = peak.max(acc.abs() as f32);
            }
            peak = peak.max(x[n].abs());
        }
        peak
    }

    /// A strict true-peak meter, far better than the one in the limiter: 16x with a
    /// long windowed sinc. Only stretches next to a loud sample can hold a high peak,
    /// so only those are measured.
    pub fn strict_true_peak(x: &[f32]) -> f32 {
        let os = 16;
        let half = 32i64;
        let mut peak = 0.0f32;
        let loud = x.iter().fold(0.0f32, |a, b| a.max(b.abs())) * 0.5;
        for n in 0..x.len() as i64 {
            let i = n as usize;
            if x[i].abs() < loud && x.get(i + 1).is_none_or(|v| v.abs() < loud) {
                continue;
            }
            for p in 0..os {
                let t = n as f64 + p as f64 / os as f64;
                let mut acc = 0.0f64;
                for k in (n - half)..=(n + half) {
                    if k < 0 || k >= x.len() as i64 {
                        continue;
                    }
                    let d = t - k as f64;
                    let s = if d.abs() < 1e-12 { 1.0 } else { (std::f64::consts::PI * d).sin() / (std::f64::consts::PI * d) };
                    let w = 0.5 + 0.5 * (std::f64::consts::PI * d / (half as f64 + 1.0)).cos();
                    acc += x[k as usize] as f64 * s * w;
                }
                peak = peak.max(acc.abs() as f32);
            }
        }
        peak
    }

}

#[cfg(test)]
mod tests {
    use super::reference::{bs1770_true_peak, strict_true_peak as reference_true_peak};
    use super::*;

    #[test]
    fn estimator_catches_the_classic_intersample_peak() {
        // fs/4 at 45 degrees: every sample reads 0.707, the wave peaks at 1.0.
        let mut tp = TruePeak::new();
        let mut m = 0.0f32;
        for n in 0..200 {
            let x = (std::f32::consts::FRAC_PI_2 * n as f32 + std::f32::consts::FRAC_PI_4).sin();
            let e = tp.push(x, x);
            if n > 20 {
                m = m.max(e);
            }
        }
        assert!(m > 0.98 && m < 1.02, "estimate {m}");
    }

    /// Torture: tones near a quarter of the sample rate (the worst case for peaks
    /// between samples), bass, and bursts 8 dB over the ceiling. `full_band` adds
    /// white noise right up to Nyquist; otherwise the bursts are band-limited to
    /// 20 kHz like programme material.
    fn torture(full_band: bool) -> Vec<(f32, f32)> {
        let sr = 48_000.0;
        let mut rng = crate::dsp::Rng::new(7);
        let tones: Vec<(f32, f32)> = (0..120).map(|i| (50.0 * (400.0f32).powf(i as f32 / 119.0), rng.next_u32() as f32 / u32::MAX as f32 * 6.283)).collect();
        (0..24_000)
            .map(|n| {
                let t = n as f32 / sr;
                let on = (n / 1200) % 3 == 0;
                let burst = if !on {
                    0.0
                } else if full_band {
                    rng.bipolar() * 2.5
                } else {
                    tones.iter().map(|(f, ph)| (std::f32::consts::TAU * f * t + ph).sin()).sum::<f32>() * 0.09
                };
                let x = 1.8 * (std::f32::consts::TAU * 11_997.0 * t + 0.785).sin() + burst + 0.9 * (std::f32::consts::TAU * 60.0 * t).sin();
                (x, -x * 0.7)
            })
            .collect()
    }

    fn run_limiter(input: &[(f32, f32)]) -> (Vec<f32>, Vec<f32>) {
        let mut lim = Limiter::new(48_000.0);
        input.iter().map(|(l, r)| lim.tick(*l, *r)).unzip()
    }

    #[test]
    fn limiter_holds_the_ceiling_on_the_standard_meter() {
        for full in [false, true] {
            let (l, r) = run_limiter(&torture(full));
            let db = 20.0 * bs1770_true_peak(&l).max(bs1770_true_peak(&r)).log10();
            assert!(db < CEILING_DB + 0.3, "full band {full}: {db:.2} dBTP");
            let sp = l.iter().chain(&r).fold(0.0f32, |a, b| a.max(b.abs()));
            assert!(sp <= db_to_gain(CEILING_DB) + 1e-6);
        }
    }

    #[test]
    fn limiter_never_passes_0_dbtp_on_a_strict_meter() {
        let (l, r) = run_limiter(&torture(false));
        let db = 20.0 * reference_true_peak(&l).max(reference_true_peak(&r)).log10();
        assert!(db < 0.0, "passed 0 dBTP: {db:.2}");
        assert!(db < CEILING_DB + 0.3, "over the ceiling: {db:.2}");
    }

    #[test]
    fn limiter_leaves_quiet_signals_alone() {
        let mut lim = Limiter::new(48_000.0);
        let mut last = (0.0, 0.0);
        for n in 0..2000 {
            last = lim.tick(if n == 100 { 0.5 } else { 0.0 }, 0.0);
            if n == 100 + MASTER_DELAY {
                assert!((last.0 - 0.5).abs() < 1e-6, "delayed impulse {:?}", last);
            }
        }
        assert_eq!(lim.gr_db, 0.0);
        let _ = last;
    }

    #[test]
    fn glue_compresses_loud_programme_and_lets_go() {
        let sr = 48_000.0;
        let mut g = Glue::new(sr);
        g.set_amount(1.0);
        let mut s = crate::dsp::osc::Sine::default();
        for _ in 0..(sr as usize) {
            let x = s.next(100.0 / sr);
            g.tick(x, x);
        }
        let loud = g.gr_db;
        assert!(loud > 6.0, "gain reduction {loud}");
        // Sustained compression lets go slowly: still holding some after 300 ms.
        for _ in 0..(sr * 0.3) as usize {
            g.tick(0.0, 0.0);
        }
        assert!(g.gr_db > 1.0 && g.gr_db < loud, "{}", g.gr_db);
        for _ in 0..(sr * 8.0) as usize {
            g.tick(0.0, 0.0);
        }
        assert!(g.gr_db < 0.1);
    }

    #[test]
    fn glue_release_is_faster_after_a_short_hit() {
        let sr = 48_000.0;
        let run = |hit_ms: f32| {
            let mut g = Glue::new(sr);
            g.set_amount(1.0);
            let mut s = crate::dsp::osc::Sine::default();
            for _ in 0..(sr * hit_ms / 1000.0) as usize {
                let x = s.next(100.0 / sr);
                g.tick(x, x);
            }
            let peak = g.gr_db;
            for _ in 0..(sr * 0.25) as usize {
                g.tick(0.0, 0.0);
            }
            g.gr_db / peak
        };
        let short = run(30.0);
        let long = run(2000.0);
        assert!(short < long * 0.6, "short hit keeps {short:.2}, long keeps {long:.2}");
    }
}
