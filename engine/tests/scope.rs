//! Scope and spectrum (touch and hear, item 4): the engine keeps the last SCOPE_LEN samples of one part
//! or of the master for the screens to draw. Run with `cargo test --release --test scope -- --nocapture`.

mod common;
use ccd_engine::engine::{cmd, Cmd, Engine, SCOPE_LEN, SCOPE_MASTER, SCOPE_OFF};
use ccd_engine::params::*;
use common::*;

fn send(e: &Engine, kind: u32, layer: u32, a: u32, x: f32, y: f64, z: f64) {
    assert!(e.send(Cmd { kind, layer, a, x, y, z }));
}

/// A lead holding a (220 Hz, near a sine) on layer 0 and a bass holding a low e on layer 1.
fn two_parts() -> Engine {
    let e = Engine::new(SR);
    send(&e, cmd::INSTRUMENT, 0, 4, 0.0, 0.0, 0.0);
    send(&e, cmd::INSTRUMENT, 1, 2, 0.0, 0.0, 0.0);
    // Near a sine, so a cycle crosses zero once: no detune, the filter just above the note.
    for (k, n) in [(LD_DETUNE, 0.0), (LD_CUTOFF, 0.2), (LD_RES, 0.0), (LD_ENV, 0.0)] {
        send(&e, cmd::PARAM, 0, (INSTRUMENT_BASE + k) as u32, n, 0.0, 0.0);
    }
    send(&e, cmd::NOTE_ON, 0, 57, 1.0, -1.0, 0.0);
    send(&e, cmd::NOTE_ON, 1, 28, 1.0, -1.0, 0.0);
    e
}

fn run(e: &Engine, frames: usize) -> (Vec<f32>, Vec<f32>) {
    let (mut l, mut r) = (Vec::new(), Vec::new());
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

fn scope(e: &Engine) -> Vec<f32> {
    let mut v = vec![0.0; SCOPE_LEN];
    let n = unsafe { e.core() }.read_scope(&mut v);
    v.truncate(n);
    v
}

/// Rising zero crossings per second.
fn pitch(x: &[f32]) -> f32 {
    let c = x.windows(2).filter(|w| w[0] < 0.0 && w[1] >= 0.0).count();
    c as f32 / (x.len() as f32 / SR)
}

#[test]
fn the_scope_shows_one_part_and_the_master_exactly() {
    let e = two_parts();
    send(&e, cmd::SCOPE, 0, 0, 0.0, 0.0, 0.0);
    run(&e, 24_000);
    let lead = scope(&e);
    send(&e, cmd::SCOPE, 0, 1, 0.0, 0.0, 0.0);
    run(&e, 4_096);
    let bass = scope(&e);
    send(&e, cmd::SCOPE, 0, SCOPE_MASTER, 0.0, 0.0, 0.0);
    let (l, r) = run(&e, 4_096);
    let master = scope(&e);
    println!("scope: {} samples; the lead's part crosses zero {:.0} times a second, the bass's {:.0}; the master's matches the output", lead.len(), pitch(&lead), pitch(&bass));
    assert_eq!(lead.len(), SCOPE_LEN);
    // The lead alone at 220 Hz (its saw crosses once a cycle), not the bass at 41 Hz under it.
    assert!((pitch(&lead) - 220.0).abs() < 30.0, "lead {}", pitch(&lead));
    assert!(pitch(&bass) < 120.0, "bass {}", pitch(&bass));
    let out: Vec<f32> = l.iter().zip(&r).map(|(a, b)| 0.5 * (a + b)).collect();
    assert!(master.iter().zip(&out[out.len() - SCOPE_LEN..]).all(|(a, b)| a.to_bits() == b.to_bits()));
}

#[test]
fn the_scope_off_changes_nothing() {
    let (a, b) = (two_parts(), two_parts());
    send(&b, cmd::SCOPE, 0, 0, 0.0, 0.0, 0.0);
    let (al, _) = run(&a, 12_000);
    let (bl, _) = run(&b, 12_000);
    assert!(al.iter().zip(&bl).all(|(x, y)| x.to_bits() == y.to_bits()));
    send(&b, cmd::SCOPE, 0, SCOPE_OFF, 0.0, 0.0, 0.0);
    run(&b, 128);
    assert!(scope(&b).iter().all(|v| *v == 0.0));
}
