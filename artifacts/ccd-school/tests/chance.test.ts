import { describe, expect, it } from "vitest";
import { condCode, evKey, plays, roll, setChance, setCond, stepTag } from "../src/lib/chance";
import { arranged } from "../src/lib/arrange";
import { emptyTrackV2, newLayerV2, type NoteEvent } from "../src/lib/track2";

describe("chance and trig conditions", () => {
  it("rolls the same numbers as the engine (engine/src/seq.rs, roll_matches_the_typescript_table)", () => {
    const got = [roll(1, 0, 0), roll(1, 1, 0), roll(7, 3, 1440), roll(123456, 9, evKey({ start: 2.25, note: 38 }))];
    const want = [0.40834904, 0.77148736, 0.610525, 0.7660919];
    got.forEach((g, i) => expect(g).toBeCloseTo(want[i], 6));
  });
  it("conditions in the engine's wire order", () => {
    expect(["1:2", "2:2", "1:4", "fill", "not fill"].map(c => condCode(c as never))).toEqual([1, 2, 3, 7, 8]);
    expect(condCode(undefined)).toBe(0);
  });
  it("1:2 plays every other pass, 1:4 every fourth, fill only with the key held", () => {
    const e = (cond?: NoteEvent["cond"], chance?: number): NoteEvent => ({ note: 37, vel: 1, start: 1, len: 0.1, cond, chance });
    const on = (x: NoteEvent, fill = false) => [0, 1, 2, 3, 4, 5, 6, 7].filter(n => plays(x, n, fill, 1));
    expect(on(e("1:2"))).toEqual([0, 2, 4, 6]);
    expect(on(e("2:2"))).toEqual([1, 3, 5, 7]);
    expect(on(e("1:4"))).toEqual([0, 4]);
    expect(on(e("fill"))).toEqual([]);
    expect(on(e("fill"), true)).toHaveLength(8);
    const half = Array.from({ length: 2000 }, (_, n) => plays(e(undefined, 0.5), n, false, 3)).filter(Boolean).length;
    expect(Math.abs(half - 1000)).toBeLessThan(80);
  });
  it("set on a held step like a lock, shown on the step", () => {
    const evs: NoteEvent[] = [{ note: 36, vel: 1, start: 0, len: 0.2 }, { note: 36, vel: 1, start: 1, len: 0.2 }];
    const a = setChance(evs, x => x.start === 1, 0.5);
    expect(a[1].chance).toBe(0.5);
    expect(a[0].chance).toBeUndefined();
    expect(stepTag(a[1])).toBe("50%");
    expect(setChance(a, x => x.start === 1, 1)[1]).toEqual(evs[1]);
    const c = setCond(evs, x => x.start === 0, "1:4");
    expect(stepTag(c[0])).toBe("1:4");
    expect(stepTag(setCond(evs, () => true, "not fill")[0])).toBe("!fill");
    expect(setCond(c, () => true, null)).toEqual(evs);
  });
  it("an arranged song tells the engine which play of the part's loop each copy is", () => {
    const d = { ...newLayerV2("drums"), id: "d", events: [{ note: 36, vel: 1, start: 0, len: 0.2, cond: "1:2" as const }, { note: 38, vel: 1, start: 1, len: 0.2 }] };
    const t = { ...emptyTrackV2(), loop: 4, layers: [d], sections: [{ name: "a", bars: 2, off: [] }, { name: "b", bars: 1, off: [] }] };
    const evs = arranged(t).layers[0].events;
    expect(evs.filter(e => e.note === 36).map(e => [e.start, e.it, e.reps])).toEqual([[0, 0, 3], [4, 1, 3], [8, 2, 3]]);
    expect(evs.find(e => e.note === 38)!.it).toBeUndefined();
  });
});
