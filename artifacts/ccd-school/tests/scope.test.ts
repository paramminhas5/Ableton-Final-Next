// Touch and hear, item 4: the mix screen's spectrum, from the engine's scope ring.
import { describe, expect, it } from "vitest";
import { magnitudes, spectrumBands } from "../src/components/m1/Scope";

const sine = (hz: number, amp = 1, n = 2048, sr = 48000) => Float32Array.from({ length: n }, (_, i) => amp * Math.sin((2 * Math.PI * hz * i) / sr));

describe("spectrum", () => {
  it("a full-scale sine reads 0 dB at its frequency and far less elsewhere", () => {
    const bands = spectrumBands(magnitudes(sine(1000)), 48000, 60);
    const at = Math.floor((Math.log(1000 / 20) / Math.log(1000)) * 60);
    expect(bands[at]).toBeGreaterThan(-1.5);
    expect(bands[at]).toBeLessThan(0.5);
    expect(bands[5]).toBeLessThan(-40);
    expect(bands[58]).toBeLessThan(-40);
  });
  it("half the level reads 6 dB lower", () => {
    const at = Math.floor((Math.log(1000 / 20) / Math.log(1000)) * 60);
    const a = spectrumBands(magnitudes(sine(1000)), 48000, 60)[at];
    const b = spectrumBands(magnitudes(sine(1000, 0.5)), 48000, 60)[at];
    expect(a - b).toBeCloseTo(6.02, 1);
  });
});
