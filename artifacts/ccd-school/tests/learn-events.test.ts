import { beforeEach, describe, expect, it, vi } from "vitest";
import { funnel, type Row } from "../src/lib/learnFunnel";

const r = (who: string, e: string, p: Record<string, unknown>, t = 1): Row => ({ who, e, t, p });

describe("learning funnel", () => {
  it("finds where learners stop, the steps with most checks and skips, and next-day returns", () => {
    const rows: Row[] = [
      r("a", "lesson_started", { slug: "your-kick" }), r("b", "lesson_started", { slug: "your-kick" }), r("c", "lesson_started", { slug: "your-kick" }),
      ...["a", "b", "c"].map(w => r(w, "step_shown", { slug: "your-kick", step: 0, kind: "hear" })),
      ...["a", "b", "c"].map(w => r(w, "step_shown", { slug: "your-kick", step: 1, kind: "copy" })),
      r("a", "step_done", { slug: "your-kick", step: 1, kind: "copy", checks: 2, hints: 0, stars: 3 }),
      r("b", "step_done", { slug: "your-kick", step: 1, kind: "copy", checks: 6, hints: 2, stars: 1 }),
      r("c", "step_skipped", { slug: "your-kick", step: 1, kind: "copy" }),
      r("a", "step_shown", { slug: "your-kick", step: 2, kind: "play" }),
      r("a", "lesson_finished", { slug: "your-kick" }),
      r("a", "came_back", { gapDays: 1 }), r("a", "came_back_next_day", {}),
      r("b", "placement_result", { world: "producer", level: 1 }),
      r("a", "gym_session", { accuracy: 0.8 }),
    ];
    const f = funnel(rows);
    expect(f.learners).toBe(3);
    const k = f.lessons.find(l => l.slug === "your-kick")!;
    expect(k).toMatchObject({ started: 3, finished: 1, learners: 3 });
    expect(k.finishRate).toBeCloseTo(1 / 3);
    expect(k.dropStep).toBe("step 2 (copy)");
    expect(f.mostChecks[0]).toMatchObject({ slug: "your-kick", step: 1, avgChecks: 4 });
    expect(f.mostChecks[0].avgStars).toBe(2);
    expect(f.mostSkipped[0].skipRate).toBeCloseTo(1 / 3);
    expect(f.returning).toMatchObject({ learners: 3, nextDay: 1 });
    expect(f.placements).toEqual([{ world: "producer", level: 1, n: 1 }]);
    expect(f.gym).toMatchObject({ sessions: 1, accuracy: 0.8 });
  });
});

describe("learning events on the device", () => {
  beforeEach(() => {
    vi.resetModules();
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k) });
    vi.stubGlobal("window", { dispatchEvent: () => true, addEventListener: () => {}, removeEventListener: () => {} });
    vi.stubGlobal("CustomEvent", class { constructor(public type: string, public detail?: unknown) {} });
  });
  it("queue until sent, and note coming back the next day", async () => {
    const L = await import("../src/lib/learnEvents");
    L.learn("lesson_started", { slug: "your-kick", long: "x".repeat(200), n: 1.23456 });
    expect(L.pendingEvents()).toHaveLength(1);
    expect(String(L.pendingEvents()[0].p.long).length).toBe(80);
    expect(L.pendingEvents()[0].p.n).toBe(1.235);
    L.dropSent(1);
    expect(L.pendingEvents()).toHaveLength(0);
    expect(L.localLog()).toHaveLength(1);
    expect(L.noteVisit(new Date(2026, 10, 7, 10))).toEqual([]);
    expect(L.noteVisit(new Date(2026, 10, 7, 18))).toEqual([]);
    expect(L.noteVisit(new Date(2026, 10, 8, 9))).toEqual(["came_back", "came_back_next_day"]);
    expect(L.noteVisit(new Date(2026, 10, 11, 9))).toEqual(["came_back"]);
  });
});
