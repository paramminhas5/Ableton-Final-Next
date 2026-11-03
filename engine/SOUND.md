# CCD engine: how it makes sound, and the plan to make it world class

Written 3 Nov 2026. Lives next to the code (`engine/SOUND.md`) and in the project (`ccd/engine-sound.md`).

## How the expensive plugins do it

There is no secret library. The best instruments come from a handful of well-published methods, applied with a lot of care, and then tuned by ear for a long time.

1. **Model the circuit, not the sound.** Analogue-style synths (u-he Diva and Repro, Arturia, UAD) turn the real circuit into equations and solve them every sample. Zero-delay-feedback filters (Zavalishin, "The Art of VA Filter Design"), nonlinear stages solved with a few Newton iterations, and wave digital filters for whole circuits. The character (a filter that screams, bass that thins as resonance rises, drive that thickens) comes out of the maths instead of being faked.
2. **No aliasing anywhere.** Band-limited oscillators (BLEP, minBLEP, mipmapped wavetables), and 2x to 8x oversampling around anything nonlinear. This is the biggest audible gap between cheap and expensive digital synths: harsh, inharmonic fizz on high notes and heavy drive.
3. **Imperfection on purpose.** Each voice gets slightly different component values, oscillators drift, envelopes vary a little, there is a noise floor. Two notes never sound identical, which is why hardware feels alive.
4. **Recordings, for acoustic and sampled sounds.** Pianos, kits and pads from top libraries are mostly the recording: great rooms, mics and players, many velocity layers, round robins, release samples, careful editing. Code plays them back; it cannot invent them.
5. **Effects tuned for years.** Great reverbs (Lexicon, Valhalla) are modulated delay networks whose numbers were tuned by ear. Great EQs and compressors match analogue curves and program-dependent behaviour.
6. **Neural captures (the newest layer).** Small networks trained on real hardware (Neural Amp Modeler, RTNeural) capture amps, pedals, preamps and consoles that are hard to model by hand.
7. **Measure, then listen.** Frequency response, aliasing, timing and CPU are measured. The last stretch is blind A/B against hardware and the best plugins.

## Open-source references we study

Licences matter: GPL code can't be copied into a closed app, so for those we learn the technique and write our own. MIT/BSD code can be used with credit.

- Surge XT (GPL-3): filters, oscillators, effects from a mature open synth. Study only.
- Vital (GPL-3): wavetable engine and anti-aliasing. Study only.
- Airwindows (MIT): hundreds of small, characterful effects and saturation ideas.
- chowdsp_wdf (BSD-3): wave digital filter library for circuit models.
- RTNeural (BSD-3) and Neural Amp Modeler (MIT): real-time neural inference and captures.
- Ableton Link 4.1.1 (GPL or commercial licence from Ableton): tempo, and Link Audio to stream into Live.
- Papers: DAFx proceedings, Zavalishin, Välimäki, Julius O. Smith (CCRMA), Pirkle.

## What is in the engine today

- Clock: sample-accurate. Notes start on the exact sample at any buffer size (tested at 1 to 1024 frames). The 2x stages add a fixed 1 ms, and the sequencer fires 1 ms early to cancel it, like a DAW's delay compensation, so the timing never shifts when a knob moves.
- Bass: PolyBLEP saw and pulse plus a sine sub, run at 2x and decimated with a 49-tap half-band filter (about -90 dB stopband). A 4-pole ladder with resolved zero-delay feedback, soft-clipped feedback, self-oscillation, bass compensation. Constant-time glide on legato, last-note priority, RC-shaped envelopes that never click on retrigger, slow drift.
- Drum rack: 16 synthesised pads (808-style metal for hats and cymbals, pitch-swept kick and toms, layered snare, three-burst clap, FM blip, sweep, reverse) with tune, decay, drive, level per pad and a hat choke. Built so a sampled pad can replace any of them.
- Strip per layer: low cut, 3-band eq (analogue-style shelves and bell), 2x oversampled drive, crush, tilt tone, duck, equal-power pan, fader law with 0 dB at 75%.
- Returns: ping-pong echo darkening on each repeat, an 8-line FDN reverb with Hadamard mixing and input diffusion.

## The plan

In build order, folded into the existing steps:

1. **Filters, step 1 to 2.** Ladder with a nonlinearity in every stage, solved by Newton iteration each sample (the approach behind Diva's best modes). Add a diode ladder (303 character) and an OTA state variable (SEM/Oberheim) as filter types. Pitch-tracked self-oscillation you can play.
2. **Oscillators, step 3.** Mipmapped wavetables for leads and pads, minBLEP with hard sync and FM, per-voice slop and unison with drift.
3. **Drums, step 1 to 3.** Circuit-style 808 and 909 voices (bridged-T kick, proper 909 noise and metal). A sampler with 24-bit multisamples, velocity layers, round robin and release samples. The kits themselves need recording or licensing: that is the open "sound sources" decision.
4. **Effects, step 2.** Modulated FDN reverbs (room, plate, hall) with early reflections, tape echo with wow, flutter and saturation, a program-dependent glue compressor, a 4x oversampled true-peak limiter. Low-latency IIR half-band filters to bring the 1 ms of oversampling delay down to about 0.1 ms.
5. **Character, step 4 onward.** Neural captures of real gear (a console, a tape machine, a drive pedal) run inside the engine.
6. **Expression, step 1 to 3.** Velocity from how you hit, pressure after the hit, per-note slide (MPE), MIDI/MPE controllers.
7. **Proof, every step.** The `render` tool plays the same MIDI through our engine. You record the same MIDI through Live's instruments. We compare spectra and do blind A/B. Aliasing, click, timing and CPU tests run on every build.

## What can and cannot be promised

Synthesis (bass, leads, pads, synth drums, effects) can reach the level of Live's own instruments and beyond, because the methods are known and testable. Sampled instruments are only as good as their recordings. And "better" is decided by ears, so every sound goes through A/B with you before it ships.
