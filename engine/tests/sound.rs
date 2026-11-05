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

/// The kick as it was before engine 2 item 5: one pitch sweep and a burst of high-passed noise.
/// Rebuilt here from its formula (body only, the click is under 12 ms) so every run measures both.
fn old_kick(n: usize) -> Vec<f32> {
    let sr = SR as f64;
    let k60 = |s: f64| (-6.907_755 / (s * sr)).exp();
    let (cp, ca) = (k60(0.11), k60(0.45 * 4.0f64.powf(1.0)));
    let (mut pe, mut a, mut ph) = (1.0f64, 1.0f64, 0.0f64);
    (0..n).map(|_| {
        let f = 48.0 * (1.0 + 4.5 * pe * pe + 1.2 * pe);
        let y = (ph * std::f64::consts::TAU).sin() * 1.05 * a;
        ph = (ph + f / sr).fract();
        pe *= cp;
        a *= ca;
        y as f32
    }).collect()
}

/// Mean pitch between two times, from the zero crossings of the body.
fn pitch_between(y: &[f32], t0: f32, t1: f32) -> f32 {
    let (a, b) = ((t0 * SR) as usize, (t1 * SR) as usize);
    let ups: Vec<f32> = (a.max(1)..b).filter(|&i| y[i - 1] < 0.0 && y[i] >= 0.0).map(|i| {
        let fr = -y[i - 1] / (y[i] - y[i - 1]);
        (i - 1) as f32 + fr
    }).collect();
    if ups.len() < 2 { return 0.0; }
    (ups.len() - 1) as f32 * SR / (ups[ups.len() - 1] - ups[0])
}

#[test]
fn kick_has_an_attack_bump_and_a_sigh() {
    let new = hit(Model::Kick, (SR * 0.9) as usize);
    let old = old_kick(new.len());
    // The sigh: how far the pitch falls from early in the tail to late in it.
    let sigh = |y: &[f32]| 1.0 - pitch_between(y, 0.45, 0.8) / pitch_between(y, 0.12, 0.3);
    let (sn, so) = (sigh(&new), sigh(&old));
    // The bump: the first cycle's pitch over the pitch 25 to 45 ms in.
    let bump = |y: &[f32]| pitch_between(y, 0.0, 0.012) / pitch_between(y, 0.04, 0.1);
    let (bn, bo) = (bump(&new), bump(&old));
    // Loudness of the first 100 ms stays where the old pad was (-6.2 dB, measured on the pad before
    // this change), so the a/b isn't won by level.
    let (ln, lo) = (db(rms(&new[..(SR * 0.1) as usize])), -6.2f32);
    println!("kick sigh {:.1}% (old {:.1}%), attack {:.2}x the body pitch (old {:.2}x), first 100 ms {ln:.1} dB (old {lo:.1} dB)", sn * 100.0, so * 100.0, bn, bo);
    assert!(sn > 0.03 && so < 0.01, "the tail should sigh down: new {sn:.3}, old {so:.3}");
    assert!(bn > bo * 1.05, "the attack should start higher: new {bn:.2}, old {bo:.2}");
    assert!((ln - lo).abs() < 1.5, "level moved: {ln:.1} vs {lo:.1} dB");
}

/// The old kick's amplitude at a given decay knob: one exponential, no hold (rebuilt from its formula).
fn old_kick_at(decay: f32, n: usize) -> Vec<f32> {
    let sr = SR as f64;
    let len = 0.45 * 4.0f64.powf((decay as f64 - 0.5) * 2.0);
    let k60 = |s: f64| (-6.907_755 / (s * sr)).exp();
    let (cp, ca) = (k60(0.11), k60(len));
    let (mut pe, mut a, mut ph) = (1.0f64, 1.0f64, 0.0f64);
    (0..n).map(|_| {
        let f = 48.0 * (1.0 + 4.5 * pe * pe + 1.2 * pe);
        let y = (ph * std::f64::consts::TAU).sin() * 1.05 * a;
        ph = (ph + f / sr).fract();
        pe *= cp;
        a *= ca;
        y as f32
    }).collect()
}

fn kick_at(decay: f32, n: usize) -> Vec<f32> {
    let mut p = Pad::new(Model::Kick, SR, 7);
    p.decay = decay;
    p.trigger(0.9);
    (0..n).map(|_| p.tick()).collect()
}

/// Peak of the body in a window: the envelope, one cycle or more at a time.
fn peak_in(y: &[f32], t0: f32, t1: f32) -> f32 {
    y[(t0 * SR) as usize..(t1 * SR) as usize].iter().fold(0.0f32, |m, v| m.max(v.abs()))
}

#[test]
fn kick_holds_then_rings_out() {
    // Engine 2 item 5, part two. At the middle decay (0.45 s to -60 dB): the hold keeps the punch at full
    // level for 18 ms, and a second, slower decay under it lets the tail ring out instead of fading away.
    let n = (SR * 1.2) as usize;
    let (new, old) = (kick_at(0.5, n), old_kick_at(0.5, n));
    // Hold: how far the body has fallen by 15 to 25 ms, against its level in the first 10 ms.
    let held = |y: &[f32]| db(peak_in(y, 0.015, 0.025) / peak_in(y, 0.002, 0.012));
    // Ring: the tail 300 to 400 ms in, against the body 40 to 80 ms in.
    let ring = |y: &[f32]| db(peak_in(y, 0.3, 0.4) / peak_in(y, 0.04, 0.08));
    let (hn, ho, rn, ro) = (held(&new), held(&old), ring(&new), ring(&old));
    let (ln, lo) = (db(rms(&new[..(SR * 0.1) as usize])), db(rms(&old[..(SR * 0.1) as usize])));
    println!("kick hold: {hn:.1} dB by 20 ms (old {ho:.1} dB); tail at 350 ms: {rn:.1} dB under the body (old {ro:.1} dB); first 100 ms {ln:.1} dB (old {lo:.1} dB)");
    assert!(hn > ho + 0.5, "the hold should keep the punch up: new {hn:.1}, old {ho:.1}");
    assert!(rn > ro + 4.0, "the tail should ring out: new {rn:.1}, old {ro:.1}");
    assert!((ln - lo).abs() < 1.5, "level moved: {ln:.1} vs {lo:.1} dB");
}

// ── Engine 2, item 6: the master chain ───────────────────────────────────────────────────────────

use ccd_engine::loudness::{integrated_lufs, normalise, Loudness};
use ccd_engine::master::{reference::bs1770_true_peak, Glue, CEILING_DB};

/// A stereo sine at `dbfs` peak on both channels, `secs` long (the EBU Tech 3341 test signals).
fn tone(dbfs: f32, secs: f32, hz: f64) -> Vec<f32> {
    sine(hz, (SR * secs) as usize, 10f32.powf(dbfs / 20.0))
}

#[test]
fn loudness_meter_reads_the_standards_reference_signals() {
    // EBU Tech 3341 (2016) test cases 1 to 5: each must read -23.0 LUFS integrated (case 2: -33.0),
    // within 0.1 LU. They test the K-weighting, the absolute gate (-70) and the relative gate (-10 LU).
    let cases: [(&str, Vec<(f32, f32)>, f32); 5] = [
        ("case 1: 1 kHz at -23 dBFS, 20 s", vec![(-23.0, 20.0)], -23.0),
        ("case 2: 1 kHz at -33 dBFS, 20 s", vec![(-33.0, 20.0)], -33.0),
        ("case 3: -36 / -23 / -36 dBFS, 10 / 60 / 10 s", vec![(-36.0, 10.0), (-23.0, 60.0), (-36.0, 10.0)], -23.0),
        ("case 4: -72 / -36 / -23 / -36 / -72 dBFS", vec![(-72.0, 10.0), (-36.0, 10.0), (-23.0, 60.0), (-36.0, 10.0), (-72.0, 10.0)], -23.0),
        ("case 5: -26 / -20 / -26 dBFS, 20 / 20.1 / 20 s", vec![(-26.0, 20.0), (-20.0, 20.1), (-26.0, 20.0)], -23.0),
    ];
    for (name, parts, want) in cases {
        let x: Vec<f32> = parts.iter().flat_map(|(d, s)| tone(*d, *s, 1_000.0)).collect();
        let got = integrated_lufs(&x, &x, SR);
        println!("ebu 3341 {name}: {got:.2} LUFS (want {want:.1})");
        assert!((got - want).abs() <= 0.1, "{name}: {got:.2}");
    }
    // Momentary and short-term on a steady tone, and BS.1770's own figure: a 0 dBFS 997 Hz sine in one
    // channel reads -3.01 LKFS.
    let mut m = Loudness::new(SR);
    for v in tone(-23.0, 4.0, 1_000.0) {
        m.tick(v, v);
    }
    let r = m.read();
    println!("steady -23 dBFS tone: momentary {:.2}, short-term {:.2} LUFS", r.momentary, r.short_term);
    assert!((r.momentary + 23.0).abs() <= 0.1 && (r.short_term + 23.0).abs() <= 0.1);
    let one = tone(0.0, 10.0, 997.0);
    let got = integrated_lufs(&one, &vec![0.0; one.len()], SR);
    println!("bs.1770: 997 Hz at 0 dBFS in one channel: {got:.2} LKFS (want -3.01)");
    assert!((got + 3.01).abs() <= 0.1);
}

/// The glue as it was before item 6, kept so every run measures both: ratio tied to the knob
/// (2 + 2 x amount), no sidechain filter, no mix.
struct OldGlue {
    amount: f32,
    ms: f32,
    fast: f32,
    slow: f32,
    k: [f32; 5],
}
impl OldGlue {
    fn new(amount: f32) -> Self {
        let c = |s: f32| (-1.0 / (s * SR)).exp();
        OldGlue { amount, ms: 0.0, fast: 0.0, slow: 0.0, k: [c(0.005), c(0.010), c(0.120), c(0.400), c(1.200)] }
    }
    fn curve(&self, level: f32) -> f32 {
        let (t, ratio, knee) = (-2.0 - 16.0 * self.amount, 2.0 + 2.0 * self.amount, 8.0);
        let (over, s) = (level - t, 1.0 - 1.0 / ratio);
        if 2.0 * over <= -knee { 0.0 } else if 2.0 * over >= knee { over * s } else { s * (over + knee / 2.0).powi(2) / (2.0 * knee) }
    }
    fn tick(&mut self, l: f32, r: f32) -> f32 {
        let x = (l * l).max(r * r);
        self.ms = x + (self.ms - x) * self.k[0];
        let target = self.curve(10.0 * (self.ms + 1e-12).log10() + 3.01);
        let c = if target > self.fast { self.k[1] } else { self.k[2] };
        self.fast = target + (self.fast - target) * c;
        let c = if target > self.slow { self.k[3] } else { self.k[4] };
        self.slow = target + (self.slow - target) * c;
        10f32.powf((self.amount * 2.5 - self.fast.max(self.slow)) / 20.0)
    }
}

#[test]
fn glue_ratio_switch_sets_the_gain_reduction() {
    // A steady 1 kHz tone at -1 dB, 9 dB over the threshold (glue at 0.5: threshold -10 dB): the gain
    // reduction settles on 9 x (1 - 1/ratio).
    let x = tone(-1.0, 3.0, 1_000.0);
    let mut old = OldGlue::new(0.5);
    for v in &x {
        old.tick(*v, *v);
    }
    let old_gr = old.fast.max(old.slow);
    println!("glue 0.5, tone 9 dB over: old glue {old_gr:.2} dB (its ratio was fixed by the knob at 3:1)");
    let mut last = 0.0;
    for (n, ratio) in [(0.0, 2.0f32), (0.5, 4.0), (1.0, 10.0)] {
        let mut g = Glue::new(SR);
        g.set_amount(0.5);
        g.set_ratio(ccd_engine::master::glue_ratio(n));
        for v in &x {
            g.tick(*v, *v);
        }
        let want = 9.0 * (1.0 - 1.0 / ratio);
        println!("ratio {ratio}:1: gain reduction {:.2} dB (static curve says {want:.2})", g.gr_db);
        assert!((g.gr_db - want).abs() < 0.4, "ratio {ratio}: {:.2} vs {want:.2}", g.gr_db);
        assert!(g.gr_db > last);
        last = g.gr_db;
    }
}

/// A four-to-the-floor kick (a 50 Hz body falling from 150 Hz, 300 ms) under a held chord, 120 bpm.
fn kick_and_pad(secs: f32) -> Vec<f32> {
    let n = (SR * secs) as usize;
    let beat = (SR * 0.5) as usize;
    let mut ph = 0.0f64;
    (0..n).map(|i| {
        let t = (i % beat) as f64 / SR as f64;
        let f = 50.0 + 100.0 * (-t / 0.02).exp();
        ph += f / SR as f64;
        let kick = 0.9 * (std::f64::consts::TAU * ph).sin() * (-t / 0.12).exp();
        let ts = i as f64 / SR as f64;
        let pad: f64 = [220.0, 277.2, 329.6, 440.0].iter().map(|h| 0.07 * (std::f64::consts::TAU * h * ts).sin()).sum();
        (kick + pad) as f32
    }).collect()
}

/// Pumping, steady state: the held chord's average dip under its own level in each beat, dB (how far,
/// and for how long, the bus gain falls below where it sits between kicks). A short dip on the kick's
/// click barely counts; a dip that holds through the beat counts in full.
fn pumping(mut gain: impl FnMut(f32) -> f32, x: &[f32]) -> f32 {
    let g: Vec<f32> = x.iter().map(|v| 20.0 * gain(*v).log10()).collect();
    let tail = &g[g.len() - (SR * 2.0) as usize..];
    tail.chunks((SR * 0.5) as usize).map(|c| {
        let top = c.iter().cloned().fold(f32::MIN, f32::max);
        c.iter().map(|v| top - v).sum::<f32>() / c.len() as f32
    }).sum::<f32>() / 4.0
}

#[test]
fn glue_listens_past_the_kick_so_the_mix_does_not_pump() {
    let x = kick_and_pad(6.0);
    let amount = 0.6;
    let mut old = OldGlue::new(amount);
    let before = pumping(|v| old.tick(v, v), &x);
    let run = |ratio_n: f32, sc_hz: f32| {
        let mut g = Glue::new(SR);
        g.set_amount(amount);
        g.set_ratio(ccd_engine::master::glue_ratio(ratio_n));
        g.set_sidechain(sc_hz);
        pumping(|v| g.tick(v, v), &x)
    };
    let (open4, cut4, cut2) = (run(0.5, 20.0), run(0.5, 90.0), run(0.0, 90.0));
    println!("pumping (average dip of a held chord under a kick, glue {amount}): old glue {before:.2} dB; new at 4:1 hearing everything {open4:.2} dB, at 4:1 with the 90 Hz sidechain cut {cut4:.2} dB, default (2:1, 90 Hz) {cut2:.2} dB");
    // The cut takes out the dip the long 50 Hz body held; the click and the sweep from 150 Hz still get through.
    assert!(cut4 < open4 * 0.8, "the sidechain cut should take pumping out: {cut4:.2} vs {open4:.2}");
    assert!(cut2 < before * 0.5, "the default should pump far less than the old glue: {cut2:.2} vs {before:.2}");
    // The mix knob: half dry, half compressed dips less again.
    let mut g = Glue::new(SR);
    g.set_amount(amount);
    g.set_ratio(10.0);
    g.set_mix(0.5, true);
    let mut h = Glue::new(SR);
    h.set_amount(amount);
    h.set_ratio(10.0);
    let (half, full) = (pumping(|v| g.tick(v, v), &x), pumping(|v| h.tick(v, v), &x));
    println!("10:1 hearing everything: {full:.2} dB, at half mix {half:.2} dB");
    assert!(half < full * 0.7);
}

#[test]
fn export_lands_on_the_loudness_target_under_the_ceiling() {
    // A dense, peaky signal (the kick and chord, then pushed): normalised to the streaming target and to
    // the loud target. Both must land within 0.1 LU and stay under -1 dBTP on the standard's meter.
    for (target, name) in [(ccd_engine::loudness::EXPORT_LUFS, "streaming"), (ccd_engine::loudness::EXPORT_LOUD_LUFS, "loud")] {
        let x = kick_and_pad(8.0);
        let (mut l, mut r) = (x.iter().map(|v| v * 0.3).collect::<Vec<f32>>(), x.iter().map(|v| v * 0.25).collect::<Vec<f32>>());
        let before = integrated_lufs(&l, &r, SR);
        let n = normalise(&mut l, &mut r, SR, target);
        let tp = 20.0 * bs1770_true_peak(&l).max(bs1770_true_peak(&r)).log10();
        println!("export {name}: {before:.1} LUFS in, {:.2} LUFS out (target {target}), gain {:+.1} dB, true peak {tp:.2} dBTP, limited {}", n.lufs, n.gain_db, n.limited);
        assert!((n.lufs - target).abs() <= 0.1, "{name}: {:.2}", n.lufs);
        assert!(tp <= CEILING_DB + 0.05, "{name}: {tp:.2} dBTP");
    }
}
