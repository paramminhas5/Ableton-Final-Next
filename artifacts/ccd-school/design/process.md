# CCD School: the one process (4 Nov 2026)

This is the single doc for how a lesson gets made, checked and shipped. It replaces the rules
spread across `lesson-format.md`, `voice.md` and the persona notes. When those disagree with
this file, this file wins. Every change Param asks for that is a rule (not a one-off fix) gets
added here, so the next lesson starts from it.

## What the learner is doing

They are making a song. Every lesson adds one part to it. Learning is how they get there, not
a test they sit through. So:

1. The song is always on screen, at the top, with a play button. Never at the bottom, never hidden.
2. Sound starts on its own. Opening a lesson plays the thing being taught. Pressing a choice
   (short kick, long kick) plays that choice. No separate "hear" or "play loop" button to unlock sound.
3. Any control we introduce must audibly do something the moment it moves. If a knob makes no
   difference you can hear, we don't show it.
4. Build first, add to song, then questions. Questions are optional and skippable. Skipping never
   blocks the song.
5. The learner always knows where they are: a header with back, the lesson name, the step count,
   and what comes next. Same header on every page (lessons, library, studio, words).

## The lesson shape

hear → do it roughly → name it → build it properly → shape it → add to song → check (optional) → keep

- **hear**: it is already playing when the screen opens. One or two lines on what you are hearing.
- **do it roughly**: tap it in by feel. Before asking, say why: "this becomes the first loop of your song".
  Highlight the one button to press next. The gate checks the result is actually right (on the beat),
  and if not, says what to fix instead of moving on.
- **name it**: the term for what they just did, with one good real-world example. History, other
  kinds, and song examples go in fold-out boxes below. The main text alone must be enough.
- **build / shape**: the loop keeps playing while they change things. The visual is the sound itself
  (the kick's shape), not a generic visualiser.
- **add to song**: a moment. Animation, "your kick is in your song", play it from right there.
- **check**: questions only about things the lesson explained and they heard. A question ladder from
  easy to harder; a wrong answer explains why and lets them try again; "ask me more" pulls from a
  small bank. Small concept, two questions. Big concept, more.
- **keep**: what you learned, what your song now has, and a clear next lesson with a hint of it.

## Voice

The default voice is a friendly mentor who explains everything properly the first time, simply, like
to a smart friend who has never made music. Excited about the cool parts (a synth makes the wave
directly, out of numbers!). There is no voice setting to choose up front.

Each step has two small buttons under the text: "say it another way" (the same idea in different
words, for when you're bored or it didn't land) and "simpler please" (the plain, eli5 take). The way
you start in is the one picked in onboarding ("how should we explain things?"). Every
explaining step in a lesson file carries all three: `mentor`, `straight`, `eli5`.

- Explain new words when they first appear, in a tap-to-open box, and keep them short.
- Short where the idea is small. Longer only where something is genuinely new.
- One idea per paragraph. If a paragraph has three new terms, it is three steps.
- Never mention things the learner hasn't met (no beatmatching in a producer lesson 1).
- Use the words the best tutorials use (Ableton Learning Synths, Syntorial, Splice): plain verbs,
  "you hear", "turn this", "now listen".
- The "next" line on the last screen names the lesson that really comes next.
- Lowercase UI text, no em dashes, "button" and "song", one pink go button per screen.

## Levels

No level picker. Each check runs a ladder of questions from easy to hard. Over time, reviews mix
in questions from earlier lessons, and what they get right becomes their XP for that topic.

## Screens

- Fits the screen. On desktop the whole step, including next, is visible without scrolling
  (`scripts/shots/file-lesson.mjs` flags any step that fails).
- One layout for the whole lesson. Phone: one column. Desktop: the same two regions on every step,
  the instrument on the left (screen, knobs, pads), the reading and next on the right.
- Looks like hardware: consistent type scale (one display face for labels, one body face for
  reading), aligned boxes, no stray coloured bars.
- The cat moves with the beat, or not at all.
- Undo removes the last thing. Long press clears all. A go button is never dead: if it can't go yet, pressing it says why.
- Never mention a tool (snap, quantise) before the lesson that teaches it. Show timing as it really was.
- Once you've made something, it stays in view: explanations after a play-in show your own loop in a big frame.

## How a change gets made

1. Take Param's report. Turn it into a numbered fix list in `ccd/school-fixes.md`: each item is
   what he saw, what we change, and whether it is a rule (goes in this doc) or a one-off.
2. Fix in this order: anything that blocks sound or progress, then layout, then copy, then polish.
3. Before Param sees it, walk the lesson three ways (careful, rusher, someone who skips questions)
   with `scripts/lesson-walk.mjs`, read the copy out loud via `scripts/dump-lesson.mjs`, and shoot
   it at 390x844 and 1440x900, light and dark, Chromium and WebKit.
4. Check against the list above, item by item. Anything that fails is fixed before pushing.
5. Push, then one line in `ccd/history.md` and the status in `ccd/school-readme.md`.

## Docs

This file, `ccd/school-fixes.md` (the running fix list), `ccd/school-readme.md` (status) and
`ccd/history.md` (dated log). Everything else is reference or archive.
