## 1. Fix invisible tooltips (root cause)

`<Glossarized>` mutates a shared `seen` Set **during render**. React renders components multiple times (StrictMode double-invoke in dev, any state change in prod). On the second render every term is already in `seen`, so nothing gets wrapped → no tooltips visible. The dedup model is correct (one tooltip per term per mission, but the same term can appear in other missions); the implementation is impure.

**Fix:** move dedup out of render.

- Add `useMissionGlossary(slug, texts: string[])` hook in `src/components/Term.tsx` (or a new `glossary-dedup.ts`).
- The mission page collects every glossarizable string in render order (what / why / analogy / listenFor / walkthrough / edgeCases / engineerNotes / proMoves / etc.) into a stable array memoized on `slug`.
- The hook returns a `Map<textIndex, Set<allowedTermLowercase>>` computed once per slug: walk the array in order, first occurrence of each term wins.
- `<Glossarized text index />` reads its allow-set from context and only wraps terms in that set. Pure render, idempotent across re-renders.
- Remove the impure `GlossaryScope` mutation path. Keep the component name + a thin context that exposes the precomputed map.
- Verify by loading `/mission/what-is-sound` and confirming dotted-underline terms render on first paint and survive a tab toggle.

## 2. Interval drill — reset on replay

In `src/routes/train.tsx` `DrillRunner`:
- Replay button currently re-calls `playQuestion` but `playInterval` re-randomizes the root MIDI each call, so the same "minor third" question plays at a different pitch — confusing. Fix by computing the root once per question (store on `question.payload` as `{ semis, rootMidi }`) and passing it through.
- Apply the same "freeze randomness per round" pattern to `playChord` (root) and any other drill where re-rolling on replay changes the audible material.
- Confirm: clicking ▶ REPLAY plays the identical two notes; clicking NEXT ROUND rolls a new question.

## 3. Sim-fit audit (all 96 missions)

Produce `scripts/sim-audit.mjs` that joins `MISSIONS` with their `sim.type` and a curated "ideal sim" table, then prints a markdown report at `/mnt/documents/sim-audit.md` with three columns: `slug | current sim | recommended | rationale`.

Rules for "fit":
- Concept must be *demonstrated* by the sim, not merely adjacent (e.g. a "compression" mission should use `CompLakeSim`, not `MixerSim`).
- Beginner missions get hands-on sims with one variable; advanced get multi-knob sims.
- Flag missions where the sim is generic filler (`MixerSim`, `DrumPadSim` reused on theory missions) for swap.

After the report, apply the swaps in `src/content/missions*.ts` in a single pass. For missions where no existing sim fits, list them as "needs new sim" and address in step 4.

## 4. Sim quality upgrades

Target the 6 lowest-quality / most-reused sims first based on the audit. Likely candidates: `EarTrainingSim`, `ChordStackerSim`, `MidiVsAudioSim`, `SidechainSim`, `FilterEnvelopeSim`, `SubtractiveSynthSim`.

For each:
- Reference proven open-source implementations (Tone.js examples, Learning Synths by Ableton, teropa/musictheory, Web Audio API examples on MDN, learningsynths.ableton.com source) — pulled via web search, adapted to our brutalist UI tokens.
- Add: visible state readout (current values), labeled axes, "try this" preset buttons, and a teaching caption that updates as the user interacts.
- Mobile: ensure all controls are tappable (44px min), audio routed through `ensureAudio()` from the unlock fix.
- Each upgraded sim ships with: clear goal text, 2–3 preset challenges, and a "you got it" confirmation when the target is matched.

## 5. Verify

- Run `bun run typecheck` equivalent (build) — must pass.
- Spot-check 3 missions across worlds for tooltips + sim fit.
- Run interval drill, confirm replay = identical notes.
- Open `/mnt/documents/sim-audit.md` for the user to review the swap table.

## Technical details

- Files touched: `src/components/Term.tsx` (rewrite), `src/routes/mission.$slug.tsx` (collect texts, pass index), `src/lib/drills.ts` (freeze root), `src/routes/train.tsx` (payload threading), `src/content/missions*.ts` (sim swaps), 6 sim components under `src/components/sims/`, plus `scripts/sim-audit.mjs`.
- No schema or auth changes. No new dependencies expected; if a sim genuinely needs Tone.js for a specific feature we'll inline the minimal Web Audio code instead to keep the bundle lean.
