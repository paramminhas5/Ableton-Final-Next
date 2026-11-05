import { describe, expect, it } from "vitest";
import { partLen, swingOf, tiled, withPartLengths } from "../src/lib/partLength";
import { arranged } from "../src/lib/arrange";
import { emptyTrackV2, newLayerV2, type TrackV2 } from "../src/lib/track2";
import { swung } from "../src/components/m1/useEngineTrack";

const hit = (note: number, s: number) => ({ note, vel: 1, start: s, len: 0.1 });

describe("per-part loop length and swing", () => {
  it("hats three steps long against a sixteen step kick: polymeter across the loop", () => {
    const hats = [hit(42, 0)];
    expect(tiled(hats, 0.75, 4).map(e => e.start)).toEqual([0, 0.75, 1.5, 2.25, 3, 3.75]);
    // Notes past the part's length do not play.
    expect(tiled([hit(42, 0), hit(42, 1)], 0.75, 4).every(e => Math.abs((e.start / 0.75) - Math.round(e.start / 0.75)) < 1e-9)).toBe(true);
  });
  it("over four bars the three-step part drifts against the bar", () => {
    const t: TrackV2 = { ...emptyTrackV2(), loop: 16, layers: [{ ...newLayerV2("hats"), id: "h", len: 0.75, events: [hit(42, 0)] }, { ...newLayerV2("drums"), id: "d", events: [0, 4, 8, 12].map(b => hit(36, b)) }] };
    const out = withPartLengths(t);
    const h = out.layers[0].events.map(e => e.start);
    expect(h).toHaveLength(22);
    // Bar 2 starts a step after a hat, not on one: it has drifted.
    expect(h.includes(4)).toBe(false);
    expect(h.includes(4.5)).toBe(true);
    expect(out.layers[1]).toBe(t.layers[1]);
  });
  it("old songs play exactly as before", () => {
    const t: TrackV2 = { ...emptyTrackV2(), layers: [{ ...newLayerV2("drums"), id: "d", events: [hit(36, 0)] }] };
    expect(withPartLengths(t)).toBe(t);
    expect(partLen({ len: undefined }, 4)).toBeNull();
    expect(partLen({ len: 4 }, 4)).toBeNull();
    expect(partLen({ len: 0.75 }, 4)).toBe(0.75);
  });
  it("an arrangement repeats the short part in every section", () => {
    const t: TrackV2 = { ...emptyTrackV2(), loop: 4, layers: [{ ...newLayerV2("hats"), id: "h", len: 1, events: [hit(42, 0.5)] }], sections: [{ name: "a", bars: 1, off: [] }, { name: "b", bars: 1, off: [] }] };
    expect(arranged(t).layers[0].events.map(e => e.start)).toEqual([0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5]);
  });
  it("a part's own swing wins over the song's", () => {
    const song = { swing: 0.5 };
    expect(swingOf({}, song)).toBe(0.5);
    expect(swingOf({ swing: 0 }, song)).toBe(0);
    expect(swingOf({ swing: 2 }, song)).toBe(0.75);
    const off16 = [hit(42, 0.25)];
    expect(swung(off16, swingOf({ swing: 0 }, song))[0].start).toBe(0.25);
    expect(swung(off16, swingOf({}, song))[0].start).toBeCloseTo(0.25 + 0.5 / 6);
  });
});
