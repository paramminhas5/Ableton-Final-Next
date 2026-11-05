import { describe, it, expect } from "vitest";
import { applyOffer, emptyTrack, newLayer, offerFor, type Track } from "../src/lib/track";
import { DRUM_LANES, emptyTrackV2, mergeV1, migrateV1, paramOf, toV1View, MAX_LAYERS } from "../src/lib/track2";
import { BASS_PARAMS, LAYER_PARAMS } from "../src/engine/params.gen";

const idx = (id: string) => [...LAYER_PARAMS, ...BASS_PARAMS].find(p => p.id === id)!.index;

function v1(...kinds: Parameters<typeof newLayer>[0][]): Track {
  return { ...emptyTrack(), layers: kinds.map(k => newLayer(k, "lesson")) };
}

describe("track v2 migration from ccd.track.v1", () => {
  it("folds kick, clap and perc into one drum rack, one lane each", () => {
    const t = migrateV1(v1("kick", "clap", "perc", "bass"));
    expect(t.v).toBe(2);
    const drums = t.layers.filter(l => l.type === "drums");
    expect(drums).toHaveLength(1);
    const notes = new Set(drums[0].events.map(e => e.note));
    expect(notes).toEqual(new Set([36, 39, 60]));
    expect(t.layers.map(l => l.type)).toEqual(["drums", "bass"]);
  });

  it("turns 16 steps into note events in beats", () => {
    const t = migrateV1(v1("kick"));
    // four on the floor: x...x...x...x...
    expect(t.layers[0].events.map(e => e.start)).toEqual([0, 1, 2, 3]);
    expect(t.layers[0].events.every(e => e.len > 0 && e.len <= 0.25)).toBe(true);
  });

  it("keeps bass notes and knob values", () => {
    const src = v1("bass");
    src.layers[0].params = [0.2, 0.6, 0.4, 0.7];
    const t = migrateV1(src);
    const b = t.layers[0];
    expect(b.events[0].note).toBe(src.layers[0].notes[0]);
    expect(paramOf(b, idx("bass.cutoff"))).toBeCloseTo(0.2);
    expect(paramOf(b, idx("bass.res"))).toBeCloseTo(0.6);
    expect(paramOf(b, idx("mix.level"))).toBeCloseTo(0.7);
  });

  it("sidechain becomes duck under the drums' kick", () => {
    const src = v1("kick", "bass");
    src.layers[1].sidechain = true;
    const t = migrateV1(src);
    const bass = t.layers.find(l => l.type === "bass")!;
    const drums = t.layers.find(l => l.type === "drums")!;
    expect(bass.duck).toEqual({ src: drums.id, note: 36 });
    expect(paramOf(bass, idx("mix.duck"))).toBeGreaterThan(0);
  });

  it("pad joins chords; never more than 8 layers", () => {
    const t = migrateV1(v1("chords", "pad", "lead"));
    expect(t.layers.map(l => l.type)).toEqual(["chords", "lead"]);
    const many = migrateV1(v1("kick", "hats", "clap", "perc", "bass", "lead", "chords", "pad"));
    expect(many.layers.length).toBeLessThanOrEqual(MAX_LAYERS);
  });

  it("keeps bpm, which lessons were added, and mute", () => {
    const src = { ...v1("hats"), bpm: 128, added: ["a", "b"] };
    src.layers[0].mute = true;
    const t = migrateV1(src);
    expect(t.bpm).toBe(128);
    expect(t.added).toEqual(["a", "b"]);
    expect(t.layers[0].mute).toBe(true);
  });
});

describe("v1 view of a v2 track, for lessons", () => {
  it("shows each drum lane as its own v1 layer and round trips through a lesson", () => {
    const t2 = migrateV1(v1("kick", "bass"));
    const view = toV1View(t2);
    expect(view.layers.map(l => l.kind)).toEqual(["kick", "bass"]);
    // A clap lesson adds a clap: it should land as a lane in the drum rack.
    const offer = offerFor(view, { slug: "clap-lesson", title: "Clap on the backbeat" });
    expect(offer.kind).toBe("clap");
    const after = applyOffer(view, offer, "clap-lesson");
    const merged = mergeV1(t2, view, after);
    expect(merged.layers.filter(l => l.type === "drums")).toHaveLength(1);
    expect(merged.layers[0].events.some(e => e.note === 39)).toBe(true);
    expect(merged.added).toContain("clap-lesson");
  });

  it("a lesson upgrading the bass replaces its pattern, keeps the layer", () => {
    const t2 = migrateV1(v1("bass"));
    const view = toV1View(t2);
    const offer = offerFor(view, { slug: "glide", title: "Glide on the bass" });
    expect(offer.isNew).toBe(false);
    const merged = mergeV1(t2, view, applyOffer(view, offer, "glide"));
    expect(merged.layers).toHaveLength(1);
    expect(merged.layers[0].id).toBe(t2.layers[0].id);
    expect(merged.layers[0].variant).toBe(1);
  });

  it("an empty v2 track has an empty view", () => {
    expect(toV1View(emptyTrackV2()).layers).toEqual([]);
  });

  it("drum lanes use the rack's own notes", () => {
    expect(DRUM_LANES.drums[0]).toBe(36);
    expect(DRUM_LANES.hats).toContain(42);
  });
});

describe("layer types play their own instruments", () => {
  it("maps chords, lead and fx to their engine instruments and reads their defaults", async () => {
    const { TYPE, newLayerV2, paramOf, instrumentParamCount, gridOf, barsOf, emptyTrackV2 } = await import("../src/lib/track2");
    const { CHORD_PARAMS, LEAD_PARAMS, FX_PARAMS } = await import("../src/engine/params.gen");
    expect([TYPE.chords.engine, TYPE.lead.engine, TYPE.fx.engine]).toEqual(["chords", "lead", "fx"]);
    expect(paramOf(newLayerV2("chords"), CHORD_PARAMS[0].index)).toBe(CHORD_PARAMS[0].default);
    expect(paramOf(newLayerV2("lead"), LEAD_PARAMS[4].index)).toBe(LEAD_PARAMS[4].default);
    expect(paramOf(newLayerV2("fx"), FX_PARAMS[5].index)).toBe(FX_PARAMS[5].default);
    expect(instrumentParamCount("chords")).toBe(17); // 8, then lfo rate, lfo, lfo to, fm, ratio, f decay, f release, character, filter drive
    expect(instrumentParamCount("fx")).toBe(6);
    expect(instrumentParamCount("drums")).toBe(208); // 16 pads x 4, 16 rack slots, then 16 pads x 8 on the second page
    const t = emptyTrackV2();
    expect(gridOf(t)).toBe(0.25);
    expect(gridOf({ ...t, grid: 0.125 })).toBe(0.125);
    expect(gridOf({ ...t, grid: 0.3 })).toBe(0.25);
    expect(barsOf({ ...t, loop: 16 })).toBe(4);
  });

  it("presets only touch the instrument knobs", async () => {
    const { applyPreset, PRESETS } = await import("../src/lib/presets");
    const { newLayerV2, paramOf } = await import("../src/lib/track2");
    const { LAYER_PARAMS, BASS_PARAMS } = await import("../src/engine/params.gen");
    const level = LAYER_PARAMS.find(p => p.id === "mix.level")!.index;
    const l = { ...newLayerV2("bass"), params: { [level]: 0.4 } };
    const sub = applyPreset(l, 1);
    expect(paramOf(sub, level)).toBe(0.4);
    expect(paramOf(sub, BASS_PARAMS.find(p => p.key === "sub")!.index)).toBeGreaterThan(0.8);
    expect(sub.preset).toBe(1);
    expect(applyPreset(l, -1).preset).toBe(PRESETS.bass.length - 1);
  });
});

describe("first visit starter", () => {
  it("is a beat and a bass line, playable on the pads", async () => {
    const { starterTrack } = await import("../src/lib/starter");
    const t = starterTrack();
    expect(t.layers.map(l => l.type)).toEqual(["drums", "bass"]);
    expect(t.layers[0].surface).toBe("pads");
    expect(t.layers.every(l => l.events.length > 3 && l.events.every(e => e.start >= 0 && e.start < t.loop))).toBe(true);
  });
});

import { effectivePad } from "../src/lib/track2";
describe("effectivePad", () => {
  it("a hats layer defaults to the closed hat, not the kick", () => {
    expect(effectivePad({ type: "hats", pad: 0 })).toBe(4);
    expect(effectivePad({ type: "hats", pad: 5 })).toBe(5);
    expect(effectivePad({ type: "drums", pad: 0 })).toBe(0);
  });
});
