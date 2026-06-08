# Implementation Plan: CCD.SCHOOL Launch-Readiness

## Overview

This plan converts the launch-readiness design into 22 discrete coding tasks across 6 phases. Each task identifies the exact files to touch, the requirement(s) it satisfies, a clear acceptance condition, and its upstream dependencies. Tasks within a phase may be executed in parallel unless a dependency is listed. The property-based test tasks in Phase 6 require the implementation of Phases 1–5 to be complete.

All code lives under `artifacts/ccd-school/` inside the repository root.

---

## Tasks

### Phase 1 — Foundation (no upstream dependencies, do first)

- [ ] T1. Rename `LearnMode` type and add `normaliseCcdToFlow()` in `lib/mode.ts`
  - Update `LearnMode` type: `"classic" | "ccd"` → `"flow" | "classic"`
  - Implement `normaliseCcdToFlow(raw: string | null): LearnMode` — maps `"ccd"` → `"flow"`, `"classic"` → `"classic"`, anything else → `"flow"`
  - Update `getInitialMode()` to call `normaliseCcdToFlow`, write-back immediately if value changed (`localStorage.setItem`)
  - Change `LearnModeContext` default value from `"ccd"` to `"flow"`
  - Update `MODE_LABELS` record: key `"ccd"` → `"flow"`, set `name: "Flow Mode"`, `icon: "🌊"`, `tagline: "Sequential · Hearts on · XP gated"`; update `"classic"` entry to `name: "Free Mode"`, `icon: "🔓"`, `tagline: "All open · No hearts · Jump anywhere"`
  - Files: `artifacts/ccd-school/src/lib/mode.tsx` (or `mode.ts`)
  - _Requirements: 1.3, 1.4, 1.6, 9.1, 9.2, 9.3, 9.4, 9.6, 9.7_
  - **Acceptance:** `normaliseCcdToFlow("ccd")` returns `"flow"`. `normaliseCcdToFlow("classic")` returns `"classic"`. `normaliseCcdToFlow(null)` returns `"flow"`. TypeScript type `LearnMode` is `"flow" | "classic"`. Default context value is `"flow"`. No compile errors.
  - **Dependencies:** none

- [ ] T2. Grep-replace all `learnMode === "ccd"` comparisons across 8 component files
  - Replace every occurrence of `learnMode === "ccd"` with `learnMode === "flow"` in:
    - `artifacts/ccd-school/src/components/LessonPageClient.tsx` — `if (learnMode === "ccd")` + `// ── PATH MODE ──` comment → `// ── FLOW MODE ──`
    - `artifacts/ccd-school/src/components/LessonPlayer.tsx` — `const isPathMode = learnMode === "ccd"` → `const isFlowMode = learnMode === "flow"` (update all downstream uses of `isPathMode` variable to `isFlowMode`)
    - `artifacts/ccd-school/src/components/InlineClassicLesson.tsx` — `learnMode !== "ccd"` → `learnMode !== "flow"`
    - `artifacts/ccd-school/src/components/Header.tsx` — all `"ccd"` mode comparisons
    - `artifacts/ccd-school/src/components/WorldPathClient.tsx` — all `learnMode === "ccd"` guards
    - `artifacts/ccd-school/src/components/OnboardingFlow.tsx` — mode description references
    - `artifacts/ccd-school/src/components/HeartsWall.tsx` — mode comparisons
    - `artifacts/ccd-school/src/components/CompletionModal.tsx` — mode-label references
  - Also replace any string literals `"ccd"` used as mode identifiers in aria-labels, CSS class conditions, and template literals across these files
  - Files: the 8 files listed above
  - _Requirements: 9.3, 9.4, 9.5_
  - **Acceptance:** `grep -r '"ccd"' artifacts/ccd-school/src/` returns zero results related to mode comparisons. All 8 files compile without TypeScript errors. Existing tests pass.
  - **Dependencies:** T1

- [ ] T3. Update all user-facing copy to "Flow Mode" / "Free Mode" across UI components
  - **Header.tsx ModeTogglePill:** pill shows `"🌊 FLOW"` with `bg-acid text-ink` when `learnMode === "flow"`; shows `"🔓 FREE"` with `bg-bone text-ink` when `learnMode === "classic"`
  - **Header.tsx toast messages:** switch-to-Flow toast: `"🌊 FLOW MODE — locked in, hearts on, sequential"`; switch-to-Free toast: `"🔓 FREE MODE — all lessons open"`
  - **Header.tsx mobile drawer:** labels `"FLOW MODE"` / `"FREE MODE"`; Flow subtitle: `"Sequential · earn XP · hearts on"`; Free subtitle: `"All open · no hearts · Normal or Hard"`
  - **InlineClassicLesson.tsx mode badge:** `"🌊 Flow Mode"` / `"🔓 Free Mode"` replacing any `"Explore Mode"`, `"Path Mode"`, or `"CCD Mode"` strings
  - **HeartsWall.tsx:** replace all `"PATH MODE"` / `"CCD Mode"` references with `"Flow Mode"`
  - **LessonPlayer.tsx HeartsExplainerModal:** `"🌊 FLOW MODE HEARTS"` replacing `"🗺 PATH MODE HEARTS"` (or equivalent)
  - **CompletionModal.tsx:** replace any `"PATH MODE"` / `"CCD Mode"` with `"Flow Mode"`
  - **OnboardingFlow.tsx:** mode selection step uses `"Flow Mode"` and `"Free Mode"` with updated descriptions
  - **XpStreakPopover (wherever it lives):** replace `"Each wrong answer in PATH MODE costs 1 heart"` → `"Each wrong answer in Flow Mode costs 1 heart"`
  - **README.md:** replace all instances of `"CCD Mode"`, `"PATH MODE"`, `"Path Mode"`, `"Classic Mode"`, `"Explore Mode"`, `"Explorer Mode"` with `"Flow Mode"` or `"Free Mode"` as appropriate
  - Files: `Header.tsx`, `InlineClassicLesson.tsx`, `HeartsWall.tsx`, `LessonPlayer.tsx`, `CompletionModal.tsx`, `OnboardingFlow.tsx`, `XpStreakPopover.tsx` (or wherever popover copy lives), `README.md`
  - _Requirements: 1.1, 1.2, 1.6, 1.7, 1.8, 1.10, 1.11, 1.12, 1.13, 10.4, 10.5, 10.7, 10.8_
  - **Acceptance:** `grep -ri "path mode\|ccd mode\|explore mode\|explorer mode" artifacts/ccd-school/src/` returns zero results in user-facing strings. All mode pills, toasts, drawer labels, and modal copy match the specified strings exactly. README has no legacy mode names.
  - **Dependencies:** T2

- [ ] T4. Rename `CcdFallbackBanner` → `FlowFallbackBanner` with updated copy in `LessonPageClient.tsx`
  - Rename the component function from `CcdFallbackBanner` to `FlowFallbackBanner`
  - Update the component body copy:
    - Header line: `"FLOW MODE — Explore Format"`
    - Body: `"This lesson uses the scrolling format. Complete the quiz to unlock the next lesson and earn your XP."`
    - Leading icon: `🌊`
    - Chips: `"✓ Full content"`, `"✓ Interactive sim"`, `"✓ Quiz + XP"`
  - Update the call-site in `LessonPageClient.tsx` from `<CcdFallbackBanner …>` to `<FlowFallbackBanner …>`
  - Files: `artifacts/ccd-school/src/components/LessonPageClient.tsx`
  - _Requirements: 1.9, 10.3_
  - **Acceptance:** No `CcdFallbackBanner` identifier exists anywhere in the codebase. `FlowFallbackBanner` renders with correct copy. No "PATH MODE" or "CCD" text appears inside the rendered banner.
  - **Dependencies:** T2

---

### Phase 2 — UX Fixes (depends on Phase 1 completion)

- [ ] T5. `handleComplete` in `LessonPageClient.tsx` → redirect to `/dashboard` (except review flow)
  - Replace `setTimeout(() => router.push(worldRoute), 2200)` with:
    ```typescript
    const destination = isReview ? "/review" : "/dashboard";
    setTimeout(() => router.push(destination), 2200);
    ```
  - Verify `isReview` is set from `useSearchParams().get("review") === "1"` — add this if not already present
  - The `worldRoute` variable must remain (used for the back-button `✕` exit in `LessonPlayer`) — do NOT remove it
  - Files: `artifacts/ccd-school/src/components/LessonPageClient.tsx`
  - _Requirements: 2.1, 2.2, 2.3_
  - **Acceptance:** After lesson completion (non-review), `router.push` is called with `"/dashboard"` after ~2200 ms. After completion when `?review=1` is in the URL, `router.push` is called with `"/review"`. The `✕` back-button still navigates to `worldRoute`.
  - **Dependencies:** T4

- [ ] T6. `HomeClient.tsx` returning-user redirect → `router.replace("/dashboard")` with `return null` guard
  - Replace the existing conditional render of `<Dashboard />` (or equivalent) with a `useEffect`-based redirect:
    ```typescript
    const shouldRedirect = !!(user || hasMissions || progress.onboardingDone);
    useEffect(() => {
      if (shouldRedirect) router.replace("/dashboard");
    }, [shouldRedirect, router]);
    if (shouldRedirect) return null;
    ```
  - `hasMissions` = `Object.keys(progress.completedMissions).length > 0`
  - Use `router.replace` not `router.push` (no `/` in history stack)
  - Return `null` while redirecting to prevent Landing page flash
  - Files: `artifacts/ccd-school/src/components/HomeClient.tsx`
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 10.9_
  - **Acceptance:** Visiting `/` with `onboardingDone: true` in localStorage triggers `router.replace("/dashboard")` and renders nothing in between. Visiting `/` with no localStorage state shows the landing/onboarding flow. `router.replace` (not `router.push`) is used.
  - **Dependencies:** T1 (needs mode.ts updated; no direct dep on T2–T4 but should run after Phase 1 is stable)

- [ ] T7. Create `src/components/LessonSourceBar.tsx`
  - Create new file with the `LessonSourceBar` component:
    ```tsx
    "use client";
    interface Props { source: string | null | undefined; }
    export function LessonSourceBar({ source }: Props) {
      if (!source) return null;
      return (
        <div className="brutal-border bg-bone px-4 py-2 mt-4" aria-label="Content source citation">
          <span className="font-mono text-[10px] uppercase opacity-60">
            📄 SOURCE: {source}
          </span>
        </div>
      );
    }
    ```
  - The component must:
    - Return `null` for empty string, `null`, and `undefined` source values
    - Render the `brutal-border bg-bone` container with `font-mono text-[10px] uppercase opacity-60` text
    - Include `aria-label="Content source citation"` on the outer div
    - Be exported as a named export
  - Files: `artifacts/ccd-school/src/components/LessonSourceBar.tsx` (new file)
  - _Requirements: 3.1, 3.4, 3.5, 3.7_
  - **Acceptance:** Component file exists and exports `LessonSourceBar`. Renders `null` for `null`/`undefined`/`""`. Renders `📄 SOURCE: {text}` for non-empty strings. `aria-label` present. No TypeScript errors.
  - **Dependencies:** T1 (stable type environment)

- [ ] T8. Wire `LessonSourceBar` into `InlineClassicLesson.tsx` (after quiz, before next-lesson CTA)
  - Import `LessonSourceBar` from `./LessonSourceBar`
  - Resolve `ctx` using `getMissionContext(m.slug)` (already present at top of component — verify or add)
  - Insert `<LessonSourceBar source={ctx?.path?.source} />` after the `QUICK QUIZ` section and before the `NEXT LESSON →` CTA
  - Files: `artifacts/ccd-school/src/components/InlineClassicLesson.tsx`
  - _Requirements: 3.2, 3.4, 3.6_
  - **Acceptance:** In a lesson whose parent `LearningPath` has a non-empty `source` field, the `LessonSourceBar` div appears below the quiz and above the next-lesson link. For a lesson with no `source` on its path, nothing renders in that position (no empty div, no "SOURCE:" label).
  - **Dependencies:** T7

- [ ] T9. Wire `LessonSourceBar` into `LessonPlayer.tsx` `SummaryScreen` (after learned-bullets list)
  - In `LessonPlayerInner` (or wherever mission slug and path are in scope), resolve source:
    ```typescript
    const ctx = getMissionContext(mission.slug);
    const sourceStr = ctx?.path?.source ?? null;
    ```
  - Pass `source={sourceStr}` as a new prop to `SummaryScreen`
  - Inside `SummaryScreen`, after the "YOU LEARNED" bullets list, add: `{source && <LessonSourceBar source={source} />}`
  - Import `LessonSourceBar` in `LessonPlayer.tsx`
  - Files: `artifacts/ccd-school/src/components/LessonPlayer.tsx`
  - _Requirements: 3.3, 3.4, 3.6_
  - **Acceptance:** On the `LessonPlayer` summary screen, `LessonSourceBar` appears below the learned-bullets list when the mission's parent path has a `source` value. When `source` is absent, nothing extra renders. No TypeScript errors.
  - **Dependencies:** T7

---

### Phase 3 — Content (T10 and T11 can be parallelised with each other)

- [ ] T10. Complete `lesson-deep-dj.ts` — all 40 DJ World missions with Hard Mode content
  - Ensure `DJ_LESSONS` in `artifacts/ccd-school/src/content/lesson-deep-dj.ts` contains a `LessonDeep` entry for every one of the 40 DJ World mission slugs:
    - Chapter 1 `setup-and-culture`: `what-is-djing`, `dj-equipment`, `rekordbox-intro`, `dj-culture-history`, `dj-ethics-sets`, `dj-software-overview`, `dj-hardware-tour`, `dj-setup-flow`
    - Chapter 2 `the-library`: `importing-music`, `beatgrid-analysis`, `cue-points-dj`, `memory-cues`, `playlists-collections`, `hot-cues-performance`, `rekordbox-export`, `smart-playlists`
    - Chapter 3 `the-mix-dj`: `beatmatching-manual`, `eq-mixing`, `sync-function`, `phrasing-structure`, `transition-techniques`, `mixing-in-key`, `volume-headroom`, `looping-mixing`
    - Chapter 4 `dj-performance`: `reading-the-crowd`, `set-planning`, `cdj-3000-deep`, `djm-a9-deep`, `effects-performance`, `rekordbox-performance-mode`, `stems-djing`, `live-remix`
    - Chapter 5 `dj-mastery`: `mastering-transitions`, `b2b-djing`, `festival-tech-rider`, `streaming-djing`, `label-demos`, `dj-career`, `digital-vinyl`, `dj-production-crossover`
  - Each entry **must** satisfy per the design spec:
    - `advanced.what`: ≥ 3 paragraphs, each citing a specific rekordbox 6.0.0 manual section, Pioneer hardware model (CDJ-3000, DJM-A9, DJM-900NXS2), or verifiable DJ practice
    - `quizHard`: ≥ 3 questions requiring source-material knowledge (not inferrable by common knowledge)
    - `proMoves`: ≥ 3 actionable professional DJ tips
    - `walkthrough`: ≥ 4 steps, each with a `do` action and specific `listen` result
    - `mistakes`: ≥ 3 specific real DJ mistakes (not generic)
    - `sources`: ≥ 1 entry with non-empty `label` (`"rekordbox 6.0.0 Instruction Manual"`, `"Pioneer CDJ-3000 Multi Player Operating Instructions"`, or `"Pioneer DJM-A9 4-channel DJ Mixer Operating Instructions"`) and non-empty `section`
  - Files: `artifacts/ccd-school/src/content/lesson-deep-dj.ts`
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 11.1_
  - **Acceptance:** `Object.keys(DJ_LESSONS).length === 40`. Every entry passes the field-count checks: `quizHard.length >= 3`, `proMoves.length >= 3`, `walkthrough.length >= 4`, `mistakes.length >= 3`, `advanced.what.length >= 3`, `sources.length >= 1`, and `sources[0].label !== ""` and `sources[0].section !== ""`. File compiles with no TypeScript errors.
  - **Dependencies:** T1 (stable types)

  - [ ]* T10.1 Write property tests for `DJ_LESSONS` content requirements
    - **Property 5: All DJ_LESSONS entries meet minimum Hard Mode content thresholds**
    - **Validates: Requirements 5.1–5.8**
    - See design Section 10, Property 5

- [ ] T11. Complete `lesson-deep-synths.ts` — all 18 Synthesis missions with Hard Mode content
  - Ensure `SYNTHS_LESSONS` in `artifacts/ccd-school/src/content/lesson-deep-synths.ts` contains a `LessonDeep` entry for all 18 Synthesis mission slugs:
    - Path `synth-sound`: `what-is-synthesis`, `oscillators`, `waveforms-synth`, `subtractive-basics`, `additive-synthesis`, `wavetable-ableton`
    - Path `synth-shaping`: `filters-synth`, `filter-types`, `envelopes-adsr`, `lfo-basics`, `modulation-matrix`, `wavetable-operator`
    - Path `synth-movement`: `fm-synthesis`, `am-synthesis`, `granular-basics`, `vocoder-basics`, `drift-ableton`, `sound-design-workflow`
  - Each entry **must** satisfy:
    - `advanced.what`: ≥ 3 paragraphs referencing `learningsynths.ableton.com` chapters and/or Ableton Live 12 instrument names (Wavetable, Operator, Drift)
    - `quizHard`: ≥ 3 engineering-level questions (filter slopes in dB/oct, FM carrier:modulator ratios, ADSR stage behaviours, harmonic series)
    - `proMoves`: ≥ 3 professional sound-design tips a working producer would use
    - `walkthrough`: ≥ 4 steps with specific parameter values (e.g. `"set filter cutoff to 800 Hz"`, `"ADSR: A=10ms D=200ms S=50% R=400ms"`)
    - `mistakes`: ≥ 3 specific synthesis mistakes
    - `sources`: ≥ 1 entry citing `learningsynths.ableton.com` with specific chapter as `section`; Ableton Live 12 manual cited for instrument-specific entries
  - Files: `artifacts/ccd-school/src/content/lesson-deep-synths.ts`
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 11.4_
  - **Acceptance:** `Object.keys(SYNTHS_LESSONS).length === 18`. Every entry passes: `quizHard.length >= 3`, `proMoves.length >= 3`, `walkthrough.length >= 4`, `mistakes.length >= 3`, `advanced.what.length >= 3`, `sources.length >= 1`. At least one `sources[0].section` contains a `learningsynths.ableton.com` chapter path. File compiles.
  - **Dependencies:** T1 (stable types)

- [ ] T12. Create `scripts/audit-missions.mjs`, run it, and apply fixes to flagged missions
  - **Step A — Create the script** at `artifacts/ccd-school/scripts/audit-missions.mjs`:
    - Import all mission data (dynamically or via a compiled JSON dump)
    - Implement 4 audit checks:
      1. `sim.type === "none"` — list missions with no sim; suggest a sim from the 47-sim library by world/topic match
      2. Generic taglines — regex `/^(Learn|Understanding|Introduction to|Intro to)/i` flags taglines; output slug + current tagline
      3. Duplicate quiz questions — normalise stems (lowercase, strip punctuation), group by content hash, flag groups with >1 member
      4. Generic badge names — word-list match against `["Mission Complete", "Chapter Done", "Path Finished", "Level Up", "Done"]`
    - Write output to `mission-audit-report.md` in the format specified in design Section 8
    - Usage: `node scripts/audit-missions.mjs > mission-audit-report.md`
  - **Step B — Apply fixes** based on the report output:
    - Update generic taglines to specific, content-describing alternatives
    - Resolve duplicate quiz questions by writing distinct questions for each affected mission
    - Update generic badge names to thematic alternatives (e.g. `"Beat Architect"`, `"Harmonic Mixer"`)
    - Wire any recommended sim upgrades (where `sim.type === "none"` and a suitable sim clearly exists)
  - Files: `artifacts/ccd-school/scripts/audit-missions.mjs` (new), `mission-audit-report.md` (generated), plus mission data files as needed
  - _Requirements: 7.1, 7.5, 7.6, 7.7, 7.8_
  - **Acceptance:** `audit-missions.mjs` runs without error with `node scripts/audit-missions.mjs`. `mission-audit-report.md` is generated with the four sections. After fixes are applied: zero generic taglines matching the regex, zero duplicate quiz stems, zero generic badge names from the word-list.
  - **Dependencies:** T10, T11 (content must be stable before auditing)

---

### Phase 4 — FAL Pipeline

- [ ] T13. Add `"fal-image"` visual type to `types.ts`
  - In the concept-screen member of the `LessonScreen` union in `artifacts/ccd-school/src/content/types.ts`:
    - Extend the `visual?:` union to include `| "fal-image"`
    - Add `imageUrl?: string` field alongside it (only used when `visual === "fal-image"`)
  - Confirm no other types in the file need updating (check `LessonVisuals` prop types too)
  - Files: `artifacts/ccd-school/src/content/types.ts`
  - _Requirements: 8.1, 8.3_
  - **Acceptance:** `types.ts` compiles. A concept screen object with `visual: "fal-image"` and `imageUrl: "/generated/foo.webp"` passes TypeScript type checking. No existing visual types are broken.
  - **Dependencies:** T1

- [ ] T14. Add `FalImage` renderer to `LessonVisuals.tsx`
  - Import React `useState` (if not already imported)
  - Add a `FalImage` sub-component:
    ```tsx
    function FalImage({ url, alt }: { url?: string; alt?: string }) {
      const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
      if (!url) return null;
      return (
        <div className="brutal-border overflow-hidden bg-ink/10 relative min-h-[200px]">
          {status === "loading" && <div className="absolute inset-0 bg-ink/10 animate-pulse" aria-hidden />}
          {status === "error" && <div className="absolute inset-0 flex items-center justify-center font-mono text-xs opacity-40">[image unavailable]</div>}
          <img
            src={url} alt={alt ?? "Lesson visual"} loading="lazy"
            className={`w-full max-w-[600px] mx-auto block object-contain transition-opacity duration-300 ${status === "loaded" ? "opacity-100" : "opacity-0"}`}
            style={{ maxHeight: "360px" }}
            onLoad={() => setStatus("loaded")}
            onError={() => setStatus("error")}
          />
        </div>
      );
    }
    ```
  - In the existing `InlineVisual` (or equivalent switch/conditional), add a branch: `if (type === "fal-image") return <FalImage url={screen.imageUrl} alt={screen.title} />;`
  - Files: `artifacts/ccd-school/src/components/LessonVisuals.tsx`
  - _Requirements: 8.3, 8.4, 8.7_
  - **Acceptance:** A concept screen with `visual: "fal-image"` and a valid `imageUrl` renders an `<img>` with `loading="lazy"`, `max-width: 600px`, `object-fit: contain`. A missing/failed `imageUrl` renders the error state `[image unavailable]` without crashing. A loading skeleton appears while the image loads.
  - **Dependencies:** T13

- [ ] T15. Create `fal-image-priority.md` with 11 priority entries and draft prompts
  - Create the file at `artifacts/ccd-school/fal-image-priority.md`
  - Include exactly 11 entries in the format `- {missionSlug} | {screenIndex} | {prompt}`:
    1. `what-is-djing` | `1` | Photorealistic Pioneer CDJ-3000 and DJM-A9 mixer on a club DJ booth, neutral dark studio background, no text overlay, high detail, professional photography
    2. `dj-equipment` | `1` | Close-up of Pioneer CDJ-3000 jog wheel showing platter detail and display screen, neutral dark background, no text overlay, photorealistic
    3. `rekordbox-intro` | `1` | Dark UI screenshot style illustration of rekordbox software browser panel showing waveforms and track library, no text overlay, high fidelity
    4. `beatmatching-manual` | `1` | Two CDJ-3000 screens side by side showing overlapping beatgrid waveforms at matched BPM, neutral studio background, photorealistic, no text overlay
    5. `sync-function` | `1` | Two Pioneer CDJ-3000 players showing MASTER and SLAVE sync link indicator glowing, dark club booth, no text overlay, photorealistic
    6. `cue-points-dj` | `1` | rekordbox waveform display with multiple coloured cue point markers (red, blue, green, yellow) visible on the waveform, dark background, no text overlay, illustration style
    7. `wavetable` | `1` | Ableton Live 12 Wavetable synthesizer device interface, dark theme, all parameters visible, no text overlay, high fidelity UI illustration
    8. `operator` | `1` | Ableton Live 12 Operator FM synthesizer interface showing four operators and routing matrix, dark theme, no text overlay, high fidelity UI illustration
    9. `drum-rack` | `1` | Ableton Live 12 Drum Rack device with 16 pads loaded, dark theme, sample names visible, no text overlay, UI illustration
    10. `eq-eight` | `1` | Ableton Live 12 EQ Eight device with a frequency response curve showing a high shelf boost and mid cut, dark theme, no text overlay, UI illustration
    11. `compressor` | `1` | Ableton Live 12 Compressor device with gain-reduction meter active, attack and release knobs prominent, dark theme, no text overlay, UI illustration
  - Files: `artifacts/ccd-school/fal-image-priority.md` (new file)
  - _Requirements: 8.5, 8.6, 8.9, 8.10_
  - **Acceptance:** File exists with exactly 11 entries. All 6 DJ World equipment slugs are covered (`what-is-djing`, `dj-equipment`, `rekordbox-intro`, `beatmatching-manual`, `sync-function`, `cue-points-dj`). All 5 Producer instrument slugs are covered (`wavetable`, `operator`, `drum-rack`, `eq-eight`, `compressor`). Every prompt specifies "no text overlay" and "neutral/dark background".
  - **Dependencies:** T13

- [ ] T16. Create `scripts/generate-fal-images.mjs` build-time script
  - Create `artifacts/ccd-school/scripts/generate-fal-images.mjs` implementing:
    - Reads `fal-image-priority.md` and parses lines matching `- {slug} | {index} | {prompt}`
    - For each entry: constructs output path `public/generated/{slug}-{index}.webp`
    - Skips existing files unless `--overwrite` flag is passed
    - Calls FAL.ai API at `https://fal.run/fal-ai/flux/dev` with `Authorization: Key ${FAL_API_KEY}` header
    - Request body: `{ prompt, image_size: "landscape_4_3", num_inference_steps: 28, output_format: "webp", enable_safety_checker: true }`
    - Downloads the returned image URL and writes buffer to `OUT_DIR`
    - Supports `--dry-run` flag (log prompts, skip API call)
    - Exits with code 1 on unrecoverable errors
    - `FAL_API_KEY` read only from `process.env.FAL_API_KEY` — never hardcoded
  - Ensure `public/generated/` directory is created if absent (`fs.mkdirSync(OUT_DIR, { recursive: true })`)
  - Files: `artifacts/ccd-school/scripts/generate-fal-images.mjs` (new file), `artifacts/ccd-school/public/generated/` (directory, add `.gitkeep`)
  - _Requirements: 8.1, 8.2, 8.6, 8.7, 8.8_
  - **Acceptance:** `node scripts/generate-fal-images.mjs --dry-run` runs without error and logs each of the 11 prompts. `FAL_API_KEY` is never a string literal in the file. `--overwrite` and `--dry-run` flags work correctly. Script does not use `import` from any application source files (standalone Node.js ESM only).
  - **Dependencies:** T15

- [ ] T17. Wire FAL images into mission `screens` data for the 11 priority missions
  - For each of the 11 missions in `fal-image-priority.md`, locate the relevant concept screen in the mission data files and update:
    - Set `visual: "fal-image"`
    - Set `imageUrl: "/generated/{slug}-{screenIndex}.webp"` (the static path where the build script outputs)
  - The 11 missions span DJ World and Producer world — locate each in the appropriate data files (e.g. `lesson-deep-dj.ts`, producer mission files)
  - If `imageUrl` field does not exist on the concept screen type yet, verify T13 has added it
  - Files: DJ World and Producer mission data files (locate by slug), potentially `artifacts/ccd-school/src/content/missions/` or similar
  - _Requirements: 8.9, 8.10_
  - **Acceptance:** For each of the 11 priority slugs, the first concept screen (or the screen at the specified `screenIndex`) has `visual: "fal-image"` and `imageUrl: "/generated/{slug}-1.webp"`. TypeScript compiles. Existing other screens are unaffected.
  - **Dependencies:** T14, T15, T16

---

### Phase 5 — Beat Coach & Source Verification

- [ ] T18. Enrich `coachContext` string in `LessonPageClient.tsx` with world/mode/chapter
  - Locate the `coachContext` variable (currently `\`${mission.title} — ${mission.tagline}\`` or similar)
  - Replace with the canonical format:
    ```typescript
    const ctx = getMissionContext(mission.slug); // already present or add it
    const coachContext = [
      `[World: ${ctx?.world ?? "unknown"}]`,
      `[${learnMode === "flow" ? "Flow Mode" : "Free Mode"}]`,
      `Lesson: ${mission.title} — ${mission.tagline}.`,
      ctx?.chapter?.title ? `Chapter: ${ctx.chapter.title}.` : "",
    ].filter(Boolean).join(" ");
    ```
  - Resulting format example: `"[World: dj] [Flow Mode] Lesson: Beatmatching Manual — Phase-lock two tracks by ear. Chapter: The Mix."`
  - Files: `artifacts/ccd-school/src/components/LessonPageClient.tsx`
  - _Requirements: 12.1, 12.4_
  - **Acceptance:** `coachContext` string matches the format `"[World: X] [Y Mode] Lesson: T — G. Chapter: C."`. The string never contains `"ccd"` or `"PATH MODE"`. Both Flow Mode and Free Mode labels produce the correct bracketed string.
  - **Dependencies:** T2 (learnMode uses `"flow"`)

- [ ] T19. Move context to system prompt in `/api/beat-coach/route.ts`
  - In the POST handler of `artifacts/ccd-school/app/api/beat-coach/route.ts`:
    - Extract `context` from the request body
    - Build `systemContent`:
      ```typescript
      const systemContent = context
        ? `${SYSTEM_PROMPT}\n\nCurrent lesson context: ${context}`
        : SYSTEM_PROMPT;
      ```
    - Use `systemContent` as the `content` of the `{ role: "system" }` message
    - Remove `context` from the user message string (user message should only be the quiz question + wrong answers + explanation request)
    - New user message format:
      ```typescript
      const userMessage = [
        `Quiz question: ${question}`,
        wrongAnswers.length > 0 && `The student answered: "${wrongAnswers.join('", "')}" — which was wrong.`,
        "Please explain why this is tricky and what concept they should focus on.",
      ].filter(Boolean).join("\n");
      ```
  - Files: `artifacts/ccd-school/app/api/beat-coach/route.ts`
  - _Requirements: 12.2_
  - **Acceptance:** The Kimi API `messages` array has `[{ role: "system", content: SYSTEM_PROMPT + "\n\nCurrent lesson context: ..." }, { role: "user", content: "Quiz question: ..." }]`. Context does NOT appear in the user message. Existing functionality (question answering) is preserved.
  - **Dependencies:** T18

- [ ] T20. Wire Dashboard Beat Coach context using `formatDashboardContext()`
  - Add `DashboardCoachContext` type and `formatDashboardContext()` function (from design Section 9.3) — place in `artifacts/ccd-school/src/types/coach.ts` (new file) or at the top of `BeatCoach.tsx`
  - In `DashboardClient.tsx` (or wherever the dashboard renders `<FloatingCoachButton>` / `<CoachPanel>`), compute:
    ```typescript
    const dashboardContext = formatDashboardContext({
      streak: progress.streakDays,
      xp: progress.xp,
      world: lastCtx?.world ?? null,
      nextSlug: continueSlug,
    });
    ```
  - Pass `dashboardContext` as the `context` prop to the coach component
  - Files: `artifacts/ccd-school/src/components/DashboardClient.tsx`, `artifacts/ccd-school/src/types/coach.ts` (new) or `BeatCoach.tsx`
  - _Requirements: 12.3_
  - **Acceptance:** When Beat Coach is opened from the dashboard, the `context` sent to `/api/beat-coach` contains `[Dashboard]`, `[Streak: N days]`, `[XP: N]`, and either `[Last World: X]` or `Next lesson: {slug}`. TypeScript compiles.
  - **Dependencies:** T19

- [ ] T21. Audit and update `LearningPath.source` fields in `paths.ts` — ensure all 32 paths have specific chapter citations
  - Open `artifacts/ccd-school/src/content/paths.ts` (or wherever `LearningPath[]` is defined)
  - For every path, verify `source` field is non-empty and specific (not just `"Ableton Live 12 Reference Manual"` without a chapter):
    - **DJ World paths:** must cite `"rekordbox 6.0.0 Instruction Manual"` with a specific chapter/page range
    - **Fundamentals paths:** must cite `"learningmusic.ableton.com"` with a specific section URL path
    - **Producer world non-Synthesis paths:** must cite `"Ableton Live 12 Reference Manual — Chapter {N}: {Title}"`
    - **Synthesis paths:** must cite `"learningsynths.ableton.com"` with a specific chapter slug
  - Update any generic or missing `source` values to meet the standard above
  - Files: `artifacts/ccd-school/src/content/paths.ts` (or equivalent)
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_
  - **Acceptance:** Every `LearningPath` object has a non-empty `source` field. No `source` value is just `"Ableton Live 12 Reference Manual"` without a chapter name. No `source` value is just `"rekordbox"` or a bare URL without a section. `paths.ts` compiles.
  - **Dependencies:** T1 (stable type env); can be parallelised with T18–T20

---

### Phase 6 — Property Tests

- [ ] T22. Write 5 correctness property tests in `tests/correctness.test.ts` using `fast-check`
  - [ ] T22.1 Property 1 — `normaliseCcdToFlow` never returns `"ccd"` for any input
    - **Property 1: `localStorage("ccd")` normalises to `"flow"`**
    - **Validates: Requirements 1.3, 1.4, 9.1, 9.3**
    - Test that for all inputs from `fc.constantFrom("ccd", "CCD", null, undefined, "", "classic", "flow")`, `normaliseCcdToFlow()` returns a value that is not `"ccd"` and is within `["flow", "classic"]`
  - [ ] T22.2 Property 2 — Non-review lesson completion always routes to `/dashboard`
    - **Property 2: `handleComplete` with `isReview=false` always routes to `/dashboard`**
    - **Validates: Requirements 2.1, 2.3**
    - Test that `destination = isReview ? "/review" : "/dashboard"` with `isReview=false` always equals `"/dashboard"` regardless of any other prop
  - [ ] T22.3 Property 3 — `LessonSourceBar` renders null for empty/absent source
    - **Property 3: `LessonSourceBar` never renders for empty or absent source**
    - **Validates: Requirements 3.5, 3.7**
    - Using `@testing-library/react`, render `<LessonSourceBar source={source} />` for `source ∈ {null, undefined, ""}` — assert `container.firstChild === null` for all three
  - [ ] T22.4 Property 4 — `FlowFallbackBanner` copy never contains legacy mode strings
    - **Property 4: `FlowFallbackBanner` copy contains no "PATH MODE" or "CCD"**
    - **Validates: Requirements 1.9, 10.3**
    - For arbitrary `missionTitle` strings (`fc.string({ minLength: 1, maxLength: 80 })`), render `<FlowFallbackBanner missionTitle={missionTitle} />` and assert `document.body.textContent` does not match `/PATH MODE/i` or `/\bCCD\b/i`, and does match `/FLOW MODE/i`
  - [ ] T22.5 Property 5 — All `DJ_LESSONS` entries meet minimum Hard Mode content requirements
    - **Property 5: All `DJ_LESSONS` entries meet minimum Hard Mode content thresholds**
    - **Validates: Requirements 5.1–5.8**
    - For each `[slug, entry]` from `Object.entries(DJ_LESSONS)`, assert `quizHard.length >= 3`, `proMoves.length >= 3`, `walkthrough.length >= 4`, `mistakes.length >= 3`, `advanced.what.length >= 3`, `sources.length >= 1`
  - Install `fast-check` and `@testing-library/react` if not already present (add to `devDependencies`)
  - Create test file at `artifacts/ccd-school/tests/correctness.test.ts` (or `__tests__/correctness.test.ts` per project convention)
  - Files: `artifacts/ccd-school/tests/correctness.test.ts` (new), `package.json` (devDependencies update)
  - _Requirements: 1.3, 1.4, 2.1, 2.3, 3.5, 3.7, 1.9, 5.1–5.8, 9.1, 9.3, 10.3_
  - **Acceptance:** `vitest --run tests/correctness.test.ts` (or `jest`) passes all 5 property tests. No test is skipped. `fast-check` is in `devDependencies`. All 5 properties are tested.
  - **Dependencies:** T1, T5, T7, T4, T10

- [ ] T23. Final checkpoint — ensure all tests pass
  - Run the full test suite: `vitest --run` (or `jest --passWithNoTests`)
  - Confirm zero TypeScript errors: `tsc --noEmit`
  - Confirm zero `"ccd"` mode references remain: `grep -r '"ccd"' artifacts/ccd-school/src/ --include="*.ts" --include="*.tsx"`
  - Confirm zero `"PATH MODE"` / `"CCD Mode"` user-facing strings remain
  - Ask the user if any questions have arisen before marking the spec complete.
  - _Requirements: all_
  - **Acceptance:** All tests pass. `tsc --noEmit` exits 0. Grep checks return zero relevant results.
  - **Dependencies:** T22

---

## Notes

- Tasks marked with `*` (e.g. T10.1) are optional property-based test sub-tasks and can be skipped for a faster MVP delivery
- T10 and T11 are fully independent and can be worked in parallel — they touch separate content files
- T13–T17 (FAL Pipeline) can be started as soon as T1 is complete — they are independent of UX fixes in Phase 2
- T18–T21 (Beat Coach & Source Verification) can be parallelised with Phase 4 — the only shared dependency is T2 for the `learnMode` identifier
- T21 can be worked in parallel with T18–T20 as it only touches `paths.ts`
- The audit script in T12 must run after T10 and T11 are complete so the full content corpus is in place
- All `artifacts/ccd-school/` paths assume this is the monorepo subfolder — adjust if the app root differs
- Property tests in T22 require `fast-check` and `@testing-library/react` to be installed

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["T1"] },
    { "id": 1, "tasks": ["T2", "T7", "T13"] },
    { "id": 2, "tasks": ["T3", "T4", "T8", "T9", "T10", "T11", "T14", "T15", "T6"] },
    { "id": 3, "tasks": ["T5", "T10.1", "T12", "T16", "T18", "T21"] },
    { "id": 4, "tasks": ["T17", "T19"] },
    { "id": 5, "tasks": ["T20", "T22.1", "T22.2", "T22.3", "T22.4", "T22.5"] },
    { "id": 6, "tasks": ["T23"] }
  ]
}
```

### Dependency Diagram

```
Wave 0 ──────────────────────────────────────────────────────────────
  T1  [lib/mode.ts — type + normalise + default]

Wave 1 ──────────────────────────────────────────────────────────────
  T2  [grep-replace "ccd" → "flow" in 8 files]        depends: T1
  T7  [create LessonSourceBar.tsx]                     depends: T1
  T13 [add "fal-image" type to types.ts]               depends: T1

Wave 2 ──────────────────────────────────────────────────────────────
  T3  [UI copy — Flow/Free Mode labels everywhere]     depends: T2
  T4  [FlowFallbackBanner rename + copy]               depends: T2
  T6  [HomeClient returning-user redirect]             depends: T1
  T8  [wire LessonSourceBar → InlineClassicLesson]     depends: T7
  T9  [wire LessonSourceBar → LessonPlayer summary]    depends: T7
  T10 [DJ_LESSONS — 40 entries with Hard Mode content] depends: T1
  T11 [SYNTHS_LESSONS — 18 entries]                    depends: T1
  T14 [FalImage renderer in LessonVisuals.tsx]         depends: T13
  T15 [fal-image-priority.md — 11 entries]             depends: T13

Wave 3 ──────────────────────────────────────────────────────────────
  T5  [handleComplete redirect → /dashboard]           depends: T4
  T10.1* [property tests for DJ_LESSONS]               depends: T10
  T12 [audit-missions.mjs + apply fixes]               depends: T10, T11
  T16 [generate-fal-images.mjs script]                 depends: T15
  T18 [enrich coachContext in LessonPageClient]         depends: T2
  T21 [audit + update paths.ts source fields]          depends: T1

Wave 4 ──────────────────────────────────────────────────────────────
  T17 [wire FAL imageUrl into 11 mission screens]      depends: T14, T15, T16
  T19 [context → system prompt in beat-coach route]    depends: T18

Wave 5 ──────────────────────────────────────────────────────────────
  T20 [Dashboard Beat Coach context]                   depends: T19
  T22.1* [property: normaliseCcdToFlow]                depends: T1
  T22.2* [property: handleComplete → /dashboard]       depends: T5
  T22.3* [property: LessonSourceBar null for empty]    depends: T7
  T22.4* [property: FlowFallbackBanner no legacy copy] depends: T4
  T22.5* [property: DJ_LESSONS Hard Mode thresholds]   depends: T10

Wave 6 ──────────────────────────────────────────────────────────────
  T23 [final checkpoint — all tests pass, tsc clean]   depends: T22.*
```
