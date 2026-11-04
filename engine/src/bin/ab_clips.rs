//! "Hear the difference" clips: the same phrases rendered through the engine, so one engine version
//! can be a/b'd against another. Run it before and after an engine change, into two folders, and the
//! app's /engine/ab page plays them side by side.
//! Usage: cargo run --release --bin ab_clips -- <out dir>
//! Each clip is 48 kHz, stereo, 16 bit, normalised to the same loudness (-30 dB RMS) so level never
//! decides the a/b: a louder clip always sounds "better", which would make the comparison dishonest.

use ccd_engine::engine::{cmd, Cmd, Engine};
use ccd_engine::params::*;

const SR: f32 = 48_000.0;

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
    // Reverb on a clap, echo on a lead note, drive on the bass.
    {
        let mut r = R::new(124.0);
        r.inst(0, Instrument::Drums);
        r.pattern(0, &[(0.0, 39, 0.25, 0.95)]);
        r.param(0, L_SEND, 0.9);
        out.push(("reverb", "one clap into the reverb", r.play(3.5)));
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
        out.push(("sketch", "the whole song, four bars", r.play(7.74)));
    }
    out
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
