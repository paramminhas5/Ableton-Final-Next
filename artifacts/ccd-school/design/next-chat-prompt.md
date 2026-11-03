We're building CCD School into a real instrument: one Rust sound engine and one React UI, on iOS, Android and the web, connected to Ableton Live. Steps 0 and 1 of the plan are done and pushed. This chat does step 2: the mix.

Read these first:
- Project doc ccd/school-redesign.md, the last two sections ("Build · step 0" and "Build · step 1"): what exists and what is not done.
- Project doc ccd/school-instrument-plan.md: the plan, including "Revised in the build chat" at the end (Tauri, one source).
- Project doc ccd/engine-sound.md: how the engine makes sound and the sound roadmap.
- Design canvas: https://claude.ai/code/artifact/36c4ce2a-9660-4375-a101-a41ac0edc49a. For this chat the boards are, on page "Model 1 · final": ZStage, ZStageFixed, ZCompare, ZFaders; and page "Model 1 · round 9 · mix" for how mix behaves. Read them with the Artifact tool for exact layouts.
- Repo paramminhas5/Ableton-Final-Next, branch school/field:
  - engine/ (Rust engine), engine-wasm/ (web build), mobile/ (Tauri shell), artifacts/ccd-school (the web app).
  - Studio is src/components/m1/Studio.tsx with studio.css; the track is src/lib/track2.ts; the engine bridge is src/engine/.
  - Web app: npm install --legacy-peer-deps. Engine: npm run engine (types and wasm).

The rule that matters most: the web app is the one source of every screen. The phones open it and only sound is native. Build and check everything on the web; the phones follow.

How mix works (settled):
- Studio has two modes, play and mix. Mix is the switch in the header (disabled today).
- Stage: pan across, pitch up and down, dot size is loudness, reverb shows as haze. Two layers fighting for the same band in the same place get a red ring and fix pads that glow. Hold the screen to hear the mix as it was before your changes.
- Faders: names on top, an engraved 0 dB line, a master strip called out. Tap a strip to open it wide.
- Finish rules: the selected pad lights from behind, a dim glow only points at something, knobs and faders stay clean (no light rings, no meters on them), labels engraved, screens deep glass, every screen full height.

This chat, step 2:
1. Engine:
   - Master: a program-dependent glue compressor and a true-peak limiter at 4x oversampling, replacing the safety clip.
   - Metering and analysis per layer, sent to the UI about 30 times a second: peak, loudness, low/mid/high energy, pitch centre, and stereo position.
   - Clash detection: two layers with energy in the same band at the same pan, with a suggested fix (eq cut, pan, or duck).
   - Compare: a snapshot of every layer's mix params that "hold to compare" can switch to and back, click-free.
   - Low-latency IIR half-band filters for the 2x stages, to bring the engine's fixed 1 ms down to about 0.1 ms. Keep the delay compensation exact and the timing tests passing.
2. UI: mix mode in Studio, exactly as on the canvas: the stage and the faders, clash rings and fix pads, hold to compare, master strip.
3. Tests: render tests that the limiter never passes 0 dBTP, that duck still dips after the master, that clash detection fires on two basses at the same pan and not on bass and hats. Keep npx tsc --noEmit, npx vitest run, cargo test and next build passing.

Waiting on me (ask if I haven't sent them):
- Latency results from my iPhone and Android phone (the mic test in /lab/engine) and whether Link held tempo with Live.
- Ableton's reply about the Android Link licence (emailed 3 Nov). Until then Android is an unofficial APK and the stores wait. iOS uses LinkKit. Link on iPhone needs Apple's multicast entitlement, which only a paid Apple Developer Program account holder can request (my Apple ID is not enrolled yet, checked 3 Nov). Until then the iPhone runs with a free personal team and no Link.

Working rules:
- Commit to school/field as you go, push when a step works.
- Render every screen you touch at 390x844, light and dark, and look at it before calling it done.
- If something can only be checked on my Mac or phones, tell me exactly what to run.
- After the step, add a short changelog entry to ccd/school-redesign.md in the project.
- Plain copy, lowercase UI text, no em dashes.
