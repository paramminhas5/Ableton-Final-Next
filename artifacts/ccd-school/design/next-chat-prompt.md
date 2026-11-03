We're taking CCD School's web app to 100%: the engine and the whole look. CCD School is a music instrument and a school in one app: one Rust sound engine and one React UI, on the web, iPhone and Android, connected to Ableton Live. Done and pushed on school/field: step 0 (engine), 1 (track v2, Studio play, recording), 2 (the mix), 3 (all six layer types plus a sampler layer, presets, songs, bar pages, 1/8 to 1/32 steps, sound in ten seconds) and part 1 of the whole-app look pass (welcome, Today, All lessons, footer, old blocks restyled). The web app is the one source of every screen: phones open it and only sound is native, so phone work is paused until the web app is complete.

Read these first:
- Project doc ccd/00_README.md: index of every project doc.
- Project doc ccd/school-readme.md: the whole product, decisions, gaps. This is the brief.
- Project doc ccd/school-instrument-plan.md, section "Web first": the six items that define 100% (items 1 and 2 are ticked), the "Needs Param" list, and the Link plan for the browser.
- Project doc ccd/school-redesign.md, sections "Build · step 2", "Build · step 3" and "Build · whole-app look pass, part 1": what exists and what is not done.
- Project doc ccd/engine-sound.md: how the engine makes sound.
- Design canvas: https://claude.ai/code/artifact/36c4ce2a-9660-4375-a101-a41ac0edc49a. Page "Model 1 · final" has every screen (44 boards); read the boards for the screen you are on with the Artifact tool, for exact layouts (lesson steps, practice, library, you, sign in, menu, moments, tablet).
- Repo paramminhas5/Ableton-Final-Next, branch school/field. engine/ (Rust), engine-wasm/ (web build), artifacts/ccd-school (the web app). Screens in src/components/m1/ (Studio.tsx, Mix.tsx, Surfaces.tsx, Welcome.tsx, Worlds.tsx, Today.tsx, World.tsx, Footer.tsx, controls.tsx, shell.tsx). Track: src/lib/track2.ts, presets.ts, songs.ts, samples.ts. Engine bridge: src/engine/. Web app: npm install --legacy-peer-deps. Engine: npm run engine (types and wasm). Screenshot scripts in scripts/shots/ (layers.mjs, sampler.mjs, home.mjs, audit.mjs, sweep.mjs). Note: do not `pkill -f "next dev"` (it kills your own shell); stop the dev server another way.

Where things stand:
- Engine instruments: drums, bass, polyphonic chords, lead, fx and a 16-slot sampler (Instrument::Sampler, ccd_sample_load, a "sample" layer type that loads any audio file into the browser's IndexedDB). Known gaps: the chord synth is mono (no stereo width); lead filter motion and the riser fader are live only (not recorded); samples reach the engine on the web only (the phone shell needs the same message); the step grid affects display and new steps only.
- The Android APK was NOT rebuilt after the engine interface changed (there is no Android SDK in the cloud container). Tell me to run the APK build from mobile/README.md on my Mac, or do it if the toolchain exists.
- Look pass: the legacy flat blue/pink/red blocks are restyled by CSS ("LEGACY BLOCKS" in globals.css). Still old and next: the lesson player and its step screens (concept, sim frame, quiz, lesson complete, hearts popup), emoji used as icons (stats, ranks, rank ladder), the profile layout, the practice drills' internals, device pages, DJ lessons, the Today/Studio desktop and tablet layouts. scripts/journeys.mjs J1, placement and J7 were updated for the welcome screen; the other journeys still describe the old Today and need rewriting.
- Open feedback from me that is not done yet: a better look for the lesson hearts popup; more CCD fun (stickers, the cat) on the lesson screens; nav links audit on the old pages; Hindi.

How to run this:
1. Set up a task list. Work in this order: (a) finish the look pass: the lesson player and all lesson step screens in the Model 1 style from the canvas boards (this is item 4's player, built on the engine with try-it recording, add to track, unlocks), then every other old screen from the list above; (b) item 3, getting music out (MIDI per layer, stems as WAV, a zip, Live Set .als export, Web MIDI in, MIDI clock in); (c) item 4 the rest (sims and Ear Gym on the engine, your track as the spine, mix coach, deepen the 55 short lessons); (d) item 5 (CCD stage showcase loop, privacy); (e) item 6 final pass (copy, a11y, performance on a mid-range phone browser, low-end phone mode, Hindi, journeys rewritten, clean house).
2. For each item: restate the definition of done, engine pieces first then UI, add tests; render every touched screen at 390x844, light and dark, in Chromium and WebKit, and look at them; commit and push to school/field when it works.
3. After each item: a short changelog entry in ccd/school-redesign.md, one dated line in ccd/history.md, status and gaps in ccd/school-readme.md (and the repo README.md), tick the plan, keep artifacts/ccd-school/design/ copies in step. To write a project doc from the repo, use project_write with local_path pointing at the repo file (it must be inside the working directory).
4. In your first reply, ask me the "Needs Param" questions in one go (sound sources and the CCD kit, listening panel, price, keys, Magnific terms). I have not answered them yet. Don't wait on them.
5. When this window gets close to its limit, stop at a clean pushed point and rewrite ccd/school-next-chat-prompt.md (and the repo copy), then give me that prompt.

Parked, don't work on these unless I bring them up: Xcode and iPhone builds, Apple enrolment and the multicast request, Link on devices, store builds. Ableton's reply about the Android Link licence (emailed 3 Nov, none yet) may arrive; just note it in the plan.

Working rules:
- Keep npx tsc --noEmit, npx vitest run, cargo test and next build passing at every push.
- Never claim a sound is as good as Ableton's until the listening panel has compared them; say "measured" when it was measured and nobody has listened.
- If something can only be checked on my Mac or phones, tell me exactly what to run.
- Ask before merging to main, changing production, or spending money.
- Plain copy, lowercase UI text, no em dashes.
