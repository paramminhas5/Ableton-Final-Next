# Lesson files, voices and levels (spec, 4 Nov 2026)

One YAML file per lesson in `src/content/lessons/<world>/<nn>-<slug>.yaml`. A compiler (`scripts/compile-lessons.mjs`, also exposed as `compileLessons()` in `src/content/lessons/compile.ts` so tests can import it) turns them into typed JSON used by the app. A bad file fails the build with the file name and step number.

## Settings the learner controls
- **voice**: `mentor` (default), `straight`, `eli5`.
- **level**: `gentle`, `standard` (default), `hard`.
Stored in `src/lib/prefs.ts` (localStorage `ccd.prefs.v1`, synced into progress when signed in). Changeable from the lesson header and `/settings`.

## File shape

```yaml
slug: your-kick
world: producer
number: 1
title: your kick
minutes: 8
song:
  adds: drums.kick          # what this lesson puts in the learner's song: <layer>.<part> | changes: <layer>.<thing>
  why: the kick is the heartbeat, everything else hangs off it
learn:                       # the "what you will walk away with" paragraph, shown before step 1
  mentor: ...
  straight: ...
  eli5: ...
steps:
  - kind: hear               # plays a clip rendered on our engine, then a few words
    clip: kick-alone         # id in src/content/lessons/clips.ts
    say: {mentor: ..., straight: ..., eli5: ...}   # a plain string applies to every voice
  - kind: say                # a short explanation with an optional deeper track
    title: ...
    say: ...
    deeper:                  # optional, collapsed under "go deeper"; each entry is its own mini step
      - title: ...
        say: ...
        try: {...}           # optional interactive, same shapes as `play`/`shape` below
  - kind: play               # the instrument, live, beside the text; records into the learner's song
    layer: drums             # drums | hats | bass | chords | lead | fx | sample
    surface: pads            # pads | steps | keys
    goal: {notes: 4, note: kick}   # what counts as done; checked on the notes recorded
                             # goal.check: [kick, short, key]: write your own, checked (below)
    say: ...
  - kind: shape              # one or two real knobs on their own part, hear before and after
    layer: drums
    knobs: [decay, tune]
    say: ...
  - kind: match              # match this sound: a target from hidden settings of the knobs on their own part,
    layer: drums             # matched by ear (switch target and yours, turn the lit knobs, check); a closeness
    knobs: [tune, decay]     # score from the sound and the settings, hints after two tries, and a close match
    target: {tune: 0.3, decay: 0.2}   # is kept in their song. target: each knob's hidden value, 0 to 1
                             # Knobs are notched while matching (5, 9 or 21 positions by level), marked green
                             # or red after each check, and the step is 3 sounds (2 on gentle): warm-ups first,
                             # this target last.
    say: ...
  - kind: copy               # copy by ear (Building Blocks): a hidden pattern plays, the learner writes it on a
    layer: bass              # grid of only the rows worth trying; notes come back right, wrong (with an arrow) or
    pattern: ". . 1 - . . 1 - . . 1' - . . 5 -"   # missed; unlimited checks, a hint outlines a missing note, stars.
    say: ...                 # drums: {kick: "x...x...x...x...", clap: "....x.......x..."} (x hit, o soft);
                             # a tune: one token per 16th, scale steps of the song's own scale (1 is the root),
                             # ' and , for octaves, b and # for a semitone, + for a chord (1+3+5), . rest, - hold.
                             # 16 or 32 steps. What they copy becomes the lesson's part; a play step after it
                             # starts from it (src/lib/copyEar.ts).
  - kind: imagine            # imagine it first (Building Blocks' Mind's Ear, src/lib/imagine.ts): the notes of a
    layer: lead              # phrase sit on the copy grid with no sound, a silent playhead sweeping them; the learner
    pattern: "1 - 3 - 5 - 3 - 2 - 3 - 1 - . ."   # hums it, then plays two (gentle) or three phrases on their song
    others: ["..."]          # and picks the one they saw, then hears it. pattern: as copy. others: optional, one
    say: ...                 # or two phrases it could be mistaken for; made from the pattern when left out (its
                             # mirror, a note or two moved, a note moved in time; closer on hard).
  - kind: ask                # question about what they just heard or made; replaces quiz
    q: ...
    options: [...]
    answer: 0
    why: ...                 # shown after answering; wrong picks can have their own: whyWrong: {1: ..., 2: ...}
    levels: [standard, hard] # optional: only shown at these levels (default all)
  - kind: ask                # answered by ear: the same ask, carrying sounds made from the learner's own song
    q: Which of these is a backbeat clap?
    part: clap               # the part every sound plays on its own and turns knobs on (default: the whole song)
    with: [kick]             # parts that play under it
    sounds: [{notes: "....x.......x..."}, {notes: "x.......x......."}, {notes: "x...x...x...x..."}]
    options: ["two and four", "one and three", "every beat"]   # sounds: one per option, in the same order; the
    answer: 0                # option shows its letter until picked, so the ear decides, not the words
    why: ...
  - kind: ask
    q: Hear your lead, then with resonance turned up. What does resonance do?
    part: lead
    play: [{res: 0, label: "no resonance"}, {res: 0.85, label: "resonance up"}]   # or one sound: play: {...}
    options: [...]           # play: one sound for the question ("hear it") or two (a and b); the options are words
  - kind: ear                # a generated ear round, not fixed content
    drill: pitch | eq | interval | timbre
    rounds: {gentle: 3, standard: 5, hard: 8}
  - kind: keep               # the last step: plays the song with the new part, one line on what comes next
    next: ...
```

## Rules the compiler enforces
- Every text field is a string or an object with all three voices. Missing voice falls back to `mentor`, and a test warns when a lesson has no `eli5`.
- A `song.adds` or `song.changes` is required. A `play` step layer must match `song.adds` layer unless the lesson `changes`.
- Step kinds are only those above. `ask.answer` must be a valid index; options must be unique; answer position is shuffled per lesson (reuse `shuffleAnswers`).
- No em dashes, no emoji, sentence case titles, lowercase UI labels.
- `clip` ids must exist in `clips.ts`. `knobs` must exist for that layer in `params.gen.ts`.
- Level filtering: `gentle` hides steps with `levels` lacking `gentle` and adds extra hint lines (`hint:`); `hard` raises `rounds` and hides `hint`.

## Runtime
`resolveLesson(lesson, {voice, level})` returns a flat list of resolved steps (strings only). The player renders those. Analytics events carry voice, level, step kind and index.

## Questions you answer by ear (8 Nov)

An `ask` can carry sounds (`src/lib/askEar.ts`). Every sound is the learner's song as it is at the stripe challenge (after the add step), with one thing changed, rendered on the engine through `useEngineTrack`: press a key and that version loops; press another and the loop switches in place, so a and b compare on the same bar. Syntorial's quizzes have audio answers; ours are the learner's own song.

- `part`: what plays and what the knobs turn: a layer (`drums`, `hats`, `bass`, `chords`, `lead`), one drum of the rack (`kick`, `snare`, `clap`, `rim`, `hat`, `open hat`) or `song` (everything, the default). A part the song doesn't have yet plays a default line in the song's key; an empty song gets a kick and a clap.
- `with`: parts that play under it (`[kick]`, or `[song]` for the whole song with only the part's knobs changed).
- `play`: one sound for the question (a "hear it" key) or two (keys a and b). The options stay words.
- `sounds`: one per option, in the option order (they are shuffled with the options). Before an answer each option shows only its letter; a wrong pick shows its words, a right one shows them all.
- A sound is a small map. Keys that aren't reserved are knobs of its part, 0 to 1 as in `match` targets (`cutoff`, `tune`, `decay`, `send`, `echo`, `pan`, `duck`...; the same knob a match or shape step turns). Reserved: `part` and `with` (override the step's for this sound), `notes` (a copy pattern: a drum map, one drum's row like `"x...x...x...x..."`, or a tune line), `scale` (the Live scale its notes are read in, so one line can be heard major then minor on the song's root), `mute` (parts that drop out), `bpm` (60 to 180), `swing` (0 to 0.75), `master` (`{glue: 0.8}`, `{out: 0.4}`), `label` (the key's words, 18 characters at most).
- A sound that turns `duck` up on a part with no duck routing ducks under the kick.
- The compiler names the step and the problem: a knob the part doesn't have, a knob without a part, a value outside 0 to 1, sounds that don't match the options, two options that sound the same, a bad pattern.
- The screen: the stripe challenge (`FileLesson.tsx` CheckStep, keys in `AskEar.tsx`), one play key per option beside its pick, "no sound here? skip this one" before answering, "skip the challenge" as before. Tests: `tests/ask-ear.test.ts`.

Keep an ask as words only where the answer is a fact (a name, a shortcut, a rule, a number).

## Write your own, checked (8 Nov)

A `play` goal can list `check`: what can be heard in the notes the learner writes (`src/lib/briefCheck.ts`). After a take, "what it heard" says each in plain words (a green tick, or an amber arrow with what to try). Checks never block: the goal's count is still the only gate, and taste is the learner's.

`key` (every note in the song's key), `pentatonic` (only the five pentatonic keys of the song's scale), `kick` (no note on a kick), `backbeat` (hits on two and four), `bar` (notes in both halves of the loop), `home` (ends on the root), `moves` (more than one note or chord), `chord` (notes in the chord playing under them), `roots` (bass notes on the roots of the chords above), `short` (notes half a beat or shorter), `repeat` (the second half comes back with the first half's rhythm). Tests: `tests/brief-check.test.ts`.
