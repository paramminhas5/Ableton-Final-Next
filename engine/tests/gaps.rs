//! Closing the sound shootout's gaps (8 Nov; design/sound-shootout.md, "Round 2"): stereo synth voices, the
//! plate's early density and the ladder's aliasing at the top of the keyboard. Each against the engine as it
//! was. Run with `cargo test --release --test gaps -- --nocapture` to see the numbers.
mod common;
use ccd_engine::engine::{cmd, Cmd, Engine};
use ccd_engine::params::*;
use common::*;

fn send(e: &Engine, kind: u32, layer: u32, a: u32, x: f32, y: f64, z: f64) {
    assert!(e.send(Cmd { kind, layer, a, x, y, z }));
}

fn render(e: &Engine, frames: usize) -> (Vec<f32>, Vec<f32>) {
    let (mut l, mut r) = (Vec::with_capacity(frames), Vec::with_capacity(frames));
    let mut done = 0;
    while done < frames {
        let n = 128.min(frames - done);
        unsafe { e.process(n) };
        let c = unsafe { e.core() };
        l.extend_from_slice(&c.out_l[..n]);
        r.extend_from_slice(&c.out_r[..n]);
        while e.poll().is_some() {}
        done += n;
    }
    (l, r)
}

/// One synth part, the glue off, notes as (beat, note, beats, velocity) at 120 bpm; `params` are
/// (instrument param, normalised value).
fn part(inst: Instrument, params: &[(usize, f32)], notes: &[(f64, u32, f64, f32)]) -> Engine {
    let e = Engine::new(SR);
    send(&e, cmd::TEMPO, 0, 0, 0.0, 120.0, 0.0);
    send(&e, cmd::LOOP, 0, 0, 0.0, 64.0, 0.0);
    send(&e, cmd::MASTER, 0, 1, 0.0, 0.0, 0.0);
    send(&e, cmd::INSTRUMENT, 0, inst as u32, 0.0, 0.0, 0.0);
    send(&e, cmd::PARAM, 0, L_LEVEL as u32, 0.6, 0.0, 0.0);
    for &(k, n) in params {
        send(&e, cmd::PARAM, 0, (INSTRUMENT_BASE + k) as u32, n, 0.0, 0.0);
    }
    send(&e, cmd::EV_CLEAR, 0, 0, 0.0, 0.0, 0.0);
    for &(b, n, len, v) in notes {
        send(&e, cmd::EV_ADD, 0, n, v, b, len);
    }
    send(&e, cmd::EV_COMMIT, 0, 0, 0.0, 0.0, 0.0);
    send(&e, cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
    e
}

/// The shootout's supersaw phrase (beats at 120 bpm).
const PHRASE: [(f64, u32, f64, f32); 4] = [(0.0, 69, 1.8, 0.8), (2.0, 72, 0.8, 0.8), (3.0, 76, 0.8, 0.8), (4.0, 74, 2.8, 0.8)];
const CHORD: [(f64, u32, f64, f32); 6] = [(0.0, 57, 3.6, 0.75), (0.0, 60, 3.6, 0.75), (0.0, 64, 3.6, 0.75), (4.0, 55, 3.2, 0.75), (4.0, 59, 3.2, 0.75), (4.0, 62, 3.2, 0.75)];

fn lead_saw(width: Option<f32>) -> (Vec<f32>, Vec<f32>) {
    let mut p = vec![(LD_DETUNE, 0.6), (LD_CUTOFF, 1.0), (LD_RES, 0.0), (LD_ENV, 0.0), (LD_GLIDE, 0.0), (LD_RELEASE, 0.35)];
    if let Some(w) = width {
        p.push((LD_WIDTH, w));
    }
    render(&part(Instrument::Lead, &p, &PHRASE), (SR * 4.0) as usize)
}

/// Left/right correlation, side over mid (dB), the mono sum's level (dB) and the stereo loudness (LUFS).
fn stereo(l: &[f32], r: &[f32]) -> (f32, f32, f32, f32) {
    let (mut lr, mut ll, mut rr, mut mm, mut ss) = (0.0f64, 0.0f64, 0.0f64, 0.0f64, 0.0f64);
    for (a, b) in l.iter().zip(r) {
        let (a, b) = (*a as f64, *b as f64);
        lr += a * b;
        ll += a * a;
        rr += b * b;
        mm += (0.5 * (a + b)).powi(2);
        ss += (0.5 * (a - b)).powi(2);
    }
    let corr = (lr / (ll * rr).sqrt()) as f32;
    let side = (10.0 * (ss / mm).max(1e-12).log10()) as f32;
    let mono = (10.0 * (mm / l.len() as f64).log10()) as f32;
    (corr, side, mono, ccd_engine::loudness::integrated_lufs(l, r, SR))
}

// ── 1. Stereo synth voices ───────────────────────────────────────────────────────────────────────────

#[test]
fn width_spreads_the_supersaw_and_keeps_the_mono_sum() {
    let (l0, r0) = lead_saw(None);
    let (lz, rz) = lead_saw(Some(0.0));
    assert!(l0 == r0, "the lead was mono before");
    assert!(l0 == lz && r0 == rz, "width at 0 is exactly the old sound");
    let (_, _, m0, s0) = stereo(&l0, &r0);
    let mut last = 1.0f32;
    for w in [0.25f32, 0.5, 0.75, 1.0] {
        let (l, r) = lead_saw(Some(w));
        let (c, side, m, s) = stereo(&l, &r);
        println!("lead supersaw (detune 0.6), width {w:.2}: left/right {c:+.3}, side over mid {side:+.1} dB, mono sum {:+.2} dB, stereo {:+.2} LU against width 0", m - m0, s - s0);
        assert!(c < last - 0.03, "width {w}: wider as it goes up ({c:.3} after {last:.3})");
        assert!((m - m0).abs() < 1.0, "width {w}: the mono sum within a decibel of before ({:+.2} dB)", m - m0);
        assert!((s - s0).abs() < 1.0, "width {w}: the stereo level within a decibel of before ({:+.2} LU)", s - s0);
        last = c;
    }
    // Surge XT's supersaw at its full width 0.380 (mono sum -2.4 dB), Vital's 0.222 (-3.0 dB), measured the
    // same way (design/sound-shootout.md): ours at full width sits with Surge's, its mono sum far closer.
    assert!(last < 0.45, "full width is as wide as Surge's: {last:.3}");
}

#[test]
fn width_on_the_chord_synth_spreads_voices_too() {
    // The chord synth's own default (spread 0.4, a sub in): its supersaw and each voice to its own side.
    let take = |w: Option<f32>, p: &[(usize, f32)]| {
        let mut p = p.to_vec();
        if let Some(w) = w {
            p.push((C_WIDTH, w));
        }
        render(&part(Instrument::Chords, &p, &CHORD), (SR * 4.0) as usize)
    };
    let (l0, r0) = take(None, &[]);
    assert!(l0 == r0);
    let (_, _, m0, s0) = stereo(&l0, &r0);
    for w in [0.5f32, 1.0] {
        let (l, r) = take(Some(w), &[]);
        let (c, side, m, s) = stereo(&l, &r);
        println!("chords (default patch), width {w:.1}: left/right {c:+.3}, side over mid {side:+.1} dB, mono sum {:+.2} dB, stereo {:+.2} LU", m - m0, s - s0);
        assert!(c < 0.9 && (m - m0).abs() < 1.0 && (s - s0).abs() < 1.0);
    }
    // With no supersaw (the wavetable oscillator) only the voices spread: still wider than mono.
    let (l, r) = take(Some(1.0), &[(C_OSC, 1.0 / 3.0)]);
    let (c, side, _, _) = stereo(&l, &r);
    println!("chords on the wavetable, width 1: left/right {c:+.3}, side over mid {side:+.1} dB (the voices' own places)");
    assert!(c < 0.99 && c > 0.7, "{c}");
}

#[test]
fn the_sub_stays_in_the_middle_and_the_bass_stays_mono() {
    // A chord synth note with its sub up (voicing 0.6) at full width: the side has the saws, not the sub.
    let p = [(C_VOICING, 0.6), (C_SPREAD, 0.6), (C_WIDTH, 1.0), (C_CUTOFF, 1.0)];
    let (l, r) = render(&part(Instrument::Chords, &p, &[(0.0, 48, 3.8, 0.9)]), (SR * 2.0) as usize);
    let n = 65_536;
    let mid: Vec<f32> = l[l.len() - n..].iter().zip(&r[r.len() - n..]).map(|(a, b)| 0.5 * (a + b)).collect();
    let side: Vec<f32> = l[l.len() - n..].iter().zip(&r[r.len() - n..]).map(|(a, b)| 0.5 * (a - b)).collect();
    let (sm, ss) = (spectrum(&mid), spectrum(&side));
    // The sub's bin (note 36, 65.4 Hz) against the fundamental's (note 48).
    let bin = |f: f32| (f * n as f32 / SR).round() as usize;
    let band = |s: &[f32], f: f32| (bin(f) - 3..=bin(f) + 3).map(|k| (s[k] as f64).powi(2)).sum::<f64>();
    let (sub_m, sub_s) = (band(&sm, 65.41), band(&ss, 65.41));
    let (f_m, f_s) = (band(&sm, 130.81), band(&ss, 130.81));
    let sub_db = 10.0 * (sub_s / sub_m).log10();
    let fun_db = 10.0 * (f_s / f_m).log10();
    println!("sub at full width: side {sub_db:.1} dB against the mid at the sub, {fun_db:.1} dB at the fundamental");
    assert!(sub_db < -40.0, "the sub is centred: {sub_db:.1} dB");
    assert!(fun_db > -20.0, "the saws are wide: {fun_db:.1} dB");
    // The bass has no width: always mono.
    let (l, r) = render(&part(Instrument::Bass, &[], &[(0.0, 36, 1.5, 0.9), (2.0, 43, 1.5, 0.9)]), SR as usize * 2);
    assert!(l == r, "the bass is mono");
}

#[test]
fn width_back_at_zero_is_mono_again_exactly() {
    // Wide for a phrase, then width back to 0: once the notes have rung out the part takes the mono path again.
    let p = [(LD_DETUNE, 0.6), (LD_WIDTH, 1.0), (LD_RELEASE, 0.1)];
    let e = part(Instrument::Lead, &p, &[(0.0, 60, 1.0, 0.9), (8.0, 64, 1.0, 0.9)]);
    let (l, r) = render(&e, SR as usize);
    assert!(l != r);
    send(&e, cmd::PARAM, 0, (INSTRUMENT_BASE + LD_WIDTH) as u32, 0.0, 0.0, 0.0);
    let (_, _) = render(&e, SR as usize * 3);
    let (l, r) = render(&e, SR as usize);
    assert!(l == r, "mono again");
    assert!(rms(&l) > 0.01, "and the second note plays");
}

// ── 2. The plate's early density ─────────────────────────────────────────────────────────────────────

/// A plain delay line (the engine's own is private to fx.rs), the same arithmetic.
struct Line {
    buf: Vec<f32>,
    pos: usize,
}
impl Line {
    fn new(len: usize) -> Self {
        Line { buf: vec![0.0; len.max(2)], pos: 0 }
    }
    fn write(&mut self, x: f32) {
        self.buf[self.pos] = x;
        self.pos += 1;
        if self.pos >= self.buf.len() {
            self.pos = 0;
        }
    }
    fn read(&self, d: f32) -> f32 {
        let n = self.buf.len();
        let d = d.clamp(1.0, (n - 2) as f32);
        let i = d as usize;
        let f = d - i as f32;
        let a = self.buf[(self.pos + n - i) % n];
        let b = self.buf[(self.pos + n - i - 1) % n];
        a + (b - a) * f
    }
    fn read_int(&self, d: usize) -> f32 {
        let n = self.buf.len();
        self.buf[(self.pos + n - d.min(n - 1)) % n]
    }
}

/// The plate as it was before round 2 (fx.rs at 373ac79), copied here so every run measures both.
struct BeforePlate {
    pre: Line,
    bw: f32,
    inap: [Line; 4],
    ap1: [Line; 2],
    d1: [Line; 2],
    ap2: [Line; 2],
    d2: [Line; 2],
    damp_s: [f32; 2],
    fb: [f32; 2],
    lfo: f32,
    lfo_inc: f32,
    k: f32,
    decay: f32,
    sr: f32,
}
const P_IN: [f32; 4] = [142.0, 107.0, 379.0, 277.0];
const P_AP1: [f32; 2] = [672.0, 908.0];
const P_D1: [f32; 2] = [4453.0, 4217.0];
const P_AP2: [f32; 2] = [1800.0, 2656.0];
const P_D2: [f32; 2] = [3720.0, 3163.0];
impl BeforePlate {
    fn new(sr: f32) -> Self {
        let k = sr / 29_761.0;
        let line = |n: f32, extra: f32| Line::new((n * k + extra) as usize + 4);
        let ex = 16.0 * k;
        let lap: f32 = (P_AP1.iter().chain(&P_D1).chain(&P_AP2).chain(&P_D2).sum::<f32>()) / 29_761.0;
        BeforePlate {
            pre: Line::new((0.05 * sr) as usize),
            bw: 0.0,
            inap: core::array::from_fn(|i| line(P_IN[i], 0.0)),
            ap1: core::array::from_fn(|i| line(P_AP1[i], ex)),
            d1: core::array::from_fn(|i| line(P_D1[i], 0.0)),
            ap2: core::array::from_fn(|i| line(P_AP2[i], 0.0)),
            d2: core::array::from_fn(|i| line(P_D2[i], 0.0)),
            damp_s: [0.0; 2],
            fb: [0.0; 2],
            lfo: 0.0,
            lfo_inc: 0.9 / sr,
            k,
            decay: 10f32.powf(-3.0 * lap / (4.0 * 2.4)).min(0.97),
            sr,
        }
    }
    fn ap(line: &mut Line, x: f32, d: f32, g: f32) -> f32 {
        let z = line.read(d);
        let v = ccd_engine::dsp::flush_denormal(x - g * z);
        line.write(v);
        z + g * v
    }
    fn tick(&mut self, input: f32) -> (f32, f32) {
        let k = self.k;
        self.pre.write(input);
        let x = self.pre.read_int((0.008 * self.sr) as usize);
        self.bw += 0.9995 * (x - self.bw);
        let mut x = self.bw;
        for (i, (l, g)) in self.inap.iter_mut().zip([0.75, 0.75, 0.625, 0.625]).enumerate() {
            x = Self::ap(l, x, P_IN[i] * k, g);
        }
        self.lfo += self.lfo_inc;
        if self.lfo >= 1.0 {
            self.lfo -= 1.0;
        }
        let ex = 16.0 * k;
        let mods = [ccd_engine::dsp::sin_cycle(self.lfo) * ex, ccd_engine::dsp::sin_cycle((self.lfo + 0.25).fract()) * ex];
        let decay = self.decay;
        let dd2 = (decay + 0.15).clamp(0.25, 0.5);
        let fb = self.fb;
        for b in 0..2 {
            let t = x + fb[1 - b];
            let a = Self::ap(&mut self.ap1[b], t, P_AP1[b] * k + mods[b], -0.7);
            self.d1[b].write(a);
            let y = self.d1[b].read_int((P_D1[b] * k) as usize);
            self.damp_s[b] = ccd_engine::dsp::flush_denormal(y * (1.0 - 0.45) + self.damp_s[b] * 0.45);
            let c = Self::ap(&mut self.ap2[b], self.damp_s[b] * decay, P_AP2[b] * k, dd2);
            self.d2[b].write(c);
            self.fb[b] = ccd_engine::dsp::flush_denormal(self.d2[b].read_int((P_D2[b] * k) as usize) * decay);
        }
        let t = |line: &Line, n: f32| line.read_int((n * k) as usize);
        let l = t(&self.d1[1], 266.0) + t(&self.d1[1], 2974.0) - t(&self.ap2[1], 1913.0) + t(&self.d2[1], 1996.0) - t(&self.d1[0], 1990.0) - t(&self.ap2[0], 187.0) - t(&self.d2[0], 1066.0);
        let r = t(&self.d1[0], 353.0) + t(&self.d1[0], 3627.0) - t(&self.ap2[0], 1228.0) + t(&self.d2[0], 2673.0) - t(&self.d1[1], 2111.0) - t(&self.ap2[1], 335.0) - t(&self.d2[1], 121.0);
        (l * 0.235, r * 0.235)
    }
}

/// Impulse response, stereo.
fn ir(mut f: impl FnMut(f32) -> (f32, f32), secs: f32) -> (Vec<f32>, Vec<f32>) {
    (0..(SR * secs) as usize).map(|i| f(if i == 0 { 1.0 } else { 0.0 })).unzip()
}

/// Where the first sound comes (samples): the first over a thousandth of the peak.
fn first(y: &[f32]) -> usize {
    let pk = y.iter().fold(0.0f32, |a, v| a.max(v.abs()));
    y.iter().position(|v| v.abs() > pk * 1e-3).unwrap_or(0)
}

/// Abel and Huang's normalised echo density in 20 ms windows stepped by 5 ms, from the first sound (as
/// measure.py does): the share of samples more than one standard deviation out, over Gaussian noise's 0.3173.
/// Each value is tagged with its window's centre (s).
fn ned(y: &[f32]) -> Vec<(f32, f32)> {
    let y = &y[first(y)..];
    let w = (SR * 0.02) as usize;
    (0..(y.len() - w) / (w / 4)).map(|k| {
        let c = &y[k * w / 4..k * w / 4 + w];
        let mean = c.iter().sum::<f32>() / w as f32;
        let sd = (c.iter().map(|v| (v - mean).powi(2)).sum::<f32>() / w as f32).sqrt();
        (c.iter().filter(|v| (*v - mean).abs() > sd).count() as f32 / w as f32 / 0.3173, (k * w / 4 + w / 2) as f32 / SR)
    }).collect()
}

/// RT60 in a band (T20 from the Schroeder integral, -5 to -25 dB), s.
fn rt60(y: &[f32], fc: f32) -> f32 {
    rt60_from(y, fc, -5.0)
}

/// RT60 in a band from the slope between `top` and 20 dB under it.
fn rt60_from(y: &[f32], fc: f32, top: f64) -> f32 {
    let mut bp = ccd_engine::dsp::filter::Svf::default();
    bp.set(fc, 1.4, SR);
    let b: Vec<f64> = y.iter().map(|v| bp.tick(*v).bp as f64).collect();
    let mut edc = vec![0.0f64; b.len()];
    let mut acc = 0.0;
    for i in (0..b.len()).rev() {
        acc += b[i] * b[i];
        edc[i] = acc;
    }
    let t = |db: f64| edc.iter().position(|e| 10.0 * (e / edc[0]).log10() < db).unwrap_or(b.len()) as f32 / SR;
    (t(top - 20.0) - t(top)) * 3.0
}

/// Modal smoothness, as measure.py: one look at the tail from `from` s after the first sound (32768 samples),
/// the decay taken off (a 50 ms running rms), then the spectral flatness of each third of an octave, 200 Hz to
/// 8 kHz, averaged. Noise gives about 0.56; ringing modes pull it down.
fn smoothness(y: &[f32], from: f32) -> f32 {
    let n = 32_768;
    let a = first(y) + (from * SR) as usize;
    let seg = &y[a..a + n];
    let w = 2_400;
    let mut acc = 0.0f64;
    let mut win = std::collections::VecDeque::new();
    let env: Vec<f32> = (0..n + w / 2).map(|i| {
        if i < n { let v = (seg[i] as f64).powi(2); acc += v; win.push_back(v); }
        if win.len() > w { acc -= win.pop_front().unwrap(); }
        (acc / w as f64).sqrt() as f32 + 1e-12
    }).skip(w / 2).collect();
    let x: Vec<f32> = seg.iter().zip(&env).map(|(s, e)| s / e).collect();
    let sp = spectrum(&x);
    let mut flats = Vec::new();
    let mut lo = 200.0f32;
    let step = (8_000.0f32 / 200.0).powf(1.0 / 39.0);
    for _ in 0..40 {
        let bins: Vec<f64> = sp.iter().enumerate().filter(|(k, _)| { let f = *k as f32 * SR / n as f32; f >= lo && f < lo * 2f32.powf(1.0 / 3.0) }).map(|(_, m)| (*m as f64).powi(2) + 1e-30).collect();
        let geo = (bins.iter().map(|v| v.ln()).sum::<f64>() / bins.len() as f64).exp();
        flats.push(geo / (bins.iter().sum::<f64>() / bins.len() as f64));
        lo *= step;
    }
    (flats.iter().sum::<f64>() / flats.len() as f64) as f32
}

/// A snare-like burst (noise under a falling envelope, a seeded hash, rolled off over 3 kHz), 200 ms, and a
/// chord-like held tone (three saws, a second).
fn sources() -> [Vec<f32>; 2] {
    let mut x = 0x1234_5678u32;
    let mut lp = 0.0f32;
    let k = 1.0 - (-std::f32::consts::TAU * 3_000.0 / SR).exp();
    let snare = (0..(SR * 0.2) as usize).map(|i| {
        x ^= x << 13;
        x ^= x >> 17;
        x ^= x << 5;
        lp += k * ((x as f32 / u32::MAX as f32 * 2.0 - 1.0) - lp);
        lp * (-(i as f32) / (SR * 0.04)).exp()
    }).collect();
    let chord = (0..SR as usize).map(|i| [220.0f32, 261.63, 329.63].iter().map(|f| ((i as f32 * f / SR).fract() * 2.0 - 1.0) * 0.15).sum::<f32>()).collect();
    [snare, chord]
}

#[test]
fn the_plate_fills_in_fast_and_keeps_its_tail() {
    let mut before = BeforePlate::new(SR);
    let mut after = ccd_engine::fx::Plate::new(SR);
    let (bl, br) = ir(|x| before.tick(x), 5.0);
    let (al, ar) = ir(|x| after.tick(x), 5.0);
    let mono = |l: &[f32], r: &[f32]| l.iter().zip(r).map(|(a, b)| 0.5 * (a + b)).collect::<Vec<f32>>();
    let report = |name: &str, l: &[f32], r: &[f32]| {
        let m = mono(l, r);
        let n = ned(&m);
        let avg = |a: f32, b: f32| { let v: Vec<f32> = n.iter().filter(|(_, t)| *t >= a && *t < b).map(|(v, _)| *v).collect(); v.iter().sum::<f32>() / v.len() as f32 };
        let at = |th: f32| n.iter().find(|(v, _)| *v >= th).map(|(_, t)| t * 1000.0).unwrap_or(f32::NAN);
        let low = (0..6).map(|k| avg(k as f32 * 0.05, k as f32 * 0.05 + 0.05)).fold(f32::MAX, f32::min);
        let (s1, s2) = (smoothness(&m, 0.3), smoothness(&m, 0.8));
        let (r250, r1k, r4k) = (rt60(&m, 250.0), rt60(&m, 1_000.0), rt60(&m, 4_000.0));
        let (l250, l1k) = (rt60_from(&m, 250.0, -15.0), rt60_from(&m, 1_000.0, -15.0));
        println!("{name}: first sound {:.1} ms, echo density 0-50 ms {:.2}, 50-100 ms {:.2}, lowest 50 ms in the first 300 {low:.2}, reaches 0.9 at {:.0} ms and 0.95 at {:.0} ms, smoothness {s1:.3} (from 0.3 s) / {s2:.3} (from 0.8 s), RT60 (T20) {r250:.2} / {r1k:.2} / {r4k:.2} s at 250 Hz / 1 kHz / 4 kHz, the late decay (-15 to -35 dB) {l250:.2} / {l1k:.2} s at 250 Hz / 1 kHz",
            first(&m) as f32 / SR * 1000.0, avg(0.0, 0.05), avg(0.05, 0.1), at(0.9), at(0.95));
        (avg(0.0, 0.05), at(0.9), low, s1, s2, r1k, r250, l1k, l250)
    };
    let b = report("plate before", &bl, &br);
    let a = report("plate after ", &al, &ar);
    // Dragonfly's plate, measured by measure.py: 0.87 over the first 50 ms, 0.9 at 35 ms, smoothness 0.479.
    assert!(a.0 > 0.8 && a.0 > b.0 + 0.25, "the first 50 ms much denser: {:.2} (was {:.2})", a.0, b.0);
    assert!(a.1 <= 50.0 && a.1 < b.1 * 0.5, "dense within 50 ms: {:.0} ms (was {:.0})", a.1, b.1);
    assert!(a.2 > 0.8, "no sparse gap as the tank takes over: {:.2}", a.2);
    assert!(a.3 >= b.3 - 0.005 && a.4 >= b.4 - 0.005, "as smooth as before: {:.3} / {:.3} (was {:.3} / {:.3})", a.3, a.4, b.3, b.4);
    // The onset adds energy at the start, which tilts the top of the decay curve (T20 starts 5 dB down): it
    // reads up to 8% shorter here (2% on measure.py's octave bands). The late decay is the tank's, untouched.
    assert!((a.5 - b.5).abs() < b.5 * 0.08 && (a.6 - b.6).abs() < b.6 * 0.08, "T20 within 8%: {:.2} vs {:.2} s at 1 kHz, {:.2} vs {:.2} s at 250 Hz", a.5, b.5, a.6, b.6);
    assert!((a.7 - b.7).abs() < b.7 * 0.03 && (a.8 - b.8).abs() < b.8 * 0.03, "the late decay as it was: {:.2} vs {:.2} s at 1 kHz, {:.2} vs {:.2} s at 250 Hz", a.7, b.7, a.8, b.8);
    // The same sources into both: the wet loudness (BS.1770, the engine's own meter).
    for (name, x) in ["snare", "chord"].iter().zip(sources()) {
        let wet = |f: &mut dyn FnMut(f32) -> (f32, f32)| -> f32 {
            let (l, r): (Vec<f32>, Vec<f32>) = (0..(SR * 4.0) as usize).map(|i| f(*x.get(i).unwrap_or(&0.0))).unzip();
            ccd_engine::loudness::integrated_lufs(&l, &r, SR)
        };
        let (mut p, mut q) = (BeforePlate::new(SR), ccd_engine::fx::Plate::new(SR));
        let (lb, la) = (wet(&mut |v| p.tick(v)), wet(&mut |v| q.tick(v)));
        println!("a {name} into the plate: {lb:.2} LUFS before, {la:.2} LUFS after");
        assert!((la - lb).abs() < 1.0, "{name}: the plate sits where it was: {la:.2} vs {lb:.2}");
    }
}

// ── 3. The ladder at the top of the keyboard ─────────────────────────────────────────────────────────

/// Energy off the harmonics of `f0` against the energy on them, 30 Hz to 20 kHz, at rate `sr`, dB.
fn off_harmonics_db(y: &[f32], f0: f32, sr: f32) -> f32 {
    let n = 65_536;
    let s = spectrum(&y[y.len() - n..]);
    let (mut on, mut off) = (0.0f64, 0.0f64);
    for (k, m) in s.iter().enumerate() {
        let f = k as f32 * sr / n as f32;
        if !(30.0..20_000.0).contains(&f) {
            continue;
        }
        let h = (f / f0).round().max(1.0);
        let e = (*m as f64).powi(2);
        if (f - h * f0).abs() < 6.0 * sr / n as f32 { on += e } else { off += e }
    }
    10.0 * ((off / on) as f32).max(1e-15).log10()
}

#[test]
fn the_ladder_aliases_less_at_the_top_and_keeps_its_peak() {
    use ccd_engine::dsp::filter::{CharFilter, Ladder};
    use ccd_engine::dsp::osc::MinBlepOsc;
    let os = 96_000.0f32;
    // The lead's filter (twice the voice's rate, second-order ADAA) and the chord synth's (second-order ADAA).
    let new = || { let mut f = CharFilter::default(); f.set_oversampled(true); f };
    let chord = || { let mut f = CharFilter::default(); f.set_adaa2(true); f };
    // A clean (minBLEP) saw at the level the voice feeds its filter, the filter open as the voice sets it.
    for (n, drive) in [(84u32, 1.0f32), (96, 1.0), (102, 1.0), (108, 1.0), (96, 3.0), (108, 3.0)] {
        let f0 = 440.0 * 2f32.powf((n as f32 - 69.0) / 12.0);
        let len = 65_536 + 4_096;
        let mut o = MinBlepOsc::new();
        let x: Vec<f32> = (0..len).map(|_| o.next(f0 / os).0 * 0.375 * drive).collect();
        let fc = (16_000.0 * 2f32.powf((n as f32 - 60.0) / 12.0 * 0.4)).min(os * 0.45);
        let mut b = Ladder::default();
        b.set(fc, 0.0, os);
        let mut a = new();
        a.set(fc, 0.0, os);
        let mut c = chord();
        c.set(fc, 0.0, os);
        let yb: Vec<f32> = x.iter().map(|v| b.tick(*v)).collect();
        let ya: Vec<f32> = x.iter().map(|v| a.tick(*v)).collect();
        let yc: Vec<f32> = x.iter().map(|v| c.tick(*v)).collect();
        let (db_b, db_a, db_c) = (off_harmonics_db(&yb, f0, os), off_harmonics_db(&ya, f0, os), off_harmonics_db(&yc, f0, os));
        println!("ladder open, note {n}{}: off the harmonics {db_b:.1} dB before, {db_a:.1} dB after at twice the rate (the lead, chord voices from note 79), {db_c:.1} dB with second-order ADAA alone (chord voices under 79)", if drive > 1.0 { ", 10 dB hotter" } else { "" });
        assert!(db_a < db_b - 10.0, "note {n}: {db_a:.1} vs {db_b:.1}");
        assert!(db_c < db_b - 2.5, "note {n}, chords: {db_c:.1} vs {db_b:.1}");
        if n == 108 && drive == 1.0 {
            assert!(db_a < -75.0, "note 108 under -75 dB: {db_a:.1}");
        }
    }
    // Its shape: the peak against the bass on noise at three resonances, and where the peak sits at four
    // cutoffs at resonance 0.9 (its tuning, left for Param's ear, must not move).
    let noise = |n: usize| { let mut seed = 99u32; (0..n).map(|_| { seed ^= seed << 13; seed ^= seed >> 17; seed ^= seed << 5; (seed as f32 / u32::MAX as f32 - 0.5) * 0.2 }).collect::<Vec<f32>>() };
    let x = noise(os as usize);
    let band = |y: &[f32], lo: f32, hi: f32| {
        let s = spectrum(&y[y.len() - 65_536..]);
        let e: f64 = s.iter().enumerate().filter(|(k, _)| { let f = *k as f32 * os / 65_536.0; f >= lo && f < hi }).map(|(_, m)| (*m as f64).powi(2)).sum();
        10.0 * e.log10() as f32
    };
    for res in [0.3f32, 0.6, 0.9] {
        let mut b = Ladder::default();
        b.set(1_000.0, res, os);
        let mut a = new();
        a.set(1_000.0, res, os);
        let mut c = chord();
        c.set(1_000.0, res, os);
        let yb: Vec<f32> = x.iter().map(|v| b.tick(*v)).collect();
        let ya: Vec<f32> = x.iter().map(|v| a.tick(*v)).collect();
        let yc: Vec<f32> = x.iter().map(|v| c.tick(*v)).collect();
        let pk = |y: &[f32]| band(y, 900.0, 1_100.0) - band(y, 100.0, 200.0);
        let (pb, pa, pc) = (pk(&yb), pk(&ya), pk(&yc));
        println!("ladder at 1 kHz, resonance {res}: peak over bass {pb:+.2} dB before, {pa:+.2} dB after at twice the rate, {pc:+.2} dB with second-order ADAA alone");
        assert!((pa - pb).abs() < 0.5 && (pc - pb).abs() < 0.5, "res {res}: the peak within 0.5 dB ({pa:.2}, {pc:.2} vs {pb:.2})");
    }
    for fc in [500.0f32, 2_000.0, 6_000.0, 12_000.0] {
        let peak_at = |y: &[f32]| {
            let s = spectrum(&y[y.len() - 65_536..]);
            let (lo, hi) = ((fc * 0.5 * 65_536.0 / os) as usize, (fc * 2.0 * 65_536.0 / os) as usize);
            let k = (lo..hi).max_by(|a, b| s[*a].partial_cmp(&s[*b]).unwrap()).unwrap();
            // parabolic interpolation on the log magnitude
            let (l, c, r) = (s[k - 1].ln(), s[k].ln(), s[k + 1].ln());
            (k as f32 + 0.5 * (l - r) / (l - 2.0 * c + r)) * os / 65_536.0
        };
        let mut b = Ladder::default();
        b.set(fc, 0.9, os);
        let mut a = new();
        a.set(fc, 0.9, os);
        let yb: Vec<f32> = x.iter().map(|v| b.tick(*v)).collect();
        let ya: Vec<f32> = x.iter().map(|v| a.tick(*v)).collect();
        let (fb, fa) = (peak_at(&yb), peak_at(&ya));
        let cents = 1200.0 * (fa / fb).log2();
        println!("ladder resonance 0.9 set to {fc} Hz: the peak at {fb:.0} Hz before, {fa:.0} Hz after ({cents:+.1} cents)");
        assert!(cents.abs() < 15.0 || fc > 10_000.0, "{fc} Hz: the tuning moved {cents:+.1} cents");
    }
}

/// What the ladder costs, before and after (`--ignored`): ns a sample at 96 kHz, a note 108 saw and a note 60 saw.
#[test]
#[ignore]
fn cpu_of_the_ladder() {
    use ccd_engine::dsp::filter::{CharFilter, Ladder};
    use ccd_engine::dsp::osc::MinBlepOsc;
    let n = 4_000_000usize;
    for f0 in [4_186.0f32, 261.6] {
        let mut o = MinBlepOsc::new();
        let x: Vec<f32> = (0..96_000).map(|_| o.next(f0 / 96_000.0).0 * 0.375).collect();
        let time = |f: &mut dyn FnMut(f32) -> f32| {
            let mut best = f64::MAX;
            for _ in 0..5 {
                let t = std::time::Instant::now();
                let mut acc = 0.0f32;
                for i in 0..n {
                    acc += f(x[i % x.len()]);
                }
                std::hint::black_box(acc);
                best = best.min(t.elapsed().as_secs_f64());
            }
            best / n as f64 * 1e9
        };
        let mut b = Ladder::default();
        b.set(12_000.0, 0.3, 96_000.0);
        let mut a = CharFilter::default();
        a.set_oversampled(true);
        a.set(12_000.0, 0.3, 96_000.0);
        let mut c = CharFilter::default();
        c.set_adaa2(true);
        c.set(12_000.0, 0.3, 96_000.0);
        let (tb, ta, tc) = (time(&mut |v| b.tick(v)), time(&mut |v| a.tick(v)), time(&mut |v| c.tick(v)));
        println!("ladder on a {f0} Hz saw: {tb:.1} ns a sample before, {ta:.1} after at twice the rate, {tc:.1} with second-order ADAA alone");
    }
}

/// One lead note and a three-note chord, width 0 and 1, share of a core (`--ignored`).
#[test]
#[ignore]
fn cpu_of_a_lead_note() {
    use ccd_engine::inst::synth::{Lead, Poly};
    let n = 480_000usize;
    for w in [0.0f32, 1.0] {
        let mut l = Lead::new(SR);
        l.set_param(LD_DETUNE, 0.6);
        l.set_param(LD_WIDTH, w);
        l.note_on(60, 0.9);
        let mut p = Poly::new(SR);
        p.set_param(C_SPREAD, 0.6);
        p.set_param(C_WIDTH, w);
        for k in [57, 60, 64] { p.note_on(k, 0.9); }
        let mut best = (f64::MAX, f64::MAX);
        for _ in 0..5 {
            let t = std::time::Instant::now();
            let mut acc = 0.0f32;
            for _ in 0..n { let (a, b) = l.tick_ms(); acc += a + b; }
            std::hint::black_box(acc);
            best.0 = best.0.min(t.elapsed().as_secs_f64());
            let t = std::time::Instant::now();
            for _ in 0..n { let (a, b) = p.tick_ms(); acc += a + b; }
            std::hint::black_box(acc);
            best.1 = best.1.min(t.elapsed().as_secs_f64());
        }
        println!("width {w}: lead supersaw note {:.2}% of a core, three-note chord {:.2}%", best.0 / (n as f64 / SR as f64) * 100.0, best.1 / (n as f64 / SR as f64) * 100.0);
    }
}

/// Width sent at 0 to every chord and lead part of a song changes nothing, bit for bit (the song uses all six
/// instruments, sends and a route, as leftovers.rs's reference does).
#[test]
fn width_at_zero_in_a_song_is_bit_identical() {
    let song = |send_width: bool| {
        let e = Engine::new(SR);
        for (l, inst) in [1u32, 2, 3, 4, 5, 6].iter().enumerate() {
            let l = l as u32;
            send(&e, cmd::INSTRUMENT, l, *inst, 0.0, 0.0, 0.0);
            send(&e, cmd::PARAM, l, L_SEND as u32, 0.3, 0.0, 0.0);
            send(&e, cmd::PARAM, l, L_ECHO as u32, 0.2, 0.0, 0.0);
            send(&e, cmd::PARAM, l, L_DRIVE as u32, 0.3, 0.0, 0.0);
            if send_width && (*inst == 3 || *inst == 4) {
                send(&e, cmd::PARAM, l, (INSTRUMENT_BASE + 21) as u32, 0.0, 0.0, 0.0);
            }
            send(&e, cmd::EV_CLEAR, l, 0, 0.0, 0.0, 0.0);
            for s in 0..16u32 {
                let note = match inst { 1 => DRUM_PAD_NOTES[(s % 8) as usize] as u32, 5 => 36 + s % 8, 6 => 36, _ => 40 + (s * 5) % 24 };
                send(&e, cmd::EV_ADD, l, note, 0.9, s as f64 * 0.25, 0.3);
            }
            send(&e, cmd::EV_COMMIT, l, 0, 0.0, 0.0, 0.0);
        }
        send(&e, cmd::MOD, 3, 0, 0.3, L_PAN as f64, 0.0);
        send(&e, cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
        render(&e, 96_000)
    };
    let (a, b) = (song(false), song(true));
    assert!(a.0.iter().chain(&a.1).all(|v| v.is_finite()));
    assert!(a == b, "width at 0 is bit for bit the old sound");
}
