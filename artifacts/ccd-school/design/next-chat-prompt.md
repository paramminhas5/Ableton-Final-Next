We're taking CCD School's web app to 100%. CCD School is a music instrument and a school in one app: one Rust sound engine and one React UI, on the web, iPhone and Android, connected to Ableton Live. Build steps 0 (engine) and 1 (track v2, Studio play for drums and bass, recording) are done and pushed. The web app is the one source of every screen: phones open it and only sound is native, so phone work is paused until the web app is complete.

Read these first:
- Project doc ccd/00_README.md: index of every project doc, what is current and what is history.
- Project doc ccd/school-readme.md: the whole product, the decisions and why, technical capabilities, the honest gaps, and the improvements we adopted. This is the brief.
- Project doc ccd/school-instrument-plan.md, section "Web first" at the end: the six items that define 100%, the "Needs Param" list, and the Link plan for the browser. This is the checklist.
- Project doc ccd/school-redesign.md, sections "Build · step 0", "Build · step 1", "Build · Link licence route" and "Web first": what exists and what is not done.
- Project doc ccd/engine-sound.md: how the engine makes sound and the sound roadmap.
- Design canvas: https://claude.ai/code/artifact/36c4ce2a-9660-4375-a101-a41ac0edc49a. Page "Model 1 · final" has every screen (44 boards); read the boards for the item you are on with the Artifact tool, for exact layouts. For item 1: ZStage, ZStageFixed, ZCompare, ZFaders, and page "Model 1 · round 9 · mix" for how mix behaves.
- Repo paramminhas5/Ableton-Final-Next, branch school/field. engine/ (Rust), engine-wasm/ (web build), mobile/ (Tauri shell, paused), artifacts/ccd-school (the web app). Studio is src/components/m1/Studio.tsx with studio.css; the track is src/lib/track2.ts; the engine bridge is src/engine/. Web app: npm install --legacy-peer-deps. Engine: npm run engine (types and wasm). The root README.md is the product README.

How to run this:
1. Work through the six "Web first" items in order, one at a time. Set up a task list with the items and their sub-points.
2. For each item: restate its definition of done from the plan; build engine pieces first, then the UI; add tests; render every touched screen at 390x844, light and dark, in Chromium and WebKit (Playwright), and look at them; commit and push to school/field when it works.
3. After each item: a short changelog entry in ccd/school-redesign.md, one dated line in ccd/history.md, update the status and gaps in ccd/school-readme.md (and the repo README.md), and tick the item in the plan. Keep the repo copies in artifacts/ccd-school/design/ in step with the project docs.
4. In your first reply, ask me the "Needs Param" questions in one go (sound sources and the CCD kit, the listening panel, price, keys, Magnific terms). Don't wait on the answers: build whatever doesn't depend on them.
5. When this window gets close to its limit, stop at a clean, pushed point and rewrite ccd/school-next-chat-prompt.md (and the repo copy) so the next window starts exactly where you stopped. Then give me that prompt.

Start with item 1, the mix:
- Engine: a program-dependent glue compressor and a true-peak limiter at 4x oversampling on the master, replacing the safety clip. Metering and analysis per layer, sent to the UI about 30 times a second: peak, loudness, low/mid/high energy, pitch centre, stereo position. Clash detection: two layers with energy in the same band at the same pan, with a suggested fix (eq cut, pan or duck); shape this data so the mix coach in item 4 can use it. Compare: a snapshot of every layer's mix params that "hold to compare" switches to and back, click-free. Low-latency IIR half-band filters for the 2x stages, bringing the fixed 1 ms down to about 0.1 ms, with the delay compensation exact and the timing tests passing.
- UI: mix mode in Studio exactly as on the canvas. Stage: pan across, pitch up and down, dot size is loudness, reverb shows as haze; clashing layers get a red ring and fix pads that glow; hold the screen to hear the mix before your changes. Faders: names on top, an engraved 0 dB line, a master strip called out; tap a strip to open it wide.
- Finish rules: the selected pad lights from behind, a dim glow only points at something, knobs and faders stay clean (no light rings, no meters on them), labels engraved, screens deep glass, every screen full height.
- Tests: render tests that the limiter never passes 0 dBTP, that duck still dips after the master, and that clash detection fires on two basses at the same pan and not on bass and hats.

Then items 2 to 6 as written in the plan, including the adopted improvements: sound in ten seconds, a sampler voice, Web MIDI and MIDI clock, your track as the spine, the mix coach, the CCD showcase loop, privacy, low-end phone mode, Hindi, clean house.

Parked, don't work on these unless I bring them up: Xcode and iPhone builds, Apple enrolment and the multicast request, Link on devices, store builds. Rebuild the Android APK only if the engine's interface changes. Ableton's reply about the Android Link licence (emailed 3 Nov) may arrive; just note it in the plan.

Working rules:
- Keep npx tsc --noEmit, npx vitest run, cargo test and next build passing at every push.
- Never claim a sound is as good as Ableton's until the listening panel has compared them; say "measured" when it was measured and nobody has listened.
- If something can only be checked on my Mac or phones, tell me exactly what to run.
- Ask before merging to main, changing production, or spending money.
- Plain copy, lowercase UI text, no em dashes.
