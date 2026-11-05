import { describe, expect, it } from "vitest";
import { MAX_DEVICE_MS, slotStart, steadyDelay, beatsToMs, msToBeats } from "../src/lib/latency";

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
  it("loop round 4: a 16th late is the player, not the device", () => {
    // 0.25 of a beat at 120 bpm is 125 ms: a wrong answer, never learned as latency.
    expect(steadyDelay([0.25, 0.26, 0.25, 0.24], 0.15, msToBeats(MAX_DEVICE_MS, 120))).toBe(0);
    expect(steadyDelay([0.15, 0.16, 0.15], 0.15, msToBeats(MAX_DEVICE_MS, 120))).toBeCloseTo(0.15, 2);
    expect(MAX_DEVICE_MS).toBeLessThan(100);
  });
  it("loop round 4: an open hat on the and is kept on the and, not moved onto the kick", () => {
    expect([0.46, 1.55, 2.5, 3.52].map(s => slotStart(s, true, 4))).toEqual([0.5, 1.5, 2.5, 3.5]);
    expect([0.04, 0.97, 2.1, 3.96].map(s => slotStart(s, false, 4))).toEqual([0, 1, 2, 0]);
  });
});
