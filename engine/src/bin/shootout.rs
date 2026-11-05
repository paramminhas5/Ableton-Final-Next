//! The sound shootout: our side of every pair in `design/sound-shootout.md`, rendered natively.
//! The other side (Surge XT, Vitalium, Odin 2, Dexed, Geonkick, Dragonfly, CHOW Tape) is rendered by
//! `scripts/shootout/theirs.py` with the same notes, lengths and rate, and both go through the same
//! measurement code (`scripts/shootout/measure.py`).
//! Usage: cargo run --release --bin shootout -- <out dir>
//! Everything is 48 kHz, 32-bit float wav, unnormalised (the measurements want the real levels; the
//! blind pairs are loudness-matched later). Instruments run through the whole engine with the glue off,
//! the reverb and echo are driven directly so they can take the same dry input as the plugins.

use ccd_engine::engine::{cmd, Cmd, Engine};
use ccd_engine::fx::{Echo, Reverb, ECHO_TAPE, HALL, PLATE};
use ccd_engine::params::*;

const SR: f32 = 48_000.0;

struct R {
    e: Engine,
}

type Auto<'a> = &'a mut dyn FnMut(&R, f64);

impl R {
    fn new(bpm: f64, beats: f64) -> Self {
        let r = R { e: Engine::new(SR) };
        r.send(cmd::TEMPO, 0, 0, 0.0, bpm, 0.0);
        r.send(cmd::LOOP, 0, 0, 0.0, beats, 0.0);
        // The glue off, so the measurements see the instrument (the limiter stays, far from its ceiling).
        r.send(cmd::MASTER, 0, 1, 0.0, 0.0, 0.0);
        r
    }
    fn send(&self, kind: u32, layer: u32, a: u32, x: f32, y: f64, z: f64) {
        self.e.send(Cmd { kind, layer, a, x, y, z });
    }
    fn inst(&self, inst: Instrument) {
        self.inst_on(0, inst);
    }
    fn inst_on(&self, layer: u32, inst: Instrument) {
        self.send(cmd::INSTRUMENT, layer, inst as u32, 0.0, 0.0, 0.0);
        self.send(cmd::PARAM, layer, L_LEVEL as u32, 0.6, 0.0, 0.0);
    }
    /// A layer param (normalised).
    fn lp(&self, index: usize, n: f32) {
        self.send(cmd::PARAM, 0, index as u32, n, 0.0, 0.0);
    }
    /// An instrument param (normalised).
    fn ip(&self, index: usize, n: f32) {
        self.lp(INSTRUMENT_BASE + index, n);
    }
    fn ip_on(&self, layer: u32, index: usize, n: f32) {
        self.send(cmd::PARAM, layer, (INSTRUMENT_BASE + index) as u32, n, 0.0, 0.0);
    }
    /// Notes in seconds: (start, note, length, velocity 0..1). The loop is long enough never to wrap.
    fn notes(&self, bpm: f64, ev: &[(f64, u32, f64, f32)]) {
        self.notes_on(0, bpm, ev);
    }
    fn notes_on(&self, layer: u32, bpm: f64, ev: &[(f64, u32, f64, f32)]) {
        let b = bpm / 60.0;
        self.send(cmd::EV_CLEAR, layer, 0, 0.0, 0.0, 0.0);
        for &(start, note, len, vel) in ev {
            self.send(cmd::EV_ADD, layer, note, vel, start * b, len * b);
        }
        self.send(cmd::EV_COMMIT, layer, 0, 0.0, 0.0, 0.0);
    }
    /// For matching patches by ear and meter: SHOOT_SET="3=0.4,5=0.8" sets instrument params on layer 0.
    fn overrides(&self) {
        if let Ok(v) = std::env::var("SHOOT_SET") {
            for kv in v.split(',').filter(|s| !s.is_empty()) {
                let (k, n) = kv.split_once('=').unwrap();
                self.ip(k.parse().unwrap(), n.parse().unwrap());
            }
        }
    }
    fn play(&mut self, seconds: f64, auto: Option<Auto>) -> Vec<[f32; 2]> {
        self.overrides();
        self.send(cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
        let total = (SR as f64 * seconds) as usize;
        let mut out = Vec::with_capacity(total);
        let mut done = 0;
        let mut auto = auto;
        while done < total {
            if let Some(a) = auto.as_mut() {
                a(self, done as f64 / SR as f64);
            }
            let n = 128.min(total - done);
            unsafe { self.e.process(n) };
            let c = unsafe { self.e.core() };
            for i in 0..n {
                out.push([c.out_l[i], c.out_r[i]]);
            }
            done += n;
        }
        // The engine's fixed latency off the front, so every clip starts where its notes do.
        out.drain(..ccd_engine::engine::LATENCY.min(out.len()));
        out
    }
}

fn write_wav(path: &str, y: &[[f32; 2]]) {
    let sr = SR as u32;
    let len = (y.len() * 8) as u32;
    let mut b = Vec::with_capacity(44 + len as usize);
    b.extend_from_slice(b"RIFF");
    b.extend_from_slice(&(36 + len).to_le_bytes());
    b.extend_from_slice(b"WAVEfmt ");
    b.extend_from_slice(&16u32.to_le_bytes());
    b.extend_from_slice(&3u16.to_le_bytes()); // IEEE float
    b.extend_from_slice(&2u16.to_le_bytes());
    b.extend_from_slice(&sr.to_le_bytes());
    b.extend_from_slice(&(sr * 8).to_le_bytes());
    b.extend_from_slice(&8u16.to_le_bytes());
    b.extend_from_slice(&32u16.to_le_bytes());
    b.extend_from_slice(b"data");
    b.extend_from_slice(&len.to_le_bytes());
    for s in y {
        b.extend_from_slice(&s[0].to_le_bytes());
        b.extend_from_slice(&s[1].to_le_bytes());
    }
    std::fs::write(path, b).unwrap();
}

/// The acid line (130 bpm, sixteenths): (step, note, accent, slide into the next).
pub const ACID: [(u32, u32, bool, bool); 16] = [
    (0, 33, true, false), (2, 33, false, false), (3, 45, false, true), (4, 43, true, false), (6, 33, false, false), (7, 36, false, true),
    (8, 38, true, false), (10, 33, false, false), (11, 45, true, false), (12, 33, false, true), (13, 40, false, false), (14, 31, true, false),
    (15, 33, false, false), (16, 33, true, false), (18, 45, false, true), (19, 43, false, false),
];
const ACID_BPM: f64 = 130.0;

/// The acid line as notes in seconds; a slide holds the note into the next one (legato), as a 303 does.
pub fn acid_notes() -> Vec<(f64, u32, f64, f32)> {
    let step = 60.0 / ACID_BPM / 4.0;
    let mut out = Vec::new();
    for bar in 0..2u32 {
        for (k, &(s, n, acc, slide)) in ACID.iter().enumerate() {
            if s >= 16 {
                continue;
            }
            let next = ACID.get(k + 1).map(|x| x.0).filter(|x| *x < 16).unwrap_or(16);
            let len = if slide { (next - s) as f64 * step + 0.02 } else { step * 0.55 };
            out.push(((bar * 16 + s) as f64 * step, n, len, if acc { 1.0 } else { 0.7 }));
        }
    }
    out
}

/// The filter sweep: cutoff from 100 Hz to 8 kHz, exponentially, over four seconds after a quarter second.
pub fn sweep_hz(t: f64) -> f64 {
    let x = ((t - 0.25) / 4.0).clamp(0.0, 1.0);
    100.0 * 80f64.powf(x)
}

fn main() {
    let dir = std::env::args().nth(1).unwrap_or_else(|| ".".into());
    std::fs::create_dir_all(&dir).unwrap();
    let only = std::env::args().nth(2);
    let want = |name: &str| only.as_deref().map(|o| name.starts_with(o)).unwrap_or(true);
    let save = |name: &str, y: &[[f32; 2]]| {
        write_wav(&format!("{dir}/{name}.wav"), y);
        let peak = y.iter().fold(0.0f32, |a, s| a.max(s[0].abs()).max(s[1].abs()));
        println!("{name}: {:.2}s peak {peak:.3}", y.len() as f32 / SR);
    };

    // 1. Aliasing: one plain saw (no detune, no sub, filter open), held, at four high notes.
    if want("alias") {
        for osc in [0.0f32, 1.0 / 3.0] {
            for n in [84u32, 96, 102, 108] {
                let mut r = R::new(120.0, 64.0);
                if osc == 0.0 {
                    // The chord synth with voicing at 0 is one plain saw with no sub.
                    r.inst(Instrument::Chords);
                    r.ip(C_VOICING, 0.0);
                    r.ip(C_SPREAD, 0.0);
                    r.ip(C_ATTACK, 0.0);
                    r.ip(C_RES, 0.0);
                    r.ip(C_ENV, 0.0);
                    r.ip(C_CUTOFF, 1.0);
                    r.ip(C_DRIFT, 0.0);
                    if let Ok(c) = std::env::var("SHOOT_CHAR") {
                        r.ip(C_CHAR, c.parse().unwrap());
                    }
                } else {
                    // The chord synth's table has no position knob (it plays the sine frame), so the
                    // table's saw frame is played on the lead (which adds a quiet sine sub an octave down).
                    r.inst(Instrument::Lead);
                    r.ip(LD_OSC, osc);
                    r.ip(LD_WAVE, 2.0 / 7.0);
                    r.ip(LD_CUTOFF, 1.0);
                    r.ip(LD_RES, 0.0);
                    r.ip(LD_ENV, 0.0);
                    r.ip(LD_ATTACK, 0.0);
                }
                r.notes(120.0, &[(0.0, n, 1.2, 0.9)]);
                let y = r.play(1.5, None);
                save(&format!("alias_{}_{n}", if osc > 0.0 { "table" } else { "saw" }), &y);
            }
        }
    }

    // 2. Supersaw lead: seven saws, detune 0.6, filter open, a short phrase.
    if want("supersaw") {
        let mut r = R::new(120.0, 64.0);
        r.inst(Instrument::Lead);
        r.ip(LD_DETUNE, 0.6);
        r.ip(LD_CUTOFF, 1.0);
        r.ip(LD_RES, 0.0);
        r.ip(LD_ENV, 0.0);
        r.ip(LD_GLIDE, 0.0);
        r.ip(LD_RELEASE, 0.35);
        r.notes(120.0, &[(0.0, 69, 0.9, 0.8), (1.0, 72, 0.4, 0.8), (1.5, 76, 0.4, 0.8), (2.0, 74, 1.4, 0.8)]);
        save("supersaw", &r.play(4.0, None));
    }

    // 3. Filter sweeps: a saw at note 36 through each circuit, three resonances (and full), two drives.
    if want("filt") {
        for (cname, ch) in [("prd", 0.0f32), ("ms2", 0.5), ("svf", 1.0)] {
            for res in [0.3f32, 0.6, 0.9, 1.0] {
                for drv in [0.0f32, 0.6] {
                    if res >= 1.0 && drv > 0.0 {
                        continue;
                    }
                    let mut r = R::new(120.0, 64.0);
                    r.inst(Instrument::Lead);
                    r.ip(LD_DETUNE, 0.0);
                    r.ip(LD_ENV, 0.0);
                    r.ip(LD_RES, res);
                    r.ip(LD_CHAR, ch);
                    r.ip(LD_FDRIVE, drv);
                    r.ip(LD_ATTACK, 0.0);
                    r.notes(120.0, &[(0.0, 36, 4.6, 0.9)]);
                    // The lead tracks the keyboard by 0.4 octave per octave from middle c: undo it, so the
                    // cutoff is the swept value at note 36.
                    let key = 2f64.powf(0.8);
                    let spec = LEAD_PARAMS[LD_CUTOFF];
                    let mut auto = |r: &R, t: f64| r.ip(LD_CUTOFF, spec.from_value((sweep_hz(t) * key) as f32));
                    let y = r.play(4.5, Some(&mut auto));
                    save(&format!("filt_{cname}_r{:02}_d{:02}", (res * 10.0).round() as u32, (drv * 10.0).round() as u32), &y);
                }
            }
        }
    }

    // 4. Acid bass: the 303-style line on our bass, prd circuit, resonance up, short decay, slides.
    if want("acid") {
        let mut r = R::new(ACID_BPM, 64.0);
        r.inst(Instrument::Bass);
        // Cutoff and envelope set so the line opens as far as Odin 2's does (spectral centroid, measured).
        r.ip(B_CUTOFF, 0.66);
        r.ip(B_RES, 0.75);
        r.ip(B_ENV, 0.8);
        r.ip(B_DECAY, 0.3);
        r.ip(B_GLIDE, 0.15);
        r.ip(B_SUB, 0.0);
        r.ip(B_WAVE, 0.0);
        r.ip(B_DRIFT, 0.0);
        r.ip(B_FDRIVE, 0.3);
        r.notes(ACID_BPM, &acid_notes());
        save("acid", &r.play(60.0 / ACID_BPM * 8.0 + 0.4, None));
    }

    // 5. Fm: an electric piano (ratio 1) as chords, and a bell (ratio 4) as single high notes.
    if want("fm") {
        for (name, ratio, ev) in [
            ("fm_ep", 1.0f32 / 8.0, vec![(0.0, 57u32, 1.4, 0.8f32), (0.0, 60, 1.4, 0.8), (0.0, 64, 1.4, 0.8), (1.6, 55, 1.4, 0.8), (1.6, 59, 1.4, 0.8), (1.6, 62, 1.4, 0.8)]),
            ("fm_bell", 4.0 / 8.0, vec![(0.0, 76, 0.3, 0.9), (0.8, 81, 0.3, 0.9), (1.6, 84, 0.3, 0.9), (2.4, 88, 0.3, 0.9)]),
        ] {
            let mut r = R::new(120.0, 64.0);
            r.inst(Instrument::Chords);
            r.ip(C_VOICING, 0.0);
            r.ip(C_SPREAD, 0.0);
            // The index set so the brightness matches Dexed's patch (spectral centroid, measured).
            r.ip(C_FM, 0.7);
            r.ip(C_RATIO, ratio);
            r.ip(C_ATTACK, 0.0);
            r.ip(C_CUTOFF, 1.0);
            r.ip(C_RES, 0.0);
            r.ip(C_ENV, 0.0);
            r.ip(C_FDECAY, 0.55);
            r.ip(C_RELEASE, 0.55);
            if let Ok(d) = std::env::var("SHOOT_DRIFT") {
                r.ip(C_DRIFT, d.parse().unwrap());
            }
            if let Ok(c) = std::env::var("SHOOT_CHAR") {
                r.ip(C_CHAR, c.parse().unwrap());
            }
            r.notes(120.0, &ev);
            save(name, &r.play(3.6, None));
        }
    }

    // 6. Wavetable pad: the table oscillator's saw frame, chords, slow attack, spread.
    if want("pad") {
        // The chord synth's table has no position knob, so the pad is the lead's table (saw frame) on
        // three layers, one note each.
        let mut r = R::new(120.0, 64.0);
        let chords = [[57u32, 55], [60, 59], [64, 62]];
        for (k, ns) in chords.iter().enumerate() {
            let l = k as u32;
            r.inst_on(l, Instrument::Lead);
            r.ip_on(l, LD_OSC, 1.0 / 3.0);
            r.ip_on(l, LD_WAVE, 2.0 / 7.0);
            r.ip_on(l, LD_ATTACK, 0.85);
            r.ip_on(l, LD_RELEASE, 0.6);
            r.ip_on(l, LD_CUTOFF, 0.86);
            r.ip_on(l, LD_RES, 0.1);
            r.ip_on(l, LD_ENV, 0.0);
            r.ip_on(l, LD_GLIDE, 0.0);
            r.notes_on(l, 120.0, &[(0.0, ns[0], 1.8, 0.7), (2.0, ns[1], 1.8, 0.7)]);
        }
        save("pad", &r.play(4.6, None));
    }

    // 7. Kicks: an 808 (round body, long) and a techno kick (hard body, shorter, some drive), two hits each.
    if want("kick") {
        for (name, shape, decay, drive) in [("kick_808", 0.0f32, 0.85f32, 0.0f32), ("kick_techno", 1.0, 0.45, 0.25)] {
            let mut r = R::new(120.0, 64.0);
            r.inst(Instrument::Drums);
            r.ip(1, decay);
            r.ip(2, drive);
            r.ip(DRUM_PAD2_BASE + DP_SHAPE, shape);
            r.notes(120.0, &[(0.0, 36, 0.2, 1.0), (1.0, 36, 0.2, 1.0)]);
            save(name, &r.play(2.0, None));
        }
    }

    // 8. Dry sources for the reverbs and the tape: a snare hit and a chord, no send, no echo.
    let dry_snare = {
        let mut r = R::new(120.0, 64.0);
        r.inst(Instrument::Drums);
        r.notes(120.0, &[(0.0, 38, 0.2, 0.95)]);
        r.play(0.6, None)
    };
    let dry_chord = {
        let mut r = R::new(120.0, 64.0);
        r.inst(Instrument::Chords);
        r.ip(C_ATTACK, 0.2);
        r.notes(120.0, &[(0.0, 57, 0.9, 0.75), (0.0, 60, 0.9, 0.75), (0.0, 64, 0.9, 0.75)]);
        r.play(1.2, None)
    };
    if want("dry") {
        save("dry_snare", &dry_snare);
        save("dry_chord", &dry_chord);
    }

    // 9. The reverbs, driven directly: the impulse response, and the snare and chord (wet only, mono in).
    if want("verb") {
        for (name, kind) in [("hall", HALL), ("plate", PLATE)] {
            let run = |x: &[f32], tail: f64| -> Vec<[f32; 2]> {
                let mut v = Reverb::new(SR);
                v.set_kind(kind);
                v.set(2.4);
                let n = x.len() + (tail * SR as f64) as usize;
                (0..n).map(|i| { let (l, r) = v.tick(*x.get(i).unwrap_or(&0.0)); [l, r] }).collect()
            };
            let mut imp = vec![0.0f32; 1];
            imp[0] = 1.0;
            save(&format!("ir_{name}"), &run(&imp, 6.0));
            let mono = |y: &[[f32; 2]]| y.iter().map(|s| 0.5 * (s[0] + s[1])).collect::<Vec<f32>>();
            save(&format!("{name}_snare_wet"), &run(&mono(&dry_snare), 3.4));
            save(&format!("{name}_chord_wet"), &run(&mono(&dry_chord), 2.8));
        }
    }

    // 10. Tape: our tape echo with no feedback, so its output is one pass through the tape (wow, flutter,
    // the record head), driven directly. A 1 kHz sine at five levels, and the chord.
    if want("tape") {
        let run = |x: &[f32]| -> Vec<[f32; 2]> {
            let mut e = Echo::new(SR);
            e.set_kind(ECHO_TAPE);
            e.set_tempo(120.0);
            e.feedback = 0.0;
            // Settle the delay time (it glides to the tempo's) before anything goes in.
            for _ in 0..(SR as usize * 4) {
                e.tick(0.0);
            }
            let d = (SR * 0.375) as usize;
            let n = x.len() + d;
            // The repeats duck while something plays into them: undone here (the duck is a plain gain), so
            // what is measured is the tape.
            let y: Vec<[f32; 2]> = (0..n).map(|i| { let (l, _) = e.tick(*x.get(i).unwrap_or(&0.0)); let o = l / e.duck.max(1e-3); [o, o] }).collect();
            y[d..].to_vec()
        };
        for db in [-24i32, -18, -12, -6, 0] {
            let a = 10f32.powf(db as f32 / 20.0);
            let x: Vec<f32> = (0..(SR as usize * 4)).map(|i| a * (core::f32::consts::TAU * 1000.0 * i as f32 / SR).sin()).collect();
            save(&format!("tape_sine_{}", -db), &run(&x));
        }
        let mono: Vec<f32> = dry_chord.iter().map(|s| 0.5 * (s[0] + s[1])).collect();
        // The chord pushed in 12 dB hotter, so the record head works.
        let hot: Vec<f32> = mono.iter().map(|v| v * 4.0).collect();
        save("tape_chord", &run(&hot));
    }
}
