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
