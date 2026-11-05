import { describe, expect, it } from "vitest";
import { cleanLocks, dueBetween, lockSchedule, padOfIndex, setLock, valuesAt } from "../src/lib/plock";
import { emptyTrackV2, newLayerV2, type NoteEvent } from "../src/lib/track2";

const CUT = 16; // bass.cutoff
const base = (i: number) => (i === CUT ? 0.45 : 0);
const ev = (start: number, p?: Record<number, number>, note = 45): NoteEvent => ({ note, vel: 0.9, start, len: 0.25, ...(p ? { p } : {}) });

describe("parameter locks: storage", () => {
  it("setLock puts a value on the matched notes and clears it again, dropping empty maps", () => {
    const evs = [ev(0), ev(1)];
    const locked = setLock(evs, e => e.start === 1, CUT, 0.9);
    expect(locked[1].p).toEqual({ [CUT]: 0.9 });
    expect(locked[0].p).toBeUndefined();
    const cleared = setLock(locked, e => e.start === 1, CUT, null);
    expect("p" in cleared[1]).toBe(false);
  });
  it("clamps to 0..1", () => {
    expect(setLock([ev(0)], () => true, CUT, 3)[0].p![CUT]).toBe(1);
  });
  it("survives a save and load, and old songs without locks load unchanged", () => {
    const t = emptyTrackV2();
    const l = { ...newLayerV2("bass"), events: [ev(0, { [CUT]: 0.8 }), ev(1)] };
    const back = cleanLocks(JSON.parse(JSON.stringify({ ...t, layers: [l] })));
    expect(back.layers[0].events[0].p).toEqual({ [CUT]: 0.8 });
    const old = { ...t, layers: [{ ...newLayerV2("bass"), events: [ev(0)] }] };
    expect(cleanLocks(old)).toBe(old);
  });
  it("cleans bad stored locks instead of failing", () => {
    const t = { ...emptyTrackV2(), layers: [{ ...newLayerV2("bass"), events: [{ ...ev(0), p: { [CUT]: "x", 17: Infinity, "-1": 0.5, 18: 2 } as unknown as Record<number, number> }, { ...ev(1), p: null as unknown as Record<number, number> }] }] };
    const c = cleanLocks(t);
    expect(c.layers[0].events[0].p).toEqual({ 18: 1 });
    expect("p" in c.layers[0].events[1]).toBe(false);
  });
});

describe("parameter locks: playback schedule", () => {
  it("sends the lock at its note and puts the layer's value back at the next note", () => {
    const s = lockSchedule([ev(0), ev(1, { [CUT]: 0.9 }), ev(2), ev(3)], base);
    expect(s).toEqual([{ beat: 1, index: CUT, value: 0.9 }, { beat: 2, index: CUT, value: 0.45 }]);
  });
  it("two locked notes in a row send once each value, wrapping round the loop", () => {
    const s = lockSchedule([ev(0, { [CUT]: 0.2 }), ev(1, { [CUT]: 0.2 }), ev(2)], base);
    expect(s).toEqual([{ beat: 0, index: CUT, value: 0.2 }, { beat: 2, index: CUT, value: 0.45 }]);
  });
  it("no locks, no changes", () => {
    expect(lockSchedule([ev(0), ev(1)], base)).toEqual([]);
  });
  it("a drum pad's lock only counts that pad's hits", () => {
    const kickDecay = 16 + 0 * 4 + 1;
    expect(padOfIndex(kickDecay, true)).toBe(0);
    expect(padOfIndex(4, true)).toBeNull();
    const s = lockSchedule([ev(0, { [kickDecay]: 1 }, 36), ev(0.5, undefined, 42), ev(1, undefined, 36)], () => 0.5, true);
    expect(s).toEqual([{ beat: 0, index: kickDecay, value: 1 }, { beat: 1, index: kickDecay, value: 0.5 }]);
  });
  it("finds what falls due between two playhead readings, across the loop end", () => {
    const s = lockSchedule([ev(0, { [CUT]: 0.9 }), ev(2)], base);
    expect(dueBetween(s, 1.9, 2.1, 4).map(d => d.change.beat)).toEqual([2]);
    expect(dueBetween(s, 3.95, 0.05, 4).map(d => d.change.beat)).toEqual([0]);
    expect(dueBetween(s, 3.95, 0.05, 4)[0].ahead).toBeCloseTo(0.05, 5);
    expect(dueBetween(s, 0.5, 1.5, 4)).toEqual([]);
  });
  it("knows the value in force anywhere in the loop, for starting mid-loop", () => {
    const s = lockSchedule([ev(0, { [CUT]: 0.9 }), ev(2)], base);
    expect(valuesAt(s, 1, 4).get(CUT)).toBe(0.9);
    expect(valuesAt(s, 3, 4).get(CUT)).toBe(0.45);
  });
});
