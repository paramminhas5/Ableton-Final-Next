# Loop learnings

Each round adds what it found, built and learned, newest first. Read this before starting a round.

## Round 3 (5 Nov)
Fixed (ccd/school-fixes.md 138 to 147): every done screen now has a "what changed" line computed from the song when the lesson opened and the song now (`src/lib/songdiff.ts`: "+ bass · 120 to 128 bpm · lead cutoff 1.2 khz to 800 hz · cue: mix out on bar 8", at most five items). The "before" snapshot is taken when the lesson opens, not at the add step, so arrange lessons (which write sections in their own step) no longer say "your song sounds the same". The drop no longer opens solved: an unarranged song starts with the drums and hats in every section, fills start off for the fills lesson and everything on for sections (`startLayout` in `src/lib/arrange.ts`); "classic layout" became "start over" (it handed you the answer); hats count as drums. Play-ins check the idea, not the count: a goal can say `on: beat | and | backbeat`; a snare (not only a clap) has to land on two and four; the hats lesson asks for four open hats on the "and". A skipped play-in only "keeps your part" when the song already has that sound (a kick no longer stands in for a skipped clap). Mixer and arrange go keys say what's missing on the key itself (`NotYet`). Rank-ups and trophies wait until you leave the lesson. Dashboard "your track" shows the song's real key and "20 bars · 5 sections"; the studio's "to live" exports the arrangement. "your hats are recorded".
Engine: none this round. Param moved engine 2 to the main chat (state.md); item 5 part three, 6 and 7 landed there while this round ran, so the round's rebase picked them up.
Learned:
- The reviewer's three best catches were one bug class: a goal that counts taps or checks a layout the lesson already handed you. When a step has a goal, test it from the state the learner arrives in: is it already met before any input? Is a wrong musical answer accepted? `scripts/shots/round3-check.mjs` does that for the drop and hats.
- A "before" snapshot belongs at lesson open. Anything taken at the add step misses steps that write the song earlier.
- Changing a go key's text breaks walkers that read `innerText` for "not yet". Read the aria-label ("Not yet: ...") instead; walk-all and mix-smoke now do.
- New lib files must import with relative paths (`../engine/...`): vitest has no `@/` alias here.
- A goal field added in the schema also has to pass through `adapt.ts` and `content/types.ts`, or it silently disappears.
Suggestions for round 4 (ranked, why):
1. One goal checker per step kind in music terms, unit tested from the learner's arrival state (already met? wrong answer accepted?). Round 3 fixed three cases by hand; the class is wider (bass "on the root", chords "on the one", the gym). Not built.
2. Arrangement and cues visible and editable outside lessons: a section and cue strip in the studio, so the song you built in the drop is yours to change. The dashboard and export now know about sections; the studio still can't edit them. Not built.
3. Hear the moment on the done screen: for an arrange lesson, play the bar before and after the drop rather than the whole song twice. Half built: the done screen knows what changed.
4. Shape lessons on a part the song lacks: the listen step still says "you've already used cutoff to make your lead" and the shape step "your lead, four knobs". Phrase per song, or add the lesson's line first and say so.
5. Mixer step on phone: the goal line sits under the fold. Built: the go key now says it.
6. /sound around the learner's own song with one pink "play my song", and the "808 circuit" and "trance supersaw" lines rewritten so they describe what was built, not what it resembles.
Small, seen, not built: your-first-mix's "mix out" cue sits on bar 20 of a 20-bar song while the hint says blends take 16 to 32 bars; listen clips at 124 bpm against a 120 bpm song; onboarding's "take me in · first lesson: your kick" lands on the dashboard tour.
Engine next: none for the loop (main chat). Product rounds only.
- Another session pushes to school/field during a round. Fetch and rebase before the final test run, not only before push, and rerun tests on the rebased tree. Round 3 pushed straight after a nine-commit rebase and the main chat's Studio.tsx already imported `arranged`; tsc went red until ace657a. Run tsc between `rebase` and `push`, every time.

## A cloud session alongside round 3: Param's go-ahead (5 Nov, merged after c98d749)
Param's decisions (5 Nov): ranks differ per world; "i know my way around" goes straight to placement; pro comes later, after everything else; save his dj tracks and use parts or chops, similar songs first; filter characters get chill names with the Ableton or rekordbox name shown second; Ableton replied about Link and he has signed the contract; he did not know what the /sound comparison page is (explain it to him, keep it unpromoted until his ear test).
Built: everything in round 2's suggestion list (what-changed line, rank-ups after the done screen and per world, mixer go key names the move, deck a plays your song's cues, song strip at full width, forgiving play-in with device delay learned from the take and "snap it for me"), the small fixes (tour header, knob focus ring, crumb numbers, gym drills locked until taught), our names with Ableton and rekordbox names under the controls, a -14 and -9 lufs audio export, a filter in every part's strip, and Param's 13 dj picks measured into `src/content/djTracks.ts` (numbers only; audio path in `design/dj-bank-private.md`). A second fresh review's top ten fixed in the same session.
Learned:
- A rank-up or any moment held back while a lesson is open has to survive a reload: keep it pending in storage until shown, don't mark it seen on detection.
- A loudness target needs a limiter, not just a gain capped by the peak; a sparse kick-only loop still stops short of -9, so the export names the level it reached.
- Stand-ins are made on our engine, so they can be transposed to the learner's key; real picks keep their key. A blend lesson must never start on a clash.
- mix-smoke's cut lessons fail under load (three browsers plus a reviewer). Run it on its own before calling it red.
Still open, for round 3 (ranked): filter characters on lead and chords (only the bass has them); engine items 8 to 12; the "deck b tempo" and crossfader labels wrap on phone; Param's private bank for the real audio (his call on rights and storage); pro.
- Two sessions built engine items 5 to 7 at the same time. When merging, the main chat's engine stayed and this session's duplicates were dropped. Before building engine work, fetch and read the last commits on the branch; another session may already be on it.


## Round 2 (5 Nov, 68fd8c2)
Fixed (ccd/school-fixes.md 128 to 137): all 40 lessons with a mixer step now end by marking your song with a dj cue (a blend marks "mix out" on the last bar, a tempo match "tempo checked" on bar 1, and so on; `src/lib/cues.ts`), drawn under the song strip; on an empty song the lesson's part goes in too. The done screen compares sound, not bytes (`soundsSame`): when a lesson only marked the song it says so instead of offering two identical clips. A skipped play-in on a part you already have keeps your part (pulse and tempo turned a steady kick into [0,1,2,3,3.5]). The tour's first stop spotlights the lesson card and its play key together, and greys the page's go keys while it runs. Play-in coach text lowercase; the done score clear of the cat; "lesson 1" no longer splits across lines; /sound no longer says "like a real synth" or "a real drum machine's cymbals"; curriculum blurbs lowercase ("as live sees them"). Engine 2 item 5, part two: an 18 ms hold at the middle decay (the body falls 0.3 dB by 20 ms, was 1.7 dB) and a slower second decay under the punch (the tail at 350 ms sits 28.5 dB under the body, was 34.6 dB); first 100 ms still -6.2 dB; tail at -40 dB 135 / 390 / 1170 ms for short / mid / long.
Learned:
- Long jobs (walk-all, mix-smoke) die with the 2-minute shell timeout when started with `&` inside a command. Start them with `setsid nohup ... < /dev/null &` and poll the log.
- `sound.mjs` launches chromium and webkit in one run; with `PLAYWRIGHT_BROWSERS_PATH` set to the scratchpad webkit, chromium goes missing. Run it without the env (chromium passes) and rely on the webkit phone walk for webkit.
- mix-smoke's cut-on-the-one is timing based and can miss once under load (long-mix-blend 390 failed while the desktop walk ran alongside, passed alone). Rerun before calling it red.
- /api/auth/session returns 500 locally because there is no auth secret in this sandbox. It is environment, not a bug to fix here (environment keys are Param's).
- The reviewer's best catches were again product logic read from the song state after a lesson (the off-beat kick), not layout. Keep asking the reviewer to read `ccd.track.v2` after each lesson.
Suggestions for round 3 (ranked, why):
1. A "what changed" line on every done screen, computed from the song before and after ("+ lead lane · release 271 ms · 120 to 132 bpm · cue: mix out"). It makes "every lesson acts on your song" visible and would have caught the off-beat kick and the untouched dj lessons by itself. Half built: `soundsSame` and the cue line; the diff itself is not.
2. Hold rank-ups and trophies until after the done screen, and make ranks world-aware. Finishing a dj lesson pops a full-screen producer rank ("loop maker") over the done screen before you see it. Needs Param's call on dj and basics rank names.
3. Mixer step on phone: the instructions sit under the fold behind the translucent bar, and "not yet" never says what's missing. Give the mix go key the same "says what's missing" rule as play-ins ("bring deck b up", "cut a's low").
4. Deck a plays your song's cues: the hot cues on deck a should be the cues your dj lessons marked, so the marks pay off in the next lesson.
5. Song strip as the hero on desktop: full width, pinned, the lane this lesson touches pulsing. It is a short strip centred in dead space at 1440.
6. Play-in latency calibration from the count-in, and "snap it for me" after two late takes, so a laggy phone or bluetooth headphones can't strand a first-timer on "fix the red ones".
Small, seen, not built: phone tour step 1 scrolls the header half off the top; knob values struck through by the focus ring; "empty so far" floats above the strip row on phone; dashboard numbers lessons per world ("07") while the lesson crumb numbers per path ("lesson 3").
Engine next: item 5 part three (three body shapes, which needs a pad param, its knob and a measured test), then item 6, the master chain.

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
