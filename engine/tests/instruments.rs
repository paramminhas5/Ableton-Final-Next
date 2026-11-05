//! Render tests for the chord synth, the lead and the fx layer, through the whole engine:
//! they make sound at a sane level, do not click, do not alias, chords are polyphonic,
//! and they sit in the mix with the rest.

use ccd_engine::engine::{cmd, Cmd, Engine};
use ccd_engine::params::*;

const SR: f32 = 48_000.0;
const DRUMS: u32 = 1;
const BASS: u32 = 2;
const CHORDS: u32 = 3;
const LEAD: u32 = 4;
const FX: u32 = 5;

fn send(e: &Engine, kind: u32, layer: u32, a: u32, x: f32, y: f64, z: f64) {
    assert!(e.send(Cmd { kind, layer, a, x, y, z }));
}

fn render(e: &Engine, frames: usize) -> (Vec<f32>, Vec<f32>) {
    let (mut l, mut r) = (Vec::with_capacity(frames), Vec::with_capacity(frames));
    let mut done = 0;
    while done < frames {
        let n = 256.min(frames - done);
        unsafe { e.process(n) };
        let c = unsafe { e.core() };
        l.extend_from_slice(&c.out_l[..n]);
        r.extend_from_slice(&c.out_r[..n]);
        while e.poll().is_some() {}
        done += n;
    }
    (l, r)
}

fn set(e: &Engine, layer: u32, index: usize, norm: f32) {
    send(e, cmd::PARAM, layer, index as u32, norm, 0.0, 0.0);
}

fn live(inst: u32, layer: u32) -> Engine {
    let e = Engine::new(SR);
    send(&e, cmd::INSTRUMENT, layer, inst, 0.0, 0.0, 0.0);
    e
}

fn peak(y: &[f32]) -> f32 {
    y.iter().fold(0.0, |a, b| a.max(b.abs()))
}

fn rms(y: &[f32]) -> f32 {
    (y.iter().map(|v| v * v).sum::<f32>() / y.len() as f32).sqrt()
}

fn max_step(y: &[f32]) -> f32 {
    y.windows(2).fold(0.0, |a, w| a.max((w[1] - w[0]).abs()))
}

fn db(x: f32) -> f32 {
    20.0 * x.max(1e-9).log10()
}

/// Magnitude spectrum of a Hann-windowed block, power of two length.
fn spectrum(y: &[f32]) -> Vec<f32> {
    let n = y.len();
    let mut re: Vec<f64> = y.iter().enumerate().map(|(i, v)| *v as f64 * (0.5 - 0.5 * (std::f64::consts::TAU * i as f64 / n as f64).cos())).collect();
    let mut im = vec![0.0f64; n];
    let mut j = 0;
    for i in 1..n {
        let mut bit = n >> 1;
        while j & bit != 0 {
            j ^= bit;
            bit >>= 1;
        }
        j ^= bit;
        if i < j {
            re.swap(i, j);
        }
    }
    let mut len = 2;
    while len <= n {
        let ang = -std::f64::consts::TAU / len as f64;
        for i in (0..n).step_by(len) {
            for k in 0..len / 2 {
                let (wr, wi) = ((ang * k as f64).cos(), (ang * k as f64).sin());
                let (a, b) = (i + k, i + k + len / 2);
                let (tr, ti) = (re[b] * wr - im[b] * wi, re[b] * wi + im[b] * wr);
                re[b] = re[a] - tr;
                im[b] = im[a] - ti;
                re[a] += tr;
                im[a] += ti;
            }
        }
        len <<= 1;
    }
    (0..n / 2).map(|i| (re[i] * re[i] + im[i] * im[i]).sqrt() as f32).collect()
}

/// Energy that is not near a harmonic of f0, against the harmonic energy, in dB.
fn inharmonic_db(y: &[f32], f0: f32) -> f32 {
    let s = spectrum(y);
    let n = y.len() as f32;
    let (mut harm, mut other) = (0.0f64, 0.0f64);
    for (bin, m) in s.iter().enumerate() {
        let f = bin as f32 * SR / n;
        if !(30.0..20_000.0).contains(&f) {
            continue;
        }
        let h = (f / f0).round().max(1.0);
        let near = (f - h * f0).abs() < 5.0 * SR / n;
        let e = (*m as f64).powi(2);
        if near {
            harm += e;
        } else {
            other += e;
        }
    }
    10.0 * ((other / harm) as f32).max(1e-12).log10()
}

#[test]
fn chord_synth_plays_a_chord_at_a_sane_level_without_clicks() {
    let e = live(3, CHORDS);
    for n in [57u32, 60, 64, 67] {
        send(&e, cmd::NOTE_ON, CHORDS, n, 0.9, 0.0, 0.0);
    }
    let (l, _) = render(&e, 48_000);
    let tail = &l[24_000..];
    assert!(rms(tail) > 0.02, "rms {}", rms(tail));
    assert!(peak(&l) < 0.95, "peak {}", peak(&l));
    // A pad with a slow attack may not step; the biggest jump stays well under a click.
    assert!(max_step(&l) < 0.35, "step {}", max_step(&l));
    // The released chord lets go and falls silent.
    send(&e, cmd::ALL_OFF, CHORDS, 0, 0.0, 0.0, 0.0);
    let (l, _) = render(&e, 48_000 * 6);
    assert!(rms(&l[l.len() - 4_800..]) < 1e-4);
}

#[test]
fn chords_are_polyphonic_four_notes_carry_four_pitches() {
    let e = live(3, CHORDS);
    // Detune and drift off, so the pitches are clean lines in the spectrum.
    set(&e, CHORDS, INSTRUMENT_BASE + C_SPREAD, 0.0);
    set(&e, CHORDS, INSTRUMENT_BASE + C_DRIFT, 0.0);
    let hz = |m: f32| 440.0 * ((m - 69.0) / 12.0).exp2();
    let chord = [48.0f32, 55.0, 64.0, 71.0];
    for n in chord {
        send(&e, cmd::NOTE_ON, CHORDS, n as u32, 0.9, 0.0, 0.0);
    }
    render(&e, 24_000);
    let (l, _) = render(&e, 16_384);
    let s = spectrum(&l);
    let bin = |f: f32| (f * 16_384.0 / SR).round() as usize;
    let floor = {
        // The quietest pitch's fundamental against the spectrum's median.
        let mut v = s.clone();
        v.sort_by(|a, b| a.partial_cmp(b).unwrap());
        v[v.len() / 2]
    };
    for n in chord {
        let b = bin(hz(n));
        let m = s[b - 2..=b + 2].iter().cloned().fold(0.0, f32::max);
        assert!(db(m) - db(floor) > 25.0, "note {n} missing: {} dB over floor", db(m) - db(floor));
    }
}

#[test]
fn lead_is_clean_up_the_keyboard() {
    for note in [60u32, 72, 84, 93] {
        let e = live(4, LEAD);
        set(&e, LEAD, INSTRUMENT_BASE + LD_DETUNE, 0.0);
        set(&e, LEAD, INSTRUMENT_BASE + LD_CUTOFF, 1.0);
        set(&e, LEAD, INSTRUMENT_BASE + LD_RES, 0.0);
        send(&e, cmd::NOTE_ON, LEAD, note, 0.9, 0.0, 0.0);
        render(&e, 24_000);
        let (l, _) = render(&e, 16_384);
        let f0 = 440.0 * ((note as f32 - 69.0) / 12.0).exp2();
        // The sub octave and the voice's own sub add harmonics of f0/2; use f0/2 as the grid.
        let ratio = inharmonic_db(&l, f0 * 0.5);
        eprintln!("lead note {note}: inharmonic {ratio:.1} dB");
        assert!(ratio < -42.0, "note {note}: inharmonic energy {ratio} dB");
        assert!(max_step(&l) < 0.5);
    }
}

#[test]
fn lead_and_chords_do_not_click_on_note_changes() {
    let e = live(4, LEAD);
    let mut all = vec![];
    for (i, n) in [60u32, 67, 72, 64].iter().enumerate() {
        send(&e, cmd::NOTE_ON, LEAD, *n, 0.9, 0.0, 0.0);
        let (l, _) = render(&e, 6_000);
        all.extend(l);
        if i % 2 == 1 {
            send(&e, cmd::NOTE_OFF, LEAD, *n, 0.0, 0.0, 0.0);
        }
    }
    assert!(max_step(&all) < 0.4, "step {}", max_step(&all));
}

#[test]
fn fx_layer_makes_each_sound_and_the_riser_fader_opens_up() {
    for k in 0..8u32 {
        let e = live(5, FX);
        set(&e, FX, INSTRUMENT_BASE + F_LENGTH, 0.0);
        send(&e, cmd::NOTE_ON, FX, FX_NOTE_BASE as u32 + k, 0.9, 0.0, 0.0);
        let (l, _) = render(&e, 96_000);
        assert!(l.iter().all(|v| v.is_finite()), "fx {k}");
        assert!(peak(&l) > 0.01 && peak(&l) < 1.0, "fx {k} peak {}", peak(&l));
    }
    let e = live(5, FX);
    set(&e, FX, INSTRUMENT_BASE + F_REVERB, 0.0);
    set(&e, FX, INSTRUMENT_BASE + F_BUILD, 0.1);
    let (a, _) = render(&e, 24_000);
    set(&e, FX, INSTRUMENT_BASE + F_BUILD, 1.0);
    render(&e, 12_000);
    let (b, _) = render(&e, 24_000);
    assert!(rms(&b) > rms(&a) * 3.0, "{} vs {}", rms(&b), rms(&a));
}

#[test]
fn six_layers_together_stay_under_the_ceiling() {
    let e = Engine::new(SR);
    for (l, inst) in [(0u32, DRUMS), (1, BASS), (2, CHORDS), (3, LEAD), (4, FX)] {
        send(&e, cmd::INSTRUMENT, l, inst, 0.0, 0.0, 0.0);
    }
    for n in [48u32, 55, 60, 64] {
        send(&e, cmd::NOTE_ON, 2, n, 1.0, 0.0, 0.0);
    }
    send(&e, cmd::NOTE_ON, 3, 76, 1.0, 0.0, 0.0);
    send(&e, cmd::NOTE_ON, 1, 33, 1.0, 0.0, 0.0);
    send(&e, cmd::NOTE_ON, 0, 36, 1.0, 0.0, 0.0);
    send(&e, cmd::NOTE_ON, 4, FX_IMPACT_NOTE as u32, 1.0, 0.0, 0.0);
    let (l, r) = render(&e, 96_000);
    assert!(peak(&l).max(peak(&r)) <= 1.0, "peak {}", peak(&l).max(peak(&r)));
}

#[test]
fn note_repeat_rolls_on_the_grid_and_stops_on_release() {
    let e = live(1, 0);
    // 120 bpm: a 1/16 is 0.125 s, 1/32 is 0.0625 s.
    let count = |div: f64, secs: f32| {
        let e = live(1, 0);
        send(&e, cmd::REPEAT, 0, 42, 0.8, div, 0.0);
        let mut hits = 0;
        let mut done = 0;
        let frames = (SR * secs) as usize;
        while done < frames {
            unsafe { e.process(256) };
            while let Some(ev) = e.poll() {
                if ev.kind == ccd_engine::engine::out::PLAYED_ON {
                    assert!(ev.flags & ccd_engine::engine::out::F_REPEAT != 0);
                    hits += 1;
                }
            }
            done += 256;
        }
        hits
    };
    let sixteenths = count(0.25, 1.0);
    let thirty_seconds = count(0.125, 1.0);
    assert!((8..=9).contains(&sixteenths), "1/16 gave {sixteenths}");
    assert!((16..=17).contains(&thirty_seconds), "1/32 gave {thirty_seconds}");
    send(&e, cmd::REPEAT, 0, 42, 0.8, 0.25, 0.0);
    render(&e, 4_800);
    send(&e, cmd::REPEAT, 0, 42, 0.0, 0.0, 0.0);
    render(&e, 9_600);
    let mut more = 0;
    for _ in 0..40 {
        unsafe { e.process(256) };
        while let Some(ev) = e.poll() {
            if ev.kind == ccd_engine::engine::out::PLAYED_ON {
                more += 1;
            }
        }
    }
    assert_eq!(more, 0);
}

#[test]
fn sampler_layer_plays_loaded_sample() {
    let e = live(Instrument::Sampler as u32, 0);
    let tone: Vec<f32> = (0..24_000).map(|i| (i as f32 / 44_100.0 * 330.0 * std::f32::consts::TAU).sin() * 0.8).collect();
    render(&e, 256);
    unsafe { e.load_sample(0, 3, &tone, 44_100.0) };
    send(&e, cmd::NOTE_ON, 0, 39, 1.0, -1.0, 0.0);
    let (l, _) = render(&e, 24_000);
    let p = peak(&l);
    assert!(p > 0.1 && p < 1.0, "peak {p}");
    assert!(max_step(&l) < 0.2, "click {}", max_step(&l));
    // A pad with nothing loaded stays silent.
    send(&e, cmd::NOTE_ON, 0, 36, 1.0, -1.0, 0.0);
    let (l2, _) = render(&e, 12_000);
    assert!(peak(&l2) < 0.5);
}

/// The kick's decay knob must change how long the kick rings: a short kick is gone well before
/// the next beat at 120 bpm, a long one still hums through it (process.md: a knob we show must
/// audibly do something).
#[test]
fn kick_decay_changes_the_tail() {
    let decay_index = INSTRUMENT_BASE + 1; // pad 0 (kick), decay is pad param 1
    let tail_ms = |decay: f32| -> f32 {
        let e = live(1, DRUMS);
        set(&e, DRUMS, decay_index, decay);
        send(&e, cmd::NOTE_ON, DRUMS, 36, 1.0, 0.0, 0.0);
        let (l, _) = render(&e, (SR * 2.0) as usize);
        let p = peak(&l);
        assert!(p > 0.05, "kick made no sound at decay {decay}");
        // last 5 ms window still above -40 dB of the peak
        let win = (SR * 0.005) as usize;
        let mut last = 0;
        for (i, w) in l.chunks(win).enumerate() {
            if peak(w) > p * 0.01 { last = i; }
        }
        (last * win) as f32 / SR * 1000.0
    };
    let short = tail_ms(0.12);
    let mid = tail_ms(0.5);
    let long = tail_ms(0.9);
    eprintln!("kick tail at -40 dB: short {short:.0} ms, mid {mid:.0} ms, long {long:.0} ms");
    assert!(short < 250.0, "short kick rings too long: {short} ms");
    assert!(long > short * 2.5, "decay barely changes the tail: {short} vs {long} ms");
    assert!(mid > short && mid < long, "decay is not monotonic: {short} {mid} {long}");
}

/// The same check through the sequencer at 120 bpm, the way a lesson loop plays it: between
/// beats (250 to 480 ms after each kick) a short kick is near silent and a long one still hums.
#[test]
fn kick_decay_is_audible_in_a_loop() {
    let decay_index = INSTRUMENT_BASE + 1;
    let gap_rms = |decay: f32| -> f32 {
        let e = live(1, DRUMS);
        set(&e, DRUMS, decay_index, decay);
        send(&e, cmd::TEMPO, 0, 0, 0.0, 120.0, 0.0);
        send(&e, cmd::EV_CLEAR, DRUMS, 0, 0.0, 0.0, 0.0);
        for b in 0..4 { send(&e, cmd::EV_ADD, DRUMS, 36, 1.0, b as f64, 0.25); }
        send(&e, cmd::EV_COMMIT, DRUMS, 0, 0.0, 0.0, 0.0);
        send(&e, cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
        let (l, _) = render(&e, (SR * 2.0) as usize);
        let beat = (SR * 0.5) as usize;
        let mut acc = 0.0f32; let mut n = 0;
        for b in 1..4 {
            let from = b * beat + (SR * 0.25) as usize;
            let to = b * beat + (SR * 0.48) as usize;
            let r = rms(&l[from..to]);
            acc += r * r; n += 1;
        }
        (acc / n as f32).sqrt()
    };
    let short = gap_rms(0.12);
    let long = gap_rms(0.9);
    eprintln!("between-beat rms: short {:.1} dB, long {:.1} dB", db(short), db(long));
    assert!(db(long) - db(short) > 12.0, "decay makes too little difference between beats: short {} dB, long {} dB", db(short), db(long));
}
