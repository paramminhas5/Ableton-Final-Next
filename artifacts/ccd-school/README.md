# CCD.SCHOOL — Duolingo for Music Production & DJing

> **153 missions · 3 worlds · Fundamentals / DJ / Producer**  
> Built with Next.js 15 · React 19 · TailwindCSS v4 · NextAuth v5 · PostgreSQL · Stripe

---

## What Is This?

CCD.SCHOOL is a gamified music education platform modelled on Duolingo. It teaches:

- **Fundamentals** — Sound, rhythm, melody, harmony, music technology (sourced from learningmusic.ableton.com)
- **DJ World** — rekordbox, beatmatching, crowd reading, career (sourced from Pioneer DJ rekordbox 6.0.0 Manual)
- **Producer** — Ableton Live 12 from zero to expert (sourced from the Ableton Live 12 Reference Manual)

Two learning modes:
- **CCD Mode** (Path Mode) — Duolingo-style sequential screens with hearts, XP gating
- **Classic Mode** (Explorer) — all missions open, scrolling explainer + sim + quiz

---

## Quick Start

```bash
cd artifacts/ccd-school
npm install
cp .env.example .env.local   # fill in secrets
npm run dev
```

**Required env vars** (see `.env.example`):
| Variable | Purpose |
|---|---|
| `NEXTAUTH_SECRET` | NextAuth session signing |
| `NEXTAUTH_URL` | App URL for OAuth redirects |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth |
| `DATABASE_URL` | PostgreSQL connection string |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Payments |
| `KIMI_API_KEY` | Beat Coach AI tutor |

---

## Architecture

```
app/                        # Next.js App Router pages
├── page.tsx                # / → HomeClient (smart router: landing / onboarding / dashboard)
├── learn/[slug]/           # Lesson page (CCD or Classic mode)
├── world/[slug]/           # World path map (Duolingo snake)
├── dashboard/              # Progress hub
├── api/                    # Server routes (auth, progress sync, leaderboard, stripe, AI)
└── ...

src/
├── components/             # All UI components
│   ├── LessonPlayer.tsx    # CCD mode Duolingo-style screen engine
│   ├── InlineClassicLesson.tsx  # Classic scrolling lesson
│   ├── Quiz.tsx            # Multi-question quiz with feedback
│   ├── WorldPathClient.tsx # Duolingo path snake
│   ├── DashboardClient.tsx # Progress dashboard
│   ├── OnboardingFlow.tsx  # 4-step new user setup
│   ├── Header.tsx          # Sticky navigation
│   └── sims/               # 47 interactive simulators
├── content/                # All learning content (TypeScript)
│   ├── missions.ts         # 73 Producer missions
│   ├── missions-foundations.ts  # 40 Fundamentals missions
│   ├── missions-dj.ts      # 40 DJ World missions
│   ├── missions-*-screens.ts    # Duolingo screens for CCD mode
│   ├── chapters.ts         # 15 chapters (5 per world)
│   ├── paths.ts            # 32 paths
│   └── lesson-deep.ts      # Deep content (analogies, walkthroughs, pro moves)
└── lib/
    ├── progress.tsx        # React Context + useProgress hook (localStorage + cloud sync)
    ├── mode.tsx            # useLearnMode hook (ccd | classic)
    ├── missionContext.ts   # Resolves mission → path → chapter → world
    ├── ranks.ts            # XP rank system
    └── audio.ts            # Sound effects
```

---

## Content Hierarchy

```
World (3)
  └── Chapter (5 per world = 15 total)
        └── Path (2–3 per chapter = 32 total)
              └── Mission (3–6 per path = 153 total)
                    ├── CCD screens: hook → concept → interact → quiz → summary
                    └── Classic: explainer blocks + simulator + quiz
```

---

## Current Status (as of latest PR)

### ✅ Completed
- Full navigation fix (Learn → `/learn`, Progress → `/dashboard`)
- Smart home routing (Landing → Onboarding → Dashboard)
- LessonPlayer breadcrumb (World › Chapter › Path › Mission N/M)
- Hearts explainer modal + quiz feedback (−1 heart, Q N of M)
- Quiz wrong-answer coloring (picked option shown in red, correct in green)
- Next Mission link fixed (`/mission/` → `/learn/`)
- InlineClassicLesson back button world slug fixed (Producer missions)
- Dashboard skill radar is world-aware (shows active world's chapters)
- World Path nodes redesigned (readable on mobile, emoji + title below)
- OnboardingFlow step counter consistent across all steps
- Streak-at-risk warning banner (shown at 0h left before midnight)
- Dead `CompletionModal` wired in and used in `InlineClassicLesson`
- `useProgress` migrated to React Context (eliminates localStorage race conditions)
- LessonPlayer wrapped in error boundary (catches bad content data)
- All 4 missing legacy SimTypes wired: `tempo-compare`, `buffer-sim`, `knob-trainer`, `synth-playground`
- Stripe API version fixed (`2026-04-22.dahlia` → `2026-05-27.dahlia`)

---

## What To Do Next (Priority Order)

### 🔴 Content (biggest impact on product quality)
1. **Write CCD screens for remaining ~43 missions** — Missions without `screens[]` fall back to Classic format in CCD mode. Each mission needs ~7 screens: `hook → concept → concept → interact → quiz → quiz → summary`. Files to edit: `missions-foundations-screens.ts`, `missions-dj-screens.ts`, `missions-producer-screens.ts`.

### 🟠 Features
2. **AI-generated lesson summaries** — After completing a lesson, show a personalised "what you learned" card generated by Beat Coach based on the mission content. Pipe `lesson-deep.ts` context to the Kimi API.

3. **Adaptive difficulty** — Track per-question wrong-answer rate and surface a "you're struggling with X" card on the dashboard. Use `lessonStrengths` + quiz result history.

4. **Path completion celebrations** — When a user finishes the last mission in a path, show a full-screen trophy animation (the `CompletionModal` infrastructure is now wired). Currently only the quiz done-screen fires.

5. **Offline support** — Add a service worker to cache lesson content so users can complete lessons without WiFi. Use `next-pwa` or a custom service worker.

6. **Push notifications** — Daily streak reminder via Web Push API. Store subscription in the DB alongside user progress.

### 🟡 Polish
7. **Audio for simulators** — Most sims are visual only. Add Web Audio API sounds to `DrumPadSim`, `BeatBuilderSim`, `PianoRollSim` etc. for genuine interactivity.

8. **Smooth screen transitions in LessonPlayer** — Currently screens swap instantly. Add a slide-in animation between screens for a polished feel.

9. **Mobile keyboard dismissal** — On mobile, the quiz option buttons sit above the keyboard when it's open. Add `inputMode="none"` where needed and ensure no layout jumps.

10. **Keyboard shortcuts** — `Space` to advance in LessonPlayer (hook/concept screens), `1–4` to pick quiz options.

### 🟢 Infrastructure
11. **E2E tests** — Add Playwright tests for the critical flows: onboarding → first lesson → quiz → completion. Protect the build from regressions.

12. **DB migration system** — `scripts/run-migrations.ts` exists but isn't hooked into CI. Add `npm run db:migrate` to the deploy script.

13. **Analytics** — Instrument key events (lesson_start, lesson_complete, quiz_wrong, hearts_depleted) with a privacy-safe analytics provider (Plausible or PostHog).

---

## Deployment

Deploy to Vercel:

```bash
# From the repo root
vercel --cwd artifacts/ccd-school
```

Or push to `main` — Vercel auto-deploys on merge if connected.

**Database**: Run migrations before first deploy:
```bash
cd artifacts/ccd-school
npx ts-node scripts/run-migrations.ts
```

---

## Content Contribution Guide

All lesson content lives in `src/content/`. To add CCD screens for a mission:

1. Find the mission slug in `missions-foundations.ts` / `missions-dj.ts` / `missions.ts`
2. Open the corresponding `missions-*-screens.ts` file
3. Add an entry:

```ts
"your-mission-slug": [
  {
    kind: "hook",
    emoji: "🎵",
    headline: "Short punchy headline (≤8 words)",
    subtext: "One-sentence hook (≤15 words).",
  },
  {
    kind: "concept",
    title: "Key Term",
    body: "Two sentences max. What it is and why it matters.",
    keyFact: "One memorable fact.",
  },
  {
    kind: "interact",
    prompt: "Try X — do Y with the controls below.",
    sim: "drum-pad",  // SimType from content/types.ts
  },
  {
    kind: "quiz",
    q: "Question text?",
    options: ["A", "B", "C", "D"],
    answer: 0,         // index of correct option
    explain: "Why A is correct.",
  },
  {
    kind: "summary",
    learned: [
      "First thing you learned.",
      "Second thing.",
      "Third thing.",
    ],
  },
],
```

Available SimTypes are listed in `src/components/sims/Simulator.tsx` → `SIM_LIST`.
