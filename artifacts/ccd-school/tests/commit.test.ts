import { describe, expect, it } from "vitest";
import { arranged, commitLoop, goSection } from "../src/lib/arrange";
import { emptyTrackV2, newLayerV2, type TrackV2 } from "../src/lib/track2";

const kick = (s: number) => ({ note: 36, vel: 1, start: s, len: 0.2 });
const song = (): TrackV2 => ({ ...emptyTrackV2(), loop: 4, layers: [{ ...newLayerV2("drums"), id: "d", events: [kick(0), kick(2)] }] });

describe("commit (the EP-133's commit)", () => {
  it("with no arrangement: the loop becomes section a, its copy section b, and you are in b", () => {
    const t = commitLoop(song());
    expect(t.sections!.map(s => s.name)).toEqual(["a", "b"]);
    expect(t.at).toBe(1);
    expect(t.sections![0].notes!.d).toEqual(song().layers[0].events);
    // Change the loop in b: a keeps the original.
    const b = { ...t, layers: t.layers.map(l => ({ ...l, events: [kick(0), kick(1), kick(2), kick(3)] })) };
    const a = arranged(b);
    const starts = a.layers[0].events.map(e => e.start);
    expect(starts.filter(s => s < 16)).toEqual([0, 2, 4, 6, 8, 10, 12, 14]);
    expect(starts.filter(s => s >= 16)).toHaveLength(16);
  });
  it("from the last section commit adds one; from an earlier one it fills the next", () => {
    let t = commitLoop(song());
    t = { ...t, layers: t.layers.map(l => ({ ...l, events: [kick(1)] })) };
    t = commitLoop(t);
    expect(t.sections!.map(s => s.name)).toEqual(["a", "b", "c"]);
    expect(t.at).toBe(2);
    expect(t.sections![1].notes!.d).toEqual([kick(1)]);
    expect(t.sections![2].notes!.d).toEqual([kick(1)]);
    t = goSection(t, 0);
    expect(t.layers[0].events).toEqual(song().layers[0].events);
    t = commitLoop(t);
    expect(t.sections).toHaveLength(3);
    expect(t.at).toBe(1);
    expect(t.sections![1].notes!.d).toEqual(song().layers[0].events);
  });
  it("an arrangement from before commit keeps playing as it did until you commit", () => {
    const t = { ...song(), sections: [{ name: "intro", bars: 2, off: [] }, { name: "drop", bars: 2, off: [] }] };
    const before = arranged(t).layers[0].events;
    const c = commitLoop(t);
    expect(c.at).toBe(1);
    expect(arranged(c).layers[0].events).toEqual(before);
  });
});
