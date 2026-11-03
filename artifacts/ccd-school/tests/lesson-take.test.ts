import { describe, it, expect } from "vitest";
import { applyTake, lessonSteps, playPads, practiceTrack, shapeKnobs, takeType } from "../src/lib/lessonTake";
import { emptyTrackV2, newLayerV2, MAX_LAYERS, type TrackV2 } from "../src/lib/track2";
import { inScale } from "../src/lib/theory";
import { MISSIONS } from "../src/content/missions";
import { FOUNDATIONS_MISSIONS } from "../src/content/missions-foundations";
import { DJ_WORLD_MISSIONS } from "../src/content/missions-dj";

const ALL = [...FOUNDATIONS_MISSIONS, ...DJ_WORLD_MISSIONS, ...MISSIONS];
const ev = (note: number, start: number) => ({ note, vel: 0.9, start, len: 0.25 });

function withLayers(...types: Parameters<typeof newLayerV2>[0][]): TrackV2 {
  return { ...emptyTrackV2(), layers: types.map(t => newLayerV2(t, "test")) };
}

describe("try it: what you can play", () => {
  it("maps every lesson offer onto a layer you can record", () => {
    expect(takeType("kick")).toBe("drums");
    expect(takeType("clap")).toBe("drums");
    expect(takeType("hats")).toBe("hats");
    expect(takeType("bass")).toBe("bass");
    expect(takeType("pad")).toBe("chords");
    expect(takeType("lead")).toBe("lead");
  });

  it("offers eight keys in key for melodic layers, starting on the root", () => {
    for (const type of ["bass", "lead"] as const) {
      const pads = playPads(type, 45, "minor");
      expect(pads).toHaveLength(8);
      expect(pads[0].label).toBe("a");
      expect(pads[7].notes[0] - pads[0].notes[0]).toBe(12);
      for (const p of pads) expect(inScale(p.notes[0], 45, "minor")).toBe(true);
    }
    const bass = playPads("bass", 45, "minor");
    expect(bass[0].notes[0]).toBe(33); // a1, where a bass line lives
  });

  it("offers triads on each scale degree for chords, named by quality", () => {
    const pads = playPads("chords", 45, "minor");
    expect(pads[0].notes).toHaveLength(3);
    expect(pads[0].label).toBe("i"); // a minor
    expect(pads[1].label).toBe("ii°"); // b diminished
    expect(pads[2].label).toBe("III"); // c major
    for (const p of pads) for (const n of p.notes) expect(inScale(n, 45, "minor")).toBe(true);
  });

  it("offers drum sounds for drums and hats", () => {
    expect(playPads("drums", 45, "minor")[0]).toEqual({ label: "kick", notes: [36] });
    expect(playPads("hats", 45, "minor")[0].notes).toEqual([42]);
  });
});

describe("try it: playing over your track", () => {
  it("adds an empty practice layer when the track has none of that type", () => {
    const t = withLayers("drums");
    t.layers[0].events = [ev(36, 0)];
    const { track, index } = practiceTrack(t, "bass");
    expect(index).toBe(1);
    expect(track.layers[1].type).toBe("bass");
    expect(track.layers[1].events).toEqual([]);
    expect(track.layers[0].events).toHaveLength(1); // your drums still play along
  });

  it("empties the existing layer of that type rather than doubling it", () => {
    const t = withLayers("drums", "bass");
    t.layers[1].events = [ev(33, 0)];
    const { track, index } = practiceTrack(t, "bass");
    expect(index).toBe(1);
    expect(track.layers).toHaveLength(2);
    expect(track.layers[1].events).toEqual([]);
  });

  it("never grows past eight layers", () => {
    const t = withLayers("drums", "hats", "chords", "lead", "fx", "sample", "drums", "hats");
    expect(t.layers).toHaveLength(MAX_LAYERS);
    const { track } = practiceTrack(t, "bass");
    expect(track.layers).toHaveLength(MAX_LAYERS);
  });
});

describe("try it: your line joins the track", () => {
  it("adds a new layer with your notes and records the lesson as added", () => {
    const t = applyTake(emptyTrackV2(), "bass-poli", { type: "bass", events: [ev(33, 0), ev(36, 1)] }, "producer");
    expect(t.layers).toHaveLength(1);
    expect(t.layers[0].type).toBe("bass");
    expect(t.layers[0].events.map(e => e.note)).toEqual([33, 36]);
    expect(t.layers[0].from).toBe("bass-poli");
    expect(t.added).toContain("bass-poli");
  });

  it("is a no-op for a lesson already added", () => {
    const once = applyTake(emptyTrackV2(), "x", { type: "bass", events: [ev(33, 0)] });
    expect(applyTake(once, "x", { type: "bass", events: [ev(40, 0)] })).toBe(once);
  });

  it("replaces a melodic line but keeps the drum sounds you did not play", () => {
    const t = withLayers("drums", "bass");
    t.layers[0].events = [ev(36, 0), ev(38, 1), ev(42, 0.5)];
    t.layers[1].events = [ev(33, 0)];
    const drums = applyTake(t, "a", { type: "drums", events: [ev(36, 0), ev(36, 2)] });
    expect(drums.layers[0].events.filter(e => e.note === 36)).toHaveLength(2);
    expect(drums.layers[0].events.some(e => e.note === 38)).toBe(true);
    expect(drums.layers[0].events.some(e => e.note === 42)).toBe(true);
    const bass = applyTake(t, "b", { type: "bass", events: [ev(40, 0)] });
    expect(bass.layers[1].events.map(e => e.note)).toEqual([40]);
  });

  it("applies the shaped knob values to the layer", () => {
    const t = applyTake(emptyTrackV2(), "c", { type: "bass", events: [ev(33, 0)] }, undefined, { 16: 0.2 });
    expect(t.layers[0].params[16]).toBe(0.2);
  });

  it("gives every layer type two knobs to shape", () => {
    for (const type of ["drums", "hats", "bass", "chords", "lead"] as const) {
      const k = shapeKnobs(type);
      expect(k).toHaveLength(2);
      for (const x of k) expect(x.spec.label.length).toBeGreaterThan(0);
    }
  });
});

describe("lesson steps", () => {
  it("puts try it right before what you learned, in every lesson", () => {
    for (const m of ALL) {
      const steps = lessonSteps(m.screens ?? []);
      const at = steps.findIndex(s => s.kind === "tryit");
      expect(at, m.slug).toBeGreaterThan(0);
      expect(steps.filter(s => s.kind === "tryit"), m.slug).toHaveLength(1);
      const sum = steps.findIndex(s => s.kind === "summary");
      if (sum >= 0) expect(at, m.slug).toBe(sum - 1);
      expect(steps[0].kind, m.slug).toBe("hook");
    }
  });
});
