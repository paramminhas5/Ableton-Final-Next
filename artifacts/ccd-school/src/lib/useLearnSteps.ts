"use client";
/**
 * The lesson player's learning events (src/lib/learnEvents.ts), in one hook so the player only calls it:
 * step_shown on every step, step_skipped when a skip key is pressed on it, step_done when the learner moves
 * on from it any other way (with what the step reported: checks, hints and stars for a copy or a match),
 * and lesson_finished on the done step.
 */
import { useEffect, useRef } from "react";
import { learn, takeStepResult } from "./learnEvents";

export function useLearnSteps(slug: string, idx: number, kind: string | undefined, world: string) {
  const prev = useRef<{ idx: number; kind: string } | null>(null);
  const skipped = useRef(false);
  const t0 = useRef(Date.now());
  // A skip key anywhere in the player marks the step it was pressed on.
  useEffect(() => {
    const on = (e: Event) => {
      const el = e.target as Element | null;
      if (el?.closest?.('.fl [aria-label="Skip this step"], .fl .ls-skip')) skipped.current = true;
    };
    document.addEventListener("click", on, true);
    return () => document.removeEventListener("click", on, true);
  }, []);
  useEffect(() => {
    if (!kind) return;
    const p = prev.current;
    if (p && idx > p.idx && p.kind !== "done") {
      const ms = Date.now() - t0.current;
      if (skipped.current) { learn("step_skipped", { slug, step: p.idx, kind: p.kind, ms }); takeStepResult(); }
      else learn("step_done", { slug, step: p.idx, kind: p.kind, ms, ...(takeStepResult() ?? {}) });
    }
    skipped.current = false;
    t0.current = Date.now();
    if (!p || p.idx !== idx) learn("step_shown", { slug, step: idx, kind, world });
    if (kind === "done" && p && p.kind !== "done") learn("lesson_finished", { slug, world });
    prev.current = { idx, kind };
  }, [idx, kind, slug, world]);
}
