# Loop learnings

Each round adds what it found, built and learned, newest first. Read this before starting a round.

## Round 1 (5 Nov, 0ecd5cf)
Fixed (ccd/school-fixes.md 117 to 127): shape lessons on a part the song lacks now add the lesson's line with your sound instead of "keeping" knobs on nothing; snares draw on the backbeat lane and the add step names what you played; the drop on a drums-only song says the break is silence and points at the riser; "three worlds" counts worlds from the curriculum and "first blend" waits for your-first-mix; /sound footer was a corrupted repeat; the celebration sheet covers the whole screen (no second pink go beside it); hints in the reading column and the studio chip read in light mode; the up-next card names the lesson; lesson copy shows lowercase (css on `.fl`); onboarding's "add a clap" chip is no longer pink. Engine 2 item 5, part one: the kick's 6 ms attack bump, a pitch sigh over the tail (4.0% vs 0.0%) and a shaped click, level unchanged at -6.2 dB; kick clip added to /sound.
Learned:
- The webkit browser the walker needs is not in /opt/pw-browsers; install it once with `PLAYWRIGHT_BROWSERS_PATH=<scratchpad>/pwb npx playwright install webkit` and run the phone walk with that env. The wasm build needs `rustup target add wasm32-unknown-unknown` first.
- `ab_clips` re-renders every clip; byte-different flac for unchanged sounds is churn. Keep only clips whose index.json numbers moved.
- When rebuilding an "old" sound inside a test, measure the old pad's level by checking out the old source once; the hand-rebuilt formula missed a gain stage by 2 dB.
- A keep-only lesson must check the song has the part it shapes. The class of bug to look for next: any `changes:` lesson whose target part may be missing (dj lessons declaring drums.clap, your-first-mix touching nothing).
Suggestions for round 2 (ranked, why):
1. DJ lessons act on your song: your-first-mix declares `changes: drums.clap` but leaves the song untouched and talks about "deck b's bass". Give each dj lesson a mark on the song (a cue, an intro or outro section) so the house rule holds. Not built.
2. A real before/after on every done screen: if the song did not change, say so and offer the step that changes it, so "hear the difference" never compares two identical songs. Not built.
3. Tour step 1 on desktop covers the pink play key it points at; the drop's glossary chips sit under the bottom bar at 390. Layout, small. Not built.
4. Gym drills on your own song, unlocked by the lesson that teaches them (the gym offers eq and compression before those lessons). Not built.
5. Content sweep to write lesson copy lowercase at the source (the css covers screens; exports and share text still carry capitals, "Live", "CCD"). Not built.
Engine next: item 5 part two (hold stage, three body shapes, decay that rings out), then item 6, the master chain.

## Improvement check pass 3 (5 Nov, 4fecb0b), before the loop
Fixed: ccd/school-fixes.md 109 to 116.
Learned:
- Count what the learner did, not what the engine played: one chord press is three notes. Every counter should clamp at its goal.
- Phone layout: hiding a card on phone breaks anything that points at it (the tour). Look elements up by "visible", not by class.
- Each pass finds fewer layout bugs and more product-logic ones (what a lesson does to the song, what a deck plays). The loop should spend more of each round walking lessons start to finish and reading the song after.
Open for the loop (ranked):
1. The reviewer's world-class ideas: song at the centre of the dashboard ("your track" as default, next part as a ghost lane); auto a/b on every done screen with a 15-second share clip; scrub-able, lit arrangement blocks; deck a always the learner's own song; per-hit timing marks with ms offsets on play-in.
2. Lesson copy that mentions parts the learner may not have ("over your bass", "your six parts"): needs a per-song phrasing pass.
3. Per-world ranks and going straight to placement for experienced learners: Param's call.

## Improvement check pass 2 (5 Nov, 59dcbf5), before the loop
Fixed: see ccd/school-fixes.md 96 to 108.
Learned:
- A reviewer that walks a lesson end to end finds content-logic bugs no screenshot shows (the drop threw away your arrangement and added a kick). Every round, walk at least three lessons of different kinds to the done screen and read the song afterwards.
- Global copy sweeps hit code: replacing em dashes also rewrote the compiler's em dash check. After any sweep, grep the diff for regexes, split/includes/replace and tests.
- Fixed bottom bars and sticky strips eat phone height. Check every primary control's bottom against the bar's top by script (`scripts/shots/pass2-check.mjs` does it for the play-in).
- `--led-go` had spread to 97 places because the producer world's accent was pink. Pink lives on the go key only; a world accent can never be the go colour.
Open (ranked): /upgrade copy and prices wait on Param's pro decision. Done after the pass: keep lessons name their step "keep it in your song"; the song strip draws your arrangement as section blocks under the loop.

## Improvement check pass 1 (5 Nov, de9e5bd), before the loop
Fixed: studio overlap, piano roll, tool step names, mixer focus, play-in go key, song strip, lfo picture, /sound, pink and lowercase rules, sampler grouping, onboarding ear, dashboard and tour, done screen, foundations url. See ccd/school-fixes.md 76 to 90.
Learned:
- The global 44px tap-target rule silently breaks dense grids. Any new grid of small cells needs `min-width:0;min-height:0`.
- A reviewer that hasn't seen the work finds layout bugs no script catches (overlaps, things under fixed bars). Keep doing it every round, at 390 and 1440.
- A go key should always say what's missing, never do nothing.
Open, for the rounds (ranked):
1. Done: the piano roll lesson sits under the first synth lesson.
2. Done: an empty song says "a starter loop is playing" (`starterCopy`, `useStarter`).
3. Done: the recorded take shows as a dashed lane under the song strip until it is added.
4. Desktop onboarding uses a 530px column; a two-column hero would fill the screen. The cat on pink bars loses contrast.
5. Done: lesson knobs show their value under the label (`readout` on `Knob`, also read by screen readers).
Bigger product ideas from the reviewer (for Param to rank, not to build unasked):
- Coaching on your own takes: a timing map per hit (early or late in ms) and the next drill built from what you got wrong.
- Your song as the product: a timeline that grows lesson by lesson, a shareable 15-second then-and-now clip, and a full Live set export at the end of each path.
- Reference challenges from CCD nights: match a CCD artist's kick or bass by ear, with a spectrum overlay and a closeness score.
- DJ mode with real scrolling waveforms, phrase markers, and a replay that shows where a blend went wrong; submit a recorded mix for an opening slot at a CCD night.
- An ear gym built from the learner's own song, with spaced repetition and unlocks.

## Before the loop (5 Nov 2026, the session that set it up)
- Test against a production build (`next build` then `next start -p 3100`), not the dev server: the dev server hot-reloads mid-run and fails lessons that are fine.
- Never rebuild `.next` while a walk is running against it; restart the server after every build.
- The walker clicks "Skip this step" on any recorder, so comping and capture steps pass; mixer lessons are covered by `mix-smoke.mjs`, which clicks on until the mixer is on screen.
- Spectrum tests need a Blackman-Harris window: a Hann window's leakage floor (-53 dB) hid the real numbers and made the old drive look worse than it was.
- Keep the old version of anything you improve inside its test (see `OldDrive` in `engine/tests/sound.rs`) so every run reports before and after on the same signal.
- Match loudness in every a/b. A louder clip always sounds better.
- The engine's latency alignment depends on whole-sample delays (`DRIVE_DELAY`, `VOICE_LATENCY`); an extra oversampling stage would break it. Prefer ADAA inside the existing 2x.
- A mono voice must stay exactly in tune; voice-card tuning offsets belong on polyphonic voices only.
- Content bug class to look for: a goal the learner's default song can't meet (an A minor song fitted no bank key). Check every goal against the default song.
