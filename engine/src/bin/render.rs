//! Offline render to a WAV, through the exact same engine the apps use.
//! Usage: cargo run --release --bin render -- out.wav
//! Plays a one-bar drum and bass loop twice, for listening and A/B checks.

use ccd_engine::engine::{cmd, Cmd, Engine};
use ccd_engine::params::*;

fn main() {
    let path = std::env::args().nth(1).unwrap_or_else(|| "render.wav".into());
    let sr = 48_000.0;
    let e = Engine::new(sr);
    let send = |kind, layer, a, x: f32, y: f64, z: f64| {
        e.send(Cmd { kind, layer, a, x, y, z });
    };
    send(cmd::INSTRUMENT, 0, 1, 0.0, 0.0, 0.0);
    send(cmd::INSTRUMENT, 1, 2, 0.0, 0.0, 0.0);
    send(cmd::TEMPO, 0, 0, 0.0, 122.0, 0.0);
    // drums
    send(cmd::EV_CLEAR, 0, 0, 0.0, 0.0, 0.0);
    for b in 0..4 {
        send(cmd::EV_ADD, 0, 36, 1.0, b as f64, 0.25);
        send(cmd::EV_ADD, 0, 42, 0.7, b as f64 + 0.5, 0.1);
    }
    send(cmd::EV_ADD, 0, 39, 0.9, 1.0, 0.25);
    send(cmd::EV_ADD, 0, 39, 0.9, 3.0, 0.25);
    send(cmd::EV_COMMIT, 0, 0, 0.0, 0.0, 0.0);
    // bass: a minor riff with a slide
    send(cmd::EV_CLEAR, 1, 0, 0.0, 0.0, 0.0);
    let line = [(0.25, 33, 0.25), (0.75, 33, 0.25), (1.25, 45, 0.3), (1.5, 43, 0.25), (2.25, 36, 0.25), (2.75, 33, 0.5), (3.25, 40, 0.25), (3.5, 38, 0.25)];
    for (s, n, l) in line {
        send(cmd::EV_ADD, 1, n, 0.9, s, l);
    }
    send(cmd::EV_COMMIT, 1, 0, 0.0, 0.0, 0.0);
    send(cmd::DUCK, 1, 0, 36.0, 0.0, 0.0);
    send(cmd::PARAM, 1, L_DUCK as u32, 0.55, 0.0, 0.0);
    send(cmd::PARAM, 1, L_SEND as u32, 0.1, 0.0, 0.0);
    send(cmd::PARAM, 0, L_SEND as u32, 0.12, 0.0, 0.0);
    send(cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);

    let seconds = 8.0;
    let total = (sr * seconds) as usize;
    let mut data: Vec<i16> = Vec::with_capacity(total * 2);
    let mut done = 0;
    let t0 = std::time::Instant::now();
    while done < total {
        let n = 256.min(total - done);
        unsafe { e.process(n) };
        let c = unsafe { e.core() };
        for i in 0..n {
            data.push((c.out_l[i].clamp(-1.0, 1.0) * 32767.0) as i16);
            data.push((c.out_r[i].clamp(-1.0, 1.0) * 32767.0) as i16);
        }
        done += n;
    }
    let took = t0.elapsed().as_secs_f64();
    eprintln!("rendered {seconds}s in {:.3}s ({:.1}% of real time)", took, took / seconds as f64 * 100.0);
    write_wav(&path, sr as u32, &data);
    eprintln!("wrote {path}");
}

fn write_wav(path: &str, sr: u32, data: &[i16]) {
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
