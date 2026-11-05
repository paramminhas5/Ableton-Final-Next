import { describe, expect, it } from "vitest";
import { steadyDelay, beatsToMs, msToBeats } from "../src/lib/latency";

describe("forgiving play-in", () => {
  it("a steady lateness is the device: taken out", () => {
    expect(steadyDelay([0.2, 0.22, 0.19, 0.21], 0.15)).toBeCloseTo(0.21, 2);
    expect(Math.round(beatsToMs(0.2, 120))).toBe(100);
    expect(msToBeats(100, 120)).toBeCloseTo(0.2, 5);
  });
  it("a wobbly or early take is the player: left alone", () => {
    expect(steadyDelay([0.3, 0.02, 0.2, 0.1], 0.15)).toBe(0);
    expect(steadyDelay([-0.2, -0.21, -0.2], 0.15)).toBe(0);
    expect(steadyDelay([0.2, 0.2], 0.15)).toBe(0);
    expect(steadyDelay([0.05, 0.06, 0.05], 0.15)).toBe(0);
  });
});
