//! Timing tests through the public engine: notes land on the exact sample, the count-in
//! is one bar, what you play is placed where you played it, and duck really dips.

use ccd_engine::engine::{cmd, out, Cmd, Engine, OutEv};
use ccd_engine::params::*;

const SR: f32 = 48_000.0;

fn send(e: &Engine, kind: u32, layer: u32, a: u32, x: f32, y: f64, z: f64) {
    assert!(e.send(Cmd { kind, layer, a, x, y, z }));
}

fn render(e: &Engine, frames: usize, block: usize) -> Vec<f32> {
    let mut v = Vec::with_capacity(frames);
    let mut done = 0;
    while done < frames {
        let n = block.min(frames - done);
        unsafe { e.process(n) };
        let c = unsafe { e.core() };
        v.extend_from_slice(&c.out_l[..n]);
        done += n;
    }
    v
}

fn events(e: &Engine) -> Vec<OutEv> {
    let mut v = vec![];
    while let Some(ev) = e.poll() {
        v.push(ev);
    }
    v
}

fn first_onset(sig: &[f32], from: usize, thresh: f32) -> Option<usize> {
    sig.iter().skip(from).position(|x| x.abs() > thresh).map(|i| i + from)
}

#[test]
fn sequenced_notes_are_sample_accurate_at_any_block_size() {
    // Rim on beat 1 (sample 24 000 at 120 bpm). The voice must start exactly LATENCY
    // samples earlier, so after the engine's fixed delay it leaves on the grid.
    use ccd_engine::engine::LATENCY;
    for block in [1usize, 64, 128, 333, 1024] {
        let e = Engine::new(SR);
        send(&e, cmd::INSTRUMENT, 0, 1, 0.0, 0.0, 0.0);
        send(&e, cmd::EV_CLEAR, 0, 0, 0.0, 0.0, 0.0);
        send(&e, cmd::EV_ADD, 0, 37, 1.0, 1.0, 0.1);
        send(&e, cmd::EV_COMMIT, 0, 0, 0.0, 0.0, 0.0);
        send(&e, cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
        // Pressing play starts the clock LATENCY samples before the downbeat, so the
        // voice for beat 1 starts at sample 24 000 and is heard at 24 000 + LATENCY,
        // exactly when the audible clock reaches beat 1.
        render(&e, 24_000 - 1, block);
        assert!(!unsafe { e.core() }.layers[0].drums.pads[3].is_active(), "block {block}: early");
        render(&e, 1, 1);
        assert!(unsafe { e.core() }.layers[0].drums.pads[3].is_active(), "block {block}: late");
        render(&e, LATENCY, 1);
        let c = unsafe { e.core() };
        let heard = c.tr.beat - c.tr.start_at;
        assert!((heard - 1.0).abs() < 1.5 / 24_000.0, "block {block}: heard at beat {heard}");
    }
}

#[test]
fn count_in_is_one_bar_then_loop_starts() {
    let e = Engine::new(SR);
    send(&e, cmd::INSTRUMENT, 0, 1, 0.0, 0.0, 0.0);
    send(&e, cmd::EV_CLEAR, 0, 0, 0.0, 0.0, 0.0);
    send(&e, cmd::EV_ADD, 0, 37, 1.0, 0.0, 0.1);
    send(&e, cmd::EV_COMMIT, 0, 0, 0.0, 0.0, 0.0);
    send(&e, cmd::RECORD, 0, 4, 0.0, 0.0, 0.0);
    // 4 beats at 120 bpm = 96 000 samples of count-in, clicks only.
    render(&e, 95_000, 256);
    let core = unsafe { e.core() };
    assert_eq!(core.tr.state, ccd_engine::engine::State::Armed);
    render(&e, 2_000, 256);
    let core = unsafe { e.core() };
    assert_eq!(core.tr.state, ccd_engine::engine::State::Playing);
    let evs = events(&e);
    let seq: Vec<&OutEv> = evs.iter().filter(|v| v.kind == out::SEQ_ON).collect();
    assert_eq!(seq.len(), 1, "first loop note fires once, at loop start");
    assert!(seq[0].beat.abs() < 1e-6);
}

#[test]
fn played_note_is_placed_at_touch_time() {
    let e = Engine::new(SR);
    send(&e, cmd::INSTRUMENT, 1, 2, 0.0, 0.0, 0.0);
    send(&e, cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
    render(&e, 48_000, 256); // one second = 2 beats
    events(&e);
    // Touch happened 12 000 frames ago (a quarter beat... no: 12 000 / 24 000 = half a beat).
    let now = unsafe { e.core().frame } as f64;
    send(&e, cmd::NOTE_ON, 1, 45, 0.8, now - 12_000.0, 0.0);
    render(&e, 128, 128);
    let ev = events(&e).into_iter().find(|v| v.kind == out::PLAYED_ON).expect("played event");
    assert!((ev.beat - 1.5).abs() < 0.01, "placed at {}", ev.beat);
}

#[test]
fn duck_dips_the_bass_right_after_the_kick() {
    // Bass holds a long note; kick on every beat; bass ducks under drums.
    let e = Engine::new(SR);
    send(&e, cmd::INSTRUMENT, 0, 1, 0.0, 0.0, 0.0);
    send(&e, cmd::INSTRUMENT, 1, 2, 0.0, 0.0, 0.0);
    send(&e, cmd::PARAM, 0, L_LEVEL as u32, 0.0, 0.0, 0.0); // mute the drums' own output
    send(&e, cmd::EV_CLEAR, 0, 0, 0.0, 0.0, 0.0);
    for b in 0..4 {
        send(&e, cmd::EV_ADD, 0, 36, 1.0, b as f64, 0.1);
    }
    send(&e, cmd::EV_COMMIT, 0, 0, 0.0, 0.0, 0.0);
    send(&e, cmd::EV_CLEAR, 1, 0, 0.0, 0.0, 0.0);
    send(&e, cmd::EV_ADD, 1, 33, 1.0, 0.0, 3.9);
    send(&e, cmd::EV_COMMIT, 1, 0, 0.0, 0.0, 0.0);
    send(&e, cmd::DUCK, 1, 0, 36.0, 0.0, 0.0);
    send(&e, cmd::PARAM, 1, B_DECAY as u32 + INSTRUMENT_BASE as u32, 1.0, 0.0, 0.0);
    send(&e, cmd::PARAM, 1, L_DUCK as u32, 0.8, 0.0, 0.0);
    send(&e, cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
    let sig = render(&e, 96_000, 256);
    let rms = |a: usize, b: usize| (sig[a..b].iter().map(|x| x * x).sum::<f32>() / (b - a) as f32).sqrt();
    // Just after beat 2 vs the end of beat 2.
    let dip = rms(48_000 + 300, 48_000 + 2_000);
    let open = rms(48_000 + 15_000, 48_000 + 22_000);
    assert!(dip < open * 0.5, "dip {dip} open {open}");
}

#[test]
fn heavy_load_stays_finite() {
    let e = Engine::new(SR);
    for l in 0..8 {
        send(&e, cmd::INSTRUMENT, l, if l % 2 == 0 { 1 } else { 2 }, 0.0, 0.0, 0.0);
        send(&e, cmd::PARAM, l, L_DRIVE as u32, 1.0, 0.0, 0.0);
        send(&e, cmd::PARAM, l, L_SEND as u32, 1.0, 0.0, 0.0);
        send(&e, cmd::PARAM, l, L_ECHO as u32, 1.0, 0.0, 0.0);
        send(&e, cmd::EV_CLEAR, l, 0, 0.0, 0.0, 0.0);
        for s in 0..16 {
            let note = if l % 2 == 0 { DRUM_PAD_NOTES[s % 16] as u32 } else { 30 + s as u32 * 3 };
            send(&e, cmd::EV_ADD, l, note, 1.0, s as f64 * 0.25, 0.2);
        }
        send(&e, cmd::EV_COMMIT, l, 0, 0.0, 0.0, 0.0);
    }
    send(&e, cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
    let sig = render(&e, 48_000 * 3, 512);
    assert!(sig.iter().all(|x| x.is_finite() && x.abs() <= 1.0));
}


#[test]
#[ignore]
fn bench_eight_layers() {
    let e = Engine::new(SR);
    for l in 0..8 {
        send(&e, cmd::INSTRUMENT, l, if l % 2 == 0 { 1 } else { 2 }, 0.0, 0.0, 0.0);
        send(&e, cmd::PARAM, l, L_DRIVE as u32, 0.5, 0.0, 0.0);
        send(&e, cmd::PARAM, l, L_SEND as u32, 0.3, 0.0, 0.0);
        send(&e, cmd::EV_CLEAR, l, 0, 0.0, 0.0, 0.0);
        for s in 0..16 {
            let note = if l % 2 == 0 { DRUM_PAD_NOTES[s % 16] as u32 } else { 30 + s as u32 * 3 };
            send(&e, cmd::EV_ADD, l, note, 1.0, s as f64 * 0.25, 0.2);
        }
        send(&e, cmd::EV_COMMIT, l, 0, 0.0, 0.0, 0.0);
    }
    send(&e, cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
    let t = std::time::Instant::now();
    render(&e, 48_000 * 10, 128);
    let ms = t.elapsed().as_secs_f64() * 1000.0;
    println!("native: 8 layers, 10 s in {ms:.0} ms = {:.1}% of one core", ms / 100.0);
}
