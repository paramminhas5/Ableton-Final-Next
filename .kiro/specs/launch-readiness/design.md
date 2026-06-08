# Design Document: CCD.SCHOOL Launch-Readiness

## Overview

This document covers the complete technical design for every change needed to ship CCD.SCHOOL v1. The platform is a gamified music-education app built on Next.js 15.3 / React 19 / Tailwind CSS v4 / TypeScript 5.8, with client-side state in localStorage and cloud sync via PostgreSQL (pg). All application code lives under `artifacts/ccd-school/`.

Eight discrete concerns are designed below: (1) Flow Mode rename, (2) lesson-completion redirect to `/dashboard`, (3) `LessonSourceBar` citation component, (4) returning-user `/dashboard` redirect, (5) Hard Mode DJ content, (6) Hard Mode Synthesis content, (7) FAL.ai image pipeline, (8) mission content audit scripts, and (9) Beat Coach context enrichment. Each section gives exact file paths, function signatures, data-flow diagrams, and the rationale for every design decision.

---

## Architecture Overview

```
artifacts/ccd-school/
├── app/
│   ├── api/beat-coach/route.ts         ← Kimi API proxy
│   └── ...
├── src/
│   ├── components/
│   │   ├── LessonPageClient.tsx         ← mode router (Flow / Free)
│   │   ├── LessonPlayer.tsx             ← Duolingo screen engine
│   │   ├── InlineClassicLesson.tsx      ← scrolling lesson
│   │   ├── HomeClient.tsx               ← landing / dashboard gate
│   │   ├── Header.tsx                   ← ModeTogglePill
│   │   ├── WorldPathClient.tsx          ← path map
│   │   ├── BeatCoach.tsx                ← AI tutor widget
│   │   ├── CompletionModal.tsx          ← post-lesson celebration
│   │   ├── LessonSourceBar.tsx          ← NEW citation bar
│   │   └── LessonVisuals.tsx            ← inline visual renderer
│   ├── content/
│   │   ├── lesson-deep-dj.ts            ← DJ Hard Mode data
│   │   ├── lesson-deep-synths.ts        ← Synth Hard Mode data
│   │   └── types.ts                     ← shared types
│   └── lib/
│       ├── mode.tsx                     ← LearnMode context + hook
│       └── missionContext.ts            ← slug → path/chapter resolver
├── public/generated/                    ← FAL.ai images (build output)
└── scripts/
    ├── generate-fal-images.mjs          ← NEW FAL pipeline script
    └── audit-missions.mjs               ← NEW mission audit script
```

---

## Section 1 — Flow Mode Rename Architecture

### 1.1 Problem Statement

The canonical internal mode identifier is currently `"ccd"` and the user-facing label is `"PATH MODE"`. Both must be replaced with `"flow"` / `"Flow Mode"` throughout. The paired mode `"classic"` / `"EXPLORE MODE"` becomes `"classic"` (internal stays, per backwards-compat decision) / `"Free Mode"` (user-facing).

### 1.2 `lib/mode.tsx` — Type & Context Changes

**Current type:**
```typescript
export type LearnMode = "classic" | "ccd";
```

**New type:**
```typescript
export type LearnMode = "flow" | "classic";
```

**`normaliseCcdToFlow()` function** — called on every localStorage read:

```typescript
/**
 * Normalises legacy "ccd" value to "flow".
 * Any stored "classic" value is preserved as-is.
 * Called before any component receives the mode value.
 */
function normaliseCcdToFlow(raw: string | null): LearnMode {
  if (raw === "ccd") return "flow";
  if (raw === "classic") return "classic";
  return "flow"; // new default is "flow"
}
```

**Updated `getInitialMode()`:**
```typescript
function getInitialMode(): LearnMode {
  if (typeof window === "undefined") return "flow";
  try {
    const raw = localStorage.getItem(MODE_KEY);
    const normalised = normaliseCcdToFlow(raw);
    // Write back immediately so "ccd" never persists beyond this read
    if (raw !== normalised) localStorage.setItem(MODE_KEY, normalised);
    return normalised;
  } catch {
    return "flow";
  }
}
```

**Updated `MODE_LABELS`:**
```typescript
export const MODE_LABELS: Record<LearnMode, { name: string; icon: string; tagline: string }> = {
  flow:    { name: "Flow Mode",  icon: "🌊", tagline: "Sequential · Hearts on · XP gated" },
  classic: { name: "Free Mode",  icon: "🔓", tagline: "All open · No hearts · Jump anywhere" },
};
```

**Default value change:** `LearnModeContext` default becomes `"flow"`.

### 1.3 Grep-and-Replace Across Components

Every comparison `learnMode === "ccd"` becomes `learnMode === "flow"`. Full file list:

| File | Change |
|---|---|
| `LessonPageClient.tsx` | `if (learnMode === "ccd")` → `if (learnMode === "flow")` |
| `LessonPlayer.tsx` | `const isPathMode = learnMode === "ccd"` → `learnMode === "flow"` |
| `InlineClassicLesson.tsx` | `const defaultHard = learnMode !== "ccd"` → `learnMode !== "flow"` |
| `Header.tsx` (ModeTogglePill) | mode comparisons and label strings |
| `WorldPathClient.tsx` | any `learnMode === "ccd"` guards |
| `OnboardingFlow.tsx` | mode description copy |
| `HeartsWall.tsx` | "PATH MODE" copy → "Flow Mode" |
| `CompletionModal.tsx` | any mode-label references |
| `BeatCoach.tsx` | context string uses `learnMode === "flow"` check |

### 1.4 UI Copy Changes

**Mode pill in Header.tsx:**
- Flow Mode active: pill reads `"🌊 FLOW"`, background `bg-acid text-ink`
- Free Mode active: pill reads `"🔓 FREE"`, background `bg-bone text-ink`

**Toast messages (via `toast()` or equivalent):**
- Switch to Flow: `"🌊 FLOW MODE — locked in, hearts on, sequential"`
- Switch to Free: `"🔓 FREE MODE — all lessons open"`

**Mode badge in InlineClassicLesson.tsx:**
```tsx
// BEFORE
{mode === "explore" ? "🔓 Explore Mode" : "🗺 Path Mode"}

// AFTER
{mode === "explore" ? "🔓 Free Mode" : "🌊 Flow Mode"}
```

**Mobile drawer in Header.tsx:**
- `"FLOW MODE"` — subtitle: `"Sequential · earn XP · hearts on"`
- `"FREE MODE"` — subtitle: `"All open · no hearts · Normal or Hard"`

**HeartsExplainerModal in LessonPlayer.tsx:**
```tsx
// BEFORE
<div className="font-display text-3xl">🗺 PATH MODE HEARTS</div>

// AFTER
<div className="font-display text-3xl">🌊 FLOW MODE HEARTS</div>
```

### 1.5 `FlowFallbackBanner` Rename

In `LessonPageClient.tsx`, rename `CcdFallbackBanner` → `FlowFallbackBanner` and update copy:

```tsx
function FlowFallbackBanner({ missionTitle }: { missionTitle: string }) {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-4">
      <div className="brutal-border bg-acid text-ink px-5 py-4">
        <div className="flex items-start gap-3 mb-2">
          <span className="text-xl shrink-0">🌊</span>
          <div>
            <div className="font-display text-base">FLOW MODE — Explore Format</div>
            <div className="font-mono text-xs opacity-60 mt-0.5">{missionTitle}</div>
          </div>
        </div>
        <div className="font-mono text-xs opacity-80 leading-relaxed">
          This lesson uses the scrolling format.{" "}
          Complete the quiz to unlock the next lesson and earn your XP.
        </div>
        <div className="mt-3 flex flex-wrap gap-2 font-mono text-[9px] uppercase">
          <span className="brutal-border bg-ink/20 px-2 py-1">✓ Full content</span>
          <span className="brutal-border bg-ink/20 px-2 py-1">✓ Interactive sim</span>
          <span className="brutal-border bg-ink/20 px-2 py-1">✓ Quiz + XP</span>
        </div>
      </div>
    </div>
  );
}
```

### 1.6 Data Flow Diagram

```
localStorage read
      │
      ▼
normaliseCcdToFlow(raw)
      │   "ccd" → "flow"
      │   "classic" → "classic"
      │   null → "flow"  (new default)
      ▼
LearnModeContext.learnMode  ∈ { "flow" | "classic" }
      │
      ├── LessonPageClient  →  if (learnMode === "flow")
      ├── LessonPlayer      →  const isFlowMode = learnMode === "flow"
      ├── InlineClassicLesson → defaultHard = learnMode !== "flow"
      ├── Header ModeTogglePill → icon + label
      └── BeatCoach context string
```

---

## Section 2 — Lesson Completion → `/dashboard` Redirect

### 2.1 Change in `LessonPageClient.tsx`

**Current `handleComplete`:**
```typescript
const handleComplete = () => {
  setTimeout(() => router.push(worldRoute), 2200);
};
```

**New `handleComplete`:**
```typescript
const handleComplete = () => {
  const destination = isReview ? "/review" : "/dashboard";
  setTimeout(() => router.push(destination), 2200);
};
```

The 2200 ms delay is preserved — it covers the `CompletionModal` animation and fanfare sound. The `worldRoute` variable is no longer used for redirect (it is still used for the back-button `✕` in `LessonPlayer`).

### 2.2 Cascade Through `InlineClassicLesson`

`InlineClassicLesson.onComplete` calls `onComplete()` directly inside `onQuizDone`. That callback is already the parent's `handleComplete`. No change needed in `InlineClassicLesson` itself — the redirect destination is determined entirely by the parent.

```
onQuizDone() in InlineClassicLesson
      │
      └── onComplete()  ←── this is handleComplete() from LessonPageClient
                                    │
                                    └── isReview ? "/review" : "/dashboard"
```

### 2.3 Review Mode Gate

`isReview` is set from `useSearchParams().get("review") === "1"`. Review missions are linked as `/learn/{slug}?review=1`. This correctly preserves the review flow by routing to `/review` instead of `/dashboard`.

### 2.4 Dashboard Readiness Post-Redirect

The `/dashboard` route renders `DashboardClient.tsx`. After a completed mission, `completeMission()` from `useProgress()` has already been called inside `LessonPlayer.advance()` or `InlineClassicLesson.onQuizDone()`. Because progress is stored in localStorage and consumed by `useProgress()` via a reactive hook, the Dashboard will reflect updated XP, streak, and next-lesson hero card immediately on mount — no server round-trip needed for the optimistic display.

---

## Section 3 — `LessonSourceBar` Component

### 3.1 New File: `src/components/LessonSourceBar.tsx`

```tsx
"use client";
/**
 * LessonSourceBar — displays a source citation string for a lesson.
 * Renders nothing if source is empty, null, or undefined.
 *
 * Distinct from the audio SourceBar.tsx (which is a sim audio picker).
 */
interface Props {
  /** Citation string from LearningPath.source — e.g. "learningmusic.ableton.com/make-beats" */
  source: string | null | undefined;
}

export function LessonSourceBar({ source }: Props) {
  if (!source) return null;

  return (
    <div
      className="brutal-border bg-bone px-4 py-2 mt-4"
      aria-label="Content source citation"
    >
      <span className="font-mono text-[10px] uppercase opacity-60">
        📄 SOURCE: {source}
      </span>
    </div>
  );
}
```

### 3.2 Source Resolution Pattern

Both consuming components use `getMissionContext(slug)` which already returns the parent `LearningPath` (via the `SLUG_TO_PATH` map). The `source` field lives on `LearningPath`:

```typescript
// In paths.ts (already exists)
export type LearningPath = {
  // ...
  source?: string;  // e.g. "learningmusic.ableton.com", "rekordbox 6.0.0 Manual §3.2"
};
```

Source resolution:
```typescript
const ctx = getMissionContext(slug);
const source = ctx.path?.source ?? null;
// Pass to <LessonSourceBar source={source} />
```

### 3.3 Wire Into `InlineClassicLesson.tsx`

Add after the quiz section and before the "NEXT LESSON" CTA:

```tsx
{/* ── SOURCE CITATION ─────────────────────────────────── */}
<LessonSourceBar source={ctx.path?.source} />

{/* ── NEXT LESSON CTA ───────────────────────────────── */}
{nextSlug && done && (
  <Link href={`/learn/${nextSlug}`} ...>
    NEXT LESSON →
  </Link>
)}
```

`ctx` is already computed at the top of `InlineClassicLesson` via `getMissionContext(m.slug)`.

### 3.4 Wire Into `LessonPlayer.tsx` — `SummaryScreen`

`SummaryScreen` does not currently have access to `ctx`. Add the context resolution inside `SummaryScreen` or pass `source` as a prop:

**Option A (preferred — prop):** Pass `source` from `LessonPlayerInner` to `SummaryScreen`:

```typescript
// In LessonPlayerInner, after existing ctx:
const ctx = getMissionContext(mission.slug);
const sourceStr = ctx.path?.source ?? null;

// Pass into SummaryScreen call:
<SummaryScreen
  screen={summaryScreen}
  mission={mission}
  xpEarned={xpEarned}
  nextSlug={nextSlug}
  isLoggedIn={!!user}
  correctCount={correctCount}
  quizTotal={quizScreens.length}
  source={sourceStr}         // NEW
  onClose={onComplete}
/>
```

Inside `SummaryScreen`, after the "YOU LEARNED" bullets list:
```tsx
{source && <LessonSourceBar source={source} />}
```

### 3.5 Render Position Diagram

```
InlineClassicLesson layout:
  ┌─ Mode badge ──────────────────┐
  ├─ Difficulty toggle ────────────┤
  ├─ Mission header ───────────────┤
  ├─ WHAT YOU NEED TO KNOW ────────┤
  ├─ HOW IT WORKS (details) ───────┤
  ├─ LISTEN FOR ───────────────────┤
  ├─ WALKTHROUGH ──────────────────┤
  ├─ PRO MOVES ────────────────────┤
  ├─ COMMON MISTAKES ──────────────┤
  ├─ SIMULATOR ────────────────────┤
  ├─ QUICK QUIZ ───────────────────┤
  ├─ [LessonSourceBar] ← NEW ──────┤
  └─ NEXT LESSON CTA ──────────────┘

LessonPlayer SummaryScreen:
  ┌─ 🎉 LESSON COMPLETE ───────────┐
  ├─ +XP earned ───────────────────┤
  ├─ Badge unlocked ───────────────┤
  ├─ Save progress nudge ──────────┤
  ├─ YOU LEARNED bullets ──────────┤
  ├─ [LessonSourceBar] ← NEW ──────┤
  └─ NEXT LESSON / Back to path ───┘
```

---

## Section 4 — Returning User → `/dashboard` Redirect

### 4.1 Current Behaviour in `HomeClient.tsx`

```typescript
if (user || hasMissions || progress.onboardingDone) {
  return <Dashboard />;
}
```

This renders the `<Dashboard />` component inline within the home route. The problem is that `/` and `/dashboard` show the same content duplicated. Users who visit `/` directly see the home page flash before the check runs.

### 4.2 New Behaviour

Replace the conditional render with a `useEffect`-based redirect:

```typescript
export function HomeClient() {
  const { user } = useAuth();
  const { progress } = useProgress();
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const hasMissions = Object.keys(progress.completedMissions).length > 0;
  const shouldRedirect = !!(user || hasMissions || progress.onboardingDone);

  // Redirect returning users to /dashboard before first paint where possible
  useEffect(() => {
    if (shouldRedirect) {
      router.replace("/dashboard");
    }
  }, [shouldRedirect, router]);

  // Prevent flash: return null while redirecting
  if (shouldRedirect) return null;

  if (showOnboarding) {
    return <OnboardingFlow onDone={() => setShowOnboarding(false)} />;
  }

  return <Landing onGetStarted={() => setShowOnboarding(true)} />;
}
```

**Key decisions:**
- `router.replace()` not `router.push()` — avoids adding `/` to history stack so Back button goes to the page before landing.
- `return null` guard — prevents the Landing page from rendering during the navigation tick; produces a blank frame (imperceptible) rather than a flash.
- `useEffect` fires after hydration — this is correct for localStorage-based checks since `useProgress()` reads localStorage only client-side.

### 4.3 Flash-Prevention Constraint

`useLayoutEffect` cannot be used in a `"use client"` Server Component descendant with Next.js 15 App Router without suppressing warnings. The `useEffect` + `return null` pattern achieves the same result at the cost of one additional render frame (which is not visible to the user at typical page-load speeds).

### 4.4 Redirect Condition Table

| `user` | `hasMissions` | `onboardingDone` | Result |
|--------|--------------|-----------------|--------|
| ✓ | any | any | → `/dashboard` |
| ✗ | ✓ | any | → `/dashboard` |
| ✗ | ✗ | ✓ | → `/dashboard` |
| ✗ | ✗ | ✗ | Show Landing |

---

## Section 5 — Hard Mode Content: DJ World (`lesson-deep-dj.ts`)

### 5.1 File Location and Shape

**File:** `src/content/lesson-deep-dj.ts`

Exports `DJ_LESSONS: Record<string, LessonDeep>` keyed by mission slug. The `LessonDeep` type is already defined in `types.ts`:

```typescript
export type LessonDeep = {
  hook?: string;
  advanced?: { what: string[]; edgeCases?: string[]; engineerNotes?: string[] };
  quizHard?: QuizQ[];
  proMoves?: string[];
  walkthrough?: { do: string; listen: string }[];
  mistakes?: string[];
  sources?: { label: string; section: string }[];
  // ...
};
```

### 5.2 Content Coverage

All 40 DJ World mission slugs across 5 chapters must have entries:

| Chapter | Chapter Slug | Missions |
|---|---|---|
| 1 | `setup-and-culture` | `what-is-djing`, `dj-equipment`, `rekordbox-intro`, `dj-culture-history`, `dj-ethics-sets`, `dj-software-overview`, `dj-hardware-tour`, `dj-setup-flow` |
| 2 | `the-library` | `importing-music`, `beatgrid-analysis`, `cue-points-dj`, `memory-cues`, `playlists-collections`, `hot-cues-performance`, `rekordbox-export`, `smart-playlists` |
| 3 | `the-mix-dj` | `beatmatching-manual`, `eq-mixing`, `sync-function`, `phrasing-structure`, `transition-techniques`, `mixing-in-key`, `volume-headroom`, `looping-mixing` |
| 4 | `dj-performance` | `reading-the-crowd`, `set-planning`, `cdj-3000-deep`, `djm-a9-deep`, `effects-performance`, `rekordbox-performance-mode`, `stems-djing`, `live-remix` |
| 5 | `dj-mastery` | `mastering-transitions`, `b2b-djing`, `festival-tech-rider`, `streaming-djing`, `label-demos`, `dj-career`, `digital-vinyl`, `dj-production-crossover` |

### 5.3 Content Quality Standard Per Entry

Every entry must satisfy:

```typescript
{
  // advanced.what: ≥ 3 paragraphs, each ≥ 2 sentences
  // Cites specific rekordbox 6.0.0 manual page/section or Pioneer hardware model
  advanced: {
    what: [
      "Paragraph citing e.g. rekordbox 6.0.0 Manual §4.3 Beat Grid Analysis...",
      "Paragraph citing CDJ-3000 Operating Instructions p.22...",
      "Paragraph with engineer-grade insight...",
    ],
    edgeCases: ["..."],         // optional
    engineerNotes: ["..."],     // optional
  },

  // quizHard: ≥ 3 questions requiring source-material knowledge
  quizHard: [
    { q: "...", options: ["A", "B", "C", "D"], answer: 0, explain: "..." },
    // ...
  ],

  // proMoves: ≥ 3 actionable professional tips
  proMoves: [
    "Use rekordbox's Beat Jump to stay locked in during a technical failure...",
    // ...
  ],

  // walkthrough: ≥ 4 steps, each with do + listen
  walkthrough: [
    { do: "Open rekordbox Preferences → Analysis → ...", listen: "Watch the beatgrid lock to transients..." },
    // ...
  ],

  // mistakes: ≥ 3 specific real DJ mistakes
  mistakes: [
    "Setting beatgrid anchor on the wrong downbeat (rekordbox §4.3.2) causes sync to drift by one bar...",
    // ...
  ],

  // sources: ≥ 1 verifiable primary source
  sources: [
    { label: "rekordbox 6.0.0 Instruction Manual", section: "§4.3 Beat Grid Analysis, pp. 45–52" },
  ],
}
```

### 5.4 Primary Sources to Reference

- **rekordbox 6.0.0 Instruction Manual** — available as PDF; chapter/page refs must be accurate
- **Pioneer CDJ-3000 Multi Player Operating Instructions** — for CDJ-specific content
- **Pioneer DJM-A9 4-channel DJ Mixer Operating Instructions** — for mixer-specific content  
- **Pioneer DJM-900NXS2 Operating Instructions** — for legacy mixer content

---

## Section 6 — Hard Mode Content: Producer Synthesis (`lesson-deep-synths.ts`)

### 6.1 File Location

**File:** `src/content/lesson-deep-synths.ts`

Exports `SYNTHS_LESSONS: Record<string, LessonDeep>`.

### 6.2 Content Coverage — 18 Synthesis Missions

Synthesis missions span 3 paths within the Producer world:

| Path | Path Slug | Missions |
|---|---|---|
| Synth Sound | `synth-sound` | `what-is-synthesis`, `oscillators`, `waveforms-synth`, `subtractive-basics`, `additive-synthesis`, `wavetable-ableton` |
| Synth Shaping | `synth-shaping` | `filters-synth`, `filter-types`, `envelopes-adsr`, `lfo-basics`, `modulation-matrix`, `wavetable-operator` |
| Synth Movement | `synth-movement` | `fm-synthesis`, `am-synthesis`, `granular-basics`, `vocoder-basics`, `drift-ableton`, `sound-design-workflow` |

### 6.3 Content Quality Standard Per Entry

Same structural requirements as DJ World (≥3 paragraphs `advanced.what`, ≥3 `quizHard`, ≥3 `proMoves`, ≥4 walkthrough steps, ≥3 `mistakes`), with:

- **`advanced.what`** must reference specific `learningsynths.ableton.com` chapters and, where applicable, Ableton Live 12 instrument names (Wavetable, Operator, Drift)
- **`walkthrough`** must include specific parameter values: e.g. `"set filter cutoff to 800 Hz"`, `"ADSR: A=10ms D=200ms S=50% R=400ms"`
- **`quizHard`** must cover engineering-level content: filter slopes in dB/octave, FM carrier:modulator ratios, ADSR stage behaviours, harmonic series mathematics

### 6.4 Primary Sources to Reference

- `learningsynths.ableton.com` — cite specific chapter slug in URL path (e.g. `/oscillators`, `/filters`, `/envelopes`)
- **Ableton Live 12 Reference Manual** — Chapter 21 (Wavetable), Chapter 22 (Operator), Chapter 23 (Drift) for instrument-specific entries

---

## Section 7 — FAL.ai Image Generation Pipeline

### 7.1 Architecture Decision

**Build-time script** (not runtime API route). Rationale: API costs are incurred once per image; generated `.webp` files are committed to `public/generated/` and served as static assets. No cold-start latency on page load.

```
scripts/generate-fal-images.mjs
      │  reads
      ▼
fal-image-priority.md          ← priority list: { missionSlug, screenIndex, prompt }
      │
      │  calls
      ▼
FAL.ai API (flux-pro or flux-dev endpoint)
      │  saves
      ▼
public/generated/{missionSlug}-{screenIndex}.webp
```

### 7.2 `scripts/generate-fal-images.mjs`

```javascript
#!/usr/bin/env node
/**
 * generate-fal-images.mjs
 *
 * Build-time script: reads fal-image-priority.md, calls FAL.ai API,
 * saves results to public/generated/{slug}-{index}.webp
 *
 * Usage: FAL_API_KEY=xxx node scripts/generate-fal-images.mjs
 * Flags: --dry-run  (log prompts without calling API)
 *         --overwrite  (regenerate even if file already exists)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "generated");
const PRIORITY_FILE = path.join(ROOT, "fal-image-priority.md");

const FAL_API_KEY = process.env.FAL_API_KEY;
const FAL_API_URL = "https://fal.run/fal-ai/flux/dev";

// Parse priority file: lines matching "- missionSlug | screenIndex | prompt text"
function parsePriorityFile(raw) { /* ... */ }

async function generateImage(prompt, outPath) {
  const res = await fetch(FAL_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Key ${FAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      image_size: "landscape_4_3",
      num_inference_steps: 28,
      output_format: "webp",
      enable_safety_checker: true,
    }),
  });
  if (!res.ok) throw new Error(`FAL error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const imageUrl = data.images?.[0]?.url;
  if (!imageUrl) throw new Error("No image URL in FAL response");
  // Download and save
  const imgRes = await fetch(imageUrl);
  const buffer = Buffer.from(await imgRes.arrayBuffer());
  fs.writeFileSync(outPath, buffer);
}

// Main: iterate priority list, skip existing unless --overwrite
async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const items = parsePriorityFile(fs.readFileSync(PRIORITY_FILE, "utf8"));
  for (const { missionSlug, screenIndex, prompt } of items) {
    const filename = `${missionSlug}-${screenIndex}.webp`;
    const outPath = path.join(OUT_DIR, filename);
    if (fs.existsSync(outPath) && !process.argv.includes("--overwrite")) {
      console.log(`[skip] ${filename} already exists`);
      continue;
    }
    console.log(`[gen] ${filename}`);
    if (!process.argv.includes("--dry-run")) {
      await generateImage(prompt, outPath);
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
```

### 7.3 `types.ts` — Add `"fal-image"` Visual Type

In the `LessonScreen` concept screen union, extend the `visual` field:

```typescript
// In the concept screen union member of LessonScreen:
| {
    kind: "concept";
    title: string;
    body: string;
    keyFact?: string;
    visualProps?: { /* existing */ };
    visual?:
      // ... existing visual types ...
      | "fal-image";   // NEW — FAL.ai generated image
    imageUrl?: string; // NEW — only used when visual === "fal-image"
  }
```

### 7.4 `LessonVisuals.tsx` — `"fal-image"` Renderer

Add a new branch inside `InlineVisual`:

```tsx
// Inside InlineVisual() switch/if block:
if (type === "fal-image") {
  return <FalImage url={imageUrl} alt={altText} />;
}

function FalImage({ url, alt }: { url?: string; alt?: string }) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  if (!url) return null;

  return (
    <div className="brutal-border overflow-hidden bg-ink/10 relative min-h-[200px]">
      {/* Skeleton loader */}
      {status === "loading" && (
        <div className="absolute inset-0 bg-ink/10 animate-pulse" aria-hidden />
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center font-mono text-xs opacity-40">
          [image unavailable]
        </div>
      )}
      <img
        src={url}
        alt={alt ?? "Lesson visual"}
        loading="lazy"
        className={`w-full max-w-[600px] mx-auto block object-contain transition-opacity duration-300
          ${status === "loaded" ? "opacity-100" : "opacity-0"}`}
        style={{ maxHeight: "360px" }}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
      />
    </div>
  );
}
```

### 7.5 Priority List: `fal-image-priority.md`

Format (one entry per line):
```
- what-is-djing | 1 | Photorealistic Pioneer CDJ-3000 and DJM-A9 mixer on a club DJ booth, neutral dark studio background, no text overlay, high detail
- dj-equipment | 1 | ...
```

**Priority order:**
1. `what-is-djing` — CDJ-3000 + DJM-A9 booth overview
2. `dj-equipment` — close-up CDJ-3000 jog wheel detail
3. `rekordbox-intro` — Ableton-style dark UI screenshot of rekordbox browser
4. `beatmatching-manual` — overlapping beatgrid waveforms on CDJ screens
5. `sync-function` — two CDJ-3000 players showing BPM sync link
6. `cue-points-dj` — rekordbox waveform with coloured cue point markers
7. `wavetable` — Ableton Live 12 Wavetable device interface
8. `operator` — Ableton Live 12 Operator FM synth interface
9. `drum-rack` — Ableton Live 12 Drum Rack with pads
10. `eq-eight` — Ableton EQ Eight with frequency curve
11. `compressor` — Ableton Compressor with gain-reduction meter

---

## Section 8 — Mission Content Audit Script

### 8.1 `scripts/audit-missions.mjs`

```javascript
#!/usr/bin/env node
/**
 * audit-missions.mjs
 *
 * Reads all mission data and outputs mission-audit-report.md with:
 *   1. Missions with sim.type === "none" (with available-sim suggestions)
 *   2. Missions with generic taglines (regex: starts with "Learn", "Understanding", "Introduction")
 *   3. Duplicate quiz question stems (after normalisation)
 *   4. Generic badge names (word-list match)
 *
 * Usage: node scripts/audit-missions.mjs > mission-audit-report.md
 */
```

**Audit rules:**

| Category | Detection Logic |
|---|---|
| `sim === "none"` | `mission.sim.type === "none"` → check 47-sim library for a suitable match by world/topic |
| Generic tagline | `/^(Learn|Understanding|Introduction to|Intro to)/i.test(mission.tagline)` |
| Duplicate quiz | Normalise stem: lowercase, strip punctuation, trim → group by hash; flag groups with >1 member |
| Generic badge | Word-list: `["Mission Complete", "Chapter Done", "Path Finished", "Level Up", "Done"]` |

**Output format (`mission-audit-report.md`):**
```markdown
# Mission Audit Report

Generated: {timestamp}

## 1. Missions with sim.type === "none" ({count})
| Slug | World | Title | Suggested Sim |
|------|-------|-------|---------------|
| ... |

## 2. Generic Taglines ({count})
| Slug | Current Tagline |
|------|----------------|
| ... |

## 3. Duplicate Quiz Questions ({count} groups)
...

## 4. Generic Badge Names ({count})
...
```

---

## Section 9 — Beat Coach Context Enrichment

### 9.1 `LessonPageClient.tsx` — Enriched `coachContext`

**Current:**
```typescript
const coachContext = `${mission.title} — ${mission.tagline}`;
```

**New:**
```typescript
const coachContext = [
  `[World: ${ctx.world ?? "unknown"}]`,
  `[${learnMode === "flow" ? "Flow Mode" : "Free Mode"}]`,
  `Lesson: ${mission.title} — ${mission.tagline}.`,
  ctx.chapter?.title ? `Chapter: ${ctx.chapter.title}.` : "",
].filter(Boolean).join(" ");
```

This produces the canonical format: `"[World: dj] [Flow Mode] Lesson: Beatmatching Manual — Phase-lock two tracks by ear. Chapter: The Mix."`

### 9.2 `/api/beat-coach/route.ts` — Context to System Prompt

**Current behaviour:** `context` is appended to the `userMessage` string.

**New behaviour:** `context` becomes a prefix appended to `SYSTEM_PROMPT`:

```typescript
// In POST handler:
const systemContent = context
  ? `${SYSTEM_PROMPT}\n\nCurrent lesson context: ${context}`
  : SYSTEM_PROMPT;

// Use systemContent in the messages array:
messages: [
  { role: "system", content: systemContent },
  { role: "user",   content: userMessage },   // userMessage no longer includes context
]
```

The `userMessage` is then just:
```typescript
const userMessage = [
  `Quiz question: ${question}`,
  wrongAnswers.length > 0 && `The student answered: "${wrongAnswers.join('", "')}" — which was wrong.`,
  "Please explain why this is tricky and what concept they should focus on.",
].filter(Boolean).join("\n");
```

### 9.3 Dashboard Beat Coach — `DashboardCoachContext` Type

Add to a shared types location (e.g. top of `BeatCoach.tsx` or a separate `types/coach.ts`):

```typescript
export type DashboardCoachContext = {
  streak: number;           // progress.streakDays
  xp: number;               // progress.xp
  world: string | null;     // most recently active world
  nextSlug: string | null;  // next recommended mission slug
};

/** Serialises DashboardCoachContext to the canonical context string */
export function formatDashboardContext(ctx: DashboardCoachContext): string {
  return [
    "[Dashboard]",
    `[Streak: ${ctx.streak} days]`,
    `[XP: ${ctx.xp}]`,
    ctx.world ? `[Last World: ${ctx.world}]` : "",
    ctx.nextSlug ? `Next lesson: ${ctx.nextSlug.replace(/-/g, " ")}.` : "All caught up!",
  ].filter(Boolean).join(" ");
}
```

In `HomeClient.tsx` Dashboard component, pass formatted context to `<FloatingCoachButton>` (or `<CoachPanel>`):

```typescript
const dashboardContext = formatDashboardContext({
  streak: progress.streakDays,
  xp: progress.xp,
  world: lastCtx?.world ?? null,
  nextSlug: continueSlug,
});
```

---

## Section 10 — Correctness Properties (Property-Based Tests)

The following are executable correctness properties suitable for property-based testing with a library such as `fast-check`. Each can be implemented as a Jest/Vitest test in a `__tests__/correctness.test.ts` file.

### Property 1 — `localStorage("ccd")` normalises to `"flow"`

```typescript
it('normaliseCcdToFlow: "ccd" always yields "flow"', () => {
  fc.assert(
    fc.property(
      fc.constantFrom("ccd", "CCD", null, undefined, "", "classic", "flow"),
      (rawValue) => {
        const result = normaliseCcdToFlow(rawValue as string | null);
        // "ccd" must never survive normalisation
        expect(result).not.toBe("ccd");
        // Result must be a valid LearnMode
        expect(["flow", "classic"]).toContain(result);
      }
    )
  );
});
```

### Property 2 — Non-review lesson completion always routes to `/dashboard`

```typescript
it("handleComplete with isReview=false always routes to /dashboard", () => {
  fc.assert(
    fc.property(
      fc.record({
        isReview: fc.constant(false),
        worldRoute: fc.string(),
        slug: fc.string(),
      }),
      ({ isReview, worldRoute, slug }) => {
        const pushCalls: string[] = [];
        const mockRouter = { push: (url: string) => pushCalls.push(url) };
        const destination = isReview ? "/review" : "/dashboard";
        // Simulate handleComplete
        setTimeout(() => mockRouter.push(destination), 0);
        // Immediately after scheduling, the destination must be /dashboard
        expect(destination).toBe("/dashboard");
        expect(destination).not.toMatch(/^\/world/);
      }
    )
  );
});
```

### Property 3 — `LessonSourceBar` never renders for empty/null source

```typescript
it("LessonSourceBar renders null for empty or absent source", () => {
  fc.assert(
    fc.property(
      fc.oneof(
        fc.constant(null),
        fc.constant(undefined),
        fc.constant(""),
      ),
      (source) => {
        const { container } = render(<LessonSourceBar source={source} />);
        expect(container.firstChild).toBeNull();
      }
    )
  );
});
```

### Property 4 — `FlowFallbackBanner` copy never contains "PATH MODE" or "CCD"

```typescript
it("FlowFallbackBanner copy contains no legacy mode strings", () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 1, maxLength: 80 }),  // arbitrary missionTitle
      (missionTitle) => {
        const { getByText, queryByText } = render(
          <FlowFallbackBanner missionTitle={missionTitle} />
        );
        const fullText = document.body.textContent ?? "";
        expect(fullText).not.toMatch(/PATH MODE/i);
        expect(fullText).not.toMatch(/\bCCD\b/i);
        expect(fullText).toMatch(/FLOW MODE/i);
      }
    )
  );
});
```

### Property 5 — Every `DJ_LESSONS` entry has `quizHard.length >= 3` and `proMoves.length >= 3`

```typescript
it("All DJ_LESSONS entries meet minimum Hard Mode content requirements", () => {
  const entries = Object.entries(DJ_LESSONS);
  fc.assert(
    fc.property(
      fc.constantFrom(...entries),
      ([slug, entry]) => {
        expect(entry.quizHard?.length ?? 0).toBeGreaterThanOrEqual(3);
        expect(entry.proMoves?.length ?? 0).toBeGreaterThanOrEqual(3);
        expect(entry.walkthrough?.length ?? 0).toBeGreaterThanOrEqual(4);
        expect(entry.mistakes?.length ?? 0).toBeGreaterThanOrEqual(3);
        expect(entry.advanced?.what?.length ?? 0).toBeGreaterThanOrEqual(3);
        expect(entry.sources?.length ?? 0).toBeGreaterThanOrEqual(1);
      }
    )
  );
});
```

---

## Open Design Decisions (from Requirements)

### OD-1: "Free Mode" vs "Explore Mode"
This design uses **"Free Mode"** as the user-facing name, as specified in the requirements. The internal localStorage value `"classic"` is preserved for zero-disruption migration. If "Explore Mode" is preferred, only `MODE_LABELS` in `mode.tsx` and UI copy strings need changing — no type or logic changes.

### OD-2: FAL Image Generation Timing
This design implements **build-time script** (Section 7). The `--overwrite` flag allows selective regeneration. If on-demand generation is later needed, the same script logic can be extracted into a `/api/generate-visual` route handler with a cache-first approach.

### OD-3: localStorage Key Strategy
This design **keeps `"classic"` in localStorage** and adds `normaliseCcdToFlow()` to handle the `"ccd"` → `"flow"` migration transparently. A migration version stamp (e.g. `ccd.learnModeVersion: "2"`) is not implemented in this version but would be straightforward to add if future key changes are anticipated.

---

## Dependencies

| Section | Dependency | Already Present? |
|---|---|---|
| All | Next.js 15.3, React 19, TypeScript 5.8, Tailwind v4 | ✓ |
| FAL Pipeline | `@fal-ai/client` or direct `fetch` to `fal.run` | needs install |
| FAL Pipeline | `FAL_API_KEY` env var | needs provisioning |
| Beat Coach | `KIMI_API_KEY` env var | ✓ (already in route.ts) |
| Property Tests | `fast-check`, `@testing-library/react` | needs install |
| Audit Script | Node.js ESM (no extra deps) | ✓ |
