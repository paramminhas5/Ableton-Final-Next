import { describe, expect, it } from "vitest";
import { assign, engineSlots, removeRing, ringsOf, setAmount, sourcesFor, sourceUsed } from "../src/lib/modulation";
import { BASS_PARAMS, LEAD_PARAMS, LAYER_PARAMS, MAX_MODS, MOD_SRC } from "../src/engine/params.gen";

const L = (k: string) => LEAD_PARAMS.find(p => p.key === k)!;
const PAN = LAYER_PARAMS.find(p => p.key === "pan")!.index;

describe("modulation", () => {
  it("synths have an lfo and a filter envelope, the bass its envelope, drums none", () => {
    expect(sourcesFor("lead")).toEqual(["lfo", "env"]);
    expect(sourcesFor("bass")).toEqual(["env"]);
    expect(sourcesFor("drums")).toEqual([]);
  });
  it("the lead's own lfo to the filter is a ring on the cutoff, as far as the voice takes it", () => {
    const p = { [L("lfo").index]: 0.5, [L("lfoto").index]: 0 };
    const r = ringsOf("lead", p, undefined).get(L("cutoff").index)!.find(x => x.src === "lfo")!;
    // 0.5 of the lfo is 1.5 octaves; the cutoff knob spans log2(16000 / 120) octaves.
    expect(r.amt).toBeCloseTo(1.5 / Math.log2(16000 / 120), 6);
    expect(r.bipolar && r.own).toBe(true);
    // to the pitch: no ring on the cutoff
    expect(ringsOf("lead", { ...p, [L("lfoto").index]: 0.5 }, undefined).get(L("cutoff").index)?.some(x => x.src === "lfo")).toBeFalsy();
  });
  it("unused sources stay dark: the lfo at zero is unused, the envelope at its default is used", () => {
    expect(sourceUsed("lead", {}, undefined, "lfo")).toBe(false);
    expect(sourceUsed("lead", {}, undefined, "env")).toBe(true);
    expect(sourceUsed("lead", {}, [{ src: "lfo", to: PAN, amt: 0.3 }], "lfo")).toBe(true);
  });
  it("dropping the lfo on the cutoff switches the voice's own lfo to the filter", () => {
    const r = assign("lead", { [L("lfoto").index]: 0.5 }, undefined, "lfo", L("cutoff").index);
    expect(r.params[L("lfoto").index]).toBe(0);
    expect(r.params[L("lfo").index]).toBe(0.3);
    expect(r.mods).toEqual([]);
  });
  it("dropping a source anywhere else takes a slot; setting it, and taking it off", () => {
    const a = assign("lead", {}, undefined, "lfo", PAN);
    expect(a.mods).toEqual([{ src: "lfo", to: PAN, amt: 0.25 }]);
    const ring = ringsOf("lead", {}, a.mods).get(PAN)![0];
    const b = setAmount("lead", a.mods, ring, -0.6);
    expect(b.mods[0].amt).toBe(-0.6);
    expect(removeRing("lead", b.mods, ring).mods).toEqual([]);
    // the same source on the same knob twice is one route
    expect(assign("lead", {}, a.mods, "lfo", PAN).mods.length).toBe(1);
  });
  it("the own ring's amount turns its knob back the other way", () => {
    const p = { [BASS_PARAMS.find(x => x.key === "env")!.index]: 0.45 };
    const ring = ringsOf("bass", p, undefined).get(BASS_PARAMS.find(x => x.key === "cutoff")!.index)![0];
    const back = setAmount("bass", undefined, ring, ring.amt);
    expect(back.params[BASS_PARAMS.find(x => x.key === "env")!.index]).toBeCloseTo(0.45, 6);
  });
  it("every engine slot is sent, cleared ones at zero", () => {
    const s = engineSlots([{ src: "env", to: PAN, amt: 0.4 }]);
    expect(s.length).toBe(MAX_MODS);
    expect(s[0]).toEqual({ src: MOD_SRC.env, to: PAN, amt: 0.4 });
    expect(s.slice(1).every(x => x.amt === 0)).toBe(true);
    // a damaged save never sends nonsense
    const bad = engineSlots([{ src: "nope", to: 3, amt: 0.5 }, { src: "lfo", to: NaN, amt: 0.5 }, { src: "lfo", to: 3, amt: 9 }] as never);
    expect(bad[0].amt).toBe(0);
    expect(bad[1].amt).toBe(0);
    expect(bad[2].amt).toBe(1);
  });
});
