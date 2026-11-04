We're taking CCD School's web app to 100%: the engine and the whole look. CCD School is a music instrument and a school in one app: one Rust sound engine and one React UI, on the web, iPhone and Android, connected to Ableton Live. The web app is the one source of every screen: phones open it and only sound is native, so phone work is paused until the web app is complete.

Done, pushed and merged to main (4 Nov, Param asked for the merge; it was a fast-forward, nothing in production was changed and the domain has NOT moved): step 0 (engine), 1 (track v2, Studio play, recording), 2 (the mix), 3 (all six layer types plus a sampler layer), and the whole-app look pass parts 1 to 5 (latest commit on school/field is the docs commit after e1b5b7c). Part 5 rebuilt Wiki, Devices, Link, Build, Missions, Challenge, Upgrade (layout only) and first beat on the Model 1 parts, gave Today two columns from 900 px, finished the emoji sweep and fixed the shot scripts. Parts 2 and 3 (3 Nov, late) built the new lesson player for every step type on the engine (try it records your line over your own track, add to my track writes it into track v2, hearts sheet, practice for a heart, rank up and world done moments), Practice and drills, You, Library, Sign in, Menu and device pages; replaced the Magnific AI clips with clips rendered on our engine; made everything free by default; removed about 40 old components nothing linked to.

Param's answers (3 Nov, 21:21 IST), already in the plan:
- Sounds: our own synthesis and open (CC0, public-domain) recordings, the way Vital does it. No licensed library for now.
- No listening panel for now. Keep saying "measured" until someone listens.
- Everything free for now. Pro proposal for retention and sharing is `ccd/school-pro.md`; Param hasn't reacted yet. Nothing gets locked until he does.
- Param adds `ADMIN_PASSWORD` later. Still missing: Google sign-in, Razorpay and Stripe, `VAPID_EMAIL`.
- Magnific: done, clips replaced.

Read these first:
- Project doc ccd/00_README.md: index of every project doc (add `school-pro.md` to it; it isn't listed yet).
- Project doc ccd/school-readme.md: the whole product, decisions, gaps. This is the brief.
- Project doc ccd/school-instrument-plan.md, section "Web first": the six items that define 100% (items 1 and 2 are ticked) and Param's answers.
- Project doc ccd/school-redesign.md, the "Build · whole-app look pass" parts 1 to 3: what exists and what is not done.
- Project doc ccd/engine-sound.md: how the engine makes sound.
- Design canvas: https://claude.ai/code/artifact/36c4ce2a-9660-4375-a101-a41ac0edc49a, page "Model 1 · final". The repo has a screenshot of every board in `artifacts/ccd-school/design/model1/screens/` (ZToday, ZTablet, ZPlugin, ZStreak and the rest); read those with the Read tool, it's faster than the canvas.
- Repo paramminhas5/Ableton-Final-Next, branch school/field. engine/ (Rust), engine-wasm/, artifacts/ccd-school (the web app). New tonight: `src/components/m1/Lesson.tsx` (the player), `TryIt.tsx`, `AddToTrack.tsx`, `GlassVisual.tsx`, `SevenSeg.tsx`, `lesson.css` (the `ls-` classes the newer screens share), `src/lib/lessonTake.ts`, `engine/src/bin/teach_clips.rs`. Web app: npm install --legacy-peer-deps. Engine: npm run engine (types and wasm).
- Screenshots: `node scripts/shots/lesson.mjs <url> <chromium|webkit> <dir>` shoots every lesson step type light and dark (ONLY=name,name to pick); `node scripts/shots/pages.mjs <url> <browser> <dir> /path "/path!click=Button name"` shoots any page. Shoot against a production build (`npm run build`, then `PORT=3200 npm run start` in the background): the dev server drops chunks under WebKit and gives false failures. Browsers: `npx playwright install --with-deps chromium webkit`.
- Stopping servers: never `pkill -f "next dev"` or a loop that matches "next start" on the command line; both match your own shell and kill it. Find the `next-server` process by its exact cmdline and kill that PID.
- Preview: https://ccd-school-app-git-school-field-washedupdegen-8712s-projects.vercel.app (rebuilds on every push to school/field).

Where things stand:
- Engine instruments: drums, bass, polyphonic chords, lead, fx and a 16-slot sampler. Known gaps: the chord synth is mono (no stereo width); lead filter motion and the riser fader are live only; samples reach the engine on the web only; the step grid affects display and new steps only.
- The Android APK was NOT rebuilt after the engine interface changed (no Android SDK in the cloud container). Tell Param to run the APK build from mobile/README.md on his Mac when the next engine change lands, or do it if the toolchain exists.
- Look pass, still old (after part 5): `PathPageClient`, `PlaygroundPageClient` and `MatchPageClient` still carry old classes (rebuild on `m1/parts.tsx`: `RefPage`, `ListRow`, `Silk`, `Chips`, `SearchField`, `GoPill`, `Pad`); the device lab and the 47 sims inside their frames move with item 4; `AdminPageClient` is an internal tool, leave it. The journeys are the main unfinished piece: `scripts/journeys.mjs` has a `playLesson(page)` helper and J1's lesson half passes on the new player; J1 setup and first beat are rewritten but unverified; J2 to J10, placement and J7 to J10 still describe the old Today and lesson player and fail. Run with `BASE=http://localhost:3200 node scripts/journeys.mjs` against a production build. Upgrade still shows pound prices and old copy: it needs Param's answer on `school-pro.md` first. The `/_vercel/insights/script.js` 404 in local shots is normal (Vercel only).
- Unlocks (controls unlock with the lesson that teaches them) are not built; the rank-up moment shows the controls used in the lesson. Decide with the Studio: in flow mode only, never blocking the sound-in-ten-seconds first visit.
- Open feedback from Param not done yet: Hindi; more CCD fun beyond the cat stickers.

How to run this:
1. Set up a task list. Work in this order: (a) finish the look pass: the old pages listed above, the tablet and desktop layouts, emoji out, then rewrite the journeys; (b) item 3, getting music out (MIDI per layer, stems as WAV through the engine offline, a zip, Live Set .als export, Web MIDI in with MIDI learn, MIDI clock in); (c) item 4 the rest (the 47 sims and the Ear Gym on the engine in the order in the plan, your track as the spine with progress shown as tracks, the mix coach from the engine's clash data, unlocks, deepen the 55 short lessons); (d) item 5 (CCD stage showcase loop: submit, crew review, picks; privacy for India DPDP: itemised consent, export, deletion, grievance contact); (e) item 6 final pass (copy, a11y, performance on a mid-range phone browser, low-end phone mode, Hindi, journeys, clean house, then ask Param before the merge and the domain move).
2. For each item: restate the definition of done, engine pieces first then UI, add tests; render every touched screen at 390x844, light and dark, in Chromium and WebKit, and look at them; commit and push to school/field when it works.
3. After each item: a short changelog entry in ccd/school-redesign.md, one dated line in ccd/history.md, status and gaps in ccd/school-readme.md (and the repo README.md), tick the plan, keep artifacts/ccd-school/design/ copies in step (redesign-notes.md = school-redesign.md, instrument-plan.md = school-instrument-plan.md, root README.md = school-readme.md). To write a project doc from the repo, use project_write with local_path pointing at the repo file.
4. In your first reply, say what you're starting with and ask Param only what is still open: his reaction to `ccd/school-pro.md` (invite reward, whether Pro tracks get reviewed first, prices). Don't wait on it.
5. Shell tips: find the next-server PID by exact argv[0] from /proc before rebuilding (an old server holding port 3200 after a rebuild gives unstyled pages); never pkill -f.
6. When this window gets close to its limit, stop at a clean pushed point and rewrite ccd/school-next-chat-prompt.md (and the repo copy), then give Param that prompt.

Parked, don't work on these unless Param brings them up: Xcode and iPhone builds, Apple enrolment and the multicast request, Link on devices, store builds. Ableton's reply about the Android Link licence (emailed 3 Nov, none yet) may arrive; just note it in the plan.

Working rules:
- Keep npx tsc --noEmit, npx vitest run, cargo test and next build passing at every push.
- Never claim a sound is as good as Ableton's until someone has compared them by ear; say "measured" when it was measured and nobody has listened.
- If something can only be checked on Param's Mac or phones, tell him exactly what to run.
- Main now equals school/field as of 4 Nov. Ask before moving the domain, changing production settings or env keys, or spending money; later merges to main also wait for Param's say-so.
- Plain copy, lowercase UI text, no em dashes. One pink go key per screen.

- Docs for part 5 are written (changelog in `school-redesign.md`, status in `school-readme.md`, plan note in `school-instrument-plan.md`, a 4 Nov line in `history.md`, `school-pro.md` listed in `00_README.md`). Keep them in step as you go.
