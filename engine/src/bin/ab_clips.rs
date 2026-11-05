//! "Hear the difference" clips: the same phrases rendered through the engine, so one engine version
//! can be a/b'd against another. Run it before and after an engine change, into two folders, and the
//! app's /engine/ab page plays them side by side.
//! Usage: cargo run --release --bin ab_clips -- <out dir>
//! Each clip is 48 kHz, stereo, 16 bit, normalised to the same loudness (-30 dB RMS) so level never
//! decides the a/b: a louder clip always sounds "better", which would make the comparison dishonest.

use ccd_engine::engine::{cmd, Cmd, Engine};
use ccd_engine::params::*;

const SR: f32 = 48_000.0;
/// Wire index of pad 0's second page (INSTRUMENT_BASE + DRUM_PAD2_BASE), written out so this file also
/// builds against the pre-engine-2 commit that renders the before set (which ignores the param).
const PAD2: usize = 96;
/// The bass's character and filter drive knobs (INSTRUMENT_BASE + B_CHAR, + B_FDRIVE), written out for
/// the same reason.
const BASS_CHAR: usize = 24;
const BASS_FDRIVE: usize = 25;
/// The chord synth's voice and bright knobs (INSTRUMENT_BASE + C_VOICE, + C_BRIGHT).
const CHORD_VOICE: usize = 33;
const CHORD_BRIGHT: usize = 35;
/// The lead's oscillator knob (INSTRUMENT_BASE + LD_OSC).
const LEAD_OSC: usize = 36;

struct R {
    e: Engine,
    l: Vec<f32>,
    r: Vec<f32>,
}

impl R {
    fn new(bpm: f64) -> Self {
        let r = R { e: Engine::new(SR), l: Vec::new(), r: Vec::new() };
        r.send(cmd::TEMPO, 0, 0, 0.0, bpm, 0.0);
        r.send(cmd::LOOP, 0, 0, 0.0, 4.0, 0.0);
        r
    }
    fn send(&self, kind: u32, layer: u32, a: u32, x: f32, y: f64, z: f64) {
        self.e.send(Cmd { kind, layer, a, x, y, z });
    }
    fn inst(&self, layer: u32, inst: Instrument) {
        self.send(cmd::INSTRUMENT, layer, inst as u32, 0.0, 0.0, 0.0);
    }
    fn param(&self, layer: u32, index: usize, n: f32) {
        self.send(cmd::PARAM, layer, index as u32, n, 0.0, 0.0);
    }
    fn pattern(&self, layer: u32, ev: &[(f64, u32, f64, f32)]) {
        self.send(cmd::EV_CLEAR, layer, 0, 0.0, 0.0, 0.0);
        for &(start, note, len, vel) in ev {
            self.send(cmd::EV_ADD, layer, note, vel, start, len);
        }
        self.send(cmd::EV_COMMIT, layer, 0, 0.0, 0.0, 0.0);
    }
    fn play(&mut self, seconds: f64) -> (Vec<f32>, Vec<f32>) {
        self.send(cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
        let total = (SR as f64 * seconds) as usize;
        let mut done = 0;
        while done < total {
            let n = 256.min(total - done);
            unsafe { self.e.process(n) };
            let c = unsafe { self.e.core() };
            for i in 0..n {
                self.l.push(c.out_l[i]);
                self.r.push(c.out_r[i]);
            }
            done += n;
        }
        (std::mem::take(&mut self.l), std::mem::take(&mut self.r))
    }
}

fn four_floor() -> Vec<(f64, u32, f64, f32)> {
    (0..4).map(|b| (b as f64, 36, 0.25, 1.0)).collect()
}

type Clip = (&'static str, &'static str, (Vec<f32>, Vec<f32>));

fn clips() -> Vec<Clip> {
    let mut out: Vec<Clip> = Vec::new();
    // Drums, one sound at a time, then the kit.
    for (name, note, what) in [("kick", 36u32, "the kick, four to the bar"), ("snare", 38, "the snare on 2 and 4"), ("clap", 39, "the clap on 2 and 4"), ("hats", 42, "closed hats, sixteenths, open on the offbeat")] {
        let mut r = R::new(124.0);
        r.inst(0, Instrument::Drums);
        let ev: Vec<(f64, u32, f64, f32)> = match note {
            36 => four_floor(),
            42 => (0..16).map(|i| (i as f64 * 0.25, if i % 4 == 2 { 46 } else { 42 }, 0.1, if i % 4 == 0 { 0.7 } else { 0.4 })).collect(),
            _ => vec![(1.0, note, 0.25, 0.9), (3.0, note, 0.25, 0.9)],
        };
        r.pattern(0, &ev);
        out.push((name, what, r.play(3.87)));
    }
    // The kick's three bodies: round, tight and hard, two hits each.
    {
        let mut r = R::new(124.0);
        r.send(cmd::LOOP, 0, 0, 0.0, 8.0, 0.0);
        for (layer, shape) in [(0u32, 0.0f32), (1, 0.5), (2, 1.0)] {
            r.inst(layer, Instrument::Drums);
            r.param(layer, PAD2, shape);
            let b = layer as f64 * 2.0;
            r.pattern(layer, &[(b, 36, 0.25, 1.0), (b + 1.0, 36, 0.25, 1.0)]);
        }
        out.push(("kicks", "the kick's three bodies, two hits each", r.play(3.87)));
    }
    // Item 8: one snare, three ways (a fat body, a tight bright snap, a long rattle), two hits each.
    {
        let mut r = R::new(124.0);
        r.send(cmd::LOOP, 0, 0, 0.0, 8.0, 0.0);
        // knob k of pad p's second page is PAD2 + p * 8 + k: noise 1, snap 2, color 3, sweep 4.
        let snare = PAD2 + 8;
        let ways: [&[(usize, f32)]; 3] = [&[(1, 0.3), (4, 0.85)], &[(1, 0.7), (2, 0.2), (3, 0.8)], &[(1, 0.6), (2, 0.9), (3, 0.4)]];
        for (layer, set) in ways.iter().enumerate() {
            let layer = layer as u32;
            r.inst(layer, Instrument::Drums);
            for (k, n) in set.iter() {
                r.param(layer, snare + k, *n);
            }
            let b = layer as f64 * 2.0 + 1.0;
            r.pattern(layer, &[(b, 38, 0.25, 0.9), (b + 0.75, 38, 0.25, 0.7)]);
        }
        out.push(("snares", "one snare three ways: fat body, tight snap, long rattle", r.play(3.87)));
    }
    // Item 8: metallic percussion (the perc pads as a bell and a metal bar) over hats that vary per hit.
    {
        let mut r = R::new(124.0);
        r.inst(0, Instrument::Drums);
        r.param(0, PAD2 + 12 * 8, 0.5); // perc 1: bell
        r.param(0, PAD2 + 13 * 8, 1.0); // perc 2: metal
        r.param(0, PAD2 + 13 * 8 + 5, 0.25); // a little wobble on the metal
        r.param(0, PAD2 + 4 * 8 + 6, 0.45); // closed hat: random
        let mut ev: Vec<(f64, u32, f64, f32)> = (0..16).map(|i| (i as f64 * 0.25, 42, 0.1, 0.5)).collect();
        ev.extend([0.5, 1.5, 1.75, 2.5, 3.5].iter().map(|b| (*b, 60, 0.2, 0.8)));
        ev.extend([(0.0, 61, 0.2, 0.9), (2.75, 61, 0.2, 0.7)]);
        r.pattern(0, &ev);
        out.push(("perc", "a bell and a metal bar over hats that change a little every hit", r.play(3.87)));
    }
    {
        let mut r = R::new(124.0);
        r.inst(0, Instrument::Drums);
        let mut ev = four_floor();
        ev.extend([(1.0, 39, 0.25, 0.85), (3.0, 39, 0.25, 0.85)]);
        ev.extend((0..16).map(|i| (i as f64 * 0.25, if i % 4 == 2 { 46 } else { 42 }, 0.1, if i % 4 == 0 { 0.6 } else { 0.35 })));
        r.pattern(0, &ev);
        r.param(0, INSTRUMENT_BASE + 2, 0.35); // kick drive
        out.push(("kit", "the whole kit with some drive on the kick", r.play(3.87)));
    }
    // Bass: a rolling line, filter open then closing.
    {
        let mut r = R::new(124.0);
        r.inst(0, Instrument::Bass);
        r.pattern(0, &[(0.5, 33, 0.25, 0.9), (1.5, 33, 0.25, 0.9), (1.75, 45, 0.2, 0.7), (2.5, 36, 0.25, 0.9), (3.5, 31, 0.25, 0.9), (3.75, 33, 0.2, 0.7)]);
        r.param(0, INSTRUMENT_BASE + B_ENV, 0.7);
        r.param(0, INSTRUMENT_BASE + B_RES, 0.5);
        out.push(("bass", "a rolling bass with the filter envelope working", r.play(3.87)));
    }
    // The same rolling bass through the other two filter characters, resonance up and some drive in.
    for (name, what, ch) in [("scream", "the rolling bass through the scream filter, driven", 0.5f32), ("smooth", "the rolling bass through the smooth filter", 1.0)] {
        let mut r = R::new(124.0);
        r.inst(0, Instrument::Bass);
        r.pattern(0, &[(0.5, 33, 0.25, 0.9), (1.5, 33, 0.25, 0.9), (1.75, 45, 0.2, 0.7), (2.5, 36, 0.25, 0.9), (3.5, 31, 0.25, 0.9), (3.75, 33, 0.2, 0.7)]);
        r.param(0, INSTRUMENT_BASE + B_ENV, 0.7);
        r.param(0, INSTRUMENT_BASE + B_RES, 0.65);
        r.param(0, BASS_CHAR, ch);
        r.param(0, BASS_FDRIVE, if ch < 0.75 { 0.55 } else { 0.2 });
        out.push((name, what, r.play(3.87)));
    }
    // Lead: a held note with detune, then a short phrase.
    {
        let mut r = R::new(124.0);
        r.inst(0, Instrument::Lead);
        r.pattern(0, &[(0.0, 69, 1.9, 0.9), (2.0, 72, 0.45, 0.9), (2.5, 71, 0.45, 0.8), (3.0, 67, 0.9, 0.9)]);
        r.param(0, INSTRUMENT_BASE + LD_DETUNE, 0.6);
        r.param(0, INSTRUMENT_BASE + LD_RES, 0.45);
        out.push(("lead", "a detuned lead, held then played", r.play(3.87)));
    }
    // Chords: a pad with slow attack and release.
    {
        let mut r = R::new(124.0);
        r.inst(0, Instrument::Chords);
        r.pattern(0, &[(0.0, 57, 1.9, 0.7), (0.0, 60, 1.9, 0.7), (0.0, 64, 1.9, 0.7), (2.0, 55, 1.9, 0.7), (2.0, 59, 1.9, 0.7), (2.0, 62, 1.9, 0.7)]);
        r.param(0, INSTRUMENT_BASE + C_ATTACK, 0.45);
        r.param(0, INSTRUMENT_BASE + C_RELEASE, 0.6);
        r.param(0, INSTRUMENT_BASE + C_VOICING, 0.6);
        out.push(("pad", "a chord pad, slow attack, octave voicing", r.play(5.8)));
    }
    // Item 10, after only (the old engine had no resonators): pluck, mallet and keys on the chord synth.
    for (name, what, model, bright, ev) in [
        ("pluck", "plucked strings: an arpeggio on the resonator voice", 1.0f32 / 3.0, 0.6f32, (0..16).map(|i| (i as f64 * 0.25, [57u32, 60, 64, 69, 72, 69, 64, 60][i % 8], 0.2, 0.85)).collect::<Vec<_>>()),
        ("mallet", "a marimba line on the two-resonator mallet voice", 2.0 / 3.0, 0.5, [(0.0, 69u32), (0.5, 72), (1.0, 76), (1.5, 72), (2.0, 74), (2.5, 77), (3.0, 81), (3.25, 79), (3.5, 76)].iter().map(|(b, n)| (*b as f64, *n, 0.2, 0.85)).collect()),
        ("keys", "chords on the struck-string keys voice", 1.0, 0.55, [(0.0, [57u32, 60, 64]), (2.0, [55, 59, 62])].iter().flat_map(|(b, ns)| ns.iter().map(move |n| (*b as f64, *n, 1.8, 0.75))).collect()),
    ] {
        let mut r = R::new(124.0);
        r.inst(0, Instrument::Chords);
        r.param(0, CHORD_VOICE, model);
        r.param(0, CHORD_BRIGHT, bright);
        r.param(0, INSTRUMENT_BASE + C_ATTACK, 0.0);
        r.param(0, INSTRUMENT_BASE + C_CUTOFF, 0.9);
        r.param(0, INSTRUMENT_BASE + C_SPREAD, 0.0);
        r.param(0, INSTRUMENT_BASE + C_RELEASE, 0.6);
        r.param(0, L_SEND, 0.2);
        r.pattern(0, &ev);
        out.push((name, what, r.play(3.87)));
    }
    // Item 12, after only: the wavetable and feedback fm on a lead (a slow lfo on the filter), and phase
    // distortion on a bass line, where the filter envelope bends the wave and the filter stays open.
    for (name, what, osc, wave) in [
        ("table", "a lead on the wavetable, the vowel frame", 1.0f32 / 3.0, 5.0f32 / 7.0),
        ("feedback", "a lead on feedback fm, between saw and grit", 2.0 / 3.0, 0.42),
        ("phase", "a bass line on phase distortion: the envelope bends the wave, no filter moves", 1.0, 0.9),
    ] {
        let mut r = R::new(124.0);
        r.inst(0, Instrument::Lead);
        r.param(0, LEAD_OSC, osc);
        r.param(0, INSTRUMENT_BASE + LD_WAVE, wave);
        r.param(0, INSTRUMENT_BASE + LD_DETUNE, 0.0);
        if name == "phase" {
            r.param(0, INSTRUMENT_BASE + LD_CUTOFF, 1.0);
            r.param(0, INSTRUMENT_BASE + LD_ENV, 0.0);
            r.param(0, INSTRUMENT_BASE + LD_FDECAY, 0.3);
            r.pattern(0, &[(0.0, 45, 0.2, 0.9), (0.5, 45, 0.2, 0.7), (1.0, 57, 0.2, 0.9), (1.5, 45, 0.2, 0.7), (2.0, 48, 0.2, 0.9), (2.5, 45, 0.2, 0.7), (3.0, 52, 0.2, 0.9), (3.5, 43, 0.2, 0.8)]);
        } else {
            r.param(0, INSTRUMENT_BASE + LD_LFO, 0.25);
            r.param(0, INSTRUMENT_BASE + LD_LFO_RATE, 0.35);
            r.param(0, L_ECHO, 0.25);
            r.pattern(0, &[(0.0, 69, 1.4, 0.9), (1.5, 72, 0.45, 0.85), (2.0, 74, 0.45, 0.85), (2.5, 76, 1.3, 0.9)]);
        }
        out.push((name, what, r.play(3.87)));
    }
    // Reverb on a clap, echo on a lead note, drive on the bass.
    {
        let mut r = R::new(124.0);
        r.inst(0, Instrument::Drums);
        r.pattern(0, &[(0.0, 39, 0.25, 0.95)]);
        r.param(0, L_SEND, 0.9);
        out.push(("reverb", "one clap into the reverb", r.play(3.5)));
    }
    // Item 9: the same clap into the plate (master param 5, "space"; the old engine has only the hall).
    {
        let mut r = R::new(124.0);
        r.inst(0, Instrument::Drums);
        r.pattern(0, &[(0.0, 39, 0.25, 0.95)]);
        r.param(0, L_SEND, 0.9);
        r.send(cmd::MASTER, 0, 5, 1.0, 0.0, 0.0);
        out.push(("plate", "one clap into the plate reverb", r.play(3.5)));
    }
    {
        let mut r = R::new(124.0);
        r.inst(0, Instrument::Lead);
        r.pattern(0, &[(0.0, 72, 0.3, 0.9)]);
        r.param(0, L_ECHO, 0.7);
        out.push(("echo", "one lead note into the echo", r.play(3.87)));
    }
    {
        let mut r = R::new(124.0);
        r.inst(0, Instrument::Bass);
        r.pattern(0, &[(0.0, 33, 0.9, 0.9), (1.0, 33, 0.9, 0.9), (2.0, 36, 0.9, 0.9), (3.0, 31, 0.9, 0.9)]);
        r.param(0, L_DRIVE, 0.75);
        out.push(("drive", "the bass with the drive up", r.play(3.87)));
    }
    // The sketch: everything together, through the glue and the limiter.
    {
        let mut r = R::new(124.0);
        sketch(&r);
        out.push(("sketch", "the whole song, four bars", r.play(7.74)));
    }
    // The same song with the glue pushed hard: where a bus compressor pumps, or holds the song together.
    {
        let mut r = R::new(124.0);
        sketch(&r);
        r.send(cmd::MASTER, 0, 1, 0.8, 0.0, 0.0);
        out.push(("glued", "the whole song with the glue pushed hard", r.play(7.74)));
    }
    out
}

/// The four-bar song every "whole song" clip plays.
fn sketch(r: &R) {
    r.inst(0, Instrument::Drums);
    r.inst(1, Instrument::Bass);
    r.inst(2, Instrument::Chords);
    r.inst(3, Instrument::Lead);
    let mut drums = four_floor();
    drums.extend([(1.0, 39, 0.25, 0.85), (3.0, 39, 0.25, 0.85)]);
    drums.extend((0..8).map(|i| (i as f64 * 0.5 + 0.5, 46, 0.2, 0.5)));
    drums.extend((0..16).map(|i| (i as f64 * 0.25, 42, 0.1, if i % 4 == 0 { 0.5 } else { 0.3 })));
    r.pattern(0, &drums);
    r.pattern(1, &[(0.5, 33, 0.25, 0.9), (1.5, 33, 0.25, 0.9), (1.75, 45, 0.2, 0.7), (2.5, 36, 0.25, 0.9), (3.5, 31, 0.25, 0.9), (3.75, 33, 0.2, 0.7)]);
    r.pattern(2, &[(0.5, 57, 0.2, 0.6), (0.5, 60, 0.2, 0.6), (0.5, 64, 0.2, 0.6), (2.5, 55, 0.2, 0.6), (2.5, 60, 0.2, 0.6), (2.5, 64, 0.2, 0.6)]);
    r.pattern(3, &[(2.0, 76, 0.45, 0.8), (2.5, 74, 0.45, 0.7), (3.0, 72, 0.9, 0.8)]);
    r.send(cmd::DUCK, 1, 0, 36.0, 0.0, 0.0);
    r.param(1, L_DUCK, 0.45);
    r.param(2, L_SEND, 0.35);
    r.param(2, L_LEVEL, 0.62);
    r.param(3, L_LEVEL, 0.6);
    r.param(3, L_ECHO, 0.3);
    r.param(0, L_SEND, 0.08);
}

fn main() {
    let dir = std::env::args().nth(1).unwrap_or_else(|| ".".into());
    std::fs::create_dir_all(&dir).unwrap();
    let mut index = String::from("[\n");
    for (name, what, (l, r)) in clips() {
        let peak = l.iter().chain(r.iter()).fold(0.0f32, |a, v| a.max(v.abs())).max(1e-6);
        let rms = (l.iter().chain(r.iter()).map(|v| v * v).sum::<f32>() / (2 * l.len()) as f32).sqrt().max(1e-6);
        let g = 0.031_6 / rms; // -30 dB RMS: low enough that the sparsest clip (two snare hits) never clips
        assert!(peak * g < 1.0, "{name} would clip at -30 dB RMS (peak {:.2})", peak * g);
        let data: Vec<i16> = l.iter().zip(r.iter()).flat_map(|(a, b)| [(a * g * 32767.0) as i16, (b * g * 32767.0) as i16]).collect();
        write_wav(&format!("{dir}/{name}.wav"), &data);
        index.push_str(&format!("  {{\"id\": \"{name}\", \"what\": \"{what}\", \"rms_db\": {:.2}, \"peak\": {peak:.4}}},\n", 20.0 * rms.log10()));
        println!("{name}: {:.2}s, peak {peak:.3}", l.len() as f32 / SR);
    }
    index.truncate(index.len() - 2);
    index.push_str("\n]\n");
    std::fs::write(format!("{dir}/index.json"), index).unwrap();
}

fn write_wav(path: &str, data: &[i16]) {
    let sr = SR as u32;
    let mut b = Vec::with_capacity(44 + data.len() * 2);
    let len = (data.len() * 2) as u32;
    b.extend_from_slice(b"RIFF");
    b.extend_from_slice(&(36 + len).to_le_bytes());
    b.extend_from_slice(b"WAVEfmt ");
    b.extend_from_slice(&16u32.to_le_bytes());
    b.extend_from_slice(&1u16.to_le_bytes());
    b.extend_from_slice(&2u16.to_le_bytes());
    b.extend_from_slice(&sr.to_le_bytes());
    b.extend_from_slice(&(sr * 4).to_le_bytes());
    b.extend_from_slice(&4u16.to_le_bytes());
    b.extend_from_slice(&16u16.to_le_bytes());
    b.extend_from_slice(b"data");
    b.extend_from_slice(&len.to_le_bytes());
    for s in data {
        b.extend_from_slice(&s.to_le_bytes());
    }
    std::fs::write(path, b).unwrap();
}
