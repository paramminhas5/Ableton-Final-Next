# CCD School engine 2: what we build, why people will hear it, and what we can say

Written 5 Nov 2026 for Param, before any engine code changes. It builds on `ccd/engine-sound.md` (3 Nov) and two research reports with sources for every claim: `design/research/engine-sound.md` (sound) and `design/research/instrument-ui.md` (instrument screens). The build status of each item is just below; every number in it comes from `engine/tests/sound.rs` (run `cargo test --release --test sound -- --nocapture` to see them).

## Build status

CPU is from `engine/tests/bench.rs` (a full eight-layer song, two of each synth, analysis on, 128-frame blocks, best of five runs, native) on a shared build machine, so take the worst-block figures as rough.

- **1. ADAA drive:** done (ac9d38d). Heavy drive on high notes 13 to 23 dB cleaner.
- **2. Voice cards:** done (f10fa02).
- **3. 808 hats and cymbals:** done (b4c598a).
- **4. Supersaw:** done (b4c598a).
- **5. 808 kick:** attack bump, sigh, shaped click, hold and second ring done (rounds 1 and 2); three body shapes: see below.
- **6. Master chain:** done. The glue has a ratio switch (2, 4, 10 to 1; static gain reduction within 0.05 dB of the curve at each), auto release (two envelopes, kept), a fourth-order high-pass on what it listens to (90 Hz by default, off at the bottom of its knob) and a dry/compressed mix. Pumping on a kick under a held chord (the chord's average dip per beat): old glue 1.32 dB, new at 4:1 hearing everything 1.44 dB, at 4:1 with the 90 Hz cut 0.98 dB, the new default (2:1, 90 Hz) 0.66 dB; half mix cuts 10:1 pumping by a third. The true-peak limiter at -1 dBTP is unchanged. A loudness meter to ITU-R BS.1770-4 / EBU R 128 (K-weighting, momentary, short-term, gated integrated) reads the EBU Tech 3341 cases 1 to 5 within 0.02 LU and BS.1770's one-channel 997 Hz figure at -3.01; the old K-weighting read 0.04 dB low (the high-pass numerator was normalised twice) and is fixed for the layer meters too. The master reports momentary, short-term and integrated loudness to the mix screen. Studio has a wav export (offline render through the same engine, -14 LUFS integrated, or -9 LUFS "loud wav" with shift held), landing within 0.03 LU of target with the true peak at or under -1.0 dBTP on the standard meter. Clip: "glued song" (the whole song with the glue pushed hard). CPU: 21.4% before, 21.6% after.

## The short version

Expensive software instruments are not magic. Reviewers and the people who build them point at the same handful of things, and each one is a known method we can build, measure and play to you side by side. We do the twelve that people hear most, in the order that gives the most sound for the work, and we prove each one twice: a measured test in the engine, and an a/b clip on a "hear the difference" page where anyone can switch between the old engine and the new one on the same phrase.

The before clips are already rendered from today's engine (`public/audio/ab/before`, twelve phrases: kick, snare, clap, hats, kit, bass, lead, pad, reverb, echo, drive, the whole song). Every change gets rendered into an after set, so the page is honest by construction.

## Where the engine is today

Good bones, and honest about the gaps.

- **Already right:** sample-accurate timing at any buffer size; 2x oversampling with a clean half-band decimator; zero-delay-feedback ladder and state-variable filters (the same filter maths u-he and Ableton use); band-limited oscillators; an 8-line reverb with Hadamard mixing; a glue compressor and true-peak limiter; measured tests for every knob we show. As of today: an lfo, a 2-operator fm voice and a separate filter envelope on the lead and chords, each with a test that proves it changes the sound.
- **What a trained ear hears now:** drive and crush fizz when pushed (aliasing, the classic "cheap digital" sound); every voice is identical to the last, so chords and pads sound static; the hats are a filtered mix of square waves and noise, which reads as generated; the kick is one pitch sweep with no attack shape; unison detune is a straight line rather than the curve that makes supersaws open up; there is one filter character; the reverb has no modulation, so long tails ring.

## Why some synths sound expensive

From the research, five things, each with sources:

1. **Filters solved properly, with the distortion inside them.** Zero-delay feedback keeps resonance correct when the filter moves fast; saturation in each stage gives it character. u-he says this is why Diva's resonance sounds "more authentic"; reviewers A/B'd Diva against a restored Minimoog and it "held its own".
2. **No aliasing around anything that distorts.** Anti-derivative anti-aliasing (ADAA) plus 2x oversampling makes even a hard clipper "practically a non-issue". This is the single biggest cheap-versus-expensive tell.
3. **Every voice slightly different.** Ableton built Drift around this: each voice gets its own small random detune of oscillators and filter, seeded per instance so a saved sound recalls exactly. Diva calls the same thing trimmers. A reviewer calling an emulation's oscillators "too stable" is describing its absence.
4. **Drive and the master chain.** Roland's TR-8S got "the master distortion and drive lack warmth"; the Digitakt II "just sounds immense", credited to its drive and compressor. The last stage decides whether a box sounds digital or big.
5. **Drums from the circuit, not from noise.** The published analysis of the 808 shows its hats have no noise generator at all: six square waves at measured, inharmonic frequencies, band-passed near 3.4 kHz and 7.1 kHz, with a resonant peak near 10.5 kHz. The kick has a 6 ms pitch bump that makes the attack punchy and a slow pitch "sigh" over the tail.

## The twelve, in build order

Each line: what it is, what you will hear, how we prove it, rough size.

1. **ADAA on every drive, crush and clip stage.** You will hear drive add warmth and harmonics instead of fizz, most on bass and kick. Proof: an aliasing test (energy above the harmonics of a 3 kHz tone through full drive, before and after), and the drive clip. Days.
2. **Every voice its own voice card.** Small, slow, per-voice differences in pitch, filter and envelope times, seeded per song so it recalls exactly. You will hear chords beat gently and pads breathe. Proof: a test that two voices on the same note differ by a measured amount and the same seed gives identical audio; the pad clip. Days.
3. **808-measured hats and cymbals.** The six measured square-wave partials, the two band-passes, the resonant top. You will hear metal, not hiss. Proof: spectrum peaks at the band-pass centres; the hats clip. Days to a week.
4. **The supersaw detune curve.** The JP-8000's measured detune law, centre and side mix laws, random start phases. You will hear unison open up wide with an obvious sweet spot. Proof: the measured offsets in a test; the lead clip. Days.
5. **A kick built from the 808 circuit.** Shaped click, the 6 ms attack bump, the slow sigh, decay that rings out rather than fades, a hold stage, three body shapes. You will hear a real attack and a pitch that breathes. Proof: pitch track over time against the paper's shape; the kick clip. One to two weeks.
6. **The master chain done properly.** An SSL-style glue (ratios 2, 4, 10, auto release, a low cut on what it listens to, a mix knob), a true-peak limiter that checks between samples at -1 dBTP, a loudness meter, and exports at -14 LUFS so a learner's song plays on Spotify exactly as it did in the lesson. You will hear the song glue and get loud without pumping. Proof: true-peak and LUFS tests against the broadcast standard; the song clip. One to two weeks.
7. **Three filter characters.** Keep the ladder (warm, loses bass as resonance rises), add an MS-20 style (screams when pushed) and an Oberheim-style 2-pole (smooth, sweet). Drive before the filter, asymmetric, with a second stage near +6 dB like Drift. You will hear three genuinely different personalities on the same bass line. Proof: frequency response per type, resonance stability under a fast envelope; a three-way bass clip. Two to three weeks.
8. **Drum voices with their own noise layer.** Tone and noise each get their own filter and envelope, and pitch can sweep, wobble or randomise per hit. You will hear snares with separate snap and body, and metallic percussion. Proof: tests per layer; the snare clip. One to two weeks.
9. **A modulated plate and a smoother hall.** A Dattorro plate and the current hall with slow modulation and darker, frequency-dependent decay. You will hear smooth tails that don't ring or muddy the kick. Proof: decay time per band, modal density; the reverb clip. Two to three weeks.
10. **Plucks, mallets and keys from a resonator.** A tuned comb and two-resonator mode (the idea behind Ableton's Collision and Elektron's comb filters). You will hear plucked strings, marimbas and a surprisingly convincing piano from a click. Proof: pitch accuracy across the keyboard; a pluck clip. Two weeks.
11. **A tape and analogue delay.** Wow and flutter that depend on delay time, repeats that darken, the ducking of old bucket-brigade units. You will hear dub delays that feel like hardware. Proof: modulation depth versus delay time; the echo clip. One to two weeks.
12. **A clean wavetable oscillator, fm feedback and phase distortion.** One band-limited table per octave so high notes stay clean; fm feedback that goes from saw to noise musically; the Casio CZ trick of filter sweeps with no filter. Proof: aliasing tests up the keyboard; a lead clip. Two weeks.

**Enablers you won't hear but need:** four voices per SIMD lane (Ableton rewrote Drift's filter this way) so phones have room for all of the above; staying at 2x oversampling and keeping 4x for the limiter only; a compute ceiling of about 1 ms per audio block.

**Future-ready, after the twelve:** per-note pressure and slide from multi-touch (MPE), custom tunings, a "pro" desktop mode with neural saturation. On-device stem separation (pull the kick out of a reference track and compare it to yours) is a strong lesson idea, but it needs a graphics card and runs offline, so it is a later feature.

**Deliberately not doing:** spectral resynthesis (Serum 2's headline, large, not something a learner hears first), and claiming "component-level circuit simulation". We don't do that, and the research shows how fast that claim gets tested.

## The instruments and sampler: a world apart

The research's twelve interface moves, applied to every instrument screen. In build order:

1. **Touch to reveal.** Any knob or pad you touch shows its name and value on the screen, beside your finger, never under it.
2. **Colour binds control to picture.** Each knob's colour is the colour of the line it moves on the screen.
3. **Dark until used.** Whatever isn't doing anything is dim; turning it up lights it.
4. **Three honest moving pictures, everywhere:** the envelope shape with a dot running along it on every note, the filter curve whose knee moves with cutoff, the lfo dot travelling its wave. Driven by the engine's real state, not a guess.
5. **Instant slices.** A sample lands already sliced, one slider re-slices live, every slice on a numbered pad that flashes as it plays, one-tap undo.
6. **Hold a step, turn a knob:** that step alone takes the value, and turns a second colour (Elektron's parameter locks, Move's step automation).
7. **Capture instead of record.** The app always listens; play first, keep it after. Ghost notes until you keep them.
8. **Pads that feel like pads.** Velocity from where you tap, 48 px minimum, a ring flash on every hit.
9. **Phone-safe note editing.** Tap to add, hold to select, an edge handle for length (drag it up and down for velocity), pinch for the grid, and a strip of buttons for nudge, transpose and quantise.
10. **DJ waveforms coloured by frequency** with bar numbers, phrase labels and a green or amber key badge; cutting the low eq takes the red out of the wave.
11. **Fill and randomise with an amount,** for drums, arpeggios and the note grid.
12. **The lesson lights one control.** Everything else dims, every hit gets a green, amber or red verdict, and practice loops speed up as you get it.

## What we can say in marketing (and what we can't)

Supported by the research and provable by our own tests:
- "Filters solved the way u-he and Ableton solve them: zero-delay feedback, with the distortion inside the filter."
- "Drums built from the measured 808 circuit, not filtered noise."
- "Anti-aliased saturation everywhere, so drive adds harmonics, not hash."
- "Every voice is a slightly different voice card, like a real polysynth."
- "A loudness-aware master: your song sounds the same on Spotify as it did in the lesson."
- "Hear the difference": a public a/b page with our old engine and new engine on the same phrases, level-matched so loudness never decides it.

Not supported, so we don't say it: "component-level circuit simulation", "sounds identical to an 808", "better than Ableton". If Param's ears say a sound beats a reference in a blind test, we can say what was tested and how.

## How we'll know it worked

- Every item has an engine test with a number in it, run on every build.
- Every item adds an after clip; the a/b page plays before and after on the same phrase, level-matched.
- You do a blind a/b on each before it ships (the rule in `school-process.md`: never claim a sound matches Ableton without an ear test).
- Performance: the full eight-layer song stays under the compute ceiling on a mid-range Android phone and an older iPhone.

## Decisions for Param

1. Order: start with the four cheapest and most audible (ADAA, voice cards, 808 hats, supersaw), then the kick and the master chain. Or reorder.
2. The a/b page: public from day one (marketing), or private until the first four land.
3. Filter characters: three names a learner sees. Proposal: "warm" (ladder), "scream" (MS-20 style), "smooth" (Oberheim style).
4. Export loudness: -14 LUFS by default, with a "loud" option for club play.
