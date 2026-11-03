//! What each layer is doing in the mix, measured after its strip: peak, loudness,
//! energy in low / mid / high, a pitch centre, and where it sits left to right.
//! Plus clash detection: two layers with energy in the same band, at the same pan,
//! at the same time, and a suggested fix.
//!
//! Runs on the audio thread, allocation free. The engine reports it about 30 times a
//! second while analysis is on (the mix screens turn it on).

use crate::dsp::filter::Svf;
use crate::dsp::tau_coef;

/// Split points between the six analysis bands, in Hz.
pub const SPLITS: [f32; 5] = [120.0, 400.0, 1_200.0, 3_500.0, 8_000.0];
pub const BANDS: usize = 6;
/// A rough centre for each band, for the pitch centre (Hz).
const CENTRES: [f32; BANDS] = [70.0, 220.0, 700.0, 2_000.0, 5_300.0, 11_000.0];
/// Which of low / mid / high each band reports as.
pub const BAND_GROUP: [usize; BANDS] = [0, 0, 1, 1, 2, 2];
/// Pair statistics run every this many samples.
const DECIM: usize = 8;

pub mod fix {
    /// The target ducks under the other layer.
    pub const DUCK: u32 = 0;
    /// The target gets an eq cut in the band (low cut for lows, a dip for mids and highs).
    pub const EQ: u32 = 1;
    /// The target moves away in the stereo field.
    pub const PAN: u32 = 2;
    pub const NONE: u32 = 3;
}

/// A biquad, transposed direct form II. For the K-weighting filters.
#[derive(Clone, Copy, Default)]
struct Biquad {
    b: [f32; 3],
    a: [f32; 2],
    z: [f32; 2],
}

impl Biquad {
    fn new(b: [f64; 3], a: [f64; 3]) -> Self {
        Biquad { b: [(b[0] / a[0]) as f32, (b[1] / a[0]) as f32, (b[2] / a[0]) as f32], a: [(a[1] / a[0]) as f32, (a[2] / a[0]) as f32], z: [0.0; 2] }
    }
    #[inline]
    fn tick(&mut self, x: f32) -> f32 {
        let y = self.b[0] * x + self.z[0];
        self.z[0] = crate::dsp::flush_denormal(self.b[1] * x - self.a[0] * y + self.z[1]);
        self.z[1] = crate::dsp::flush_denormal(self.b[2] * x - self.a[1] * y);
        y
    }
}

/// ITU-R BS.1770 K-weighting: a +4 dB high shelf from about 1.7 kHz, then a high pass
/// at 38 Hz. Built from the analogue prototypes (after Brecht De Man's derivation),
/// which reproduce the standard's 48 kHz coefficients exactly and hold at any rate.
fn k_weighting(sr: f32) -> [Biquad; 2] {
    let fs = sr as f64;
    let vh = 10f64.powf(3.999_843_853_973_347 / 20.0);
    let vb = vh.powf(0.499_666_774_154_541_6);
    let (k, q) = ((std::f64::consts::PI * 1_681.974_450_955_533 / fs).tan(), 0.707_175_236_955_419_6);
    let shelf = Biquad::new([vh + vb * k / q + k * k, 2.0 * (k * k - vh), vh - vb * k / q + k * k], [1.0 + k / q + k * k, 2.0 * (k * k - 1.0), 1.0 - k / q + k * k]);
    let (k, q) = ((std::f64::consts::PI * 38.135_470_876_024_44 / fs).tan(), 0.500_327_037_323_877_3);
    let hp = Biquad::new([1.0, -2.0, 1.0], [1.0 + k / q + k * k, 2.0 * (k * k - 1.0), 1.0 - k / q + k * k]);
    [shelf, hp]
}

pub struct LayerMeter {
    lp: [Svf; 5],
    kl: [Biquad; 2],
    kr: [Biquad; 2],
    /// K-weighted mean square, both channels summed (about 400 ms).
    ek: f32,
    /// Fast band envelopes (mean square, about 10 ms), for when layers overlap.
    fast: [f32; BANDS],
    /// Slow band energies (about 400 ms, like momentary loudness).
    slow: [f32; BANDS],
    el: f32,
    er: f32,
    peak: f32,
    fast_c: f32,
    slow_c: f32,
}

#[derive(Clone, Copy, Default, Debug)]
pub struct Reading {
    pub active: bool,
    /// Peak since the last reading, dBFS.
    pub peak_db: f32,
    /// Momentary loudness, LUFS (approximate K-weighting).
    pub lufs: f32,
    /// Low, mid, high energy, dB.
    pub bands_db: [f32; 3],
    /// Energy-weighted centre of the spectrum, Hz.
    pub centre_hz: f32,
    /// Where it sits, in pan units (-1 left .. 1 right), from the energy on each side.
    pub pan: f32,
}

#[inline]
fn db(p: f32) -> f32 {
    if p <= 1e-12 { -120.0 } else { 10.0 * p.log10() }
}

impl LayerMeter {
    pub fn new(sr: f32) -> Self {
        let mut lp = [Svf::default(); 5];
        for (f, hz) in lp.iter_mut().zip(SPLITS) {
            f.set(hz.min(sr * 0.45), 0.5, sr);
        }
        LayerMeter {
            lp,
            kl: k_weighting(sr),
            kr: k_weighting(sr),
            ek: 0.0,
            fast: [0.0; BANDS],
            slow: [0.0; BANDS],
            el: 0.0,
            er: 0.0,
            peak: 0.0,
            fast_c: tau_coef(0.010, sr),
            slow_c: tau_coef(0.4, sr),
        }
    }

    pub fn clear(&mut self) {
        for f in self.lp.iter_mut() {
            f.reset();
        }
        for b in self.kl.iter_mut().chain(self.kr.iter_mut()) {
            b.z = [0.0; 2];
        }
        self.ek = 0.0;
        self.fast = [0.0; BANDS];
        self.slow = [0.0; BANDS];
        self.el = 0.0;
        self.er = 0.0;
        self.peak = 0.0;
    }

    #[inline]
    pub fn tick(&mut self, l: f32, r: f32) {
        let m = 0.5 * (l + r);
        let mut prev = 0.0;
        let (fc, sc) = (self.fast_c, self.slow_c);
        for i in 0..BANDS {
            let lp = if i < 5 { self.lp[i].tick(m).lp } else { m };
            let b = lp - prev;
            prev = lp;
            let e = b * b;
            self.fast[i] = e + (self.fast[i] - e) * fc;
            self.slow[i] = e + (self.slow[i] - e) * sc;
        }
        let kl = self.kl[0].tick(l);
        let kl = self.kl[1].tick(kl);
        let kr = self.kr[0].tick(r);
        let kr = self.kr[1].tick(kr);
        let k = kl * kl + kr * kr;
        self.ek = k + (self.ek - k) * sc;
        self.el = l * l + (self.el - l * l) * sc;
        self.er = r * r + (self.er - r * r) * sc;
        let a = l.abs().max(r.abs());
        if a > self.peak {
            self.peak = a;
        }
    }

    pub fn total(&self) -> f32 {
        self.slow.iter().sum()
    }

    pub fn band(&self, i: usize) -> f32 {
        self.slow[i]
    }

    /// Fast amplitude envelope of a band.
    #[inline]
    pub fn env(&self, i: usize) -> f32 {
        self.fast[i].max(0.0).sqrt()
    }

    /// Pan position from energy, inverted through the equal-power pan law so it reads
    /// in the same units as the pan knob.
    pub fn pan(&self) -> f32 {
        let s = self.el + self.er;
        if s <= 1e-12 {
            return 0.0;
        }
        let x = ((self.er - self.el) / s).clamp(-1.0, 1.0);
        x.asin() * std::f32::consts::FRAC_2_PI
    }

    /// Read and reset the peak hold.
    pub fn read(&mut self) -> Reading {
        let total = self.total();
        let stereo = self.el + self.er;
        let active = stereo > 1e-9;
        let mut groups = [0.0f32; 3];
        for i in 0..BANDS {
            groups[BAND_GROUP[i]] += self.slow[i];
        }
        let centre = if total > 1e-15 {
            let c: f32 = self.slow.iter().zip(CENTRES).map(|(e, f)| e * f.log2()).sum::<f32>() / total;
            c.exp2()
        } else {
            0.0
        };
        let peak = self.peak;
        self.peak = 0.0;
        Reading {
            active,
            peak_db: if peak > 1e-6 { 20.0 * peak.log10() } else { -120.0 },
            lufs: if active { -0.691 + db(self.ek) } else { -120.0 },
            bands_db: [db(groups[0]), db(groups[1]), db(groups[2])],
            centre_hz: centre,
            pan: self.pan(),
        }
    }
}

/// A clash between two layers, and what to do about it.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Clash {
    /// The layer the fix changes.
    pub target: usize,
    /// The layer it clashes with.
    pub other: usize,
    /// 0 low, 1 mid, 2 high.
    pub group: usize,
    /// The analysis band (0..6) where it is worst.
    pub band: usize,
    pub severity: f32,
    pub fix: u32,
    /// Normalised value for the fix's param (duck amount, eq param, pan).
    pub value: f32,
    pub fix2: u32,
    pub value2: f32,
}

pub const PAIRS: usize = 8 * 7 / 2;

/// What the detector needs to know about each layer besides its sound.
#[derive(Clone, Copy, Default)]
pub struct LayerInfo {
    pub sounding: bool,
    pub drums: bool,
    /// Layer it ducks under, and how much (normalised duck knob).
    pub duck_src: i32,
    pub duck_amt: f32,
    /// The pan knob, -1..1.
    pub pan_knob: f32,
    /// Low cut (Hz) and the mid and high eq (dB), as set.
    pub cut_hz: f32,
    pub mid_db: f32,
    pub high_db: f32,
}

/// Has the target already been moved out of the way in this band? Then the clash
/// is handled, whatever the meters still show while the change settles in.
fn handled(t: &LayerInfo, other_idx: usize, other: &LayerInfo, band: usize) -> bool {
    match BAND_GROUP[band] {
        0 => {
            let ducks = t.duck_src == other_idx as i32 && t.duck_amt >= 0.3;
            if other.drums && !t.drums {
                // Out of the kick's way: ducking or a low cut both do it.
                ducks || t.cut_hz >= 100.0
            } else {
                ducks || t.cut_hz >= if band == 0 { 100.0 } else { 230.0 }
            }
        }
        1 => t.mid_db <= -4.0,
        _ => t.high_db <= -4.0,
    }
}

pub struct ClashDetector {
    /// Smoothed products of fast envelopes: pairs, then each layer with itself.
    cross: [[f32; BANDS]; PAIRS],
    selfp: [[f32; BANDS]; 8],
    on: [[bool; BANDS]; PAIRS],
    count: usize,
    c: f32,
}


#[inline]
pub fn pair_index(i: usize, j: usize) -> usize {
    let (a, b) = if i < j { (i, j) } else { (j, i) };
    // Pairs (a, b) with a < b, ordered by b.
    b * (b - 1) / 2 + a
}

/// Pan closer than this counts as "the same place".
const SAME_PLACE: f32 = 0.35;
/// A band must hold at least this share of a layer's energy to count for it.
const SHARE: f32 = 0.15;
/// Correlation of the two envelopes: on above, off below (hysteresis).
const ON: f32 = 0.22;
const OFF: f32 = 0.16;
/// Both layers must be at least this loud in the band (power, about -50 dBFS).
const FLOOR: f32 = 1e-5;
/// And within this power ratio of each other (20 dB): beyond it one simply covers the other.
const SPREAD: f32 = 100.0;

impl ClashDetector {
    pub fn new(sr: f32) -> Self {
        ClashDetector {
            cross: [[0.0; BANDS]; PAIRS],
            selfp: [[0.0; BANDS]; 8],
            on: [[false; BANDS]; PAIRS],
            count: 0,
            c: tau_coef(0.6, sr / DECIM as f32),
        }
    }

    pub fn clear(&mut self) {
        self.cross = [[0.0; BANDS]; PAIRS];
        self.selfp = [[0.0; BANDS]; 8];
        self.on = [[false; BANDS]; PAIRS];
        self.count = 0;
    }

    /// Every sample, after the meters have ticked.
    #[inline]
    pub fn tick(&mut self, meters: &[LayerMeter], live: u8) {
        self.count += 1;
        if self.count < DECIM {
            return;
        }
        self.count = 0;
        let c = self.c;
        let mut env = [[0.0f32; BANDS]; 8];
        for i in 0..meters.len().min(8) {
            if live & (1 << i) == 0 {
                continue;
            }
            for b in 0..BANDS {
                let e = meters[i].env(b);
                env[i][b] = e;
                let p = e * e;
                self.selfp[i][b] = p + (self.selfp[i][b] - p) * c;
            }
        }
        for j in 1..8 {
            if live & (1 << j) == 0 {
                continue;
            }
            for i in 0..j {
                if live & (1 << i) == 0 {
                    continue;
                }
                let k = pair_index(i, j);
                for b in 0..BANDS {
                    let p = env[i][b] * env[j][b];
                    self.cross[k][b] = p + (self.cross[k][b] - p) * c;
                }
            }
        }
    }

    /// How much two layers' envelopes in a band rise and fall together (0..1).
    pub fn overlap(&self, i: usize, j: usize, b: usize) -> f32 {
        let d = (self.selfp[i][b] * self.selfp[j][b]).sqrt();
        if d <= 1e-20 { 0.0 } else { (self.cross[pair_index(i, j)][b] / d).min(1.0) }
    }

    /// Decide the clashes now. Writes up to `out.len()` of them, worst first; returns
    /// how many.
    pub fn detect(&mut self, meters: &[LayerMeter], info: &[LayerInfo], out: &mut [Clash]) -> usize {
        let n = meters.len().min(8);
        let mut found = 0;
        for j in 1..n {
            for i in 0..j {
                let k = pair_index(i, j);
                let (a, b) = (&meters[i], &meters[j]);
                let live = info[i].sounding && info[j].sounding;
                let (ta, tb) = (a.total(), b.total());
                let dp = (a.pan() - b.pan()).abs();
                let mut best: Option<(usize, f32)> = None;
                for band in 0..BANDS {
                    let (ea, eb) = (a.band(band), b.band(band));
                    let fixed = handled(&info[i], j, &info[j], band) || handled(&info[j], i, &info[i], band);
                    let ok = live
                        && !fixed
                        && ea > FLOOR
                        && eb > FLOOR
                        && ea.max(eb) < ea.min(eb) * SPREAD
                        && ea > ta * SHARE
                        && eb > tb * SHARE
                        && dp < SAME_PLACE;
                    let ov = if ok { self.overlap(i, j, band) } else { 0.0 };
                    let was = self.on[k][band];
                    let now = ok && if was { ov > OFF } else { ov > ON };
                    self.on[k][band] = now;
                    if now {
                        let share = (ea / ta).min(eb / tb);
                        let sev = (ov * (1.0 - dp / SAME_PLACE) * (share * 2.0).min(1.0)).clamp(0.0, 1.0);
                        if best.is_none_or(|(_, s)| sev > s) {
                            best = Some((band, sev));
                        }
                    }
                }
                let Some((band, severity)) = best else { continue };
                let c = suggest(i, j, band, severity, meters, info);
                // Keep the worst ones.
                if found < out.len() {
                    out[found] = c;
                    found += 1;
                } else if let Some(w) = out.iter_mut().min_by(|x, y| x.severity.total_cmp(&y.severity)) {
                    if w.severity < c.severity {
                        *w = c;
                    }
                }
            }
        }
        out[..found].sort_by(|x, y| y.severity.total_cmp(&x.severity));
        found
    }
}

/// Which layer to change and how.
fn suggest(i: usize, j: usize, band: usize, severity: f32, meters: &[LayerMeter], info: &[LayerInfo]) -> Clash {
    let group = BAND_GROUP[band];
    let share = |x: usize| meters[x].band(band) / meters[x].total().max(1e-20);
    // Drums own the lows: the other layer moves out of the kick's way.
    let (target, other) = if group == 0 && info[i].drums != info[j].drums {
        if info[i].drums { (j, i) } else { (i, j) }
    } else if share(i) < share(j) || (share(i) == share(j) && i > j) {
        // The band matters less to the target.
        (i, j)
    } else {
        (j, i)
    };
    let eq_value = match band {
        // Low cut, normalised on the eq.cut curve (20..1000 Hz, exponential).
        0 => cut_norm(130.0),
        1 => cut_norm(280.0),
        // A 6 dB dip on the mid or high band (-15..15 dB).
        _ => (-6.0 + 15.0) / 30.0,
    };
    let (fix, value, fix2, value2) = if group == 0 {
        if info[other].drums && !info[target].drums {
            (fix::DUCK, 0.55, fix::EQ, eq_value)
        } else {
            // Lows stay in the middle: cut rather than pan.
            (fix::EQ, eq_value, fix::NONE, 0.0)
        }
    } else {
        // Move away from the other layer, towards the emptier side.
        let op = info[other].pan_knob;
        let tp = info[target].pan_knob;
        let dir = if (tp - op).abs() > 0.05 { (tp - op).signum() } else if op > 0.0 { -1.0 } else { 1.0 };
        let p = (op + dir * 0.6).clamp(-0.8, 0.8);
        (fix::PAN, (p + 1.0) * 0.5, fix::EQ, eq_value)
    };
    Clash { target, other, group, band, severity, fix, value, fix2, value2 }
}

fn cut_norm(hz: f32) -> f32 {
    ((hz / 20.0).ln() / (1000.0f32 / 20.0).ln()).clamp(0.0, 1.0)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::dsp::osc::Sine;

    #[test]
    fn pair_index_is_dense() {
        let mut seen = [false; PAIRS];
        for j in 1..8 {
            for i in 0..j {
                let k = pair_index(i, j);
                assert!(!seen[k]);
                seen[k] = true;
                assert_eq!(k, pair_index(j, i));
            }
        }
        assert!(seen.iter().all(|s| *s));
    }

    #[test]
    fn bands_and_centre_follow_the_tone() {
        let sr = 48_000.0;
        for (hz, group) in [(60.0, 0), (900.0, 1), (9_000.0, 2)] {
            let mut m = LayerMeter::new(sr);
            let mut s = Sine::default();
            for _ in 0..(sr as usize) {
                let x = s.next(hz / sr) * 0.5;
                m.tick(x, x);
            }
            let r = m.read();
            let loudest = (0..3).max_by(|a, b| r.bands_db[*a].total_cmp(&r.bands_db[*b])).unwrap();
            assert_eq!(loudest, group, "{hz} Hz: {:?}", r.bands_db);
            assert!(r.centre_hz > hz / 3.0 && r.centre_hz < hz * 3.0, "{hz} Hz centre {}", r.centre_hz);
            assert!(r.pan.abs() < 0.01);
            // -6 dBFS sine, centred: about -6 dB peak.
            assert!((r.peak_db + 6.0).abs() < 0.2, "{}", r.peak_db);
        }
    }

    #[test]
    fn pan_reads_back_in_knob_units() {
        let sr = 48_000.0;
        for p in [-0.8f32, -0.3, 0.0, 0.5] {
            let a = (p + 1.0) * 0.25 * std::f32::consts::PI;
            let mut m = LayerMeter::new(sr);
            let mut s = Sine::default();
            for _ in 0..24_000 {
                let x = s.next(220.0 / sr) * 0.3;
                m.tick(x * a.cos() * std::f32::consts::SQRT_2, x * a.sin() * std::f32::consts::SQRT_2);
            }
            assert!((m.pan() - p).abs() < 0.02, "pan {p} read {}", m.pan());
        }
    }

    #[test]
    fn loudness_of_a_full_scale_1k_sine_is_about_minus_3_lufs() {
        // BS.1770: a 0 dBFS 1 kHz sine in one channel reads -3.01 LUFS; in both, 0.
        let sr = 48_000.0;
        let mut m = LayerMeter::new(sr);
        let mut s = Sine::default();
        for _ in 0..(sr as usize * 2) {
            let x = s.next(1000.0 / sr);
            m.tick(x, 0.0);
        }
        let r = m.read();
        assert!((r.lufs + 3.01).abs() < 0.1, "{}", r.lufs);
    }
}
