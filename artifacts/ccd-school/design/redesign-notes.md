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
