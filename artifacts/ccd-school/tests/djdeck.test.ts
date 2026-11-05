import { describe, expect, it } from "vitest";
import { bankLayers, bankPattern, bankTrack, CUES, layDeck } from "../src/content/djBank";

describe("deck b", () => {
  const t = bankTrack("operator"); // 128
  it("has sections: no drums in the break, no hats in the intro", () => {
    const p = bankPattern(t);
    expect(p.drums.some(e => e.start >= 48 && e.start < 56)).toBe(false);
    expect(p.hats.some(e => e.start < 16)).toBe(false);
    expect(CUES.map(c => c.at)).toEqual([0, 16, 48, 56]);
  });
  it("at the same tempo, a hot cue starts the track there", () => {
    const [drums] = bankLayers(t, 128, 128, 8, "b", { off: 48 });
    expect(drums.events.length).toBe(0); // the break has no drums
    const [d2] = bankLayers(t, 128, 128, 8, "b", { off: 56 });
    expect(d2.events[0].start).toBe(0);
  });
  it("a faster deck squeezes its beats onto the transport", () => {
    const [drums] = bankLayers(t, 128, 120, 8, "b");
    const kicks = drums.events.filter(e => e.note === 36).map(e => e.start);
    expect(kicks[1]).toBeCloseTo(120 / 128, 5);
  });
  it("a loop goes round its stretch", () => {
    const evs = [{ start: 0, len: 0.25, note: 36, vel: 1 }, { start: 1, len: 0.25, note: 38, vel: 1 }];
    const out = layDeck(evs, 1, 8, { off: 0, loop: { start: 0, len: 2 } });
    expect(out.map(e => e.start)).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
  });
  it("key shift moves the bass only", () => {
    const a = bankPattern(t), b = bankPattern(t, 2);
    expect(b.bass[0].note - a.bass[0].note).toBe(2);
    expect(b.drums[0].note).toBe(a.drums[0].note);
  });
});
