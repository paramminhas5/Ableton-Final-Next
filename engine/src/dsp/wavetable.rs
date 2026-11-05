//! Engine 2, item 12: three more oscillators for the synths.
//!
//! - A band-limited, mip-mapped wavetable: eight single-cycle frames built from their harmonics, and
//!   for every octave a copy holding only the harmonics that fit under the voice's Nyquist, so a high
//!   note never folds its overtones back down (one table per octave, the standard method).
//! - Feedback fm: a sine whose phase is pushed by its own last output (the DX7's operator feedback,
//!   averaged over two samples the same way). A little is a sine, more becomes a saw, more again is noise.
//! - Phase distortion, the Casio CZ trick: a cosine read with a bent phase. Bending it sweeps the
//!   tone from pure to a saw, like a low-pass filter opening, with no filter. The bend is held back on
//!   high notes so the edge it makes never gets sharper than the voice's rate can carry.

use std::sync::OnceLock;

pub const FRAMES: usize = 8;
pub const TABLE: usize = 2_048;
/// Octaves of mip maps: the first holds 1024 harmonics, the last only the fundamental.
pub const LEVELS: usize = 11;
/// The highest harmonic a level may carry, against the voice's rate (96 kHz): 40 kHz, so whatever
/// lies over the base rate's Nyquist is above the decimator's stopband edge and is removed.
const TOP_HZ: f32 = 40_000.0;

pub struct Tables {
    /// [frame][level][TABLE + 1] (one guard sample for interpolation), flattened.
    data: Vec<f32>,
}

/// The frames, by their harmonic amplitudes (sine phase), before normalising.
fn harmonic(frame: usize, h: usize) -> f32 {
    let hf = h as f32;
    match frame {
        0 => {
            if h == 1 { 1.0 } else { 0.0 }
        }
        // Triangle.
        1 => if h % 2 == 1 { (if (h / 2) % 2 == 0 { 1.0 } else { -1.0 }) / (hf * hf) } else { 0.0 },
        // Saw.
        2 => 1.0 / hf,
        // Square.
        3 => if h % 2 == 1 { 1.0 / hf } else { 0.0 },
        // Pulse, a quarter wide.
        4 => (core::f32::consts::PI * hf * 0.25).sin() / hf,
        // A vowel: a formant around the eighth harmonic over a soft saw.
        5 => (-((hf - 8.0) / 2.5).powi(2)).exp() + 0.25 / hf,
        // Bright: every harmonic, falling slowly.
        6 => 1.0 / hf.sqrt(),
        // Hollow: two formants, the fourth and the eleventh, no fundamental weight to speak of.
        _ => 0.15 / hf + (-((hf - 4.0) / 1.2).powi(2)).exp() + 0.7 * (-((hf - 11.0) / 1.5).powi(2)).exp(),
    }
}

impl Tables {
    fn build() -> Self {
        let stride = TABLE + 1;
        let mut data = vec![0.0f32; FRAMES * LEVELS * stride];
        let mut re = vec![0.0f64; TABLE];
        let mut im = vec![0.0f64; TABLE];
        for f in 0..FRAMES {
            // Normalise a frame by the peak of its fullest level, so every level of it shares one gain.
            let mut peak = 0.0f32;
            for lvl in 0..LEVELS {
                let hmax = (1usize << (LEVELS - 1 - lvl)).min(TABLE / 2 - 1);
                // The sum of a_h sin(2 pi h t), by an inverse FFT: X[h] = -i a/2, X[N-h] = +i a/2.
                re.iter_mut().for_each(|v| *v = 0.0);
                im.iter_mut().for_each(|v| *v = 0.0);
                for h in 1..=hmax {
                    let a = harmonic(f, h) as f64;
                    im[h] = -a / 2.0;
                    im[TABLE - h] = a / 2.0;
                }
                ifft(&mut re, &mut im);
                let base = (f * LEVELS + lvl) * stride;
                for i in 0..TABLE {
                    data[base + i] = re[i] as f32;
                    if lvl == 0 {
                        peak = peak.max(re[i].abs() as f32);
                    }
                }
                data[base + TABLE] = data[base];
            }
            let g = 1.0 / peak.max(1e-6);
            for v in data[f * LEVELS * stride..(f + 1) * LEVELS * stride].iter_mut() {
                *v *= g;
            }
        }
        Tables { data }
    }

    /// Built once, the first time any synth is made (never on the audio thread after that).
    pub fn get() -> &'static Tables {
        static T: OnceLock<Tables> = OnceLock::new();
        T.get_or_init(Tables::build)
    }

    /// The level whose harmonics all fit under `TOP_HZ` for a note at `hz`.
    #[inline]
    pub fn level_for(hz: f32) -> usize {
        // Harmonics held at level l: 1024 >> l. Need (1024 >> l) * hz <= TOP_HZ.
        let need = (1_024.0 * hz.max(1.0) / TOP_HZ).log2().ceil();
        (need.max(0.0) as usize).min(LEVELS - 1)
    }

    /// Four-point Hermite between table samples: the fullest levels put a harmonic only a few samples
    /// a cycle, where straight-line interpolation would add images of its own.
    #[inline]
    fn read(&self, frame: usize, level: usize, phase: f32) -> f32 {
        let base = (frame * LEVELS + level) * (TABLE + 1);
        let x = phase * TABLE as f32;
        let i = (x as usize).min(TABLE - 1);
        let t = x - i as f32;
        let at = |k: isize| self.data[base + ((i as isize + k).rem_euclid(TABLE as isize)) as usize];
        let (y0, y1, y2, y3) = (at(-1), at(0), at(1), at(2));
        let c1 = 0.5 * (y2 - y0);
        let c2 = y0 - 2.5 * y1 + 2.0 * y2 - 0.5 * y3;
        let c3 = 0.5 * (y3 - y0) + 1.5 * (y1 - y2);
        ((c3 * t + c2) * t + c1) * t + y1
    }

    /// The table at `pos` (0..1 across the eight frames, crossfaded) for a note at `hz`.
    #[inline]
    pub fn sample(&self, pos: f32, hz: f32, phase: f32) -> f32 {
        let lvl = Self::level_for(hz);
        let p = pos.clamp(0.0, 1.0) * (FRAMES - 1) as f32;
        let f0 = (p as usize).min(FRAMES - 2);
        let t = p - f0 as f32;
        let a = self.read(f0, lvl, phase);
        if t < 1e-4 {
            return a;
        }
        a + (self.read(f0 + 1, lvl, phase) - a) * t
    }
}

/// In-place inverse FFT (radix 2, no scaling): x[n] = sum X[k] e^(2 pi i k n / N).
pub(crate) fn ifft(re: &mut [f64], im: &mut [f64]) {
    let n = re.len();
    let mut j = 0;
    for i in 1..n {
        let mut bit = n >> 1;
        while j & bit != 0 {
            j ^= bit;
            bit >>= 1;
        }
        j ^= bit;
        if i < j {
            re.swap(i, j);
            im.swap(i, j);
        }
    }
    let mut len = 2;
    while len <= n {
        let ang = std::f64::consts::TAU / len as f64;
        for i in (0..n).step_by(len) {
            for k in 0..len / 2 {
                let (wr, wi) = ((ang * k as f64).cos(), (ang * k as f64).sin());
                let (a, b) = (i + k, i + k + len / 2);
                let (tr, ti) = (re[b] * wr - im[b] * wi, re[b] * wi + im[b] * wr);
                re[b] = re[a] - tr;
                im[b] = im[a] - ti;
                re[a] += tr;
                im[a] += ti;
            }
        }
        len <<= 1;
    }
}

/// Feedback fm. `beta` 0 is a sine; about 1.5 a saw; towards 4 it breaks into noise.
#[derive(Clone, Copy, Default)]
pub struct FbFm {
    y1: f32,
    y2: f32,
}

impl FbFm {
    #[inline]
    pub fn next(&mut self, phase: f32, beta: f32) -> f32 {
        let fb = beta * 0.5 * (self.y1 + self.y2);
        let ph = phase + fb * (1.0 / core::f32::consts::TAU);
        let y = super::sin_cycle(ph - ph.floor());
        self.y2 = self.y1;
        self.y1 = y;
        y
    }

    pub fn reset(&mut self) {
        self.y1 = 0.0;
        self.y2 = 0.0;
    }
}

/// Casio CZ phase distortion, the saw shape: `amount` 0 is a cosine, towards 1 a saw. `dt` is the
/// phase step (hz / rate), which caps the bend so the steep part of the wave lasts at least 4 samples.
#[inline]
pub fn phase_distort(phase: f32, amount: f32, dt: f32) -> f32 {
    let cap = (1.0 - 8.0 * dt).max(0.0);
    let d = amount.clamp(0.0, 1.0) * 0.98 * cap;
    let m = 0.5 * (1.0 - d);
    let p = if phase < m { phase * 0.5 / m } else { 0.5 + (phase - m) * 0.5 / (1.0 - m) };
    // cos, from the sine: cos(2 pi p) = sin(2 pi (p + 0.25)).
    -super::sin_cycle((p + 0.25).fract())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn tables_hold_the_frames_and_build_fast() {
        let t0 = std::time::Instant::now();
        let t = Tables::build();
        let ms = t0.elapsed().as_secs_f64() * 1000.0;
        assert!(ms < 500.0, "built in {ms:.0} ms");
        // Frame 0, any level, is a sine of peak 1.
        for (i, ph) in [0.0f32, 0.125, 0.25, 0.6].iter().enumerate() {
            let want = (core::f32::consts::TAU * ph).sin();
            assert!((t.read(0, 3, *ph) - want).abs() < 2e-3, "{i}");
        }
        // The saw's top level carries only the fundamental.
        assert!((t.read(2, LEVELS - 1, 0.25).abs() - t.read(2, LEVELS - 1, 0.75).abs()).abs() < 1e-3);
        assert_eq!(Tables::level_for(20.0), 0);
        assert_eq!(Tables::level_for(4_186.0), 7);
    }
}
