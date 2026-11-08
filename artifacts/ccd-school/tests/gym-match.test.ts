import { describe, expect, it } from "vitest";
import { GYM_DRILLS, advance, initialLevel, mulberry32, summarize } from "../src/lib/gym/engine";
import { MATCH_KNOBS, MATCH_PARTS, makeMatchQuestion, matchKnob, matchKnobCount, matchSong, matchSpread } from "../src/lib/gym/match";
import { freshSaved } from "../src/lib/gym/store";
import { knobMarks, matchStars, notch, notchesFor } from "../src/lib/matchScore";

describe("match this sound in the ear gym", () => {
  it("is a gym drill with its own level and streaks", () => {
    expect(GYM_DRILLS).toContain("match");
    expect(freshSaved().levels.match).toEqual(initialLevel());
    let s = initialLevel();
    for (let i = 0; i < 4; i++) s = advance(s, true);
    expect(s.level).toBe(2);
    expect(summarize([{ drill: "match", level: 2, correct: true, responseMs: 9000 }]).byDrill.match).toEqual({ answered: 1, correct: 1, maxLevel: 2 });
  });

  it("adds knobs with the level: one, then two, three and four", () => {
    expect([1, 2, 3, 4, 6, 7, 8].map(matchKnobCount)).toEqual([1, 2, 2, 3, 3, 4, 4]);
    const rng = mulberry32(3);
    expect(makeMatchQuestion(1, rng).knobs.length).toBe(1);
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
        // on the level's notches, and never where the knob starts
        const n = notchesFor(level);
        expect(Math.abs(q.target[k] * n - Math.round(q.target[k] * n))).toBeLessThan(1e-9);
        expect(Math.abs(q.start[k] * n - Math.round(q.start[k] * n))).toBeLessThan(1e-9);
        expect(Math.abs(q.target[k] - q.start[k])).toBeGreaterThanOrEqual(1 / n - 1e-9);
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

  it("notches knobs like Syntorial: five positions at first, finer as the level rises", () => {
    expect([1, 2, 3, 5, 6, 8].map(l => notchesFor(l))).toEqual([4, 4, 8, 8, 20, 20]);
    expect(notchesFor("gentle")).toBe(4);
    expect(notch(0.4, 4)).toBe(0.5);
    expect(notch(0.37, 8)).toBe(0.375);
    expect(notch(1.2, 4)).toBe(1);
  });

  it("marks each knob green or red, and says which way a red one goes", () => {
    const m = knobMarks([{ key: "cutoff", mine: 0.5, target: 0.5 }, { key: "decay", mine: 0.25, target: 0.75 }], 4);
    expect(m.cutoff).toEqual({ ok: true, up: false });
    expect(m.decay).toEqual({ ok: false, up: true });
  });

  it("gives stars like Syntorial", () => {
    expect([matchStars(1, 0), matchStars(2, 0), matchStars(3, 0), matchStars(1, 1), matchStars(6, 1)]).toEqual([3, 3, 2, 2, 1]);
  });
});
