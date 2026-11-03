import { describe, it, expect } from "vitest";
import { findOnsets, knockToSound, median } from "../src/engine/latency";

const SR = 48000;

/** Room noise, a short nail knock, then a decaying tone `gapMs` later. */
function tap(gapMs: number, knockAt = 0.3) {
  const x = new Float32Array(SR);
  let seed = 7;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;
  for (let i = 0; i < x.length; i++) x[i] = rnd() * 0.002;
  const k = Math.round(knockAt * SR);
  for (let i = 0; i < 0.004 * SR; i++) x[k + i] += rnd() * 0.25 * Math.exp(-i / (0.0008 * SR));
  const s = k + Math.round((gapMs / 1000) * SR);
  for (let i = 0; i < 0.1 * SR; i++) x[s + i] += Math.sin((2 * Math.PI * 1700 * i) / SR) * 0.6 * Math.exp(-i / (0.02 * SR));
  return { x, k };
}

describe("latency by microphone", () => {
  it("finds the knock and the sound", () => {
    for (const gap of [6, 12, 25, 48, 90]) {
      const { x, k } = tap(gap);
      const got = knockToSound(x, SR, k + 300);
      expect(got).not.toBeNull();
      expect(Math.abs((got as number) - gap)).toBeLessThan(1.2);
    }
  });

  it("returns null when there is only one onset", () => {
    const x = new Float32Array(SR);
    for (let i = 0; i < 200; i++) x[20000 + i] = 0.5;
    expect(knockToSound(x, SR, 20000)).toBeNull();
  });

  it("onsets ignore the noise floor", () => {
    const { x } = tap(30);
    const o = findOnsets(x, SR);
    expect(o.length).toBe(2);
  });

  it("median", () => {
    expect(median([])).toBeNull();
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 2, 3])).toBe(2.5);
  });
});
