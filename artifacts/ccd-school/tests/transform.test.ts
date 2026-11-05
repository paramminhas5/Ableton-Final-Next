import { describe, expect, it } from "vitest";
import { humanize, strum, STRUM_MAX, velocityShape } from "../src/lib/transform";
import type { NoteEvent } from "../src/lib/track2";

const chord: NoteEvent[] = [64, 57, 60].map(note => ({ note, vel: 0.8, start: 0, len: 2 }));
const run: NoteEvent[] = [0, 1, 2, 3].map(b => ({ note: 60, vel: 0.8, start: b, len: 0.5 }));

describe("transformations (Live 12)", () => {
  it("strum spreads a chord low to high, or high to low, and keeps each note's end", () => {
    const up = strum(chord, 1);
    const by = (evs: NoteEvent[], n: number) => evs.find(e => e.note === n)!;
    expect(by(up, 57).start).toBe(0);
    expect(by(up, 60).start).toBeCloseTo(STRUM_MAX);
    expect(by(up, 64).start).toBeCloseTo(2 * STRUM_MAX);
    for (const e of up) expect(e.start + e.len).toBeCloseTo(2);
    const down = strum(chord, -0.5);
    expect(by(down, 64).start).toBe(0);
    expect(by(down, 57).start).toBeCloseTo(STRUM_MAX);
    expect(strum(chord, 0)).toBe(chord);
    // Only the picked notes move.
    const one = strum(chord, 1, new Set([0, 1]));
    expect(by(one, 60).start).toBe(0);
  });
  it("humanize moves time and velocity a little, the same way for the same seed", () => {
    const h = humanize(run, 1, 5);
    expect(h).toEqual(humanize(run, 1, 5));
    expect(JSON.stringify(h)).not.toBe(JSON.stringify(humanize(run, 1, 6)));
    for (let i = 0; i < run.length; i++) {
      expect(Math.abs(h[i].start - run[i].start)).toBeLessThanOrEqual(0.0625 + 1e-9);
      expect(Math.abs(h[i].vel - run[i].vel)).toBeLessThanOrEqual(0.25 + 1e-9);
    }
    expect(h.some((e, i) => e.start !== run[i].start)).toBe(true);
    expect(humanize(run, 0, 5)).toBe(run);
    // Never before the start of the loop.
    expect(Math.min(...humanize(run, 1, 9).map(e => e.start))).toBeGreaterThanOrEqual(0);
  });
  it("velocity shaper ramps up or down across the notes", () => {
    const up = velocityShape(run, 1);
    expect(up.map(e => e.vel)).toEqual([...up.map(e => e.vel)].sort((a, b) => a - b));
    expect(up[0].vel).toBeCloseTo(0.12, 2);
    expect(up[3].vel).toBe(0.8);
    const down = velocityShape(run, -1);
    expect(down[0].vel).toBe(0.8);
    expect(down[3].vel).toBeLessThan(0.2);
    expect(velocityShape(run, 0)).toBe(run);
  });
});
