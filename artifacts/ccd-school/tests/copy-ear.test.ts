import { describe, expect, it } from "vitest";
import { baseNote, copyStars, degreeNote, gradeCopy, makeCopyQuestion, parsePattern, patternProblems, rowsFor } from "../src/lib/copyEar";
import { mulberry32 } from "../src/lib/gym/engine";

describe("copy by ear: patterns", () => {
  it("reads a drum pattern as hits on the sixteenth grid", () => {
    const { events, loop } = parsePattern("drums", { kick: "x...x...x...x...", clap: "....x.......o..." }, 45, "minor");
    expect(loop).toBe(4);
    expect(events.filter(e => e.note === 36).map(e => e.start)).toEqual([0, 1, 2, 3]);
    const claps = events.filter(e => e.note === 39);
    expect(claps.map(e => e.start)).toEqual([1, 3]);
    expect(claps[1].vel).toBeLessThan(claps[0].vel);
  });
  it("reads scale steps in the song's own key and scale", () => {
    const base = baseNote("bass", 45); // a
    expect(base).toBe(33);
    expect(degreeNote("3", base, "minor")).toBe(36); // c, the minor third
    expect(degreeNote("3", base, "major")).toBe(37); // c#
    expect(degreeNote("1'", base, "minor")).toBe(45);
    expect(degreeNote("5,", base, "minor")).toBe(28);
    expect(degreeNote("b2", base, "minor")).toBe(34);
    expect(degreeNote("8", base, "minor")).toBe(45);
  });
  it("holds notes through dashes and stacks chords with plus", () => {
    const { events } = parsePattern("chords", "1+3+5 - - - 4+6+1' - . . . . . . . . . .", 48, "major");
    expect(events.length).toBe(6);
    expect(events.filter(e => e.start === 0).map(e => e.note)).toEqual([60, 64, 67]);
    expect(events.find(e => e.start === 0)!.len).toBe(1);
    expect(events.filter(e => e.start === 1).map(e => e.note).sort((a, b) => a - b)).toEqual([65, 69, 72]);
  });
  it("names the problems in a bad pattern", () => {
    expect(patternProblems("drums", { kick: "x...x..." })[0]).toMatch(/8 steps/);
    expect(patternProblems("drums", { cowbell: "x...............", kick: "x..............." })[0]).toMatch(/not a drum/);
    expect(patternProblems("bass", "1 - . . q . . . 1 . . . 1 . . .")[0]).toMatch(/"q" is not a step/);
    expect(patternProblems("bass", "- 1 . . . . . . . . . . . . . .")[0]).toMatch(/cannot start/);
    expect(patternProblems("bass", "1 - . . 1' . . . 1 - . . 5 - . .")).toEqual([]);
  });
});

describe("copy by ear: grading", () => {
  const target = parsePattern("bass", "1 - . . 3 - . . 5 - . . 1' - . .", 45, "minor").events;
  it("marks a perfect copy done", () => {
    const g = gradeCopy(target, target.map(e => ({ ...e, len: 0.25 })));
    expect(g.done).toBe(true);
    expect(g.right).toBe(4);
  });
  it("says which way a wrong note was off, and counts the missed ones", () => {
    const mine = [
      { ...target[0] },
      { ...target[1], note: target[1].note - 2 }, // too low: up
      { ...target[2], start: target[2].start - 0.25 }, // a step early: late
    ];
    const g = gradeCopy(target, mine);
    expect(g.mine.map(m => m.mark)).toEqual(["right", "wrong", "wrong"]);
    expect(g.mine[1].dir).toBe("up");
    expect(g.mine[2].dir).toBe("late");
    expect(g.missed.length).toBe(3);
    expect(g.done).toBe(false);
  });
  it("does not count one target note twice", () => {
    const g = gradeCopy(target, [{ ...target[0] }, { ...target[0] }]);
    expect(g.right).toBe(1);
    expect(g.mine[1].mark).toBe("wrong");
  });
  it("gives stars like Syntorial: fewer with more checks and hints", () => {
    expect(copyStars(1, 0)).toBe(3);
    expect(copyStars(2, 0)).toBe(3);
    expect(copyStars(3, 0)).toBe(2);
    expect(copyStars(1, 1)).toBe(2);
    expect(copyStars(6, 1)).toBe(1);
  });
});

describe("copy by ear: rows and the gym", () => {
  it("shows only the scale's notes around the tune, so it can be found by ear", () => {
    const t = parsePattern("bass", "1 - . . 3 - . . 5 - . . 1' - . .", 45, "minor").events;
    const rows = rowsFor("bass", t, 45, "minor");
    expect(rows[0]).toBeGreaterThan(45);
    expect(rows[rows.length - 1]).toBeLessThan(33);
    // every row in a minor
    for (const n of rows) expect([0, 2, 3, 5, 7, 8, 10]).toContain((((n - 45) % 12) + 12) % 12);
    expect(rowsFor("bass", t, 45, "minor", "hard").length).toBeGreaterThan(rows.length);
  });
  it("adds one decoy drum except at gentle", () => {
    const t = parsePattern("drums", { kick: "x...x...x...x..." }, 45, "minor").events;
    expect(rowsFor("drums", t, 45, "minor", "gentle")).toEqual([36]);
    expect(rowsFor("drums", t, 45, "minor").length).toBe(2);
  });
  it("makes valid questions at every level, harder as it goes", () => {
    const r = mulberry32(7);
    const counts: number[] = [];
    for (let level = 1; level <= 8; level++) {
      for (let i = 0; i < 20; i++) {
        const q = makeCopyQuestion(level, r);
        expect(patternProblems(q.layer, q.pattern)).toEqual([]);
        const { events } = parsePattern(q.layer, q.pattern, q.root, q.scale);
        expect(events.length).toBeGreaterThan(0);
        if (i === 0) counts.push(new Set(events.map(e => e.note)).size);
      }
    }
    expect(counts[0]).toBe(1);
    expect(Math.max(...counts.slice(5))).toBeGreaterThan(2);
  });
});
