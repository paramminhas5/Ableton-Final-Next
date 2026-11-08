# Audible Genius (Syntorial and Building Blocks): how they teach, why it works, and how CCD School goes further

8 Nov 2026. Param asked for the depth on both products: how they work, what they use, why Syntorial wins awards, and how we build something better. Every outside claim has a source at the end. Where a source doesn't say something, this doc says so instead of guessing.

## The company

Audible Genius is Joe Hanley's company. He is a Berklee graduate (2003) who struggled to learn synthesis, taught himself to code, built "a prototype training program that played like a video game", and funded it on Kickstarter in 2012 ($8,614 against a $5,500 goal). Syntorial shipped in August 2013; Building Blocks 1 followed in August 2019 and Building Blocks 2 later. [1][2][3]

## Syntorial: how it works

**What it is.** A desktop and iPad app (written in JUCE, Windows, macOS, iPad) that teaches subtractive synthesis by ear, on its own synth, Primer. Primer also ships as a VST/AU plugin and has been free since April 2025. [1][4][5]

**Size.** 197 to 199 lessons, 128 to 129 challenges, about 148 videos, 39 quizzes, 33 "on your own" tasks and 706 patches to program. About 64 parameters by the end. [1][4][6]

**The loop, in order:**
1. **Video.** A short demo of one control (or a small group), on the same synth the learner then uses. [6][7]
2. **Challenge.** A hidden patch plays a short phrase. The learner switches between the hidden patch and "My Patch" while it loops, turns the controls, and presses submit. [7]
3. **Feedback.** "Correct settings are highlighted in green, incorrect settings in red." The learner fixes the red ones and resubmits; there is no lockout. Stars (three for best) with a sound effect. A hint button shows which settings need work. About six patches per challenge. [6][7]
4. **Quiz** at the end of each level: multiple choice, and the answers have audio so a wrong pick can be heard. [6][7]
5. **On your own.** Periodic tasks to do the same thing on the learner's own synth. Since 2.3.500 these have a "Translate to Your Synth" panel. [4][7]

**The design choices that make it work:**
- **Notched controls.** "The settings are notched to just a few available values per control" (MusicTech: "five envelope attack times"). This is the single most important choice: a beginner can't hear 1% of a knob, but can hear five clearly different attack times. [7][8]
- **Only the controls the lesson needs are on screen.** "Only the needed modules appear." The first challenge has one control; by the end there are 64. [8][9]
- **Small steps, many repetitions.** Hanley: "Each level is only a small step up from the previous level", and learning comes through repetition that trains the ear, not through being corrected. 706 patches is the volume. One reviewer found it excessive at the time, "especially when a patch was only one cutoff-knob turn away", and in hindsight said it trained the ear well. [3][10]
- **One instrument for teaching and practice.** The video, the challenge and the plugin are the same synth, so nothing is lost in translation. [6]
- **Transfer to real synths.** Free lesson packs for Serum (55 videos, 9h 22m), Massive, Sylenth1, Minimoog Voyager and Z3TA+ 2, an open community map from Syntorial's concepts to Vital, Pigments and others, and "Remakes": single-patch challenges on famous synth sounds from well-known songs. [6][11][12]
- **It feels like a game.** Stars, sounds, levels, a quiz gate, and later group challenges (several concepts at once), bonus rounds and a randomizer for endless practice. [4][6][13]

**Syntorial 2.0 (June 2023)** added a resizable UI, a visualizer that animates envelopes, the LFO and the filter, new videos, a randomizer, "more nuanced scoring and remapped parameters allowing for more consistent progress and less roadblocks", and shorter group challenges and bonus rounds. Later: cloud sync, Japanese, Spanish and French, a Drum Synthesis course ($39.99) and a Nord Stage 4 pack ($49.99). [4][13][11]

**Price.** Free demo: the first 22 lessons and the full synth. Full: $129.99 once, on all platforms. Discounts for students, teachers and creators with disabilities. [4][6]

## Why Syntorial wins awards

The awards: Electronic Musician Editors' Choice 2014 ("too cool for school"), MusicTech 10/10 with Excellence and Innovation badges, and Keyboard's "The Most Fun Way To Learn Synth Programming". [1][8] The reviews praise the same things, and they line up with the design choices above:
1. **It is software, not a video course.** Hanley's own pitch: books and videos can only present information; this makes you do it. [3]
2. **It trains the ear, not the eye.** Every reviewer leads with "by ear". The skill it builds (hear a sound, know which knob made it) is the skill producers actually lack. [7][8]
3. **It is never too hard.** Notched values, one new control at a time and instant per-control feedback mean the learner is almost always nearly right. [3][7]
4. **Volume.** Hundreds of short, specific reps. [10]
5. **It transfers.** Packs, mappings and remakes connect it to the synths people already use. [6][12]
6. **It is fun.** The one adjective every review uses. [8]

Criticisms worth learning from: Primer's six-voice polyphony; the early lessons are easy for experienced users; Primer's layout looks unlike other synths; late challenges that mix twenty lessons of concepts get very hard; it only covers subtractive synthesis. [7][8][9][14]

## Building Blocks: how it works

**What it is.** A browser course ("video game style") for beatmaking and composition: drums, bass lines, chords, then melody. No install; it runs in Audible Genius's web app and a free-standing web "Studio". [15][16]

**Size.** Building Blocks 1: about 30 hours, 90 lessons, 83 videos, 81 challenges, 9 quizzes, 54 original beats. Building Blocks 2: about 35 hours, 107 lessons, 99 videos, 98 challenges, 9 quizzes, 69 beats. [15]

**The loop:**
1. **Video**, then a challenge, in a small studio built around a note grid ("Piano Roll instead of traditional staff notation"). [15][17]
2. **Recreation challenges.** A hidden drum pattern, bass line, chord progression or melody plays; the learner recreates it by ear on the grid. "Every time you place a note correctly, your ear will get a little bit stronger." The instruments are preselected so a 100% identical recreation is possible. [15][18]
3. **Mind's Ear.** The learner sees only the notes of their version, not hearing it, and compares what they imagine with the example. [18]
4. **Write your own** every few lessons: a drum pattern, bass line, progression, melody or a full beat. 123 beats across both courses. [15]
5. **MIDI export** into any DAW; the guarantee lets you keep the exported beats. [15]

**What it teaches, in order.** Velocity and drum patterns, bass lines that fit the drums, chords and voice leading, arpeggios as a bridge to melody, then melodies "modeled on speech", inversions, anticipations, open hats, toms, and dropping the backbeat. [15][19]

**Price.** 3-day free trial, $14.99 a month for everything, or $44.99 for life. [15]

**Criticisms.** The browser studio can be "a bit janky" (audio stops after a break until a restart), and clicking notes onto a piano roll isn't fun for everyone. [18] The FAQ and the course listings disagree on the hours (25 against 30 to 35 per level). [15]

## What we already do that they don't

- **Every lesson acts on the learner's own song.** Neither product does this. Syntorial's patches and Building Blocks' beats are separate exercises; ours add up to one track.
- **One app for synthesis, beats, mixing, arrangement, Live and DJing,** on a phone and a laptop. Syntorial covers synthesis only; Building Blocks covers composition only.
- **Match this sound on more than a synth** (kick, bass, lead, pad), scored from the rendered sound and the settings together, not settings alone.
- **Timing in milliseconds on every hit,** and "faster" after three clean takes.
- **"Same control elsewhere" on every control** (Live first, then Serum, Vital and hardware), where Syntorial needs separate packs.
- **It reads and writes your Live set.**
- **A measured engine** and a blind sound test.

## What they do that we don't (the gaps, with numbers)

Counted from our 198 lesson files on 8 Nov:
1. **Too much quiz, too little by-ear doing.** 580 `ask` steps against 3 `match` steps, 2 `ear` steps and 29 `play` steps. Syntorial is 706 matches and 39 quizzes. This is the biggest gap.
2. **No copy-by-ear note challenges.** Building Blocks' core (179 challenges) doesn't exist in our lessons.
3. **Our match step isn't Syntorial-shaped yet.** It has smooth knobs (no notches), one target per step (not about six), a single closeness score (not green and red per knob), and in the gym one check is the answer.
4. **No group challenges, bonus rounds or remakes.**
5. **No "imagine it first" (Mind's Ear) drill.**
6. **No "write your own" checkpoint every few lessons** that grades what was written.

## What we build: their best ideas, done on your song

In build order. Each one keeps our rules: lowercase, Live's names, one pink go key, every lesson acts on the learner's song.

1. **Copy by ear** (Building Blocks' recreation challenges, on our grid and engine). A hidden drum pattern, bass line, chord progression or melody plays in the learner's key and tempo. They write it on the grid. Check marks each note right, wrong or missed, and wrong-pitch notes show which way they were off. Unlimited tries. A hint plays the missed note alone or lights its row. When it's right, it goes into their song. It comes in four forms: lesson step, gym drill (endless, levelled), "copy a part of your own song" (the app plays back a part they wrote earlier, hidden), and a timed bonus round.
2. **Match, Syntorial-shaped.**
   - Notched knobs while matching, with 3 to 5 steps at the first levels, opening to finer steps as the level rises (Syntorial's single best idea).
   - Green and red per knob after a check.
   - Stars (three, two, one).
   - Several targets per step (three in a lesson, six in a session).
   - A softer first gym level.
3. **Group challenges and bonus rounds.** At the end of each world, a match and a copy that combine everything that world taught, plus optional bonus rounds for stars.
4. **Imagine it first (Mind's Ear).** Show the notes of a short phrase without sound. The learner sings or hums it, picks which of three it sounds like, then hears it. This trains the inner ear, which no DAW teaches.
5. **Write your own, checked.** Every few lessons a short brief ("a bass line that leaves room for the kick"). The app checks what can be checked (in key, avoids the kick, length) and says what it heard.
6. **Remakes, on our instruments.** "Make a sound like the one in a famous track", where the target is a patch we program in the style of the original. No audio from the record is ever used, and each remake is named as a style ("a 90s acid line", "a supersaw like early trance"), never as the track.
7. **Turn quizzes into ears.** Go through the 580 `ask` steps: where a question can be heard or done ("which one is compressed?", "set the attack so the kick punches"), make it a listen, a match or a copy instead. Keep a question only where the answer is a fact.

## How this is better than Syntorial and Building Blocks, not just equal

- **It's your track.** Each match and copy changes the song the learner is making, so the reps aren't throwaway: after 700 matches they have a song, not 700 deleted patches.
- **It adapts.** Syntorial is a fixed sequence ("move on when you're ready"). Our gym already levels up after 4 right in a row and down after 2 misses, and spaces reviews. Copy and match join that, so each learner gets more reps where their ear is weakest.
- **It never runs out.** Targets are generated on our engine (Syntorial's randomizer, but for drums, bass, chords, melody and four instruments, not just one synth).
- **It scores the sound, not just the knob.** Two settings can sound the same. Syntorial grades the settings; we grade the sound first (70%) and settings second.
- **Transfer is built in.** Every control already names its Live, Serum, Vital and hardware equivalent, and the lessons end in Live itself.
- **Beats and synthesis in one place, on a phone,** with the DJ booth at the end. Syntorial is one app, Building Blocks another, and neither runs on a phone browser with a real engine.

## Built 8 Nov (this repo)

- **Copy by ear** (`src/lib/copyEar.ts`, `src/components/m1/CopyEar.tsx`, lesson step `copy` in `design/lesson-format.md`): a hidden drum pattern, bass line, chords or melody plays; the grid shows only the rows worth trying (the drums used plus one decoy, or the scale's notes around the tune); each note comes back green, or red with an arrow for which way; a hint outlines one missing note; unlimited checks; stars. In 15 lessons, before the play step where there is one, so the learner copies a part and then makes it their own. In the ear gym as "copy by ear", 8 levels from a kick to a melody (`GymCopy.tsx`).
- **Match, Syntorial-shaped** (`src/lib/matchScore.ts` `notchesFor`, `knobMarks`, `matchStars`): knobs click between 5, 9 or 21 positions by level; each knob goes green or red after a check, with which way to go; stars; three sounds per lesson step (two on gentle), the lesson's own target last. Now in 18 lessons (was 3). The gym starts with one knob at level 1 and gives a second check after the first marks the knobs.

## Sources

1. [Syntorial, Wikipedia](https://en.wikipedia.org/wiki/Syntorial)
2. [Syntorial, About](https://www.syntorial.com/about)
3. [Synthtopia, "Syntorial Puts Virtual Synthesizer Into Synthesis Training Program" (2012)](https://synthtopia.com/content/2012/09/08/syntorial-puts-virtual-synthesizer-into-synthesis-training-program)
4. [Syntorial 2, App Store](https://apps.apple.com/app/id6448928707)
5. [KVR, Primer 2.0.019 and the Famous Sounds Preset Library](https://www.kvraudio.com/news-print.php?id=63677)
6. [ProMusicianHub, Syntorial 2.0 review](https://promusicianhub.com/syntorial-review)
7. [Keyboard review, via Plugin Boutique](https://www.pluginboutique.com/articles/531-Syntorial-Review-at-Keyboard-Mag-com)
8. [MusicTech, Syntorial review](https://musictech.com/reviews/audible-genius-syntorial-review/)
9. [KVR user reviews](https://www.kvraudio.com/product/syntorial-by-audible-genius/reviews)
10. [ProducerHive, Syntorial review](https://producerhive.com/?p=13321)
11. [Audible Genius help: lessons beyond The Essentials](https://audiblegenius.helpjuice.com/en_US/are-there-additional-syntorial-lessons-available-besides-the-essentials)
12. [KVR, Syntorial synth parameter mapping](https://www.kvraudio.com/news/audible-genius-updates-syntorial-with-synth-parameter-mapping-and-new-language-support-65874)
13. [Sonicstate, Syntorial 2.0](https://www.sonicstate.com/news/2023/06/22/syntorial-course-refreshed)
14. [EDM Identity, Syntorial review](https://edmidentity.com/2020/01/29/syntorial-product-review/)
15. [Building Blocks](https://audiblegenius.com/buildingblocks)
16. [Audible Genius help: the Studio](https://audiblegenius.helpjuice.com/en_US/how-do-i-use-the-studio)
17. [KVR, Building Blocks 1 release](https://www.kvraudio.com/news/46005)
18. [Jacob Vosmaer, Building Blocks](https://blog.jacobvosmaer.nl/0056-building-blocks/)
19. [WootMag, Building Blocks](https://www.wootmag.com/building-blocks-music-composition-audible-genius/)
