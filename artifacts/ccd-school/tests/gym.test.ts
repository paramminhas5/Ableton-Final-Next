import { describe, it, expect } from "vitest";
import {
  advance,
  initialLevel,
  makeCompressionQuestion,
  makeEqQuestion,
  makeGrooveQuestion,
  mulberry32,
  summarize,
  MAX_LEVEL,
  type LevelState,
} from "../src/lib/gym/engine";
import { canUsePass, emptyStore, recordSession, takeFreePass, weekKey, weekStatus } from "../src/lib/gym/week";
import { applyGain, matchGain, peak, rms } from "../src/lib/gym/loudness";

const run = (s: LevelState, answers: boolean[]) => answers.reduce(advance, s);

describe("EG-1 adaptive difficulty", () => {
  it("rises after 4 correct in a row", () => {
    expect(run(initialLevel(3), [true, true, true]).level).toBe(3);
    expect(run(initialLevel(3), [true, true, true, true]).level).toBe(4);
  });
  it("falls after 2 misses in a row", () => {
    expect(run(initialLevel(3), [false]).level).toBe(3);
    expect(run(initialLevel(3), [false, false]).level).toBe(2);
  });
  it("a miss breaks a correct run, a correct answer breaks a miss run", () => {
    expect(run(initialLevel(3), [true, true, true, false, true]).level).toBe(3);
    expect(run(initialLevel(3), [false, true, false]).level).toBe(3);
  });
  it("stays inside 1..8", () => {
    expect(run(initialLevel(1), [false, false, false, false]).level).toBe(1);
    expect(run(initialLevel(MAX_LEVEL), Array(8).fill(true)).level).toBe(MAX_LEVEL);
  });
  it("resets both runs on a level change", () => {
    const up = run(initialLevel(2), [true, true, true, true]);
    expect(up).toEqual({ level: 3, correctRun: 0, missRun: 0 });
  });
});

describe("question generators", () => {
  it("EQ: more options and a smaller boost as level rises, answer always present", () => {
    for (let lvl = 1; lvl <= MAX_LEVEL; lvl++) {
      const q = makeEqQuestion(lvl, mulberry32(lvl));
      expect(q.options).toContain(q.answerHz);
      expect(new Set(q.options).size).toBe(q.options.length);
    }
    const easy = makeEqQuestion(1, mulberry32(1));
    const hard = makeEqQuestion(8, mulberry32(1));
    expect(easy.options.length).toBe(3);
    expect(hard.options.length).toBe(10);
    expect(hard.boostDb).toBeLessThan(easy.boostDb);
    expect(hard.boostDb).toBeGreaterThanOrEqual(4);
  });
  it("compression: attack question only for compressed clips at level 3+", () => {
    for (let i = 0; i < 40; i++) {
      const k = makeCompressionQuestion(2, mulberry32(i));
      expect(k.askAttack).toBe(false);
      const k5 = makeCompressionQuestion(5, mulberry32(i));
      expect(k5.askAttack).toBe(k5.compressed);
    }
  });
  it("compression gets gentler with level", () => {
    const a = makeCompressionQuestion(1, mulberry32(1));
    const b = makeCompressionQuestion(8, mulberry32(1));
    expect(b.ratio).toBeLessThan(a.ratio);
    expect(b.thresholdDb).toBeGreaterThan(a.thresholdDb);
  });
  it("groove: alternates tempo and swing, differences shrink with level", () => {
    const first = makeGrooveQuestion(1, mulberry32(3));
    const second = makeGrooveQuestion(1, mulberry32(4), first.kind);
    expect(second.kind).not.toBe(first.kind);
    const easy = makeGrooveQuestion(1, mulberry32(5));
    const hard = makeGrooveQuestion(8, mulberry32(5));
    expect(hard.deltaBpm).toBeLessThan(easy.deltaBpm);
    expect(hard.swing).toBeLessThan(easy.swing);
    expect(hard.deltaBpm).toBeGreaterThanOrEqual(2);
  });
  it("is deterministic for a seed", () => {
    expect(makeEqQuestion(4, mulberry32(9))).toEqual(makeEqQuestion(4, mulberry32(9)));
  });
});

describe("session summary", () => {
  const r = (drill: "eq" | "groove", correct: boolean, level = 1) => ({ drill, level, correct, responseMs: 1000 });
  it("needs 5 answers to count", () => {
    expect(summarize([r("eq", true), r("eq", true)]).counts).toBe(false);
    expect(summarize(Array(5).fill(r("eq", true))).counts).toBe(true);
  });
  it("computes accuracy and per-drill max level", () => {
    const s = summarize([r("eq", true, 2), r("eq", false, 3), r("groove", true, 1), r("groove", true, 1)]);
    expect(s.accuracy).toBe(0.75);
    expect(s.byDrill.eq.maxLevel).toBe(3);
    expect(s.byDrill.groove.correct).toBe(2);
  });
});

describe("EG-5 weekly target", () => {
  const wed = new Date(2026, 9, 28, 12); // Wed 28 Oct 2026
  it("weeks start on Monday", () => {
    expect(weekKey(new Date(2026, 9, 26))).toBe("2026-10-26"); // Mon
    expect(weekKey(new Date(2026, 10, 1))).toBe("2026-10-26"); // Sun
    expect(weekKey(new Date(2026, 10, 2))).toBe("2026-11-02"); // next Mon
  });
  it("counts only this week's sessions", () => {
    let s = emptyStore();
    s = recordSession(s, new Date(2026, 9, 21, 9)); // last week
    s = recordSession(s, new Date(2026, 9, 27, 9));
    expect(weekStatus(s, wed).done).toBe(1);
    expect(weekStatus(s, wed).remaining).toBe(2);
  });
  it("target is met by sessions alone", () => {
    let s = emptyStore();
    for (const d of [26, 27, 28]) s = recordSession(s, new Date(2026, 9, d, 9));
    expect(weekStatus(s, wed).met).toBe(true);
    expect(canUsePass(s, wed)).toBe(false);
  });
  it("one free pass a week fills one slot, and only once", () => {
    let s = emptyStore();
    s = recordSession(s, new Date(2026, 9, 26, 9));
    s = recordSession(s, new Date(2026, 9, 27, 9));
    expect(canUsePass(s, wed)).toBe(true);
    s = takeFreePass(s, wed);
    expect(weekStatus(s, wed).met).toBe(true);
    expect(takeFreePass(s, wed)).toBe(s);
  });
  it("the pass does not carry into the next week", () => {
    const s = takeFreePass(emptyStore(), wed);
    const nextWeek = new Date(2026, 10, 3);
    expect(weekStatus(s, nextWeek).passUsed).toBe(false);
  });
  it("a missed week costs nothing: no streak state exists to reset", () => {
    const s = recordSession(emptyStore(), new Date(2026, 8, 1));
    const st = weekStatus(s, wed);
    expect(st.done).toBe(0);
    expect(st.target).toBe(3);
  });
});

describe("EG-2 loudness matching", () => {
  const sine = (amp: number, n = 4410) => Float32Array.from({ length: n }, (_, i) => amp * Math.sin(i / 7));
  it("matches RMS of b to a", () => {
    const a = sine(0.4);
    const b = sine(0.1);
    applyGain(b, matchGain(a, b));
    expect(Math.abs(rms(a) - rms(b))).toBeLessThan(1e-3);
  });
  it("never lets the peak go past the ceiling", () => {
    const a = sine(0.9);
    const b = Float32Array.from({ length: 4410 }, (_, i) => (i % 100 === 0 ? 0.5 : 0.01));
    applyGain(b, matchGain(a, b, 0.95));
    expect(peak(b)).toBeLessThanOrEqual(0.9501);
  });
  it("handles silence without NaN", () => {
    expect(matchGain(sine(0.3), new Float32Array(100))).toBe(1);
  });
});
