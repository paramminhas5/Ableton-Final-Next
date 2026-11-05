//! Loudness to ITU-R BS.1770-4 and EBU R 128: K-weighting, momentary (400 ms), short-term (3 s) and
//! integrated loudness with the absolute (-70 LUFS) and relative (-10 LU) gates.
//!
//! Real-time safe: the gating blocks go into a fixed histogram (0.05 LU bins, the method libebur128
//! uses for long programmes), so the integrated figure never needs a growing list. Each bin keeps the
//! energy of the blocks in it as well as their count, so the mean is exact and only the gate decision
//! is rounded to a bin.

use crate::analysis::{k_weighting, Biquad};

/// Sub-blocks of 100 ms: momentary is the last 4, short-term the last 30, and a gating block (400 ms,
/// 75% overlap) ends at every sub-block.
const SUBS: usize = 30;
/// Export targets, integrated LUFS: -14 is what the big streaming services play at, so an export
/// sounds the same there as it did in the lesson; -9 is a loud master for club play.
pub const EXPORT_LUFS: f32 = -14.0;
pub const EXPORT_LOUD_LUFS: f32 = -9.0;
const BIN_LU: f64 = 0.05;
const HIST_LO: f64 = -70.0;
const HIST_HI: f64 = 10.0;
const BINS: usize = ((HIST_HI - HIST_LO) / BIN_LU) as usize;

#[inline]
fn lufs_of(energy: f64) -> f32 {
    if energy <= 1e-15 { -120.0 } else { (-0.691 + 10.0 * energy.log10()) as f32 }
}

#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct LoudnessReading {
    /// Last 400 ms, LUFS.
    pub momentary: f32,
    /// Last 3 s, LUFS.
    pub short_term: f32,
    /// Gated, since the last reset, LUFS (-120 until the first block over the gate).
    pub integrated: f32,
}

pub struct Loudness {
    kl: [Biquad; 2],
    kr: [Biquad; 2],
    sub_len: usize,
    acc: f64,
    n: usize,
    subs: [f64; SUBS],
    sub_pos: usize,
    filled: usize,
    count: [u32; BINS],
    energy: [f64; BINS],
    /// Blocks louder than the top bin (more than +10 LUFS: only in a broken mix).
    over_count: u32,
    over_energy: f64,
    reading: LoudnessReading,
}

impl Loudness {
    pub fn new(sr: f32) -> Self {
        Loudness {
            kl: k_weighting(sr),
            kr: k_weighting(sr),
            sub_len: ((sr as f64) * 0.1).round() as usize,
            acc: 0.0,
            n: 0,
            subs: [0.0; SUBS],
            sub_pos: 0,
            filled: 0,
            count: [0; BINS],
            energy: [0.0; BINS],
            over_count: 0,
            over_energy: 0.0,
            reading: LoudnessReading { momentary: -120.0, short_term: -120.0, integrated: -120.0 },
        }
    }

    /// Start over: the filters, the windows and the integrated measurement.
    pub fn reset(&mut self) {
        for b in self.kl.iter_mut().chain(self.kr.iter_mut()) {
            b.reset();
        }
        self.acc = 0.0;
        self.n = 0;
        self.subs = [0.0; SUBS];
        self.sub_pos = 0;
        self.filled = 0;
        self.reset_integrated();
    }

    /// Start the integrated measurement over (a new play-through), keep the windows.
    pub fn reset_integrated(&mut self) {
        self.count = [0; BINS];
        self.energy = [0.0; BINS];
        self.over_count = 0;
        self.over_energy = 0.0;
        self.reading.integrated = -120.0;
    }

    #[inline]
    pub fn tick(&mut self, l: f32, r: f32) {
        let a = self.kl[0].tick(l);
        let a = self.kl[1].tick(a);
        let b = self.kr[0].tick(r);
        let b = self.kr[1].tick(b);
        self.acc += (a * a) as f64 + (b * b) as f64;
        self.n += 1;
        if self.n >= self.sub_len {
            self.end_sub();
        }
    }

    fn end_sub(&mut self) {
        self.subs[self.sub_pos] = self.acc / self.n as f64;
        self.sub_pos = (self.sub_pos + 1) % SUBS;
        self.filled = (self.filled + 1).min(SUBS);
        self.acc = 0.0;
        self.n = 0;
        let mean = |k: usize| -> f64 {
            let mut s = 0.0;
            for i in 1..=k {
                s += self.subs[(self.sub_pos + SUBS - i) % SUBS];
            }
            s / k as f64
        };
        let m = mean(4);
        self.reading.momentary = lufs_of(m);
        self.reading.short_term = lufs_of(mean(SUBS));
        // A gating block ends here once there is 400 ms of signal.
        if self.filled >= 4 {
            let l = -0.691 + 10.0 * m.max(1e-30).log10();
            if l > HIST_LO {
                if l >= HIST_HI {
                    self.over_count += 1;
                    self.over_energy += m;
                } else {
                    let bin = (((l - HIST_LO) / BIN_LU) as usize).min(BINS - 1);
                    self.count[bin] += 1;
                    self.energy[bin] += m;
                }
                self.reading.integrated = self.integrated();
            }
        }
    }

    /// Gated integrated loudness from the histogram.
    fn integrated(&self) -> f32 {
        let (mut n, mut e) = (self.over_count as f64, self.over_energy);
        for i in 0..BINS {
            n += self.count[i] as f64;
            e += self.energy[i];
        }
        if n < 1.0 {
            return -120.0;
        }
        // Relative gate: 10 LU under the loudness of everything over the absolute gate.
        let gate = -0.691 + 10.0 * (e / n).log10() - 10.0;
        let (mut n2, mut e2) = (self.over_count as f64, self.over_energy);
        for i in 0..BINS {
            // A bin counts when its middle is over the gate.
            let mid = HIST_LO + (i as f64 + 0.5) * BIN_LU;
            if mid > gate {
                n2 += self.count[i] as f64;
                e2 += self.energy[i];
            }
        }
        if n2 < 1.0 { -120.0 } else { lufs_of(e2 / n2) }
    }

    pub fn read(&self) -> LoudnessReading {
        self.reading
    }
}

/// Integrated loudness of a whole stereo buffer (offline), LUFS.
pub fn integrated_lufs(l: &[f32], r: &[f32], sr: f32) -> f32 {
    let mut m = Loudness::new(sr);
    for (a, b) in l.iter().zip(r) {
        m.tick(*a, *b);
    }
    m.read().integrated
}

/// What `normalise` did.
#[derive(Clone, Copy, Debug)]
pub struct Normalised {
    /// Gain applied before the limiter, dB.
    pub gain_db: f32,
    /// Integrated loudness after, LUFS.
    pub lufs: f32,
    /// True peak after (ITU-R BS.1770-4 meter), dBTP.
    pub true_peak_db: f32,
    /// The limiter had to work (the target would have passed the ceiling).
    pub limited: bool,
}

/// Export loudness: bring a rendered song to `target` LUFS integrated with its true peak under the
/// master ceiling (-1 dBTP). Gain first; if that would pass the ceiling, the master's true-peak limiter
/// holds it, and the gain is corrected (up to three passes) so the limited song still lands on target.
/// Offline only: it allocates.
pub fn normalise(l: &mut [f32], r: &mut [f32], sr: f32, target: f32) -> Normalised {
    use crate::master::{reference::bs1770_true_peak, Limiter, CEILING_DB, MASTER_DELAY};
    let n = l.len().min(r.len());
    let (src_l, src_r) = (l[..n].to_vec(), r[..n].to_vec());
    let now = integrated_lufs(&src_l, &src_r, sr);
    if now <= -70.0 {
        let tp = 20.0 * bs1770_true_peak(&src_l).max(bs1770_true_peak(&src_r)).max(1e-9).log10();
        return Normalised { gain_db: 0.0, lufs: now, true_peak_db: tp, limited: false };
    }
    let mut gain_db = target - now;
    let mut out = Normalised { gain_db, lufs: now, true_peak_db: 0.0, limited: false };
    // A margin under the ceiling for the meter's own rounding.
    let ceil = crate::params::db_to_gain(CEILING_DB - 0.05);
    let (tp_l, tp_r) = (bs1770_true_peak(&src_l), bs1770_true_peak(&src_r));
    // The last pass, for the secant step: (gain, loudness it gave).
    let mut prev: Option<(f32, f32)> = None;
    for _ in 0..10 {
        let g = crate::params::db_to_gain(gain_db);
        let limited = tp_l.max(tp_r) * g > ceil;
        if limited {
            let mut lim = Limiter::new(sr);
            for i in 0..n + MASTER_DELAY {
                let (a, b) = if i < n { (src_l[i] * g, src_r[i] * g) } else { (0.0, 0.0) };
                let (ya, yb) = lim.tick(a, b);
                if i >= MASTER_DELAY {
                    l[i - MASTER_DELAY] = ya;
                    r[i - MASTER_DELAY] = yb;
                }
            }
        } else {
            for i in 0..n {
                l[i] = src_l[i] * g;
                r[i] = src_r[i] * g;
            }
        }
        let lufs = integrated_lufs(&l[..n], &r[..n], sr);
        let tp = 20.0 * bs1770_true_peak(&l[..n]).max(bs1770_true_peak(&r[..n])).max(1e-9).log10();
        out = Normalised { gain_db, lufs, true_peak_db: tp, limited };
        if (lufs - target).abs() < 0.03 || !limited {
            break;
        }
        // Limiting took some loudness away: ask for more. Under heavy limiting each dB of gain buys
        // less than a dB of loudness, so step along the measured slope (secant), not one to one.
        let slope = match prev {
            Some((g0, l0)) if (gain_db - g0).abs() > 1e-3 => ((lufs - l0) / (gain_db - g0)).clamp(0.05, 1.0),
            _ => 1.0,
        };
        prev = Some((gain_db, lufs));
        gain_db += ((target - lufs) / slope).clamp(-12.0, 12.0);
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn silence_reads_nothing() {
        let mut m = Loudness::new(48_000.0);
        for _ in 0..48_000 {
            m.tick(0.0, 0.0);
        }
        assert_eq!(m.read().integrated, -120.0);
        assert!(m.read().momentary < -100.0);
    }
}
