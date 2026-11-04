# Brief: rebuilding a deeper lesson as a lesson file

You are rebuilding old CCD School lessons as YAML lesson files for the new player. Work only in
`/home/claude/ableton-final-next/artifacts/ccd-school`. Write only the YAML files you are assigned. Do not edit
any other file, do not commit, do not run `next build` or a dev server.

## What a deeper lesson is
A short optional lesson (4 to 6 minutes) that hangs off a song lesson. The learner is making one song across
the app. **Every deeper lesson acts on that song**: it plays, the one new control is on screen, they move it,
hear it on their own parts, and keep it or not. Where the topic is Ableton Live itself (a menu, a view, a
device), do the same idea on our instrument first, then put the Live specifics (menu paths, device names,
shortcuts) in a `deeper:` fold-out. The "does to the song" for each slug is in `design/curriculum.md`; follow it
as closely as the available steps allow.

## Facts
The old lesson for each slug is in `src/content/*.ts` (search for `slug: "<slug>"`, files like
`missions.ts`, `missions-foundations.ts`, `missions-dj.ts`, `missions-synths.ts`, `flagship-*.ts`,
`lesson-deep*.ts`, `missions-producer-screens.ts`). Use its facts (they were checked against the Live 12
manual and rekordbox docs). Do not invent facts, numbers, menu paths or track names. If unsure, leave it out.

## File shape
`src/content/lessons/<world folder>/<number>-<slug>.yaml`, world folder `foundations`, `producer` or `dj`.
`number` must equal the filename prefix and be unique in that folder: use only the range you are given.
Copy the shape of `src/content/lessons/producer/06-kick-and-bass.yaml` and
`src/content/lessons/foundations/07-amplitude-volume.yaml` (read both first).

```yaml
slug: <old slug, exactly>
world: <foundations|producer|dj>
number: <in your range>
title: <lowercase, sentence case, no capital after the first word>
minutes: 5
song:
  changes: <layer>.<part>     # layer = the layer your shape step uses (lead, bass, chords, drums, hats); part = lead, bass, chords, kick, hats
  why: <one line: what this does to the song>
learn: >-
  <one or two sentences>
youCan:
  - <two or three short lines>
steps:
  - kind: hear          # opens with sound
    clip: <clip id>
    say: {mentor: >- ..., straight: >- ..., eli5: >- ...}
  - kind: say           # optional: the idea, one idea per paragraph, with deeper: fold-outs for Live specifics
  - kind: shape | tempo | arrange | play   # the hands-on step on their song (see below). One, sometimes two.
  - kind: ask           # two to four, easy to hard, each with whyWrong for every wrong option, author answer: 0
  - kind: keep
    next: >-
      <one line pointing back to the song path>
```

Every `say` text (in hear, say, shape, tempo, arrange, play steps) carries all three voices as a mapping:
`mentor` (full, warm, excited about the cool part, explains new words), `straight` (short, plain),
`eli5` (very simple). Use `>-` block scalars for all prose. In plain one-line values (`why`, whyWrong lines,
options) never write `word: word` (a colon followed by a space breaks YAML) and never start a value with a
quote mark.

## Hands-on steps you can use
- `shape`: `layer` + `knobs` (1 to 4). Knobs by layer:
  - lead: cutoff, res, attack, release, glide, wave, detune, env
  - bass: cutoff, res, env, glide, decay, wave, sub, drift
  - chords: voicing, spread, attack, release, cutoff, res, env, drift
  - drums (the kick pad): tune, decay, drive, level
  - hats: decay, tune
  - any layer also: low, mid, high, cut (eq), drive, crush, echo, tone, level, pan, send (reverb), duck (sidechain under the kick)
- `tempo` with `set:` tempo (marks: bpms), swing, scale (choices: [minor, major]), glue (master compressor and out), kit (synth or recorded drums)
- `arrange` with `goal:` sections, drop, fills, risers, export
- `play` with `layer`, `surface` (pads or keys), `goal: {notes: N}` (or `{notes: 4, note: kick}` for on-beat kicks), optional `snap: true`
- `mix` (dj only) with `goal:` crossfade, match, blend, swap, key, cut, phrase, echo, free; optional `bank:` warm-up, operator, morals, simon, skywalker, space-bass, sandman

Clips for `hear` (and `say` with `clip:` for a count-along): kick-alone, kick-and-clap, four-on-the-floor,
short-vs-long-kick, two-tracks, synth-note, synth-pitch, synth-loud, octave, synth-shapes, subdivisions,
straight-vs-swung, hats-offbeat.

## Voice rules
Plain, warm, specific, excited about the cool parts. One idea per paragraph. Explain a new word where it
first appears. Lowercase UI words. No em dashes anywhere. No slogans, no "key fact" boxes, no neat moral at the
end. Talk about "your song", "your lead", "your kick". Questions only on what the lesson explained.

## Check
After writing each file run `npx tsx scripts/compile-lessons.mjs` from the app folder and fix every error it
reports for your files (it checks fields, clips, knobs, voices, em dashes). Ignore errors in files that are not
yours (someone else may be mid-edit). At the end, report the list of files you wrote and anything you could not
make act on the song.
