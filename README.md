# CCD.SCHOOL

> The most structured music education on the internet — 153 missions across Fundamentals, DJ World and Producer. Gamified, source-verified, brutally effective.

[![Next.js](https://img.shields.io/badge/Next.js-15.3-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06b6d4)](https://tailwindcss.com/)

---

## What it is

CCD.SCHOOL is a gamified music-education platform covering three worlds:

| World | Source | Missions |
|---|---|---|
| **Fundamentals** | learningmusic.ableton.com | 40 missions — sound, rhythm, melody, harmony, music tech |
| **DJ World** | Pioneer DJ rekordbox 6.0.0 Manual | 40 missions — setup, library, the mix, performance, mastery |
| **Producer** | Ableton Live 12 Reference Manual | 73 missions — first contact, sound & MIDI, the mix, performance, advanced, synthesis |

Every mission has two complete learning formats:
- **Flow Mode** (🌊): Duolingo-style — hook → concept screens with visuals → interactive sim → quiz → summary. Sequential gating, hearts on wrong answers.
- **Free Mode** (🔓): Scrolling explainer + sim + Normal/Hard quiz. All missions open from day one.

---

## Tech Stack

```
Framework       Next.js 15.3 (App Router, React 19)
Styling         Tailwind CSS v4 (CSS-first, no config file)
State           LearnModeContext + TanStack Query + localStorage + PostgreSQL (pg)
Auth            next-auth v5 beta
Payments        Stripe
AI Coach        Kimi API (platform.moonshot.cn) via /api/beat-coach
Audio           Web Audio API — no asset files
Hosting         Vercel
Package mgr     npm
```

---

## Quick Start

```bash
git clone https://github.com/paramminhas5/Ableton-Final-Next.git
cd Ableton-Final-Next/artifacts/ccd-school
npm install
cp .env.example .env.local   # fill in required vars
npm run dev                  # → http://localhost:3000
```

### Required `.env.local`

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Optional — Beat Coach AI. Without this it degrades gracefully.
KIMI_API_KEY=your-moonshot-key
```

Get a Kimi API key at [platform.moonshot.cn](https://platform.moonshot.cn).

---

## Project Structure

```
artifacts/ccd-school/
  app/
    page.tsx                      ← Home (onboarding / dashboard)
    dashboard/page.tsx            ← Unified progress dashboard ✦ NEW
    learn/[slug]/page.tsx         ← Mode-aware lesson (CCD or Classic)
    mission/[slug]/page.tsx       ← Redirects → /learn/[slug] ✦ NEW
    world/[slug]/page.tsx         ← Duolingo path map
    worlds/page.tsx               ← World chooser
    missions/page.tsx             ← Browse/search all 153 missions
    ... 20+ more routes
  src/
    components/
      Header.tsx                  ← 3-item nav, 5-element strip ✦ REBUILT
      DashboardClient.tsx         ← 8-section unified dashboard ✦ NEW
      OnboardingFlow.tsx          ← 5-step onboarding (Step 0 = experience picker) ✦ UPDATED
      LessonPlayer.tsx            ← CCD Duolingo engine (hook/concept/interact/quiz/summary)
      LessonVisuals.tsx           ← 19 animated inline visual types
      InlineClassicLesson.tsx     ← Explorer mode (Normal/Hard) ✦ UPDATED
      LessonPageClient.tsx        ← Mode-aware lesson router ✦ UPDATED
      BeatCoach.tsx               ← FloatingCoachButton + CoachPanel chat ✦ REBUILT
      HeartsWall.tsx              ← Out-of-hearts blocker w/ gem-spend ✦ UPDATED
      WorldPathClient.tsx         ← Duolingo winding path map
      sims/                       ← 47 interactive simulators
    content/
      missions-foundations.ts     ← 40 Fundamentals missions
      missions-foundations-screens.ts ← 40 × 8 CCD screen sets
      missions-dj.ts              ← 40 DJ World missions ✦ NOW WITH SCREENS
      missions-dj-screens.ts      ← 40 × 8 DJ CCD screen sets ✦ NEW
      missions.ts                 ← 73 Producer missions ✦ NOW WITH SCREENS
      missions-producer-screens.ts← 91 × 8 Producer CCD screen sets ✦ NEW
      lesson-deep.ts              ← Deep content (beginner/advanced/quizHard)
      types.ts                    ← All TypeScript types
    lib/
      mode.ts                     ← LearnModeContext (zero hydration flicker) ✦ REBUILT
      progress.ts                 ← XP, streak, hearts, gems, spaced repetition
      audio.ts                    ← Web Audio API engine
```

---

## Learning Modes

Two axes, both always-changeable:

### Axis 1: Flow Mode vs Free Mode

| | 🌊 Flow Mode | 🔓 Free Mode |
|---|---|---|
| Access | Sequential — unlock one at a time | All 153 lessons open immediately |
| Hearts | 5 hearts; wrong answer costs ♥ | No hearts |
| Format | Duolingo: hook → concept → sim → quiz → summary | Scrolling: explainer → sim → quiz |
| Difficulty | Fixed (standard) | Normal or Hard (your choice per lesson) |

Toggle lives in the Header (desktop right strip) and mobile drawer. Persists in localStorage with zero hydration flicker (React Context + inline `<head>` script).

### Axis 2: Normal vs Hard (Classic only)

| | Normal | Hard 🔥 |
|---|---|---|
| Hints | Shown | Hidden |
| Questions | Standard `quiz` array | `quizHard` if available, else hints stripped |
| Pass threshold | 50% | 70% |
| Content | `beginner.what` paragraphs | `advanced.what` + `edgeCases` + `engineerNotes` |

---

## Concept Screen Visuals (`LessonVisuals.tsx`)

19 animated SVG/HTML visual types for CCD concept screens — **now assigned to every concept screen across all 153 missions** ✦ UPDATED:

`waveform` · `waveform-compare` · `frequency-bar` · `piano` · `piano-octave` · `eq-curve` · `amplitude-dial` · `bpm-grid` · `signal-chain` · `stereo-field` · `note-lengths` · `scale-steps` · `chord-stack` · `rhythm-dots` · `vinyl-platter` · `mixer-channel` · `camelot-wheel` · `waveform-zoom` · `headroom-meter`

Plus `diagram` screen kind — custom SVG node-and-arrow diagrams with labelled nodes.

**Data-driven props** ✦ NEW — visuals now accept content-specific configuration:
- `BpmGrid` — accepts `bpm` + `label` props (shows actual lesson tempo, not hardcoded 120)
- `ScaleSteps` — accepts `root` + `minor` + `label` props (builds any scale from any root, not always C major)
- `InlineVisual` — passes all config props through via optional `visualProps` on concept screens

---

## Routes

| Route | Description |
|---|---|
| `/` | Home — onboarding (new users) or dashboard redirect (returning) |
| `/dashboard` | **Unified progress hub** ✦ NEW |
| `/learn/[slug]` | Mode-aware lesson — CCD or Classic at one URL |
| `/mission/[slug]` | → 301 redirect to `/learn/[slug]` ✦ NEW |
| `/world/[slug]` | Duolingo winding path map |
| `/worlds` | Three worlds overview |
| `/missions` | Browse + search all 153 missions |
| `/train` | Ear training |
| `/challenge` | Daily challenge |
| `/review` | Spaced-repetition review session |
| `/match` | Flashcard match game |
| `/leaderboard` | Weekly XP leaderboard |
| `/shop` | Gem shop (heart refills, streak shields) |
| `/placement` | Placement test (skip-ahead) |
| `/playground` | Device chain workbench |
| `/signal-flow` | Animated signal routing |
| `/devices` + `/device/[slug]` | Ableton device explorer |
| `/glossary` | Music production glossary |
| `/shortcuts` | Keyboard shortcut trainer |
| `/profile` | XP, rank, trophies, badges |
| `/login` | Auth (next-auth) |
| `/upgrade` | Stripe PRO upgrade |
| `/api/beat-coach` | AI coach (Kimi API) |
| `/api/progress/sync` | Cloud sync (GET/POST) |

---

## Gamification

| Feature | How it works |
|---|---|
| **XP** | Earned on first completion of each mission |
| **Hearts** | 5 hearts in Flow Mode; wrong answer costs ♥; refill 1/4h or spend 20 💎 |
| **Streak** | Daily XP goal (50 XP); streak shield earned every 7 days |
| **Gems** | Earned on completion; spend in gem shop |
| **Rank** | 10+ ranks from Novice → CCD Master based on total XP |
| **Badges** | Per-mission and per-chapter completion badges |
| **Trophies** | Path → Chapter → World → CCD Master |
| **Spaced repetition** | Lesson strength decays 10%/day; review queue surfaces weakest lessons |
| **Leaderboard** | Weekly XP ranking with league tiers |
| **Beat Coach** | Floating 🎧 button on every lesson — multi-turn Kimi AI chat |

---

## Dashboard (`/dashboard`)

The unified progress hub has 8 sections:

1. **Hero Next Step** — Smart continue card. Finds the true next lesson by sorting completed missions by `.at` timestamp. Shows breadcrumb, XP reward, mode indicator, ▶ play button.
2. **Today's Stats** — 5 stat cards: Streak · Daily XP · Hearts · Gems · Rank
3. **My Worlds** — 3 world cards with progress bars and per-chapter completion pills (Ch1 100%, Ch2 45%...)
4. **Skill Radar** — 5-axis SVG radar chart (Sound / Rhythm / Melody / Harmony / Tech) computed from Fundamentals chapter completion
5. **Recent Badges** — Last 3 earned + "View all →" to profile
6. **Review Queue** — Conditional; lessons with decayed strength shown as chips with colour-coded strength bars
7. **Beat Coach** — Entry card opening the CoachPanel inline with dashboard context
8. **Leaderboard Peek** — Top 3 weekly XP + current user rank, skeleton loading

---

## Beat Coach AI

A floating 🎧 button appears at the bottom-right of every lesson page. Clicking opens `CoachPanel` — a persistent multi-turn chat panel:

- Posts to `/api/beat-coach` with `{ context, question }`
- Receives `{ reply }` from the Kimi AI model
- Message history persists for the session
- Gracefully shows offline message if API key is missing
- Also accessible from the Dashboard Beat Coach card

**To activate:** set `KIMI_API_KEY` in `.env.local`. Get a key at [platform.moonshot.cn](https://platform.moonshot.cn).

---

## CCD Screens Status

All 153 missions have complete CCD (`screens[]`) data with visuals, varied exercise types, and contextual audio:

| World | Missions | Screens | Visuals | Exercise types |
|---|---|---|---|---|
| Fundamentals | 40 | ✅ Complete | ✅ All 80 concept screens | ✅ match · type-answer · sequence · audio-id · MCQ |
| DJ World | 40 | ✅ Complete | ✅ All 80 concept screens ✦ NEW | MCQ |
| Producer (6 chapters) | 73 | ✅ Complete | ✅ All 182 concept screens ✦ NEW | MCQ |
| **Total** | **153** | **✅ 100%** | **✅ 342 concept screens** | |

Each mission: 7–8 screens — `hook → concept → concept → interact → quiz × 3 → summary`

Exercise types used across the platform:
- `quiz` (MCQ) — all worlds
- `match` — tap pairs to connect terms to definitions (Fundamentals)
- `type-answer` — free-text with fuzzy matching (Fundamentals)
- `sequence` — arrange items in correct order (Fundamentals)
- `audio-id` — listen and identify from 4 options (Fundamentals)

---

## What Changed — June 2026 Overhaul (PR #18) ✦ LATEST

### Bug Fixes
- **Synth missions wired**: `SYNTHS_MISSIONS` was spread into `MISSIONS` without the screen-merge — all 22 synthesis missions showed "not converted to Duolingo format yet" even though 18 fully-authored screen sets existed in `missions-producer-screens.ts`. One-line fix in `missions.ts`. Synth chapter is now fully live.
- **Onboarding placement path fixed**: Users who selected "Some Experience" → placement test had `onboardingDone` never set and `learnMode` never written. `PlacementTest` now receives an `onComplete` prop; `OnboardingFlow.handlePlacementComplete` calls `setOnboarding + setLearnMode` before routing.
- **12 `sim:"none"` interact screens fixed**: DJ world had 9 and Producer had 3 interact screens whose prompts promised hands-on interaction ("Adjust buffer size — observe the trade-off") but rendered a blank placeholder. Each is now wired to a real sim: `buffer-sim`, `arrangement`, `device-chain`, `mixer`, `beatmatch-trainer`, `song-structure`, `waveform-visualizer`, etc.
- **Quiz analytics fixed**: `QuizScreen` was logging `missionSlug: "unknown"` for every quiz answer. Now receives and logs the actual mission slug.

### Duolingo-style Exercise Variety (Fundamentals)
All 40 Fundamentals missions now use the full range of built-but-unused exercise types:
- `match` — tap pairs (e.g. waveform shape → harmonic content, interval → semitone count, genre → BPM range)
- `type-answer` — free text with fuzzy matching (e.g. "What does MIDI stand for?", "Target peak level?", "RT60 abbreviation?")
- `sequence` — drag/tap to order items correctly (e.g. signal chain stages, note values longest→shortest, scale steps W/H pattern)
- `audio-id` — hear a synthesised example, identify it from 4 options (e.g. "Which waveform?", "Major or minor chord?", "Is this resolved?")

### Visuals — All Three Worlds
Every concept screen across all 153 missions now has a contextual visual (previously ~85% were plain text):
- **Fundamentals** (40 missions, 80 concept screens): all 19 visual types used, chosen by topic — `waveform-compare` for timbre, `frequency-bar` for spectrum, `amplitude-dial` for dynamics, `piano` for melody/MIDI, `scale-steps` for scales, `chord-stack` for harmony, `bpm-grid` for rhythm, `stereo-field` for mixing, etc.
- **DJ World** (40 missions, 80 concept screens): `vinyl-platter` for culture/history, `mixer-channel` for EQ/faders, `camelot-wheel` for harmonic mixing, `waveform-zoom` for waveform reading, `bpm-grid` for beatmatching/tempo
- **Producer** (73 missions, 182 concept screens): `waveform-compare` for oscillators/synthesis, `eq-curve` for filters/EQ, `amplitude-dial` for compressor/ADSR, `piano` for MIDI/scales, `headroom-meter` for levels/export

### Data-Driven Visuals
- `BpmGrid` now accepts `bpm` + `label` props — shows the lesson's actual tempo instead of always "120 BPM"
- `ScaleSteps` now accepts `root` + `minor` + `label` props — builds the correct scale from any root note instead of always C major
- `types.ts`: concept screen type extended with optional `visualProps: { bpm?, minor?, root?, scaleLabel?, signalNodes? }`

### Contextual Audio
14 new specific audio demos added to `ConceptAudio.tsx` — "Tap to hear an example" now plays something genuinely relevant:
- `playMinorScale` — A natural minor ascending
- `playPentatonicScale` — C major pentatonic
- `playMajorMinorCompare` — C major → C minor chord (one semitone difference)
- `playDominantResolution` — G7 → C major (V7→I cadence, strongest resolution)
- `playIVVI` — Full I–IV–V–I progression in C major
- `playEqBright` / `playFilterSweep` — sawtooth with LP filter sweeping open/closed
- `playADSRDemo` — slow pad vs fast pluck (ADSR comparison back-to-back)
- `playLFOVibrato` — sine wave with LFO pitch modulation
- `playDelayDemo` — note with four decaying echo repeats
- `playStereoWide` — notes panning across the stereo field
- `playFullDrumLoop` — kick + snare + hi-hat at 128 BPM
- `playHarmonicMix` — two Camelot-adjacent chords (C major → G major, 8B → 9B)
- `playSwingGroove` — straight 8ths vs swung 8ths played back-to-back

---

## What Changed — May 2026 Overhaul (PR #8)

### Phase 1 — Foundation Fixes
- `LearnModeContext` (React Context): replaces scattered `useEffect` localStorage reads. Zero hydration flicker. Inline `<head>` script sets theme + mode before React renders.
- 2-axis difficulty: CCD/Classic + Normal/Hard only. Dead `ModeToggle.tsx` (Beginner/Intermediate/Advanced) deleted.
- `/mission/[slug]` → 301 redirect to `/learn/[slug]`. One canonical URL per lesson.
- `InlineClassicLesson` Hard Mode: full `advanced` content, `quizHard`, mechanism, flow, walkthrough, proMoves, mistakes, related links.
- Dashboard "continue" card: fixed to sort by `.at` timestamp.
- Onboarding Step 0: "How much experience do you have?" — routes beginners direct, "Some Experience" to PlacementTest inline, "Experienced" to world pick with all chapters unlocked.

### Phase 2 — Header Overhaul
- **3 primary nav items** (was 4+9+marquee noise).
- **5-element right strip**: Search · Hearts · XpStreak badge (with rank/XP/streak/gems popover) · Mode pill · Profile avatar.
- `More ▾` dropdown: three clean sections — Practice / Reference / Account.
- `ThemeSwitcher` moved to More → Account.
- Marquee ticker → single 1px separator line.
- Mobile drawer: compact stats row, sectioned nav, mode toggle.

### Phase 3 — Unified Dashboard
- New `/dashboard` route.
- `DashboardClient.tsx`: 8-section progress hub (see Dashboard section above).

### Phase 4 — Lesson Flow Polish
- `LessonPlayer`: `sessionStorage` mid-lesson persistence (screen index + score survive refresh). Mode indicator bar. No-screens returns `null` cleanly.
- `HeartsWall`: 💎 Spend 20 gems button wired to `spendGems` + `refillHeart`. Proper `Xh MM:SS` countdown.
- `LessonPageClient`: `CcdFallbackBanner` redesign — informative, not broken-looking.

### Phase 6 — All CCD Screens
- `missions-dj-screens.ts`: 40 DJ missions × 8 screens. Visuals: `vinyl-platter`, `camelot-wheel`, `waveform-zoom`, `mixer-channel`, `bpm-grid`. Sims: `beatmatch-trainer`, `harmonic-mix-wheel`, `loop-roll`, `hot-cue-drill`.
- `missions-producer-screens.ts`: 91 Producer missions × 8 screens across all 6 chapters including the full Synthesis chapter.

### Phase 7 — AI Coach Rebuilt
- `FloatingCoachButton`: always-visible 🎧 on every lesson.
- `CoachPanel`: multi-turn chat (scrollable, Enter key, auto-scroll to latest).
- Wired to Dashboard Beat Coach card.
- Legacy `BeatCoach` + `useBeatCoach` kept for backward compat.

---

## Next Steps

### 🔥 P0 — Ship Before Any Marketing

1. **Set `KIMI_API_KEY` in production env** — Beat Coach is wired and ready; just needs the key. Get at [platform.moonshot.cn](https://platform.moonshot.cn). Strongly differentiated feature.

2. **Add `lesson-deep.ts` content for DJ + Producer** — `lesson-deep-foundations.ts` and `lesson-deep-dj.ts` exist with partial content. The `advanced.what`, `proMoves`, `walkthrough`, `mistakes` fields power Hard Mode in Classic lessons AND the "Deep Dive" section. Complete the DJ World entries first (the DJ lessons are already widely used).

3. **`WorldPathClient` gating in CCD mode** — World page and Missions page currently show all missions as clickable even in CCD mode. Only `PathPageClient` enforces sequential gating. Users can bypass CCD gating by going to `/worlds` or `/missions`. Add CCD lock icons and disabled states to `WorldPageClient` and `MissionsPageClient`.

4. **Test cloud sync end-to-end** — `CloudSyncEffect` in `ClientProviders.tsx` syncs to `/api/progress/sync` (PostgreSQL). Verify the GET (initial load) and POST (on change) work correctly with a real `DATABASE_URL`. The merge strategy (`mergeProgress`) is solid — just needs a live DB to test against.

### ⚡ P1 — High Impact UX

5. **`/dashboard` as the default home for returning users** — Currently `/` shows Landing or Dashboard based on `hasMissions`. Change so any user with `onboardingDone === true` is immediately redirected to `/dashboard`. Landing page stays at `/welcome` or `/about`.

6. **Lesson completion → Dashboard redirect** — After completing a lesson, `handleComplete` in `LessonPageClient` currently redirects to `/world/[slug]` after 2.2s. Change to `/dashboard` so users see their updated stats, badge, and next lesson immediately.

7. ~~**Audio examples in concept screens**~~ ✅ Done in PR #18 — 14 contextual demos added; every concept screen with a visual plays a relevant audio example.

8. **PlacementTest result → chapter unlock** — `setPlacement(chapter)` writes `unlockedChapter` to progress, but `WorldPathClient` and `WorldPageClient` don't yet read `unlockedChapter` to skip locked chapters. Wire the output to actually unlock the recommended starting chapter.

9. **Exercise variety for DJ + Producer worlds** — PR #18 added `match`, `type-answer`, `sequence`, `audio-id` to Fundamentals only. Apply the same treatment to DJ and Producer missions: convert some MCQs to richer exercise types for variety. The engine already supports them fully — it's a content authoring pass.

### 🌟 P2 — "Best on the Web" Features

10. **Offline PWA** — `public/manifest.json` exists. Add a service worker (`next-pwa` or custom) to cache lesson pages and simulator bundles. Producers should learn on a plane.

11. **Web MIDI input** — Wire `navigator.requestMIDIAccess()` to `PianoRollSim`, `BeatBuilderSim`, `DrumPadSim`, and `ChordStackerSim`. Let users plug in a MIDI controller. Massive differentiator for a production-education tool.

12. **Share cards after trophies** — `ShareCard.tsx` exists. Surface it after path/chapter/world trophy completion with a branded "I just completed DJ World on CCD.SCHOOL" card. Add social share buttons.

13. **Source citations on lesson pages** — Every mission has `source` fields in `paths.ts` (e.g. `"rekordbox 6.0.0 Instruction Manual — p.77"`). Display them at the bottom of concept screens and Classic lesson pages.

14. **Public profile at `/u/[username]`** — `PublicProfileClient.tsx` exists. Wire a "Share my profile" button on `/profile` that generates a unique public URL showing XP, rank, completed worlds, and badges.

15. **Kimi AI context enrichment** — The `/api/beat-coach` route receives a `context` string. Enrich it per-lesson with: world slug, chapter name, lesson title, current mode (CCD/Classic), and hard mode status. Responses will be more targeted.

---

## Content Sources

| World | Primary Source |
|---|---|
| Fundamentals | [learningmusic.ableton.com](https://learningmusic.ableton.com) |
| DJ World | Pioneer DJ rekordbox 6.0.0 Instruction Manual |
| Producer (instruments/effects/workflow) | Ableton Live 12 Reference Manual |
| Producer (Synthesis chapter) | [learningsynths.ableton.com](https://learningsynths.ableton.com) |

---

## License

MIT — see [LICENSE](./LICENSE).

---

*Built for producers and DJs who learn by doing.*
