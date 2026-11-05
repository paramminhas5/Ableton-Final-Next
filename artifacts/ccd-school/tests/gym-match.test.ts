import { describe, expect, it } from "vitest";
import { GYM_DRILLS, advance, initialLevel, mulberry32, summarize } from "../src/lib/gym/engine";
import { MATCH_KNOBS, MATCH_PARTS, makeMatchQuestion, matchKnob, matchKnobCount, matchSong, matchSpread } from "../src/lib/gym/match";
import { freshSaved } from "../src/lib/gym/store";

describe("match this sound in the ear gym", () => {
  it("is a gym drill with its own level and streaks", () => {
    expect(GYM_DRILLS).toContain("match");
    expect(freshSaved().levels.match).toEqual(initialLevel());
    let s = initialLevel();
    for (let i = 0; i < 4; i++) s = advance(s, true);
    expect(s.level).toBe(2);
    expect(summarize([{ drill: "match", level: 2, correct: true, responseMs: 9000 }]).byDrill.match).toEqual({ answered: 1, correct: 1, maxLevel: 2 });
  });

  it("adds knobs with the level: two, then three, then four", () => {
    expect([1, 2, 3, 5, 6, 8].map(matchKnobCount)).toEqual([2, 2, 3, 3, 4, 4]);
    const rng = mulberry32(3);
    expect(makeMatchQuestion(1, rng).knobs.length).toBe(2);
    expect(makeMatchQuestion(4, rng).knobs.length).toBe(3);
    expect(makeMatchQuestion(7, rng).knobs.length).toBe(4);
  });

  it("every knob exists on its part, and every part has four", () => {
    for (const part of MATCH_PARTS) {
      expect(MATCH_KNOBS[part].length).toBe(4);
      for (const key of MATCH_KNOBS[part]) expect(matchKnob(part, key), `${part} ${key}`).toBeTruthy();
    }
    expect(matchKnob("kick", "decay")!.index).toBe(17);
    expect(matchKnob("kick", "tone")!.index).toBe(7);
  });

  it("hides settings far enough from the start to hear, closer at higher levels, never the same part twice running", () => {
    const rng = mulberry32(11);
    let prev: undefined | (typeof MATCH_PARTS)[number];
    const parts = new Set<string>();
    for (let i = 0; i < 200; i++) {
      const level = 1 + (i % 8);
      const q = makeMatchQuestion(level, rng, prev);
      expect(q.part).not.toBe(prev);
      prev = q.part;
      parts.add(q.part);
      for (const k of q.knobs) {
        expect(q.target[k]).toBeGreaterThanOrEqual(0.08);
        expect(q.target[k]).toBeLessThanOrEqual(0.92);
        // the 0.05 rounding can take at most 0.025 off the spread
        expect(Math.abs(q.target[k] - q.start[k])).toBeGreaterThanOrEqual(matchSpread(level) - 0.026);
      }
    }
    expect(parts.size).toBe(4);
    expect(matchSpread(1)).toBeGreaterThan(matchSpread(8));
  });

  it("plays a short phrase on the part alone, its knobs where they start", () => {
    const q = makeMatchQuestion(6, mulberry32(5));
    const { song, part } = matchSong(q);
    expect(song.layers.length).toBe(1);
    expect(song.loop).toBe(4);
    expect(part.events.length).toBeGreaterThan(0);
    expect(part.events.every(e => e.start + e.len <= 4)).toBe(true);
    for (const k of q.knobs) expect(part.params[matchKnob(q.part, k)!.index]).toBe(q.start[k]);
  });
});
