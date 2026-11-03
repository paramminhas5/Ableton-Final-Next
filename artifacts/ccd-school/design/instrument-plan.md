# CCD School · making it a real instrument

Apps on iOS, Android and the web that connect to Ableton Live, with sound and playing that hold up against top-tier commercial instruments.

Written 3 Nov 2026, after the Model 1 design rounds. This is the build plan for the next chats: what has to exist so every control on the canvas actually works, with one engine behind the whole app.

## Where we are

- Design is settled on the canvas (CCD School Redesign artifact). The page "Model 1 · final" has every screen: learn, lesson steps, studio for all 6 layer types, mix, DJ, practice, library, you, first run, moments, tablet, and the desktop/plugin window. Earlier pages show how it got there.
- The app (`artifacts/ccd-school`, branch `school/field`) already has the Model 1 shell, controls (`src/components/m1/`), Today, World, Studio, DJ and add-to-track.
- Audio exists, but in pieces that don't share code:
  - `audio.ts`: synth drums, tones, loops.
  - `audio-bus.ts`: 22 device processors (eq, comp, reverb, delay, filter, drive and more).
  - `device-engine.ts`: one graph per device page.
  - `track-engine.ts`: plays your track on a simple 16-step clock.
  - 47 lesson sims in `components/sims/`, most with their own audio.
  - `midi.ts`: Web MIDI input hook.
  - `gym/`: practice drills.

## The goal

One engine (call it the CCD engine) that studio, lessons, sims, practice drills and DJ all use. It's the same code everywhere: a bass you shape in a lesson sounds identical in studio and in the export.

## 1 · Engine core

- **Clock and transport.**
  - A sample-accurate scheduler: a lookahead timer that schedules about 100 ms ahead, moving to an AudioWorklet clock later.
  - Tempo, swing, loop length, count-in.
  - Play, stop, rec, overdub, quantize ("snap"), and undo/redo for every edit.
- **One event model.**
  - Every surface produces the same note events: `{ layer, note, velocity, start, length }` in ticks, plus parameter automation.
  - The 16-step grid, the piano roll and the circle are all just views of these events.
- **Instruments.** Up to 8 layers, each with one instrument:
  - **Drum rack:** a 16-pad sampler with tune, decay, drive, level, and choke groups so an open hat stops when a closed hat plays.
  - **Mono bass synth:** oscillator mix, filter and envelope, glide and legato, sub.
  - **Poly synth for chords and pads:** voicing, spread, attack, release.
  - **Lead synth:** for the XY surface.
  - **Hats:** the drum rack with roll and note repeat.
  - **FX / riser:** noise and sweep generator, impacts.
  - Presets per lesson, so each lesson offers a sound and the user's tweaks are saved.
- **Channel strip per layer:** instrument → filter → EQ (3 band) → drive → duck → pan → fader, then sends to a shared reverb and delay bus, then master (glue compressor + limiter) → meter.
- **Duck (sidechain).**
  - The layer picks what it ducks under (default: drums, kick).
  - The dip is scheduled from that layer's hits: exact, cheap and in time. An audio envelope follower can come later.
  - Amount and release are on the duck knob.
- **Mute and solo:** solo logic across all layers. The layer row reflects both states.
- **Metering and analysis.**
  - Per-layer peak and loudness, plus low/mid/high energy and the pitch centre of each layer.
  - These feed the mix stage: up and down position, dot size, and clash detection (two layers sharing a band in the same pan position).
- **Parameters.**
  - One registry: id, range, unit, default, curve, smoothing, display text ("−3 dB", "pan L 20"), detents (0 dB, centre).
  - Every knob and fader binds by id.
  - The screen shows the value on touch, and double-tap resets to the default.

## 2 · Playing surfaces (all output note events)

- **Keys:** multi-touch, velocity from where on the key you press.
- **Pads (scale grid):** the key and scale come from a shared theory library, with root notes lit.
- **Drum rack:** 16 pads. A hit lights the pad and sends a ripple.
- **Steps:** a 16-step grid per layer, and a lane per sound for drums, 8 steps per page.
- **Fourth surface per layer:**
  - **Bass · glide strip:** continuous pitch that snaps to the scale; glide time comes from the knob.
  - **Drums · circle:** a Euclidean generator, with hits and rotate per sound.
  - **Chords · chord pads:** roman numerals in key, plus a strum strip.
  - **Lead · XY:** pitch in scale across, filter up and down.
  - **Hats · roll strip:** note repeat from 1/8 to 1/32.
  - **FX · riser fader:** a sweep over N bars.
- **Touch quality.**
  - Pointer events with multi-touch and no scroll stealing.
  - `latencyHint: "interactive"`, voices warmed up before you play, and the iOS audio unlock.
  - Haptics where the platform allows.

## 3 · Data and saving

- **Track v2 schema:** up to 8 layers, each with instrument, events, the params for each knob bank, duck source and sends.
- Migrate from `ccd.track.v1`.
- Undo/redo history.
- Saved locally, and synced to the account when signed in (`db.ts`).
- Add-to-track writes v2 layers.

## 4 · Getting music out

- **MIDI file:** exists today. Upgrade it to v2 events.
- **WAV:** render the mix and per-layer stems with OfflineAudioContext, using the same engine, so it sounds the same.
- **"To live":** a zip of MIDI plus stems. A real Ableton set (.als) can come later.
- **Web MIDI in:** play from a real controller, and use MIDI learn to map hardware knobs to any parameter. MIDI clock out later.

## 5 · Lessons, practice, DJ on the same engine

- **Unlocks:** each control unlocks when its lesson is done (`gating.ts`). Locked controls show the lesson name.
- **Try it:** the try-it step records into the lesson's layer (rec, play, rec again to add on top, use this line).
- **Sims:** port them to the engine in order of use:
  1. subtractive synth
  2. bassline lab
  3. drum pad
  4. beat builder
  5. sidechain
  6. mixer
  7. EQ
  8. send/return
  9. filter envelope
  
  The rest come later.
- **Practice drills:** the A/B and EQ ear drills render through the same strip, so "boosted" means the same thing everywhere.
- **DJ:** both decks run through engine strips. Your track plays on deck A.

## 6 · Screens to finish in the final style

- Lesson player, every step type, including the hook and try-it with recording.
- Add to track.
- Studio play for all 6 layer types and all 4 surfaces, plus mix (faders, stage, clash, compare).
- DJ, redone in the final style.
- Today, World.
- Practice and drills.
- Library and device pages.
- You (profile).
- Onboarding, sign in, menu.
- Moments: rank up, streak, world done.
- Desktop layouts.
- Light mode for studio.

## 7 · Testing

- **Unit tests:** theory (scales, chords, Euclid), scheduler timing, parameter mapping, schema migration.
- **Audio render tests:** OfflineAudioContext with level checks, for example that duck really dips the bass after a kick.
- Screenshot checks of each screen in light and dark.
- **Devices:** iOS Safari and Android Chrome.
- **Performance budget:** 8 layers playing on a mid-range phone.

## Platforms (decided 3 Nov 2026, revised the same day)

What matters is apps that run on iOS, Android and the web, and that connect to Ableton Live. A VST plugin and a desktop app are not needed now. Because the engine is native Rust, they stay possible later without a rewrite.

- **Sound engine:** one Rust crate (`engine/`). It's real-time safe and covers clock, sequencer, instruments, channel strips, mixer, analysis and the parameter registry. Nothing about sound lives anywhere else.
- **iOS:** the engine runs natively behind the lowest-latency audio path iOS offers (Core Audio / AVAudioEngine render callback), called from Rust through a C interface.
- **Android:** the engine runs natively through Oboe (AAudio), with a low-latency stream and exclusive mode where the device allows.
- **Web:** the engine is compiled to WebAssembly and runs in an AudioWorklet.
- **App shell:**
  - The React Model 1 UI runs in Capacitor on iOS and Android, with a native plugin bridging to the engine. On the web it runs as is.
  - The spike measures touch-to-sound latency through the webview. If it misses the target, the playing surfaces (pads, keys, strips) get a thin native touch layer, and the rest stays React.
- **One bridge, typed:** set a parameter, note on/off with velocity and pressure, transport, and meter readings back. TypeScript types are generated from the Rust registry.
- **Ableton Live:**
  - Ableton Link on iOS and Android, for tempo and beat sync with Live over Wi-Fi. The web can't do Link, because browsers can't open the network ports it needs.
  - Export per track: MIDI per layer, WAV stems, and a Live set (.als) with layers already on tracks. Use the share sheet on phones.
  - Controller mode: the app's pads, keys and knobs send MIDI to Live over USB or network MIDI, so the app can play Live too.
  - Check whether Ableton's Link Audio (streaming audio between Link apps) is available to third parties. If it is, send the track's audio straight into Live.
- **Repo layout:**
  - `engine/` (Rust)
  - `engine-wasm/` (worklet glue)
  - `mobile/` (Capacitor app with iOS and Android engine plugins)
  - `artifacts/ccd-school/` (the React app, also the web build)
  - `packages/ui-bridge/` (the bridge and generated types)
- **Builds:** CI for the web/WASM build, the iOS build (TestFlight) and the Android build (internal testing track).
- **Licences to check before shipping:** Ableton Link (GPL or a commercial licence from Ableton), sample and multisample libraries, and the font.

## Sound and playing quality bar

The aim is that it sounds and plays like top-tier commercial instruments, so people make real music with it rather than toy loops.

- **Synths:**
  - Band-limited oscillators (wavetables with mipmaps, or BLEP), no aliasing up the keyboard.
  - 2 to 4 times oversampling on anything that distorts.
  - Zero-delay-feedback ladder and state-variable filters that self-oscillate musically.
  - Exponential envelopes with proper retrigger and legato rules, glide that follows the keyboard, unison and drift.
- **Drums:** multisampled 24-bit kits with velocity layers and round robin, plus synthesised kicks and 808s with pitch envelopes for the bass-heavy styles.
- **Keys and chords:** multisampled electric piano, piano and pad instruments, alongside the synths.
- **Effects:**
  - A studio-grade algorithmic reverb (feedback delay network).
  - A tempo-synced delay with a filtered feedback path.
  - Oversampled saturation, a glue compressor on the master, a true-peak limiter, and EQ with smooth curves.
- **Expressive playing:**
  - Velocity from how you hit (contact size, speed, and force on devices that report it).
  - Pressure after the hit (aftertouch).
  - Per-note slide on the glide strip and XY, the way MPE controllers work.
  - MIDI and MPE controllers plug in and just work.
- **Latency targets:**
  - Under 10 ms from touch to sound on iOS.
  - Around 20 ms or better on Android, depending on the device.
  - Best effort on the web.
  - Recording compensates for latency, so notes land where you played them.
- **Recording:**
  - Count-in, loop record, overdub.
  - Snap off, 1/16, 1/32, swing-aware, with a strength setting.
  - Undo for everything.
  - "Capture": grab what you just played even if rec wasn't on.
- **Proof:**
  - A/B listening against reference instruments.
  - Render tests that catch aliasing and clicks.
  - A CPU budget of 8 layers at 48 kHz under about 30% on a mid-range phone.

## Build order, revised

0. **Spike:** a Rust kick and mono bass, playing through native audio on an iPhone and an Android phone (Capacitor shell) and on the web (WASM). Measure touch-to-sound latency on each, and get Link holding tempo with Live on a phone.
1. Engine core at the quality bar above (clock, events, drum rack sampler, bass synth, parameter registry), track v2, and Studio play for drums and bass on keys, pads and steps, with expressive velocity and recording.
2. Channel strip, sends, duck, master, metering and analysis, and the mix faders and stage.
3. Chords (multisampled plus synth), lead, hats and FX instruments, and every fourth surface.
4. Ableton: Link on both phones, MIDI/stems/.als export, controller mode, and Link Audio if available.
5. New lesson player screens, try-it recording, add-to-track v2, unlocks. The sims move onto the engine.
6. Practice, library, profile, onboarding, moments, DJ on the engine, tablet layouts, PWA.
7. TestFlight and Play internal builds, performance, polish, store listings.

## Open decisions

- **Sound sources:** commission or record CCD multisample kits, license a library, or both.
- **App shell:** Capacitor, unless the spike shows the webview adds too much latency.
- **Price model:** what is free and what is Pro.

## Revised in the build chat (3 Nov 2026)

- **App shell: Tauri 2, not Capacitor.** The app core is Rust, so the engine runs in the same process with no Swift or Kotlin bridge. Android audio is AAudio through the `ndk` crate (low latency, exclusive stream); iOS is RemoteIO through objc2 bindings.
- **One source for every screen.** The phone apps have no pages of their own: they open the web app (`artifacts/ccd-school`, address in `mobile/app-url.json`). Only sound is native. Build and check every screen on the web first; the phones follow.
- **Ableton Link 4.1.1**, built from Ableton's repo. Its open SDK and C API include Link Audio, so streaming the track into Live is possible in step 4.
- **`packages/ui-bridge/`** is not needed: the bridge and generated types live in the web app at `src/engine/`, which every platform loads.
- Sound plan: `engine/SOUND.md` (also `ccd/engine-sound.md` in the project).

## Ableton Link licence (3 Nov 2026)

- Link has two licences. The open-source code on GitHub is GPLv2: shipping it inside the app would mean publishing the whole app's source under the GPL, and Ableton says the GPL is not compatible with the App Store. The other route is a proprietary licence.
- iOS: LinkKit, Ableton's iOS SDK, is free and royalty-free under the Ableton Link SDK licence. Conditions: follow Ableton's UI guidelines, use their logo and materials as supplied, don't sell Link as an in-app purchase. Plus Apple's multicast entitlement.
- Android (and desktop): proprietary terms are not published. Request them from link-devs@ableton.com.
- Decided 3 Nov 2026: iOS uses LinkKit 4.1.3 (switched in the build chat; the link button opens Ableton's settings pane). Android ships as an unofficial APK with open-source Link for now; no Play Store until the proprietary licence is in place. The App Store waits too. Licence request emailed to link-devs@ableton.com on 3 Nov 2026 (terms, fee, branding, Link Audio, GPL for test builds).
