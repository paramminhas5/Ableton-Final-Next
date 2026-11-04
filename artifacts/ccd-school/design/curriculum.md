# CCD School curriculum: worlds, paths and lessons (5 Nov 2026, second draft)

What this is: every world, path and lesson, what each one does to the song, where every one of the current 171 lessons lands, what code is needed, and the order we build in. Project copy: `ccd/school-curriculum.md`. Follows `school-process.md` and the 4 Nov decisions.

Param's calls that shape it (4 Nov 23:31, 23:51, 5 Nov 00:05): the song path is the spine and must be comprehensive; theory and depth lessons stay, attached to the point where they matter, opened when wanted and skippable; a lesson with nothing to add to the song is a bonus round; nothing from the 171 is lost; structure first, then world by world until each is right; the song is auto-named and renamable; either dj deck can carry your song or a bank track.

## How a world is built

- **A world is five or six paths.** A path is a run of three to five **song lessons**: each adds or changes one part of the song (the thing you hear at the end is the song, a bit better). Progress, the journey line and the dashboard knobs count song lessons.
- **Deeper lessons hang off a song lesson.** They are the theory, the "in Live" and the rekordbox depth from the current 171, placed at the song lesson where that idea first matters. On the journey they sit beside their song lesson as "go deeper" cards. Open one if you want it, skip it if you don't; they never block the path. They earn xp and a stripe but are not in the x of y count.
- **Bonus rounds** are lessons with nothing to add to the song: ear drills, a tour, a quiz with a story. Same optional rule, shown with a different mark.
- **One song through all three worlds.** Basics gives it its notes, scale, chords, bass and your ears. Producer gives it groove, sound, mix and arrangement and ends with an export to Live. DJ plays it out with bank tracks and ends with a recorded set for a CCD night.
- **Slugs are kept.** A rebuilt lesson takes the old slug so progress and trophies carry over. A lesson is "rebuilt" once it is a YAML file in the new player; until then its old version still runs in the old player, marked "old version" on the card.
- **Legend in the tables:** S = song lesson, D = deeper (hangs off the song lesson above it), B = bonus round. Slugs in backticks; new slugs marked (new).

## Basics (world `foundations`, shown as "basics")

What the song has after basics: tempo set, a melody in a scale you chose, played with dynamics, chords, a bass on the roots, an intro and a drop.

### Path 1: sound
| | slug | title | does to the song | needs code |
|---|---|---|---|---|
| S | `what-is-sound` | what is sound? | adds lead.lead | done |
| D | `sound-in-space` | sound in space | none (why rooms sound different; reverb preview) | |
| S | `frequency-pitch` | frequency and pitch | changes lead.lead | done (9b01ac3) |
| S | `amplitude-volume` | amplitude and volume | changes lead velocity | velocity on keys (soft/hard) |
| D | `how-we-hear` | how we hear | none (loudness, masking; why kick and bass fight) | |
| S | `timbre-tone` | timbre and tone colour | shape lead: cutoff | harmonics picture |
| B | (new) `ear-higher-lower` | bonus: higher or lower? | none | generated ear rounds |

### Path 2: waves and the studio
| | slug | title | does to the song | needs code |
|---|---|---|---|---|
| S | `waveforms` | waveforms | shape lead: wave (sine, triangle, saw, square) | triangle in `WaveShape`, clip `four-waves` |
| S | `overtones-harmonics` | harmonics up close | changes lead (a fifth above) | spectrum picture |
| S | (new) `noise` | noise, the odd friend | adds hats.hats from noise | hat shape visual |
| S | `samples-loops` | samples and loops | adds sample (one recorded hit into your song) | sampler layer in a lesson |
| D | `digital-audio` | digital audio | none (sample rate, bits, what the file is) | |
| D | `daw-explained` | what a daw is | none | |
| D | `midi-explained` | what midi is | none (your song is notes, not sound) | |

### Path 3: rhythm
| | slug | title | does to the song | needs code |
|---|---|---|---|---|
| D | `what-is-rhythm` | what is rhythm? | none | |
| S | `tempo-bpm` | pulse and tempo | sets song tempo | tempo step (one knob with detents) |
| S | `bars-time-signatures` | bars and counting | loop becomes 4 bars | loop length step |
| S | `note-values` | subdivision | adds a hat pattern on 8ths and 16ths; snap taught | grid with snap on and off |
| D | `syncopation` | syncopation | changes hats (offbeat accents) | |
| D | `polyrhythm` | polyrhythm | none (3 against 4, hear it) | |
| S | `groove-feel` | groove and swing | changes hats: swing | send swing to the engine |
| D | `rhythm-in-production` | rhythm in production | none | |

### Path 4: melody
| | slug | title | does to the song | needs code |
|---|---|---|---|---|
| D | `notes-and-octaves` | notes and octaves | none (the twelve notes) | |
| S | `major-scale` | scales: major and minor | sets song scale; relabels keys | scale step |
| D | `minor-scale` | the minor scale and its cousins | changes scale (natural, harmonic) | |
| S | `intervals` | intervals | changes lead (a two-note phrase) | interval clip |
| S | `melody-writing` | writing a melody | changes lead (motif, repeat, change one note) | 2-bar take |
| S | `pentatonic-scales` | the pentatonic hook | changes lead (a hook on five notes) | |
| D | `transposition-modes` | transposition and modes | changes key (move the song up) | |
| B | `ear-training` | bonus: your ear | none (which interval, which wave, varied rounds) | generated rounds |

### Path 5: harmony and shape
| | slug | title | does to the song | needs code |
|---|---|---|---|---|
| S | `what-are-chords` | what are chords? | adds chords.chords | chord pads exist |
| D | `chord-types` | chord types | changes chords (7ths, sus) | |
| S | `chord-progressions` | chord progressions | changes chords (a progression) | |
| D | `keys-tonality` | keys and tonality | none (why the song feels at home) | |
| S | (new) `bass-follows` | bass follows the chords | adds bass.bass on the roots | |
| D | `harmony-in-production` | harmony in production | none | |
| S | `song-structure` | tension, release and structure | adds sections (intro, drop) | arrange step |
| D | `tension-resolution` | tension and resolution | none | |
| B | `listening-actively` | bonus: listen like a producer | none | |

Moved to producer path 4 (the mix) as deeper lessons, because that is where they matter: `signal-chain`, `effects-overview`, `mixing-basics`, `music-tech-integration`.

## Producer (world `producer`)

What the song has after producer: kick, hats, clap, a bass that makes room for the kick, a shaped lead, chords, fx, a mixed and glued master, sections and fills, an export to Live. The "in Live" lessons from the current producer world hang off the song lesson that teaches the same idea on our instrument, so you learn it here, then see where it lives in Live.

### Path 1: your first loop
| | slug | title | does to the song | needs code |
|---|---|---|---|---|
| S | `your-kick` | your kick | adds drums.kick | done |
| D | `what-is-live` | what is live? | none | |
| D | `interface-tour` | around live | none | |
| D | `drum-rack` | the drum rack in live | none | |
| S | `synth-what-is-sound` | sound, and your first synth | adds lead.lead | done |
| D | `instruments-overview` | live's instruments | none | |
| D | `synth-oscillators` | oscillators, the sound source | shape lead: wave | |
| D | `synth-pitch-vs-amplitude` | pitch vs amplitude | none | |
| S | (new) `hats` | hats | adds hats.hats; snap taught | snap toggle on the play-in, hat visual |
| D | `midi-piano-roll` | the piano roll | none | |
| S | (new) `clap-and-snare` | clap and snare | adds drums.clap | clip and goal exist |
| D | `session-view` | session view | none | |
| D | `clips` | clips: midi vs audio | none | |

### Path 2: low end and your synth
| | slug | title | does to the song | needs code |
|---|---|---|---|---|
| S | (new) `first-bass` | your first bass line | adds bass.bass | overlap picture |
| D | `bass-poli` | bass and poli | none | |
| D | `operator` | operator | none | |
| S | (new) `kick-and-bass` | make room: kick and bass | changes mix: duck; shape bass decay | duck on a shape step, a/b |
| D | `sidechain` | sidechain in live | none | |
| D | `compressor` | the compressor | none | |
| S | (new) `shape-your-synth` | shape your synth properly | shape lead: res, env, attack, release | resonance and envelope in `WaveShape` |
| D | `synth-filters` | filters, carving the sound | | |
| D | `synth-amp-envelope` | amp envelope | | |
| D | `synth-filter-envelope` | filter envelope | | |
| D | `synth-amp-vs-filter-env` | two envelopes, one voice | | |
| D | `synth-timbre` | timbre | | |
| D | `synth-harmonics` | harmonics and overtones | | |
| D | `synth-mixing-oscillators` | mixing oscillators | | |
| S | (new) `chords-on-top` | chords on top | adds chords.chords | |
| D | `midi-effects` | midi effects | none | |
| D | `scale-awareness` | scale awareness in live 12 | none | |
| D | `capture-midi` | capture midi | none | |

### Path 3: sound design
| | slug | title | does to the song | needs code |
|---|---|---|---|---|
| S | (new) `kick-designer` | the kick designer | changes drums.kick (click, body, drop, drive, length) | full designer (fix 37) |
| D | `saturator-distortion` | saturator and distortion | | |
| D | `roar` | roar | | |
| S | (new) `real-drums` | drums from recordings | changes drums: sampler kit | sampler in a lesson, `public/audio/real` |
| D | `sampler-simpler` | sampler and simpler | | |
| D | `sampler-deep` | sampler, deep | | |
| D | `drum-sampler` | drum sampler | | |
| D | `slicing` | slicing to midi | | |
| D | `audio-clips` | audio clips | | |
| D | `recording-audio` | recording audio | | |
| D | `warping` | warping | | |
| D | `warp-modes-deep` | warp modes | | |
| S | (new) `lead-width` | width and movement | shape lead: detune, lfo | lfo param |
| D | `synth-detune-unison` | detune and unison | | |
| D | `synth-lfo` | the lfo | | |
| D | `synth-modulation-routing` | modulation routing | | |
| D | `synth-fm-basics` | fm basics | | |
| D | `wavetable` | wavetable | | |
| D | `meld` | meld | | |
| D | `drift` | drift | | |
| S | (new) `fx-riser` | fx: risers and sweeps | adds fx.riser | fx layer in a lesson |
| D | `synth-noise` | noise | | |
| D | `synth-effects` | synth effects | | |
| D | `granulator-iii` | granulator iii | | |
| D | `collision-tension-electric` | collision, tension, electric, analog | | |
| D | `synth-preset-anatomy` | preset anatomy | | |
| D | `synth-build-your-own` | build your own patch | | |

### Path 4: the mix
| | slug | title | does to the song | needs code |
|---|---|---|---|---|
| S | (new) `balance` | levels and balance | changes mix: levels, the stage | faders step |
| D | `the-mixer` | the mixer in live | | |
| D | `mixing-basics` | mixing basics | | |
| D | `signal-chain` | the signal chain | | |
| D | `groups-routing` | groups and routing | | |
| S | (new) `eq-place` | eq: a place for everything | changes mix: eq per part | eq knobs on a shape step |
| D | `eq-eight` | eq eight | | |
| D | `effects-overview` | effects overview | | |
| S | (new) `space` | space: reverb and echo | changes mix: sends | send knobs |
| D | `sends-returns` | sends and returns | | |
| D | `reverb-delay` | reverb and delay | | |
| D | `hybrid-reverb` | hybrid reverb | | |
| S | (new) `glue` | glue: compression and loudness | changes master | master step |
| D | `glue-compressor` | glue compressor | | |
| D | `limiter-truepeak` | limiter and true peak | | |
| D | `racks-macros` | racks and macros | | |
| D | `music-tech-integration` | putting it all together | | |

### Path 5: arrangement and finish
| | slug | title | does to the song | needs code |
|---|---|---|---|---|
| S | (new) `sections` | sections | adds arrangement (intro, build, drop, break) | arrange step |
| D | `arrangement-view` | arrangement view | | |
| D | `scenes-follow` | scenes and follow actions | | |
| D | `tracks` | tracks | | |
| D | `automation` | automation | | |
| D | `modulation-lanes` | modulation lanes | | |
| S | (new) `fills` | variation and fills | changes drums: a fill bar | fill take |
| D | `midi-transforms` | midi transformations | | |
| D | `groove-pool` | groove pool | | |
| D | `take-lanes` | take lanes and comping | | |
| D | `comping` | comping | | |
| D | `comping-flow` | comping flow | | |
| S | (new) `the-drop` | the breakdown and the drop | changes arrangement | |
| D | `macro-variations` | macro variations | | |
| D | `instrument-rack` | instrument rack | | |
| S | (new) `finish-export` | finish and export | export (midi, stems), name it, send to CCD | stems export |
| D | `exporting` | exporting from live | | |
| D | `live-sets-projects` | live sets and projects | | |
| D | `files-projects` | files and projects | | |
| D | `stem-separation` | stem separation | | |
| D | `troubleshooting` | troubleshooting | | |
| D | `cpu-audio-setup` | cpu and audio setup | | |

### Path 6: live, properly (all bonus and deeper)
A path for people who want Live itself. Nothing here changes the song; it is where the rest of the Live reference lives, in a sensible order.
| | slug | title | | |
|---|---|---|---|---|
| B | (new) `your-song-in-live` | bonus: your song in live | open your export, the tour | |
| D | `browser` | the browser | | |
| D | `preferences` | preferences | | |
| B | (new) `play-it-live` | bonus: play it | controllers and sync | |
| D | `push-controllers` | push and controllers | | |
| D | `midi-mapping` | midi mapping | | |
| D | `push3-workflow` | push 3 workflow | | |
| D | `push3-standalone` | push 3 standalone | | |
| D | `tempo-following` | tempo following | | |
| D | `ableton-link-sync` | ableton link in practice | | |
| D | `ableton-link` | ableton link | | |
| D | `cv-tools` | cv tools | | |
| D | `external-instrument` | external instrument | | |
| B | (new) `the-toolbox` | bonus: the toolbox | the rest of live 12 | |
| D | `linked-track-editing` | linked-track editing | | |
| D | `sound-similarity` | sound similarity search | | |
| D | `mpe-tuning` | mpe and tuning systems | | |
| D | `midi-effects-tour` | midi effects tour | | |
| D | `max-for-live` | max for live | | |
| D | `accessibility-features` | accessibility in live | | |

## DJ (world `dj`)

What you have after dj: your song blended with bank tracks in a short set, matched by ear, phrased, eq'd, cued, with an energy arc and a recording to send to CCD. Deck a and deck b can each carry your song or a bank track. The bank: loops rendered on our engine in different keys, bpms and styles now; real CCD tracks with key and bpm once cleared.

### Path 1: the booth
| | slug | title | does to the mix | needs code |
|---|---|---|---|---|
| S | `what-is-djing` | what is djing? | adds drums.clap | done |
| D | `dj-culture` | dj culture and history | | |
| S | `dj-equipment` | the gear | two decks, faders, crossfader, cue | `mix` step kind, deck sources, bank |
| D | `booth-setup` | the booth | | |
| D | `rekordbox-intro` | rekordbox | | |
| S | (new) `tempo-bpm-dj` | tempo and bpm | match two tracks by ear | tempo fader on the mix step |
| D | `beatmatching-manual` | manual beatmatching | | |
| D | `sync-function` | the sync button | | |
| D | `bpm-analysis-dj` | bpm analysis | | |
| S | `your-first-mix` | your first blend | b in on a phrase, bass swap, a out | mix goal |
| D | `crossfader-technique` | crossfader technique | | |

### Path 2: the blend
| | slug | title | does to the mix | needs code |
|---|---|---|---|---|
| S | (new) `phrasing` | phrasing: count in eights | come in on the 1 of an 8 | phrase counter |
| D | `genre-bpm-reference` | genres and bpm | | |
| S | `eq-mixing-dj` | eq mixing | the bass swap | eq on the mix step |
| S | `headphone-monitoring` | cue and headphones | pre-listen in the cue | cue routing |
| S | `long-mix-blend` | the cut and the long blend | a cut on the 1, a 16-bar blend | |
| D | `transitions-cut-dj` | the cut and the power transition | | |
| D | `loop-function-dj` | loops and loop rolls | | |

### Path 3: the library
| | slug | title | does to the mix | needs code |
|---|---|---|---|---|
| S | `music-library-dj` | picking tracks | pick three bank tracks that work together | bank browser step |
| D | `crate-digging` | crate digging | | |
| D | `my-tags-dj` | my tags | | |
| D | `playlists-dj` | playlists and set prep | | |
| D | `export-mode-dj` | export mode | | |
| S | `key-detection-dj` | key and harmonic mixing | your song's key, keys that fit | key per track |
| D | `harmonic-mixing-dj` | harmonic mixing in practice | | |
| D | `harmonic-key-shift-dj` | key shift and master tempo | | |
| S | `cue-points-dj` | cue points and loops | a cue on the 1, loop to extend | cue and loop on the mix step |
| D | `loop-performance-dj` | performance looping and hot cues | | |
| S | `waveform-reading` | reading waveforms | see the drop coming | waveform render |

### Path 4: the set
| | slug | title | does to the mix | needs code |
|---|---|---|---|---|
| S | `set-structure-dj` | the energy arc | order the bank into three acts | set order step |
| D | `energy-management-dj` | energy management | | |
| D | `genre-strategy-dj` | genre strategy | | |
| B | `reading-the-crowd` | bonus: reading the room | | |
| S | `effects-performance-dj` | effects in performance | filter out, echo out between tracks | filter and echo on the mix step |
| D | `effects-deep-dj` | effects, deep | | |
| D | `stem-djing` | stem djing | | |
| S | `preparing-a-set-dj` | preparing a set | crates, order, backups | |
| D | `dvs-basics` | dvs and digital vinyl | | |

### Path 5: the gig
| | slug | title | does to the mix | needs code |
|---|---|---|---|---|
| S | `recording-your-set-dj` | recording your set | record the mix, send it | engine recorder |
| B | `live-mistakes-dj` | bonus: handling mistakes | | mistake drills |
| D | `dj-business` | the business of djing | | |
| S | `dj-advanced-complete` | from dj to artist | your own track in your set; the CCD night | |

## Counts

57 song lessons, 133 deeper, 8 bonus rounds, 26 new slugs. Every one of the app's 172 lessons (the 171 plus basics 2) appears exactly once above, checked by `scripts/curriculum-check.mjs`, which fails the build the day a slug goes missing or lands twice.

## Changes to paths, worlds and the app (code)

1. `paths.ts` and `chapters.ts` become the structure above: a path lists its song lessons in order and, per song lesson, its deeper and bonus slugs. Old path and chapter ids go away; progress is per slug so nothing is lost.
2. `worldOrder.ts`, the journey, the x of y counts, "next lesson" and the dashboard knobs walk song lessons only. Deeper and bonus lessons show as cards beside their song lesson ("go deeper", "bonus"), on the world view, the lesson list and the done screen ("want more on this? two deeper lessons"). They are also in search and "see all".
3. A lesson that is not yet a YAML file still opens in the old player, with an "old version" tag on its card. Rebuilding a lesson is making its YAML; nothing else changes.
4. Lesson files: `number` is the order inside the world across song, deeper and bonus. Rewards keyed to slugs keep working; add one stripe per path.
5. The song: auto-named on the first add (from a short list like "first light", "two am", plus the tempo), renamable from the song strip and the done screen.
6. New step kinds, one code push before the first lesson that needs each: `tempo`, `loop` (length), `scale`, `arrange`, `mix` with decks and a bank, `set`. Engine: send swing, lfo on lead, stems export.

## Order we build in

World by world, until Param says the world is right:

1. **Structure push (next):** paths, chapters and the journey as above, song and deeper and bonus marks, "old version" tags, counts, next links, auto-named song with rename. No lesson content changes. Param checks the shape of all three worlds on the preview.
2. **Basics, path by path:** path 1 (amplitude, timbre, the bonus round, the two deeper lessons rebuilt), then paths 2 to 5. Each lesson a push.
3. **Producer, path by path:** paths 1 to 5, then path 6. Better sounds lands with path 3.
4. **DJ:** the mix step kind, then paths 1 to 5.
5. **Rewards that change the interface**, once Param picks what they unlock.

Each push: YAML plus the code it needs, `npm run lessons`, tsc, vitest, cargo test, next build, shots at 390x844 and 1440x900 in light and dark on Chromium and WebKit, a scripted smoke, then the preview link.

## Open with Param

- Basics before producer (as agreed on 4 Nov), or producer first because it builds the groove? The plan says basics.
- The bank for dj: engine loops now, real CCD tracks when cleared. Which tracks?
- Any lesson above in the wrong place, or a path that should split or merge: say so before the structure push, since that push sets the order the learner sees.
