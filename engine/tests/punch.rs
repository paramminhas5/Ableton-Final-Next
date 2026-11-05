//! Punch-in effects, measured: nothing held is bit-identical to an engine that was never touched; tape
//! stop drops the pitch to zero in the time it was set to; beat repeat loops a slice exactly; the filter
//! sweep cuts what it should; a reverb throw leaves a tail and leaves the dry mix alone.

use ccd_engine::engine::{cmd, Cmd, Engine};
use ccd_engine::punch::{self, filter_at, repeat_beats, tape_seconds, Punch};

mod common;
use common::{db, rms, sine};

const SR: f32 = 48_000.0;

fn send(e: &Engine, kind: u32, layer: u32, a: u32, x: f32, y: f64, z: f64) {
    assert!(e.send(Cmd { kind, layer, a, x, y, z }));
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

/// A playing song: drums on every 8th and a held lead note, at 120 bpm.
fn song() -> Engine {
    let e = Engine::new(SR);
    send(&e, cmd::INSTRUMENT, 0, 1, 0.0, 0.0, 0.0);
    send(&e, cmd::EV_CLEAR, 0, 0, 0.0, 0.0, 0.0);
    for k in 0..8 {
        send(&e, cmd::EV_ADD, 0, if k % 2 == 0 { 36 } else { 42 }, 0.9, k as f64 * 0.5, 0.1);
    }
    send(&e, cmd::EV_COMMIT, 0, 0, 0.0, 0.0, 0.0);
    send(&e, cmd::INSTRUMENT, 1, 4, 0.0, 0.0, 0.0);
    send(&e, cmd::EV_CLEAR, 1, 0, 0.0, 0.0, 0.0);
    send(&e, cmd::EV_ADD, 1, 69, 0.8, 0.0, 3.9);
    send(&e, cmd::EV_COMMIT, 1, 0, 0.0, 0.0, 0.0);
    send(&e, cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
    e
}

#[test]
fn nothing_held_is_bit_identical() {
    let a = song();
    let b = song();
    // b gets a let-go with nothing pressed, and a press of nothing: still dry.
    send(&b, cmd::PUNCH, 0, punch::OFF as u32, 0.7, 0.0, 0.0);
    let (al, ar) = render(&a, 48_000 * 3);
    let (bl, br) = render(&b, 48_000 * 3);
    assert!(al.iter().zip(&bl).all(|(x, y)| x.to_bits() == y.to_bits()));
    assert!(ar.iter().zip(&br).all(|(x, y)| x.to_bits() == y.to_bits()));
    assert!(rms(&al) > 1e-3, "the song plays");
}

/// Zero-crossing frequency of a window.
fn zc_hz(x: &[f32]) -> f32 {
    let n = x.windows(2).filter(|w| (w[0] <= 0.0) != (w[1] <= 0.0)).count();
    n as f32 / 2.0 / (x.len() as f32 / SR)
}

#[test]
fn tape_stop_drops_the_pitch_to_zero_in_the_set_time() {
    let amount = 0.2;
    let t = tape_seconds(amount); // 0.52 s
    let mut p = Punch::new(SR);
    let x = sine(1000.0, 48_000 * 2, 0.5);
    let mut y = vec![];
    for (i, v) in x.iter().enumerate() {
        if i == 24_000 {
            p.set(punch::TAPE_STOP, amount, 2.0);
        }
        y.push(p.tick(*v, *v).0);
    }
    let at = |s: f32| 24_000 + (s * SR) as usize;
    let win = 1_200; // 25 ms
    let f0 = zc_hz(&y[at(-0.1)..at(-0.1) + win]);
    let f_half = zc_hz(&y[at(t / 2.0) - win / 2..at(t / 2.0) + win / 2]);
    let f_late = zc_hz(&y[at(t * 0.9) - win / 2..at(t * 0.9) + win / 2]);
    let tail = rms(&y[at(t + 0.01)..at(t + 0.3)]);
    println!("tape stop {t:.2} s: {f0:.0} Hz before, {f_half:.0} Hz halfway, {f_late:.0} Hz at 90%, {:.1} dB after", db(tail));
    assert!((f0 - 1000.0).abs() < 30.0);
    assert!((f_half - 500.0).abs() < 40.0, "halfway {f_half}");
    assert!(f_late < 160.0, "at 90% {f_late}");
    assert!(tail == 0.0, "stopped: silent");
}

#[test]
fn tape_stop_in_the_engine_falls_silent_after_the_set_time() {
    let e = song();
    render(&e, 48_000);
    send(&e, cmd::PUNCH, 0, punch::TAPE_STOP as u32, 0.0, 0.0, 0.0); // 0.15 s
    let (l, _) = render(&e, 48_000);
    let before = rms(&l[..4_800]);
    let after = rms(&l[(0.2 * SR) as usize..]);
    println!("engine tape stop: {:.1} dB playing, {:.1} dB after 0.15 s", db(before), db(after));
    assert!(db(after) < -90.0, "after {}", db(after));
    // Let go: the song is back.
    send(&e, cmd::PUNCH, 0, punch::OFF as u32, 0.0, 0.0, 0.0);
    let (l2, _) = render(&e, 48_000);
    assert!(rms(&l2[2_000..]) > 1e-3);
}

#[test]
fn beat_repeat_loops_a_slice_exactly() {
    let amount = 0.6; // a 16th note
    let beats = repeat_beats(amount);
    assert_eq!(beats, 0.25);
    let len = (beats / 2.0 * SR as f64) as usize; // 120 bpm: 6000 samples
    let mut p = Punch::new(SR);
    let x = sine(173.0, 48_000, 0.5);
    let mut y = vec![];
    for (i, v) in x.iter().enumerate() {
        if i == 12_000 {
            p.set(punch::REPEAT, amount, 2.0);
        }
        y.push(p.tick(*v, *v).0);
    }
    // After the fade in, every sample equals the one a slice later.
    let from = 12_000 + 1_000;
    let worst = (from..from + 3 * len).map(|i| (y[i] - y[i + len]).abs()).fold(0.0f32, f32::max);
    println!("beat repeat: period {len} samples, worst difference {worst:e}");
    assert!(worst < 1e-6);
    // And it is the slice that played just before the press.
    assert!((y[from + len * 2 + 100] - x[12_000 - len + (from + 100 - 12_000) % len]).abs() < 1e-6);
}

#[test]
fn the_filter_sweep_cuts_what_it_should() {
    let (lp, hp) = (filter_at(0.1), filter_at(0.9));
    assert!(!lp.1 && hp.1);
    let through = |amount: f32, hz: f64| {
        let mut p = Punch::new(SR);
        p.set(punch::FILTER, amount, 2.0);
        let y: Vec<f32> = sine(hz, 48_000, 0.5).iter().map(|v| p.tick(*v, *v).0).collect();
        db(rms(&y[24_000..])) - db(0.5 / 2f32.sqrt())
    };
    let (lo_keep, lo_cut) = (through(0.1, 80.0), through(0.1, 5_000.0));
    let (hi_cut, hi_keep) = (through(0.9, 100.0), through(0.9, 8_000.0));
    println!("filter sweep: low pass at {:.0} Hz keeps 80 Hz {lo_keep:.1} dB, cuts 5 kHz {lo_cut:.1} dB; high pass at {:.0} Hz cuts 100 Hz {hi_cut:.1} dB, keeps 8 kHz {hi_keep:.1} dB", lp.0, hp.0);
    assert!(lo_keep > -3.0 && lo_cut < -40.0);
    assert!(hi_cut < -30.0 && hi_keep > -3.0);
    assert!((through(0.5, 1_000.0)).abs() < 0.5, "the middle is open");
}

#[test]
fn a_reverb_throw_leaves_a_tail_and_the_dry_mix_alone() {
    // A single hit, then silence: with the throw held over the hit, the reverb rings on after the dry hit.
    let tail = |throw: bool| {
        let e = Engine::new(SR);
        send(&e, cmd::INSTRUMENT, 0, 1, 0.0, 0.0, 0.0);
        render(&e, 4_800);
        if throw {
            send(&e, cmd::PUNCH, 0, punch::THROW as u32, 1.0, 0.0, 0.0);
        }
        send(&e, cmd::NOTE_ON, 0, 38, 1.0, -1.0, 0.0);
        render(&e, 4_800);
        send(&e, cmd::PUNCH, 0, punch::OFF as u32, 0.0, 0.0, 0.0);
        let (l, _) = render(&e, 48_000);
        rms(&l[24_000..])
    };
    let (dry, thrown) = (tail(false), tail(true));
    println!("reverb throw: tail 0.6 to 1.1 s after the hit {:.1} dB without, {:.1} dB with", db(dry), db(thrown));
    assert!(db(thrown) > db(dry) + 12.0);
    // The dry path itself is never changed by a throw.
    let mut p = Punch::new(SR);
    p.set(punch::THROW, 1.0, 2.0);
    for v in sine(440.0, 4_800, 0.5) {
        assert_eq!(p.tick(v, v).0.to_bits(), v.to_bits());
    }
}
