import { describe, expect, it } from "vitest";
import { REAL_KIT_ID, realKitLayer, withRealKit } from "../src/lib/realKit";
import { applyTake, withParams } from "../src/lib/lessonTake";
import { newLayerV2, type TrackV2 } from "../src/lib/track2";

function song(): TrackV2 {
  const d = newLayerV2("drums", "your-kick");
  d.events = [0, 1, 2, 3].map(b => ({ start: b, note: 36, vel: 100, len: 0.25 }));
  return { bpm: 120, loopBeats: 4, layers: [d], added: [], updatedAt: 0 } as unknown as TrackV2;
}

describe("recorded kit", () => {
  it("shaping the drums brings the synth kit back so the knobs are heard", () => {
    const real = withRealKit(song());
    expect(real.layers.some(l => l.id === REAL_KIT_ID)).toBe(true);
    const shaped = withParams(real, "drums", { 3: 0.8 });
    expect(shaped.layers.some(l => l.id === REAL_KIT_ID)).toBe(false);
    expect(shaped.layers.find(l => l.type === "drums")?.mute).toBe(false);
  });
  it("a played drum part with no knobs keeps the recorded kit", () => {
    const real = withRealKit(song());
    const t = applyTake(real, "hats", { type: "hats", events: [{ start: 0.5, note: 42, vel: 90, len: 0.1 }] } as never);
    expect(t.layers.some(l => l.id === REAL_KIT_ID)).toBe(true);
    // and the recorded kit plays the new hats too
    expect(realKitLayer(t).events.some(e => e.note === 38)).toBe(true);
  });
  it("leaves the practice layer out of the recorded kit", () => {
    const t = song();
    const p = newLayerV2("drums", "x"); p.id = "__take"; p.events = [{ start: 0, note: 36, vel: 100, len: 0.2 } as never];
    expect(realKitLayer({ ...t, layers: [...t.layers, p] }).events.length).toBe(4);
  });
});
