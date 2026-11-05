import { describe, expect, it } from "vitest";
import { applyPlayer, PLAYER_DEFAULT } from "../src/lib/players";
import { emptyTrackV2, newLayerV2, type TrackV2 } from "../src/lib/track2";
import { passes, KNOB_TOL, MATCH_PASS, type Score } from "../src/lib/matchScore";

describe("loop round 5: the drummer leaves your hats alone", () => {
  it("a hats part you played keeps its notes; an empty one is filled", () => {
    const drums = { ...newLayerV2("drums", "t"), id: "d" };
    const hats = { ...newLayerV2("hats", "t"), id: "h", events: [0.5, 1.5, 2.5, 3.5].map(s => ({ start: s, note: 46, vel: 0.8, len: 0.25 })) };
    const t: TrackV2 = { ...emptyTrackV2(), layers: [drums, hats] };
    const out = applyPlayer(t, "drummer", "d", { ...PLAYER_DEFAULT, seed: 7 });
    expect(out.layers.find(l => l.id === "h")!.events).toEqual(hats.events);
    expect(out.layers.find(l => l.id === "d")!.events.some(e => e.note === 42)).toBe(false);
    const empty = applyPlayer({ ...t, layers: [drums, { ...hats, events: [] }] }, "drummer", "d", { ...PLAYER_DEFAULT, seed: 7 });
    expect(empty.layers.find(l => l.id === "h")!.events.length).toBeGreaterThan(0);
  });
});

describe("loop round 5: a match needs every lit knob near the target", () => {
  const s = (close: number, worstKnob: number): Score => ({ close, sound: close, settings: close, spectrum: 0, envelope: 0, worstKnob });
  it("close overall with one knob far off does not pass", () => {
    expect(passes(s(88, 0.1))).toBe(false);
    expect(passes(s(88, KNOB_TOL))).toBe(true);
    expect(passes(s(MATCH_PASS - 1, 0))).toBe(false);
    expect(passes(null)).toBe(false);
  });
});
