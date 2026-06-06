# CCD.SCHOOL — Duolingo for Music Production & DJing

> **153 missions · 3 worlds · 47 interactive sims · FSRS spaced repetition · Web Audio engine**  
> Next.js 15 · React 19 · TypeScript · TailwindCSS v4 · PostgreSQL · NextAuth v5 · Stripe · PostHog

[![CI](https://github.com/paramminhas5/Ableton-Final-Next/actions/workflows/ci.yml/badge.svg)](https://github.com/paramminhas5/Ableton-Final-Next/actions/workflows/ci.yml)

---

## What This Is

CCD.SCHOOL is a gamified music-education platform. It teaches music production and DJing through structured, bite-sized lessons modelled on Duolingo and Brilliant — with one key differentiator: **audio is first-class**. Every concept screen has a synthesised audio demo. Every interactive element produces real sound via the Web Audio API. No audio asset files.

Three learning worlds, each sourced from official documentation:

| World | Source | Missions |
|---|---|---|
| **Fundamentals** | [learningmusic.ableton.com](https://learningmusic.ableton.com) | 40 — sound, rhythm, melody, harmony, music tech |
| **DJ World** | Pioneer DJ rekordbox 6.0.0 Manual | 40 — setup, library, mixing, performance, mastery |
| **Producer** | Ableton Live 12 Reference Manual + [learningsynths.ableton.com](https://learningsynths.ableton.com) | 73 — first contact, sound & MIDI, the mix, performance, advanced, synthesis |

---

## Quick Start

```bash
git clone https://github.com/paramminhas5/Ableton-Final-Next.git
cd Ableton-Final-Next/artifacts/ccd-school

npm install
cp .env.example .env.local   # fill in required vars (see below)
npm run dev                  # → http://localhost:3000
```

### Required Environment Variables

```env
# Auth
AUTH_SECRET=minimum-32-chars-random-string
NEXTAUTH_URL=http://localhost:3000

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/ccdschool

# Payments (Stripe)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI Coach (Kimi — get key at platform.moonshot.cn)
KIMI_API_KEY=sk-...
```

### Optional Environment Variables

```env
# Analytics (PostHog — app degrades gracefully without this)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Web Push notifications (generate with: npx web-push generate-vapid-keys)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BF...
VAPID_PUBLIC_KEY=BF...
VAPID_PRIVATE_KEY=...
VAPID_EMAIL=mailto:hello@ccd.school

# Cron authentication (for /api/push/send-streak-reminder)
CRON_SECRET=random-secret-string

# Admin gating
ADMIN_SECRET=your-admin-secret
```

### Database Setup

```bash
# Run migrations (adds all required tables)
psql $DATABASE_URL -f scripts/migrate-world-class.sql

# Or for a fresh install, run all migrations in order:
npx ts-node scripts/run-migrations.ts
```

### Available Scripts

```bash
npm run dev          # Development server (port 3000)
npm run build        # Production build
npm run start        # Production server
npm run typecheck    # TypeScript type check (no emit)
npm run test         # Run Vitest tests (single pass)
npm run test:watch   # Run Vitest in watch mode
npm run test:coverage # Run tests with coverage report

# Icon/splash generation (no deps — pure Node.js)
node scripts/generate-icons.mjs    # Regenerates all PNG app icons
node scripts/generate-splash.mjs   # Regenerates iOS splash screens
```

---

## Architecture

### Directory Layout

```
artifacts/ccd-school/
├── app/                              # Next.js App Router
│   ├── page.tsx                      # / → HomeClient (onboarding or dashboard)
│   ├── layout.tsx                    # Root layout: fonts, meta, PWA, SW registration
│   ├── globals.css                   # Tailwind v4 + custom CSS (14 themes, animations)
│   ├── dashboard/page.tsx            # /dashboard — unified progress hub
│   ├── learn/[slug]/page.tsx         # /learn/:slug — lesson page (CCD or Classic)
│   ├── world/[slug]/page.tsx         # /world/:slug — Duolingo path map
│   ├── worlds/page.tsx               # /worlds — world chooser
│   └── api/
│       ├── auth/[...nextauth]/       # NextAuth v5 endpoints
│       ├── progress/
│       │   ├── sync/route.ts         # GET/POST — legacy mirror sync (read-only)
│       │   └── events/route.ts       # POST — server-authoritative XP/streak/hearts ★
│       ├── push/
│       │   ├── subscribe/route.ts    # POST — store VAPID push subscription
│       │   └── send-streak-reminder/ # POST — cron-triggered streak notifications
│       ├── beat-coach/route.ts       # POST — Kimi AI coach
│       ├── leaderboard/route.ts      # GET — weekly XP leaderboard
│       ├── gating/route.ts           # GET — gating mode (paid/free/open)
│       ├── challenge/submit/route.ts # POST — daily challenge score
│       └── stripe/                   # checkout, portal, webhook
│
├── src/
│   ├── components/
│   │   ├── LessonPlayer.tsx          # CCD mode engine (hook→concept→interact→quiz→summary)
│   │   ├── ExerciseScreens.tsx       # 4 new exercise types (audio-id, match, type-answer, sequence) ★
│   │   ├── ConceptAudio.tsx          # Audio-first concept screen demos (19 visual types) ★
│   │   ├── InlineClassicLesson.tsx   # Classic/Explorer mode (Normal/Hard)
│   │   ├── DashboardClient.tsx       # 8-section unified progress hub
│   │   ├── Header.tsx                # Sticky nav (desktop 5-strip + mobile drawer)
│   │   ├── MobileBottomNav.tsx       # Phone bottom tab bar (Learn/Daily/Review/Profile) ★
│   │   ├── InstallPromptBanner.tsx   # Android/iOS PWA install prompt ★
│   │   ├── AnalyticsProvider.tsx     # PostHog page-view + user identification ★
│   │   ├── CelebrationOverlay.tsx    # Full-screen celebrations + shield toast ★
│   │   ├── OnboardingFlow.tsx        # 5-step onboarding (experience → world → mode → difficulty → overview)
│   │   ├── PlacementTest.tsx         # Placement test (12 questions → chapter unlock)
│   │   ├── WorldPathClient.tsx       # Duolingo winding path map (snake layout)
│   │   ├── BeatCoach.tsx             # AI coach chat panel
│   │   ├── HeartsWall.tsx            # Out-of-hearts blocker (gem spend to refill)
│   │   └── sims/
│   │       ├── Simulator.tsx         # Lazy-loads all 47 sims via React.lazy()
│   │       └── [47 simulator files]  # Each a self-contained Web Audio component
│   │
│   ├── content/
│   │   ├── missions.ts               # 73 Producer missions (with screens[])
│   │   ├── missions-foundations.ts   # 40 Fundamentals missions
│   │   ├── missions-dj.ts            # 40 DJ World missions
│   │   ├── missions-*-screens.ts     # CCD screen data for all 153 missions
│   │   ├── lesson-deep.ts            # Deep content (analogies, pro moves, walkthroughs)
│   │   ├── types.ts                  # All TypeScript types (LessonScreen, Mission, etc.)
│   │   ├── chapters.ts               # 15 chapters (5 per world)
│   │   ├── paths.ts                  # 32 paths
│   │   └── placement-questions.ts    # 36 placement test questions (12 per world)
│   │
│   └── lib/
│       ├── progress.tsx              # React Context: XP, streak, hearts, gems, FSRS cards ★
│       ├── fsrs.ts                   # FSRS v4 spaced repetition algorithm ★
│       ├── analytics.ts              # PostHog wrapper (privacy-first, no-op without key) ★
│       ├── push.ts                   # Web Push subscription management ★
│       ├── audio.ts                  # Web Audio engine (kick, snare, hat, tones, loops)
│       ├── audio-bus.ts              # Device node graph (EQ, comp, reverb, etc.)
│       ├── mode.tsx                  # LearnModeContext (ccd | classic)
│       ├── ranks.ts                  # 12-rank XP system (Bedroom Producer → CCD Master)
│       ├── leagues.ts                # League tier system
│       ├── gating.ts                 # Content gating logic
│       └── missionContext.ts         # mission → path → chapter → world resolver
│
├── tests/
│   └── progress.test.ts              # 30 unit tests (hearts, streaks, XP security, FSRS) ★
│
├── public/
│   ├── sw.js                         # Service worker (cache, push, offline sync) ★
│   ├── manifest.json                 # PWA manifest (shortcuts, share_target, maskable icons) ★
│   ├── icons/                        # PNG app icons (10 sizes, generated by scripts) ★
│   └── splash/                       # iOS launch images (6 device sizes) ★
│
└── scripts/
    ├── migrate-world-class.sql       # DB schema additions for push, events, FSRS ★
    ├── generate-icons.mjs            # Pure-Node PNG icon generator ★
    └── generate-splash.mjs           # Pure-Node iOS splash screen generator ★
```

★ = added in the world-class-upgrade PR (June 2026)

---

## Content Hierarchy

```
World (3)
  └── Chapter (5 per world = 15 total)
        └── Path (2–3 per chapter = 32 total)
              └── Mission (3–6 per path = 153 total)
                    └── screens[] — 7–8 CCD lesson screens:
                          hook → concept → concept → interact → quiz × 3 → summary
```

Every mission supports two formats simultaneously:
- **CCD Mode** (`screens[]`): Duolingo-style sequential screens with hearts, XP gating
- **Classic Mode** (`explainer` blocks): Scrolling explainer + simulator + Normal/Hard quiz

---

## Learning Modes

### Axis 1: CCD vs Classic (always changeable)

| | 🔒 Path Mode (CCD) | 🗺 Explorer Mode (Classic) |
|---|---|---|
| Access | Sequential unlock — one mission at a time | All 153 missions open immediately |
| Hearts | 5 hearts; wrong answer costs ♥; refill 1/4h | No hearts |
| Format | hook → concept → interact → quiz → summary | Scrolling explainer → sim → quiz |
| Exercise types | MCQ + audio-id + match + type-answer + sequence | MCQ only |

### Axis 2: Normal vs Hard (Classic only)

| | Normal | Hard 🔥 |
|---|---|---|
| Hints | Shown | Hidden |
| Questions | `quiz` array | `quizHard` if available, hints stripped otherwise |
| Pass threshold | 50% | 70% |
| Content depth | `beginner.what` paragraphs | `advanced.what` + `edgeCases` + `engineerNotes` |

---

## Exercise Types (LessonPlayer)

Five exercise kinds in CCD mode (defined in `src/content/types.ts`, rendered in `LessonPlayer.tsx` + `ExerciseScreens.tsx`):

| Kind | Description | Tests |
|---|---|---|
| `quiz` | 4-option MCQ with immediate feedback | Recognition |
| `audio-id` | Hear a synthesised example → identify it (4 options) | Ear training via listening |
| `match` | Tap pairs to match terms ↔ definitions (3–5 pairs, shuffled) | Association |
| `type-answer` | Free-text input with configurable exact/fuzzy matching | Active recall |
| `sequence` | Arrange items in correct order using ↑↓ controls | Procedural knowledge |

All exercise types support keyboard shortcuts (1–4 to pick MCQ, Enter to advance) and `aria-live` feedback.

---

## Gamification System

| Feature | Implementation |
|---|---|
| **XP** | Awarded on first mission completion. Server-authoritative via `/api/progress/events`. Capped at 500 XP/mission server-side (prevents spoofing). |
| **Hearts** | 5 hearts in CCD mode. Wrong answer costs ♥ with crumble animation. Refill 1/4h. Spend 350 💎 gems to instant-refill. |
| **Streak** | Daily XP goal (50 XP). Streak shield earned every 7 days — absorbs one missed day. Shield-earn fires toast animation. |
| **Gems** | Earned on mission completion (10 gems normal, 25 gems perfect score). Spent in gem shop or for heart refills. |
| **Spaced Repetition** | FSRS v4 algorithm (`src/lib/fsrs.ts`). Per-item stability, difficulty, and retrievability (R). Review queue surfaces R < 0.9 cards. |
| **Ranks** | 12 ranks based on total XP: Bedroom Producer → CCD Master. Rank-up triggers full-screen celebration. |
| **Badges** | Per-mission and per-chapter unlock. 20+ badge types. |
| **Trophies** | Path → Chapter → World → CCD Master celebrations. Each uses `CelebrationOverlay`. |
| **Leaderboard** | Weekly XP ranking. Server-authoritative (cannot be spoofed — XP is computed server-side). |
| **Adaptive nudge** | Low-score (< 70%) lessons show a review recommendation on the summary screen. |

---

## Server-Authoritative Progress (Critical)

Progress is stored in localStorage for offline/logged-out users but **XP, streaks, and hearts are validated server-side** for logged-in users.

### How it works

1. **Client** completes a mission → commits optimistic update to localStorage via `useProgress()`
2. **Client** dispatches `window.dispatchEvent(new CustomEvent("progress:server_event", { detail: event }))`
3. **`ServerEventQueue`** (in `ClientProviders.tsx`) picks up the event and POSTs to `/api/progress/events`
4. **Server** applies the event, computes the authoritative result (XP capped at 500/mission, streak computed from timestamps), and returns the canonical progress state
5. **Client** dispatches `progress:cloud` to reconcile localStorage with server values

### Event types accepted by `/api/progress/events`

```ts
{ type: "mission_complete", missionSlug, xp, score, badge? }
{ type: "heart_lost" }
{ type: "heart_refill_buy" }  // costs 350 gems, validated server-side
{ type: "drill_complete", drillKey, score }
```

### Offline behaviour

When offline or logged out, progress is committed locally only. The `ServerEventQueue` silently no-ops on network failure. On next login, `/api/progress/sync` GET pulls the server state and `progress:cloud` reconciles (newest wins per mission, max wins for XP/streak).

---

## Database Schema

All tables live in PostgreSQL. Run `scripts/migrate-world-class.sql` for the full schema.

| Table | Purpose |
|---|---|
| `users` | Auth (managed by NextAuth) |
| `user_progress` | XP, streak, hearts, gems, badges, FSRS cards per user |
| `push_subscriptions` | VAPID push notification subscriptions |
| `progress_events` | Audit log of all server-side progress mutations |
| `challenge_scores` | Daily challenge leaderboard scores |

Key columns in `user_progress`:

```sql
xp                  INTEGER   -- total XP (server-computed)
streak_days         INTEGER   -- current streak
last_day            TEXT      -- 'YYYY-MM-DD' of last activity
hearts              INTEGER   -- current heart count (0–5)
heart_refill_at     BIGINT    -- Unix ms when next refill starts
gems                INTEGER
streak_shield       BOOLEAN
fsrs_cards          JSONB     -- FSRS v4 per-mission stability/difficulty/reps
completed_missions  JSONB     -- { slug: { score, at } }
badges              JSONB     -- string[]
```

---

## FSRS Spaced Repetition

`src/lib/fsrs.ts` implements the [FSRS v4 algorithm](https://github.com/open-spaced-repetition/fsrs4anki).

Each mission has a `FSRSCard`:
```ts
{ stability: number, difficulty: number, lastReview: number, reps: number }
```

- **`completionToFSRS(score, existing?)`** — call when a mission is first completed
- **`reviewToFSRS(score, existing)`** — call during a review session
- **`getMissionsNeedingReview(cards, threshold=0.9)`** — returns slugs sorted by urgency (lowest retrievability first)
- **`fsrsStrength(card)`** — returns 0–1 for display (replaces the old linear `1.0 − 0.1×days` model)

Legacy `lessonStrengths` in progress are migrated to FSRS cards on first access via `legacyStrengthToFSRS`.

---

## Audio Engine

All audio is synthesised via Web Audio API. No audio asset files anywhere in the codebase.

```
src/lib/audio.ts          — Core: AudioContext, playKick, playSnare, playHat,
                            playClap, playTone, startLoop, playCorrect, playWrong,
                            playFanfare, ensureAudio (iOS unlock)

src/lib/audio-bus.ts      — DeviceNode graph: EQ, compressor, reverb, delay,
                            saturation, chorus, A/B comparison

src/components/ConceptAudio.tsx — 19 visual types → synthesised demo functions
                            (waveform-compare, freq-sweep, chord-stack, rhythm-dots, etc.)
```

The audio context is created lazily on first user gesture. iOS Safari requires a silent buffer + `ctx.resume()` — handled in `ensureAudio()`. The sequencer uses a **lookahead scheduler** (schedule 300ms ahead, tick every 60ms) to eliminate clock drift.

---

## PWA / Phone App

CCD.SCHOOL is a full PWA. Users on Android can install it from Chrome; on iOS via Safari → Share → Add to Home Screen.

| Feature | Status |
|---|---|
| Web App Manifest | ✅ — shortcuts, share_target, maskable icons |
| Service Worker (`public/sw.js`) | ✅ — cache-first static, network-first pages, offline IndexedDB queue |
| App Icons | ✅ — 10 PNG sizes (512, 192 any+maskable, Apple 180/167/152/120/76, favicon-32) |
| iOS Splash Screens | ✅ — 6 sizes (iPhone 15 Pro Max, 15/14 Pro, 14, SE, iPad, iPad Pro) |
| iOS Meta Tags | ✅ — `capable`, `black-translucent` status bar, `viewportFit=cover` |
| Install Prompt | ✅ — branded Android banner + iOS step-by-step instruction sheet |
| Web Push | ✅ — VAPID subscriptions stored in DB; streak-reminder cron via `/api/push/send-streak-reminder` |

**To enable push notifications:** set `VAPID_*` env vars (generate with `npx web-push generate-vapid-keys`). Schedule a daily POST to `/api/push/send-streak-reminder` with `Authorization: Bearer $CRON_SECRET` at 20:00 UTC.

**To submit to app stores:** use Capacitor to wrap the PWA in a native shell (see Next Steps below).

---

## Analytics (PostHog)

`src/lib/analytics.ts` wraps PostHog with privacy-first defaults (no autocapture, no IP logging). All calls are no-ops when `NEXT_PUBLIC_POSTHOG_KEY` is not set.

Events instrumented:

| Event | Where fired |
|---|---|
| `lesson_started` | On lesson mount |
| `lesson_screen_viewed` | Per screen (drop-off funnel) |
| `lesson_completed` | On lesson finish (with score, XP, quiz stats) |
| `quiz_answered` | Per question (correct/wrong) |
| `placement_completed` | On placement test submit |
| `pwa_install_prompt_shown` | When install banner appears |
| `pwa_install_clicked` | When user taps install |
| `pwa_install_outcome` | accepted/dismissed |
| `$pageview` | Every route change (via `AnalyticsProvider`) |

---

## CI / Testing

GitHub Actions runs on every push and PR (`.github/workflows/ci.yml`):

1. **TypeScript** — `tsc --noEmit`
2. **Tests** — Vitest (30 unit tests)
3. **Build** — `next build` (informational, continues on error)

### Test coverage

`tests/progress.test.ts` covers:

- Heart refill: 6 edge cases (no refill, partial, full, multi-hour, cap at 5, partial timer persistence)
- Streak: 7 edge cases (consecutive days, double-complete today, 2-day gap, shield consume, shield re-use guard, null lastDay, milestone)
- XP security: server-side cap (500 max, floor negatives, floor fractions)
- Progress merge: cloud sync conflict resolution (newest-wins per mission, max XP/streak)
- FSRS algorithm: 10 tests (grade mapping, stability growth, forgetting, interval bounds, difficulty bounds)

Run tests: `npm test`

---

## Deployment

### Vercel (recommended)

```bash
# From repo root, or connect GitHub repo to Vercel dashboard
vercel --cwd artifacts/ccd-school
```

Set all env vars in Vercel dashboard. The build command is `npm run build`, output directory is `.next`.

### Environment checklist before first deploy

- [ ] `AUTH_SECRET` set (32+ chars)
- [ ] `DATABASE_URL` points to production Postgres
- [ ] `scripts/migrate-world-class.sql` run against production DB
- [ ] `STRIPE_WEBHOOK_SECRET` from Stripe dashboard webhook for production URL
- [ ] `KIMI_API_KEY` set (otherwise Beat Coach shows offline message — non-fatal)
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` set (otherwise analytics silently disabled — non-fatal)
- [ ] `VAPID_*` keys set if push notifications wanted
- [ ] Cron job configured for `/api/push/send-streak-reminder`

---

## Adding Content

### Adding a CCD Mission (most common contribution)

All CCD screens live in `src/content/missions-*-screens.ts`. Each mission needs 7–8 screens:

```ts
// In missions-foundations-screens.ts (or -dj- or -producer-)
"your-mission-slug": [
  {
    kind: "hook",
    emoji: "🎵",
    headline: "Short punchy headline",   // ≤ 8 words
    subtext: "One-sentence hook.",        // ≤ 15 words
  },
  {
    kind: "concept",
    title: "The Key Concept",             // ≤ 5 words
    body: "Two sentences max. What it is and why it matters.", // ≤ 30 words
    keyFact: "One memorable bold callout.",  // ≤ 10 words
    visual: "waveform",  // see Visual Types below
  },
  // Second concept screen (different angle on the same topic)
  {
    kind: "concept",
    title: "Going Deeper",
    body: "...",
    visual: "eq-curve",
  },
  {
    kind: "interact",
    sim: "drum-pad",        // see SimType in types.ts + SIM_LIST in Simulator.tsx
    prompt: "Try tweaking X to hear Y.",  // ≤ 10 words
  },
  // 3 quiz screens
  {
    kind: "quiz",
    q: "Your question?",
    options: ["A", "B", "C", "D"],
    answer: 0,              // index of correct option
    explain: "Why A is correct. One or two sentences.",
    hint: "Optional hint shown before answering.",
  },
  // OR one of the new exercise types:
  {
    kind: "audio-id",
    prompt: "What type of waveform is this?",
    audioType: "waveform-compare",  // key from ConceptAudio DEMOS map
    options: ["Sine", "Square", "Sawtooth", "Triangle"],
    answer: 1,
    explain: "Square waves have a hollow, buzzy timbre.",
  },
  {
    kind: "match",
    prompt: "Match each term to its definition",
    pairs: [
      { left: "BPM", right: "Beats per minute" },
      { left: "DAW", right: "Digital audio workstation" },
      { left: "MIDI", right: "Musical instrument digital interface" },
    ],
  },
  {
    kind: "summary",
    learned: [
      "First key takeaway (≤ 8 words).",
      "Second key takeaway.",
      "Third key takeaway.",
    ],
    badge: { slug: "my-badge", name: "My Badge Name" }, // optional
  },
],
```

### Available Visual Types (concept screens)

`waveform` · `waveform-compare` · `frequency-bar` · `piano` · `piano-octave` · `eq-curve` · `amplitude-dial` · `bpm-grid` · `signal-chain` · `stereo-field` · `note-lengths` · `scale-steps` · `chord-stack` · `rhythm-dots` · `vinyl-platter` · `mixer-channel` · `camelot-wheel` · `waveform-zoom` · `headroom-meter` · `none`

Each visual type also has a synthesised audio demo in `ConceptAudio.tsx` — the ▶ HEAR EXAMPLE button fires automatically.

### Available Sim Types

All 47 sim types are listed in `src/components/sims/Simulator.tsx → SIM_LIST`. Key ones:

`drum-pad` · `piano-roll` · `mixer` · `device-chain` · `warp-lab` · `session-grid` · `arrangement` · `routing-puzzle` · `ear-training` · `beat-builder` · `chord-stacker` · `bassline-lab` · `melody-shaper` · `subtractive-synth` · `beatmatch-trainer` · `hot-cue-drill` · `harmonic-mix-wheel` · `lfo-lab` · `filter-envelope`

---

## Current Status

### ✅ Done (as of world-class-upgrade PR, June 2026)

**Architecture & Engineering**
- [x] React Context progress system (no localStorage race conditions)
- [x] Server-authoritative XP/streak/hearts via `/api/progress/events`
- [x] FSRS v4 spaced repetition (replaces linear `1.0 − 0.1×days` model)
- [x] 30 unit tests covering progress logic, security, and FSRS
- [x] GitHub Actions CI (typecheck → test → build on every PR)
- [x] PostHog analytics instrumented on core funnel
- [x] All 47 sims code-split with `React.lazy()`

**Learning**
- [x] 153 missions with full CCD screens (100% coverage)
- [x] 5 exercise types: MCQ, audio-id, match, type-answer, sequence
- [x] Audio-first concept screens (▶ HEAR EXAMPLE on every concept)
- [x] Keyboard shortcuts: 1–4 to answer, Enter to advance
- [x] Adaptive difficulty nudge on low-score completions
- [x] Placement test → chapter unlock

**Gamification**
- [x] XP, hearts, streak, streak shield, gems, badges, trophies
- [x] Heart crumble animation when heart is lost
- [x] XP float animation on correct answers
- [x] Shield-earn toast animation (auto-dismisses, above bottom nav)
- [x] Rank-up full-screen celebration
- [x] FSRS review queue (R < 0.9 threshold)

**Mobile / PWA**
- [x] MobileBottomNav (Learn / Daily / Review / Profile)
- [x] Install prompt (Android beacon + iOS step-by-step sheet)
- [x] Full service worker (cache, push handler, offline sync queue)
- [x] Web Push notifications (VAPID, streak-reminder cron)
- [x] PNG app icons (10 sizes, generated with Node.js — no deps)
- [x] iOS splash screens (6 device sizes)
- [x] `viewportFit=cover` + safe-area insets for notch/Dynamic Island
- [x] `black-translucent` iOS status bar

**Accessibility**
- [x] WCAG AA: minimum font sizes, 3px focus ring, 44px tap targets
- [x] Skip-to-content link
- [x] `prefers-reduced-motion` support
- [x] `forced-colors` (Windows High Contrast) support
- [x] `aria-live` on quiz feedback
- [x] `role="navigation"` with `aria-current="page"` on bottom nav

**Polish (10-fix pass)**
- [x] `animate-fade-in` defined (was referenced in OnboardingFlow but missing)
- [x] Google Fonts moved to `<link rel=preload>` (no more render-blocking @import)
- [x] Heart crumble animation (#3)
- [x] XP float on correct answers (#4)
- [x] Dashboard skeleton screens on cold load (#5)
- [x] Stats strip scroll dots on mobile (#6)
- [x] `data-page="lesson"` for bottom-nav padding suppression (#7)
- [x] Hamburger menu hidden when bottom nav is active (#9)
- [x] Streak-shield toast with animated materialise (#10)

---

## Next Steps

**An AI agent reading this should work through items in this order.** Each item has the context needed to implement it without asking questions.

---

### 🔴 P0 — Must do before any user testing

#### P0.1 — Create `.env.example`

No `.env.example` file exists. Any new developer or agent cloning the repo will be stuck. Create one with all variables from the "Required Environment Variables" section above (values as placeholders).

**File to create:** `artifacts/ccd-school/.env.example`

---

#### P0.2 — Wire `unlockedChapter` from placement test into world maps

`PlacementTest.tsx` calls `setPlacement(chapter)` which writes `progress.unlockedChapter`. But `WorldPathClient.tsx` and `WorldPageClient.tsx` never read it — every node is tappable regardless.

**Files to change:**
- `src/components/WorldPathClient.tsx` — read `progress.unlockedChapter` and show lock icon on nodes in chapters > unlocked
- `src/components/WorldPageClient.tsx` — same

**Behaviour:** In CCD mode, missions in chapters beyond `unlockedChapter` should show a lock icon and redirect to the previous chapter's last mission when tapped.

---

#### P0.3 — Test cloud sync end-to-end

`CloudSyncEffect` in `ClientProviders.tsx` syncs to `/api/progress/sync`. The GET (on login) and POST (debounced on change) need to be tested against a live `DATABASE_URL`.

**Verify:** Login → complete a mission → log out → log back in on a different browser → confirm XP/streak are preserved.

---

### 🟠 P1 — High impact user experience

#### P1.1 — Complete `lesson-deep.ts` content for DJ + Producer

`lesson-deep-foundations.ts` and `lesson-deep-dj.ts` exist with partial content. The `advanced.what`, `proMoves`, `walkthrough`, `mistakes` fields power Hard Mode in Classic lessons.

**Files to edit:** `src/content/lesson-deep-dj.ts`, `src/content/lesson-deep-synths.ts`

**Target fields per mission:** `advanced.what`, `proMoves` (3–5 items), `walkthrough` (3–5 steps), `mistakes` (2–3 common errors).

---

#### P1.2 — `/dashboard` as home for returning users

Currently `/` routes returning users through `HomeClient` which has its own logic. After onboarding, returning users should go directly to `/dashboard` — their XP, streak, and next lesson without any intermediary.

**File to change:** `src/components/HomeClient.tsx` — if `progress.onboardingDone === true`, redirect to `/dashboard` immediately (use `router.replace`, not `push`, so back button doesn't loop).

---

#### P1.3 — Lesson completion → Dashboard redirect

After completing a lesson, `handleComplete` in `LessonPageClient.tsx` currently redirects to the world page. Change to `/dashboard` so users immediately see their updated stats, the FSRS queue update, and the next lesson card.

**File to change:** `src/components/LessonPageClient.tsx` — change the `router.push` in `handleComplete` to `/dashboard`.

---

#### P1.4 — CCD gating on WorldPageClient and MissionsPageClient

Users can bypass CCD sequential gating by navigating to `/worlds` or `/missions` and clicking any lesson directly. `PathPageClient` enforces gating but world/missions views don't.

**Files to change:**
- `src/components/WorldPageClient.tsx`
- `src/components/MissionsPageClient.tsx`

**Behaviour:** In CCD mode (`learnMode === "ccd"`), mission nodes that aren't yet unlocked should have a lock overlay and a `disabled` prop. "Locked" = the previous mission in the same path hasn't been completed.

---

#### P1.5 — Source citations on lesson pages

Every mission's path entry in `paths.ts` has a `source` field (e.g. `"rekordbox 6.0.0 — p.77"`). Show it at the bottom of each concept screen and classic lesson as a small citation.

**Files to change:**
- `src/components/LessonPlayer.tsx` — render `<SourceBar>` (component exists: `src/components/SourceBar.tsx`) at bottom of ConceptScreen
- `src/components/InlineClassicLesson.tsx` — render SourceBar below the explainer blocks

---

### 🟡 P2 — Features that create the "best on the web" moat

#### P2.1 — Web MIDI input

Wire `navigator.requestMIDIAccess()` to `PianoRollSim`, `DrumPadSim`, `BeatBuilderSim`, and `ChordStackerSim`. Let users plug in a MIDI controller and trigger notes/pads with hardware. This is the most differentiated feature possible for a music production learning tool.

**New file to create:** `src/lib/midi.ts` (stub already exists — flesh it out)

**Behaviour:** If MIDI is available, show a "Connect MIDI" button in the sim. On click, enumerate devices and let user pick one. Incoming MIDI note-on events map to the sim's internal trigger function.

---

#### P2.2 — Kapacitor / native app store wrapper

To appear in the App Store and Google Play (not just as a PWA install), wrap the existing web app with Capacitor.

**Steps:**
1. `npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android`
2. `npx cap init "CCD.SCHOOL" "ccd.school.app"`
3. `npm run build && npx cap sync`
4. Open in Xcode / Android Studio and submit
5. Replace Web Push with `@capacitor/push-notifications` for native push

**Files to create:** `capacitor.config.ts`, `ios/` and `android/` directories (generated by Capacitor)

---

#### P2.3 — Share cards after trophy completion

`ShareCard.tsx` exists in components. Wire it into `CelebrationOverlay.tsx` after `world-trophy` and `ccd-master` events — add a "Share this achievement" button that generates a Canvas-based share image and triggers the native Web Share API.

**Files to change:** `src/components/CelebrationOverlay.tsx`, `src/components/ShareCard.tsx`

---

#### P2.4 — Public profile at `/u/[username]`

`PublicProfileClient.tsx` exists. Wire a "Share Profile" button on `/profile` that generates a unique URL. The public profile should show: display name, avatar, total XP, rank, streak, completed worlds (checkmarks), and recent badges.

**Files to change:** `app/u/[username]/page.tsx`, `src/components/PublicProfileClient.tsx`, `src/components/ProfilePageClient.tsx` (add the share button)

---

#### P2.5 — Content to CMS/database migration

All 153 missions live in TypeScript files. Every content fix requires a code deploy. Moving content to a DB layer or MDX files would allow non-engineer content updates.

**Recommended approach:** Add a `missions` table to PostgreSQL. Keep TypeScript files as seed data. Build an admin UI at `/admin/content` to edit mission text. The `lesson-deep.ts` content (the most frequently updated) should be migrated first.

**New files:** `app/admin/content/page.tsx`, `app/api/admin/content/route.ts`, DB migration

---

#### P2.6 — Beat Coach context enrichment

The `/api/beat-coach` route receives a generic `context` string. Enrich it per-lesson with structured context so the AI gives targeted, not generic, answers.

**File to change:** `src/components/BeatCoach.tsx` and any place `BeatCoach` is called — pass:
```ts
context: {
  world: mission.world,
  chapter: ctx.chapter?.title,
  lesson: mission.title,
  learnMode,
  currentScreenKind: currentScreen?.kind,
  recentWrongAnswers: [...] // last 3 wrong quiz options
}
```

---

### 🟢 P3 — Infrastructure & quality

#### P3.1 — E2E tests (Playwright)

No end-to-end tests exist. Add Playwright tests for the critical flows:

1. Onboarding → first lesson → complete lesson → check XP updated
2. Quiz wrong answer → heart decrements → hearts refill after time
3. Login → progress synced from server → logout → login again → same progress
4. Placement test → chapter unlocked → world map shows correct unlock state

**New files:** `tests/e2e/onboarding.spec.ts`, `tests/e2e/lesson.spec.ts`, `playwright.config.ts`

---

#### P3.2 — DB migration CI integration

`scripts/run-migrations.ts` and `scripts/migrate-world-class.sql` exist but aren't run in CI. Add a `db:migrate` npm script that runs all migrations in order, and document how to run it in deploy.

**File to change:** `package.json` — add `"db:migrate": "psql $DATABASE_URL -f scripts/migrate-world-class.sql"`

---

#### P3.3 — Error monitoring (Sentry)

`src/lib/error-capture.ts` and `src/lib/error-page.ts` exist but don't send to any error tracking service. Add Sentry for production error visibility.

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## Known Issues

| Issue | Location | Severity | Fix |
|---|---|---|---|
| No `.env.example` file | Root | 🔴 High — blocks new devs | Create one (P0.1) |
| `unlockedChapter` not enforced in world maps | `WorldPathClient.tsx` | 🟠 Medium — placement test result is ignored | P0.2 |
| Hard Mode (`quizHard`) not fully populated for DJ/Producer | `lesson-deep-dj.ts` | 🟡 Low — falls back to standard quiz | P1.1 |
| `@import url(googleapis)` fully replaced by `<link>` | `globals.css` fixed | ✅ Fixed | — |
| `animate-fade-in` missing | `globals.css` fixed | ✅ Fixed | — |
| XP spoofable via `/api/progress/sync` POST | `/api/progress/events` added | ✅ Fixed | — |
| Linear SR model | `fsrs.ts` added | ✅ Fixed | — |
| No tests | `tests/` added | ✅ Fixed | — |

---

## Routes Reference

| Route | Page | Notes |
|---|---|---|
| `/` | Home | Onboarding (new) or dashboard redirect (returning) |
| `/dashboard` | Progress hub | 8 sections: next lesson, stats, worlds, radar, badges, review, AI, leaderboard |
| `/learn/[slug]` | Lesson | CCD or Classic mode, mode-aware |
| `/world/[slug]` | Path map | Duolingo winding snake |
| `/worlds` | World chooser | |
| `/path/[slug]` | Path overview | Missions list for one path |
| `/missions` | Browse all | Search + filter 153 missions |
| `/daily` | Daily challenge | Deterministic daily mission |
| `/review` | SR review | FSRS-ordered review queue |
| `/train` | Ear training | 7 drill types |
| `/match` | Flashcard match | Term matching game |
| `/challenge` | Daily challenge | Timed quiz |
| `/playground` | Workbench | Free-form device chain |
| `/signal-flow` | Signal routing | Animated routing diagram |
| `/devices` | Device browser | All Ableton devices |
| `/device/[slug]` | Device detail | A/B comparison |
| `/glossary` | Glossary | 210+ music tech terms |
| `/shortcuts` | Shortcuts | Ableton shortcut trainer |
| `/leaderboard` | Leaderboard | Weekly XP |
| `/shop` | Gem shop | Heart refills, streak shields |
| `/placement` | Placement test | Skip-ahead by world |
| `/profile` | Profile | XP, rank, badges, trophies |
| `/u/[username]` | Public profile | Shareable |
| `/upgrade` | Paywall | Stripe PRO |
| `/login` | Auth | NextAuth |
| `/admin` | Admin | Gating mode toggle |

---

## Content Sources

| World | Primary Source | Verification |
|---|---|---|
| Fundamentals | [learningmusic.ableton.com](https://learningmusic.ableton.com) | Cross-referenced with music theory texts |
| DJ World | Pioneer DJ rekordbox 6.0.0 Instruction Manual | Page citations in `paths.ts` source fields |
| Producer | Ableton Live 12 Reference Manual | Section/page citations in `paths.ts` source fields |
| Synthesis chapter | [learningsynths.ableton.com](https://learningsynths.ableton.com) | |

---

## Tech Stack Summary

```
Framework       Next.js 15.3 (App Router, React Server Components)
UI              React 19
Language        TypeScript 5 (strict mode)
Styling         Tailwind CSS v4 (CSS-first, no tailwind.config.js)
State           React Context (progress, mode, gating) + TanStack Query (server data)
Auth            next-auth v5 beta (credentials + optional OAuth)
Database        PostgreSQL via `pg` (raw SQL, no ORM)
Payments        Stripe (checkout, portal, webhook signature verification)
AI Coach        Kimi API (platform.moonshot.cn) — Moonshot AI
Audio           Web Audio API (zero asset files)
Analytics       PostHog (optional, privacy-first)
Push            Web Push API (VAPID, web-push library)
Testing         Vitest 2.x + @vitest/coverage-v8
CI              GitHub Actions
Hosting         Vercel
PWA             Custom service worker (no next-pwa dependency)
Icons           Custom Node.js PNG generator (no canvas dependency)
```

---

## License

MIT — see [LICENSE](./LICENSE).

---

*Built for producers and DJs who learn by doing, not by watching.*
