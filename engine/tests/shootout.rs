//! The sound shootout (design/sound-shootout.md): where ours measured worse than the open-source
//! synths, the fix and its before and after numbers. Run with
//! `cargo test --release --test shootout -- --nocapture` to see them.
mod common;
use ccd_engine::dsp::filter::OnePoleHp;
use ccd_engine::dsp::flush_denormal;
use common::*;

// ── A faster-filling hall ─────────────────────────────────────────────────────────────────────────

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

/// The hall as it was before the shootout (fx.rs at a004aee), copied here so every run measures both.
struct BeforeHall {
    pre: Line,
    diff: [Line; 4],
    lines: [Line; 8],
    lens: [f32; 8],
    /// Loss per line: gain under the crossover and over it, and the crossover's one-pole state.
    g_lo: [f32; 8],
    g_hi: [f32; 8],
    xg: f32,
    lp: [f32; 8],
    lfo: [f32; 8],
    lfo_inc: [f32; 8],
    depth: f32,
    hp: OnePoleHp,
    sr: f32,
}

const B_LINE_MS: [f32; 8] = [29.7, 37.1, 41.1, 43.7, 53.3, 59.9, 67.3, 73.1];
const B_DIFF_MS: [f32; 4] = [4.7, 3.6, 12.7, 9.3];
const B_MOD_HZ: [f32; 8] = [0.11, 0.17, 0.23, 0.29, 0.31, 0.37, 0.41, 0.47];
/// Reverb time over the crossover against under it: the hall darkens as it dies.
const B_HALL_TOP: f32 = 0.18;
const B_HALL_XOVER: f32 = 6_000.0;
/// Output level: the new hall sits where the old one did on the same send.
const B_HALL_OUT: f32 = 0.41;

impl BeforeHall {
    fn new(sr: f32) -> Self {
        let ms = |m: f32| (m * 0.001 * sr) as usize;
        let depth = 0.000_25 * sr;
        let lens: [f32; 8] = core::array::from_fn(|i| ms(B_LINE_MS[i] * 1.6) as f32);
        let mut h = BeforeHall {
            pre: Line::new(ms(120.0)),
            diff: core::array::from_fn(|i| Line::new(ms(B_DIFF_MS[i]) + 1)),
            lines: core::array::from_fn(|i| Line::new(lens[i] as usize + depth as usize + 4)),
            lens,
            g_lo: [0.0; 8],
            g_hi: [0.0; 8],
            xg: { let g = (core::f32::consts::PI * B_HALL_XOVER / sr).tan(); g / (1.0 + g) },
            lp: [0.0; 8],
            lfo: core::array::from_fn(|i| i as f32 * 0.125),
            lfo_inc: core::array::from_fn(|i| B_MOD_HZ[i] / sr),
            depth,
            hp: OnePoleHp::default(),
            sr,
        };
        h.hp.set(220.0, sr);
        h.set(2.4);
        h
    }

    fn set(&mut self, rt60: f32) {
        for i in 0..8 {
            let g = |rt: f32| 10f32.powf(-3.0 * self.lens[i] / (rt.max(0.05) * self.sr));
            // The diffusers and the crossover's skirt shave about a tenth off the middle: asked for.
            self.g_lo[i] = g(rt60 * 1.12);
            self.g_hi[i] = g(rt60 * B_HALL_TOP);
        }
    }

    #[inline]
    fn tick(&mut self, input: f32) -> (f32, f32) {
        let x = self.hp.tick(input);
        self.pre.write(x);
        let mut d = self.pre.read_int((0.018 * self.sr) as usize);
        // Schroeder allpass diffusers smear the onset.
        for (k, ap) in self.diff.iter_mut().enumerate() {
            let len = (B_DIFF_MS[k] * 0.001 * self.sr) as usize;
            let delayed = ap.read_int(len);
            let g = 0.62;
            let w = d + delayed * g;
            ap.write(flush_denormal(w));
            d = delayed - w * g;
        }
        let mut o = [0.0f32; 8];
        for i in 0..8 {
            self.lfo[i] += self.lfo_inc[i];
            if self.lfo[i] >= 1.0 {
                self.lfo[i] -= 1.0;
            }
            let m = ccd_engine::dsp::sin_cycle(self.lfo[i]) * self.depth;
            o[i] = self.lines[i].read(self.lens[i] + m);
        }
        // Fast Hadamard transform (8 points), scaled to stay lossless.
        let mut h = o;
        let mut step = 1;
        while step < 8 {
            let mut i = 0;
            while i < 8 {
                for j in i..i + step {
                    let a = h[j];
                    let b = h[j + step];
                    h[j] = a + b;
                    h[j + step] = a - b;
                }
                i += step * 2;
            }
            step *= 2;
        }
        let norm = 0.353_553_4; // 1/sqrt(8)
        for i in 0..8 {
            // Loss: split at the crossover, the lows lose g_lo per pass, the highs g_hi.
            let x = h[i] * norm;
            let v = (x - self.lp[i]) * self.xg;
            let lo = v + self.lp[i];
            self.lp[i] = flush_denormal(lo + v);
            let y = self.g_lo[i] * lo + self.g_hi[i] * (x - lo);
            self.lines[i].write(flush_denormal(y + d * 0.35));
        }
        let l = o[0] + o[2] + o[4] + o[6];
        let r = o[1] + o[3] + o[5] + o[7];
        (l * B_HALL_OUT, r * B_HALL_OUT)
    }
}


/// Impulse response, stereo.
fn ir(mut f: impl FnMut(f32) -> (f32, f32), secs: f32) -> (Vec<f32>, Vec<f32>) {
    (0..(SR * secs) as usize).map(|i| f(if i == 0 { 1.0 } else { 0.0 })).unzip()
}

/// Where the first sound comes (ms): the first sample over a thousandth of the peak.
fn first_ms(y: &[f32]) -> f32 {
    let pk = y.iter().fold(0.0f32, |a, v| a.max(v.abs()));
    y.iter().position(|v| v.abs() > pk * 1e-3).unwrap_or(0) as f32 / SR * 1000.0
}

/// Abel and Huang's normalised echo density in 20 ms windows stepped by 5 ms, from the first sound:
/// the share of samples more than one standard deviation out, over Gaussian noise's 0.3173.
fn ned(y: &[f32]) -> Vec<f32> {
    let a = (first_ms(y) / 1000.0 * SR) as usize;
    let y = &y[a..];
    let w = (SR * 0.02) as usize;
    (0..(y.len() - w) / (w / 4)).map(|k| {
        let c = &y[k * w / 4..k * w / 4 + w];
        let sd = (c.iter().map(|v| v * v).sum::<f32>() / w as f32).sqrt();
        c.iter().filter(|v| v.abs() > sd).count() as f32 / w as f32 / 0.3173
    }).collect()
}

/// RT60 at 1 kHz (T20 from the Schroeder integral of an octave band), s.
fn rt60_1k(y: &[f32]) -> f32 {
    let mut bp = ccd_engine::dsp::filter::Svf::default();
    bp.set(1_000.0, 1.4, SR);
    let b: Vec<f64> = y.iter().map(|v| bp.tick(*v).bp as f64).collect();
    let mut edc = vec![0.0f64; b.len()];
    let mut acc = 0.0;
    for i in (0..b.len()).rev() {
        acc += b[i] * b[i];
        edc[i] = acc;
    }
    let t = |db: f64| edc.iter().position(|e| 10.0 * (e / edc[0]).log10() < db).unwrap_or(b.len()) as f32 / SR;
    (t(-25.0) - t(-5.0)) * 3.0
}

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

/// A snare-like burst (noise under a falling envelope, a seeded hash, rolled off over 3 kHz), 200 ms.
fn burst() -> Vec<f32> {
    let mut x = 0x1234_5678u32;
    let mut lp = 0.0f32;
    let k = 1.0 - (-std::f32::consts::TAU * 3_000.0 / SR).exp();
    (0..(SR * 0.2) as usize).map(|i| {
        x ^= x << 13;
        x ^= x >> 17;
        x ^= x << 5;
        lp += k * ((x as f32 / u32::MAX as f32 * 2.0 - 1.0) - lp);
        lp * (-(i as f32) / (SR * 0.04)).exp()
    }).collect()
}

#[test]
fn the_hall_fills_in_fast_and_keeps_its_time_and_level() {
    let mut before = BeforeHall::new(SR);
    let mut after = ccd_engine::fx::Hall::new(SR);
    let (bl, br) = ir(|x| before.tick(x), 4.0);
    let (al, ar) = ir(|x| after.tick(x), 4.0);
    let mono = |l: &[f32], r: &[f32]| l.iter().zip(r).map(|(a, b)| 0.5 * (a + b)).collect::<Vec<f32>>();
    let (bm, am) = (mono(&bl, &br), mono(&al, &ar));
    let report = |name: &str, m: &[f32], l: &[f32], r: &[f32]| {
        let n = ned(m);
        let fill = n.iter().position(|v| *v >= 0.9).map(|k| k as f32 * 5.0 + 10.0).unwrap_or(f32::NAN);
        let n50 = n[..8].iter().sum::<f32>() / 8.0;
        let (f, rt, c) = (first_ms(m), rt60_1k(m), lr_corr(l, r));
        println!("{name}: first sound {f:.1} ms, echo density over the first 50 ms {n50:.2}, reaches 0.9 at {fill:.0} ms, RT60 at 1 kHz {rt:.2} s, left/right correlation {c:+.3}");
        (f, n50, fill, rt, c)
    };
    let b = report("hall before", &bm, &bl, &br);
    let a = report("hall after ", &am, &al, &ar);
    // The same snare-like burst into both: the wet sound's loudness (BS.1770, the engine's own meter).
    let x = burst();
    let wet = |f: &mut dyn FnMut(f32) -> (f32, f32)| -> f32 {
        let (l, r): (Vec<f32>, Vec<f32>) = (0..(SR * 3.0) as usize).map(|i| f(*x.get(i).unwrap_or(&0.0))).unzip();
        ccd_engine::loudness::integrated_lufs(&l, &r, SR)
    };
    let (mut b2, mut a2) = (BeforeHall::new(SR), ccd_engine::fx::Hall::new(SR));
    let (lb, la) = (wet(&mut |v| b2.tick(v)), wet(&mut |v| a2.tick(v)));
    println!("a burst into each: {lb:.2} LUFS before, {la:.2} LUFS after");
    assert!(a.0 < 20.0 && b.0 > 60.0, "the first sound should come at the predelay now: {:.1} ms (was {:.1})", a.0, b.0);
    assert!(a.1 > b.1 + 0.2, "the first 50 ms should be much denser: {:.2} vs {:.2}", a.1, b.1);
    assert!(a.2 < 50.0 && a.2 < b.2 * 0.4, "the density should reach 0.9 within 50 ms: {:.0} ms (was {:.0})", a.2, b.2);
    assert!((a.3 - b.3).abs() < b.3 * 0.08, "the time knob stays honest: {:.2} s vs {:.2} s", a.3, b.3);
    assert!(a.4.abs() < 0.05 && a.4.abs() < b.4.abs(), "left and right should be uncorrelated: {:+.3} (was {:+.3})", a.4, b.4);
    assert!((la - lb).abs() < 1.0, "the hall should sit at its old level on the same send: {la:.2} vs {lb:.2} LUFS");
    // The time knob still follows at its ends.
    for rt in [1.0f32, 5.0] {
        let mut h = ccd_engine::fx::Hall::new(SR);
        h.set(rt);
        let (l, r) = ir(|x| h.tick(x), rt * 2.5);
        let got = rt60_1k(&mono(&l, &r));
        println!("hall after, set to {rt} s: {got:.2} s at 1 kHz");
        assert!((got - rt).abs() < rt * 0.2);
    }
}

#[test]
fn the_hall_costs_little_more() {
    let n = (SR * 20.0) as usize;
    let x = burst();
    let time = |f: &mut dyn FnMut(f32) -> (f32, f32)| {
        let mut best = f64::MAX;
        for _ in 0..5 {
            let t = std::time::Instant::now();
            let mut acc = 0.0f32;
            for i in 0..n {
                let (l, r) = f(x[i % x.len()]);
                acc += l + r;
            }
            std::hint::black_box(acc);
            best = best.min(t.elapsed().as_secs_f64());
        }
        best / 20.0 * 100.0
    };
    let (mut b, mut a) = (BeforeHall::new(SR), ccd_engine::fx::Hall::new(SR));
    let (cb, ca) = (time(&mut |v| b.tick(v)), time(&mut |v| a.tick(v)));
    println!("hall cpu (one core, native, best of five): before {cb:.3}%, after {ca:.3}%");
    assert!(ca < 2.0, "the hall should stay cheap: {ca:.3}%");
}

// ── Cleaner saws and pulses: minBLEP in place of PolyBLEP ─────────────────────────────────────────

use ccd_engine::dsp::osc::{BlepOsc, MinBlepOsc};

/// Energy off the harmonics of `f0`, against the energy on them, in the band the decimator keeps (30 Hz to
/// 20 kHz), for a signal at the voice's rate `sr` (96 kHz), one steady stretch, dB.
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
fn minblep_saws_and_pulses_alias_far_less() {
    let os = 96_000.0f32;
    for n in [36u32, 60, 84, 96, 102, 108] {
        let f0 = 440.0 * 2f32.powf((n as f32 - 69.0) / 12.0);
        let len = 65_536 + 4_096;
        let (mut a, mut b) = (BlepOsc::new(), MinBlepOsc::new());
        let pa: Vec<(f32, f32)> = (0..len).map(|_| a.next(f0 / os)).collect();
        let pb: Vec<(f32, f32)> = (0..len).map(|_| b.next(f0 / os)).collect();
        let saw = |p: &[(f32, f32)]| p.iter().map(|v| v.0).collect::<Vec<f32>>();
        let sq = |p: &[(f32, f32)]| p.iter().map(|v| v.1).collect::<Vec<f32>>();
        let (sa, sb) = (off_harmonics_db(&saw(&pa), f0, os), off_harmonics_db(&saw(&pb), f0, os));
        let (qa, qb) = (off_harmonics_db(&sq(&pa), f0, os), off_harmonics_db(&sq(&pb), f0, os));
        // dc over a whole number of cycles
        let whole = ((len as f32 * f0 / os).floor() * os / f0) as usize;
        let dc = saw(&pb)[..whole].iter().map(|v| *v as f64).sum::<f64>() / whole as f64;
        let rms_a = (saw(&pa).iter().map(|v| (*v as f64).powi(2)).sum::<f64>() / len as f64).sqrt();
        let rms_b = (saw(&pb).iter().map(|v| (*v as f64).powi(2)).sum::<f64>() / len as f64).sqrt();
        println!("note {n}: saw {sa:.1} dB before, {sb:.1} dB after; pulse {qa:.1} dB before, {qb:.1} dB after; saw dc after {dc:+.4}, level {:+.2} dB against before", 20.0 * (rms_b / rms_a).log10());
        assert!(sb < -85.0 && sb < sa - 15.0, "note {n}: saw {sb:.1} dB (was {sa:.1})");
        assert!(qb < -85.0 && qb < qa - 15.0, "note {n}: pulse {qb:.1} dB (was {qa:.1})");
        assert!(dc.abs() < 0.002, "note {n}: the saw should have no dc ({dc:+.4})");
        // PolyBLEP dulls the top octave a little; the minBLEP keeps it, so high notes come out a touch fuller.
        assert!((20.0 * (rms_b / rms_a).log10()).abs() < 0.5, "note {n}: about the same level");
    }
}

/// The ladder as it was before the shootout: the same filter with a plain soft clip (no ADAA).
struct BeforeLadder {
    s: [f32; 4],
    g: f32,
    g1: f32,
    k: f32,
    comp: f32,
}
impl BeforeLadder {
    fn new(fc: f32, res: f32, sr: f32) -> Self {
        let g = (std::f32::consts::PI * (fc / sr).clamp(1e-5, 0.49)).tan();
        let r = res.clamp(0.0, 1.0);
        let k = 4.1 * r * r.sqrt().max(r);
        BeforeLadder { s: [0.0; 4], g, g1: g / (1.0 + g), k, comp: 1.0 + 0.55 * k }
    }
    fn tick(&mut self, x: f32) -> f32 {
        let g1 = self.g1;
        let d = 1.0 / (1.0 + self.g);
        let big_g = g1 * g1 * g1 * g1;
        let s_sum = g1 * g1 * g1 * self.s[0] * d + g1 * g1 * self.s[1] * d + g1 * self.s[2] * d + self.s[3] * d;
        let u = (x * self.comp - self.k * s_sum) / (1.0 + self.k * big_g);
        let mut y = ccd_engine::dsp::soft_clip(u);
        for st in self.s.iter_mut() {
            let v = (y - *st) * g1;
            let out = v + *st;
            *st = flush_denormal(out + v);
            y = out;
        }
        y
    }
}

#[test]
fn the_ladder_clip_aliases_less_and_keeps_its_shape() {
    use ccd_engine::dsp::filter::Ladder;
    let os = 96_000.0f32;
    // A clean (minBLEP) saw at the level the synth voice feeds its filter, the filter wide open.
    for n in [84u32, 96, 108] {
        let f0 = 440.0 * 2f32.powf((n as f32 - 69.0) / 12.0);
        let len = 65_536 + 4_096;
        let mut o = MinBlepOsc::new();
        let x: Vec<f32> = (0..len).map(|_| o.next(f0 / os).0 * 0.375).collect();
        let fc = 16_000.0 * 2f32.powf((n as f32 - 60.0) / 12.0 * 0.4);
        let mut b = BeforeLadder::new(fc.min(os * 0.45), 0.0, os);
        let mut a = Ladder::default();
        a.set(fc.min(os * 0.45), 0.0, os);
        let yb: Vec<f32> = x.iter().map(|v| b.tick(*v)).collect();
        let ya: Vec<f32> = x.iter().map(|v| a.tick(*v)).collect();
        let (db_b, db_a) = (off_harmonics_db(&yb, f0, os), off_harmonics_db(&ya, f0, os));
        println!("ladder open, note {n}: off the harmonics {db_b:.1} dB before, {db_a:.1} dB after");
        assert!(db_a < db_b - 10.0, "note {n}: {db_a:.1} vs {db_b:.1}");
    }
    // Its shape: the resonant peak and the bass, on noise, at three resonances.
    for res in [0.3f32, 0.6, 0.9] {
        let mut b = BeforeLadder::new(1_000.0, res, os);
        let mut a = Ladder::default();
        a.set(1_000.0, res, os);
        let mut seed = 99u32;
        let x: Vec<f32> = (0..(os as usize)).map(|_| { seed ^= seed << 13; seed ^= seed >> 17; seed ^= seed << 5; (seed as f32 / u32::MAX as f32 - 0.5) * 0.2 }).collect();
        let band = |y: &[f32], lo: f32, hi: f32| {
            let s = spectrum(&y[y.len() - 65_536..]);
            let e: f64 = s.iter().enumerate().filter(|(k, _)| { let f = *k as f32 * os / 65_536.0; f >= lo && f < hi }).map(|(_, m)| (*m as f64).powi(2)).sum();
            10.0 * e.log10() as f32
        };
        let yb: Vec<f32> = x.iter().map(|v| b.tick(*v)).collect();
        let ya: Vec<f32> = x.iter().map(|v| a.tick(*v)).collect();
        let (pb, pa) = (band(&yb, 900.0, 1_100.0) - band(&yb, 100.0, 200.0), band(&ya, 900.0, 1_100.0) - band(&ya, 100.0, 200.0));
        println!("ladder at 1 kHz, resonance {res}: peak over bass {pb:+.2} dB before, {pa:+.2} dB after");
        assert!((pa - pb).abs() < 0.5, "res {res}: the shape should hold ({pa:.2} vs {pb:.2})");
    }
}

/// CPU of one voice and one effect, native, for the shootout's table (`--ignored`, best of five 10 s runs).
#[test]
#[ignore]
fn cpu_per_voice() {
    use ccd_engine::inst::bass::Bass;
    use ccd_engine::inst::synth::Lead;
    use ccd_engine::params::*;
    let secs = 10.0f32;
    let n = (SR * secs) as usize;
    let time = |name: &str, f: &mut dyn FnMut() -> f32| {
        let mut best = f64::MAX;
        for _ in 0..5 {
            let t = std::time::Instant::now();
            let mut acc = 0.0f32;
            for _ in 0..n {
                acc += f();
            }
            std::hint::black_box(acc);
            best = best.min(t.elapsed().as_secs_f64());
        }
        println!("{name}: {:.2}%", best / secs as f64 * 100.0);
    };
    let lead = |detune: f32| {
        let mut l = Lead::new(SR);
        l.set_param(LD_DETUNE, LEAD_PARAMS[LD_DETUNE].to_value(detune));
        l.note_on(60, 0.9);
        l
    };
    let mut a = lead(0.0);
    time("ours lead saw, 1 voice", &mut || a.tick());
    let mut b = lead(0.6);
    time("ours lead supersaw (7 saws), 1 note", &mut || b.tick());
    let mut c = Bass::new(SR);
    c.note_on(36, 0.9);
    time("ours bass, 1 voice", &mut || c.tick());
    let x = burst();
    let mut h = ccd_engine::fx::Hall::new(SR);
    let mut i = 0usize;
    time("ours hall (stereo out)", &mut || { i += 1; let (l, r) = h.tick(x[i % x.len()]); l + r });
    let mut p = ccd_engine::fx::Plate::new(SR);
    time("ours plate (stereo out)", &mut || { i += 1; let (l, r) = p.tick(x[i % x.len()]); l + r });
    let mut e = ccd_engine::fx::Echo::new(SR);
    e.set_kind(ccd_engine::fx::ECHO_TAPE);
    time("ours tape echo (stereo out)", &mut || { i += 1; let (l, r) = e.tick(x[i % x.len()]); l + r });
}

/// What the oscillator and ladder changes cost, each on its own (`--ignored`): ns per sample at 96 kHz.
#[test]
#[ignore]
fn cpu_of_the_parts() {
    use ccd_engine::dsp::filter::Ladder;
    let n = 4_000_000usize;
    let time = |name: &str, f: &mut dyn FnMut(usize) -> f32| {
        let mut best = f64::MAX;
        for _ in 0..5 {
            let t = std::time::Instant::now();
            let mut acc = 0.0f32;
            for i in 0..n {
                acc += f(i);
            }
            std::hint::black_box(acc);
            best = best.min(t.elapsed().as_secs_f64());
        }
        println!("{name}: {:.2} ns a sample", best / n as f64 * 1e9);
    };
    let dt = 220.0 / 96_000.0;
    let (mut a, mut b) = (BlepOsc::new(), MinBlepOsc::new());
    time("polyblep osc", &mut |_| { let (s, q) = a.next(dt); s + q });
    time("minblep osc", &mut |_| { let (s, q) = b.next(dt); s + q });
    let mut o = MinBlepOsc::new();
    let x: Vec<f32> = (0..96_000).map(|_| o.next(dt).0 * 0.375).collect();
    let mut lb = BeforeLadder::new(2_000.0, 0.3, 96_000.0);
    let mut la = Ladder::default();
    la.set(2_000.0, 0.3, 96_000.0);
    time("ladder before", &mut |i| lb.tick(x[i % x.len()]));
    time("ladder after", &mut |i| la.tick(x[i % x.len()]));
}
