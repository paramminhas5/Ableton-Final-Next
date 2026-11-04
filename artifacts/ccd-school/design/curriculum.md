# CCD School curriculum: worlds, paths and lessons (plan, 5 Nov 2026)

What this is: the full plan for every world, path and lesson, what each lesson adds to the song, what is kept, what is archived, what code each one needs, and the order we build in. Project copy: `ccd/school-curriculum.md`. It follows `school-process.md` (how a lesson is made) and the 4 Nov decisions (basics, then producer, then dj; one part per lesson; sound on arrival; build, add to song, optional stripe challenge).

Param's calls that shape it (4 Nov, 23:31 and 23:51): the new lessons replace the old paths; the old lessons stay as an archive; the song gets an automatic name the learner can rename; in dj lessons either deck can carry your song or a track from a bank.

## The idea

One song runs through all three worlds. Basics gives it its notes and your ears. Producer gives it its groove, its sound and its shape. DJ plays it out, with other tracks, like at a CCD night. Each world has five paths of four lessons: 20 lessons a world, 60 in all, each 6 to 9 minutes. Twenty short, finished, playable lessons per world is a course someone can actually complete, and every one of them leaves something in the song.

The old 171 lessons do not go away. They move into an archive chapter in each world (not in the journey, not counted in progress, reachable from "see all" and search), so nothing a learner started is lost and the Ableton and rekordbox reference stays available. Nothing in them is rewritten; when a new lesson covers the same idea it takes the old slug where that makes sense, so progress and trophies keyed to the slug keep working.

## What the song has by the end of each world

- **after basics:** tempo set, a melody in a scale you chose, played with dynamics, chords under it, a bass line on the roots, and an arrangement with an intro and a drop. You can name notes, intervals and chords by ear.
- **after producer:** kick, hats, clap, bass that makes room for the kick, a shaped lead, chords, fx, a mixed and glued master, sections, fills, and an export to Live. Drums from real recordings or synthesis, your choice.
- **after dj:** your song blended with bank tracks in a short set: matched by ear, phrased, eq'd, cued, with an energy arc and a recording you can send to CCD.

Basics and producer both touch the lead, chords and bass. That is on purpose: basics gets them in simply (what a scale is, what a chord is), producer makes them good (shape, room, mix). The song keeps whatever it had; a lesson that changes a part shows the part as it is and lets you keep or redo.

## Basics (world `foundations`, shown as "basics")

Song part names: lead = your melody, chords, bass. Tempo lives on the song.

| # | slug | title | adds or changes | what you hear and do | needs code |
|---|---|---|---|---|---|
| 1 | what-is-sound | what is sound? | adds lead.lead | done | |
| 2 | frequency-pitch | frequency and pitch | changes lead.lead | done (9b01ac3) | |
| 3 | amplitude-volume | amplitude and volume | changes lead.lead (velocity) | the same line soft then hard; velocity on keys; loud and quiet parts in a song | velocity from tap force or a soft/hard switch on keys; `synth-loud` clip exists |
| 4 | timbre-tone | timbre and tone colour | shape lead: cutoff | saw vs round on the same note; harmonics as extra pitches; a filter removes them | harmonics picture (fundamental plus overtones stacking) |
| 5 | waveforms | waveforms | shape lead: wave | sine, triangle, saw, square side by side; what each is used for; pick yours | triangle in `WaveShape`; clip `four-waves` |
| 6 | overtones-harmonics | harmonics up close | changes lead.lead (octave doubling) | the harmonic series on one note; why octaves and fifths fit; play a fifth | spectrum picture |
| 7 | noise | noise, the odd friend | adds hats.hats | hats and claps are noise; noise in a riser; add a hat from noise | takes old `synth-noise` idea; hat shape visual |
| 8 | how-we-hear | how we hear | changes mix (duck) | loudness, masking, why kick and bass fight; a first duck | needs a kick in the song (preset if none); duck knob in a shape step |
| 9 | tempo-bpm | pulse and tempo | changes song tempo | the same loop at 100, 120, 128, 140; set your song's tempo | tempo step kind (one knob with detents) |
| 10 | bars-time-signatures | bars and counting | adds section (4 bars) | counting 1 to 4, 8 bars, where things change; your loop becomes 4 bars | loop length step |
| 11 | note-values | subdivision | adds hats pattern (8ths, 16ths) | quarters, eighths, sixteenths on the grid; snap taught here for basics | grid with snap on and off |
| 12 | groove-feel | groove and swing | changes hats (swing) | straight vs swung; the swing knob on your hats | swing param on a shape step (send swing to the engine; the learning plan lists it as never sent) |
| 13 | major-scale | scales: major and minor | changes song scale, lead | the same melody in major then minor; pick your song's scale | scale switch step; keys relabel |
| 14 | intervals | intervals | changes lead.lead | two notes at once, close and far; consonant and dissonant; an ear round | interval clip; ear drill `interval` made real |
| 15 | melody-writing | writing a melody | changes lead.lead | motif, repeat, change one note; question and answer phrases | 2-bar lead take |
| 16 | ear-training | your ear | nothing added; stripe | higher or lower, which interval, which wave; a real drill with varied rounds | generated ear rounds (learning plan section 7) |
| 17 | what-are-chords | what are chords? | adds chords.chords | three notes, a triad; major and minor by ear; add chords | chord pads exist |
| 18 | chord-progressions | chord progressions | changes chords | i VI III VII and friends; play a progression | |
| 19 | bass-follows | bass follows the chords | adds bass.bass (roots) | the bass plays the root of each chord; play it | bass keys exist |
| 20 | song-structure | tension, release and structure | adds sections (intro, drop) | build and drop; take a part out, bring it back; arrange your loop | arrangement step kind (section on and off per part) |

Archive chapter "theory library": the remaining old fundamentals lessons (sound-in-space, what-is-rhythm, syncopation, polyrhythm, rhythm-in-production, notes-and-octaves, minor-scale, pentatonic-scales, transposition-modes, chord-types, keys-tonality, tension-resolution, harmony-in-production, listening-actively, daw-explained, midi-explained, digital-audio, samples-loops, signal-chain, effects-overview, mixing-basics, music-tech-integration). Slugs reused above (amplitude-volume, timbre-tone, waveforms, overtones-harmonics, how-we-hear, tempo-bpm, bars-time-signatures, note-values, groove-feel, major-scale, intervals, melody-writing, ear-training, what-are-chords, chord-progressions, song-structure) are replaced by the file lesson.

## Producer (world `producer`)

| # | slug | title | adds or changes | what you hear and do | needs code |
|---|---|---|---|---|---|
| 1 | your-kick | your kick | adds drums.kick | done | |
| 2 | synth-what-is-sound | sound, and your first synth | adds lead.lead | done | |
| 3 | hats | hats | adds hats.hats | offbeat hats, then 16ths; snap shown on the recorder, on and off to compare | snap toggle on the play-in (exists in TryIt, hidden in lesson 1); hat visual |
| 4 | clap-and-snare | clap and snare | adds drums.clap | the backbeat on 2 and 4; clap vs snare by ear; play the clap | `kick-and-clap` clip exists; goal note clap exists |
| 5 | first-bass | your first bass line | adds bass.bass | bass on the keys; low notes; the kick and bass overlap picture | overlap picture (two waves) |
| 6 | kick-and-bass | make room: kick and bass | changes mix (duck), shape bass decay | the two fight; shorten one or duck; before and after | duck on a shape step; a/b compare |
| 7 | shape-your-synth | shape your synth properly | shape lead: res, env, attack, release, detune | resonance peak, filter envelope, attack and release, detune, each drawn | resonance and envelope in `WaveShape` |
| 8 | chords-on-top | chords on top | adds chords.chords | pads vs stabs; a progression in your key | chord pads exist |
| 9 | kick-designer | the kick designer | changes drums.kick | click, body, pitch drop, drive, length; the best kick you can make | full kick designer (fix 37); more drum pad params on shape |
| 10 | real-drums | drums from recordings | changes drums (sampler) | the recorded kick, clap and hat; swap and compare; tune and chop | sampler layer in a lesson; `public/audio/real` |
| 11 | lead-width | width and movement | shape lead: detune, lfo | unison width, a slow filter wobble | lfo param |
| 12 | fx-riser | fx: risers and sweeps | adds fx.riser | noise riser, filter sweep into the drop | fx layer in a lesson |
| 13 | balance | levels and balance | changes mix (levels) | faders; too loud, too quiet; the stage | faders step (reuse mix faders) |
| 14 | eq-place | eq: a place for everything | changes mix (eq) | low, mid, high shelves per part; cut what fights | eq knobs on a shape step |
| 15 | space | space: reverb and echo | changes mix (sends) | sends; near and far; an echo on the lead | send knobs |
| 16 | glue | glue: compression and loudness | changes master | the glue compressor, the limiter, true peak | master step |
| 17 | sections | sections | adds arrangement | intro, build, drop, break; which parts play where | arrangement step kind (shared with basics 20) |
| 18 | fills | variation and fills | changes drums (fill bar) | the fill before the drop; one bar that is different | fill take |
| 19 | the-drop | the breakdown and the drop | changes arrangement | take the kick out, bring it back; the riser lands | arrangement step |
| 20 | finish-export | finish and export | export | name it, export midi and stems, open in Live, send to CCD | export exists (midi); stems later |

Archive chapter "in the daw (ableton live)": every other current producer lesson, in its current paths (the interface, clips and workflow, midi and audio, core instruments, core effects, mixing essentials, advanced mixing, controllers, live output, deep instruments, live 12 devices, live 12 power, and the 18 synthesis lessons). The synthesis ideas are rebuilt above (7, 11); the rest stays as reference until Param wants them rebuilt.

## DJ (world `dj`)

Deck a and deck b can each carry your song or a bank track (Param, 23:51). The bank: a set of loops rendered on our engine in different keys, bpms and styles until real CCD tracks are cleared, then real tracks with their key and bpm.

| # | slug | title | adds or changes | what you hear and do | needs code |
|---|---|---|---|---|---|
| 1 | what-is-djing | what is djing? | adds drums.clap | done | |
| 2 | dj-equipment | the gear | the mix: two decks | decks, mixer, headphones; channel faders, crossfader, cue; your song on a and a bank track on b | `mix` step kind: two decks, faders, crossfader, eq, cue; deck source `song` or `bank:<id>`; bank data |
| 3 | tempo-bpm-dj | tempo and bpm | the mix: match | two tracks at different speeds; match by ear with the tempo fader, then check the numbers | `tempo` control on the mix step |
| 4 | your-first-mix | your first blend | the mix: a blend | bring b in on a phrase, swap the bass with eq, fade a out | mix step with a goal (bass swapped, a faded) |
| 5 | phrasing | phrasing: count in eights | the mix | the 1 of an 8; where tracks change; come in on the phrase | phrase counter |
| 6 | eq-mixing-dj | eq mixing | the mix | kill the low on one, bring the other's up; the bass swap | eq on the mix step |
| 7 | headphone-monitoring | cue and headphones | the mix | pre-listen in the cue; set the next track up | cue routing (headphone mix) |
| 8 | long-mix-blend | the cut and the long blend | the mix | a cut on the 1 vs a 16-bar blend; when to use which | |
| 9 | music-library-dj | picking tracks | the bank | genre, bpm, energy; pick three from the bank that work together | bank browser step |
| 10 | key-detection-dj | key and harmonic mixing | the bank, your song's key | keys that fit; the wheel; your song's key | key display per track |
| 11 | cue-points-dj | cue points and loops | the mix | set a cue on the 1; loop 4 bars to extend | cue and loop on the mix step |
| 12 | waveform-reading | reading waveforms | the mix | see the kick, the break, the drop in the waveform | waveform render |
| 13 | set-structure-dj | the energy arc | the set | a 30-minute set in three acts; order the bank | set order step |
| 14 | reading-the-crowd | reading the room | the set | what to do when it dips; the recovery track | |
| 15 | effects-performance-dj | effects in performance | the mix | filter out, echo out, a riser between tracks | filter and echo on the mix step |
| 16 | transitions-cut-dj | transitions that tell a story | the mix | the breakdown blend, the drop swap | |
| 17 | preparing-a-set-dj | preparing a set | the set | crates, order, backups | |
| 18 | recording-your-set-dj | recording your set | export | record the mix; send it | record the mix output (engine recorder exists) |
| 19 | live-mistakes-dj | handling mistakes | the mix | train wreck, silence, the wrong track; recover | mistake drills |
| 20 | dj-advanced-complete | from dj to artist | the stage | play your own track in your set; the CCD night | |

Archive chapter "rekordbox and the trade": rekordbox-intro, dj-culture, booth-setup, genre-bpm-reference, bpm-analysis-dj, my-tags-dj, playlists-dj, crate-digging, export-mode-dj, beatmatching-manual, sync-function, crossfader-technique, loop-function-dj, harmonic-mixing-dj, energy-management-dj, genre-strategy-dj, effects-deep-dj, loop-performance-dj, harmonic-key-shift-dj, stem-djing, dvs-basics, dj-business. Slugs reused above keep their progress.

## Changes to paths and worlds (code)

1. `chapters.ts` and `paths.ts`: each world gets five new paths of four slugs in the order above, then its archive chapter with the old paths unchanged. Chapters and paths get `archive: true`.
2. `worldOrder.ts`, worlds page, dashboard knobs, world view: the journey, counts (x of 20), "next lesson" and the lesson knob use only non-archive paths. "see all" and search show the archive under its own heading with a small "archive" tag.
3. Lesson files: `number` 1 to 20 per world folder. A file lesson replaces the old mission with the same slug (already true). Slugs that are new (hats, clap-and-snare, first-bass, kick-and-bass, shape-your-synth, chords-on-top, kick-designer, real-drums, lead-width, fx-riser, balance, eq-place, space, glue, sections, fills, the-drop, finish-export, noise, bass-follows, phrasing) are added to paths as they are built; until a file exists the path shows them as "coming" and the next link skips them.
4. Rewards (`rewards.ts`) keyed to slugs: keep the four, add per-path stripes.
5. The song: auto-named on the first add ("untitled 1 at 120 bpm" style, picked from a small list), renamable from the song strip and the done screen (fix 50).
6. New step kinds, added when the first lesson needs them: `tempo` (9), `scale` (13), `arrange` (20, producer 17), `mix` with decks and a bank (dj 2), `set` (dj 13). Each is one code push before its lesson.
7. Engine: send swing (basics 12), lfo on lead (producer 11), stems export (producer 20).

## Order we build in

Path by path, in the learner's order, so each world has a complete first path soon and Param can play a whole path start to finish:

1. producer 3, 4 (hats, clap) → producer path 1 complete. Then the paths and worlds change (item 1 to 5 above) in its own push, once there is something to put in path 1.
2. basics 3, 4 → basics path 1 complete.
3. dj mix step kind, then dj 2, 3, 4 → dj path 1 complete.
4. basics path 2 (5 to 8), producer path 2 (5 to 8), dj path 2 (5 to 8).
5. basics path 3, producer path 3, dj path 3, and so on to path 5.
6. Better sounds (recorded drums, synth tone, kick decay range) once producer path 3 is in, because the kick designer and real drums lessons depend on it.
7. Rewards that change the interface, once Param picks what they unlock.

Every lesson push: YAML plus whatever code it needs, `npm run lessons`, tsc, vitest, cargo test, next build, shots at 390x844 and 1440x900 in light and dark on Chromium and WebKit, a scripted smoke (variants, voice chips, play, add, a wrong answer), then the preview link.

## Open with Param

- The order above interleaves worlds path by path. The earlier agreed order was basics 2 to 5, then producer 3 to 6, then dj 2 to 4. Say which.
- The bank: engine-rendered loops now, real CCD tracks when cleared. Which tracks?
- Basics 16 and dj 19 are drills, not builds. Fine to keep as the one lesson per world that adds nothing to the song?
