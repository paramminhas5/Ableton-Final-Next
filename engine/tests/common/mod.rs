//! Measurement helpers shared by the sound tests.
#![allow(dead_code)]
pub const SR: f32 = 48_000.0;

pub fn db(x: f32) -> f32 {
    20.0 * x.max(1e-9).log10()
}

pub fn rms(y: &[f32]) -> f32 {
    (y.iter().map(|v| v * v).sum::<f32>() / y.len().max(1) as f32).sqrt()
}

/// A pure sine from f64 maths, so the test signal adds no harmonics of its own.
pub fn sine(hz: f64, n: usize, amp: f32) -> Vec<f32> {
    (0..n).map(|i| (amp as f64 * (std::f64::consts::TAU * hz * i as f64 / SR as f64).sin()) as f32).collect()
}

/// Magnitude spectrum of a Blackman-Harris-windowed block, power of two length.
pub fn spectrum(y: &[f32]) -> Vec<f32> {
    let n = y.len();
    // 4-term Blackman-Harris: sidelobes below -92 dB, so the measurement floor sits far under what we measure.
    let w = |i: usize| { let t = std::f64::consts::TAU * i as f64 / n as f64; 0.35875 - 0.48829 * t.cos() + 0.14128 * (2.0 * t).cos() - 0.01168 * (3.0 * t).cos() };
    let mut re: Vec<f64> = y.iter().enumerate().map(|(i, v)| *v as f64 * w(i)).collect();
    let mut im = vec![0.0f64; n];
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
        }
    }
    let mut len = 2;
    while len <= n {
        let ang = -std::f64::consts::TAU / len as f64;
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
    (0..n / 2).map(|i| (re[i] * re[i] + im[i] * im[i]).sqrt() as f32).collect()
}

/// Energy that is not near a harmonic of f0, against the harmonic energy, in dB.
pub fn inharmonic_db(y: &[f32], f0: f32) -> f32 {
    let s = spectrum(y);
    let n = y.len() as f32;
    let (mut harm, mut other) = (0.0f64, 0.0f64);
    for (bin, m) in s.iter().enumerate() {
        let f = bin as f32 * SR / n;
        if !(30.0..20_000.0).contains(&f) {
            continue;
        }
        let h = (f / f0).round().max(1.0);
        let near = (f - h * f0).abs() < 5.0 * SR / n;
        let e = (*m as f64).powi(2);
        if near {
            harm += e;
        } else {
            other += e;
        }
    }
    10.0 * ((other / harm) as f32).max(1e-12).log10()
}

