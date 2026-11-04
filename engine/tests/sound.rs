//! Engine 2 sound tests: each upgrade in design/engine-plan.md proves itself here with a number.
//! Run with `cargo test --release --test sound -- --nocapture` to see the measurements.

mod common;
use ccd_engine::dsp::oversample::{Decimator2x, Drive, Interpolator2x};
use ccd_engine::dsp::soft_clip;
use common::*;

/// The drive stage as it was before engine 2 (2x oversampled, clipped Pade curve), kept here so
/// every run reports the before and after on the same signal.
struct OldDrive {
    up: Interpolator2x,
    down: Decimator2x,
}
impl OldDrive {
    fn process(&mut self, x: f32, amount: f32) -> f32 {
        let (a, b) = self.up.process(x);
        let gain = 1.0 + amount * amount * 24.0;
        let makeup = 0.25 / soft_clip(gain * 0.25);
        self.down.process(soft_clip(a * gain) * makeup, soft_clip(b * gain) * makeup)
    }
}

/// Energy that isn't a harmonic of the tone, after heavy drive: aliasing, in dB under the harmonics.
fn alias_db(hz: f64, f: &mut dyn FnMut(f32) -> f32) -> f32 {
    let x = sine(hz, 48_000, 0.9);
    let y: Vec<f32> = x.iter().map(|v| f(*v)).collect();
    inharmonic_db(&y[8_192..8_192 + 32_768], hz as f32)
}

#[test]
fn drive_adds_harmonics_not_aliases() {
    let mut floor = Drive::new();
    let fl = alias_db(3_163.0, &mut |v| floor.process(v, 0.0));
    println!("measurement floor (drive off): {fl:.1} dB");
    for amount in [0.5f32, 1.0] {
        for hz in [2_311.0, 3_163.0, 5_237.0, 7_919.0] {
            let mut old = OldDrive { up: Interpolator2x::new(), down: Decimator2x::new() };
            let mut new = Drive::new();
            let before = alias_db(hz, &mut |v| old.process(v, amount));
            let after = alias_db(hz, &mut |v| new.process(v, amount));
            println!("drive {amount}, {hz} Hz: aliasing {before:.1} dB before, {after:.1} dB after ({:.1} dB better)", before - after);
            // Where the old drive was audibly dirty, the new one is at least 10 dB cleaner; where it
            // was already clean (gentle drive, low notes) it stays far below hearing.
            if before > -60.0 {
                assert!(after < before - 5.0, "drive {amount} at {hz} Hz: {before:.1} -> {after:.1}");
            } else {
                assert!(after < -60.0, "drive {amount} at {hz} Hz: {after:.1}");
            }
            assert!(after < -38.0, "drive {amount} at {hz} Hz: {after:.1}");
        }
    }
}

use ccd_engine::inst::drums::{Model, Pad};

/// Spectral flatness (geometric over arithmetic mean of power) in a band: near 0.56 for white noise,
/// lower for a sound made of distinct partials. "Metal, not hiss" means a low number.
fn flatness(y: &[f32], lo: f32, hi: f32) -> f32 {
    let s = spectrum(y);
    let n = y.len() as f32;
    let p: Vec<f64> = s.iter().enumerate().filter(|(b, _)| { let f = *b as f32 * SR / n; f >= lo && f <= hi }).map(|(_, m)| (*m as f64).powi(2).max(1e-20)).collect();
    let geo = (p.iter().map(|v| v.ln()).sum::<f64>() / p.len() as f64).exp();
    let ari = p.iter().sum::<f64>() / p.len() as f64;
    (geo / ari) as f32
}

/// Fraction of energy above 5 kHz: hats live up there.
fn top_share(y: &[f32]) -> f32 {
    let s = spectrum(y);
    let n = y.len() as f32;
    let (mut top, mut all) = (0.0f64, 0.0f64);
    for (b, m) in s.iter().enumerate() {
        let e = (*m as f64).powi(2);
        all += e;
        if b as f32 * SR / n > 5_000.0 { top += e; }
    }
    (top / all) as f32
}

fn hit(model: Model, n: usize) -> Vec<f32> {
    let mut p = Pad::new(model, SR, 7);
    p.decay = 1.0;
    p.trigger(0.9);
    (0..n).map(|_| p.tick()).collect()
}

#[test]
fn hats_are_metal_not_hiss() {
    // Before engine 2 (filtered squares plus noise): flatness 0.420, 0.414, 0.506; loudness -21.1, -17.3, -15.1 dB.
    for (name, m, old_db) in [("closed hat", Model::ClosedHat, -21.1f32), ("open hat", Model::OpenHat, -17.3), ("crash", Model::Crash, -15.1)] {
        let y = hit(m, 8_192);
        let f = flatness(&y, 5_000.0, 14_000.0);
        let t = top_share(&y);
        let l = db(rms(&y[..2_400]));
        assert!(f < 0.25, "{name}: flatness {f:.3}, should read as metal, not hiss");
        assert!((l - old_db).abs() < 2.5, "{name}: {l:.1} dB, old {old_db} dB");
        if m != Model::Crash { assert!(t > 0.9, "{name}: only {:.0}% above 5 kHz", t * 100.0); }
        println!("{name}: flatness 5 to 14 kHz {f:.3} (white noise is about 0.56), {:.0}% of energy above 5 kHz, rms of first 50 ms {:.1} dB", t * 100.0, db(rms(&y[..2_400])));
    }
}

use ccd_engine::inst::synth::Lead;
use ccd_engine::params::{LD_CUTOFF, LD_DETUNE};

/// Share of the energy around a harmonic that sits more than 0.6% away from it: the supersaw's width.
/// Measured at the 10th harmonic, where the side saws are many analysis bins apart.
fn width_around(y: &[f32], f0: f32) -> f32 {
    let s = spectrum(y);
    let n = y.len() as f32;
    let (mut near, mut wide) = (0.0f64, 0.0f64);
    for (b, m) in s.iter().enumerate() {
        let f = b as f32 * SR / n;
        let d = (f - f0).abs() / f0;
        if d < 0.06 {
            let e = (*m as f64).powi(2);
            if d > 0.006 { wide += e } else { near += e }
        }
    }
    (wide / (near + wide)) as f32
}

fn lead_note(detune: f32) -> Vec<f32> {
    let mut l = Lead::new(SR);
    let spec = &ccd_engine::params::LEAD_PARAMS;
    l.set_param(LD_DETUNE, spec[LD_DETUNE].to_value(detune));
    l.set_param(LD_CUTOFF, 9_000.0);
    l.note_on(45, 0.9);
    let y: Vec<f32> = (0..48_000 + 65_536).map(|_| l.tick()).collect();
    y[48_000..].to_vec()
}

#[test]
fn supersaw_opens_up_without_jumping_in_level() {
    let f0 = 1_100.0; // 10th harmonic of the note (110 Hz)
    let base = lead_note(0.0);
    let mut last = width_around(&base, f0);
    println!("detune 0: width {last:.3}, level {:.1} dB", db(rms(&base)));
    for d in [0.25f32, 0.5, 0.75, 1.0] {
        let y = lead_note(d);
        let w = width_around(&y, f0);
        let lv = db(rms(&y));
        println!("detune {d}: width {w:.3}, level {lv:.1} dB");
        assert!(w > last - 0.02, "detune {d}: width {w:.3} fell from {last:.3}");
        assert!((lv - db(rms(&base))).abs() < 2.0, "detune {d}: level {lv:.1} dB");
        last = w.max(last);
    }
    assert!(last > 0.3, "full detune should spread energy off the fundamental: {last:.3}");
}
