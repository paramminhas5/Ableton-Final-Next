//! A/B (touch and hear, item 3): Live 12.3's device A/B, level-matched so the louder setting can't win.
//! The app measures each setting's loudness offline (ccd_lufs) and trims the louder one (cmd::TRIM).
//! Run with `cargo test --release --test ab -- --nocapture` to see the numbers.

mod common;
use ccd_engine::engine::{cmd, Cmd, Engine};
use ccd_engine::params::*;
use common::*;

fn send(e: &Engine, kind: u32, layer: u32, a: u32, x: f32, y: f64, z: f64) {
    assert!(e.send(Cmd { kind, layer, a, x, y, z }));
}

/// A bass line on layer 0, glue off; `drive` on the strip makes it louder.
fn bass(drive: f32) -> Engine {
    let e = Engine::new(SR);
    send(&e, cmd::INSTRUMENT, 0, 2, 0.0, 0.0, 0.0);
    send(&e, cmd::MASTER, 0, 1, 0.0, 0.0, 0.0);
    send(&e, cmd::PARAM, 0, L_DRIVE as u32, drive, 0.0, 0.0);
    send(&e, cmd::EV_CLEAR, 0, 0, 0.0, 0.0, 0.0);
    for s in 0..8 {
        send(&e, cmd::EV_ADD, 0, 33 + (s % 3) * 5, 0.9, s as f64 * 0.5, 0.4);
    }
    send(&e, cmd::EV_COMMIT, 0, 0, 0.0, 0.0, 0.0);
    send(&e, cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
    e
}

fn render(e: &Engine, frames: usize) -> (Vec<f32>, Vec<f32>) {
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

#[test]
fn level_matched_a_and_b_play_at_the_same_loudness() {
    // a: the bass as it is; b: with drive, louder. Measure both, trim b by the difference, measure again.
    let lufs = |e: &Engine| {
        let (l, r) = render(e, 48_000 * 2);
        ccd_engine::loudness::integrated_lufs(&l, &r, SR)
    };
    let a = lufs(&bass(0.0));
    let b = lufs(&bass(0.8));
    let e = bass(0.8);
    send(&e, cmd::TRIM, 0, 0, a - b, 0.0, 0.0);
    let matched = lufs(&e);
    println!("a/b: a {a:.2} LUFS, b {b:.2} LUFS ({:+.2} dB); b trimmed by {:.2} dB plays at {matched:.2} LUFS", b - a, a - b);
    assert!(b - a > 1.0, "drive should make it louder");
    assert!((matched - a).abs() < 0.3, "matched {matched} a {a}");
}

#[test]
fn trim_off_is_bit_identical() {
    // A trim to 0 dB never enters the path; one taken back to 0 dB leaves it once it has glided home.
    let (a, b) = (bass(0.3), bass(0.3));
    send(&b, cmd::TRIM, 0, 0, 0.0, 0.0, 0.0);
    let (al, ar) = render(&a, 48_000);
    let (bl, br) = render(&b, 48_000);
    assert!(al.iter().zip(&bl).chain(ar.iter().zip(&br)).all(|(x, y)| x.to_bits() == y.to_bits()));
    // -6 dB, then back: once home, the layer's own output is untouched (the strip sees the same samples).
    let e = bass(0.3);
    send(&e, cmd::TRIM, 0, 0, -6.0, 0.0, 0.0);
    let (l6, _) = render(&e, 24_000);
    let (l0, _) = render(&bass(0.3), 24_000);
    let drop = db(rms(&l6[4_800..])) - db(rms(&l0[4_800..]));
    println!("trim -6 dB: the part plays {drop:.2} dB lower");
    assert!((drop + 6.0).abs() < 0.3, "drop {drop}");
    send(&e, cmd::TRIM, 0, 0, 0.0, 0.0, 0.0);
    render(&e, 48_000);
    let on = unsafe { e.core().layers[0].strip_trimmed() };
    println!("trim back to 0 dB: in the path {on}");
    assert!(!on);
}
