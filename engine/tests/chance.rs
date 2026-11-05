//! Chance (Live 12) and trig conditions (Elektron), measured through the public engine: a step with
//! 1:2 plays on every other pass of the loop, 1:4 on every fourth, a fill step only while the fill key is
//! held, and a 50% chance plays exactly the passes `seq::plays` says, the same way for the same seed.
//! A pattern with none of them plays exactly as before.

use ccd_engine::engine::{cmd, out, Cmd, Engine, OutEv};
use ccd_engine::seq::{cond, plays, NoteEv};

const SR: f32 = 48_000.0;
/// One 4-beat loop at 120 bpm is two seconds.
const LOOP: usize = 96_000;

fn send(e: &Engine, kind: u32, layer: u32, a: u32, x: f32, y: f64, z: f64) {
    assert!(e.send(Cmd { kind, layer, a, x, y, z }));
}

fn run(e: &Engine, frames: usize) -> Vec<OutEv> {
    let mut evs = vec![];
    let mut done = 0;
    while done < frames {
        let n = 256.min(frames - done);
        unsafe { e.process(n) };
        while let Some(ev) = e.poll() {
            evs.push(ev);
        }
        done += n;
    }
    evs
}

/// A drum layer with a rim on beat 1 (with `cond` and `chance`) and a plain kick on beat 0. Returns, per
/// pass, whether the rim fired and whether the kick did.
fn passes(c: u8, chance: f32, seed: u32, n: usize, fill_on: Option<std::ops::Range<usize>>) -> Vec<(bool, bool)> {
    let e = Engine::new(SR);
    send(&e, cmd::INSTRUMENT, 0, 1, 0.0, 0.0, 0.0);
    send(&e, cmd::CHANCE_SEED, 0, seed, 0.0, 0.0, 0.0);
    send(&e, cmd::EV_CLEAR, 0, 0, 0.0, 0.0, 0.0);
    send(&e, cmd::EV_ADD, 0, 36, 1.0, 0.0, 0.1);
    send(&e, cmd::EV_ADD, 0, 37, 1.0, 1.0, 0.1);
    if c != 0 || chance < 1.0 {
        send(&e, cmd::EV_COND, 0, c as u32, chance, 0.0, 1.0);
    }
    send(&e, cmd::EV_COMMIT, 0, 0, 0.0, 0.0, 0.0);
    send(&e, cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
    let mut out = vec![];
    for p in 0..n {
        let held = fill_on.as_ref().is_some_and(|r| r.contains(&p));
        send(&e, cmd::FILL, 0, held as u32, 0.0, 0.0, 0.0);
        let evs = run(&e, LOOP);
        let seq: Vec<&OutEv> = evs.iter().filter(|v| v.kind == out::SEQ_ON).collect();
        out.push((seq.iter().any(|v| v.note == 37), seq.iter().any(|v| v.note == 36)));
    }
    out
}

fn which(v: &[(bool, bool)]) -> Vec<usize> {
    v.iter().enumerate().filter(|(_, x)| x.0).map(|(i, _)| i).collect()
}

#[test]
fn trig_conditions_play_on_their_pass() {
    assert_eq!(which(&passes(cond::C1_2, 1.0, 1, 8, None)), vec![0, 2, 4, 6]);
    assert_eq!(which(&passes(cond::C2_2, 1.0, 1, 8, None)), vec![1, 3, 5, 7]);
    assert_eq!(which(&passes(cond::C1_4, 1.0, 1, 8, None)), vec![0, 4]);
    // The plain kick beside it plays every pass.
    assert!(passes(cond::C1_4, 1.0, 1, 8, None).iter().all(|x| x.1));
}

#[test]
fn fill_steps_play_only_while_the_fill_key_is_held() {
    assert_eq!(which(&passes(cond::FILL, 1.0, 1, 6, Some(2..4))), vec![2, 3]);
    assert_eq!(which(&passes(cond::NOT_FILL, 1.0, 1, 6, Some(2..4))), vec![0, 1, 4, 5]);
}

#[test]
fn chance_plays_the_passes_the_seed_says_and_repeats() {
    let n = 48;
    let a = passes(cond::NONE, 0.5, 42, n, None);
    let b = passes(cond::NONE, 0.5, 42, n, None);
    assert_eq!(a, b, "the same seed plays the same passes");
    let rim = NoteEv { chance: 0.5, ..NoteEv::new(1.0, 0.1, 37, 1.0) };
    let want: Vec<usize> = (0..n).filter(|&p| plays(&rim, p as u32, false, 42)).collect();
    assert_eq!(which(&a), want, "the engine plays what seq::plays predicts");
    let hits = want.len();
    assert!((14..=34).contains(&hits), "about half of {n}: {hits}");
    let other = passes(cond::NONE, 0.5, 43, n, None);
    assert_ne!(which(&other), want, "another seed, other passes");
    println!("chance 0.5 over {n} passes: {hits} played");
}

#[test]
fn an_arranged_copy_counts_plays_of_its_own_loop() {
    // An engine loop holding the part's loop twice (an arranged song): copy 0 is play `pass*2`, copy 1 is
    // play `pass*2 + 1`. 1:2 on both copies plays copy 0 every pass and copy 1 never.
    let e = Engine::new(SR);
    send(&e, cmd::INSTRUMENT, 0, 1, 0.0, 0.0, 0.0);
    send(&e, cmd::LOOP, 0, 0, 0.0, 8.0, 0.0);
    send(&e, cmd::EV_CLEAR, 0, 0, 0.0, 0.0, 0.0);
    send(&e, cmd::EV_ADD, 0, 37, 1.0, 1.0, 0.1);
    send(&e, cmd::EV_COND, 0, cond::C1_2 as u32, 1.0, 0.0, 2.0);
    send(&e, cmd::EV_ADD, 0, 37, 1.0, 5.0, 0.1);
    send(&e, cmd::EV_COND, 0, cond::C1_2 as u32, 1.0, 1.0, 2.0);
    send(&e, cmd::EV_COMMIT, 0, 0, 0.0, 0.0, 0.0);
    send(&e, cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
    let evs = run(&e, LOOP * 2 * 3);
    let starts: Vec<f64> = evs.iter().filter(|v| v.kind == out::SEQ_ON).map(|v| (v.beat * 4.0).round() / 4.0).collect();
    assert_eq!(starts, vec![1.0, 1.0, 1.0]);
}
