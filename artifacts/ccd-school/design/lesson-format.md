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
    say: ...
  - kind: shape              # one or two real knobs on their own part, hear before and after
    layer: drums
    knobs: [decay, tune]
    say: ...
  - kind: match              # match this sound: a target from hidden settings of the knobs on their own part,
    layer: drums             # matched by ear (switch target and yours, turn the lit knobs, check); a closeness
    knobs: [tune, decay]     # score from the sound and the settings, hints after two tries, and a close match
    target: {tune: 0.3, decay: 0.2}   # is kept in their song. target: each knob's hidden value, 0 to 1
    say: ...
  - kind: ask                # question about what they just heard or made; replaces quiz
    q: ...
    options: [...]
    answer: 0
    why: ...                 # shown after answering; wrong picks can have their own: whyWrong: {1: ..., 2: ...}
    levels: [standard, hard] # optional: only shown at these levels (default all)
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
