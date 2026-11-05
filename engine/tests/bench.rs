//! CPU bench for the engine 2 items: a full eight-layer song (two of each synth, drums with every pad,
//! drive, echo and reverb sends up, analysis on), rendered in 128-frame blocks. The machine this runs
//! on is shared, so each figure is the best of five runs. Run with:
//! `cargo test --release --test bench -- --ignored --nocapture`

use ccd_engine::engine::{cmd, Cmd, Engine};
use ccd_engine::params::*;

const SR: f32 = 48_000.0;
const BLOCK: usize = 128;

fn send(e: &Engine, kind: u32, layer: u32, a: u32, x: f32, y: f64, z: f64) {
    assert!(e.send(Cmd { kind, layer, a, x, y, z }));
}

fn song() -> Engine {
    let e = Engine::new(SR);
    // drums, bass, chords, lead, twice over
    let insts = [1u32, 2, 3, 4, 1, 2, 3, 4];
    for (l, inst) in insts.iter().enumerate() {
        let l = l as u32;
        send(&e, cmd::INSTRUMENT, l, *inst, 0.0, 0.0, 0.0);
        send(&e, cmd::PARAM, l, L_DRIVE as u32, 0.6, 0.0, 0.0);
        send(&e, cmd::PARAM, l, L_SEND as u32, 0.5, 0.0, 0.0);
        send(&e, cmd::PARAM, l, L_ECHO as u32, 0.5, 0.0, 0.0);
        send(&e, cmd::EV_CLEAR, l, 0, 0.0, 0.0, 0.0);
        for s in 0..16 {
            let start = s as f64 * 0.25;
            match inst {
                1 => send(&e, cmd::EV_ADD, l, DRUM_PAD_NOTES[s % 16] as u32, 1.0, start, 0.2),
                2 => send(&e, cmd::EV_ADD, l, 30 + (s as u32 * 3) % 24, 1.0, start, 0.2),
                3 => {
                    if s % 4 == 0 {
                        for n in [57, 60, 64, 67, 71, 74] {
                            send(&e, cmd::EV_ADD, l, n + (s as u32 % 8), 0.8, start, 0.9);
                        }
                    }
                }
                _ => send(&e, cmd::EV_ADD, l, 64 + (s as u32 * 5) % 19, 0.9, start, 0.2),
            }
        }
        send(&e, cmd::EV_COMMIT, l, 0, 0.0, 0.0, 0.0);
    }
    // the lead and chords with their supersaw and some resonance
    for l in [2u32, 3, 6, 7] {
        send(&e, cmd::PARAM, l, (INSTRUMENT_BASE + 1) as u32, 0.6, 0.0, 0.0);
    }
    send(&e, cmd::ANALYSE, 0, 1, 0.0, 0.0, 0.0);
    send(&e, cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
    e
}

#[test]
#[ignore]
fn bench_full_song() {
    let secs = 4.0;
    let blocks = (SR * secs) as usize / BLOCK;
    let budget_us = BLOCK as f64 / SR as f64 * 1e6;
    let (mut best_total, mut best_p999, mut best_max) = (f64::MAX, f64::MAX, f64::MAX);
    for _ in 0..5 {
        let e = song();
        // warm up one second
        for _ in 0..(SR as usize / BLOCK) {
            unsafe { e.process(BLOCK) };
        }
        while e.poll().is_some() {}
        let mut t = Vec::with_capacity(blocks);
        let start = std::time::Instant::now();
        for _ in 0..blocks {
            let b = std::time::Instant::now();
            unsafe { e.process(BLOCK) };
            t.push(b.elapsed().as_secs_f64() * 1e6);
            while e.poll().is_some() {}
        }
        let total = start.elapsed().as_secs_f64();
        t.sort_by(|a, b| a.partial_cmp(b).unwrap());
        best_total = best_total.min(total);
        best_p999 = best_p999.min(t[(t.len() as f64 * 0.999) as usize]);
        best_max = best_max.min(*t.last().unwrap());
    }
    println!(
        "full song, 8 layers, analysing: {:.1}% of one core (native, best of 5); 128-frame block ({budget_us:.0} us budget): 99.9th percentile {best_p999:.0} us, worst {best_max:.0} us",
        best_total / secs as f64 * 100.0
    );
}
