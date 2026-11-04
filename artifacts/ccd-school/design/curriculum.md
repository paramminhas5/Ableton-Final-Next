# CCD School curriculum: worlds, paths and lessons (5 Nov 2026, third draft)

What this is: every world, path and lesson, what each one does to the song, where every one of the current 171 lessons lands, what code is needed, and the order we build in. Project copy: `ccd/school-curriculum.md`. Follows `school-process.md` and the 4 Nov decisions.

Param's calls that shape it (4 Nov 23:31, 23:51, 5 Nov 00:05 and 00:21): the song path is the spine and must be comprehensive; theory and depth lessons stay, attached to the point where they matter, opened when wanted and skippable; a lesson with nothing to add to the song is a bonus round; nothing from the 171 is lost; structure first, then world by world until each is right; the song is auto-named and renamable; either dj deck can carry your song, a bank track or a track the learner adds; every lesson, deeper ones included, acts on the song you are making (sidechain ducks your bass, operator adds an fm voice, the compressor squeezes your drums); drums come early.

## What makes it the best learning app (the rules everything below follows)

1. **The song is the progress bar.** The journey is not a list of lessons, it is your song with its parts lighting up: beat, hats, lead, bass, chords, mix, arrangement, set. Tap any lit part and you are back in the lesson that made it, with that part playing. Tap a dark one and you are in the lesson that adds it. Lessons are the way in; the song is what you see.
2. **Touch first, words second.** On every step the control is on screen before the sentence that explains it, and the song is already playing through it. You hear what a knob does before you know its name. The name comes when you ask ("what did I just do?") or when you keep it.
3. **Every lesson leaves a mark you can hear.** Song lessons add a part. Deeper lessons change one. Bonus rounds use your own parts for their questions. Nothing is read-only. At the end of every lesson: your song with it, your song without it, keep or not.
4. **Nothing is locked, nothing is forced.** Any world, any path, any time. Open a deeper lesson only if you want it. Skip the stripe challenge. If a lesson needs a part you don't have, a sensible one drops in with a note, so you can start anywhere.
5. **One screen, one idea.** No step has two new words. If it would, it is two steps. Each step has the three ways of saying it (full, short, simpler).
6. **It sounds good from the first tap.** The kick, clap and hats are recorded sounds, the synth is tuned by ear, the mix has glue on it by default. A learner's first loop should be something they'd play to a friend.
7. **Questions come from your song.** "Which of these two is your bass with the duck on?" beats "what is sidechain?". The stripe challenge plays your parts.
8. **Everything you make goes somewhere.** Export to Live, send to a CCD night, play it in the dj world, put it in your set. The last lesson of each world is a door, not a certificate.
9. **It explains itself.** Underlined words open where they are. Each one you open goes into your own wiki. The header always says where you are, what's next, and how to get back.
10. **Fast to change.** One YAML file per lesson, three voices in it, checked by tests, shot on four screens, on the preview in minutes. Param's notes become a diff.

## How a world is built

- **A world is five or six paths.** A path is a run of three to five **song lessons**: each adds or changes one part of the song. Progress, the journey line and the dashboard knobs count song lessons.
- **Deeper lessons hang off a song lesson.** They are the theory, the "in Live" and the rekordbox depth from the current 171, placed at the song lesson where that idea first matters. On the journey they sit beside their song lesson as "go deeper" cards. Open one if you want it, skip it if you don't; they never block the path. They earn xp and a stripe but are not in the x of y count.
- **Every lesson acts on your song. No exceptions.** Deeper lessons too: the song is playing on the screen, the one new control is right there, you move it and hear it on your own parts, and you keep it or not. Sidechain ducks your bass under your kick. The compressor squeezes your drums. Operator puts an fm voice on your lead. Filters open and close on your lead. Warping stretches a sample you loaded. A lesson that only explains is not finished. Where a lesson is about Live itself (the browser, preferences, push), the song part is "do the same thing here on our instrument", and the Live part is a fold-out with the real menu path.
- **Bonus rounds** are the few lessons where there is truly nothing to add: an ear drill on your own song, reading the room, handling mistakes. Same optional rule, different mark.
- **One song through all three worlds.** Basics gives it a beat, notes, a scale, chords, bass and your ears. Producer gives it its sound, groove, mix and arrangement and ends with an export to Live. DJ plays it out with other tracks and ends with a recorded set for a CCD night. A lesson that needs a part the song does not have yet drops a sensible one in and says so, so worlds can be played in any order.
- **Slugs are kept.** A rebuilt lesson takes the old slug so progress and trophies carry over. Until a lesson is a YAML file it opens in the old player, marked "old version" on its card.
- **Legend:** S = song lesson, D = deeper (hangs off the song lesson above it), B = bonus round. Slugs in backticks; new slugs marked (new). The "does to the song" column is the keep-able thing you do in that lesson.

## Basics (world `foundations`, shown as "basics")

What the song has after basics: a kick, a clap, hats with swing, a tempo, a melody in a scale you chose, played with dynamics, chords, a bass on the roots, an intro and a drop. Drums first (Param, 00:21): you have a beat within the first lesson, and everything after is heard over it.

### Path 1: the pulse
| | slug | title | does to the song | needs code |
|---|---|---|---|---|
| S | `tempo-bpm` | pulse and tempo | adds drums.kick on the beat; sets the tempo (100, 120, 128, 140 by ear) | tempo step (one knob with detents) |
| D | `what-is-rhythm` | what is rhythm? | move one kick off the beat and back; feel what breaks | |
| S | `bars-time-signatures` | bars and counting | adds drums.clap on 2 and 4 (the backbeat) | |
| S | `note-values` | subdivision | adds hats.hats on 8ths, then 16ths; snap taught | grid with snap on and off |
| D | `syncopation` | syncopation | move a hat to an offbeat accent; keep it | |
| D | `polyrhythm` | polyrhythm | a 3-against-4 shaker over your beat; keep it or not | perc lane |
| S | `groove-feel` | groove and swing | changes hats: swing | send swing to the engine |
| D | `rhythm-in-production` | rhythm in production | humanise: nudge two hats late by ear | nudge control |

### Path 2: sound
| | slug | title | does to the song | needs code |
|---|---|---|---|---|
| S | `what-is-sound` | what is sound? | adds lead.lead over your beat | done (preset beat drops in if none) |
| D | `sound-in-space` | sound in space | reverb send on your lead: near, far; keep the amount | send knob |
| S | `frequency-pitch` | frequency and pitch | changes lead.lead | done (9b01ac3) |
| S | `amplitude-volume` | amplitude and volume | changes lead velocity; soft and hard | velocity on keys |
| D | `how-we-hear` | how we hear | masking: your bass under your kick with and without a duck | duck knob (needs a bass; preset if none) |
| S | `timbre-tone` | timbre and tone colour | shape lead: cutoff | harmonics picture |
| B | `ear-higher-lower` | bonus: higher or lower? | rounds played from your own melody's notes | generated ear rounds |

### Path 3: waves and the studio
| | slug | title | does to the song | needs code |
|---|---|---|---|---|
| S | `waveforms` | waveforms | shape lead: wave (sine, triangle, saw, square) | triangle in `WaveShape`, clip `four-waves` |
| S | `overtones-harmonics` | harmonics up close | changes lead (a fifth above) | spectrum picture |
| S | `noise` | noise, the odd friend | changes hats: noise colour and length | hat shape visual |
| S | `samples-loops` | samples and loops | adds sample (a recorded hit into your song) | sampler layer in a lesson |
| D | `digital-audio` | digital audio | crush your sample: bit depth and rate by ear; keep or not | crush knob |
| D | `daw-explained` | what a daw is | open your song in the studio; name the parts | |
| D | `midi-explained` | what midi is | your song is notes: change one note's velocity and length | |

### Path 4: melody
| | slug | title | does to the song | needs code |
|---|---|---|---|---|
| D | `notes-and-octaves` | notes and octaves | the twelve notes; play the five black keys on your lead | all-notes keys |
| S | `major-scale` | scales: major and minor | sets song scale; relabels keys | scale step |
| D | `minor-scale` | the minor scale and its cousins | changes scale (natural, harmonic); hear your melody in each | |
| S | `intervals` | intervals | changes lead (a two-note phrase) | interval clip |
| S | `melody-writing` | writing a melody | changes lead (motif, repeat, change one note) | 2-bar take |
| S | `pentatonic-scales` | the pentatonic hook | changes lead (a hook on five notes) | |
| D | `transposition-modes` | transposition and modes | move your song up a tone; keep or not | key shift |
| B | `ear-training` | bonus: your ear | which interval, which wave, rounds from your own song | generated rounds |

### Path 5: harmony and shape
| | slug | title | does to the song | needs code |
|---|---|---|---|---|
| S | `what-are-chords` | what are chords? | adds chords.chords | chord pads exist |
| D | `chord-types` | chord types | changes chords (7ths, sus) | |
| S | `chord-progressions` | chord progressions | changes chords (a progression) | |
| D | `keys-tonality` | keys and tonality | end your progression on home, then not; keep one | |
| S | `bass-follows` | bass follows the chords | adds bass.bass on the roots | |
| D | `harmony-in-production` | harmony in production | chords as a pad or as stabs; pick for your song | chord length/attack |
| S | `song-structure` | tension, release and structure | adds sections (intro, drop) | arrange step |
| D | `tension-resolution` | tension and resolution | a riser into your drop; keep it | fx riser |
| B | `listening-actively` | bonus: listen like a producer | three questions on your own song | |

Moved to producer path 4 (the mix) as deeper lessons, because that is where they matter: `signal-chain`, `effects-overview`, `mixing-basics`, `music-tech-integration`.

## Producer (world `producer`)

What the song has after producer: kick, hats, clap, a bass that makes room for the kick, a shaped lead, chords, fx, a mixed and glued master, sections and fills, an export to Live. The "in Live" lessons from the current producer world hang off the song lesson that teaches the same idea on our instrument, so you learn it here, then see where it lives in Live.

### Path 1: your first loop
| | slug | title | does to the song | needs code |
|---|---|---|---|---|
| S | `your-kick` | your kick | adds drums.kick | done |
| D | `what-is-live` | what is live? | your song's parts as Live sees them (fold-out: Live's screen) | |
| D | `interface-tour` | around live | find the same five things on our instrument, then in Live | |
| D | `drum-rack` | the drum rack in live | your drums are a rack: swap one pad's sound; keep it | |
| S | `synth-what-is-sound` | sound, and your first synth | adds lead.lead | done |
| D | `instruments-overview` | live's instruments | three voices on your lead line: synth, fm, sample; pick one | |
| D | `synth-oscillators` | oscillators, the sound source | shape lead: wave | |
| D | `synth-pitch-vs-amplitude` | pitch vs amplitude | detune your lead by a few cents; velocity on two notes | |
| S | `hats` | hats | adds hats.hats; snap taught | snap toggle on the play-in, hat visual |
| D | `midi-piano-roll` | the piano roll | edit one hat in the grid: move, lengthen, delete | |
| S | `clap-and-snare` | clap and snare | adds drums.clap | clip and goal exist |
| D | `session-view` | session view | your song as clips: launch the drums alone, then everything | |
| D | `clips` | clips: midi vs audio | your hats as midi, your sample as audio; swap one | |

### Path 2: low end and your synth
| | slug | title | does to the song | needs code |
|---|---|---|---|---|
| S | `first-bass` | your first bass line | adds bass.bass | overlap picture |
| D | `bass-poli` | bass and poli | a thicker bass voice on your bass line; keep it | |
| D | `operator` | operator | an fm voice on your lead; the ratio knob; keep it | |
| S | `kick-and-bass` | make room: kick and bass | changes mix: duck; shape bass decay | duck on a shape step, a/b |
| D | `sidechain` | sidechain in live | duck your bass under your kick; depth and release; keep it | |
| D | `compressor` | the compressor | squeeze your drums: threshold and ratio by ear; keep it | |
| S | `shape-your-synth` | shape your synth properly | shape lead: res, env, attack, release | resonance and envelope in `WaveShape` |
| D | `synth-filters` | filters, carving the sound |filter types on your lead: low, high, band| |
| D | `synth-amp-envelope` | amp envelope |attack and release on your lead; pluck vs pad| |
| D | `synth-filter-envelope` | filter envelope |the brightness moving on each note of your lead| |
| D | `synth-amp-vs-filter-env` | two envelopes, one voice |both envelopes on one of your notes| |
| D | `synth-timbre` | timbre |the same lead note, three timbres; pick one| |
| D | `synth-harmonics` | harmonics and overtones |add and remove harmonics on your lead| |
| D | `synth-mixing-oscillators` | mixing oscillators |blend two oscillators on your lead| |
| S | `chords-on-top` | chords on top | adds chords.chords | |
| D | `midi-effects` | midi effects | an arpeggiator on your chords; keep it | |
| D | `scale-awareness` | scale awareness in live 12 | lock your keys to your song's scale | |
| D | `capture-midi` | capture midi | play without rec, then capture what you just played | |

### Path 3: sound design
| | slug | title | does to the song | needs code |
|---|---|---|---|---|
| S | (new) `kick-designer` | the kick designer | changes drums.kick (click, body, drop, drive, length) | full designer (fix 37) |
| D | `saturator-distortion` | saturator and distortion |drive on your kick; keep it| |
| D | `roar` | roar |a bigger drive on your bass; keep it| |
| S | (new) `real-drums` | drums from recordings | changes drums: sampler kit | sampler in a lesson, `public/audio/real` |
| D | `sampler-simpler` | sampler and simpler |load your own hit onto a pad; keep it| |
| D | `sampler-deep` | sampler, deep |start point and loop on your sample| |
| D | `drum-sampler` | drum sampler |your recorded kit on the pads| |
| D | `slicing` | slicing to midi |chop a loop onto pads; play it into your song| |
| D | `audio-clips` | audio clips |your sample's start, end and gain| |
| D | `recording-audio` | recording audio |record a sound from your mic into your song| |
| D | `warping` | warping |stretch your sample to your tempo| |
| D | `warp-modes-deep` | warp modes |the same sample, four warp modes; pick one| |
| S | (new) `lead-width` | width and movement | shape lead: detune, lfo | lfo param |
| D | `synth-detune-unison` | detune and unison |width on your lead; keep it| |
| D | `synth-lfo` | the lfo |a slow wobble on your lead's filter; keep it| |
| D | `synth-modulation-routing` | modulation routing |route the lfo to pitch instead; keep one| |
| D | `synth-fm-basics` | fm basics |fm on your bass; the ratio| |
| D | `wavetable` | wavetable |a wavetable voice on your lead; scan it| |
| D | `meld` | meld |meld-style voice on your lead| |
| D | `drift` | drift |a drift-style voice on your chords| |
| S | (new) `fx-riser` | fx: risers and sweeps | adds fx.riser | fx layer in a lesson |
| D | `synth-noise` | noise |noise in your riser and your hats| |
| D | `synth-effects` | synth effects |an echo on your lead; keep it| |
| D | `granulator-iii` | granulator iii |grains from your sample; keep it| |
| D | `collision-tension-electric` | collision, tension, electric, analog |a physical-model voice on your chords| |
| D | `synth-preset-anatomy` | preset anatomy |take your lead apart: what each knob did| |
| D | `synth-build-your-own` | build your own patch |build a lead voice from init; keep it| |

### Path 4: the mix
| | slug | title | does to the song | needs code |
|---|---|---|---|---|
| S | `balance` | levels and balance | changes mix: levels, the stage | faders step |
| D | `the-mixer` | the mixer in live |your faders and pans on the stage| |
| D | `mixing-basics` | mixing basics |balance your six parts by ear| |
| D | `signal-chain` | the signal chain |your lead's chain: voice, filter, drive, send| |
| D | `groups-routing` | groups and routing |group your drums and move them together| |
| S | `eq-place` | eq: a place for everything | changes mix: eq per part | eq knobs on a shape step |
| D | `eq-eight` | eq eight |three bands on your bass; keep it| |
| D | `effects-overview` | effects overview |one of each on your lead: eq, echo, drive, reverb| |
| S | `space` | space: reverb and echo | changes mix: sends | send knobs |
| D | `sends-returns` | sends and returns |one reverb for all your parts; amounts per part| |
| D | `reverb-delay` | reverb and delay |reverb vs echo on your clap; keep one| |
| D | `hybrid-reverb` | hybrid reverb |a bigger reverb on your chords| |
| S | (new) `glue` | glue: compression and loudness | changes master | master step |
| D | `glue-compressor` | glue compressor |the glue on your whole song| |
| D | `limiter-truepeak` | limiter and true peak |the limiter: loud without clipping| |
| D | `racks-macros` | racks and macros |one knob that moves three; keep it| |
| D | `music-tech-integration` | putting it all together |your whole chain, drawn from your song| |

### Path 5: arrangement and finish
| | slug | title | does to the song | needs code |
|---|---|---|---|---|
| S | (new) `sections` | sections | adds arrangement (intro, build, drop, break) | arrange step |
| D | `arrangement-view` | arrangement view |your sections on a timeline| |
| D | `scenes-follow` | scenes and follow actions |scenes: drums alone, then all; a follow action| |
| D | `tracks` | tracks |mute, solo and arm your parts| |
| D | `automation` | automation |draw the cutoff opening over 8 bars; keep it| |
| D | `modulation-lanes` | modulation lanes |a modulation lane on your lead's level| |
| S | (new) `fills` | variation and fills | changes drums: a fill bar | fill take |
| D | `midi-transforms` | midi transformations |transform your fill: reverse, stretch| |
| D | `groove-pool` | groove pool |a groove on your hats; keep it| |
| D | `take-lanes` | take lanes and comping |three takes of your fill; pick one| |
| D | `comping` | comping |the best bar of each take| |
| D | `comping-flow` | comping flow |comp your lead take| |
| S | (new) `the-drop` | the breakdown and the drop | changes arrangement | |
| D | `macro-variations` | macro variations |two versions of your drop; switch| |
| D | `instrument-rack` | instrument rack |two voices on your lead in one rack| |
| S | (new) `finish-export` | finish and export | export (midi, stems), name it, send to CCD | stems export |
| D | `exporting` | exporting from live |export your song as midi| |
| D | `live-sets-projects` | live sets and projects |save your song as a set| |
| D | `files-projects` | files and projects |your song's files| |
| D | `stem-separation` | stem separation |stems from your song| |
| D | `troubleshooting` | troubleshooting |your song's cpu and latency| |
| D | `cpu-audio-setup` | cpu and audio setup |buffer size by ear: latency vs safety| |

### Path 6: live, properly (all bonus and deeper)
A path for people who want Live itself. Nothing here changes the song; it is where the rest of the Live reference lives, in a sensible order.
| | slug | title | | |
|---|---|---|---|---|
| B | (new) `your-song-in-live` | bonus: your song in live | open your export, the tour | |
| D | `browser` | the browser |find a sound for your lead in the browser| |
| D | `preferences` | preferences |set your song's default tempo and key| |
| B | (new) `play-it-live` | bonus: play it | controllers and sync | |
| D | `push-controllers` | push and controllers |your pads on a controller| |
| D | `midi-mapping` | midi mapping |map a knob to your lead's cutoff| |
| D | `push3-workflow` | push 3 workflow |your song on push| |
| D | `push3-standalone` | push 3 standalone |your song on push, no laptop| |
| D | `tempo-following` | tempo following |your song follows a live drummer| |
| D | `ableton-link-sync` | ableton link in practice |your song in time with another app| |
| D | `ableton-link` | ableton link |link, what it is| |
| D | `cv-tools` | cv tools |your song driving a modular| |
| D | `external-instrument` | external instrument |a hardware synth on your lead| |
| B | (new) `the-toolbox` | bonus: the toolbox | the rest of live 12 | |
| D | `linked-track-editing` | linked-track editing |edit two of your parts together| |
| D | `sound-similarity` | sound similarity search |find a sound like your kick| |
| D | `mpe-tuning` | mpe and tuning systems |a different tuning on your lead| |
| D | `midi-effects-tour` | midi effects tour |chord and arp on your chords| |
| D | `max-for-live` | max for live |a device on your lead| |
| D | `accessibility-features` | accessibility in live |your song by keyboard| |

## DJ (world `dj`)

What you have after dj: your song blended with bank tracks in a short set, matched by ear, phrased, eq'd, cued, with an energy arc and a recording to send to CCD. Deck a and deck b can each carry your song, a bank track, or a track you add yourself (any audio file, kept in your browser like the sampler's samples; bpm and key read on load). The bank: loops rendered on our engine in different keys, bpms and styles now; real CCD tracks with key and bpm once cleared.

### Path 1: the booth
| | slug | title | does to the mix | needs code |
|---|---|---|---|---|
| S | `what-is-djing` | what is djing? | adds drums.clap | done |
| D | `dj-culture` | dj culture and history |the first blend ever made, over your song| |
| S | `dj-equipment` | the gear | two decks, faders, crossfader, cue; your song on a, a bank track or your own file on b | `mix` step kind, deck sources (song, bank, your file), bank |
| D | `booth-setup` | the booth |set up both decks: your song on a, a bank track on b| |
| D | `rekordbox-intro` | rekordbox |your song's bpm and key as rekordbox would show them| |
| S | (new) `tempo-bpm-dj` | tempo and bpm | match two tracks by ear | tempo fader on the mix step |
| D | `beatmatching-manual` | manual beatmatching |match by ear, pitch fader only; your song against a bank track| |
| D | `sync-function` | the sync button |sync on, then off; feel the drift| |
| D | `bpm-analysis-dj` | bpm analysis |read your song's bpm from the grid| |
| S | `your-first-mix` | your first blend | b in on a phrase, bass swap, a out | mix goal |
| D | `crossfader-technique` | crossfader technique |three crossfader curves on the same blend| |

### Path 2: the blend
| | slug | title | does to the mix | needs code |
|---|---|---|---|---|
| S | (new) `phrasing` | phrasing: count in eights | come in on the 1 of an 8 | phrase counter |
| D | `genre-bpm-reference` | genres and bpm |your song at three tempos: which genre is it now| |
| S | `eq-mixing-dj` | eq mixing | the bass swap | eq on the mix step |
| S | `headphone-monitoring` | cue and headphones | pre-listen in the cue | cue routing |
| S | `long-mix-blend` | the cut and the long blend | a cut on the 1, a 16-bar blend | |
| D | `transitions-cut-dj` | the cut and the power transition |the cut on the 1, from your song to a bank track| |
| D | `loop-function-dj` | loops and loop rolls |loop 4 bars of your song to extend the blend| |

### Path 3: the library
| | slug | title | does to the mix | needs code |
|---|---|---|---|---|
| S | `music-library-dj` | picking tracks | pick three bank tracks that work together | bank browser step |
| D | `crate-digging` | crate digging |pick a track that fits your song's key and energy| |
| D | `my-tags-dj` | my tags |tag your song and three bank tracks| |
| D | `playlists-dj` | playlists and set prep |a playlist with your song in the middle| |
| D | `export-mode-dj` | export mode |your set, exported| |
| S | `key-detection-dj` | key and harmonic mixing | your song's key, keys that fit | key per track |
| D | `harmonic-mixing-dj` | harmonic mixing in practice |two keys that fit your song, one that fights| |
| D | `harmonic-key-shift-dj` | key shift and master tempo |shift a bank track into your song's key| |
| S | `cue-points-dj` | cue points and loops | a cue on the 1, loop to extend | cue and loop on the mix step |
| D | `loop-performance-dj` | performance looping and hot cues |hot cues on your song's drop| |
| S | `waveform-reading` | reading waveforms | see the drop coming | waveform render |

### Path 4: the set
| | slug | title | does to the mix | needs code |
|---|---|---|---|---|
| S | `set-structure-dj` | the energy arc | order the bank into three acts | set order step |
| D | `energy-management-dj` | energy management |where your song goes in the set| |
| D | `genre-strategy-dj` | genre strategy |a set around your song's genre| |
| B | `reading-the-crowd` | bonus: reading the room | the floor dips: pick the next track from your bank | |
| S | `effects-performance-dj` | effects in performance | filter out, echo out between tracks | filter and echo on the mix step |
| D | `effects-deep-dj` | effects, deep |echo out of your song into the next track| |
| D | `stem-djing` | stem djing |your song's drums under another track's vocal| |
| S | `preparing-a-set-dj` | preparing a set | crates, order, backups | |
| D | `dvs-basics` | dvs and digital vinyl |your song on a control record| |

### Path 5: the gig
| | slug | title | does to the mix | needs code |
|---|---|---|---|---|
| S | `recording-your-set-dj` | recording your set | record the mix, send it | engine recorder |
| B | `live-mistakes-dj` | bonus: handling mistakes | recover a train wreck in your own blend | mistake drills |
| D | `dj-business` | the business of djing |what to send a promoter: your set and your song| |
| S | `dj-advanced-complete` | from dj to artist | your own track in your set; the CCD night | |

## Counts

57 song lessons, 133 deeper, 8 bonus rounds, 26 new slugs. Every one of the app's 172 lessons (the 171 plus basics 2) appears exactly once above, checked by `scripts/gen-curriculum.mjs` (it also writes `src/content/curriculum.gen.json`, the structure the app reads), which fails the build the day a slug goes missing or lands twice.

## Changes to paths, worlds and the app (code)

1. `paths.ts` and `chapters.ts` become the structure above: a path lists its song lessons in order and, per song lesson, its deeper and bonus slugs. Old path and chapter ids go away; progress is per slug so nothing is lost.
2. `worldOrder.ts`, the journey, the x of y counts, "next lesson" and the dashboard knobs walk song lessons only. Deeper and bonus lessons show as cards beside their song lesson ("go deeper", "bonus"), on the world view, the lesson list and the done screen ("want more on this? two deeper lessons"). They are also in search and "see all".
3. A lesson that is not yet a YAML file still opens in the old player, with an "old version" tag on its card. Rebuilding a lesson is making its YAML; nothing else changes.
4. Lesson files: `number` is the order inside the world across song, deeper and bonus. Rewards keyed to slugs keep working; add one stripe per path.
5. The song: auto-named on the first add (from a short list like "first light", "two am", plus the tempo), renamable from the song strip and the done screen.
6. New step kinds, one code push before the first lesson that needs each: `tempo`, `loop` (length), `scale`, `arrange`, `mix` with decks and a bank, `set`. Engine: send swing, lfo on lead, stems export.

## Order we build in

World by world, until Param says the world is right:

1. **Structure push (next):** paths, chapters and the journey as above; the journey drawn as your song with its parts lighting up; song, deeper and bonus marks; "old version" tags; counts; next links; auto-named song with rename; "with it / without it" on every done screen. No lesson content changes. Param checks the shape of all three worlds on the preview.
2. **Basics, path by path:** path 1 (amplitude, timbre, the bonus round, the two deeper lessons rebuilt), then paths 2 to 5. Each lesson a push.
3. **Producer, path by path:** paths 1 to 5, then path 6. Better sounds lands with path 3.
4. **DJ:** the mix step kind, then paths 1 to 5.
5. **Rewards that change the interface**, once Param picks what they unlock.

Each push: YAML plus the code it needs, `npm run lessons`, tsc, vitest, cargo test, next build, shots at 390x844 and 1440x900 in light and dark on Chromium and WebKit, a scripted smoke, then the preview link.

## Open with Param

- Basics now opens with the beat (path 1, the pulse), so the first lesson anyone plays is tapping a kick, and producer's "your kick" then makes that kick good. Basics before producer stays.
- The bank for dj: engine loops now, real CCD tracks when cleared. Which tracks?
- Any lesson above in the wrong place, or a path that should split or merge: say so before the structure push, since that push sets the order the learner sees.
