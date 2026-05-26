# CCD.SCHOOL

> The most structured music education on the internet — 153 missions across Fundamentals, DJ World and Producer. Every concept sourced from real manuals and taught two ways: a Duolingo-style interactive path, and a scrolling classic lesson.

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
| **Producer** | Ableton Live 12 Reference Manual | 73 missions — first contact, sound & MIDI, the mix, performance, advanced |

Every mission has:
- A **Duolingo-style lesson** (Path Mode): hook → concept screens with visuals → interactive sim → quiz → summary
- A **Classic lesson** (Explorer Mode): scrolling explainer + sim + Normal/Hard quiz

---

## Tech Stack

```
Framework       Next.js 15.3 (App Router, React 19)
Styling         Tailwind CSS v4 (CSS-first, no config file)
State           TanStack Query v5 + localStorage + PostgreSQL (pg)
Auth            next-auth v5 beta (magic link + OAuth)
Payments        Stripe
Audio           Web Audio API — no asset files
Hosting         Vercel (target)
Package mgr     npm
```

---

## Project Structure

```
artifacts/ccd-school/          ← Live Next.js app
  app/                         ← 28 App Router routes
    page.tsx                   ← Home (onboarding / dashboard)
    learn/[slug]/              ← Lesson engine (mode-aware)
    mission/[slug]/            ← Classic full-page lesson
    world/[slug]/              ← Duolingo path map
    worlds/                    ← World chooser
    missions/                  ← All missions browse/search
    ...20+ more routes
  src/
    components/                ← UI components
      LessonPlayer.tsx          ← Duolingo screen engine (hook/concept/interact/quiz/summary)
      LessonVisuals.tsx         ← 19 animated inline visual types (waveform, piano, camelot, etc.)
      InlineClassicLesson.tsx   ← Explorer mode inline lesson
      LessonPageClient.tsx      ← Mode-aware router
      WorldPathClient.tsx       ← Duolingo winding path map
      Header.tsx                ← Mode toggle pill + gamification strip
      OnboardingFlow.tsx        ← 3-step new user welcome
      MissionPageClient.tsx     ← Classic /mission/[slug] page (Normal/Hard)
      sims/                     ← 47 interactive simulators
    content/
      missions-foundations.ts  ← 40 Fundamentals missions (all with screens[])
      missions-foundations-screens.ts  ← 40×8 Duolingo screen sets
      missions-dj.ts            ← 40 DJ World missions (screens pending)
      missions.ts               ← 73 Producer missions (screens pending)
      lesson-deep.ts            ← Deep lesson overlays (beginner/advanced/quizHard)
      types.ts                  ← All TypeScript types
    lib/
      mode.ts                   ← learnMode: "ccd" | "classic"
      progress.ts               ← XP, streak, hearts, gems, spaced repetition
      audio.ts                  ← Web Audio API engine
.migration-backup/             ← Previous Vite/React SPA (reference only)
```

---

## Learning Modes

Two completely different experiences, one toggle (always visible in Header):

### 🔒 Path Mode (`learnMode === "ccd"`)
- Lessons unlock **sequentially** — complete one to unlock the next
- **Hearts** active — wrong quiz answer costs ♥
- Routes to `LessonPlayer` (Duolingo screens):
  - **hook** → full-bleed emoji + headline, tap to continue
  - **concept** → title + 2-sentence body + **inline visual diagram** + KEY FACT
  - **interact** → full simulator
  - **quiz** → 4-option multiple choice, shake on wrong, explain on reveal
  - **summary** → confetti + XP + "You Learned" bullets + Next Lesson
- For missions without `screens[]` yet, falls back to inline classic with a banner

### 🗺 Explorer Mode (`learnMode === "classic"`)
- All 153 lessons open from the start — **no gates**
- No hearts
- Routes to `InlineClassicLesson` at the same `/learn/[slug]` URL
- Scrolling page: explainer blocks → sim → **Normal / Hard** quiz toggle
  - **Hard**: uses `quizHard` questions if available, otherwise strips hints, pass threshold 70%

---

## Concept Screen Visuals (`LessonVisuals.tsx`)

19 animated SVG/HTML visual types available for concept screens:

| Type | Description |
|---|---|
| `waveform` | Animated sine wave (requestAnimationFrame) |
| `waveform-compare` | Sine vs Square vs Saw, colour-coded |
| `frequency-bar` | Spectrum with Sub/Bass/Mid/Hi-Mid/Air zones |
| `piano` | 2-octave labelled piano keyboard |
| `piano-octave` | Single octave with Hz values per key |
| `eq-curve` | EQ frequency curve with zone labels |
| `amplitude-dial` | dB levels from silence → clip |
| `bpm-grid` | 1 bar beat grid with subdivisions |
| `signal-chain` | Arrow-connected chain blocks |
| `stereo-field` | Top-view pan map with instrument positions |
| `note-lengths` | Whole → half → quarter → 8th → 16th bar chart |
| `scale-steps` | W-W-H step diagram (major or minor) |
| `chord-stack` | Stacked intervals for Major, Minor, Dom7 |
| `rhythm-dots` | 16-step beat grid pattern |
| `vinyl-platter` | Spinning turntable (requestAnimationFrame) |
| `mixer-channel` | Two-deck EQ + fader mixer |
| `camelot-wheel` | 12-key harmonic mixing wheel |
| `waveform-zoom` | Waveform with beatgrid overlay + loop region |
| `headroom-meter` | Vertical dB headroom meter |

Plus `diagram` screen kind — fully custom SVG diagrams with labelled nodes and arrows.

---

## Gamification

| Feature | Description |
|---|---|
| XP | Earned on first completion of each mission |
| Hearts | 5 hearts, lose 1 per wrong answer in Path Mode, refill over time |
| Streak | Daily XP goal, streak shield at milestones |
| Gems | Earned via daily challenges, spendable in the gem shop |
| Rank | 10+ ranks from Novice to CCD Master based on total XP |
| Trophies | Path → Chapter → World → CCD Master (completion trophies) |
| Spaced repetition | Lessons that need review surface in a review queue |
| Leaderboard | Weekly XP ranking |
| Beat Coach AI | Context-aware AI at `/api/beat-coach` |

---

## Routes

| Route | Description |
|---|---|
| `/` | Home — onboarding for new users, dashboard for returning |
| `/learn/[slug]` | **Mode-aware lesson** — Path Mode = Duolingo, Explorer = classic |
| `/mission/[slug]` | Full classic lesson page (deep content) |
| `/world/[slug]` | Duolingo winding path map for a world |
| `/worlds` | World chooser |
| `/missions` | Browse/search all 153 missions |
| `/train` | Ear training drill runner |
| `/challenge` | Daily challenge |
| `/leaderboard` | Weekly XP leaderboard |
| `/shop` | Gem shop |
| `/placement` | Placement test (skip-ahead) |
| `/playground` | Device chain workbench |
| `/signal-flow` | Animated signal routing diagram |
| `/devices` + `/device/[slug]` | Ableton device explorer |
| `/glossary` | Music production glossary |
| `/shortcuts` | Keyboard shortcut trainer |
| `/profile` | XP, rank, trophies, badges |
| `/login` | Auth (next-auth) |
| `/upgrade` | Stripe PRO upgrade |

---

## Local Development

### Prerequisites
- Node 20+
- PostgreSQL database (or Supabase free tier)

### Setup

```bash
git clone https://github.com/paramminhas5/Ableton-Final-Next.git
cd Ableton-Final-Next/artifacts/ccd-school
npm install
```

Copy environment variables:

```bash
cp .env.example .env.local
```

Required variables:

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Start the dev server:

```bash
npm run dev
# → http://localhost:3000
```

---

## Content Structure

### Adding screens to a mission (Path Mode)

Missions need a `screens[]` array to use the Duolingo lesson engine. Follow the pattern in `missions-foundations-screens.ts`:

```typescript
export const SCREENS_YOUR_MISSION: LessonScreen[] = [
  { kind: "hook", emoji: "🎵", headline: "Your hook headline", subtext: "One sentence." },
  {
    kind: "concept",
    title: "Concept title",
    body: "2 sentences max. Plain language.",
    keyFact: "Bold 1-liner fact.",
    visual: "waveform",  // one of the 19 visual types
  },
  { kind: "interact", sim: "ear-training", prompt: "Try it" },
  { kind: "quiz", q: "Question?", options: ["A", "B", "C", "D"], answer: 1, explain: "Why B is correct." },
  { kind: "summary", learned: ["Fact 1", "Fact 2", "Fact 3"] },
];
```

Then merge into the mission with `withScreens()`.

### Adding a Hard mode quiz

Add `quizHard: QuizQ[]` to the mission's `LessonDeep` entry in `lesson-deep.ts`:

```typescript
LESSONS["your-mission-slug"] = {
  quizHard: [
    { q: "Harder question?", options: [...], answer: 2, explain: "..." }
    // no hint field — hard mode strips hints
  ]
}
```

---

## What Was Built (May 2026)

### 🔒/🗺 Mode Toggle System
A permanent mode toggle pill was added to the Header (desktop + mobile drawer) and the World Path map. One click switches between **Path Mode** (Duolingo-style, hearts, sequential) and **Explorer Mode** (all open, Normal/Hard quiz).

### Mode-Aware Lesson Routing (`LessonPageClient.tsx`)
`/learn/[slug]` is now fully bifurcated by mode:
- **Path Mode** → `LessonPlayer` (Duolingo screens). If screens not built yet for a mission, shows inline classic with a "screens coming soon" banner.
- **Explorer Mode** → `InlineClassicLesson` (scrolling explainer + sim + quiz), no redirect.

### `LessonVisuals.tsx` — 19 Rich Concept Screen Visuals
A new component library providing self-contained animated SVG/HTML visuals for concept screens, replacing the 4 static placeholder SVGs. Includes an animated spinning vinyl platter, the full Camelot harmonic mixing wheel, a labelled piano with Hz values, animated waveforms, spectrum bar charts, and more.

### `LessonPlayer.tsx` — Diagram Screen Kind
A new `diagram` screen kind renders fully custom SVG node-and-arrow diagrams with captions, wired into the lesson engine switch.

### `MissionPageClient.tsx` — Normal / Hard Mode
Renamed Standard/Advanced to **Normal/Hard**. Hard mode:
- Uses `quizHard` questions from `lesson-deep.ts` if available
- Falls back to normal questions with all hints stripped
- Pass threshold raised from 50% to 70%
- Shows a pulsing `🔥 HARD MODE` badge in the mission header

### `WorldPathClient.tsx` — Mode Banner
A live mode banner appears below the world header on every path map, showing the current mode with description and a one-click "Switch →" button.

### `OnboardingFlow.tsx` — Naming Consistency
Step 2 of onboarding updated: "Path Mode" and "Explorer Mode" now match the Header toggle exactly. Explorer Mode description updated to mention the Normal/Hard quiz feature.

---

## Next Steps

### 🔥 Highest Priority

1. **Build `missions-dj-screens.ts`** — 40 DJ World missions each need a `screens[]` array (hook→concept→interact→quiz→summary). This unlocks the full Duolingo engine for the DJ World. Pattern to follow: `missions-foundations-screens.ts`. Every mission already has `explainer` + `quiz` data to convert from. Estimated: 40 × 8 screens = 320 screen objects.

2. **Build `missions-producer-screens.ts`** — Same for the 73 Producer missions. These have even richer `explainer` data in `missions.ts`. 73 × 8 = ~584 screen objects.

3. **Wire `missions-synths.ts`** — The Synthesis chapter (`missions-synths.ts`) exists but unclear if it's fully integrated into the Producer world paths. Audit and connect.

### ⚡ High Impact UX

4. **Surface Deep Lesson content** — `lesson-deep-dj.ts`, `lesson-deep-foundations.ts`, etc. contain exceptional pro-level content (`beginner.what`, `advanced.edgeCases`, `proMoves`, `walkthrough`, `listenFor`, `mistakes`) that is available in Classic lessons but not surfaced in the Duolingo path. Add a "Deep Dive" expandable section on the summary screen of LessonPlayer.

5. **Add audio examples to concept screens** — The `audio.ts` engine, `AudioUnlock.tsx`, and `MasterTransportBar` are all wired. Short audio clips (synthesised via Web Audio, no files) on concept screens — e.g. a sine tone on the waveforms lesson, a beatmatching example clip in the DJ world.

6. **Mobile swipe gestures in LessonPlayer** — Framer Motion is already in the stack. Add left-swipe to advance screens and right-swipe to go back on concept/hook screens.

### 🎯 Quality & Completeness

7. **Spaced repetition review flow audit** — The review system tracks `lessonStrengths` and `/review` page exists. Confirm the review queue at `/review` correctly routes to `/learn/[slug]?review=1` and that completing a review updates the strength score.

8. **Leaderboard data audit** — `/api/leaderboard` and `leagues.ts` exist. Confirm `LeagueBoard` component is pulling live data and rendering correctly.

9. **Beat Coach context-per-world** — `/api/beat-coach` already receives a `context` string. Enrich it with the world slug and chapter so the AI gives world-specific advice (DJ tips in DJ World, Ableton-specific tips in Producer).

10. **Source citations in lessons** — Every mission has source page references in the data. Surface them visibly at the bottom of each concept screen: *"Source: rekordbox 6.0.0 Manual — p.77"*.

### 🌟 "Best on the Web" Features

11. **Offline PWA** — The PWA manifest exists. Add a service worker for offline lesson caching — producers should be able to learn on a plane.

12. **Public profile pages** — `/u/[username]` page exists via `PublicProfileClient`. Wire a share flow from the profile page so users can share their progress.

13. **Share card after milestones** — `ShareCard.tsx` exists. Add a "Share" prompt after path/chapter/world trophy completions. `HeartsWall.tsx` could be surfaced on a public page.

14. **Web MIDI input** — Let users plug in a MIDI controller to trigger the PianoRollSim, BeatBuilderSim, and DrumPadSim. Massive differentiator for a production-education tool.

---

## Content Sources

| World | Primary Source |
|---|---|
| Fundamentals | [learningmusic.ableton.com](https://learningmusic.ableton.com) |
| DJ World | Pioneer DJ rekordbox 6.0.0 Instruction Manual |
| Producer | Ableton Live 12 Reference Manual |

---

## License

MIT — see [LICENSE](./LICENSE).

---

*Built for producers and DJs who learn by doing.*
