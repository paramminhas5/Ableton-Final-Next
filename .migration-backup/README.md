# ABLETON.SCHOOL

> Learn the entire Ableton Live 12 manual through gamified missions, interactive simulators, and ear-training drills. No fluff.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start-FF4154)](https://tanstack.com/start)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06b6d4)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-green?logo=supabase)](https://supabase.com/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare)](https://workers.cloudflare.com/)

---

## What it is

An interactive, audio-first companion to the Ableton Live 12 manual. Every concept is taught through three layers:

1. **Explainer** — Concise prose with the key idea, with beginner and advanced tracks selectable per session
2. **Simulator** — A working browser sim that lets you manipulate the concept in real time (no Live required)
3. **Quiz** — One question at a time, with hints, wrong-answer explanations, and a full results screen

Progress is persisted locally (localStorage) and synced to the cloud on sign-in, so learning is never lost.

---

## Feature map

| Feature | Status | Notes |
|---|---|---|
| 124 missions across 6 worlds | ✅ | ~1,800 lines of structured content |
| 23 interactive simulators | ✅ | Drum rack, piano roll, mixer, warp lab, ear training, and more |
| Web Audio engine | ✅ | Synthesised sounds via Web Audio API — no asset files |
| XP + streak + badges | ✅ | localStorage → Supabase cloud sync on sign-in |
| Beginner / Advanced mode | ✅ | Different quiz banks and explainer depth per mission |
| CCD mode (gated skill tree) | ✅ | Sequential unlock gate. Hearts system and leagues in progress |
| Learning paths | ✅ | Curated cross-world sequences (First Beat, Mix a Track, etc.) |
| Ear training drills | ✅ | 7 drills: interval, chord, EQ cut, compression, reverb, panning, tempo |
| Command palette (⌘K) | ✅ | Indexes all 124 missions, devices, paths, and pages |
| Daily challenge | ✅ | Deterministic daily mission + drill selection |
| Spaced review queue | ✅ | Surfaces missions older than 1 day, sorted by age |
| Device lab | ✅ | Every Ableton device with real-time A/B comparison |
| Signal flow visualiser | ✅ | Animated routing diagrams per mission |
| Shortcuts trainer | ✅ | Drill Ableton keyboard shortcuts |
| Dark / light brutalist theme | ✅ | CSS custom properties, no external theme lib |
| PWA / offline | 🔜 | vite-plugin-pwa, service worker, background sync |
| Hearts / lives (CCD) | 🔜 | Loss aversion mechanic, refills over time |
| Weekly XP leaderboard | 🔜 | Supabase weekly_xp aggregation |
| Mobile search button | 🔜 | ⌘K has no touch trigger currently |
| Session celebration modal | 🔜 | XP counter animation + share prompt |

---

## Tech stack

```
Frontend        TanStack Start (React 19, file-based routing, SSR)
Styling         Tailwind CSS v4 (no config file, CSS-first)
UI primitives   Radix UI + shadcn/ui
State           TanStack Query v5, localStorage, Supabase Realtime
Auth + DB       Supabase (PostgreSQL, RLS, Edge Functions)
Audio           Web Audio API — synthesised sources, lookahead scheduler
Hosting         Cloudflare Workers + Cloudflare Pages
Package mgr     npm / bun
```

---

## Local development

### Prerequisites

- Node 20+
- A Supabase project (free tier works)
- Cloudflare account (optional for local dev)

### Setup

```bash
git clone https://github.com/paramminhas5/ablelive.git
cd ablelive
npm install
```

Copy environment variables:

```bash
cp .env.example .env.local
```

Required variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Apply database migrations:

```bash
npx supabase db push
# or link to your project:
npx supabase link --project-ref your-project-ref
npx supabase db push
```

Start the dev server:

```bash
npm run dev
# → http://localhost:3000
```

---

## Database schema

| Table | Purpose |
|---|---|
| `progress` | XP, streak, last active day per user |
| `mission_completions` | Per-user per-mission score and timestamp |
| `badges` | Earned badge slugs per user |

All tables use Row Level Security — users can only read and write their own rows.

### Progress sync strategy

1. Anonymous users: progress stored in `localStorage` under `ableton.school.progress.v1`
2. On sign-in: local progress is merged into the cloud (max XP, max streak, union of completions)
3. Subsequent sessions: cloud is authoritative

The merge is additive — users never lose XP earned offline.

---

## Architecture

### Routing

File-based routing via TanStack Router. Route files live in `src/routes/`. The route tree is auto-generated into `src/routeTree.gen.ts` — never edit this file manually.

Key routes:

```
/                   Home — progress overview, daily challenge, world grid
/learn              Paths, skill map, journey tab — CCD mode toggle lives here
/mission/:slug      Single mission (explainer → simulator → quiz)
/world/:slug        World overview with mission grid
/device/:slug       Device detail with A/B comparison and param explorer
/train              Ear training drill runner (7 drills)
/playground         Free-form workbench (device chain sandbox)
/match              Mix-match game — hit a target with EQ/comp sliders
/glossary           210+ term glossary
/shortcuts          Keyboard shortcut trainer
/signal-flow        Animated signal routing diagram
/profile            XP, rank, badges, streak
/login              Supabase magic link auth
```

### Audio engine

All audio runs through `src/lib/audio.ts` — a thin wrapper around the Web Audio API with no asset dependencies.

```
audio.ts           Core: AudioContext, gain envelope, playKick/Snare/Hat/Clap/Tone
audio-bus.ts       DeviceNode interface — every effect implements this
device-engine.ts   Owns a full dry/wet graph for one device page (A/B, analyser, bypass)
drills.ts          Ear training audio helpers (playInterval, playChord, playEqExcerpt, etc.)
```

The sequencer uses the **lookahead scheduler pattern** — audio events are scheduled 300ms ahead of `ctx.currentTime`, with a 50ms `setTimeout` tick advancing the scheduler. This eliminates the drift that `setInterval`-based sequencers produce under CPU load.

### Simulator loading

All 23 simulators are `React.lazy()` imports wrapped in `Suspense` + `SimErrorBoundary`. Only the simulator code for the current mission is downloaded. A crash in one simulator never affects the rest of the page.

### Learning modes

Two orthogonal toggles:

| Setting | Key | Values | Effect |
|---|---|---|---|
| Content depth | `ableton.school.mode` | `beginner` / `advanced` | Switches quiz bank and explainer paragraphs |
| UX shape | `ableton.school.learn-mode` | `classic` / `ccd` | CCD adds sequential mission gates |

---

## Content structure

### Missions

Each mission in `src/content/missions.ts` follows this shape:

```typescript
{
  slug: string          // URL slug + database key
  world: WorldSlug      // which of the 6 worlds it belongs to
  number: number        // global ordering
  title: string
  tagline: string       // one-line description
  xp: number            // XP awarded on first completion
  badge?: { slug, name } // optional badge unlock
  explainer: ExplainerBlock[]  // lead, para, callout, list, link blocks
  sim: { type: SimType; preset?: Record<string, unknown> }
  quiz: QuizQ[]         // { q, options, answer, explain?, hint? }
}
```

### Deep lessons

Optional per-slug `LessonDeep` objects in `src/content/lesson-deep.ts` layer additional content without modifying missions.ts:

```typescript
{
  beginner: { what, why, analogy }
  advanced: { what, edgeCases, engineerNotes }
  quizEasy: QuizQ[]
  quizHard: QuizQ[]
  listenFor: string[]
  proMoves: string[]
  workbenchPreset: { source, chain }
}
```

### Adding a mission

1. Add an entry to the appropriate world array in `src/content/missions.ts`
2. Optionally add a `LessonDeep` entry in `src/content/lesson-deep.ts`
3. If it needs a new simulator type, add the type to `SimType` in `src/content/types.ts`, create `src/components/sims/YourSim.tsx`, and add the lazy import + case to `Simulator.tsx`

---

## Deployment

The app runs on Cloudflare Workers (SSR) + Cloudflare Pages (static assets).

```bash
# Build
npm run build

# Preview locally with Wrangler
npx wrangler dev

# Deploy
npx wrangler deploy
```

The `wrangler.jsonc` at the root configures the worker name, routes, and KV bindings.

---

## Contributing

### Code style

- TypeScript strict mode — no `any` (except the `webkitAudioContext` fallback in audio.ts)
- Prettier + ESLint enforced. Run `npm run format` before committing
- Components: functional only, hooks for all stateful logic
- Audio: always use `getCtx()` — never construct `new AudioContext()` directly
- Simulators: must implement cleanup (stop audio, cancel rAF, clear timers) in `useEffect` return

### Adding quiz hints and explanations

All `QuizQ` objects accept optional `hint` (shown on demand, pre-submit) and `explain` (shown post-submit). These are the highest-ROI content additions — they directly improve retention.

```typescript
{
  q: "What does Warp Mode 'Complex Pro' do differently?",
  options: ["Faster CPU", "Formant-preserving pitch shift", "Disables warp markers", "Mono only"],
  answer: 1,
  hint: "Think about what happens to a vocal when you time-stretch it in a basic mode.",
  explain: "Complex Pro separates pitch from time using phase vocoders — essential for high-quality vocal warping."
}
```

---

## Roadmap

### Now (unblocked, high impact)

- [ ] Mobile search trigger — add icon button to mobile header that opens CommandPalette
- [ ] Hearts / lives in CCD mode — 3 hearts, lose on wrong answer, refill 1/hr
- [ ] Session completion modal — XP animation, badge reveal, share prompt
- [ ] Wire ShareCard.tsx into mission completion and quiz result screens
- [ ] Surface `DRILL_WHY` content on the Train page

### Next (1–2 weeks)

- [ ] Weekly XP leaderboard — Supabase `weekly_xp` view + `/leaderboard` route
- [ ] Daily goal ring — 50 XP/day target, visual ring in header
- [ ] Streak shield — earned at 7-day streaks, absorbs one missed day
- [ ] `npm run test` — Vitest + React Testing Library, start with progress.ts and Quiz.tsx
- [ ] GitHub Actions CI — typecheck + lint + test on every push

### Later (polish + growth)

- [ ] PWA + Service Worker — offline missions, background sync for progress
- [ ] Web MIDI input — plug in your controller, trigger pads and piano roll
- [ ] Placement test — 10-question skip-ahead for users who already know the basics
- [ ] Real drum samples — 8 compressed WAV files (~200KB) for richer sequencer sound
- [ ] Per-mission audio timestamps in explainers — "here's what 6kHz sounds like"
- [ ] Mastery gates in CCD mode — require 3× ≥ 80% to unlock next mission
- [ ] Daily challenge participant counter — "841 producers did this today"

---

## License

MIT — see [LICENSE](./LICENSE).

---

*Built for producers who learn by doing, not by watching.*
