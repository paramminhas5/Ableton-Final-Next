# CCD School redesign: Model 1 (the app is an instrument)

Decided 2 Nov 2026. Param picked the "Instrument" direction after three rounds (calm Apple, A/B/C, then glass, records, instrument). Mockups live on the "CCD School Redesign" design canvas, page "Instrument". Earlier rounds are on its "Explorations" page.

Audit done on branch `school/final` (commit 328b1f9), built locally and screenshotted at 390x844 and 1440x900, plus a code scan of `artifacts/ccd-school`.

## The idea

Every screen is a piece of gear: an aluminium body, one screen that shows what matters, and controls you can almost feel. Premium comes from the materials and detail. Fun comes from pressing, turning and hearing it.

Rules:
- One screen per view. An LCD for status and readouts, a paper display for anything you read.
- One orange button per screen. Orange means go: play, continue, start.
- Pads take you places. White keys are for answers. LEDs report back.
- Everything makes a small sound, tuned to one key, with a mute switch.

## Design system (Model 1)

- **Materials:** aluminium body (#EDEDF0 to #D9DADE), graphite for dark mode (#34353B to #1C1D21), LCD (#0D1210, phosphor #5FD38D, text #C8FFD9), paper display (#F8F7F2), rubber pads, white keys.
- **Colour:** signal orange #FF5A1A (go). Pads by area: Fundamentals sky #8FD3FF, DJ butter #FFE066, Producer lavender #C6B6FF, Practice lime #B9F27C, Studio rose #FFB3C7. LEDs: green #3BD16F correct, red #FF3D3D wrong and hearts, orange #FF7A1A streak, grey off. LED state always paired with an icon or word, never colour alone.
- **Type:** one UI family (SF Pro on Apple, Inter elsewhere), titles 800 weight. Mono (SF Mono / JetBrains Mono) only for LCD readouts. Silkscreen labels: 12px caps, printed on the body only. Lesson reading 18/27 on paper. Nothing below 12px.
- **Controls:** big play button, pads (rest and pressed), answer keys with LED, knob (daily XP), A/B switch, fader (progress), LED rows (streak, session), mode keys (main navigation), rack modules (lists), channel strips (Build a Set).
- **Motion:** press (5px travel, shadow collapses, 80ms), turn (knob spring), light (LED fade 120ms), type-on (LCD text), sheet. Reduced motion turns it off.
- **Sound and touch:** tap tick, correct rising third, wrong low muted note, lesson complete short chord. Light haptic per press where supported. Mute switch.
- **Brand:** CCD stays as stickers on the body (the cat mascot goes here in the build), on welcome, lesson complete and desktop.

## What is wrong today, and the fix

### Foundations (whole app)
1. **Three typefaces, display face forced everywhere.** Bowlby One is set with `!important` on every heading (597 uses), plus Space Grotesk and Space Mono. Fix: one UI family plus mono for readouts.
2. **Text too small.** 680 places set text at 5 to 11px (395 at 10px, 168 at 9px, 84 at 8px, 18 at 7px). `globals.css` patches some of them back up to 11px. Fix: 12px minimum, 18/27 for lesson text.
3. **Shouting.** 826 uses of `uppercase`. Fix: sentence case. Caps only on silkscreen labels.
4. **Colour sprawl.** 108 hard-coded hex colours and five themes (ccd-classic, midnight, sunburn, synthwave, original). Fix: one token set, aluminium plus graphite dark mode, theme switcher removed.
5. **Thick borders and offset shadows, zero radius.** 3 to 4px ink borders and about 200 uses of the "chunk" offset shadow in ten variants. This is what reads as childish. Fix: the Model 1 kit's material shadows, real radii.
6. **Emoji as icons.** 848 emoji in components. Fix: one stroke icon set plus LEDs.
7. **Too much motion.** 31 animation classes (wiggle, float, bounce, glitch, cat bounce, confetti and more). Fix: five motions.
8. **Silent music app.** Fix: UI sound pack with mute.

### Navigation and chrome
9. **Lessons start a third of the way down the phone.** Site header, red streak banner, lesson header and breadcrumb stack up; lesson content starts around 290px down on a 844px screen. Fix: lessons go full screen with only close, a progress fader and heart LEDs.
10. **Red "streak at risk" banner on every page.** Fix: streak LEDs on Today and one evening push notification.
11. **Bottom nav** (Worlds, Missions, Review, Progress). Fix: four mode keys, Learn, Practice, Studio, Library. Progress moves into the profile.
12. **Desktop** has six top-nav items plus More, search, stats and sign-in, and content sits in a narrow column on the left with the right half empty. Fix: a console layout, mode keys on the left, content using the full width.
13. **Floating "?" button** covers lesson content. Fix: help lives in the lesson's top bar.

### Interruptions
14. **Rank-up overlay.** In testing with a learner at 340 XP, the full-screen "Loop Maker" rank-up appeared on every page load. Needs checking whether that is the seeded test data or a real bug (rank-seen state not saved). Either way: rank-ups fold into the lesson-complete screen and never cover navigation.
15. **"Evening!" toast** lands on top of the Daily Challenge card on Progress. Fix: no toasts over content.
16. **Scrolling marquees** on home and Worlds. Fix: removed.

### Content consistency
17. "Missions" and "lessons" used for the same thing. Fix: "lessons" everywhere.
18. **Counts disagree:** 153 missions (home, Worlds), 0/251 complete (Progress), 171 lessons in the content docs. Fix: one count, generated from content at build time.
19. **Two counters on one lesson screen** ("Mission 1 of 4" and "1 / 10"). Fix: one fader for the lesson; position in the path lives on the sequencer.
20. **Headline tone** ("Built Different.", "0 ADS. EVER.", "CATS CAN LEARN"). Fix: plain, adult copy that matches the kind-teacher voice of the lessons.

### Screen by screen
- **Welcome:** pile of cats, marquees, stat blocks. Now the device powers on: "hello.", one line on the LCD, play to start, "I have used Live before" for the placement test.
- **Today (was Progress):** seven stacked sections. Now one LCD with the next lesson, a big play button, an XP knob and four pads for what is next.
- **Worlds and paths:** a giant lime card at 0%. Now each world is a 16-step sequencer: lit steps done, orange step up now, banks are chapters.
- **Lesson:** bordered cards stacked. Now a paper display for reading, an LCD for diagrams, one orange Continue, a sound key.
- **Try it (47 sims):** each built differently, some with duplicate heading boxes. Now one sim frame: LCD scope, keys and faders, so every sim looks like part of the same machine.
- **Quiz:** answers become keys with LEDs; feedback and the explanation show on an LCD.
- **Lesson complete:** level meter, readouts for XP, right answers and time, rank on a label-maker strip, streak LEDs.
- **Ear Gym:** A and B pads, answer keys, session LEDs, replay key.
- **Device Atlas:** each device is a rack module; search is an LCD field.
- **Build a Set:** loaded Set on the LCD, the 14 stages as channel strips with LEDs, the current stage explained on paper.
- **Pro:** the graphite edition of the device; plan keys, UPI or card.
- **Not mocked yet, same kit:** Setup, Check my Set, First Beat, Plugin Guide, review, daily, leaderboard, profile, glossary, wiki, shop, admin.

## Build plan

Work on a new branch off `school/final` (proposed `school/model-1`), previewed on Vercel `ccd-school-app`. Each phase ends with the existing checks (typecheck, unit tests, build, `journeys`, `smoke`, `a11y`).

1. **Kit:** tokens in `globals.css` (one theme plus graphite), fonts, and kit components (Pad, Key, Knob, Fader, LCD, PaperDisplay, LED, ModeBar, RackModule, ChannelStrip). Remove theme switcher, chunk shadows, forced Bowlby One.
2. **Shell:** mode bar, full-screen lesson, remove streak banner, marquees, toasts and the floating help button. Fix or confirm the rank-up overlay.
3. **Lesson player:** concept, sim frame, quiz, lesson complete. Sound pack and haptics.
4. **Main screens:** Today, sequencer path, Ear Gym, Atlas, Build a Set, Pro, Welcome.
5. **The rest:** remaining screens, desktop console layout, graphite dark mode, copy pass, final QA.

## Round 4: hardware styles (2 Nov 2026, late)

Param liked Model 1, wants 2 to 3 alternative hardware/music styles on key screens, more imagery, and loves the idea that using the app teaches real hardware and VSTs. He especially likes the world as a step sequencer. On the canvas page "Hardware styles", each style has Today, a world as a step sequencer, and a lesson, with photography generated in Magnific (7 images, about 455 credits) and a "learn the gear" note per screen:
- **Synth:** black panel, walnut sides, amber display, knobs, patch-bay for up next, analog 16-knob sequencer, lesson as a synth manual page.
- **Deck:** club photo, colour waveform display, jog wheel for XP, cue and play, hot-cue pads for up next, pad sequencer mode for the world, lesson with cue (hear it) and play (continue).
- **Tape:** 70s studio, reels and tape counter, transport keys, VU meters, track sheet for up next, drum-machine step keys for the world, lesson as a studio notebook page.
A possible next step: one style per world (Synth for Producer, Deck for DJ, Tape or Model 1 for Fundamentals), so moving between worlds also moves between gear.

## Round 5: one family, three instruments (3 Nov 2026)

Param likes different instruments for different worlds but wants the style consistent. Direction: a hardware lineup. Canvas page "One family" (now the page the canvas opens on).
- **Always the same:** aluminium body (graphite at night), green LCD for status, paper for reading, one type family with mono only on the LCD, orange means go (one per screen), LED meanings, mode keys, the lesson player, and one world template (trim stripe, header, photo window, LCD, instrument, play, gear note).
- **Changes per world:** trim colour (Fundamentals sky #8FD3FF, DJ butter #FFD43B, Producer lavender #C6B6FF), signature control and how the world is laid out (Fundamentals: groovebox pad grid; DJ: jog wheel plus hot-cue pads; Producer: 16-knob step sequencer plus a patch bay for chapters), photography, gear notes, UI sounds.
- **Today** shows the three worlds as units in a rack, with the current lesson on the LCD.
- The Synth, Deck and Tape explorations stay on the "Hardware styles" page as reference.

## Open questions for Param
- Cat mascot as stickers on the body, as mocked: yes or no?
- UI sounds on by default, or off until switched on?
- Graphite: dark mode for everyone, or the Pro edition's look (as mocked), or both?

## Round 7 · Model 1 (3 Nov 2026), current direction
Canvas page "Model 1 · key screens". Combines:
- **Field (OP-1 field):** Outfit type, colours (mint fundamentals, cobalt DJ, magenta producer and "go", lilac chords/pads), square modules with round caps, knurled knobs in wells, numeral keys, the world as a 16-step sequencer.
- **Model 1 mix Studio (Novation):** black screen with named track lanes and the CCD cat, knobs with an LED dash, faders, lit pads.
- **Light and dark:** light is the bone OP-1 panel, dark is matte charcoal Novation. Follows the phone unless set.

Principle: using the app teaches the hardware people actually use. Every common control appears: step keys, encoders, faders, pads, keyboard, jog wheels, EQ knobs, crossfader, cue/play/sync, shift.

Key screens drawn: Today, World sequencer, Lesson (knob + keyboard try-it), Studio (layer select, 4 knobs, faders, sidechain/mute/solo/shift pads, transport), DJ (two waveforms, jog wheels, EQ/filter, channel faders, crossfader, cue/play/sync).

Your track: Learn offers a layer or an upgrade after each lesson, added only when you press "add to my track". Studio edits it.
- Every layer has a mixer strip: level fader, mute, solo, sidechain on/off + amount, pan, reverb and delay sends, low cut.
- Four knobs per layer plus a Shift page (kick: tune/decay/drive/click; bass: cutoff/res/envelope/glide; chords: cutoff/attack/release/reverb; etc.).
- Master page: tempo, swing, glue, limiter, DJ filter.
- Controls unlock with the lesson that teaches them (finish sidechain lesson, sidechain pad lights up).

Code status: branch school/field (uncommitted, not pushed) holds an early global restyle plus src/lib/track.ts (track model, lesson offers) and src/lib/track-engine.ts (WebAudio playback). Build waits for approval of the key screens.

## Round 8 · Model 1 approved and built (3 Nov 2026)
Approved design: canvas page "Model 1 · one-screen" (physical finish, engraved lettering, knobs without numbers, Studio and DJ each one screen). Component sheets in light and dark on the same page.

Built on branch `school/field` (uncommitted, not pushed). Typecheck clean, 161 unit tests pass (8 new for the track and world order), production build passes.
- Tokens: light (bone panel) and dark (charcoal), follows the phone, switch in the header. Outfit type. Old classes remapped so every page sits on the panel.
- Controls (`src/components/m1/`): keys, dished caps, knobs and faders you drag (scroll, arrows, double-tap resets), pads, switch, meter, world dial, engraved section lines, the screen.
- Screens: Today (`/dashboard`), World as a 16-step sequencer with banks (`/world/[slug]`), Studio (`/studio`), DJ (`/dj`), "add to my track" at the end of every lesson. Mode bar replaces the old bottom nav.
- Your track: `src/lib/track.ts` (lessons offer a layer or an upgrade, added only on press), `track-engine.ts` (WebAudio, sidechain duck, plays only on press), `track-midi.ts` (export to Live as a multi-track MIDI file).
- Removed things that moved on their own: rank-up overlay on page load (bug fixed), morning toast, sound-on banner, ambient animations.
Not yet: lesson screens themselves still use the old layouts on the new finish; DJ jog wheels are visual only; Shift-explains, MIDI hardware input and share clip are not built.

## Round 9 · 3 Nov 2026 · lessons, the rest of the app, and how studio works
Design canvas pages: "Model 1 · lessons", "the rest", "real hardware", "before and after", "round 4" to "round 7".
- Lesson hook: what you'll learn (from the lesson summary), what it adds to your track (the line you play, not a preset), and what you'll use, named for the thing being learnt (filter knob, pitch fader, hot cues, answer pads with the question count). `missionUses` / `missionLearns` in `src/lib/worldOrder.ts`.
- Try it records what you play: rec records after a 1 bar count-in, play stops and loops it, rec again adds on top, "use this line" makes it the layer. Still to build in the app.
- Finish: full-height screens, engraved seam under the screen, deeper bezel and glass. Pads sit in one recessed tray, matte silicone. The selected pad lights from behind; dim glow only when pointing at something (today's pick, the playing step, root notes, a resting drum rack). Knobs and faders stay clean: no light rings, no meters.
- Practice: progress per skill on the screen; drill pads carry a picture of what they train; done drills fade slightly and say "again".
- Studio, as of round 7: two modes, play and mix. Play: pick a layer (up to 8, empty slots say add), pick how to play it (steps, keys, pads), play, then shape it with one knob bank switch (sound, eq, fx, mix) plus mute and solo. Every layer carries its own mix (level, pan, send, duck). Mix: all 8 layers side by side, the same strips, + to add a layer.
- Bass on pads is an A minor scale grid with roots lit; drums on keys is one sound per key; drum rack rests dim and a hit sends a ripple.
- Open: a fourth play mode per layer (touch strip for bass, circle sequencer for drums, chord pads, XY for lead) and where it sits.

## Round 10 · 3 Nov 2026 · final screens and scope
- Canvas page "Model 1 · final" holds every screen in the settled style (44 boards): learn, lesson steps, studio for all 6 layer types and their own surfaces (glide, circle, chord pads, xy, rolls, riser), mix (stage, clash and fix, compare, faders), light studio, DJ, practice, library, you, first run (welcome with how it works, pick a world with pictures, the fader), sign in, menu, moments, tablet. The desktop/plugin board is parked.
- Mix: stage is pan across, pitch up and down, size is loudness, reverb is haze; clashes get a red ring and fix pads that glow; hold the screen to hear before your changes. Faders: names on top, engraved 0 dB line, master "out", a tapped strip opens wide.
- Scope: apps on iOS, Android and the web, connected to Ableton Live (Link, MIDI/stems/.als export, controller mode). One Rust engine, native on phones, WASM on the web; one React UI. Sound and playing at the level of top commercial instruments. Full plan: `ccd/school-instrument-plan.md`; next chat starts from `ccd/school-next-chat-prompt.md`.
- Repo: design sources live in `artifacts/ccd-school/design/` (generators, board HTML, screenshots of every final screen, the plan and the prompt).

## Build · step 0, the engine spike (3 Nov 2026)
Branch `school/field`, pushed. Stack changes from the plan, after research: the phone shell is **Tauri 2** (Rust core, so the engine runs in-process, no Swift/Kotlin bridge) instead of Capacitor; Android audio is AAudio through the `ndk` crate (low-latency, exclusive), iOS is RemoteIO through objc2 bindings (64-frame buffer); Ableton Link is **4.1.1**, whose open SDK includes Link Audio.
- `engine/` (Rust): sample-accurate clock and loop sequencer, 16-pad synth drum rack with hat choke, mono bass (PolyBLEP at 2x, ZDF ladder, glide, drift), strip per layer (eq, drive, crush, tone, duck, pan, fader law with 0 dB at 75%), echo and FDN reverb, parameter registry, C ABI, offline renderer. The 2x stages add a fixed 1 ms that the sequencer cancels, like DAW delay compensation. 35 Rust tests, including timing at any buffer size.
- Web: the engine as a 112 KB wasm in an AudioWorklet; test page `/lab/engine` with touch-to-sound measurement by microphone (tap the glass by the mic: the gap between the knock and the sound).
- Types: `npm run engine:types` writes `src/engine/params.gen.ts` from Rust; a Rust test fails if it is stale.
- Phones (`mobile/`): open the web app (one source for every screen); only sound is native. Android APK builds in the cloud; iOS code type-checks, the Xcode build and device tests run on Param's Mac (steps in `mobile/README.md`).
- Latency so far, headless Chrome in the cloud only: touch to engine about 2 ms, estimate touch to sound about 14 ms (128-frame buffer, 8 ms reported output). Real numbers need the phones: iPhone, Android and Link against Live are waiting on Param.
- Sound plan and how top plugins are made: `ccd/engine-sound.md`.

## Build · step 1, track v2 and Studio play (3 Nov 2026)
- Track v2 (`ccd.track.v2`, `src/lib/track2.ts`): up to 8 layers of note events with params by engine index, per-layer mix and duck. Migrates v1 on first read (kick, clap, perc fold into one drum rack; sidechain becomes duck under the kick); v1 stays as a backup. Lessons, Today, World and DJ keep the v1 API, now a view onto v2.
- Studio play rebuilt to the canvas (`studio · drums, pads`, `studio · bass, keys`, round 5 steps and pads): layer slots, steps (a lane per sound, 8 a page), keys (black keys between), pads (drum rack with ripple, a minor scale grid with roots lit), knob banks sound/eq/fx/mix with mute and solo, duck graph. Light and dark checked at 390x844.
- Recording: rec counts in one bar, play loops the take, rec again adds on top, snap 1/16, 1/32 or off, one take is one undo step, notes placed at the touch time.
- Not yet: mix mode (step 2), each layer's own surface (glide, circle, chord pads, xy, rolls, riser: step 3), chords and lead play on the mono synth until their instruments land, sampled kits wait on the sound-sources decision.
- Checks: typecheck clean, 199 web tests, production build passes.

## Build · step 2, the mix (3 Nov 2026)
Branch `school/field`, pushed (engine 674b1d0, UI 001d45a, studio slots a1d8b1b).
- **Master (`engine/src/master.rs`):** a program-dependent glue compressor (soft knee, fast and slow release), an out fader, and a look-ahead true-peak limiter at 8x estimation with a -1 dB ceiling replacing the safety clip. A hot eight-layer mix never passes 0 dBTP on a BS.1770 4x meter or a strict 16x meter.
- **Analysis (`engine/src/analysis.rs`):** per layer about 30 times a second: peak, momentary loudness (BS.1770 K-weighting), low, mid and high energy, pitch centre, pan. Clash detection finds two layers with correlated energy in the same band at the same place, with hysteresis, and suggests duck, eq cut or pan. The data is shaped so the mix coach can use it as it is.
- **Compare:** a snapshot of every layer's mix params; hold to compare switches to it and back with glided params, so no clicks.
- **Latency:** IIR half-band filters replace the linear-phase ones. The 2x path delay is 0.10 ms (was 1 ms); with the limiter look-ahead the engine's fixed delay is 0.48 ms, and the sequencer cancels it exactly. Timing tests pass at any buffer size.
- **Tests:** `engine/tests/mix.rs` (8): limiter never passes 0 dBTP, duck still dips after the master, clash on two basses at one pan, none for bass and hats or for basses panned apart, drums and bass clash cleared by the duck and cut fixes, meter rate, click-free compare. 6 more in `engine/src/master.rs`, and `tests/engine-mix.test.ts` (6) for the web decoder.
- **UI (`Mix.tsx`, `mix.css`):** mix mode in Studio as on ZStage, ZStageFixed, ZCompare and ZFaders. Stage: pan across, pitch up and down, size is loudness, reverb is haze; red ring and glowing fix pads for a clash; drag a dot sideways to pan it, up or down to brighten or darken it. Hold the stage to hear the mix as it was. Faders: names on top, an engraved 0 dB line, a master "out" strip, tap a strip to open it wide.
- **Studio slots (decided with Param, 3 Nov):** the slot row shows only the layers that exist, then one + tile that opens the add panel.
- **Checked:** every mix screen at 390x844, light and dark, in Chromium and WebKit. Measured, not listened: the listening panel has not compared the mix against Live yet. CPU for 8 layers about 14% of one native core, about 18% with analysis on.
- **Ableton:** no reply yet about the Android Link licence (emailed 3 Nov).

## Build · step 3, all six layer types (3 Nov 2026)
Branch `school/field`, pushed (engine 98d47e1, ac612e5; UI 1bc079e; sampler 498da9b).
- **Engine instruments:** `inst/synth.rs` (polyphonic chord synth: 6 voices, voicing as an organ-style stack, spread as saw detune, ZDF ladder, 2x oversampling; and a mono lead with legato glide), `inst/fxsynth.rs` (8 pads: impact, sub drop, noise hit, two sweeps, riser, zap, whoosh; the riser pad auto-ramps `build` over `length` bars at the tempo, and `build` is also a live fader), drum rack `open` (hat decay). Every instrument arrives at the strip with the same delay as the drums.
- **Note repeat** (`cmd::REPEAT`): hold a pad and hits land on the transport grid (1/8 to 1/32), the first immediately, flagged so the recorder keeps them.
- **Sampler voice** (`inst/sampler.rs`, `Instrument::Sampler`, `ccd_sample_load`): 16 slots per layer, mono, resampled to the engine rate on load (4-point Hermite), up to 30 s each. Pads mode plays slot n on note 36+n; keys mode plays slot 0 repitched from C4. Tune, start, release, gate, reverse. 1 ms fade in, fade out near the end and on retrigger, so no clicks.
- **Studio:** each layer type has steps, keys, pads and its own surface (bass glide strip, drums circle with hits and rotate per sound, chords pads in key plus a strum strip, lead xy, hats roll strip 1/8 to 1/32, fx riser fader, sample load). Sound presets per type (bass 5, chords 4, lead 4, fx 4, drum kits 5, sample 4). "sound 2" (shift) page for decay, wave, sub, drift and the rest. Several songs (24), each its own track. Loops of one to four bars with bar pages; step grid 1/8, 1/16, 1/32 per song.
- **Sample layer:** tap a slot under "load" to pick any audio file; it is decoded to mono and kept in this browser (IndexedDB), never uploaded, and sent to the engine on start. Pads, steps (four lanes) and keys all play it.
- **Sound in ten seconds:** a first-time visitor lands on Studio with a starter loop (four on the floor, snare, hats, a bass riff) that starts on the first touch.
- **Home fix:** the start button no longer covers the nav tabs and the scroll paw on phones.
- **Tests:** `engine/tests/instruments.rs` (8 render tests: chord level, no clicks, polyphony by FFT, lead aliasing, note-change clicks, fx per pad and riser, six layers under the ceiling, note repeat counts, sampler), 57 engine unit tests, 211 web tests. Typecheck, vitest, cargo test and next build pass. Every layer surface rendered at 390x844 in light and dark in Chromium and WebKit.
- **Gaps:** the chord synth is mono (no stereo width yet); lead filter motion and the riser fader are live only (not recorded); the step grid affects display and new steps only; samples reach the engine on the web only (the phone shell needs the same message, parked); the Android APK was not rebuilt (no Android SDK in the cloud container: run the APK build in `mobile/README.md` when you next build). Measured, not listened.

## Build · whole-app look pass, part 1 (3 Nov 2026, evening)
Branch `school/field`, pushed (3f72a16). Param asked for the engine and the whole look at 100%, with onboarding, zones, flow and the home screen to match the new app.
- **Welcome (`m1/Welcome.tsx`, replaces the old landing and five-step onboarding):** "make music while you learn it", one question (the basics, dj, make tracks), start goes straight to the first lesson in flow mode, three lines on how it works, "find my level" for the placement test. Anyone who has started goes to Today.
- **Today:** a world / your track switch on the screen (world progress and what is next, or the track lanes). The hear key plays your track, or auditions what the next lesson adds when you have no layers yet.
- **All lessons (`m1/Worlds.tsx`, serves `/worlds` and `/learn`):** a flow / free switch with one plain line of what each means, three world cards with progress and what is next, the level check. The world screen has the same switch.
- **Footer (`m1/Footer.tsx`):** cat, "a cats can dance project, made in bengaluru", the CCD links. On every screen except Studio, DJ and lessons.
- **Legacy blocks:** the old flat blue, pink and red hero blocks and cards now render as the black glass screen and recessed panels with a coloured edge (CSS in `globals.css`, "LEGACY BLOCKS"). Profile, sign in, pricing, review, daily, build, atlas and gym were checked at 390x844 in dark and light; light WebKit checked for the welcome.
- **Header:** no longer shrinks to the middle on pages that use it; the "model 1" tag is gone; hidden on Today, All lessons, Studio and DJ, which carry their own.
- **Checks:** smoke test (68 page loads, phone and laptop) clean; journeys J1, the placement journey and J7 updated for the welcome screen (the later journeys still describe the old Today and need rewriting in the final pass).
- **Still old (next):** the lesson player and its step screens, quiz, lesson complete, hearts popup, practice screens inside drills, DJ lessons, device pages, emoji used as icons (stats, ranks), the profile layout, Hindi. These belong to item 4 (lesson player on the engine) and the final pass.

## Build · Link licence route (3 Nov 2026)
- iOS switched to LinkKit 4.1.3, Ableton's free iOS SDK: the app links its xcframework, and the link button opens Ableton's Link settings pane, which LinkKit requires. Type-checked for iOS in the cloud; the Xcode build runs on Param's Mac.
- Android stays on open-source Link 4.1.1 as an unofficial APK, installed by hand. No Play Store or App Store release for now.
- Emailed link-devs@ableton.com for the Android proprietary licence (terms, fee, branding, Link Audio, GPL for test builds).
- Apple multicast entitlement (needed for Link on iPhone): Apple's request form is only open to a paid Apple Developer Program account holder. Param's Apple ID is signed in but not enrolled, so the request waits on enrolment. The iPhone build can still run with a free personal team, without Link.

## Web first (3 Nov 2026)
- Decided: the web app goes to 100% before more phone work. Phones open the web app, so they follow for free; only native sound is phone-specific and it already works.
- Paused: Xcode build, Apple enrolment and the multicast request, Link on devices, store builds.
- The definition of 100% (six items, mix through final pass) is in "Web first" at the end of ccd/school-instrument-plan.md. Screens are now also checked in WebKit, since iOS runs the app in WebKit.
- Later the same day: the improvements from the product README (`ccd/school-readme.md`) were adopted into the 100% list: sound in ten seconds, a sampler voice, Web MIDI and MIDI clock, your track as the spine, the mix coach, the CCD showcase loop, low-end phone mode, Hindi, clean house. Decisions for Param (CCD kit with the residents, listening panel, price, keys) listed under "Needs Param". The next-chat prompt now drives all six items to 100%, starting with the mix.
- 3 Nov 2026 (evening): items 1 and 2 of the list are done (mix, all six layer types plus a sampler layer). Param's feedback of 20:20 and 20:50 IST: save several songs, steps in different bars, switch sounds, show only existing channels (all done in step 3); steps at 1/16 and 1/32 (done); and the design, onboarding, zones and flow to match the new app everywhere (next: the whole-app pass).

## Build · whole-app look pass, part 2 (3 Nov 2026, late)
Branch `school/field`, pushed (ee5288f, 8425b11). Param's answers the same evening: keep everything free for now and design Pro for retention and sharing; no listening panel yet; sounds from open sources or our own synthesis, the way Vital does it; replace the Magnific clips with open or own audio.
- **Lesson player (`m1/Lesson.tsx`, `lesson.css`), boards ZHook, ZConcept, ZQuiz, ZRight, ZWrong, ZListen, ZType, ZOrder, ZMatch, ZRecord, ZRecordPlay, ZAdd, ZHearts.** Top bar: close, one segment per step, five heart LEDs (a "free" tag in free mode). Every step is the glass screen plus one panel and one pink key fixed at the bottom. Answers are pick then check; the picked pad lights pink, right lights mint, wrong lights red with the right pad outlined; a small cat sticker reacts. Type it uses a seven-segment readout and number pads for numeric answers (tap tempo when the question is about tempo). Order lists slots on the glass; match pairs share a colour.
- **Concept pictures (`m1/GlassVisual.tsx`):** all 20 visual types redrawn as glowing line drawings on the glass in the world's colour, plus the diagram screen. The old `LessonVisuals` is gone.
- **Try it (`m1/TryIt.tsx`, `lib/lessonTake.ts`):** inserted before "you learned" in every lesson. Records on the engine over your own track (the lesson's layer emptied, everything else playing; a click when the track is empty): rec counts in a bar, play loops the take, rec again adds on top, undo, snap. Eight keys in the track's key for bass and lead, triads on each degree for chords, drum sounds for drums and hats. "use this line" keeps the take for the lesson; skip is always there.
- **Add to track (`m1/AddToTrack.tsx`) on track v2 and the engine:** your take, or the lesson's own pattern if you skipped, shaped with two knobs per layer type and heard through the engine. Drums keep the sounds you did not play; melodic layers take the new line. One pink key: add, then next lesson.
- **Hearts:** a one-time sheet explains them; out of hearts shows a seven-segment countdown, practice (three right answers from the lesson, nothing to lose, one heart back) or free mode. Reviews never cost a heart.
- **Practice (`GymPageClient.tsx`), boards ZPractice and ZDrill:** levels per skill and the week on the glass, drill pads (today's pick glows), review, daily challenge. A drill hides the app header and mode keys: a and b keys, stop, answer pads, check; the eq curve appears after you answer.
- **You (`ProfilePageClient.tsx`), board ZYou:** rank and progress on the glass, seven-segment readouts (streak, xp, lessons, layers), look, learning and interface-sound switches, worlds, rank ladder (no emoji), account pads.
- **Library (`AtlasPageClient.tsx`), board ZLibrary:** search on the glass, devices, words and guides; device rows with a picture per kind and a light once a lesson that uses it is done; tap to open the tip and lessons.
- **Gating:** free by default (`/api/gating` and the client fall back to free). **Clean house so far:** the old lesson player, classic lesson, mission page, world shell, path client and 30 more components nothing linked to were removed; links go straight to `/learn/<slug>`; `?view=free` worlds open the Model 1 world.
- **Checks:** typecheck, 224 web tests (13 new for takes and steps), production build; every lesson step shot at 390x844 in light and dark in Chromium and WebKit (`scripts/shots/lesson.mjs`, `scripts/shots/pages.mjs`).
- **Still old:** sign in, menu, moments, device pages, tablet and desktop layouts, daily, placement, leaderboard, shop, review list, the older reference pages. Journeys after J1, placement and J7 still need rewriting.

## Build · whole-app look pass, part 3, and the teaching clips (3 Nov 2026, night)
Branch `school/field`, pushed (8d4fac9, e1fa431, dbe465d).
- **Sign in (ZSignIn):** what you keep on the glass (your track, xp, layers, lessons), sign in or new here, email and password or Google; local progress is merged on sign in. Header and footer hidden. Magic link waits for an email sender.
- **Moments (ZRankUp, ZWorldDone):** worked out when a lesson completes and shown once on its last screen: a rank-up gauge with the controls you used, or world done with your track's lanes, send to live and mix it in dj. Share and keep going.
- **Menu (ZMenu):** search on the glass, eight go-to keys (review lights when lessons are due), worlds with progress, help and sign in or out. An old rule from the bottom-nav era hid the menu key on phones; removed.
- **Device pages (ZDevice):** title bar, the device on the glass, try it in the frame (the device lab itself is still the old look until it moves onto the engine), reach for it, learn it in with a light when done.
- **Teaching clips:** `engine/src/bin/teach_clips.rs` renders the dry and hall clap and the house sketch on our own engine; the Magnific clips are gone (`public/audio/engine/CREDITS.md` has the measurements). Two lines of lesson copy now match what was measured.
- **Still old:** daily, placement, leaderboard, shop, review list, public profile, the device lab and the 47 sims inside their frames, the older reference pages (setup, build, link, plugins, glossary, wiki, signal flow, shortcuts), tablet and desktop layouts. Journeys after J1, placement and J7 still need rewriting.

## Build · whole-app look pass, part 4 (4 Nov 2026)
- **Shared parts:** `src/components/m1/parts.tsx` holds `PageHead`, `Readout`, `ListRow`, `SegBar`, `RankMark`, `TierMark`, `RefPage` (title, glass intro, content), `SearchField`, `Chips`, `KeyCap`. Old pages are ported onto these in one pass each. Icons added: flame, shield, gem, bolt, heart, trophy, globe, up, down, brain, note, cat.
- **Rebuilt on Model 1:** Today (daily goal on a three-digit seven-segment, streak, next lesson, fading reviews, one pink start key), review list, shop (gems on the glass, shield, heart refill, 2x xp for an hour, bonus theme), leaderboard with league tiers (marks and LEDs, no emoji), placement test, public profile and its share card, streak, rank-up and trophy moments and the trophy share card, header and command palette, setup, glossary, plug-ins, shortcuts, signal flow. `/train` now redirects to `/gym`.
- **Emoji out:** ranks and leagues carry a mark or LED instead of an emoji; every pictograph emoji was removed from UI code and lesson data (music symbols such as flat, sharp and the check mark stay).
- **Tablet and desktop:** the Studio now has the ZTablet layout from 900 px wide: layers listed at the left, the black screen and surface picker and pads in the middle, shaping and knobs at the right, transport centred below; mix mode fills the middle and right. On phones the layout is unchanged. Added `st-main`, `st-side` and `st-mixwrap` wrappers (they are `display:contents` on a phone).
- **Checks:** `npx tsc --noEmit` clean, 224 web tests pass, `next build` passes. Looked at in Chromium at 390x844 light and dark (daily, review, shop, leaderboard, placement, profile, setup, glossary, plug-ins, shortcuts, signal flow) and the Studio at 390, 1024 and 1366 wide. WebKit not yet re-checked for these pages. `scripts/shots/pages.mjs` takes `VW` and `VH` for other sizes.
- **Gotcha:** after `npm run build`, kill the old `next-server` process by its exact PID before starting again; otherwise the running server serves the replaced build and every stylesheet 404s, giving unstyled shots.
- **Still to do in the look pass:** see the "Look pass, still old" line in `school-next-chat-prompt.md`.

## Build · whole-app look pass, part 5 (4 Nov 2026)
Branch `school/field`, pushed (f2da7a9, c720fec, e1b5b7c).
- **Reference pages rebuilt on the Model 1 parts** (`RefPage`, `PageHead`, `ListRow`, `SegBar`, `Chips`, `SearchField`, `Silk`, `GoPill`, `Pad`): Wiki (world chips, chapter silks, expandable path rows, trophies), Devices, Link, Build, Missions (all lessons), Challenge (glass intro, option pads, a segment bar for the 30 second clock), Upgrade (layout only; copy and prices untouched until Param answers on `school-pro.md`) and first beat (RefPage, step pads with `"<lane> step N"` labels, one pink go key). `world/WorldWiki.tsx` is deleted.
- **Today at tablet and desktop width:** wrappers `td-root`, `td-head`, `td-switch`, `td-left`, `td-right`; 600 px max from 640 px; two columns from 900 px (screen and next lesson at the left, worlds dial, meter and hear key at the right).
- **Emoji sweep finished:** the last pictograph fields in drills, mission screens and flagship lesson data cleared, star prefixes removed from device preset names, the fire from the streak reminder push title.
- **Shot scripts:** `pages.mjs` and `lesson.mjs` ignore the generic "Failed to load resource" noise and report real 404s by URL; `pages.mjs` falls back to a clipped 6000 px shot when WebKit cannot take a full-page shot of a very long page. The one 404 every shot used to log is `/_vercel/insights/script.js`, which only exists on Vercel; it is not a bug.
- **Journeys:** `scripts/journeys.mjs` has a `playLesson` helper and J1 (lesson half) passes on the new player. J1 setup and first beat are rewritten but not yet verified; J2 to J10 and placement still describe the old UI.
- **Checks:** `npx tsc --noEmit` clean, 224 web tests pass (1 skipped), production build passes. Engine untouched this session, so `cargo test` was not re-run and the Android APK needs no rebuild. Looked at in Chromium and WebKit at 390x844, light and dark.
- **Still old:** the path list (`PathPageClient`), playground and match pages, the device lab and the 47 sims inside their frames (item 4), Upgrade copy and rupee prices (waiting on Param), the admin page (internal tool, left alone).

