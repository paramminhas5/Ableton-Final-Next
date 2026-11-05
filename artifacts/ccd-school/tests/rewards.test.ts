import { describe, expect, it } from "vitest";
import { newTrophies, trophiesFor } from "../src/lib/rewards";

describe("rewards", () => {
  it("unlocks heartbeat when the kick lesson is done", () => {
    const t = trophiesFor({}, { "your-kick": true });
    expect(t.find(x => x.id === "first-kick")?.won).toBe(true);
    expect(t.find(x => x.id === "first-mix")?.won).toBe(false);
  });
  it("reports only trophies that are new", () => {
    const before = { a: { gold: false, at: 1 }, b: { gold: false, at: 1 } };
    const after = { ...before, c: { gold: true, at: 2 } };
    const ids = newTrophies(before, after, {}, { "your-kick": true }).map(t => t.id).sort();
    expect(ids).toEqual(["first-kick", "gold-1", "stripes-3"]);
  });
});
