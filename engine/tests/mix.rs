//! Render tests for the mix: the master never passes 0 dBTP, duck still dips after the
//! master, clashes are found where they are and not where they are not, compare
//! switches without clicks, and the meters report about 30 times a second.

use ccd_engine::analysis::fix;
use ccd_engine::engine::{cmd, out, Cmd, Engine, OutEv, MASTER_LAYER};
use ccd_engine::master::reference::{bs1770_true_peak, strict_true_peak};
use ccd_engine::params::*;

const SR: f32 = 48_000.0;

fn send(e: &Engine, kind: u32, layer: u32, a: u32, x: f32, y: f64, z: f64) {
    assert!(e.send(Cmd { kind, layer, a, x, y, z }));
}

/// Render `frames`, returning both channels and every event.
fn render(e: &Engine, frames: usize) -> (Vec<f32>, Vec<f32>, Vec<OutEv>) {
    let (mut l, mut r, mut evs) = (Vec::with_capacity(frames), Vec::with_capacity(frames), vec![]);
    let mut done = 0;
    while done < frames {
        let n = 256.min(frames - done);
        unsafe { e.process(n) };
        let c = unsafe { e.core() };
        l.extend_from_slice(&c.out_l[..n]);
        r.extend_from_slice(&c.out_r[..n]);
        while let Some(ev) = e.poll() {
            evs.push(ev);
        }
        done += n;
    }
    (l, r, evs)
}

fn pattern(e: &Engine, layer: u32, inst: u32, notes: &[(f64, u32, f64)]) {
    send(e, cmd::INSTRUMENT, layer, inst, 0.0, 0.0, 0.0);
    send(e, cmd::EV_CLEAR, layer, 0, 0.0, 0.0, 0.0);
    for (s, n, len) in notes {
        send(e, cmd::EV_ADD, layer, *n, 0.9, *s, *len);
    }
    send(e, cmd::EV_COMMIT, layer, 0, 0.0, 0.0, 0.0);
}

const BASS: u32 = 2;
const DRUMS: u32 = 1;
const RIFF: [(f64, u32, f64); 8] = [(0.25, 33, 0.25), (0.75, 33, 0.25), (1.25, 45, 0.3), (1.5, 43, 0.25), (2.25, 36, 0.25), (2.75, 33, 0.5), (3.25, 40, 0.25), (3.5, 38, 0.25)];

fn kick_and_hats() -> Vec<(f64, u32, f64)> {
    let mut v: Vec<(f64, u32, f64)> = (0..4).map(|b| (b as f64, 36, 0.1)).collect();
    for b in 0..8 {
        v.push((b as f64 * 0.5 + 0.25, 42, 0.1));
    }
    v
}

fn hats() -> Vec<(f64, u32, f64)> {
    (0..16).map(|s| (s as f64 * 0.25, if s % 4 == 2 { 46 } else { 42 }, 0.1)).collect()
}

fn dbtp(x: f32) -> f32 {
    20.0 * x.log10()
}

#[test]
fn the_master_never_passes_0_dbtp_in_a_hot_mix() {
    // Eight layers flat out: drive, crush, +6 dB faders, full glue, out at +6 dB.
    let e = Engine::new(SR);
    for l in 0..8u32 {
        if l % 2 == 0 {
            pattern(&e, l, DRUMS, &(0..16).map(|s| (s as f64 * 0.25, DRUM_PAD_NOTES[(s + l as usize) % 16] as u32, 0.2)).collect::<Vec<_>>());
        } else {
            pattern(&e, l, BASS, &(0..16).map(|s| (s as f64 * 0.25, 28 + ((s * 7 + l as usize * 5) % 36) as u32, 0.2)).collect::<Vec<_>>());
        }
        send(&e, cmd::PARAM, l, L_LEVEL as u32, 1.0, 0.0, 0.0);
        send(&e, cmd::PARAM, l, L_DRIVE as u32, 1.0, 0.0, 0.0);
        send(&e, cmd::PARAM, l, L_EQ_HIGH as u32, 1.0, 0.0, 0.0);
        if l == 3 {
            send(&e, cmd::PARAM, l, L_CRUSH as u32, 0.8, 0.0, 0.0);
        }
        send(&e, cmd::PARAM, l, L_SEND as u32, 0.5, 0.0, 0.0);
        send(&e, cmd::PARAM, l, L_PAN as u32, l as f32 / 7.0, 0.0, 0.0);
    }
    send(&e, cmd::MASTER, 0, 0, 1.0, 0.0, 0.0); // out +6 dB
    send(&e, cmd::MASTER, 0, 1, 1.0, 0.0, 0.0); // glue full
    send(&e, cmd::TEMPO, 0, 0, 0.0, 128.0, 0.0);
    send(&e, cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
    let (l, r, _) = render(&e, 48_000 * 4);
    let (l, r) = (&l[4800..], &r[4800..]);
    let sample = l.iter().chain(r).fold(0.0f32, |a, b| a.max(b.abs()));
    assert!(sample > 0.8, "the mix should be slammed into the limiter: {sample}");
    let std = dbtp(bs1770_true_peak(l).max(bs1770_true_peak(r)));
    let strict = dbtp(strict_true_peak(l).max(strict_true_peak(r)));
    assert!(std < -0.5, "BS.1770 meter: {std:.2} dBTP");
    assert!(strict < 0.0, "strict 16x meter: {strict:.2} dBTP");
}

fn duck_scene(glue: f32, out_n: f32) -> f32 {
    // Bass holds a long note; kick on every beat; bass ducks under the drums. The
    // drums' own output is off so what we hear is the bass, after the master.
    let e = Engine::new(SR);
    pattern(&e, 0, DRUMS, &(0..4).map(|b| (b as f64, 36, 0.1)).collect::<Vec<_>>());
    send(&e, cmd::PARAM, 0, L_LEVEL as u32, 0.0, 0.0, 0.0);
    pattern(&e, 1, BASS, &[(0.0, 33, 3.9)]);
    send(&e, cmd::DUCK, 1, 0, 36.0, 0.0, 0.0);
    send(&e, cmd::PARAM, 1, B_DECAY as u32 + INSTRUMENT_BASE as u32, 1.0, 0.0, 0.0);
    send(&e, cmd::PARAM, 1, L_LEVEL as u32, 1.0, 0.0, 0.0);
    send(&e, cmd::PARAM, 1, L_DUCK as u32, 0.8, 0.0, 0.0);
    send(&e, cmd::MASTER, 0, 1, glue, 0.0, 0.0);
    send(&e, cmd::MASTER, 0, 0, out_n, 0.0, 0.0);
    send(&e, cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
    let (sig, _, _) = render(&e, 96_000);
    let rms = |a: usize, b: usize| (sig[a..b].iter().map(|x| x * x).sum::<f32>() / (b - a) as f32).sqrt();
    // Just after beat 2 vs the end of beat 2.
    let dip = rms(48_000 + 300, 48_000 + 2_000);
    let open = rms(48_000 + 15_000, 48_000 + 22_000);
    dip / open
}

#[test]
fn duck_still_dips_after_the_master() {
    // The dip with the master doing nothing: no glue, out low enough that the
    // limiter never acts.
    let clean = duck_scene(0.0, 0.5);
    assert!(clean < 0.5, "clean dip {clean:.2}");
    // The default master keeps it as it is.
    let default = duck_scene(0.25, FADER_UNITY);
    assert!(default < clean * 1.1, "default master: {default:.2} vs {clean:.2}");
    // Even pushed hard (full glue, out +6 dB into the limiter) it still dips by more
    // than 4 dB. Heavy limiting always evens out some of a dip; the slow release keeps
    // it from refilling it.
    let slammed = duck_scene(1.0, 1.0);
    assert!(slammed < 0.6 && slammed < clean * 1.25, "slammed master: {slammed:.2} vs {clean:.2}");
}

/// Play a scene with analysis on for a few seconds and return the clashes in the
/// last analysis frame.
fn clashes_after(setup: impl Fn(&Engine)) -> Vec<OutEv> {
    let e = Engine::new(SR);
    send(&e, cmd::ANALYSE, 0, 1, 0.0, 0.0, 0.0);
    setup(&e);
    send(&e, cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
    let (_, _, evs) = render(&e, 48_000 * 5);
    let last_frame = evs.iter().rposition(|v| v.kind == out::MASTER_METER).expect("analysis frames");
    let start = evs[..last_frame].iter().rposition(|v| v.kind == out::MASTER_METER).map(|i| i + 1).unwrap_or(0);
    let master = evs[last_frame];
    let found: Vec<OutEv> = evs[start..last_frame].iter().copied().filter(|v| v.kind == out::CLASH).collect();
    assert_eq!(master.flags & 0xff, found.len() as u32, "the master frame counts the clashes");
    found
}

#[test]
fn clash_fires_on_two_basses_at_the_same_pan() {
    let found = clashes_after(|e| {
        pattern(e, 0, BASS, &RIFF);
        pattern(e, 1, BASS, &[(0.0, 36, 1.9), (2.0, 31, 1.9)]);
    });
    assert_eq!(found.len(), 1, "{found:?}");
    let c = found[0];
    assert_eq!(c.flags & 3, 0, "in the lows");
    assert!((c.layer, c.note) == (0, 1) || (c.layer, c.note) == (1, 0));
    // Two basses: cut one's lows (panning lows is not the answer).
    assert_eq!((c.flags >> 5) & 3, fix::EQ);
    assert!(c.vel > 0.3, "severity {}", c.vel);
}

#[test]
fn no_clash_between_bass_and_hats() {
    let found = clashes_after(|e| {
        pattern(e, 0, BASS, &RIFF);
        pattern(e, 1, DRUMS, &hats());
    });
    assert!(found.is_empty(), "{found:?}");
}

#[test]
fn no_clash_once_the_basses_are_apart() {
    let found = clashes_after(|e| {
        pattern(e, 0, BASS, &RIFF);
        pattern(e, 1, BASS, &[(0.0, 36, 1.9), (2.0, 31, 1.9)]);
        send(e, cmd::PARAM, 1, L_PAN as u32, 0.9, 0.0, 0.0);
    });
    assert!(found.is_empty(), "{found:?}");
}

#[test]
fn drums_and_bass_clash_and_the_fix_is_to_duck_the_bass() {
    let found = clashes_after(|e| {
        pattern(e, 0, BASS, &RIFF);
        pattern(e, 1, DRUMS, &kick_and_hats());
    });
    assert_eq!(found.len(), 1, "{found:?}");
    let c = found[0];
    assert_eq!((c.layer, c.note), (0, 1), "the bass moves, not the drums");
    assert_eq!((c.flags >> 5) & 3, fix::DUCK);
    assert_eq!((c.flags >> 7) & 3, fix::EQ, "second pad: cut the bass lows");

    // Both suggested fixes clear it.
    let ducked = clashes_after(|e| {
        pattern(e, 0, BASS, &RIFF);
        pattern(e, 1, DRUMS, &kick_and_hats());
        send(e, cmd::DUCK, 0, 1, 36.0, 0.0, 0.0);
        send(e, cmd::PARAM, 0, L_DUCK as u32, c.aux, 0.0, 0.0);
    });
    assert!(ducked.is_empty(), "after duck: {ducked:?}");
    let cut = clashes_after(|e| {
        pattern(e, 0, BASS, &RIFF);
        pattern(e, 1, DRUMS, &kick_and_hats());
        send(e, cmd::PARAM, 0, L_EQ_CUT as u32, c.beat as f32, 0.0, 0.0);
    });
    assert!(cut.is_empty(), "after cut: {cut:?}");
}

#[test]
fn meters_report_about_30_times_a_second() {
    let e = Engine::new(SR);
    send(&e, cmd::ANALYSE, 0, 1, 0.0, 0.0, 0.0);
    pattern(&e, 0, BASS, &RIFF);
    pattern(&e, 2, DRUMS, &hats());
    send(&e, cmd::PARAM, 2, L_PAN as u32, 0.8, 0.0, 0.0);
    send(&e, cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
    let (_, _, evs) = render(&e, 48_000 * 2);
    let frames = evs.iter().filter(|v| v.kind == out::MASTER_METER).count();
    assert!((58..=61).contains(&frames), "{frames} frames in 2 s");
    let last = |layer: u32, kind: u32| *evs.iter().rev().find(|v| v.kind == kind && v.layer == layer).unwrap();
    // Bass: low and centred. Hats: high and to the right.
    let (bass, hats_m) = (last(0, out::METER), last(2, out::METER));
    assert!(bass.flags == 1 && hats_m.flags == 1);
    assert!(bass.note < 300 && hats_m.note > 3000, "centres {} {}", bass.note, hats_m.note);
    assert!(bass.beat.abs() < 0.05 && (hats_m.beat - 0.6).abs() < 0.05, "pans {} {}", bass.beat, hats_m.beat);
    let bb = last(0, out::BANDS);
    assert!(bb.vel > bb.beat as f32 + 20.0, "bass low {} high {}", bb.vel, bb.beat);
    // The master's true peak over the last half second, and its loudness.
    let masters: Vec<&OutEv> = evs.iter().filter(|v| v.kind == out::MASTER_METER && v.layer == MASTER_LAYER).collect();
    let tp = masters[masters.len() - 15..].iter().map(|v| v.vel).fold(-200.0f32, f32::max);
    let lufs = masters.last().unwrap().aux;
    assert!(tp < -0.5 && tp > -40.0 && lufs > -40.0, "master tp {tp} lufs {lufs}");
    // Analysis off: no more reports.
    send(&e, cmd::ANALYSE, 0, 0, 0.0, 0.0, 0.0);
    let (_, _, evs) = render(&e, 9_600);
    assert!(evs.iter().all(|v| v.kind != out::METER));
}

#[test]
fn compare_plays_the_snapshot_and_switches_without_clicks() {
    // A steady bass line, the same every quarter beat, so every half-beat window holds
    // the same music. Snapshot, then change the mix a lot: level, eq, pan, low cut.
    let e = Engine::new(SR);
    pattern(&e, 0, BASS, &(0..16).map(|s| (s as f64 * 0.25, 40, 0.2)).collect::<Vec<_>>());
    send(&e, cmd::MASTER, 0, 1, 0.0, 0.0, 0.0); // no glue, so levels compare directly
    send(&e, cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
    render(&e, 24_000);
    send(&e, cmd::SNAPSHOT, 0, 0, 0.0, 0.0, 0.0);
    let (before, _, _) = render(&e, 24_000);
    for (k, v) in [(L_LEVEL, 0.45), (L_EQ_LOW, 1.0), (L_EQ_HIGH, 0.0), (L_PAN, 0.0), (L_EQ_CUT, 0.4)] {
        send(&e, cmd::PARAM, 0, k as u32, v, 0.0, 0.0);
    }
    let (after, _, _) = render(&e, 24_000);
    let rms = |x: &[f32]| (x.iter().map(|v| v * v).sum::<f32>() / x.len() as f32).sqrt();
    let (b, a) = (rms(&before[12_000..]), rms(&after[12_000..]));
    assert!(a < b * 0.6, "the change is big: {a} vs {b}");

    // Hold: hear the snapshot. Let go: back to now.
    send(&e, cmd::COMPARE, 0, 1, 0.0, 0.0, 0.0);
    let (held, _, _) = render(&e, 24_000);
    send(&e, cmd::COMPARE, 0, 0, 0.0, 0.0, 0.0);
    let (back, _, _) = render(&e, 24_000);
    let h = rms(&held[12_000..]);
    let k = rms(&back[12_000..]);
    assert!((h / b - 1.0).abs() < 0.05, "holding plays the snapshot: {h} vs {b}");
    assert!((k / a - 1.0).abs() < 0.05, "letting go plays the mix now: {k} vs {a}");

    // No clicks: the biggest sample-to-sample step around each switch is no bigger
    // than the music's own.
    let step = |x: &[f32]| x.windows(2).map(|w| (w[1] - w[0]).abs()).fold(0.0f32, f32::max);
    let steady = step(&before[12_000..]).max(step(&after[12_000..]));
    assert!(step(&held[..4_800]) <= steady * 1.05, "switching to compare clicks: {} vs {steady}", step(&held[..4_800]));
    assert!(step(&back[..4_800]) <= steady * 1.05, "switching back clicks: {} vs {steady}", step(&back[..4_800]));

    // Edits while holding land on the live mix, not the snapshot.
    send(&e, cmd::COMPARE, 0, 1, 0.0, 0.0, 0.0);
    send(&e, cmd::PARAM, 0, L_LEVEL as u32, FADER_UNITY, 0.0, 0.0);
    let (held2, _, _) = render(&e, 24_000);
    assert!((rms(&held2[12_000..]) / b - 1.0).abs() < 0.05);
    send(&e, cmd::COMPARE, 0, 0, 0.0, 0.0, 0.0);
    let core = unsafe { e.core() };
    assert_eq!(core.layers[0].params[L_LEVEL], FADER_UNITY);
}
