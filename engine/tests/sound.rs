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

// ── Engine 2, item 5, part three: three kick bodies ─────────────────────────────────────────────

#[test]
fn kick_has_three_body_shapes() {
    // The body's overtones against its fundamental, in the tail (120 to 290 ms, where the pitch has
    // settled near 50 Hz): round is a sine, tight rounds it towards a square, hard clips it nearly square.
    let take = |shape: u8| {
        let mut p = Pad::new(Model::Kick, SR, 7);
        p.shape = shape;
        p.trigger(0.9);
        (0..(SR * 0.6) as usize).map(|_| p.tick()).collect::<Vec<f32>>()
    };
    let over = |y: &[f32]| {
        let a = (SR * 0.12) as usize;
        let s = spectrum(&y[a..a + 8_192]);
        let bin = SR / 8_192.0;
        let band = |lo: f32, hi: f32| s.iter().enumerate().filter(|(i, _)| (*i as f32 * bin) >= lo && (*i as f32 * bin) < hi).map(|(_, m)| (*m as f64).powi(2)).sum::<f64>();
        10.0 * (band(75.0, 4_000.0) / band(30.0, 75.0)).log10() as f32
    };
    let round = take(0);
    let base_level = db(rms(&round[..(SR * 0.1) as usize]));
    let mut last = f32::MIN;
    for (shape, name) in [(0u8, "round"), (1, "tight"), (2, "hard")] {
        let y = take(shape);
        let (o, lv) = (over(&y), db(rms(&y[..(SR * 0.1) as usize])));
        println!("kick body {name}: overtones {o:.1} dB against the fundamental, first 100 ms {lv:.1} dB");
        assert!(o > last + 6.0, "{name} should carry more overtones: {o:.1} after {last:.1}");
        assert!((lv - base_level).abs() < 1.5, "{name} moved the level: {lv:.1} vs {base_level:.1}");
        assert!(y.iter().all(|v| v.is_finite()));
        last = o;
    }
}

// ── Engine 2, item 7: three filter characters ─────────────────────────────────────────────────────

use ccd_engine::dsp::filter::{CharFilter, FilterDrive, SCREAM, SMOOTH, WARM};
use ccd_engine::inst::{Bass, Poly};
use ccd_engine::params::*;

const OS: f32 = 96_000.0;
const CHARS: [(u8, &str); 3] = [(WARM, "warm"), (SCREAM, "scream"), (SMOOTH, "smooth")];

/// Gain of a filter at one frequency, small signal (the linear part of its response), dB.
fn gain_at(mode: u8, fc: f32, res: f32, hz: f64) -> f32 {
    let mut f = CharFilter::default();
    f.set_mode(mode);
    f.set(fc, res, OS);
    let n = (OS * 0.4) as usize;
    let amp = 0.02;
    let mut acc = 0.0f64;
    for i in 0..n {
        let x = (amp as f64 * (std::f64::consts::TAU * hz * i as f64 / OS as f64).sin()) as f32;
        let y = f.tick(x);
        if i >= n / 2 {
            acc += (y * y) as f64;
        }
    }
    db(((acc / (n / 2) as f64).sqrt() as f32) / (amp / 2f32.sqrt()))
}

#[test]
fn filter_characters_each_have_their_own_response() {
    for (mode, name) in CHARS {
        let g = |res: f32, hz: f64| gain_at(mode, 1_000.0, res, hz);
        let slope = g(0.0, 8_000.0) - g(0.0, 4_000.0);
        let (pass0, pass6) = (g(0.0, 60.0), g(0.6, 60.0));
        let (peak0, peak6) = (g(0.0, 1_000.0), g(0.6, 1_000.0));
        println!("{name}: cutoff 1 kHz, {slope:.1} dB per octave above it; at res 0.6 the bass (60 Hz) moves {:+.1} dB and the cutoff rises {:+.1} dB", pass6 - pass0, peak6 - peak0);
        match mode {
            WARM => {
                assert!(slope < -20.0, "{name}: {slope:.1}");
                assert!(pass6 - pass0 < -1.0, "the ladder loses bass as resonance rises: {:.1}", pass6 - pass0);
            }
            _ => {
                assert!((-15.0..-9.0).contains(&slope), "{name}: {slope:.1}");
                assert!((pass6 - pass0).abs() < 0.5, "{name} keeps its bass: {:.1}", pass6 - pass0);
            }
        }
        assert!(peak6 - peak0 > 6.0, "{name}: resonance should peak at the cutoff: {:.1}", peak6 - peak0);
    }
}

#[test]
fn warm_and_scream_self_oscillate_smooth_rings_out() {
    for (mode, name) in CHARS {
        let mut f = CharFilter::default();
        f.set_mode(mode);
        f.set(1_000.0, 1.0, OS);
        let mut y = vec![f.tick(0.5)];
        y.extend((0..(OS as usize)).map(|_| f.tick(0.0)));
        let tail = &y[(OS * 0.8) as usize..];
        let level = db(rms(tail));
        let earlier = db(rms(&y[(OS * 0.4) as usize..(OS * 0.6) as usize]));
        // Pitch of the ring, from upward zero crossings.
        let ups: Vec<usize> = (1..tail.len()).filter(|&i| tail[i - 1] < 0.0 && tail[i] >= 0.0).collect();
        let hz = if ups.len() > 2 { (ups.len() - 1) as f32 * OS / (ups[ups.len() - 1] - ups[0]) as f32 } else { 0.0 };
        println!("{name}: full resonance, a second after a click: {level:.1} dB{}", if hz > 0.0 && level > -60.0 { format!(", ringing at {hz:.0} Hz (cutoff 1000)") } else { String::new() });
        assert!(y.iter().all(|v| v.is_finite() && v.abs() < 2.0));
        if mode == SMOOTH {
            assert!(level < -80.0, "smooth should never self-oscillate: {level:.1}");
        } else {
            // A steady ring, not a decay: as loud at the end of the second as 400 ms in.
            assert!(level > -40.0 && (level - earlier).abs() < 1.0, "{name} should self-oscillate: {earlier:.1} then {level:.1}");
            assert!((hz - 1_000.0).abs() < 120.0, "{name} rings at {hz:.0}");
        }
    }
}

fn bass_line(char_n: f32, set: &[(usize, f32)]) -> Vec<f32> {
    let mut b = Bass::new(SR);
    let spec = |i: usize| &BASS_PARAMS[i];
    b.set_param(B_CHAR, spec(B_CHAR).to_value(char_n));
    for (i, n) in set {
        b.set_param(*i, spec(*i).to_value(*n));
    }
    let mut y = Vec::new();
    for (k, note) in [33u8, 33, 45, 36, 31, 33, 40, 28].iter().enumerate() {
        b.note_on(*note, 0.9);
        for _ in 0..(SR * 0.18) as usize {
            y.push(b.tick());
        }
        b.note_off(*note);
        for _ in 0..(SR * 0.06) as usize {
            y.push(b.tick());
        }
        let _ = k;
    }
    y
}

#[test]
fn resonance_stays_stable_under_a_fast_envelope_and_nothing_breaks_at_the_extremes() {
    // A bass line with the resonance and the filter envelope at full and the shortest decay: the cutoff
    // sweeps several octaves in 30 ms, every note.
    for (k, (_, name)) in CHARS.iter().enumerate() {
        let n = k as f32 * 0.5;
        for fd in [0.0, 1.0] {
            let y = bass_line(n, &[(B_RES, 1.0), (B_ENV, 1.0), (B_DECAY, 0.0), (B_CUTOFF, 0.3), (B_FDRIVE, fd)]);
            let peak = y.iter().fold(0.0f32, |m, v| m.max(v.abs()));
            println!("{name}, drive {fd}: full resonance, fast envelope: peak {peak:.2}");
            assert!(y.iter().all(|v| v.is_finite()) && peak < 2.0, "{name}: peak {peak}");
        }
    }
    // Every synth, every character, at the ends of every filter knob and the ends of the keyboard.
    for ch in [0.0f32, 0.5, 1.0] {
        for (cut, res, fd) in [(0.0f32, 0.0f32, 0.0f32), (1.0, 1.0, 1.0), (0.0, 1.0, 1.0), (1.0, 0.0, 1.0)] {
            let mut b = Bass::new(SR);
            let mut l = Lead::new(SR);
            let mut p = Poly::new(SR);
            for (i, v) in [(B_CHAR, ch), (B_CUTOFF, cut), (B_RES, res), (B_FDRIVE, fd), (B_ENV, 1.0)] {
                b.set_param(i, BASS_PARAMS[i].to_value(v));
            }
            for (i, v) in [(LD_CHAR, ch), (LD_CUTOFF, cut), (LD_RES, res), (LD_FDRIVE, fd), (LD_ENV, 1.0)] {
                l.set_param(i, LEAD_PARAMS[i].to_value(v));
            }
            for (i, v) in [(C_CHAR, ch), (C_CUTOFF, cut), (C_RES, res), (C_FDRIVE, fd), (C_ENV, 1.0)] {
                p.set_param(i, CHORD_PARAMS[i].to_value(v));
            }
            for note in [0u8, 127] {
                for vel in [0.0, 1.0] {
                    b.note_on(note, vel);
                    l.note_on(note, vel);
                    p.note_on(note, vel);
                    for _ in 0..4_800 {
                        let ys = [b.tick(), l.tick(), p.tick()];
                        assert!(ys.iter().all(|v| v.is_finite() && v.abs() < 4.0), "character {ch}, cutoff {cut}, res {res}, drive {fd}, note {note}: {ys:?}");
                    }
                    b.note_off(note);
                    l.note_off(note);
                    p.note_off(note);
                }
            }
        }
    }
}

#[test]
fn filter_drive_is_asymmetric_and_level_matched() {
    // A sine through the drive stage alone: the offset adds a second harmonic (even), which a
    // symmetric clipper cannot, and the level stays within a couple of dB as the knob goes up.
    let x = sine(220.0, 32_768, 0.5);
    for amt in [0.3f32, 0.7, 1.0] {
        let mut d = FilterDrive::default();
        let y: Vec<f32> = x.iter().map(|v| d.pre(*v, amt)).collect();
        let s = spectrum(&y[..16_384]);
        let bin = |hz: f32| (hz / SR * 16_384.0).round() as usize;
        let h = |k: f32| (bin(220.0 * k) - 2..=bin(220.0 * k) + 2).map(|i| s[i]).fold(0.0f32, f32::max);
        let (h2, h3) = (db(h(2.0) / h(1.0)), db(h(3.0) / h(1.0)));
        let lv = db(rms(&y)) - db(rms(&x));
        println!("filter drive {amt}: 2nd harmonic {h2:.1} dB, 3rd {h3:.1} dB, level {lv:+.1} dB");
        assert!(h2 > -40.0, "even harmonics: {h2:.1}");
        assert!(lv.abs() < 2.5, "level {lv:.1}");
    }
}

#[test]
fn three_characters_sit_at_about_the_same_loudness() {
    let set = [(B_RES, 0.5), (B_ENV, 0.7)];
    let warm = db(rms(&bass_line(0.0, &set)));
    let others: Vec<(f32, &str)> = [(0.5, "scream"), (1.0, "smooth")].iter().map(|(n, name)| (db(rms(&bass_line(*n, &set))), *name)).collect();
    println!("bass line, res 0.5, env 0.7: warm {warm:.1} dB, scream {:.1} dB, smooth {:.1} dB", others[0].0, others[1].0);
    for (lv, name) in others {
        assert!((lv - warm).abs() < 1.5, "{name}: {lv:.1} vs warm {warm:.1}");
    }
}

// ── Engine 2, item 8: drum voices with a tone layer and a noise layer ────────────────────────────

fn pad_hit(model: Model, set: impl Fn(&mut Pad), secs: f32, seed: u32) -> Vec<f32> {
    let mut p = Pad::new(model, SR, seed);
    set(&mut p);
    p.trigger(0.9);
    (0..(SR * secs) as usize).map(|_| p.tick()).collect()
}

/// Energy share in a band, from a spectrum of the first 8192 samples (170 ms), dB.
fn band_db(y: &[f32], lo: f32, hi: f32) -> f32 {
    let s = spectrum(&y[..8_192]);
    let bin = SR / 8_192.0;
    let (mut inb, mut all) = (0.0f64, 0.0f64);
    for (i, m) in s.iter().enumerate() {
        let f = i as f32 * bin;
        let e = (*m as f64).powi(2);
        all += e;
        if f >= lo && f < hi {
            inb += e;
        }
    }
    10.0 * (inb / all.max(1e-30)).max(1e-12).log10() as f32
}

/// Time for the noise layer (everything over 2.5 kHz) to fall 30 dB under its peak, ms.
fn noise_fall_ms(y: &[f32]) -> f32 {
    let mut hp = ccd_engine::dsp::filter::Svf::default();
    hp.set(2_500.0, 0.707, SR);
    let h: Vec<f32> = y.iter().map(|v| hp.tick(*v).hp.abs()).collect();
    let w = (SR * 0.005) as usize;
    let env: Vec<f32> = h.chunks(w).map(|c| c.iter().cloned().fold(0.0, f32::max)).collect();
    let peak = env.iter().cloned().fold(0.0, f32::max);
    let k = env.iter().rposition(|v| *v > peak * 0.0316).unwrap_or(0);
    (k + 1) as f32 * 5.0
}

/// Energy-weighted centre of the spectrum between 1 and 12 kHz, Hz.
fn centre_hz(y: &[f32]) -> f32 {
    let s = spectrum(&y[..8_192]);
    let bin = SR / 8_192.0;
    let (mut num, mut den) = (0.0f64, 0.0f64);
    for (i, m) in s.iter().enumerate() {
        let f = i as f32 * bin;
        if f > 1_000.0 && f < 12_000.0 {
            let e = (*m as f64).powi(2);
            num += e * (f as f64).ln();
            den += e;
        }
    }
    (num / den).exp() as f32
}

#[test]
fn snare_has_a_body_and_a_snap_each_with_its_own_envelope_and_filter() {
    let snare = |noise: f32, snap: f32, color: f32| pad_hit(Model::Snare, |p| { p.noise = noise; p.snap = snap; p.color = color; }, 0.6, 11);
    // Layers: the body is the low end (under 400 Hz), the snap the top (over 2.5 kHz).
    for (noise, name) in [(0.0f32, "body only"), (0.5, "as designed"), (1.0, "snap only")] {
        let y = snare(noise, 0.5, 0.0);
        let (lo, hi) = (band_db(&y, 100.0, 400.0), band_db(&y, 2_500.0, 20_000.0));
        println!("snare, {name}: body band {lo:.1} dB, snap band {hi:.1} dB of the whole");
        if noise == 0.0 {
            assert!(hi < -40.0, "no snap with the noise layer off: {hi:.1}");
        }
        if noise == 1.0 {
            assert!(lo < -25.0, "no body with the tone layer off: {lo:.1}");
        }
    }
    // The snap's own envelope.
    let (short, long) = (noise_fall_ms(&snare(0.5, 0.15, 0.0)), noise_fall_ms(&snare(0.5, 0.85, 0.0)));
    println!("snare snap: noise falls 30 dB in {short:.0} ms at snap 0.15, {long:.0} ms at snap 0.85");
    assert!(long > short * 2.5);
    // The snap's own filter.
    let (dark, bright) = (centre_hz(&snare(1.0, 0.5, -0.6)), centre_hz(&snare(1.0, 0.5, 0.6)));
    println!("snare color: noise centred at {dark:.0} Hz at -0.6, {bright:.0} Hz at +0.6");
    assert!(bright > dark * 2.0, "color should move the noise over an octave: {dark:.0} -> {bright:.0}");
}

fn pitch_track(y: &[f32], t0: f32, t1: f32, win: f32) -> Vec<f32> {
    let mut v = Vec::new();
    let mut t = t0;
    while t + win <= t1 {
        v.push(pitch_between(y, t, t + win));
        t += win;
    }
    v
}

#[test]
fn drum_pitch_sweeps_wobbles_and_varies_per_hit() {
    // Sweep: a tom's pitch in its first 20 ms against 150 to 250 ms in.
    let tom = |set: &dyn Fn(&mut Pad), seed: u32| pad_hit(Model::Tom(1), |p| set(p), 0.5, seed);
    let drop = |y: &[f32]| pitch_between(y, 0.003, 0.023) / pitch_between(y, 0.15, 0.25);
    let mut last = 0.0;
    for sw in [0.0f32, 0.5, 1.0] {
        let d = drop(&tom(&|p| p.sweep = sw, 1));
        println!("tom sweep {sw}: starts {d:.2}x its settled pitch");
        assert!(d > last);
        last = d;
    }
    assert!(last > 1.3);
    // Wobble: how far the pitch swings over 100 to 400 ms (no sweep), in cents.
    let swing = |y: &[f32]| {
        let p = pitch_track(y, 0.1, 0.4, 0.03);
        let (lo, hi) = p.iter().fold((f32::MAX, 0.0f32), |(a, b), v| (a.min(*v), b.max(*v)));
        1200.0 * (hi / lo).log2()
    };
    let (still, wobbly) = (swing(&tom(&|p| p.sweep = 0.0, 1)), swing(&tom(&|p| { p.sweep = 0.0; p.wobble = 1.0; }, 1)));
    println!("tom wobble: pitch swings {still:.0} cents with wobble off, {wobbly:.0} cents at full");
    assert!(still < 5.0 && wobbly > 40.0);
    // Random: eight hits, the spread of their pitch and level.
    let spread = |random: f32| {
        let mut p = Pad::new(Model::Tom(1), SR, 3);
        p.random = random;
        p.sweep = 0.0;
        let (mut ps, mut ls) = (vec![], vec![]);
        for _ in 0..8 {
            p.trigger(0.9);
            let y: Vec<f32> = (0..(SR * 0.3) as usize).map(|_| p.tick()).collect();
            ps.push(pitch_between(&y, 0.05, 0.25));
            ls.push(db(rms(&y[..(SR * 0.05) as usize])));
        }
        let c = |v: &[f32]| v.iter().cloned().fold(f32::MIN, f32::max) - v.iter().cloned().fold(f32::MAX, f32::min);
        (1200.0 * (ps.iter().cloned().fold(f32::MIN, f32::max) / ps.iter().cloned().fold(f32::MAX, f32::min)).log2(), c(&ls))
    };
    let ((p0, l0), (p1, l1)) = (spread(0.0), spread(1.0));
    println!("tom random: eight hits spread {p0:.1} cents and {l0:.2} dB with random off, {p1:.0} cents and {l1:.1} dB at full");
    // With random off, hits differ only where the second oscillator and the noise happen to be (what
    // the zero-crossing measure picks up); with it up, by far more.
    assert!(p0 < 10.0 && l0 < 0.5, "with random off hits should match: {p0:.1} cents, {l0:.2} dB");
    assert!(p1 > p0 * 5.0 + 20.0 && l1 > l0 * 4.0 + 1.0, "with random up hits differ: {p1:.0} cents, {l1:.1} dB");
}

#[test]
fn perc_pads_make_metal() {
    // The perc pads' second and third shapes: an 808-style cowbell and a struck metal bar. Both are made
    // of partials that are not whole multiples of a fundamental.
    let peaks = |y: &[f32]| {
        let s = spectrum(&y[..8_192]);
        let bin = SR / 8_192.0;
        let mut idx: Vec<usize> = (3..s.len() - 3).filter(|&i| s[i] > s[i - 1] && s[i] >= s[i + 1] && (i as f32 * bin) > 200.0).collect();
        idx.sort_by(|a, b| s[*b].partial_cmp(&s[*a]).unwrap());
        idx.truncate(3);
        idx.sort();
        idx.iter().map(|i| *i as f32 * bin).collect::<Vec<f32>>()
    };
    for (shape, name) in [(1u8, "bell"), (2, "metal")] {
        let y = pad_hit(Model::Blip, |p| p.shape = shape, 0.5, 5);
        let pk = peaks(&y);
        let ratios: Vec<f32> = pk.iter().map(|f| f / pk[0]).collect();
        let off = ratios.iter().map(|r| (r - r.round()).abs()).fold(0.0f32, f32::max);
        println!("perc {name}: strongest partials {:?} Hz, ratios {:?}", pk.iter().map(|f| f.round()).collect::<Vec<_>>(), ratios.iter().map(|r| (r * 100.0).round() / 100.0).collect::<Vec<_>>());
        assert!(off > 0.2, "{name} should be inharmonic: {ratios:?}");
        assert!(y.iter().all(|v| v.is_finite()) && rms(&y[..4_800]) > 0.01);
    }
}

#[test]
fn every_pad_survives_every_layer_knob_at_its_ends() {
    for model in ccd_engine::inst::drums::MODELS {
        for &(noise, snap, color, sweep, wobble, random, shape) in &[(0.0f32, 0.0f32, -1.0f32, 0.0f32, 0.0f32, 0.0f32, 0u8), (1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 2), (0.5, 1.0, -1.0, 1.0, 1.0, 1.0, 1)] {
            let y = pad_hit(model, |p| { p.noise = noise; p.snap = snap; p.color = color; p.sweep = sweep; p.wobble = wobble; p.random = random; p.shape = shape; p.tune = 12.0; }, 1.0, 9);
            assert!(y.iter().all(|v| v.is_finite() && v.abs() < 2.0), "{model:?}");
        }
    }
}

// ── Engine 2, item 9: a smoother hall and a Dattorro plate ───────────────────────────────────────

use ccd_engine::fx::{Hall, Plate};

/// The hall as it was before item 9 (fixed line lengths, one-pole damping at 6.5 kHz, gains set for the
/// reverb time at DC), rebuilt here so every run measures both.
struct OldHall {
    pre: Vec<f32>,
    diff: Vec<Vec<f32>>,
    lines: Vec<Vec<f32>>,
    lens: [usize; 8],
    gains: [f32; 8],
    damp: [f32; 8],
    dg: f32,
    hp_s: f32,
    hp_g: f32,
    n: usize,
}
impl OldHall {
    fn new() -> Self {
        let ms = |m: f32| (m * 0.001 * SR) as usize;
        let line_ms = [29.7f32, 37.1, 41.1, 43.7, 53.3, 59.9, 67.3, 73.1];
        let lens: [usize; 8] = core::array::from_fn(|i| ms(line_ms[i] * 1.6));
        let pw = |fc: f32| { let g = (std::f32::consts::PI * fc / SR).tan(); g / (1.0 + g) };
        OldHall {
            pre: vec![0.0; ms(120.0)],
            diff: [4.7f32, 3.6, 12.7, 9.3].iter().map(|m| vec![0.0; ms(*m) + 1]).collect(),
            lines: lens.iter().map(|l| vec![0.0; l + 1]).collect(),
            lens,
            gains: core::array::from_fn(|i| 10f32.powf(-3.0 * lens[i] as f32 / (2.4 * SR))),
            damp: [0.0; 8],
            dg: pw(6_500.0),
            hp_s: 0.0,
            hp_g: pw(220.0),
            n: 0,
        }
    }
    fn at(buf: &[f32], n: usize, d: usize) -> f32 {
        let len = buf.len();
        buf[(n + len - d.min(len - 1)) % len]
    }
    fn tick(&mut self, input: f32) -> (f32, f32) {
        let n = self.n;
        let v = (input - self.hp_s) * self.hp_g;
        let lp = v + self.hp_s;
        self.hp_s = lp + v;
        let x = input - lp;
        let pl = self.pre.len();
        self.pre[n % pl] = x;
        let mut d = Self::at(&self.pre, n, (0.018 * SR) as usize);
        for (k, ms) in [4.7f32, 3.6, 12.7, 9.3].iter().enumerate() {
            let len = (ms * 0.001 * SR) as usize;
            let delayed = Self::at(&self.diff[k], n, len);
            let w = d + delayed * 0.62;
            let dl = self.diff[k].len();
            self.diff[k][n % dl] = w;
            d = delayed - w * 0.62;
        }
        let o: [f32; 8] = core::array::from_fn(|i| Self::at(&self.lines[i], n, self.lens[i]));
        let mut h = o;
        let mut step = 1;
        while step < 8 {
            let mut i = 0;
            while i < 8 {
                for j in i..i + step {
                    let (a, b) = (h[j], h[j + step]);
                    h[j] = a + b;
                    h[j + step] = a - b;
                }
                i += step * 2;
            }
            step *= 2;
        }
        for i in 0..8 {
            let v = (h[i] * 0.353_553_4 - self.damp[i]) * self.dg;
            let lp = v + self.damp[i];
            self.damp[i] = lp + v;
            let ll = self.lines[i].len();
            self.lines[i][n % ll] = lp * self.gains[i] + d * 0.35;
        }
        // Each line's ring buffer is written at n and read d back, so advance once for all.
        self.n += 1;
        ((o[0] + o[2] + o[4] + o[6]) * 0.35, (o[1] + o[3] + o[5] + o[7]) * 0.35)
    }
}

/// An impulse response, stereo, `secs` long.
fn ir(mut f: impl FnMut(f32) -> (f32, f32), secs: f32) -> (Vec<f32>, Vec<f32>) {
    (0..(SR * secs) as usize).map(|i| f(if i == 0 { 1.0 } else { 0.0 })).unzip()
}

/// RT60 of a band from the Schroeder backward integral (T20: the slope from -5 to -25 dB, times 3), s.
fn rt60_band(y: &[f32], hz: f32) -> f32 {
    let mut bp = ccd_engine::dsp::filter::Svf::default();
    bp.set(hz, 1.4, SR);
    let b: Vec<f64> = y.iter().map(|v| bp.tick(*v).bp as f64).collect();
    let mut edc = vec![0.0f64; b.len()];
    let mut acc = 0.0;
    for i in (0..b.len()).rev() {
        acc += b[i] * b[i];
        edc[i] = acc;
    }
    let top = edc[0];
    let t = |db: f64| edc.iter().position(|e| 10.0 * (e / top).log10() < db).unwrap_or(b.len()) as f32 / SR;
    (t(-25.0) - t(-5.0)) * 3.0
}

/// Time for the echo density to fill in (Abel and Huang's normalised echo density, 20 ms windows): the
/// first window from which it stays over 0.9 for the next 100 ms, in ms.
fn dense_after_ms(y: &[f32]) -> f32 {
    let w = (SR * 0.02) as usize;
    let ned: Vec<f32> = y.chunks(w).map(|c| {
        let sd = (c.iter().map(|v| v * v).sum::<f32>() / c.len() as f32).sqrt();
        c.iter().filter(|v| v.abs() > sd).count() as f32 / c.len() as f32 / 0.3173
    }).collect();
    (0..ned.len().saturating_sub(5)).find(|&i| ned[i..i + 5].iter().all(|v| *v > 0.9)).unwrap_or(ned.len()) as f32 * 20.0
}

/// How smooth the tail is: one long look at it (65536 samples from 150 ms, the decay taken out), the
/// spectrum's flatness (geometric over arithmetic mean) from 500 Hz to 5 kHz, each bin against its
/// neighbours (about 30 Hz either side). A mode that rings in place is a sharp peak and pulls it down;
/// modes that drift are smeared and push it up.
fn tail_flatness(y: &[f32], rt: f32) -> f32 {
    let n = 65_536;
    let a = (SR * 0.15) as usize;
    let seg: Vec<f32> = (0..n).map(|i| y[a + i] * 10f32.powf(3.0 * i as f32 / (SR * rt))).collect();
    let s: Vec<f64> = spectrum(&seg).iter().map(|m| (*m as f64).powi(2)).collect();
    let bin = SR / n as f32;
    let half = 40usize;
    let rel: Vec<f64> = (0..s.len()).filter(|k| (*k as f32 * bin) >= 500.0 && (*k as f32 * bin) <= 5_000.0).map(|k| {
        let m = s[k - half..=k + half].iter().sum::<f64>() / (2 * half + 1) as f64;
        s[k] / m.max(1e-30)
    }).collect();
    let g = (rel.iter().map(|v| v.max(1e-30).ln()).sum::<f64>() / rel.len() as f64).exp();
    (g / (rel.iter().sum::<f64>() / rel.len() as f64)) as f32
}

/// Correlation of left and right over the tail (0.1 to 1.5 s): 0 is fully wide, 1 is mono.
fn lr_corr(l: &[f32], r: &[f32]) -> f32 {
    let (a, b) = ((SR * 0.1) as usize, (SR * 1.5) as usize);
    let (mut lr, mut ll, mut rr) = (0.0f64, 0.0f64, 0.0f64);
    for i in a..b {
        lr += (l[i] * r[i]) as f64;
        ll += (l[i] * l[i]) as f64;
        rr += (r[i] * r[i]) as f64;
    }
    (lr / (ll * rr).sqrt()) as f32
}

#[test]
fn reverbs_decay_as_set_and_darker_at_the_top() {
    let mut old = OldHall::new();
    let mut hall = Hall::new(SR);
    let mut plate = Plate::new(SR);
    let irs = [("old hall", ir(|x| old.tick(x), 6.0)), ("hall", ir(|x| hall.tick(x), 6.0)), ("plate", ir(|x| plate.tick(x), 6.0))];
    for (name, (l, _)) in &irs {
        let rt: Vec<f32> = [250.0, 1_000.0, 4_000.0, 8_000.0].iter().map(|f| rt60_band(l, *f)).collect();
        println!("{name}, set to 2.4 s: RT60 {:.2} s at 250 Hz, {:.2} s at 1 kHz, {:.2} s at 4 kHz, {:.2} s at 8 kHz", rt[0], rt[1], rt[2], rt[3]);
        if *name != "old hall" {
            assert!((rt[1] - 2.4).abs() < 2.4 * 0.2, "{name}: {:.2} s at 1 kHz", rt[1]);
            assert!(rt[3] < rt[1] * 0.75, "{name} should be darker at the top: {:.2} vs {:.2}", rt[3], rt[1]);
        }
    }
    // The time knob follows.
    for rt in [1.0f32, 5.0] {
        let mut h = Hall::new(SR);
        h.set(rt);
        let (l, _) = ir(|x| h.tick(x), rt * 2.5);
        let got = rt60_band(&l, 1_000.0);
        println!("hall set to {rt} s: {got:.2} s at 1 kHz");
        assert!((got - rt).abs() < rt * 0.2);
    }
}

#[test]
fn reverb_tails_are_dense_smooth_and_wide() {
    let mut old = OldHall::new();
    let mut hall = Hall::new(SR);
    let mut plate = Plate::new(SR);
    let mut res = vec![];
    for (name, (l, r)) in [("old hall", ir(|x| old.tick(x), 3.0)), ("hall", ir(|x| hall.tick(x), 3.0)), ("plate", ir(|x| plate.tick(x), 3.0))] {
        let (dense, flat, corr) = (dense_after_ms(&l), tail_flatness(&l, rt60_band(&l, 1_000.0)), lr_corr(&l, &r));
        let level = db(rms(&l[..(SR * 0.5) as usize]));
        println!("{name}: echo density fills in after {dense:.0} ms; tail flatness {flat:.3}; left/right correlation {corr:+.3}; first 500 ms {level:.1} dB");
        assert!(l.iter().chain(&r).all(|v| v.is_finite()));
        res.push((dense, flat, corr, level));
    }
    let (old, hall, plate) = (res[0], res[1], res[2]);
    assert!(hall.1 > old.1, "the modulated hall should have the smoother tail: {:.3} vs {:.3}", hall.1, old.1);
    assert!(hall.2.abs() < 0.2 && plate.2.abs() < 0.2, "tails should be wide");
    assert!((hall.3 - old.3).abs() < 1.5, "the hall should sit at the old level: {:.1} vs {:.1}", hall.3, old.3);
    assert!((plate.3 - old.3).abs() < 2.0, "the plate should sit near it: {:.1} vs {:.1}", plate.3, old.3);
}
