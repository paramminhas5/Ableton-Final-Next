# CCD School · prompt for the build chat

Paste everything below the line into a new chat attached to the CatsCanDance project.

---

We're building CCD School into a real instrument: one Rust sound engine and one React UI, shipped as apps on iOS, Android and the web, connected to Ableton Live (Link, MIDI/stems/.als export, controller mode). Sound and playing have to hold up against top-tier commercial instruments, good enough to make real music: band-limited synths, oversampling, zero-delay-feedback filters, multisampled kits, studio-grade reverb, expressive velocity and pressure, low latency. The quality bar is in the plan.

**Read these first:**
- Project doc `ccd/school-instrument-plan.md`: the full plan, platforms, repo layout and build order. Follow it.
- Project doc `ccd/school-redesign.md`: every design decision so far.
- Design canvas: https://claude.ai/code/artifact/36c4ce2a-9660-4375-a101-a41ac0edc49a. Page "Model 1 · final" has every screen (phone and tablet). Ignore the plugin window board, since the plugin isn't in scope now. Read the boards with the Artifact tool when you need exact layouts. Pages "round 5" to "round 9 · mix" explain how studio and mix work.
- Repo `paramminhas5/Ableton-Final-Next`, branch `school/field`, app in `artifacts/ccd-school` (Next.js 15, React 19, Tailwind v4, `npm install --legacy-peer-deps`).
  - The Model 1 controls are in `src/components/m1/`.
  - The current audio is in `src/lib/audio.ts`, `audio-bus.ts`, `device-engine.ts`, `track-engine.ts` and `track.ts`.
  - The lesson sims are in `src/components/sims/`.

**How studio works (settled):**
- **Two modes:** play and mix.
- **Play:**
  - Pick a layer (up to 8: drums, hats, bass, chords, lead, fx, plus empty "add" slots).
  - Pick how to play it: steps, keys, pads, or that layer's own surface (bass glide strip, drums circle, chords chord pads, lead XY, hats roll strip, fx riser).
  - Play, then shape it. One knob bank switch (sound, eq, fx, mix) drives four knobs, with mute and solo next to it.
  - Every layer carries its own mix: level, pan, send, and duck under a chosen layer.
- **Mix:**
  - The stage: pan across, pitch up and down, dot size is loudness, reverb shows as haze. Clashes get a red ring and fix pads.
  - Or the faders: tap a strip to open it wide; there's a 0 dB line and a master. Hold the screen to compare with before.
- **Finish rules:**
  - The selected pad lights from behind. A dim glow only points at something.
  - Knobs and faders stay clean: no light rings or meters on them.
  - Labels are engraved, screens are deep glass, and every screen uses the full height.

**This chat:**
1. **Do step 0 of the plan, the spike.**
   - Create `engine/`: a Rust crate with a sample-accurate clock, a kick and a mono bass synth (band-limited oscillator, zero-delay-feedback filter, envelope, glide), and a parameter registry.
   - Run it three ways:
     - WASM in an AudioWorklet inside the Next app, behind one test page.
     - Native on iOS (Core Audio) inside a Capacitor shell.
     - Native on Android (Oboe) inside the same shell.
   - Measure touch-to-sound latency on each and write the numbers down.
   - Add Ableton Link on the phones, so tempo follows Live. I'll test it against Live on my machine.
   - Generate TypeScript types for the parameters from Rust.
2. **Then step 1.**
   - Track v2: up to 8 layers, note events, parameter banks; migrate from `ccd.track.v1`.
   - Rebuild Studio play for drums and bass (pads, keys, steps) on the new engine, exactly as on the canvas.
   - Recording: rec with a one-bar count-in, play loops it, rec again adds on top, plus undo and snap.

**Working rules:**
- Commit to `school/field` as you go, and push when a step works.
- Keep `npx tsc --noEmit` and `npx vitest run` passing. Add tests for timing, theory and the schema migration.
- Render the screens you touch at 390×844 and look at them before calling a step done.
- If a tool is missing in the cloud (Rust, wasm-pack, the Android SDK and NDK), install it. iOS builds and device tests need my Mac and phones, so when something can only be checked there (Xcode build, latency on device, Link with Live), tell me exactly what to run.
- After each step, add a short changelog entry to `ccd/school-redesign.md` in the project.
- Plain copy, lowercase UI text, no em dashes.
