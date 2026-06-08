# Requirements Document

## Introduction

CCD.SCHOOL is a gamified music-education platform with 153 missions across three worlds (Fundamentals, DJ World, Producer). This spec covers every change needed to ship a world-class v1: a complete mode rename, full UX polish, source-verified content quality standards, wired source citations, and a FAL.ai image generation pipeline for mission visuals.

The user has chosen **'Flow Mode'** as the new name — sequential, gated, locked in. You're in the zone.

All 153 missions must meet a "world-class" bar: real source references, specific quiz questions grounded in source material, and non-generic taglines. Hard Mode content for DJ World and Producer (Synthesis) worlds must be filled out to the same standard as Foundations.

---

## Glossary

- **Flow_Mode**: The new name for the sequential, gated Duolingo-style mode currently called "CCD Mode" / "PATH MODE". Internal `learnMode` value migrates from `"ccd"` to `"flow"`. Replaces all user-facing copy.
- **Free_Mode**: The renamed "Explore Mode" / "Classic Mode" — all missions open, no hearts, Normal/Hard difficulty toggle. The "classic" internal identifier can remain for backwards compatibility but user-facing copy is "Free Mode".
- **Header**: The `Header.tsx` component containing the `ModeTogglePill`, nav links, and all mode-related copy.
- **LessonPageClient**: The `LessonPageClient.tsx` component that routes between `LessonPlayer` (Flow) and `InlineClassicLesson` (Free).
- **InlineClassicLesson**: The scrolling lesson format used in Free Mode and as a Flow Mode fallback.
- **LessonPlayer**: The Duolingo-style screen-by-screen lesson engine used in Flow Mode.
- **LessonDeep**: The `LessonDeep` TypeScript type in `types.ts` — the deep content object powering Hard Mode (`advanced.what`, `quizHard`, `proMoves`, `walkthrough`, `mistakes`).
- **SourceBar**: The `SourceBar.tsx` component — currently an audio source picker for sims, NOT yet a citation bar. A citation version must be created separately as `LessonSourceBar.tsx`.
- **LessonSourceBar**: A new citation-display component (distinct from the audio `SourceBar.tsx`) that renders a source attribution string on lesson summary screens and InlineClassicLesson footers.
- **LearningPath**: The `LearningPath` type in `paths.ts`, which has an optional `source` field containing a human-readable citation string.
- **Dashboard**: The `/dashboard` route powered by `DashboardClient.tsx` — the unified progress hub.
- **FAL_Pipeline**: The FAL.ai image generation system for mission visuals — a build-time or on-demand pipeline producing real photographic or illustrated images slotted into `LessonVisuals.tsx`.
- **Mission_Audit**: The systematic review of all 153 missions for content quality, source grounding, and sim assignment.

---

## Requirements

---

### Requirement 1: Mode Rename — Flow Mode & Free Mode

**User Story:** As a user, I want the two learning modes to have clear, aspirational names that communicate the experience they offer, so that I understand what I'm choosing and feel good about both options.

#### Acceptance Criteria

1. WHEN a user sees any mode label in the UI (header pill, onboarding, tooltips, mobile drawer, FAQ, README, FlowFallbackBanner, completion modal, mode badge in InlineClassicLesson), THE System SHALL display "Flow Mode" in place of every instance of "PATH MODE", "Path Mode", "CCD Mode", "CCD mode", or "ccd mode".

2. WHEN a user sees any mode label for the open-access mode, THE System SHALL display "Free Mode" in place of every instance of "EXPLORE MODE", "Explore Mode", "Classic Mode", "Explorer Mode", or "classic mode" in all user-facing copy.

3. THE LearnModeContext SHALL accept `learnMode === "flow"` as the canonical value for the sequential mode, with `"ccd"` treated as a backwards-compatible alias that is immediately normalised to `"flow"` on read from localStorage.

4. WHEN a user has a stored `localStorage` value of `learnMode = "ccd"`, THE System SHALL silently migrate that value to `"flow"` on the next page load without requiring any user action, preserving all existing progress data.

5. WHEN a user has a stored `localStorage` value of `learnMode = "classic"`, THE System SHALL accept it as equivalent to `"free"` — the internal identifier `"classic"` MAY remain in localStorage for backwards compatibility but all UI copy SHALL read "Free Mode".

6. THE ModeTogglePill in Header.tsx SHALL display "FLOW" when in Flow Mode and "FREE" when in Free Mode, with icons `🌊` for Flow and `🔓` for Free.

7. WHEN the ModeTogglePill is toggled to Flow Mode, THE System SHALL display a toast reading "🌊 FLOW MODE — locked in, hearts on, sequential".

8. WHEN the ModeTogglePill is toggled to Free Mode, THE System SHALL display a toast reading "🔓 FREE MODE — all lessons open".

9. THE FlowFallbackBanner component SHALL be renamed `FlowFallbackBanner` and SHALL display "FLOW MODE — Explore Format" with updated copy that does not reference "PATH MODE" or "CCD".

10. THE mode badge rendered inside InlineClassicLesson SHALL display "🌊 Flow Mode" for Flow Mode and "🔓 Free Mode" for Free Mode.

11. THE mobile drawer in Header.tsx SHALL display "FLOW MODE" / "FREE MODE" labels, with the subtitle for Flow Mode reading "Sequential · earn XP · hearts on" and for Free Mode reading "All open · no hearts · Normal or Hard".

12. THE README.md SHALL be updated to replace all instances of "CCD Mode", "PATH MODE", "Path Mode", "Classic Mode", and "Explore Mode" with "Flow Mode" and "Free Mode" respectively.

13. IF any code comment, string literal, aria-label, or title attribute contains "PATH MODE", "CCD Mode", "CCD mode", "ccd mode", "Explorer Mode", or "Explore Mode", THEN THE System SHALL replace those with the new terminology.

---

### Requirement 2: Lesson Completion Redirect to Dashboard

**User Story:** As a learner, I want to be taken to my dashboard after finishing a lesson, so that I immediately see my updated stats, next lesson, and earned badges rather than being dropped back into a world map.

#### Acceptance Criteria

1. WHEN a lesson completes and `handleComplete` fires in `LessonPageClient.tsx`, THE System SHALL redirect to `/dashboard` after 2200 ms instead of redirecting to `worldRoute`.

2. WHEN `InlineClassicLesson.onComplete` fires (from `onQuizDone`), THE System SHALL also trigger the parent `handleComplete` which redirects to `/dashboard`.

3. WHEN a lesson is completed in review mode (`isReview === true`), THE System SHALL redirect to `/review` instead of `/dashboard`, preserving the existing review flow.

4. WHEN the redirect fires, THE Dashboard SHALL display updated XP, streak, hearts, and the correct "next lesson" hero card reflecting the mission just completed.

5. IF a user completes a lesson that is the last in a path, THEN THE System SHALL redirect to `/dashboard` and the dashboard hero card SHALL suggest the first mission of the next path.

---

### Requirement 3: Source Citations Wired into Lesson UI

**User Story:** As a learner, I want to see where each lesson's content comes from (rekordbox manual page, Ableton manual chapter, learningmusic.ableton.com section), so that I trust the content and can go deeper in the real source material.

#### Acceptance Criteria

1. THE System SHALL render a new `LessonSourceBar` component (distinct from the existing audio `SourceBar.tsx` which is unrelated) that accepts a `source: string` prop and displays it as a styled attribution line.

2. WHEN a mission has a parent `LearningPath` with a non-empty `source` field, THE `LessonSourceBar` SHALL be rendered at the bottom of every `InlineClassicLesson` lesson page, below the quiz section and above the next lesson CTA.

3. WHEN a `LessonPlayer` lesson reaches the `summary` screen, THE `LessonSourceBar` SHALL be rendered in the summary screen footer below the learned-bullets list.

4. THE `LessonSourceBar` display SHALL include the text "Source: " followed by the citation string from `LearningPath.source`, styled in `font-mono text-[10px] uppercase opacity-60` with a `brutal-border` container matching the platform's design system.

5. IF a mission's parent path has no `source` field, THEN THE `LessonSourceBar` SHALL not render (graceful absence).

6. THE `getMissionContext` utility SHALL be used inside both `InlineClassicLesson` and `LessonPlayer` to resolve the parent path and its `source` field for each mission slug.

7. THE `LessonSourceBar` SHALL be accessible — the source text SHALL have an `aria-label` of "Content source citation".

---

### Requirement 4: Returning User — Direct to Dashboard

**User Story:** As a returning user with completed missions, I want to land on my dashboard immediately when I visit the home URL, so that I'm never shown the onboarding flow again.

#### Acceptance Criteria

1. WHEN a user visits `/` and their localStorage contains `onboardingDone === true` and at least one completed mission, THE System SHALL immediately redirect to `/dashboard` without rendering the landing page or onboarding flow.

2. WHEN a user visits `/` and their localStorage contains `onboardingDone === true` but zero completed missions, THE System SHALL redirect to `/dashboard` (a new user who completed onboarding but hasn't started yet should still see the dashboard, not the onboarding again).

3. WHEN a user visits `/` and `onboardingDone` is `false` or absent from localStorage, THE System SHALL show the landing/onboarding flow as today.

4. THE redirect from `/` to `/dashboard` SHALL be handled client-side with no flash of the landing page content — the check SHALL occur in a `useEffect` with an early return pattern or a `useLayoutEffect` before first paint where possible.

5. IF a user has partial progress (some missions done but `onboardingDone` not set), THEN THE System SHALL treat this as an incomplete onboarding state and show the onboarding flow, not redirect.

---

### Requirement 5: Hard Mode Content — DJ World Complete

**User Story:** As an advanced DJ student using Free Mode's Hard difficulty, I want every DJ World lesson to have rich `advanced.what`, `proMoves`, `walkthrough`, `mistakes`, and `quizHard` content grounded in the rekordbox 6.0.0 manual and real DJ practice, so that Hard Mode is a genuinely demanding and educational experience.

#### Acceptance Criteria

1. THE `DJ_LESSONS` record in `lesson-deep-dj.ts` SHALL contain a `LessonDeep` entry for every DJ World mission slug (all 40 missions across the 5 chapters: setup-and-culture, the-library, the-mix-dj, dj-performance, dj-mastery).

2. FOR ALL DJ World `LessonDeep` entries, THE `advanced.what` field SHALL contain at minimum 3 paragraphs of engineer-grade content referencing specific rekordbox 6.0.0 manual sections, page numbers, or Pioneer DJ hardware model names (CDJ-3000, DJM-A9, DJM-900NXS2, etc.).

3. FOR ALL DJ World `LessonDeep` entries, THE `quizHard` field SHALL contain at minimum 3 questions that cannot be answered by guessing or common knowledge — questions SHALL reference specific rekordbox features, signal-chain details, or professional DJ techniques.

4. FOR ALL DJ World `LessonDeep` entries, THE `proMoves` field SHALL contain at minimum 3 actionable, specific tips that a working club DJ would recognise as genuine professional practice (not generic advice).

5. FOR ALL DJ World `LessonDeep` entries, THE `walkthrough` field SHALL contain at minimum 4 steps, each with a `do` action and a specific `listen` result that the learner can verify by ear or by reading the rekordbox interface.

6. FOR ALL DJ World `LessonDeep` entries, THE `mistakes` field SHALL contain at minimum 3 real mistakes that DJs make — these SHALL be specific, not generic ("forgetting to eject the USB" not "be careful with your gear").

7. WHERE a DJ World mission covers rekordbox software operations (analysis, export, cue points, sync, loops, effects), THE `advanced.what` paragraphs SHALL cite the specific rekordbox 6.0.0 manual page or section.

8. THE `sources` field on every DJ World `LessonDeep` entry SHALL list at least one primary source with a `label` matching either "rekordbox 6.0.0 Instruction Manual", "Pioneer DJM-A9 Operating Instructions", or another verifiable Pioneer DJ document, and a `section` field identifying the specific chapter or page range.

---

### Requirement 6: Hard Mode Content — Producer Synthesis World Complete

**User Story:** As a synthesis student using Free Mode's Hard difficulty, I want every Synthesis chapter lesson to have complete `advanced.what`, `proMoves`, `walkthrough`, `mistakes`, and `quizHard` content grounded in learningsynths.ableton.com and real synthesis practice, so that Hard Mode teaches professional-grade synthesis knowledge.

#### Acceptance Criteria

1. THE `SYNTHS_LESSONS` record in `lesson-deep-synths.ts` SHALL contain a `LessonDeep` entry for every Synthesis chapter mission slug (all 18 missions across paths: synth-sound, synth-shaping, synth-movement).

2. FOR ALL Synthesis `LessonDeep` entries, THE `advanced.what` field SHALL contain at minimum 3 paragraphs that include signal-path explanations, relevant synthesis algorithm names, specific Ableton Live instrument references (Wavetable, Operator, Drift) or modular synthesis concepts where applicable.

3. FOR ALL Synthesis `LessonDeep` entries, THE `quizHard` field SHALL contain at minimum 3 questions covering engineering-level synthesis concepts (harmonic series mathematics, filter slopes in dB/octave, ADSR stage behaviours, FM ratio relationships, etc.).

4. FOR ALL Synthesis `LessonDeep` entries, THE `proMoves` field SHALL contain at minimum 3 actionable tips that a professional sound designer or producer would use in a real session.

5. FOR ALL Synthesis `LessonDeep` entries, THE `walkthrough` field SHALL contain at minimum 4 steps with specific synth parameter settings (e.g. "set filter cutoff to 800 Hz", "ADSR: A=10ms, D=200ms, S=50%, R=400ms") and verifiable listen results.

6. THE `sources` field on every Synthesis `LessonDeep` entry SHALL cite `learningsynths.ableton.com` with the specific chapter or section as `section`, and SHALL additionally reference the Ableton Live 12 manual for any Ableton-specific instrument content.

---

### Requirement 7: Mission Content Quality Audit — All 153 Missions

**User Story:** As a learner on CCD.SCHOOL, I want every single mission to feel specific, real, and grounded in its source material, so that I never encounter generic filler content that I could have found on any random music tutorial site.

#### Acceptance Criteria

1. THE System SHALL ensure that every mission `tagline` across all 153 missions is specific and descriptive of the actual content taught — taglines SHALL NOT be generic phrases such as "Learn the basics of X" or "Understanding Y" that give no concrete information about the lesson.

2. WHEN a mission's content is sourced from the rekordbox 6.0.0 manual, THEN the mission's `screens[]` concept text and `explainer` blocks SHALL reference at least one specific rekordbox feature name, control name, or manual section by name.

3. WHEN a mission's content is sourced from the Ableton Live 12 manual, THEN the mission's `screens[]` concept text SHALL reference at least one specific Ableton device name, shortcut, or workflow step by name.

4. WHEN a mission's content is sourced from learningmusic.ableton.com or learningsynths.ableton.com, THEN the mission's concept content SHALL be grounded in the specific interactive exercises or explanations from those sites, not rephrased generic music theory.

5. FOR ALL missions, THE quiz questions SHALL be specific enough that a correct answer cannot be inferred from common knowledge alone — at least one question per mission SHALL require knowledge of the specific source material.

6. FOR ALL missions where `sim.type === "none"`, THE Mission_Audit SHALL evaluate whether a suitable simulator exists in the 47-sim library that would genuinely enhance learning; IF a suitable sim exists, THE mission SHALL be updated to reference it.

7. THE System SHALL ensure that no two missions have identical or near-identical quiz questions — quiz questions SHALL be unique across the platform.

8. FOR ALL missions with a `badge`, THE badge `name` SHALL be specific and thematic (e.g. "Beat Architect", "Harmonic Mixer") rather than generic (e.g. "Mission Complete", "Chapter Done").

---

### Requirement 8: FAL.ai Image Generation Pipeline

**User Story:** As a learner, I want real photographs and illustrations on concept screens where a visual would accelerate understanding (CDJ equipment, waveform diagrams, studio setups), so that the learning feels grounded in the real world rather than purely abstract.

#### Acceptance Criteria

1. THE System SHALL implement a `FalImagePipeline` that accepts a mission slug, screen index, and a text prompt, and returns a URL to a FAL.ai-generated image stored in the project's public directory or a CDN.

2. THE `FalImagePipeline` SHALL use the `FAL_API_KEY` environment variable to authenticate with FAL.ai's API — the key SHALL never be embedded in client-side code and SHALL only be accessed from Next.js API routes or build scripts.

3. THE `LessonVisuals.tsx` component SHALL be extended to support a `"fal-image"` visual type on concept screens, which accepts an `imageUrl: string` prop and renders the image with a loading skeleton, alt text, and a lazy-load strategy.

4. WHEN a concept screen has `visual: "fal-image"`, THE rendered image SHALL include an `alt` attribute describing the content for accessibility, and SHALL render at a maximum width of 600px with `object-fit: contain`.

5. THE System SHALL produce a prioritised list of mission concept screens that would most benefit from real photography or illustration — priority order SHALL be: (1) physical equipment screens (CDJ, mixer, turntable, studio hardware), (2) waveform/frequency comparisons that benefit from real audio software screenshots, (3) music theory concepts where a diagram would replace 3 paragraphs of text.

6. THE `FalImagePipeline` SHALL generate images using prompts that specify photorealism, neutral studio backgrounds, and no text overlaid on images, to maintain the platform's visual consistency.

7. WHEN a FAL.ai image fails to load or the API is unavailable, THE System SHALL gracefully fall back to the existing SVG visual type or display a neutral placeholder with the caption text, without breaking the lesson flow.

8. THE image generation system SHALL be implemented as a build-time script (not runtime on every page load) so that generated images are cached and do not incur API costs on each user visit.

9. FOR DJ World equipment missions (`what-is-djing`, `dj-equipment`, `rekordbox-intro`, `beatmatching-manual`, `sync-function`, `cue-points-dj`), THE System SHALL generate and wire concept screen images showing real-world CDJ/mixer photography.

10. FOR Producer world instrument missions (`wavetable`, `operator`, `drum-rack`, `eq-eight`, `compressor`), THE System SHALL generate and wire concept screen images showing Ableton Live 12 UI screenshots or illustrated device signal-chain diagrams.

---

### Requirement 9: Flow Mode Internal Identifier Migration

**User Story:** As a developer, I want the internal code to consistently use `"flow"` as the canonical mode identifier, so that the codebase is clean, consistent, and future-maintainable.

#### Acceptance Criteria

1. THE `useLearnMode` hook in `lib/mode.ts` SHALL use `"flow"` as the canonical value type for Flow Mode, replacing `"ccd"` — the TypeScript type SHALL be `"flow" | "free"` (or `"flow" | "classic"` if `"classic"` is kept for localStorage backwards compat).

2. THE `LearnModeContext` default value SHALL be `"flow"` (not `"ccd"`).

3. ALL comparisons in the codebase of the form `learnMode === "ccd"` SHALL be replaced with `learnMode === "flow"`.

4. ALL string literals `"ccd"` used as a mode identifier (in `if` statements, ternaries, template literals, aria labels, and CSS class name conditions) SHALL be replaced with `"flow"`.

5. THE `LessonPageClient.tsx` PATH MODE comment block SHALL be updated to read `// ── FLOW MODE ──` and the condition `if (learnMode === "ccd")` SHALL become `if (learnMode === "flow")`.

6. THE migration SHALL preserve full backwards compatibility: any user who has `learnMode: "ccd"` in localStorage SHALL have the correct Flow Mode experience on their next visit without seeing any error or reset of their progress.

7. WHERE the string `"classic"` is used as the Free Mode identifier in localStorage, THE System SHALL continue to accept it as valid — user-facing copy uses "Free Mode" but the stored value may remain `"classic"` for zero-disruption migration.

---

### Requirement 10: Complete UX Polish Pass

**User Story:** As a learner, I want every edge case and interaction on the platform to feel intentional and polished, so that the experience never feels broken or unfinished.

#### Acceptance Criteria

1. WHEN a user is in Flow Mode and views `WorldPathClient`, THE locked missions SHALL display a lock icon (🔒) and a visual disabled state — they SHALL NOT be clickable or navigable while the user is in Flow Mode and has not yet unlocked them.

2. WHEN a user in Flow Mode visits `/missions` (the browse all missions page), THE locked missions SHALL display a lock overlay or disabled state and a tooltip explaining that they unlock sequentially in Flow Mode.

3. THE `CcdFallbackBanner` SHALL be renamed `FlowFallbackBanner` (per Requirement 1) and its copy SHALL read "FLOW MODE — Explore Format" with the updated explanation: "This lesson uses the scrolling format. Complete the quiz to unlock the next lesson and earn your XP."

4. WHEN a user runs out of hearts in Flow Mode and the `HeartsWall` is shown, THE displayed copy SHALL reference "Flow Mode" not "PATH MODE" or "CCD Mode".

5. THE `XpStreakPopover` tooltip copy SHALL replace "Each wrong answer in PATH MODE costs 1 heart" with "Each wrong answer in Flow Mode costs 1 heart."

6. THE `StreakWarningBanner` SHALL not reference any mode name — it is mode-agnostic and shows at risk regardless of mode.

7. WHEN a user completes a mission and the `CompletionModal` is shown, THE modal SHALL reference "Flow Mode" if the user is in Flow Mode, not "PATH MODE".

8. THE onboarding flow in `OnboardingFlow.tsx` SHALL reference "Flow Mode" and "Free Mode" for the mode selection step, with descriptions updated to match the new names.

9. WHEN a user visits `/` with `onboardingDone === true` (per Requirement 4), THE redirect SHALL happen within 100 ms of initial JavaScript execution to prevent a flash of the landing page.

10. THE `/learn` route SHALL resolve to a sensible default (the first incomplete mission or the dashboard) rather than an empty page, for both Flow Mode and Free Mode users.

---

### Requirement 11: Content Source Verification Standard

**User Story:** As the platform owner, I want every piece of lesson content to be traceable to a real source, so that the platform's credibility is beyond question and users trust what they're learning.

#### Acceptance Criteria

1. EVERY mission in DJ World SHALL have a traceable source citation in its parent `LearningPath.source` field that names a specific Pioneer DJ document (rekordbox manual, CDJ manual, DJM manual) and identifies the page range or section.

2. EVERY mission in Fundamentals SHALL have a traceable source citation in its parent `LearningPath.source` field that references `learningmusic.ableton.com` with a specific section URL path.

3. EVERY mission in Producer world (non-Synthesis) SHALL have a traceable source citation in its parent `LearningPath.source` field that references the "Ableton Live 12 Reference Manual" with a specific chapter name.

4. EVERY mission in the Synthesis chapter SHALL have a traceable source citation referencing `learningsynths.ableton.com` with a specific chapter or section.

5. WHERE a `LearningPath.source` field is currently a generic string such as "Ableton Live 12 Reference Manual" without a chapter, THE source SHALL be updated to name the specific chapter most relevant to that path's missions (e.g. "Ableton Live 12 Reference Manual — Chapter 21: Synthesizer Instruments").

6. THE `LessonDeep.sources` array on Hard Mode content entries SHALL always list at minimum one source entry with both a non-empty `label` and a non-empty `section` — entries with empty or placeholder values ARE NOT acceptable.

---

### Requirement 12: Beat Coach Context Enrichment

**User Story:** As a learner using Beat Coach AI, I want the AI to know exactly which lesson I'm on, what world I'm in, and whether I'm in Flow Mode or Free Mode, so that its answers are immediately relevant without me needing to explain my context.

#### Acceptance Criteria

1. WHEN `FloatingCoachButton` renders on a lesson page, THE `context` string passed to `CoachPanel` SHALL include: the world slug, chapter name, lesson title, lesson tagline, current mode ("Flow Mode" or "Free Mode"), and whether Hard Mode is active.

2. THE `/api/beat-coach` route SHALL receive the enriched context string and include it in the system prompt sent to the Kimi API, not just as a user message.

3. WHEN Beat Coach is opened from the Dashboard, THE context SHALL include the user's current streak, total XP, most recently completed world, and the next recommended mission slug.

4. THE Beat Coach context format SHALL be: `"[World: {world}] [{mode}] Lesson: {title} — {tagline}. Chapter: {chapter}."` — this exact format ensures consistent parsing.

---

## Open Design Decisions

The following items are intentional design questions that the implementation team must decide during the Design phase:

1. **"Free Mode" vs "Explore Mode"** — "Free Mode" communicates openness and freedom; "Explore Mode" was the original name and may be more recognisable. The Design phase should confirm.

2. **FAL image generation timing** — Build-time script vs on-demand API route vs hybrid (generate on first request, cache permanently). The Design phase must specify the implementation approach.

3. **LocalStorage key strategy** — Whether to keep `learnMode: "classic"` in storage or migrate to `"free"`, and whether to add a migration version stamp to localStorage to manage future changes cleanly.
