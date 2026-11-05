# CCD School: the learning rebuild plan

Written 4 Nov 2026 from Param's feedback after playing the lessons, Studio, Stage and Ear Gym on school/field (b0cec4b). This plan comes before the rest of the 100% brief. Lives in the project as `ccd/school-learning-plan.md` and in the repo as `artifacts/ccd-school/design/learning-plan.md`.

## What Param said

Grouped from his message, in his terms.

**Lessons**
- A bunch of one-line statements. I don't know what the lesson is about in the wider world, what I'll learn, why, or how it helps me.
- Lesson one talks about hertz to a beginner. It has to hook me and make me want to come back. It can't be boring.
- The voice is not a seasoned, kind pro who loves music and wants to help me make a song.
- Why am I adding hats straight away? What is this track? Everything should start from scratch. My song should be built lesson by lesson from what I learnt, and it should be guided.
- Each lesson should be contextual and wonderful: teach me something, and add to my song.
- We had a flow/snake view, deeper lessons, different tones and a hard mode. Use all of it.
- The content has to be easy to add to, edit and change, fast. Maybe switch tones for different people.

**Screens**
- On desktop the buttons float and cover the screen. The lesson screen has huge gaps. Where are the long-form screens? Use the whole desktop: the lesson and the instrument together, so I can play while I learn.
- Today has a lot of empty room and a gap when scrolling. The meter does nothing. The whole screen should be interactive.
- I should be able to reset, save my current track, start a new one, edit tracks, and go to the track view from anywhere.

**Instrument**
- Studio needs a reset button, not just undo. I'm not sure the knobs, effects, filters and parameters work, and they need to be world class.
- The stage is a really good idea. Perfect it: let me make things louder and place them differently. The mix keeps switching and it's janky.
- Different instruments, and parts from different instruments, so people learn things like patch cables.

**Practice**
- The sim in step two didn't load. A sim asked me to hold and drag at the same time.
- Don't force me to listen through in an ear exercise.
- The band exercises ask the same question with the same sound. The point of ear training is varied sounds and lots of exercises.

**Quality**
- Where is all the content, and how are we scoring and improving it? This should happen on a schedule.
- Build tests for every lesson, taken by different kinds of people who will use this.

## What we found in the code

Every complaint has a cause. These are facts from reading the code and walking the first lesson at 1440x900.

| Complaint | Cause |
|---|---|
| Lesson one offers hats | `offerFor()` in `src/lib/track.ts` picks the layer with a regex over the slug and title. `/hat/` matches "w**hat**", so what-is-sound, what-is-djing and what-is-live all offer hats first. There is no authored song plan; the regex decides. |
| One-liners, no context | The schema rewards it: a hook headline of 8 words or fewer, a `keyFact`, a summary of short strings. The "you'll learn" list is the summary repeated. Only `synth-filters` is in the adult voice; the other 115 deep lessons use the hook, concept, quiz template. |
| Hertz to a beginner | Basics opens with sound physics (what-is-sound, frequency-pitch, amplitude) before anyone has made a sound they care about. |
| Starts on someone else's track | Try it records over `practiceTrack(readTrackV2())`, a shared loop whose earlier layers came from other lessons or presets. There is no "your song starts empty". |
| Tones, hard mode, snake view | No tone system exists. Hard mode data (`quizHard` in `lesson-deep*.ts`, a `difficulty` field in progress) exists but nothing in the UI reads it. The snake path view was deleted on 3 Nov (8425b11) with the old pages. |
| Editing content is slow | All 171 lessons are hand-written TypeScript in about 20 files. No CMS, no file per lesson, no preview, no editor. |
| Buttons cover the screen on desktop | `.ls-bottom` is `position: fixed` across the full viewport; the lesson column is 520 px wide in the middle of the screen. Sims taller than the reserved 118 px slide under the keys. |
| Gaps on the lesson screen | `.ls` is full height with `flex: 1`, so short steps stretch, and the narrow column leaves both sides empty. |
| Today meter does nothing | It is display only (daily xp out of 50). The scroll gap is the fixed mode bar with no background and 120 px of padding. The footer sits under the nav keys. |
| No reset in Studio | There is no clear pattern, clear layer or reset song. Undo exists but lives in memory only (lost on reload) and redo has no key. Songs (new, copy, rename, delete) exist but hide behind a 74 px tag. |
| Knobs don't seem to work | Most do reach the engine. Three real bugs: on a hats layer in steps or rolls, the sound knobs edit pad 0 (the kick), which a hats layer never plays; swing is stored but never sent to the engine; knobs moved before the first click are silent until a click. The lead XY filter and riser are live only and snap back. |
| Stage keeps switching | Holding the stage background for 180 ms triggers before/after compare, so dragging near a dot flips the mix. The headline clash is re-ranked every frame, dots jump between measured and estimated positions, and overlapping dots get nudged every frame. Loudness can't be set on the stage at all. |
| Same band question, same sound | The `frequency-bar` lesson question plays one fixed sweep and the answer is always "midrange". The eq-cut drill always plays one 220 Hz saw note. The Ear Gym uses one kit and one pattern, and its labels repeat (63 and 125 Hz both say "low"). Practice-for-a-heart loops the same few questions. |
| Sim in step two didn't load | About 30 lessons put an ear-training sim at step two with preset modes that don't exist (`high-low`, `intervals`, `chords` versus the code's `interval`, `chord`). The sim throws, and Retry can't recover because the failed import is cached. |
| Hold and drag at once | `DecibelMeterSim` plays the tone only while a button is held, and the fader is a separate control. That needs two pointers. Rolls in Studio have the same pattern. |
| Patch cables | No modular concept in the engine or UI. Each layer has a fixed chain. |
| Scoring content | No quality scores. Analytics fire lesson started, screen viewed and completed only; no per-answer, time-per-step, take or add-to-song events. |

## The idea that ties it together

**You make one song, and every lesson makes it better.**

You start a world with silence. Each lesson teaches one thing you can hear, lets you play it on a real instrument on the same screen, and leaves something in your song that wasn't there before: a kick, then hats that make it move, then a bass line, then chords, then the drop. You always know what your song is, what this lesson adds and why. At any moment you can play it, open it in the Studio, change what you made, reset it, or save it and start another.

Everything else (voice, tones, desktop layout, Ear Gym, scoring) serves that.

## 1. How a lesson works

### The shape
Lesson shapes vary by topic (a long guided build, a 3-minute listening drill, one question with a story behind it), but every lesson has five beats:

1. **Hear it.** It opens with sound, not words: a real moment from a track or a loop rendered on our engine. Then one or two sentences in the teacher's voice about why this matters and where you'll hear it.
2. **What you'll walk away with.** A short paragraph, not a list: what you will be able to do, why it matters for your song, and a preview of how your song will sound after. "Adds to your song" shows the song as it is now and what will change.
3. **Do it, then name it.** You play first. The idea is explained on the thing you just made ("those four hits are quarter notes; at 120 bpm that's two a second"). Theory arrives when it's useful, never before you have a reason to care. Hertz shows up when you tune a bass, not in lesson one.
4. **Shape it.** One or two real controls you change and hear in your own song (decay, swing, cutoff), with before and after.
5. **Keep it.** Questions are about what you just heard and did, not trivia. Your song plays with the new part. A line about what comes next and why ("next time: hats, so it starts to move").

The old pattern (hook, concept, quiz, concept, quiz, summary) and the `flagship.test.ts` rules that enforce it (8 to 13 screens, at least 3 quizzes) are retired. New rules check the five beats instead.

### Sample: the first producer lesson, rebuilt
- **Hear it:** a 4-bar house loop plays. Everything drops out except the kick. "That thump is what a room moves to. In the next ten minutes you'll make your own."
- **Walk away with:** a kick that lands on every beat, the reason four-on-the-floor works on a dance floor, and the difference a short or long kick makes to the whole groove. Your song: empty now, a kick after.
- **Do it:** the drum pads sit next to the text with the click running. Tap along. The lane fills as you play. Then the four hits get named.
- **Shape it:** decay. Short and tight, then long and boomy, in your own loop.
- **Keep it:** "which one sounded tighter?" played back from what you made. Your song now has a kick. Next: hats.

The current basics world gets resequenced the same way: rhythm and the kick first, pitch when the bass arrives, chords when chords arrive, sound physics folded into the lessons where it explains something you just heard.

### Voice
`ccd/school-voice.md` (still to write, per the content handoff) sets the voice: a seasoned producer who loves music, talking to an adult, warm and specific, starting from something you hear or do. No slogans, no key-fact boxes, no neat moral at the end. Real tracks, real menu paths, real settings. No invented personal stories: real ones come from a 30-minute interview with Param, used only as he tells them.

## 2. The song spine

- **A song plan per world**, written as data: section by section, which lesson adds or changes which part, and the musical reason. Each lesson declares exactly what it does to the song (`adds: drums.kick`, `changes: hats.swing`, `adds section: breakdown`). This replaces the regex.
- **Your song starts empty.** Try it records over your song as it stands, never someone else's loop. If you skip, a sensible default part goes in, and you're told it can be redone.
- **Your song is always one tap away.** A song bar in every lesson and on Today: name, play, open in Studio, and a list of songs.
- **Manage songs properly:** new, save as, rename, duplicate, delete, reset to empty, and reset to how a lesson left it. Every part shows which lesson made it, so you can go back and redo that lesson's part.
- **Arrangement grows with the worlds:** a loop in the first lessons, then sections (intro, build, drop, break) later, so a finished world is a finished, exportable song.
- **DJ and basics** get the same idea in their own form: a mix that grows track by track for DJ, a beat for basics.

## 3. Content that's fast to change

### One file per lesson
- Lessons move out of TypeScript into `content/lessons/<world>/<nn>-<slug>.md`: frontmatter (slug, world, song change, level, controls used) and step blocks in plain text.
- A compiler turns them into typed JSON at build time and validates everything: steps, sim presets, song changes, answers, links. A bad preset like the one breaking step two can no longer ship.
- An edit is one small file, so a change Param asks for is a diff he can read, and the preview rebuilds on push in about two minutes.

### Tones and levels
Two separate settings, chosen at the start and switchable from the lesson header.

- **Voice** (how it's said):
  - **mentor**, the default: warm, unhurried, explains why.
  - **straight**: short and direct, for people who want the facts and the doing.
  - Param can name others; adding a voice means adding text blocks, not code.
- **Level** (how hard):
  - **gentle**: more help and fewer questions.
  - **standard**.
  - **hard**: harder ear rounds, more and tougher questions, fewer hints. It reuses the existing `quizHard` banks and the stored `difficulty`.
- A step can carry text per voice and appear only at some levels.

**Flow and free modes** stay (hearts versus no hearts), shown as a clear switch in the header. The snake path comes back as the world view of your song's progress: the lessons as a path, each one showing what it added.

### Preview and edit
- **Phase 1:** an admin page lists every lesson and shows every step side by side per voice and level, with its song change and its scores.
- **Phase 2:** edit text in the app. Drafts go to a database table and show only on the preview, then get exported into the lesson files for Param to approve.

## 4. Desktop and layout

- **The lesson becomes a workspace from 900 px:**
  - left: the lesson as a long-form page you can scroll back through
  - centre: the instrument, always live
  - right: your song
- On phones it stays one column, with the instrument in a sheet.
- No full-width fixed bar: the go key belongs to the lesson column, in the flow of the page.
- Short steps don't stretch; nothing renders under a fixed key.
- **Today becomes a place you play, with no dead tiles:**
  - your song with play
  - the next lesson with a playable preview
  - one ear round answerable right there
  - practice due
  - the daily goal as a key that starts a 2-minute session
- The mode bar gets a backing so content doesn't show behind it, and the footer clears it.
- The tablet board (ZTablet) is the reference for Studio at desktop width: layers on the left, the surface in the middle, shape and mix on the right.

## 5. Studio

- **Reset**, with undo behind it:
  - clear this pattern
  - clear this layer
  - reset the song to empty
  - reset to how a lesson left it
- **Undo that survives a reload**, a redo key, and shortcuts (Cmd or Ctrl Z, Shift Cmd or Ctrl Z).
- **Songs visible** in a proper song bar, not a 74 px tag.
- **Fix the three bugs:**
  - hats sound knobs edit the kick
  - swing never reaches the engine
  - knobs are silent before the first click
- Make the lead XY filter and the riser recordable, or say on screen that they're live only.
- **Prove every control does something:** an automated test renders the engine offline before and after each knob move and checks the sound changed (spectrum, level or timing). A control that changes nothing fails the build.
- **World class:** follow `ccd/engine-sound.md` in order:
  - a nonlinear ladder plus diode and state-variable filters
  - wavetable and unison oscillators
  - circuit-style 808 and 909 drums
  - modulated reverbs, tape echo, a glue compressor and a true-peak limiter
  - stereo chords
- Nothing is called "as good as" anything until Param has compared it by ear.

## 6. Stage

- **Compare** moves to its own hold key, off the stage background.
- **Calm the motion:**
  - the headline clash only changes when a new one leads for more than about 1.5 s
  - dots glide instead of jumping
  - quiet parts keep their last measured place instead of falling back to an estimate
  - dots stop being nudged every frame
- **Real stage controls:**
  - left and right is pan
  - front and back is how present a part is: level, plus less reverb at the front and more at the back
  - pinch or scroll sets width
  - dot size reads loudness
  - master loudness, and a choice of where to stand: dj booth, middle of the floor, bar
- **Pacing** (needs Param's meaning, see questions): either energy over time (sections, builds and drops on a timeline), or tempo and feel.

## 7. Ear training

- **Generated, varied rounds:**
  - Each round picks a source (drums, bass, piano, pad, full loop, our own synths), a band, an amount and a direction.
  - At least 30 distinct sound and question combinations per level.
  - Never the same round twice in a row.
- **Clear band names:** sub, low, low mid, mid, high mid, presence, air, with the Hz alongside.
- **No forced listening.** Answer whenever you know. Replay and A/B switch instantly as often as you like.
- **Adaptive:** a streak raises the difficulty, a miss lowers it. Hard mode starts higher.
- Lesson listen steps and practice-for-a-heart use the same generator, so practice never loops one question.
- Tests check variety (count unique rounds) and that no round needs two pointers or a full listen.

## 8. Sims, instruments and patching

**Now:**
- Fix the preset names and validate presets at build.
- Retry re-imports a failed sim, and there's a skip.
- One-pointer rule for every sim: the decibel sim plays while you drag the fader; rolls become a latch.

**Then:** move the 47 sims onto the engine and the Model 1 look (item 4 of the brief), starting with the ones in the first 20 lessons. Many become the Studio itself, because the lesson and the instrument are now the same screen.

**Instrument families,** so learners meet real hardware and plug-in types:
- drum machine (808 and 909 style)
- mono synth
- poly synth
- sampler
- keys
- a small modular

**Patching, in two steps:**
1. A patch view of what exists: each layer's chain shown as modules with cables, effect slots you can reorder, and an LFO you can drag onto any knob.
2. A modular layer in the engine (oscillators, filter, amp, two envelopes, two LFOs, a mod matrix shown as cables). Lessons teach real signal flow on it.

## 9. Testing: every lesson, taken by different people

### Lesson tests (automatic, every push)
For each lesson, at 390x844, 1024x768 and 1440x900, in Chromium and WebKit:
- every step renders and every sim mounts without an error
- every interaction works with one pointer and with the keyboard
- nothing is covered by a fixed element
- the song change is exactly what the lesson declares
- the song renders non-silent through the engine
- the lesson fits its time budget

The journeys get rewritten against the new player once it's settled. Rewriting them now, against a player that's about to change, would be wasted.

### Persona test takers
An agent plays each lesson as a specific person: it drives the browser, reads what's on screen and says where it was confused, bored, lost the why, or couldn't do something.
- **total beginner on a phone:** never made music, impatient, came from Instagram
- **stuck bedroom producer on a laptop:** knows a bit of Ableton, has loops and no songs
- **DJ crossing over:** knows rekordbox, wants to make edits
- **experienced producer on hard:** hunting for wrong claims
- **older learner, English as a second language:** plain words, Hindi later
- **keyboard-only and screen reader user**
- **low-end Android on slow data**

Agents are a first filter, not proof. The five-beginner test with real people from the content handoff stays, and real usage data outranks both.

## 10. Scoring and improving on a schedule

**A scorecard per lesson,** 0 to 5 on each:
- sound before words in the first 15 seconds
- the why is clear
- jargon explained when used
- share of time spent doing
- adds something real to the song
- sounds like a person
- accurate
- every interaction works
- length fits

Persona notes and checks fill it now; usage fills it once people use it.

**Usage events to add:**
- each answer, with the option picked
- time per step
- replays
- take recorded, skipped, or added to the song
- drop-off step

**A weekly scheduled task:**
- runs the persona pass on a rotating set of lessons
- updates the scorecard
- rewrites the five lowest on a branch with a note on what changed and why

Nothing merges without Param. The scorecard is a dashboard he can open any time.

## Order of work

**A. Fix what's broken (first, small, each with a test)**
- hats regex
- sim step-two crash and Retry
- hold and drag
- hats knobs editing the kick
- swing never sent
- silent knobs before the first click
- Stage compare and flicker
- ear repeats and forced listening
- desktop fixed bar and gaps
- Today gap and footer
- Studio reset
- visible song bar

**B. Prove the new lesson (the gate)**
- lesson files and compiler, preview page, voice guide
- song plan for one world
- the desktop lesson workspace
- three lessons rebuilt end to end in two voices and hard
- persona run on them

Then Param plays them. Nothing is rolled out until he says these three are right.

**C. Roll out**
- World by world: the producer song first, then basics resequenced, then DJ.
- Lesson tests and persona runs per lesson.
- Scorecard live, weekly schedule on.
- Analytics events added.

**D. The instrument**
- Studio world-class pass
- stage perfected
- Ear Gym bank
- sims onto the engine
- instrument families and patching

**E. Then the rest of the original brief**
- item 3, getting music out
- item 5, the CCD stage showcase and DPDP privacy
- item 6, the final pass
- the old Path, Playground and Match pages get replaced or rebuilt when C and D touch them

## Open questions for Param

- **Which world first?** The proposal is producer, because it builds the song.
- **Voices:** are mentor, straight and a hard level right? Any other tones?
- **Interview:** 30 minutes for real stories (first club set, early mistakes, tracks that taught you something). Or answer a written list.
- **Stage:** what "pace it differently" means.
- **Still waiting on Param:**
  - a reaction to `ccd/school-pro.md`
  - a verdict on the synth-filters sample
  - ADMIN_PASSWORD, Google sign-in, Razorpay and Stripe keys, VAPID_EMAIL
