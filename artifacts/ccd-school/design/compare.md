# CCD School against the best DAWs, synths, grooveboxes and DJ apps

5 Nov 2026. What the best tools do that we don't, what we do that they don't, and what we build next. Every outside claim has its source. The earlier screen research (OP-1, Note, Move, Pigments, Koala, Elektron, djay, Melodics and others) is in `research-instrument-ui.md`; its twelve moves are now built (`school-fixes.md` 157 to 165), so this doc covers the next layer.

Two rules from Param run through all of it:
- **No invented names.** A learner who finishes CCD School should recognise every control in Ableton Live, Serum, Vital or a hardware synth. Ableton's name comes first (the lessons teach Live), then the name most synths share. Done 5 Nov (5035208 to a536bb9): the filter "character" is now **circuit** with Live 12 Auto Filter's prd, ms2 and svf; "wave" is **shape** (position, feedback or dcw by osc type); the resonator voices use Collision and Tension names (exciter, decay, stiffness); drums use Drum Sampler names (pitch env, noise decay); step locks are **p-locks**. Engine param ids didn't change, so saved songs still load. The full table is in `design/naming.md` in the repo; Vital's names were added from its own source and rekordbox's from its manual, and Serum 2 has only SEM and MAIN because the rest of its manual is not online.
- **Teach the other instruments too.** Every control gets a "same control elsewhere" note (live, serum, vital, hardware), like Syntorial's free transfer lessons for Serum and Massive ([ProducerHive](https://producerhive.com/?p=13321)).

## What we have that they don't

No single feature below is unheard of. What no other tool does is put them together around one song the learner is building.

1. **Every lesson acts on your own song.** One song grows across basics, producer and dj, and every done screen says what changed ("+ bass · 120 to 128 bpm · cutoff 1.2 khz to 800 hz"). Syntorial teaches by matching hidden patches (706 of them), not by building your track ([ProducerHive](https://producerhive.com/?p=13321)). Melodics and Yousician grade your playing on their songs, not yours.
2. **Hear the difference, before and after, on every lesson,** and a blind, loudness-matched a/b of the engine itself on /sound. No DAW ships a blind test of its own sound.
3. **One instrument, one school, one DJ booth.** The song you made is on deck a in the dj lessons, and the moves you practise leave cues on it. rekordbox, djay and Serato teach nothing; Live teaches nothing about djing.
4. **It reads and writes your Ableton Live set** (Build a Set, Do it in Live, Check my Set). Learning apps stop at the app.
5. **A per-hit timing verdict in ms on your own parts,** and "faster" after three clean takes. Melodics does this on its own exercises ([ProMusicianHub](https://promusicianhub.com/melodics-review)); we do it while you write your song.
6. **The lesson lights only the control it teaches** and dims the rest, then explains it "another way" or "simpler" on request.
7. **A measured engine.** Every knob has a test that proves it changes the sound, every engine change ships with before and after numbers (`school-engine-plan.md`). Plugin makers publish none of this.
8. **Runs in a browser on a phone** with the same engine as the desktop. Vital, Serum and Live don't run on a phone; Note and Koala don't run on a laptop.

## What they have that we don't, ranked by how much it would make CCD more intuitive

"Have" says what we already have. "Build" is the plan.

### Touch the sound directly
1. **Drag on the picture.** Vital: "Both envelopes and LFOs are easy to edit via the display", with "real time and colour coded visual feedback" ([MusicRadar](https://www.musicradar.com/music-tech/plugins/fantastic-free-plugins-and-how-to-use-them-vital)); Serum 2 adds LFO drawing tools ([Xfer, Serum 2 What's New](https://static.xferrecords.com/Serum%202%20What's%20New.pdf)). Have: the envelope and filter pictures move with the knobs, but you can't grab them. Build: drag the filter knee (left-right cutoff, up-down resonance) and the envelope's corners, with the knobs following.
2. **Drag to modulate, with a ring showing the amount.** Vital: "Modulators can be assigned to parameters simply by dragging their assignment icons" (MusicRadar, above); Pigments keeps unused sources dark and draws a coloured ring ([Sound On Sound](https://www.soundonsound.com/reviews/arturia-pigments)); Live 12's new modulation "no longer takes over the parameter, so you can still adjust it" ([Ableton](https://ableton.com/en/live/all-new-features)). Have: an lfo with a three-way "lfo to" switch. Build: drag the lfo or envelope onto any knob; the knob gets a ring for the amount; the knob still turns.
3. **Compare two settings with one key.** Live 12.3 added device A/B states, switched with the P key ([MusicRadar](https://www.musicradar.com/music-tech/stem-separation-splice-integration-ableton-is-playing-catch-up-with-live-12-3-but-its-best-new-features-are-the-ones-hidden-beyond-the-headlines)). Have: hold to compare in the mix. Build: an a/b key on every instrument, level-matched, so a learner hears what their tweak did.
4. **A scope and spectrum on every sound** (Vital, Serum; Live 12's Auto Filter and Erosion now visualise in real time ([Ableton](https://ableton.com/en/live/all-new-features))). Build: one small scope on the instrument screen and a spectrum on the mix.

### Write music without knowing theory yet
5. **Keys and scales everywhere.** Live 12 sets a clip scale that the editor and Push follow ([Ableton](https://ableton.com/en/live/all-new-features)); Serum 2's keyboard has key and scale ([Xfer](https://static.xferrecords.com/Serum%202%20What's%20New.pdf)); Bitwig 6 has a project-wide key ([Synth Anatomy](https://synthanatomy.com/2026/03/bitwig-studio-6.html)). Have: major and minor on the pads and lanes. Build: Live's full scale list on every keyboard, pad and the piano roll, out-of-key notes dimmed or folded, the song's key shown everywhere.
6. **Chord tools.** FL's chord stamp and chord progression tool ([Image-Line](https://www.image-line.com/fl-studio-learning/fl-studio-online-manual/html/basics_new_25.htm)); Logic's Chord Track, which the session players follow ([Sound On Sound](https://www.soundonsound.com/techniques/logic-pro-session-players)); Live's Expressive Chords. Have: chord pads in key. Build: a chord track for the song with chord names and roman numerals, and the bass and lead suggesting notes from it.
7. **Generators with a few honest controls.** Logic's Drummer has two sliders, Complexity and Intensity, plus Fill Amount and Swing ([Sound On Sound](https://www.soundonsound.com/techniques/logic-pro-session-players)); Live 12 has MIDI Generators, and 12.3 adds Patterns (percussion) and an acid bassline generator ([MusicRadar](https://www.musicradar.com/music-tech/stem-separation-splice-integration-ableton-is-playing-catch-up-with-live-12-3-but-its-best-new-features-are-the-ones-hidden-beyond-the-headlines)). Have: fill and randomise with an amount, euclidean rhythms. Build: a drummer and a bass player with complexity and intensity that write into your song as notes you can edit (Logic converts them to MIDI regions the same way).
8. **Transformations.** Live 12: strum, ornaments, connect, acceleration curves ([Ableton](https://ableton.com/en/live/all-new-features)). Build: strum, humanize and velocity shape on the piano roll, each one key with an amount.
9. **Chance and conditions.** Live 12 adds probability per note and "play one random note from a chord" ([Ableton](https://ableton.com/en/live/all-new-features)); Elektron's trig conditions play a step every second bar, or only during a fill ([Elektronauts](https://www.elektronauts.com/t/fill-conditioned-effects/41223)). Build: chance per step (a p-lock you already know how to set), and the 1:2, 1:4 and fill conditions.

### Play it live
10. **Punch-in effects.** The EP-133's twelve momentary effects are pressure controlled ([Sound On Sound](https://www.soundonsound.com/reviews/teenage-engineering-ep-133-ko-ii?amp)); Push 3 got an XY mode with punch-in effects in 12.3 (MusicRadar, above); djay has crossfader fx ([DJ TechTools](https://djtechtools.com/2023/12/06/algoriddims-djay-pro-5-0-is-here-hyper-fast-stem-separation-flexible-beat-grids)). Build: hold a key for stutter, filter sweep, tape stop or a reverb throw, with how hard or where you press setting the amount.
11. **Commit and carry on.** The EP-133's Commit "lets you build an idea, then create variations and song sections without stopping" (SOS, above). Build: one key that copies the loop into the next section of your arrangement.
12. **Per-part loop length and swing.** Elektron and Push run each track at its own length; Live has a groove pool. Have: one loop length and one swing. Build: length and swing per part.

### Learn with your ears
13. **Match this sound.** Syntorial plays a hidden patch and you turn knobs until yours matches ([ProducerHive](https://producerhive.com/?p=13321)). Build: a challenge on your own instruments: hear a target, turn the lit knobs, get a closeness score from the sound and the settings, then keep it in your song.
14. **An answer to any question.** FL Studio 2025's Gopher answers questions about FL and production in plain language ([Image-Line](https://www.image-line.com/fl-studio-learning/fl-studio-online-manual/html/basics_new_25.htm)). Needs Param: it costs money per question and needs an api key.

### Samples and djing
15. **Stems from your own files.** Live 12.3 splits drums, vocals, bass and other ([MusicRadar](https://www.musicradar.com/music-tech/stem-separation-splice-integration-ableton-is-playing-catch-up-with-live-12-3-but-its-best-new-features-are-the-ones-hidden-beyond-the-headlines)); djay's Neural Mix runs on the device in real time (DJ TechTools, above); rekordbox has Track Separation ([rekordbox](https://rekordbox.com/en/feature/djing/)). Have: stems on the bank tracks. Needs Param: an on-device model is a large download; a server model costs money.
16. **Sounds like this.** Live 12's Sound Similarity Search and Drum Rack swapping ([Ableton](https://ableton.com/en/live/all-new-features)). Build later, from our own kit: "swap this kick for one like it".
17. **Phrase analysis on your own files** (rekordbox shows song structure under the waveform, above). Have: phrase labels on bank tracks. Build: guess phrases on a learner's own file from its energy.
18. **Resample.** Koala's resampling "to another pad with effects applied" (see `research-instrument-ui.md`). Build: bounce the loop onto a sampler pad.

### Everyone
19. **Screen readers and a high contrast theme.** Live 12 made core workflows work with screen readers and added a high contrast theme ([Ableton](https://ableton.com/en/live/all-new-features)). Have: keyboard play, aria on knobs and pads. Build: a high contrast theme and a screen reader pass on the studio.

## Build order

Done: renaming to industry names and the "same control elsewhere" notes (shown under every shape step, on the studio after a knob turns, and in the glossary).

Built 5 Nov, in two parallel streams (`school-fixes.md` 170 to 181):
- **Touch and hear (0035d7b to a71db29):** 1 drag on the picture, 2 drag to modulate, 3 a/b, 4 scope, 13 match this sound.
- **Write and play (to 826c5a2):** 5 scales, 6 chord track, 7 drummer and bass player, 8 transformations, 9 chance and conditions, 10 punch-in effects, 11 commit, 12 per-part length and swing.

Match this sound is in the ear gym now (`design/engine-plan.md`, leftovers (screens)). The rest of the leftovers are built too (engine-plan.md, "After engine 2: leftovers (engine)"): modulation sources on drums, fx and the sampler; rings that move while playing; chance in the midi export (as heard, or every note); free-running part lengths; punch-in effects recorded into the song; sample-exact p-locks.

Waiting on Param: 14 (assistant, cost), 15 (stems on your own files, cost or download size). Later: 16 to 19.

## Sound against Vital and the open-source synths

Param asked for our sound to be compared with Vital and other open-source instruments, and to beat them. The plan: render the same notes through Vital (as Vitalium), Surge XT, Odin 2, Dexed, Geonkick, Dragonfly Reverb and CHOW Tape inside the private workspace, and put both through the same measurements we use on our engine (aliasing, filter behaviour, kick shape, reverb decay and smoothness, tape wow). Then publish loudness-matched blind pairs for Param's ears and fix wherever ours measures worse. Running outside code needs Param's okay first (asked 5 Nov, 17:00). Until a blind test says otherwise, nothing in the app or marketing claims ours sounds better than any of them.
