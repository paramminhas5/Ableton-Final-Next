# CCD School fix list (from Param's walkthrough, 4 Nov 2026)

Status: [ ] open, [x] done, [~] partly. R = becomes a rule in `process.md`.

## Settings and structure
1. [x] No voice picker. Default explains fully; per step "say it another way" and "simpler please" (Param, 20:07). R
2. [x] Remove gentle / standard / hard. Checks become an easy-to-hard ladder with retry and "ask me more". R
3. [~] Common header on every page with back, including library, words, studio. R
4. [x] Breadcrumbs in a lesson: world, lesson name, step x of y, what's next. R
5. [ ] Desktop "my song and my journey" view: the song so far and where you are in the path.

## Onboarding and dashboard
6. [x] ccdschool.com goes straight to onboarding for a first visit: what you want to make, how much you know, then lesson 1.
7. [ ] Dashboard: one screen, producer lessons on top, knobs that move when clicked.
8. [ ] Bottom bar covers the list and the redo button. Fix the overlap.
9. [ ] "preview" button only plays a kick. Remove it or make it preview the lesson.
10. [ ] Gap between the last item and the footer.
11. [ ] Footer links point to the main catscandance.com site, and are the right ones.
12. [ ] "flow / free" is unclear for a first-time user. Rename (journey / see all).
13. [ ] Top button turns the screen black on black. Remove that behaviour.
14. [ ] Clicking an option already applies it, so the done button is pointless and looks odd.
15. [ ] Tapping the CCD School logo spins the cat.
16. [ ] Cat should move with the beat.

## Kick lesson
17. [x] The kick is already playing when the lesson opens. No press-to-hear. R
18. [x] Song strip with play at the top, always. R
19. [x] Whole step fits the screen, no scrolling to reach next. R
20. [x] One layout for the whole lesson, no switch to two columns mid-way. R
21. [~] Type and boxes refined, look like hardware, no odd pink bar on the left. R
22. [x] No beatmatching talk in lesson 1.
23. [x] Play-in: say why ("this becomes the first loop of your song"), highlight rec, explain the metronome as "a click so you can play along".
24. [x] Gate checks the kicks are on the beat; if not, tell them what to fix instead of unlocking.
25. [x] Undo removes the last hit; long press clears all.
26. [x] Four on the floor: name, short why, then fold-outs for history, songs that use it, other beats. R
27. [x] Grid and snap: their own bar stays on screen; much shorter text; quantising is a later idea.
28. [x] Short vs long: pressing the choice plays and loops it. No separate play loop button. R
29. [x] Shape: loop plays while turning; decay must audibly change; explain decay and tune in plain words with the kick's shape as the visual.
30. [x] "What a kick is made of" merged into shape (click and body explained once, where you hear them).
31. [x] Questions only on what was explained. Bass clash question removed until a lesson teaches it. R
32. [~] "Which kick was longer" drill removed. A real ear drill (which kick suits a bass line, matching a reference kick) comes later.
33. [x] Build first, add to song, then optional questions; skippable. R
34. [x] Keep: animation, "your kick is in your song", play the song right there.
35. [x] A way back into the lesson to tune the kick further or take more questions.
36. [x] Wrong answer: explanation and try again, never advance silently.
37. [ ] Later: a full kick designer (click, body, pitch drop, drive, length) for the best kick you can make.

## Sound lesson (lesson 2)
38. [x] Header shows it is lesson 2, with breadcrumbs and back.
39. [x] Explain sound as moving air with a moving picture, then one cycle, then pitch.
40. [x] Synth: "it makes the wave directly from numbers, then the speaker turns that into air". Excited, moving diagram.
41. [x] Questions not right after each idea; together near the end.
42. [x] Play with the synth before adding the lead line; shape it, then add to song, then "you learned".

## Done in the 4 Nov rebuild (commit after 9fec2dd)
New player for file lessons (`FileLesson.tsx`): header with back, lesson crumb, step x of y, now and
next, step back; song strip pinned on top with its own play; steps, then add to song (plays your song
with the new part, one press to add, animation), then optional questions (wrong answer explains and you
try again, ask more from a bank, skip any time), then done (you can now, real next lesson, tune it
again, more questions). Hear, play-in and shape start sound on arrival. Short/long choices play and
loop when pressed. Shape shows the kick's own wave with click and body labelled and moves as you turn.
Undo takes back one hit, hold clears. The play-in only passes when all four kicks are on the beat.
Kick ear drill and the bass clash question removed. Grid and snap step folded into the play-in.
Desktop: instrument left, reading and next right, on every step, all within 1440x900.
Still open on the kick lesson: 21 (type pass on the rest of the app), 37 (full kick designer).

## Done later on 4 Nov (lesson 2 and onboarding)
Lesson 2 is now a lesson file (`producer/02-synth-what-is-sound.yaml`, same slug so paths and progress
keep working; a lesson file now replaces any old mission with the same slug). Moving air picture (speaker
pushing dots), low vs high with the wave and the air speeding up, soft / saw / square with numbers to
speaker to air to ear, then play a synth line over your kick (any four notes, no on-beat rule for tunes),
shape it with wave and cutoff while the picture changes, add to song, questions at the end. Hear steps
can carry fold-outs now.
Onboarding at the root for a first visit: hello (the "let's go, sound on" tap starts a kick, which also
unlocks audio so lesson one opens playing), what do you want to make, how much have you done, how should
we explain things (sets the starting way for every lesson: explain it properly, keep it short, keep it
really simple), then your first lesson. "i know my way around" offers the level finder. Bottom nav hidden
on the root.
