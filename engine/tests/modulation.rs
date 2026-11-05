//! Modulation (touch and hear, item 2): an lfo or a filter envelope routed onto any knob of a layer.
//! Each test measures that a routed knob moves the sound by the amount asked, that the knob still turns
//! under it, and that a layer with nothing routed renders exactly as before.
//! Run with `cargo test --release --test modulation -- --nocapture` to see the numbers.

mod common;
use ccd_engine::engine::{cmd, Cmd, Engine, MOD_ENV, MOD_LFO};
use ccd_engine::params::*;
use common::*;

fn send(e: &Engine, kind: u32, layer: u32, a: u32, x: f32, y: f64, z: f64) {
    assert!(e.send(Cmd { kind, layer, a, x, y, z }));
}

/// A lead on layer 0 holding one note, no detune (the saws would beat), lfo at `rate` Hz. Glue off, so
/// the master passes the balance through untouched.
fn lead(rate_n: f32) -> Engine {
    let e = Engine::new(SR);
    send(&e, cmd::INSTRUMENT, 0, 4, 0.0, 0.0, 0.0);
    send(&e, cmd::MASTER, 0, 1, 0.0, 0.0, 0.0);
    send(&e, cmd::PARAM, 0, (INSTRUMENT_BASE + LD_DETUNE) as u32, 0.0, 0.0, 0.0);
    send(&e, cmd::PARAM, 0, (INSTRUMENT_BASE + LD_LFO_RATE) as u32, rate_n, 0.0, 0.0);
    e
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

/// Left over right in dB, in 10 ms windows.
fn balance(l: &[f32], r: &[f32]) -> Vec<f32> {
    l.chunks(480).zip(r.chunks(480)).map(|(a, b)| db(rms(a)) - db(rms(b))).collect()
}

/// The balance of the lead held with the pan knob at `n`, once it has settled.
fn static_balance(n: f32) -> f32 {
    let e = lead(0.5);
    send(&e, cmd::PARAM, 0, L_PAN as u32, n, 0.0, 0.0);
    send(&e, cmd::NOTE_ON, 0, 57, 1.0, -1.0, 0.0);
    let (l, r) = render(&e, 24_000);
    let b = balance(&l[12_000..], &r[12_000..]);
    b.iter().sum::<f32>() / b.len() as f32
}

#[test]
fn lfo_on_pan_swings_by_the_amount_asked() {
    // lfo at 1 Hz (normalised 0.5 on 0.1..10 Hz exp), routed onto pan by a quarter of its travel.
    let e = lead(0.5);
    send(&e, cmd::MOD, 0, 0, 0.25, L_PAN as f64, MOD_LFO as f64);
    send(&e, cmd::NOTE_ON, 0, 57, 1.0, -1.0, 0.0);
    let (l, r) = render(&e, 48_000 * 3);
    let b = balance(&l[24_000..], &r[24_000..]);
    let (lo, hi) = b.iter().fold((f32::MAX, f32::MIN), |(a, c), v| (a.min(*v), c.max(*v)));
    // The swing should reach the pan knob at 0.25 and at 0.75.
    let (left, right) = (static_balance(0.25), static_balance(0.75));
    println!("lfo on pan by 0.25: swings {lo:.2} to {hi:.2} dB left over right; the knob set at 0.75 / 0.25 reads {right:.2} / {left:.2} dB");
    assert!((hi - left).abs() < 0.4, "hi {hi} left {left}");
    assert!((lo - right).abs() < 0.4, "lo {lo} right {right}");
    assert!(hi - lo > 6.0);
}

#[test]
fn the_knob_still_turns_under_its_modulation() {
    // Live 12: modulation no longer takes over the parameter. Turn the base to 0.3: the swing follows.
    let e = lead(0.5);
    send(&e, cmd::MOD, 0, 0, 0.2, L_PAN as f64, MOD_LFO as f64);
    send(&e, cmd::PARAM, 0, L_PAN as u32, 0.3, 0.0, 0.0);
    send(&e, cmd::NOTE_ON, 0, 57, 1.0, -1.0, 0.0);
    let (l, r) = render(&e, 48_000 * 3);
    let b = balance(&l[24_000..], &r[24_000..]);
    let (lo, hi) = b.iter().fold((f32::MAX, f32::MIN), |(a, c), v| (a.min(*v), c.max(*v)));
    let (left, right) = (static_balance(0.1), static_balance(0.5));
    println!("base turned to 0.3 under a 0.2 lfo: swings {lo:.2} to {hi:.2} dB; the knob at 0.5 / 0.1 reads {right:.2} / {left:.2} dB");
    assert!((hi - left).abs() < 0.4 && (lo - right).abs() < 0.4);
}

#[test]
fn the_filter_envelope_moves_pan_to_its_sustain() {
    // The lead's filter envelope sustains at 0.4: routed by 0.4 onto pan from the centre, the held note
    // settles at 0.5 + 0.16 = 0.66.
    let e = lead(0.5);
    send(&e, cmd::MOD, 0, 3, 0.4, L_PAN as f64, MOD_ENV as f64);
    send(&e, cmd::NOTE_ON, 0, 57, 1.0, -1.0, 0.0);
    let (l, r) = render(&e, 48_000 * 2);
    let b = balance(&l[48_000..], &r[48_000..]);
    let held = b.iter().sum::<f32>() / b.len() as f32;
    let want = static_balance(0.66);
    println!("filter envelope on pan by 0.4: held note at {held:.2} dB, the knob at 0.66 reads {want:.2} dB");
    assert!((held - want).abs() < 0.3, "held {held} want {want}");
    // and it goes back when the route is cleared
    send(&e, cmd::MOD, 0, 3, 0.0, 0.0, 0.0);
    let (l, r) = render(&e, 24_000);
    let b = balance(&l[12_000..], &r[12_000..]);
    let back = b.iter().sum::<f32>() / b.len() as f32;
    println!("route cleared: {back:.2} dB (centre {:.2})", static_balance(0.5));
    assert!((back - static_balance(0.5)).abs() < 0.1);
}

#[test]
fn lfo_on_an_instrument_knob_moves_it_as_far_as_the_knob_would() {
    // lfo onto the lead's wave (saw to pulse), by 0.5 from the middle: the sound at the lfo's ends should
    // match the knob turned to 0 and to 1. Measured as the second harmonic against the first: a saw has
    // it at -6 dB, a square has almost none.
    let h2 = |y: &[f32]| {
        let s = spectrum(&y[..8192]);
        let bin = |hz: f32| (hz / SR * 8192.0).round() as usize;
        let f = 220.0;
        let pk = |b: usize| s[b - 2..=b + 2].iter().fold(0.0f32, |a, v| a.max(*v));
        db(pk(bin(2.0 * f))) - db(pk(bin(f)))
    };
    let fixed = |n: f32| {
        let e = lead(0.5);
        send(&e, cmd::PARAM, 0, (INSTRUMENT_BASE + LD_CUTOFF) as u32, 1.0, 0.0, 0.0);
        send(&e, cmd::PARAM, 0, (INSTRUMENT_BASE + LD_WAVE) as u32, n, 0.0, 0.0);
        send(&e, cmd::NOTE_ON, 0, 57, 1.0, -1.0, 0.0);
        let (l, _) = render(&e, 36_000);
        h2(&l[24_000..])
    };
    let (saw, sq) = (fixed(0.0), fixed(1.0));
    // A slow lfo (0.1 Hz: normalised 0) starting at its zero crossing; a quarter cycle is 2.5 s in.
    let e = lead(0.0);
    send(&e, cmd::PARAM, 0, (INSTRUMENT_BASE + LD_CUTOFF) as u32, 1.0, 0.0, 0.0);
    send(&e, cmd::PARAM, 0, (INSTRUMENT_BASE + LD_WAVE) as u32, 0.5, 0.0, 0.0);
    send(&e, cmd::MOD, 0, 1, 0.5, (INSTRUMENT_BASE + LD_WAVE) as f64, MOD_LFO as f64);
    send(&e, cmd::NOTE_ON, 0, 57, 1.0, -1.0, 0.0);
    let (l, _) = render(&e, 48_000 * 8);
    let peak = (2.5 * SR) as usize; // lfo at +1: wave 1.0
    let trough = (7.5 * SR) as usize; // lfo at -1: wave 0.0
    let (at_peak, at_trough) = (h2(&l[peak - 4096..]), h2(&l[trough - 4096..]));
    println!("lfo on wave by 0.5: second harmonic {at_trough:.1} / {at_peak:.1} dB at the lfo's ends; the knob at 0 / 1 gives {saw:.1} / {sq:.1} dB");
    assert!((at_trough - saw).abs() < 1.5, "trough {at_trough} saw {saw}");
    assert!((at_peak - sq).abs() < 3.0, "peak {at_peak} square {sq}");
}

#[test]
fn nothing_routed_is_bit_identical() {
    // A song with every instrument, rendered twice: once never touched by modulation, once with routes
    // set and cleared before it plays (the knob goes back exactly where it was).
    let song = |route: bool| {
        let e = Engine::new(SR);
        for (l, inst) in [1u32, 2, 3, 4, 5, 6].iter().enumerate() {
            let l = l as u32;
            send(&e, cmd::INSTRUMENT, l, *inst, 0.0, 0.0, 0.0);
            send(&e, cmd::PARAM, l, L_SEND as u32, 0.3, 0.0, 0.0);
            send(&e, cmd::EV_CLEAR, l, 0, 0.0, 0.0, 0.0);
            for s in 0..16 {
                send(&e, cmd::EV_ADD, l, 40 + (s as u32 * 5) % 24, 0.9, s as f64 * 0.25, 0.3);
            }
            send(&e, cmd::EV_COMMIT, l, 0, 0.0, 0.0, 0.0);
        }
        if route {
            send(&e, cmd::MOD, 3, 0, 0.7, (INSTRUMENT_BASE + LD_CUTOFF) as f64, MOD_LFO as f64);
            send(&e, cmd::MOD, 3, 0, 0.0, 0.0, 0.0);
            send(&e, cmd::MOD, 2, 2, 0.5, L_PAN as f64, MOD_ENV as f64);
            send(&e, cmd::MOD, 2, 2, 0.0, 0.0, 0.0);
        }
        send(&e, cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
        e
    };
    let (a, b) = (song(false), song(true));
    let (al, ar) = render(&a, 48_000 * 2);
    let (bl, br) = render(&b, 48_000 * 2);
    let same = al.iter().zip(&bl).chain(ar.iter().zip(&br)).all(|(x, y)| x.to_bits() == y.to_bits());
    println!("nothing routed: {} of {} samples bit-identical", if same { al.len() * 2 } else { 0 }, al.len() * 2);
    assert!(same);
}
