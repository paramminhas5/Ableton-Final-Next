//! The lesson listening clips, rendered through the same engine the apps use, so they are
//! ours outright and sound like the instrument. Replaces the AI clips (3 Nov 2026).
//! Usage: cargo run --release --bin teach_clips -- <out dir>
//! Writes dry-clap.wav, hall-clap.wav and house-sketch.wav (48 kHz, stereo, 16 bit).

use ccd_engine::engine::{cmd, Cmd, Engine};
use ccd_engine::params::*;

const SR: f32 = 48_000.0;

struct R {
    e: Engine,
    out: Vec<i16>,
}

impl R {
    fn new() -> Self {
        R { e: Engine::new(SR), out: Vec::new() }
    }
    fn send(&self, kind: u32, layer: u32, a: u32, x: f32, y: f64, z: f64) {
        self.e.send(Cmd { kind, layer, a, x, y, z });
    }
    fn pattern(&self, layer: u32, ev: &[(f64, u32, f64, f32)]) {
        self.send(cmd::EV_CLEAR, layer, 0, 0.0, 0.0, 0.0);
        for &(start, note, len, vel) in ev {
            self.send(cmd::EV_ADD, layer, note, vel, start, len);
        }
        self.send(cmd::EV_COMMIT, layer, 0, 0.0, 0.0, 0.0);
    }
    /// Run the engine for `seconds`, keeping the audio.
    fn run(&mut self, seconds: f64) {
        let total = (SR as f64 * seconds) as usize;
        let mut done = 0;
        while done < total {
            let n = 256.min(total - done);
            unsafe { self.e.process(n) };
            let c = unsafe { self.e.core() };
            for i in 0..n {
                self.out.push((c.out_l[i].clamp(-1.0, 1.0) * 32767.0) as i16);
                self.out.push((c.out_r[i].clamp(-1.0, 1.0) * 32767.0) as i16);
            }
            done += n;
        }
    }
}

fn clap(send: f32, seconds: f64) -> Vec<i16> {
    let mut r = R::new();
    r.send(cmd::INSTRUMENT, 0, 1, 0.0, 0.0, 0.0);
    r.send(cmd::TEMPO, 0, 0, 0.0, 120.0, 0.0);
    r.send(cmd::LOOP, 0, 0, 0.0, 16.0, 0.0);
    r.pattern(0, &[(0.0, 39, 0.25, 0.95)]);
    r.send(cmd::PARAM, 0, L_SEND as u32, send, 0.0, 0.0);
    r.send(cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
    r.run(seconds);
    r.out
}

/// 124 bpm house: four on the floor, claps, hats, a rolling a minor bass and chord stabs.
/// Bar 7 drops the kick and bass (everything under about 120 Hz) for one bar; bar 8 brings
/// them back with a crash. Returns the audio and the bar the low end is out.
fn house(seconds: f64) -> Vec<i16> {
    let mut r = R::new();
    r.send(cmd::INSTRUMENT, 0, 1, 0.0, 0.0, 0.0); // drums
    r.send(cmd::INSTRUMENT, 1, 2, 0.0, 0.0, 0.0); // bass
    r.send(cmd::INSTRUMENT, 2, 3, 0.0, 0.0, 0.0); // chords
    r.send(cmd::TEMPO, 0, 0, 0.0, 124.0, 0.0);
    r.send(cmd::LOOP, 0, 0, 0.0, 4.0, 0.0);
    let mut drums: Vec<(f64, u32, f64, f32)> = Vec::new();
    for b in 0..4 {
        drums.push((b as f64, 36, 0.25, 1.0));
        drums.push((b as f64 + 0.5, 46, 0.2, 0.55));
        drums.push((b as f64 + 0.25, 42, 0.1, 0.35));
        drums.push((b as f64 + 0.75, 42, 0.1, 0.4));
    }
    drums.push((1.0, 39, 0.25, 0.85));
    drums.push((3.0, 39, 0.25, 0.85));
    let no_kick: Vec<_> = drums.iter().copied().filter(|e| e.1 != 36).collect();
    let mut crash = drums.clone();
    crash.push((0.0, 49, 1.0, 0.7));
    let bass: Vec<(f64, u32, f64, f32)> = vec![
        (0.5, 33, 0.25, 0.9), (1.5, 33, 0.25, 0.9), (1.75, 45, 0.2, 0.7), (2.5, 36, 0.25, 0.9), (3.5, 31, 0.25, 0.9), (3.75, 33, 0.2, 0.7),
    ];
    let chords: Vec<(f64, u32, f64, f32)> = vec![(0.5, 57, 0.2, 0.6), (0.5, 60, 0.2, 0.6), (0.5, 64, 0.2, 0.6), (2.5, 55, 0.2, 0.6), (2.5, 60, 0.2, 0.6), (2.5, 64, 0.2, 0.6)];
    r.pattern(0, &drums);
    r.pattern(1, &bass);
    r.pattern(2, &chords);
    r.send(cmd::DUCK, 1, 0, 36.0, 0.0, 0.0);
    r.send(cmd::PARAM, 1, L_DUCK as u32, 0.45, 0.0, 0.0);
    r.send(cmd::PARAM, 2, L_SEND as u32, 0.35, 0.0, 0.0);
    r.send(cmd::PARAM, 2, L_LEVEL as u32, 0.62, 0.0, 0.0);
    r.send(cmd::PARAM, 0, L_SEND as u32, 0.08, 0.0, 0.0);
    r.send(cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
    let bar = 4.0 * 60.0 / 124.0;
    // Swap patterns just before a downbeat: after the last sixteenth of the bar, before beat 1.
    let before = |b: f64| b * bar - 0.03;
    r.run(before(6.0));
    r.pattern(0, &no_kick);
    r.pattern(1, &[]);
    r.run(before(7.0) - before(6.0));
    r.pattern(0, &crash);
    r.pattern(1, &bass);
    r.run(before(8.0) - before(7.0));
    r.pattern(0, &drums);
    r.run(seconds - before(8.0));
    r.out
}

fn main() {
    let dir = std::env::args().nth(1).unwrap_or_else(|| ".".into());
    std::fs::create_dir_all(&dir).unwrap();
    write_wav(&format!("{dir}/dry-clap.wav"), &clap(0.0, 1.2));
    write_wav(&format!("{dir}/hall-clap.wav"), &clap(1.0, 3.4));
    write_wav(&format!("{dir}/house-sketch.wav"), &house(18.0));
    eprintln!("wrote three clips to {dir}");
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
