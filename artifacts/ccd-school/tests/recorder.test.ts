import { describe, it, expect } from "vitest";
import { overdub, pressNote, releaseNote, toggleStep, type Held, type RecordOpts } from "../src/lib/recorder";

const o: RecordOpts = { loop: 4, snap: "1/16", strength: 1, swing: 0 };

describe("recording", () => {
  it("pairs a press and release into a snapped event", () => {
    const held: Held = new Map();
    expect(pressNote(held, "b", 45, 0.8, 1.03, false)).toBe(true);
    const ev = releaseNote(held, "b", 45, 1.52, o)!;
    expect(ev.start).toBeCloseTo(1.0);
    expect(ev.len).toBeCloseTo(0.49);
    expect(ev.vel).toBe(0.8);
    expect(held.size).toBe(0);
  });

  it("a note just before the downbeat lands on beat 1; earlier count-in notes are dropped", () => {
    const held: Held = new Map();
    expect(pressNote(held, "d", 36, 1, -0.1, true)).toBe(true);
    expect(releaseNote(held, "d", 36, 0.1, o)!.start).toBe(0);
    expect(pressNote(held, "d", 36, 1, -1.5, true)).toBe(false);
  });

  it("a note held over the loop end keeps its length", () => {
    const held: Held = new Map();
    pressNote(held, "b", 40, 1, 3.5, false);
    const ev = releaseNote(held, "b", 40, 0.5, o)!;
    expect(ev.start).toBeCloseTo(3.5);
    expect(ev.len).toBeCloseTo(1.0);
  });

  it("snap off keeps the timing; strength pulls part way", () => {
    const held: Held = new Map();
    pressNote(held, "b", 40, 1, 1.07, false);
    expect(releaseNote(held, "b", 40, 1.3, { ...o, snap: "off" })!.start).toBeCloseTo(1.07);
    pressNote(held, "b", 40, 1, 1.08, false);
    expect(releaseNote(held, "b", 40, 1.3, { ...o, strength: 0.5 })!.start).toBeCloseTo(1.04);
  });

  it("overdub adds on top and replaces the same note on the same spot", () => {
    let evs = [{ note: 36, vel: 1, start: 0, len: 0.1 }];
    evs = overdub(evs, { note: 38, vel: 1, start: 1, len: 0.1 }, o);
    expect(evs).toHaveLength(2);
    evs = overdub(evs, { note: 36, vel: 0.5, start: 0.05, len: 0.1 }, o);
    expect(evs).toHaveLength(2);
    expect(evs.find(e => e.note === 36)!.vel).toBe(0.5);
    // also across the loop wrap
    evs = overdub(evs, { note: 38, vel: 0.4, start: 3.97, len: 0.1 }, { ...o, snap: "1/32" });
    expect(evs.filter(e => e.note === 38).length).toBe(2);
  });

  it("steps toggle on and off", () => {
    let evs = toggleStep([], 36, 4, 0.25, 0.1);
    expect(evs).toEqual([{ note: 36, vel: 0.9, start: 1, len: 0.1 }]);
    evs = toggleStep(evs, 36, 4, 0.25, 0.1);
    expect(evs).toEqual([]);
    // on a melodic layer, tapping a lit step removes whatever note is there
    evs = toggleStep([{ note: 45, vel: 1, start: 0.5, len: 0.25 }], null, 2, 0.25, 0.25);
    expect(evs).toEqual([]);
  });
});
