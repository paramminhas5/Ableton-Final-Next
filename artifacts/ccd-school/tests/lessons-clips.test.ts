import { describe, it, expect } from "vitest";
import { CLIPS } from "../src/content/lessons/clips";
import { clipVariants } from "../src/content/lessons/clipTracks";

describe("lesson clips", () => {
  it("every registered clip has a playable track with notes", () => {
    for (const c of CLIPS) {
      const v = clipVariants(c.id);
      expect(v.length, c.id).toBeGreaterThan(0);
      for (const x of v) expect(x.track.layers.some(l => l.events.length > 0), c.id).toBe(true);
    }
  });
  it("short and long kicks differ only in decay", () => {
    const [a, b] = clipVariants("short-vs-long-kick");
    expect(a.track.layers[0].events).toEqual(b.track.layers[0].events);
    expect(a.track.layers[0].params).not.toEqual(b.track.layers[0].params);
  });
});
