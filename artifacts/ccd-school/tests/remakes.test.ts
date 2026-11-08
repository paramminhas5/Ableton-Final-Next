import { describe, expect, it } from "vitest";
import { REMAKES } from "../src/lib/remakesSource";
import { keepRemake, patch } from "../src/lib/remakesKeep";
import { challengeKnob } from "../src/lib/worldChallenge";
import { emptyTrackV2, newLayerV2 } from "../src/lib/track2";

describe("remakes", () => {
  it("name real knobs, a bar of notes, and a style rather than a track", () => {
    for (const r of REMAKES) {
      for (const k of [...r.knobs, ...Object.keys(r.params)]) expect(challengeKnob(r.part, k), `${r.id} ${k}`).toBeDefined();
      for (const k of r.knobs) expect(r.params[k], `${r.id} ${k}`).toBeDefined();
      expect(r.notes.length).toBeGreaterThan(0);
      expect(r.notes.every(e => e.start >= 0 && e.start < 4)).toBe(true);
      expect(r.name).toMatch(/^a /);
    }
  });
  it("keep it: the sound goes on your part, or adds the part", () => {
    const r = REMAKES[0];
    const t = emptyTrackV2();
    const b = newLayerV2(r.part, "mine"); b.events = [{ note: 33, vel: 0.9, start: 0, len: 0.5 }];
    t.layers = [b];
    const kept = keepRemake(t, r);
    expect(kept.layers).toHaveLength(1);
    expect(kept.layers[0].events).toEqual(b.events);
    expect(kept.layers[0].params).toMatchObject(patch(r));
    const added = keepRemake(emptyTrackV2(), r);
    expect(added.layers[0].type).toBe(r.part);
    expect(added.layers[0].events.length).toBe(r.notes.length);
  });
});
