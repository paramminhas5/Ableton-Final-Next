# Sound shootout: our engine against Vital and the open-source synths

5 Nov 2026. Param asked for our sound to be compared with Vital and other open-source instruments, honestly, and for ours to be made better wherever it measures worse ("rewrite the methods only if they are superior"). This is the method, every number, where they win, what we changed and what is left. Nothing here says ours sounds better: that waits for Param's blind test on `/sound/compare` (not linked, `noindex`).

## The synths and how they ran

All of it ran in a private workspace, each download in its own folder, never in the repo. No plugin code is in this repo; we studied how they work and wrote our own.

| Synth | Version | Got it from | Format | Host |
|---|---|---|---|---|
| Surge XT | 1.3.4 | GitHub release (Linux tarball) | VST3 | pedalboard 0.9.26 |
| Vitalium (Vital's open-source build) | DISTRHO-Ports 2021-03-15 | built from source (meson) | VST3 | pedalboard |
| Odin 2 | 2.4.1 | built from source (CMake; the project's Linux builds aren't on GitHub) | VST3 | pedalboard |
| Dexed | 0.9.8 | GitHub release | VST3 | pedalboard |
| Geonkick | 2.10.2 | Ubuntu 24.04 package | LV2 | our own small LV2 host (`scripts/shootout/lv2host/host.c`, lilv) |
| Dragonfly Hall and Plate | 3.2.10 | Ubuntu 24.04 package | VST3 | pedalboard |
| CHOW Tape Model | 2.11.4 | GitHub release (.deb) | VST3 | pedalboard |

Things a headless host has to do by hand, found on the way: Surge's init patch has its filter slots switched off and only its editor switches them on, so the shootout writes that, and its "Wide" routing, into the patch itself; Odin keeps its oscillator and filter types in the patch, not in host knobs, so they are written there too; Dexed's knobs are whole numbers and a search on their shown text can land a step off (a pitch envelope one step off 50 detuned every note by 1.4 semitones, so they are now set exactly); Geonkick builds its kick on its own thread after a change and stops a kick on note off.

## Method

- **Patches.** Every patch on both sides was written for this test, init-style: no factory presets (their licences are unclear). Ours are in `engine/src/bin/shootout.rs`, theirs in `scripts/shootout/theirs.py`. Same notes, velocities, tempo and length, 48 kHz.
- **Matching.** Unison detune: ours at 0.6 puts the outer saws at about 22 cents either side, so Surge is set to 22 cents and Vital to 11% (both measured with two voices). Brightness: the acid line, the electric piano and the pad were matched by spectral centroid (ours: acid cutoff 0.66 and env 0.8, fm 0.7, pad cutoff 0.86). Reverbs: 2.4 s decay, Dragonfly Hall with our 18 ms predelay, both low cut near 200 Hz, both fed the same dry snare and chord (ours, rendered dry). Tape: CHOW with wow and flutter at 0.25 against our tape echo with no feedback (one pass through the tape, its ducking undone), the delay taken off.
- **Rendering.** Ours natively, through the whole engine with the glue off (the drive and reverbs driven directly where they take outside audio). Theirs through pedalboard in 256-sample blocks, knobs moved every block for the sweeps. "Before" is the engine at a004aee, "after" is this branch.
- **Measurement.** One script for both sides, `scripts/shootout/measure.py`:
  - aliasing: energy off the harmonics of the played note (30 Hz to 20 kHz) against the energy on them, one steady second, Blackman-Harris window, the note's real pitch found from its spectrum;
  - filter sweeps: a saw at note 36, the cutoff swept 100 Hz to 8 kHz over 4 s; in 8192-sample frames, the resonant peak (the strongest harmonic between half and twice the cutoff, the saw's 1/n slope taken off) and its height over the passband, the fundamental's level with the cutoff near 1 kHz (bass loss), and the energy off the harmonics with the cutoff over 2.5 kHz (aliasing from drive). The peak's place is only as fine as the harmonics (about 110 cents at 1 kHz);
  - kicks: pitch from zero crossings under 400 Hz, the share under 100 Hz, time to the peak, the click (energy over 2 kHz in the first 5 ms), time to fall 40 dB;
  - reverbs: RT60 per octave (T20 from the Schroeder integral), first sound, Abel and Huang's normalised echo density (20 ms windows; 1 is noise-like), when it reaches 0.9 and 0.95, modal smoothness (spectral flatness of the tail with the decay taken off, each third of an octave on its own; noise gives 0.56, ringing modes pull it down), left/right correlation in the tail;
  - tape: a 1 kHz sine at five levels; pitch wobble from the analytic signal (peak to peak, main rate, the flutter band's rms) and the harmonics;
  - loudness: BS.1770-4 integrated (pyloudnorm); CPU: one voice or one effect, best of three 10 s renders (theirs through pedalboard, including its small overhead).
- **Blind pairs.** `scripts/shootout/clips.py`: each side set to -16 LUFS (both sides of a pair go down together when -16 would clip: the snare pairs sit at -21.4 and -21.0), 5 ms fades, mp3 at 224 kb/s, 5.0 MB for 48 clips.

## Results

"Ours" is before / after where the shootout changed it. Better is the lower number for aliasing and off-harmonic energy, the higher for echo density and smoothness, nearer 0 for left/right correlation.

### Supersaw lead (Surge XT, Vitalium)

| | Surge XT | Vitalium | ours before | ours after |
|---|---|---|---|---|
| plain saw off the harmonics, note 84 / 96 / 102 / 108 (dB) | -85.3 / -82.7 / -84.7 / -77.3 | -88.6 / -91.0 / -89.0 / -88.8 | -56.4 / -51.7 / -49.0 / -49.0 | -74.1 / -70.0 / -68.0 / -67.2 |
| the same with our svf circuit (linear) | | | | -88.0 / -90.5 / -96.1 / -88.4 |
| the oscillator alone at 96 kHz (tests/shootout.rs) | | | -57.9 / -55.3 / -52.6 / -53.3 | -88.6 / -90.9 / -88.9 / -88.7 |
| supersaw left/right correlation | 0.357 | 0.219 | 1.000 | 1.000 |

They win, and partly still do. Our PolyBLEP saw was 30 dB dirtier than theirs. The oscillator is now as clean as Vital's and cleaner than Surge's (-89 dB at every note), and through the svf circuit the whole synth measures -88 to -96 dB. Through the default prd circuit it is -67 to -74 dB: what is left comes from the ladder's soft clip (now anti-aliased, 12 dB better than before, see below). Width is theirs outright: our synth voices are mono, and their supersaws spread the voices across the stereo field.

### Filters (Surge XT and Vitalium against prd, ms2, svf)

Resonance is each synth's own knob at 30, 60 and 90%, so the heights compare how far each knob goes, not one circuit against another at equal settings.

| | peak over passband at 0.3 / 0.6 / 0.9 | peak place at 0.9 (cents from the cutoff) | bass at 1 kHz, 0.3 to 0.9 | off the harmonics over 2.5 kHz, driven |
|---|---|---|---|---|
| ours prd (ladder) before / after | +0.3 / +5.0 / +13.7, after +0.3 / +4.9 / +13.4 | -104 | -2.0 dB | -96 / -93 / -90 dB |
| Surge vintage ladder | +4.2 / +12.5 / +39.8 | -21 | -6.7 dB | (no drive) |
| Vital ladder 24 dB | +5.2 / +14.6 / +21.1 | -94 | -2.4 dB | -105 / -98 / -95 dB |
| ours ms2 | -0.4 / +1.3 / +5.7 | -109 | 0.0 dB | -72 / -70 / -66 dB |
| Surge K35 (heavy saturation when driven) | +0.1 / +2.8 / +12.5 | -28 | 0.0 dB | -60 / -55 / -43 dB |
| Vital analog 12 dB | +1.2 / +6.3 / +23.2 | -78 | -5.2 dB | -69 / -68 / -67 dB |
| ours svf | +3.4 / +11.5 / +17.1 | -19 | 0.0 dB | -74 / -75 / -72 dB |
| Surge OB-Xd 12 dB | +0.1 / +3.0 / +13.8 | -25 | 0.0 dB | -69 / -69 / -69 dB |
| Vital digital 12 dB | +0.9 / +11.3 / +19.9 | -76 | -7.4 dB | -55 / -49 / -50 dB |

Driven (each synth's own drive, so not equal amounts), our prd and svf are cleaner than everything of theirs but Vital's ladder, and our ms2 is about even with Vital's analog and well ahead of Surge's K35 (ADAA and 2x oversampling around our drive). Ours keeps its bass with resonance better on the 2-pole circuits. Where they win: range. Surge's ladder rings to +40 dB and Vital's analog to +23 dB at 90% where our prd reaches +13.7 and our ms2 only +5.7; and our ladder's peak sits about a semitone under its cutoff (one harmonic down at this resolution; Vital's does too, Surge's doesn't). No one's filter self-oscillated over the saw clearly enough for the detector at 100%, so self-oscillation pitch tracking could not be measured this way. Not changed: the resonance law and the ladder's tuning would move every saved song's sound, and only an ear can say whether more ring is better.

### Acid bass (Odin 2)

Matched by brightness: centroid 10th / 50th / 90th percentile Odin 333 / 641 / 1534 Hz, ours 272 / 586 / 1633 (before) and 270 / 583 / 1685 Hz (after). Loudness -20.0 against -26.2 LUFS (matched on the page). Our bass now uses the minBLEP saw too. Nothing else separates them by measurement; this pair is for ears.

### FM electric piano and bell (Dexed)

| | Dexed | ours before | ours after |
|---|---|---|---|
| piano centroid 10 / 50 / 90 (Hz) | 679 / 719 / 762 | 502 / 636 / 694 | same |
| bell centroid 10 / 50 / 90 (Hz) | 2494 / 4714 / 7018 | 2632 / 4625 / 8166 | 2636 / 4635 / 8186 |
| bell strike off the harmonics (first 250 ms of the first note) | -59.5 dB | -56.2 dB | -56.2 dB |

Close. Dexed is 3 dB cleaner on the strike. Ours has only whole-number ratios (and 0.5), so the inharmonic bells a DX7 is known for (ratio 3.5 and the like) aren't possible yet.

### Wavetable pad (Vitalium)

Our chord synth's table has no position knob (it plays its first frame, a sine), so the pad is the lead's table (saw frame) on three layers. Aliasing of the table's saw at notes 84 / 96 / 102 / 108: ours -80.3 / -75.1 / -88.0 / -70.5 dB before, -87.7 / -88.2 / -88.3 / -84.8 after (the ladder's clip); Vital's saw table -88.6 / -91.0 / -89.0 / -88.8. Both mono with one voice. Centroid ours 1723 Hz, Vital 1858 Hz.

### 808 and techno kicks (Geonkick)

Geonkick's kick was shaped after ours (pitch points from our measured sweep), so the pitch matches by design: 808 at 5 / 20 / 100 / 300 ms Geonkick 210 / 93 / 48 / 46 Hz, ours 224 / 84 / 48 / 46 Hz. Differences that are the instruments': ours has a shaped click (-28 dB over 2 kHz in the first 5 ms against Geonkick's -62, a pure sine) and a faster attack (2.2 ms to the peak against 10.7 ms); the techno kick through Geonkick's distortion is clipped flat (crest 0.2 dB) where ours keeps 5.8 dB. Low end under 100 Hz: -1.1 dB ours, -1.0 Geonkick. Nothing measured worse; unchanged.

### Hall and plate (Dragonfly)

| | Dragonfly Hall | ours hall before | ours hall after | Dragonfly Plate | ours plate |
|---|---|---|---|---|---|
| RT60 250 / 1k / 4k / 8k (s) | 2.99 / 2.39 / 1.98 / 1.31 | 2.52 / 2.39 / 1.49 / 0.84 | 2.78 / 2.47 / 1.55 / 0.84 | 2.43 / 2.38 / 2.20 / 1.88 | 2.46 / 2.52 / 2.10 / 1.61 |
| first sound | 18.0 ms | 65.5 ms | 18.2 ms | 56.0 ms | 16.9 ms |
| echo density, first 50 ms / 50 to 100 ms | 0.84 / 0.70 | 0.47 / 0.68 | 0.87 / 0.96 | 0.87 / 0.92 | 0.51 / 0.54 |
| density reaches 0.9 / 0.95 | 45 / 45 ms | 145 / 170 ms | 30 / 55 ms | 35 / 70 ms | 190 / 330 ms |
| modal smoothness (noise 0.56) | 0.453 | 0.380 | 0.475 | 0.479 | 0.457 |
| left/right correlation in the tail | -0.005 | 0.139 | 0.007 | 0.165 | 0.000 |

The hall was the known gap and measured worst: a 47 ms hole before anything, and a slow fill. Now it starts at the predelay and is denser in its first 100 ms than Dragonfly's, smoother, and uncorrelated; Dragonfly's reaches 0.95 sooner (45 against 55 ms) and keeps more of its top (8 kHz 1.31 against 0.84 s: ours darkens on purpose). The plate is unchanged and Dragonfly's wins on density: ours is Dattorro's tank, which starts sparse; it wins on width and first sound. A first try at a denser plate (extra tank taps, an onset from the diffused input) made it denser (0.69 in the first 50 ms) but less smooth (0.441), so it was not kept.

### Tape (CHOW Tape)

| input level | -24 / -12 / 0 dBFS |
|---|---|
| CHOW: 3rd harmonic | -51.2 / -40.2 / -22.8 dB |
| ours: 3rd harmonic | -56.5 / -33.2 / -16.3 dB |
| CHOW: 5th harmonic | -69.2 / -63.3 / -41.1 dB |
| ours: 5th harmonic | -91.8 / -63.0 / -28.8 dB |
| 2nd harmonic | both under -99 dB (both symmetric) |
| wow peak to peak, main rate | CHOW 10.35 cents at 0.61 Hz; ours 10.21 cents at 0.61 Hz (our 0.55 Hz wow, at this resolution) |
| flutter band rms | CHOW 0.33 cents; ours 1.88 cents |

Different, not better or worse by a number: CHOW's hysteresis is gentler at the top (its third harmonic grows 28 dB over 24 dB of input, ours 40 dB, a harder knee) and richer low down; our flutter is about six times deeper at these settings. Both even-free. A hysteresis model (Jiles-Atherton, solved per sample, as Chowdhury's 2019 DAFx paper describes) is the technique to learn from; not built here.

### CPU

Each as a share of one core, one voice or one effect. Theirs through pedalboard (best of three 10 s renders, including pedalboard's own overhead; Surge processes voices in blocks, so its one-voice figures are not consistent with each other); ours natively (`cpu_per_voice` in tests/shootout.rs, best of five). The machine was shared with other jobs, so take these as rough.

| | theirs | ours |
|---|---|---|
| saw, one voice | Surge 0.78%, Vital 0.88% | lead 1.18% |
| supersaw, one note | Surge 1.07%, Vital 0.93% | lead 1.04% |
| saw through a ladder, one voice | Surge 0.31%, Vital 1.48% | (the lead above has its ladder) |
| bass / acid voice | Odin 2 init 0.72% | bass 0.55% |
| fm, one voice | Dexed 0.09% | (on the chord synth) |
| hall | Dragonfly 1.22% | 1.26% (0.63% before the shootout) |
| plate | Dragonfly 0.18% | 0.49% |
| tape | CHOW 2.66% | tape echo 0.23% |

Ours: the hall alone 0.63 to 0.81% of a core before, 1.25 to 1.33% after (tests/shootout.rs, best of five). The whole engine (engine/tests/bench.rs, the full eight-layer song, before and after run alternately three times, best of five each): before 22.3 / 22.1 / 21.6%, after 23.6 / 24.7 / 23.0% of one core (about 1.8 points, 8%: the hall 0.6, the rest the minBLEP and the ladder's clip). The first version of the ladder's ADAA worked out two logs every sample and cost 5 to 7 points; it now works them out only on fast steps (the midpoint is within -110 dB otherwise), and a saw alone skips the pulse's minBLEP work.

## What changed in the engine

All three are our own code, written from the papers; the tests are in `engine/tests/shootout.rs`, each against a frozen copy of the old code.

1. **A faster-filling hall** (`fx::Hall`): early reflections (24 taps a side at their own times on the diffused input, after three more allpasses, over 80 ms), an allpass inside every line's loop (the loss counts it in the lap, so the time knob stays honest), the input into each line with its own sign, and each side reading all eight lines, and again part way along, with orthogonal signs. Default changed: yes, the hall is the default reverb, and every hall measure moved the right way (first sound 65.5 to 18.2 ms, density over the first 50 ms 0.44 to 0.86, 0.9 reached at 155 to 30 ms, smoothness 0.380 to 0.475, left/right 0.092 to 0.005), its RT60 within 5% of before at 1 kHz (2.33 to 2.45 s) and its loudness on a hit the same (-31.98 to -32.02 LUFS). The first 500 ms of an impulse carry 2 dB more (it arrives sooner), so `tests/sound.rs`' impulse-level check now allows 2.5 dB and says why. The fx instrument's own reverb is this hall too.
2. **minBLEP saws and pulses** (`dsp::osc::MinBlepOsc`, on the chord synth, lead and bass): a 12-zero-crossing Blackman-Harris sinc made minimum phase through its real cepstrum, integrated, stored 64 points a sample; no look-ahead, so no added latency; its small dc taken off. Off the harmonics at 96 kHz: -53 to -70 dB before, -88.6 to -91.9 dB after at notes 36 to 108, saw and pulse. Default changed: yes, every synth's saw and pulse; same level within 0.3 dB (PolyBLEP dulled the top octave a little, the minBLEP keeps it). The drums' 808 metal and the fx synth keep PolyBLEP (their partials are low or noisy).
3. **The ladder's clip anti-aliased** (`dsp::filter::Ladder`): only what the clip takes from a straight line goes through first-order ADAA, so small signals pass with no added delay, and only on fast steps (4.9 ns a sample more than before, against 17.8 ns for ADAA on every sample). Open filter, notes 84 / 96 / 108: -62.0 / -57.4 / -54.7 dB before, -74.1 / -70.0 / -67.1 after; the resonant peak within 0.35 dB at 0.3 / 0.6 / 0.9. Default changed: yes (the prd circuit is the default); the cost is that the sweeps' noise floor over 2.5 kHz at note 36 rose from -90.9 to -88.4 dB, far under anything else in the sound.

Every engine test passes (`cargo test --release`). Clips: the 16 `/sound` "now" clips these change were re-rendered (bass, both filter circuits, lead, pad, the three resonators, table, feedback, phase, hall, echo, drive, the song twice).

## Left over, with numbers

- **Stereo voices.** Their supersaws are wide (left/right 0.22 Vital, 0.36 Surge), ours is mono (1.00). It needs the synth to hand the strip two channels (eq, drive and crush on both), the biggest of these to build.
- **Resonance range and the ladder's tuning.** Surge's ladder rings to +40 dB where ours stops at +14, ms2 reaches only +5.7 dB at 90%, our ladder's peak sits about a semitone low. Each changes saved songs' sound, so it wants Param's ear first.
- **The plate's density** (0.51 against 0.87 in the first 50 ms), **tape hysteresis**, **fm ratios off the whole numbers**, **a position knob on the chord synth's table**.
- **Aliasing through prd** is still 10 to 20 dB behind theirs at the top of the keyboard (-67 against -77 to -89 dB): a second-order ADAA or running the ladder's clip at 4x would be the next step.
