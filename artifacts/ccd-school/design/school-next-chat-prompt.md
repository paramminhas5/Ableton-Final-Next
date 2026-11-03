We're taking CCD School's web app to 100%. CCD School is a music instrument and a school in one app: one Rust sound engine and one React UI, on the web, iPhone and Android, connected to Ableton Live. Build steps 0 (engine), 1 (track v2, Studio play for drums and bass, recording) and 2 (the mix) are done and pushed. The web app is the one source of every screen: phones open it and only sound is native, so phone work is paused until the web app is complete.

Read these first:
- Project doc ccd/00_README.md: index of every project doc, what is current and what is history.
- Project doc ccd/school-readme.md: the whole product, the decisions and why, technical capabilities, the honest gaps, and the improvements we adopted. This is the brief.
- Project doc ccd/school-instrument-plan.md, section "Web first" at the end: the six items that define 100%, the "Needs Param" list, and the Link plan for the browser. This is the checklist.
- Project doc ccd/school-redesign.md, sections "Build · step 0", "Build · step 1", "Build · step 2" and "Web first": what exists and what is not done.
- Project doc ccd/engine-sound.md: how the engine makes sound and the sound roadmap.
- Design canvas: https://claude.ai/code/artifact/36c4ce2a-9660-4375-a101-a41ac0edc49a. Page "Model 1 · final" has every screen (44 boards); read the boards for the item you are on with the Artifact tool, for exact layouts. For item 2: the studio boards for all 6 layer types and their own surfaces (glide, circle, chord pads, xy, rolls, riser).
- Repo paramminhas5/Ableton-Final-Next, branch school/field. engine/ (Rust), engine-wasm/ (web build), mobile/ (Tauri shell, paused), artifacts/ccd-school (the web app). Studio is src/components/m1/Studio.tsx with studio.css, mix mode is Mix.tsx with mix.css; the track is src/lib/track2.ts; the engine bridge is src/engine/ (mix.ts decodes the meters). Web app: npm install --legacy-peer-deps. Engine: npm run engine (types and wasm). Screenshots: scripts/shots/mix.mjs is the pattern to copy. The root README.md is the product README.

What step 2 left you (so you don't redo it):
- Master: glue compressor, true-peak limiter (4x, ceiling -1 dB), per-layer analysis at about 30 Hz, clash detection with fixes, click-free compare, IIR half-bands (0.10 ms for the 2x path, 0.48 ms total with the limiter look-ahead). Engine layer 8 is the master; commands MASTER, SNAPSHOT, COMPARE, ANALYSE; events METER, BANDS, CLASH, MASTER_METER.
- The Studio slot row now shows only the layers that exist plus one + tile that opens the add panel. Keep it that way: no empty slots. The add panel (LAYER_ORDER, six types) is where new instruments come from.
- CPU: 8 layers is about 14% of one native core, about 18% with the mix screen open. Check it on a mid-range phone browser in the final pass. Chords and lead still play on the mono bass synth until their instruments land (that is this step).

How to run this:
1. Work through the remaining "Web first" items in order (item 2, all six layer types, is next), one at a time. Set up a task list with the items and their sub-points.
2. For each item: restate its definition of done from the plan; build engine pieces first, then the UI; add tests; render every touched screen at 390x844, light and dark, in Chromium and WebKit (Playwright), and look at them; commit and push to school/field when it works.
3. After each item: a short changelog entry in ccd/school-redesign.md, one dated line in ccd/history.md, update the status and gaps in ccd/school-readme.md (and the repo README.md), and tick the item in the plan. Keep the repo copies in artifacts/ccd-school/design/ in step with the project docs.
4. In your first reply, ask me the "Needs Param" questions in one go (sound sources and the CCD kit, the listening panel, price, keys, Magnific terms). Don't wait on the answers: build whatever doesn't depend on them.
5. When this window gets close to its limit, stop at a clean, pushed point and rewrite ccd/school-next-chat-prompt.md (and the repo copy) so the next window starts exactly where you stopped. Then give me that prompt.

Start with item 2, all six layer types:
- Instruments in the engine: drums and hats (drum rack with roll and note repeat), bass (done), chords (polyphonic synth with voicing, spread, attack, release), lead, fx (noise, sweep, impacts, riser). A sampler voice, ready for real kits. Each with its own params in the registry, shown in the four knob banks.
- Surfaces: every layer type gets steps, keys, pads and its own fourth surface: bass glide strip (continuous pitch snapped to the scale), drums circle (Euclidean, hits and rotate per sound), chords chord pads (roman numerals in key, plus a strum strip), lead xy (pitch in scale across, filter up and down), hats roll strip (1/8 to 1/32), fx riser fader (a sweep over N bars). Exact layouts are on the canvas.
- Sound in ten seconds: first-time visitors land on the pads with a loop already playing. Build it with this item.
- Tests: render tests per instrument (level, no clicks, no aliasing above the notes it plays, chords polyphony), schema migration if the track changes, and the existing suites.
- The mix must keep working with the new layers: clash detection and the stage use the same readings.

Then items 3 to 6 as written in the plan, including the adopted improvements: Web MIDI and MIDI clock, your track as the spine, the mix coach (it can read the engine's clash data now), the CCD showcase loop, privacy, low-end phone mode, Hindi, clean house.

Parked, don't work on these unless I bring them up: Xcode and iPhone builds, Apple enrolment and the multicast request, Link on devices, store builds. Rebuild the Android APK only if the engine's interface changes (it will, with new instruments: say so, and rebuild at the end of the item). Ableton's reply about the Android Link licence (emailed 3 Nov, no reply yet) may arrive; just note it in the plan.

Working rules:
- Keep npx tsc --noEmit, npx vitest run, cargo test and next build passing at every push.
- Never claim a sound is as good as Ableton's until the listening panel has compared them; say "measured" when it was measured and nobody has listened.
- If something can only be checked on my Mac or phones, tell me exactly what to run.
- Ask before merging to main, changing production, or spending money.
- Plain copy, lowercase UI text, no em dashes.
