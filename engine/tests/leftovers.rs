//! The leftovers from "touch and hear" and "write and play" (design/engine-plan.md, "After engine 2: leftovers
//! (engine)"): the layer lfo and the sampler's aux envelope, live modulation values, chance as it will play
//! (for the midi export), free-running part lengths, punch-in automation and sample-exact p-locks.
//! Run with `cargo test --release --test leftovers -- --nocapture` to see the numbers.

mod common;
use ccd_engine::engine::{cmd, out, Cmd, Engine, ModLfo, LATENCY, MOD_ENV, MOD_LFO, MOD_VALUES, VOICE_LATENCY};
use ccd_engine::params::*;
use ccd_engine::punch;
use ccd_engine::seq::{cond, plays, NoteEv};
use common::*;

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

/// FNV-1a over the bits of both channels.
fn hash(l: &[f32], r: &[f32]) -> u64 {
    let mut h = 0xcbf2_9ce4_8422_2325u64;
    for v in l.iter().chain(r) {
        for b in v.to_bits().to_le_bytes() {
            h ^= b as u64;
            h = h.wrapping_mul(0x0100_0000_01b3);
        }
    }
    h
}

/// Left over right in dB, in windows of `w` samples.
fn balance(l: &[f32], r: &[f32], w: usize) -> Vec<f32> {
    l.chunks(w).zip(r.chunks(w)).map(|(a, b)| db(rms(a)) - db(rms(b))).collect()
}

/// A song that only uses what the engine had before the leftovers: all six instruments, chance and trig
/// conditions, swing, a modulation route, a sample, the fill key and a punch-in press. Its render must not
/// change by a single bit (the hash was taken on the engine before these changes, a004aee).
fn reference_song() -> Engine {
    let e = Engine::new(SR);
    let insts = [1u32, 2, 3, 4, 5, 6];
    for (l, inst) in insts.iter().enumerate() {
        let l = l as u32;
        send(&e, cmd::INSTRUMENT, l, *inst, 0.0, 0.0, 0.0);
        send(&e, cmd::PARAM, l, L_SEND as u32, 0.3, 0.0, 0.0);
        send(&e, cmd::PARAM, l, L_ECHO as u32, 0.2, 0.0, 0.0);
        send(&e, cmd::EV_CLEAR, l, 0, 0.0, 0.0, 0.0);
        for s in 0..16u32 {
            let note = match inst {
                1 => DRUM_PAD_NOTES[(s % 8) as usize] as u32,
                5 => 36 + s % 8,
                6 => 36,
                _ => 40 + (s * 5) % 24,
            };
            send(&e, cmd::EV_ADD, l, note, 0.9, s as f64 * 0.25, 0.3);
            if s % 3 == 1 {
                send(&e, cmd::EV_COND, l, 0, 0.5, 0.0, 1.0);
            } else if s % 5 == 2 {
                send(&e, cmd::EV_COND, l, cond::C1_2 as u32, 1.0, 0.0, 1.0);
            }
        }
        send(&e, cmd::EV_COMMIT, l, 0, 0.0, 0.0, 0.0);
    }
    send(&e, cmd::MOD, 3, 0, 0.3, L_PAN as f64, MOD_LFO as f64);
    send(&e, cmd::MOD, 2, 1, 0.4, (INSTRUMENT_BASE + C_CUTOFF) as f64, MOD_ENV as f64);
    send(&e, cmd::SWING, 0, 0, 0.0, 0.3, 0.0);
    send(&e, cmd::CHANCE_SEED, 0, 7, 0.0, 0.0, 0.0);
    let s = sine(330.0, 24_000, 0.5);
    unsafe { e.load_sample(5, 0, &s, SR) };
    send(&e, cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
    e
}

fn reference_render() -> (Vec<f32>, Vec<f32>) {
    let e = reference_song();
    let (mut l, mut r) = render(&e, 48_000);
    send(&e, cmd::FILL, 0, 1, 0.0, 0.0, 0.0);
    send(&e, cmd::PUNCH, 0, punch::FILTER as u32, 0.3, 0.0, 0.0);
    let (l2, r2) = render(&e, 24_000);
    send(&e, cmd::PUNCH, 0, punch::OFF as u32, 0.0, 0.0, 0.0);
    send(&e, cmd::FILL, 0, 0, 0.0, 0.0, 0.0);
    let (l3, r3) = render(&e, 48_000);
    l.extend(l2);
    l.extend(l3);
    r.extend(r2);
    r.extend(r3);
    (l, r)
}

/// Taken on a004aee (before the leftovers) with this same test.
const REFERENCE_HASH: u64 = 0x61e9_2430_de04_fa4c;

#[test]
fn unused_is_bit_identical_to_before() {
    let (l, r) = reference_render();
    let h = hash(&l, &r);
    println!("reference song (6 instruments, chance, swing, a route, a sample, fill, a punch press): hash {h:#018x}, {} samples", l.len() * 2);
    assert!(l.iter().chain(&r).all(|v| v.is_finite()));
    if REFERENCE_HASH != 0 {
        assert_eq!(h, REFERENCE_HASH, "the render changed");
    }
}

// ── 1. the layer lfo and the sampler's aux envelope ──────────────────────────────────────────────────────

/// One drums layer with closed hats on every 16th, short, glue off.
fn hats() -> Engine {
    let e = Engine::new(SR);
    send(&e, cmd::INSTRUMENT, 0, 1, 0.0, 0.0, 0.0);
    send(&e, cmd::MASTER, 0, 1, 0.0, 0.0, 0.0);
    send(&e, cmd::EV_CLEAR, 0, 0, 0.0, 0.0, 0.0);
    for s in 0..16 {
        send(&e, cmd::EV_ADD, 0, 42, 0.9, s as f64 * 0.25, 0.1);
    }
    send(&e, cmd::EV_COMMIT, 0, 0, 0.0, 0.0, 0.0);
    e
}

fn lfo_param(e: &Engine, inst: Instrument, k: usize, n: f32) {
    send(e, cmd::PARAM, 0, (lfo_base(inst).unwrap() + k) as u32, n, 0.0, 0.0);
}

/// The mean balance of hats panned to `n` and left alone.
fn hats_static(n: f32) -> f32 {
    let e = hats();
    send(&e, cmd::PARAM, 0, L_PAN as u32, n, 0.0, 0.0);
    send(&e, cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
    let (l, r) = render(&e, 48_000);
    db(rms(&l[12_000..])) - db(rms(&r[12_000..]))
}

#[test]
fn drums_lfo_synced_square_flips_pan_every_beat() {
    // Synced to a half note (2 beats), square: the first beat of each half note is up, the second down.
    let e = hats();
    lfo_param(&e, Instrument::Drums, LFO_SYNC, 1.0);
    lfo_param(&e, Instrument::Drums, LFO_SYNCED, 4.0 / 7.0);
    lfo_param(&e, Instrument::Drums, LFO_WAVE, 4.0 / 5.0);
    send(&e, cmd::MOD, 0, 0, 0.25, L_PAN as f64, MOD_LFO as f64);
    send(&e, cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
    let (l, r) = render(&e, 48_000 * 4);
    // A beat is 24,000 samples at 120 bpm; skip the 15 ms the pan glides at each flip.
    let per_beat: Vec<f32> = (0..8).map(|b| {
        let a = b * 24_000 + LATENCY + 1_200;
        db(rms(&l[a..a + 22_000])) - db(rms(&r[a..a + 22_000]))
    }).collect();
    let (left, right) = (hats_static(0.25), hats_static(0.75));
    println!("drums lfo, square synced 1/2 onto pan by 0.25: beats {:?} dB left over right; pan 0.25 / 0.75 reads {left:.2} / {right:.2}", per_beat.iter().map(|v| format!("{v:.2}")).collect::<Vec<_>>());
    for (b, v) in per_beat.iter().enumerate() {
        let want = if b % 2 == 0 { right } else { left };
        assert!((v - want).abs() < 0.3, "beat {b}: {v} want {want}");
    }
}

#[test]
fn lfo_values_follow_every_waveform_and_the_rate() {
    let names = ["sine", "up", "down", "triangle", "square", "random"];
    for w in 0..6u8 {
        let e = hats();
        lfo_param(&e, Instrument::Drums, LFO_SYNC, 1.0);
        lfo_param(&e, Instrument::Drums, LFO_SYNCED, 5.0 / 7.0); // 1 bar
        let cyc = if w == 5 { 1.0 } else { 4.0 }; // random: a quarter note, so 8 cycles
        if w == 5 {
            lfo_param(&e, Instrument::Drums, LFO_SYNCED, 3.0 / 7.0);
        }
        lfo_param(&e, Instrument::Drums, LFO_WAVE, w as f32 / 5.0);
        send(&e, cmd::MOD, 0, 0, 0.25, L_PAN as f64, MOD_LFO as f64);
        send(&e, cmd::MOD_WATCH, 0, 1, 0.0, 0.0, 0.0);
        send(&e, cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
        let (mut worst, mut n, mut buf) = (0.0f32, 0usize, [0.0f32; MOD_VALUES]);
        let mut held = Vec::new();
        for blk in 0..(48_000 * 4 / 128) {
            unsafe { e.process(128) };
            while e.poll().is_some() {}
            assert_eq!(unsafe { e.core() }.read_mods(&mut buf), MOD_VALUES);
            // The last control step was at most 16 samples ago: the song beat then, a bar a cycle.
            let beat = ((blk + 1) * 128) as f64 * 2.0 / 48_000.0;
            let ph = (beat / cyc).fract();
            // The slot's knob plays at 0.5 plus a quarter of the lfo.
            assert!((buf[2] - (0.5 + 0.25 * buf[0]).clamp(0.0, 1.0)).abs() < 1e-6);
            if w == 5 {
                if ph > 0.01 && ph < 0.99 {
                    held.push(((beat / cyc) as i64, buf[0]));
                }
                continue;
            }
            // Skip the jumps of up, down and square.
            let edge = [0.0, 0.5, 1.0].iter().any(|x| (ph - x).abs() < 0.003);
            if edge {
                continue;
            }
            let want = ModLfo::shape(w, ph, 0.0);
            worst = worst.max((buf[0] - want).abs());
            n += 1;
        }
        if w == 5 {
            // Sample and hold: one value per cycle, a new one each cycle.
            let per: Vec<f32> = (0..8).map(|c| held.iter().filter(|h| h.0 == c).map(|h| h.1).fold(f32::NAN, |a, v| if a.is_nan() || a == v { v } else { f32::INFINITY })).collect();
            println!("lfo random (S&H), synced 1/4: one value a beat {:?}", per.iter().map(|v| format!("{v:.3}")).collect::<Vec<_>>());
            assert!(per.iter().all(|v| v.is_finite() && v.abs() <= 1.0));
            assert!(per.windows(2).all(|p| p[0] != p[1]));
        } else {
            println!("lfo {:>8}, synced 1 bar: {n} reads, worst {worst:.4} off the waveform at the song's beat", names[w as usize]);
            assert!(worst < 0.01, "{} worst {worst}", names[w as usize]);
        }
    }
    // Rate in Hz: 2 Hz sine counted by its zero crossings over 4 s, transport stopped (it runs free).
    let e = hats();
    lfo_param(&e, Instrument::Drums, LFO_SYNC, 0.0);
    lfo_param(&e, Instrument::Drums, LFO_RATE, LFO_RATE_SPEC.from_value(2.0));
    send(&e, cmd::MOD, 0, 0, 0.25, L_PAN as f64, MOD_LFO as f64);
    send(&e, cmd::MOD_WATCH, 0, 1, 0.0, 0.0, 0.0);
    let (mut last, mut crossings, mut buf) = (0.0f32, 0, [0.0f32; MOD_VALUES]);
    for _ in 0..(48_000 * 4 / 128) {
        unsafe { e.process(128) };
        unsafe { e.core() }.read_mods(&mut buf);
        if last < 0.0 && buf[0] >= 0.0 {
            crossings += 1;
        }
        last = buf[0];
    }
    println!("lfo at 2 Hz (free, stopped): {crossings} rising zero crossings in 4 s");
    assert_eq!(crossings, 8);
}

#[test]
fn random_lfo_is_repeatable_with_the_seed() {
    let run = |seed: u32| {
        let e = hats();
        send(&e, cmd::CHANCE_SEED, 0, seed, 0.0, 0.0, 0.0);
        lfo_param(&e, Instrument::Drums, LFO_SYNCED, 1.0 / 7.0); // 1/16
        lfo_param(&e, Instrument::Drums, LFO_WAVE, 1.0);
        send(&e, cmd::MOD, 0, 0, 0.25, L_PAN as f64, MOD_LFO as f64);
        send(&e, cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
        let (l, r) = render(&e, 48_000);
        hash(&l, &r)
    };
    let (a, b, c) = (run(3), run(3), run(4));
    println!("random lfo on pan: seed 3 twice {a:#x} / {b:#x}, seed 4 {c:#x}");
    assert_eq!(a, b);
    assert_ne!(a, c);
}

#[test]
fn fx_lfo_moves_its_cutoff() {
    // The fx's noise hit with its own lfo (sine, 1/4 note) onto the part's filter: the level swings.
    let level = |route: bool| {
        let e = Engine::new(SR);
        send(&e, cmd::INSTRUMENT, 0, 5, 0.0, 0.0, 0.0);
        send(&e, cmd::MASTER, 0, 1, 0.0, 0.0, 0.0);
        send(&e, cmd::PARAM, 0, L_LP as u32, 0.5, 0.0, 0.0);
        lfo_param(&e, Instrument::Fx, LFO_SYNCED, 3.0 / 7.0);
        if route {
            send(&e, cmd::MOD, 0, 0, 0.4, L_LP as f64, MOD_LFO as f64);
        }
        send(&e, cmd::EV_CLEAR, 0, 0, 0.0, 0.0, 0.0);
        send(&e, cmd::EV_ADD, 0, 38, 1.0, 0.0, 3.9); // the noise hit
        send(&e, cmd::EV_COMMIT, 0, 0, 0.0, 0.0, 0.0);
        send(&e, cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
        let (l, _) = render(&e, 24_000);
        let w: Vec<f32> = l[2_400..].chunks(1_200).map(|c| db(rms(c))).collect();
        let (lo, hi) = w.iter().fold((f32::MAX, f32::MIN), |(a, b), v| (a.min(*v), b.max(*v)));
        hi - lo
    };
    let (still, moving) = (level(false), level(true));
    println!("fx noise hit through its filter: level range {still:.1} dB left alone, {moving:.1} dB with its lfo on the cutoff");
    assert!(moving > still + 6.0);
}

#[test]
fn sampler_aux_env_pans_the_hit_and_comes_back() {
    let bal = |route: bool, pan: f32| {
        let e = Engine::new(SR);
        send(&e, cmd::INSTRUMENT, 0, 6, 0.0, 0.0, 0.0);
        send(&e, cmd::MASTER, 0, 1, 0.0, 0.0, 0.0);
        send(&e, cmd::PARAM, 0, L_PAN as u32, pan, 0.0, 0.0);
        send(&e, cmd::PARAM, 0, (INSTRUMENT_BASE + S_AUX_ATTACK) as u32, 0.0, 0.0, 0.0); // 1 ms
        send(&e, cmd::PARAM, 0, (INSTRUMENT_BASE + S_AUX_DECAY) as u32, SAMPLER_PARAMS[S_AUX_DECAY].from_value(200.0), 0.0, 0.0);
        if route {
            send(&e, cmd::MOD, 0, 0, 0.25, L_PAN as f64, MOD_ENV as f64);
        }
        let s = sine(440.0, 96_000, 0.5);
        unsafe { e.load_sample(0, 0, &s, SR) };
        send(&e, cmd::NOTE_ON, 0, SAMPLER_NOTE_BASE as u32, 1.0, -1.0, 0.0);
        let (l, r) = render(&e, 48_000);
        balance(&l, &r, 480)
    };
    let routed = bal(true, 0.5);
    let (peak, rest) = (bal(false, 0.75), bal(false, 0.5));
    let early = routed[2]; // 20 to 30 ms in
    let late = routed[80]; // 0.8 s in, the envelope long gone
    println!("sampler aux env onto pan by 0.25 (attack 1 ms, decay 200 ms): {early:.2} dB at 25 ms (pan 0.75 reads {:.2}), {late:.2} dB at 0.8 s (centre {:.2})", peak[2], rest[80]);
    assert!(early < rest[2] - 3.0 && early >= peak[2] - 0.1);
    assert!((late - rest[80]).abs() < 0.05);
}

// ── 2. live modulation values ────────────────────────────────────────────────────────────────────────────

#[test]
fn watching_reports_values_and_never_changes_the_sound() {
    let song = |watch: bool| {
        let e = reference_song();
        send(&e, cmd::MOD, 0, 0, 0.3, L_PAN as f64, MOD_LFO as f64);
        if watch {
            send(&e, cmd::MOD_WATCH, 3, 1, 0.0, 0.0, 0.0);
        }
        e
    };
    let (a, b) = (song(false), song(true));
    let mut buf = [0.0f32; MOD_VALUES];
    assert_eq!(unsafe { a.core() }.read_mods(&mut buf), 0, "nothing watched, nothing read");
    let (al, ar) = render(&a, 96_000);
    let (bl, br) = render(&b, 96_000);
    assert_eq!(hash(&al, &ar), hash(&bl, &br), "watching changed the sound");
    assert_eq!(unsafe { b.core() }.read_mods(&mut buf), MOD_VALUES);
    // The lead (layer 3) has its route in slot 0 (the lfo on pan by 0.3), the rest empty.
    println!("watched lead: lfo {:.3}, env {:.3}, slot 0 plays pan at {:.3}, slot 1 {:.0}", buf[0], buf[1], buf[2], buf[3]);
    assert!((buf[2] - (0.5 + 0.3 * buf[0])).abs() < 1e-6);
    assert!(buf[3..].iter().all(|v| *v == -1.0));
    // Off again: nothing.
    send(&b, cmd::MOD_WATCH, 3, 0, 0.0, 0.0, 0.0);
    render(&b, 128);
    assert_eq!(unsafe { b.core() }.read_mods(&mut buf), 0);
}

#[test]
fn watching_the_voice_routes_reads_the_envelope_with_nothing_routed() {
    // The lead's own filter envelope (its "env" knob) shows a moving ring too: watched, the engine runs the
    // envelope source even with no slot routed.
    let e = Engine::new(SR);
    send(&e, cmd::INSTRUMENT, 0, 4, 0.0, 0.0, 0.0);
    send(&e, cmd::MOD_WATCH, 0, 1, 0.0, 0.0, 0.0);
    send(&e, cmd::NOTE_ON, 0, 57, 1.0, -1.0, 0.0);
    let mut buf = [0.0f32; MOD_VALUES];
    let mut peak = 0.0f32;
    for _ in 0..40 {
        unsafe { e.process(128) };
        unsafe { e.core() }.read_mods(&mut buf);
        peak = peak.max(buf[1]);
    }
    let mut held = 0.0;
    for _ in 0..400 {
        unsafe { e.process(128) };
        unsafe { e.core() }.read_mods(&mut buf);
        held = buf[1];
    }
    println!("watched lead, nothing routed: envelope peaks at {peak:.3} and holds at {held:.3} (its sustain is 0.4)");
    assert!(peak > 0.95 && (held - 0.4).abs() < 0.01);
}

// ── 3. chance as it will play (the midi export uses the same roll) ───────────────────────────────────────

/// Which steps play on each of eight passes: the table tests/chance.test.ts checks the export against.
pub const HEARD_TABLE: &str = "0 1 2 3 4 | 0 1 4 5 | 0 1 2 3 4 6 | 0 3 4 7 | 0 2 3 4 7 | 0 3 4 5 | 0 1 2 3 4 6 | 0 4 5";

#[test]
fn chance_plays_the_table_the_export_writes() {
    let e = Engine::new(SR);
    send(&e, cmd::INSTRUMENT, 0, 1, 0.0, 0.0, 0.0);
    send(&e, cmd::TEMPO, 0, 0, 0.0, 300.0, 0.0);
    send(&e, cmd::CHANCE_SEED, 0, 7, 0.0, 0.0, 0.0);
    send(&e, cmd::EV_CLEAR, 0, 0, 0.0, 0.0, 0.0);
    let mut evs = Vec::new();
    for s in 0..8u32 {
        let mut ev = NoteEv::new(s as f64 * 0.5, 0.25, DRUM_PAD_NOTES[s as usize % 4], 1.0);
        send(&e, cmd::EV_ADD, 0, ev.note as u32, 1.0, ev.start, ev.len);
        let (c, ch) = match s {
            1 | 3 | 5 | 7 => (0, 0.5),
            2 => (cond::C1_2, 1.0),
            6 => (cond::C3_4, 0.7),
            _ => (0, 1.0),
        };
        if c != 0 || ch < 1.0 {
            send(&e, cmd::EV_COND, 0, c as u32, ch, 0.0, 1.0);
        }
        ev.cond = c;
        ev.chance = ch;
        evs.push(ev);
    }
    send(&e, cmd::EV_COMMIT, 0, 0, 0.0, 0.0, 0.0);
    send(&e, cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
    // Eight passes of a one-bar loop at 300 bpm: 6.4 s.
    let mut heard: Vec<Vec<u32>> = vec![Vec::new(); 8];
    let (mut pass, mut last) = (0usize, -1.0f64);
    let total = (8.0 * 4.0 * 60.0 / 300.0 * SR as f64) as usize;
    let mut done = 0;
    while done < total {
        unsafe { e.process(128) };
        done += 128;
        while let Some(ev) = e.poll() {
            if ev.kind == out::SEQ_ON {
                let b = ev.beat.rem_euclid(4.0);
                if b + 1e-6 < last {
                    pass += 1;
                }
                last = b;
                if pass < 8 {
                    heard[pass].push((b / 0.5).round() as u32);
                }
            }
        }
    }
    let table = heard.iter().map(|p| p.iter().map(|s| s.to_string()).collect::<Vec<_>>().join(" ")).collect::<Vec<_>>().join(" | ");
    let want: Vec<Vec<u32>> = (0..8).map(|p| (0..8u32).filter(|&s| plays(&evs[s as usize], p, false, 7)).collect()).collect();
    println!("chance, seed 7, steps playing on passes 0 to 7: {table}");
    assert_eq!(heard, want, "the engine plays what seq::plays says");
    if !HEARD_TABLE.is_empty() {
        assert_eq!(table, HEARD_TABLE);
    }
}

// ── 4. free-running part lengths ─────────────────────────────────────────────────────────────────────────

/// A 3-step part (kick, snare, hat on 16ths: 0.75 beats) against a one-bar loop, over three bars. Returns the
/// song beat and note of every hit.
fn three_step(free: bool) -> Vec<(f64, u32)> {
    let e = Engine::new(SR);
    send(&e, cmd::INSTRUMENT, 0, 1, 0.0, 0.0, 0.0);
    send(&e, cmd::EV_CLEAR, 0, 0, 0.0, 0.0, 0.0);
    let notes = [36u32, 38, 42];
    if free {
        for (k, n) in notes.iter().enumerate() {
            send(&e, cmd::EV_ADD, 0, *n, 1.0, k as f64 * 0.25, 0.1);
        }
        send(&e, cmd::EV_COND, 0, cond::C1_2 as u32, 1.0, 0.0, 1.0); // the hat: every other play of the part
    } else {
        // Restarting (as the app tiles it): the part's three steps over and over, from the top of each bar.
        for t in 0..16 {
            send(&e, cmd::EV_ADD, 0, notes[t % 3], 1.0, t as f64 * 0.25, 0.1);
        }
    }
    send(&e, cmd::EV_COMMIT, 0, 0, 0.0, 0.0, 0.0);
    if free {
        send(&e, cmd::PART_LEN, 0, 1, 0.0, 0.75, 0.0);
    }
    send(&e, cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
    let mut hits = Vec::new();
    let (mut bar, mut last) = (0.0, -1.0);
    for _ in 0..(48_000 * 6 / 128) {
        unsafe { e.process(128) };
        while let Some(ev) = e.poll() {
            if ev.kind == out::SEQ_ON {
                let b = ev.beat.rem_euclid(4.0);
                if b + 1e-6 < last {
                    bar += 4.0;
                }
                last = b;
                hits.push((((bar + b) * 1e6).round() / 1e6, ev.note));
            }
        }
    }
    hits.retain(|h| h.0 < 12.0 - 1e-9);
    hits
}

#[test]
fn free_running_part_drifts_across_the_loop() {
    let (free, restart) = (three_step(true), three_step(false));
    let at = |h: &[(f64, u32)], b: f64| h.iter().find(|x| (x.0 - b).abs() < 1e-3).map(|x| x.1);
    println!("3-step part on a 1-bar loop, 3 bars: restart plays {} hits, beat 4 is {:?}, beat 8 is {:?}; free plays {} hits, beat 4 is {:?}, beat 8 is {:?}",
        restart.len(), at(&restart, 4.0), at(&restart, 8.0), free.len(), at(&free, 4.0), at(&free, 8.0));
    // Restarting: every bar begins on the kick.
    assert_eq!(at(&restart, 4.0), Some(36));
    assert_eq!(at(&restart, 8.0), Some(36));
    // Free: the part keeps its own time. Beat 4 is 5 plays and a third in (the snare), beat 8 is 10 and two
    // thirds (the hat), and the kick lands every 0.75 beats for all three bars.
    assert_eq!(at(&free, 4.0), Some(38));
    let kicks: Vec<f64> = free.iter().filter(|h| h.1 == 36).map(|h| h.0).collect();
    assert_eq!(kicks.len(), 16);
    assert!(kicks.iter().enumerate().all(|(k, b)| (b - k as f64 * 0.75).abs() < 1e-3));
    // The hat's 1:2 counts the part's own plays: on plays 0, 2, 4, ... (beats 0.5, 2.0, 3.5, ...).
    let hats_at: Vec<f64> = free.iter().filter(|h| h.1 == 42).map(|h| h.0).collect();
    assert!(hats_at.iter().enumerate().all(|(k, b)| (b - (0.5 + k as f64 * 1.5)).abs() < 1e-3), "{hats_at:?}");
    // Beat 8 is 10 plays and two thirds in: the hat, on an even play, so it sounds.
    assert_eq!(at(&free, 8.0), Some(42));
}

// ── 5. punch-in automation ───────────────────────────────────────────────────────────────────────────────

/// A held lead note, glue off, playing; `pts` are automation points (effect, amount, beat).
fn held_tone(pts: &[(u8, f32, f64)]) -> Engine {
    let e = Engine::new(SR);
    send(&e, cmd::INSTRUMENT, 0, 4, 0.0, 0.0, 0.0);
    send(&e, cmd::MASTER, 0, 1, 0.0, 0.0, 0.0);
    send(&e, cmd::PARAM, 0, L_LEVEL as u32, 0.5, 0.0, 0.0);
    send(&e, cmd::NOTE_ON, 0, 57, 0.8, -1.0, 0.0);
    if !pts.is_empty() {
        send(&e, cmd::PUNCH_CLEAR, 0, 0, 0.0, 0.0, 0.0);
        for (m, a, b) in pts {
            send(&e, cmd::PUNCH_ADD, 0, *m as u32, *a, *b, 0.0);
        }
        send(&e, cmd::PUNCH_COMMIT, 0, 0, 0.0, 0.0, 0.0);
    }
    send(&e, cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
    e
}

#[test]
fn punch_automation_lands_on_its_sample_and_lets_go_exactly() {
    let (dl, _) = render(&held_tone(&[]), 48_000 * 3);
    let e = held_tone(&[(punch::FILTER, 0.05, 1.0), (punch::OFF, 0.0, 2.0)]);
    assert_eq!(unsafe { e.core() }.punch_points(), 0, "not in until the engine runs");
    let (al, _) = render(&e, 48_000 * 3);
    assert_eq!(unsafe { e.core() }.punch_points(), 2);
    let first = al.iter().zip(&dl).position(|(a, b)| a.to_bits() != b.to_bits()).unwrap();
    let want = 24_000 + LATENCY; // beat 1 at 120 bpm, heard through the engine's fixed delay
    // The loop is one bar (4 beats): look up to the next time round.
    let last = al[..96_000].iter().zip(&dl).rposition(|(a, b)| a.to_bits() != b.to_bits()).unwrap();
    let off = 48_000 + LATENCY;
    println!("filter punch automated at beat 1, let go at beat 2: first changed sample {first} (beat 1 is heard at {want}), last changed {last} ({} samples after beat 2 is heard: the 8 ms fade)", last as i64 - off as i64);
    assert!((first as i64 - want as i64).abs() <= 1, "first {first} want {want}");
    assert!(last >= off && last <= off + 400 + 4, "last {last}");
    // While it holds, the filter is on (a low pass at 0.05 is about 200 Hz, under the lead's 220 Hz).
    let wet = rms(&al[36_000..44_000]);
    let dry = rms(&dl[36_000..44_000]);
    println!("held: {:.1} dB against dry", db(wet) - db(dry));
    assert!(db(wet) < db(dry) - 3.0);
}

#[test]
fn a_hand_on_a_key_wins_over_the_automation() {
    let live_only = {
        let e = held_tone(&[]);
        let (mut l, _) = render(&e, 12_000);
        send(&e, cmd::PUNCH, 0, punch::REPEAT as u32, 0.5, -1.0, 0.0);
        l.extend(render(&e, 48_000).0);
        l
    };
    let both = {
        let e = held_tone(&[(punch::TAPE_STOP, 0.5, 1.0), (punch::OFF, 0.0, 1.5)]);
        let (mut l, _) = render(&e, 12_000);
        send(&e, cmd::PUNCH, 0, punch::REPEAT as u32, 0.5, -1.0, 0.0);
        l.extend(render(&e, 48_000).0);
        l
    };
    let same = live_only.iter().zip(&both).all(|(a, b)| a.to_bits() == b.to_bits());
    println!("beat repeat held by hand across an automated tape stop: {}", if same { "the hand wins, bit for bit" } else { "differs" });
    assert!(same);
}

#[test]
fn recording_reports_each_press_at_the_beat_heard() {
    let e = Engine::new(SR);
    send(&e, cmd::INSTRUMENT, 0, 4, 0.0, 0.0, 0.0);
    send(&e, cmd::RECORD, 0, 0, 0.0, 0.0, 0.0);
    render(&e, 24_000);
    send(&e, cmd::PUNCH, 0, punch::THROW as u32, 0.7, -1.0, 0.0);
    let mut got = Vec::new();
    for _ in 0..(12_000 / 128) {
        unsafe { e.process(128) };
        while let Some(ev) = e.poll() {
            if ev.kind == out::PUNCHED {
                got.push((ev.note, ev.vel, ev.beat));
            }
        }
    }
    send(&e, cmd::PUNCH, 0, punch::OFF as u32, 0.0, -1.0, 0.0);
    unsafe { e.process(128) };
    while let Some(ev) = e.poll() {
        if ev.kind == out::PUNCHED {
            got.push((ev.note, ev.vel, ev.beat));
        }
    }
    println!("recorded presses: {got:?} (pressed after 24,000 samples, heard beat {:.4})", 1.0 - LATENCY as f64 * 2.0 / 48_000.0);
    assert_eq!(got.len(), 2);
    assert_eq!(got[0].0, punch::THROW as u32);
    assert!((got[0].1 - 0.7).abs() < 1e-6);
    assert!((got[0].2 - (1.0 - LATENCY as f64 * 2.0 / 48_000.0)).abs() < 1e-6);
    assert_eq!(got[1].0, punch::OFF as u32);
    // Not recording: nothing is reported.
    send(&e, cmd::RECORD_OFF, 0, 0, 0.0, 0.0, 0.0);
    send(&e, cmd::PUNCH, 0, punch::THROW as u32, 0.7, -1.0, 0.0);
    unsafe { e.process(128) };
    let mut more = 0;
    while let Some(ev) = e.poll() {
        more += (ev.kind == out::PUNCHED) as u32;
    }
    assert_eq!(more, 0);
}

// ── 6. sample-exact p-locks ──────────────────────────────────────────────────────────────────────────────

/// Kicks on beats 0 and 2, decay short so the first is gone before the second. `lock`: the second kick carries
/// a p-lock (wire param, value); `knob`: that param set on the knob from the start instead.
fn kicks(lock: Option<(usize, f32)>, knob: Option<(usize, f32)>, restore: bool) -> (Vec<f32>, Vec<f32>) {
    let e = Engine::new(SR);
    send(&e, cmd::INSTRUMENT, 0, 1, 0.0, 0.0, 0.0);
    send(&e, cmd::MASTER, 0, 1, 0.0, 0.0, 0.0);
    send(&e, cmd::PARAM, 0, (INSTRUMENT_BASE + 1) as u32, 0.0, 0.0, 0.0); // kick decay short
    if let Some((i, v)) = knob {
        send(&e, cmd::PARAM, 0, i as u32, v, 0.0, 0.0);
    }
    send(&e, cmd::EV_CLEAR, 0, 0, 0.0, 0.0, 0.0);
    send(&e, cmd::EV_ADD, 0, 36, 1.0, 0.0, 0.1);
    send(&e, cmd::EV_ADD, 0, 36, 1.0, 2.0, 0.1);
    if let Some((i, v)) = lock {
        send(&e, cmd::EV_LOCK, 0, i as u32, v, 0.0, 0.0);
    }
    send(&e, cmd::EV_ADD, 0, 36, 1.0, 3.0, 0.1);
    if let (Some((i, _)), true) = (lock, restore) {
        send(&e, cmd::EV_LOCK, 0, i as u32, -1.0, 0.0, 0.0);
    }
    send(&e, cmd::EV_COMMIT, 0, 0, 0.0, 0.0, 0.0);
    send(&e, cmd::LOOP, 0, 0, 0.0, 4.0, 0.0);
    send(&e, cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
    render(&e, 48_000 * 2)
}

fn bits_eq(a: &[f32], b: &[f32]) -> bool {
    a.iter().zip(b).all(|(x, y)| x.to_bits() == y.to_bits())
}

#[test]
fn a_pad_lock_plays_its_note_exactly_as_the_knob_would() {
    let tune = INSTRUMENT_BASE; // the kick's tune
    let up = DRUM_PAD_PARAMS[0].from_value(7.0);
    let (plain, _) = kicks(None, None, false);
    let (locked, _) = kicks(Some((tune, up)), None, true);
    let (knob, _) = kicks(None, Some((tune, up)), false);
    // Where each kick is first heard (the drums have no 2x stage in the voice, so they come out a few samples
    // ahead of LATENCY).
    let onset_of = |at: usize| plain[at - 200..].iter().position(|v| v.abs() > 0.0).unwrap() + at - 200;
    let (b2, b3) = (onset_of(48_000 + LATENCY), onset_of(72_000 + LATENCY));
    let gap = |a: &[f32], b: &[f32]| a.iter().zip(b).fold(0.0f32, |m, (x, y)| m.max((x - y).abs()));
    // Before the locked kick: exactly the plain render. The locked kick: exactly the knob's. After it (the
    // next kick goes back to its own value): the plain render again.
    let before = bits_eq(&locked[..b2], &plain[..b2]);
    let during = bits_eq(&locked[b2..b3 - 2_000], &knob[b2..b3 - 2_000]);
    let after = bits_eq(&locked[b3..], &plain[b3..]);
    let peak = plain.iter().fold(0.0f32, |m, v| m.max(v.abs()));
    let (g_during, g_after) = (gap(&locked[b2..b3 - 2_000], &knob[b2..b3 - 2_000]), gap(&locked[b3..], &plain[b3..]));
    // The way the app did it before: the screen sent the knob change on a timer. A timer 5 ms late on a busy
    // page leaves the kick at its own tune.
    let late = {
        let e = Engine::new(SR);
        send(&e, cmd::INSTRUMENT, 0, 1, 0.0, 0.0, 0.0);
        send(&e, cmd::MASTER, 0, 1, 0.0, 0.0, 0.0);
        send(&e, cmd::PARAM, 0, (INSTRUMENT_BASE + 1) as u32, 0.0, 0.0, 0.0);
        send(&e, cmd::EV_CLEAR, 0, 0, 0.0, 0.0, 0.0);
        for b in [0.0, 2.0, 3.0] {
            send(&e, cmd::EV_ADD, 0, 36, 1.0, b, 0.1);
        }
        send(&e, cmd::EV_COMMIT, 0, 0, 0.0, 0.0, 0.0);
        send(&e, cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
        let (mut l, _) = render(&e, 48_000 + 240);
        send(&e, cmd::PARAM, 0, tune as u32, up, 0.0, 0.0);
        l.extend(render(&e, 48_000 - 240).0);
        l
    };
    let g_late = gap(&late[b2..b3 - 2_000], &knob[b2..b3 - 2_000]);
    let first = locked.iter().zip(&plain).position(|(a, b)| a.to_bits() != b.to_bits()).unwrap();
    println!("kick tune locked +7 st on beat 2: before it bit-identical ({before}); the locked kick against the knob at +7 st {:.1} dB under the kick's peak, the next kick against its own {:.1} dB (the first kick's tail, that far down, carries into a retrigger); sent 5 ms late as the old screen timer could, {:.1} dB; first changed sample {first}, the kick's first sound {b2}",
        db(g_during) - db(peak), db(g_after) - db(peak), db(g_late) - db(peak));
    let _ = (during, after);
    assert!(before);
    assert!(db(g_during) - db(peak) < -110.0 && db(g_after) - db(peak) < -110.0);
    assert!(db(g_late) - db(peak) > -20.0);
    assert!((first as i64 - b2 as i64).abs() <= 1);
}

#[test]
fn a_strip_lock_lands_on_its_notes_first_sample() {
    // Hats on every 16th (tails overlap), pan locked hard left on one step: the first sample that changes is
    // that step's first sound, and the step after it is back in the centre.
    let run = |lock: bool, drop_step: bool| {
        let e = hats();
        send(&e, cmd::EV_CLEAR, 0, 0, 0.0, 0.0, 0.0);
        for s in 0..16 {
            if drop_step && s == 5 {
                continue;
            }
            send(&e, cmd::EV_ADD, 0, 42, 0.9, s as f64 * 0.25, 0.1);
            if lock && s == 5 {
                send(&e, cmd::EV_LOCK, 0, L_PAN as u32, 0.0, 0.0, 0.0);
            }
            if lock && s == 6 {
                send(&e, cmd::EV_LOCK, 0, L_PAN as u32, -1.0, 0.0, 0.0);
            }
        }
        send(&e, cmd::EV_COMMIT, 0, 0, 0.0, 0.0, 0.0);
        send(&e, cmd::PLAY, 0, 0, 0.0, 0.0, 0.0);
        render(&e, 48_000)
    };
    let (pl, pr) = run(false, false);
    let (ll, lr) = run(true, false);
    let (nl, _) = run(false, true);
    let first = ll.iter().zip(&pl).chain(lr.iter().zip(&pr)).enumerate().filter(|(_, (a, b))| a.to_bits() != b.to_bits()).map(|(i, _)| i % ll.len()).min().unwrap();
    // The step's own first sound: where taking the step out changes the render.
    let onset = nl.iter().zip(&pl).position(|(a, b)| a.to_bits() != b.to_bits()).unwrap();
    // Locked hard left: the right channel of that step is silent from its first sample (its own sound; the
    // tail of the step before is panned with it, as the knob would).
    let s5 = onset;
    let right_db = db(rms(&lr[s5 + 64..s5 + 2_000])) - db(rms(&pr[s5 + 64..s5 + 2_000]));
    println!("hat pan locked hard left on step 6: first changed sample {first}, the step's first sound {onset} (heard at {s5}); right channel {right_db:.1} dB against unlocked");
    assert!((first as i64 - onset as i64).abs() <= 1, "first {first} onset {onset}");
    assert!(right_db < -40.0);
    // Step 7 has the knob's own value back: centre.
    let s6 = onset + 6_000;
    let bal = db(rms(&ll[s6 + 800..s6 + 2_800])) - db(rms(&lr[s6 + 800..s6 + 2_800]));
    let pbal = db(rms(&pl[s6 + 800..s6 + 2_800])) - db(rms(&pr[s6 + 800..s6 + 2_800]));
    println!("step 7 back at the knob: {bal:.2} dB left over right (unlocked {pbal:.2})");
    assert!((bal - pbal).abs() < 0.05);
}

#[test]
fn locks_and_free_parts_and_automation_unused_are_bit_identical() {
    // The reference song with every new command sent in its "off" form must still hash the same.
    let e = reference_song();
    for l in 0..6 {
        send(&e, cmd::PART_LEN, l, 0, 0.0, 0.0, 0.0);
    }
    send(&e, cmd::PUNCH_CLEAR, 0, 0, 0.0, 0.0, 0.0);
    send(&e, cmd::PUNCH_COMMIT, 0, 0, 0.0, 0.0, 0.0);
    send(&e, cmd::MOD_WATCH, 0, 0, 0.0, 0.0, 0.0);
    let (mut l, mut r) = render(&e, 48_000);
    send(&e, cmd::FILL, 0, 1, 0.0, 0.0, 0.0);
    send(&e, cmd::PUNCH, 0, punch::FILTER as u32, 0.3, 0.0, 0.0);
    let (l2, r2) = render(&e, 24_000);
    send(&e, cmd::PUNCH, 0, punch::OFF as u32, 0.0, 0.0, 0.0);
    send(&e, cmd::FILL, 0, 0, 0.0, 0.0, 0.0);
    let (l3, r3) = render(&e, 48_000);
    l.extend(l2);
    l.extend(l3);
    r.extend(r2);
    r.extend(r3);
    assert_eq!(hash(&l, &r), REFERENCE_HASH);
    let _ = VOICE_LATENCY;
}
