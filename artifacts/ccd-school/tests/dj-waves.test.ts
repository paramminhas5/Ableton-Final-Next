import { describe, expect, it } from "vitest";
import { bankBands, inLoop, waveH, zoomBeats, zoomPaths, zoomShift, type Bands } from "../src/lib/djWaves";

const flat = (perBeat: number, beats: number, low: number, mid: number, high: number): Bands => {
  const n = perBeat * beats;
  return { perBeat, beats, low: new Float32Array(n).fill(low), mid: new Float32Array(n).fill(mid), high: new Float32Array(n).fill(high) };
};
// The heights the path passes through or bends towards: every L point and every Q control point.
const ys = (d: string) => [...d.matchAll(/([MLQ])([\d.]+) ([\d.]+)/g)].map(m => Number(m[3]));

describe("the zoomed deck view", () => {
  it("draws each band as a mirrored area, one point per bin", () => {
    const p = zoomPaths(flat(4, 2, 1, 0.1, 0.01), 2, 40, 20);
    // 8 bins: a start, the first bin, 7 bends and the last bin on top; the end, and the same underneath
    expect(ys(p.low).length).toBe(1 + 1 + 7 + 1 + 1 + 1 + 7 + 1);
    // full-scale lows reach the edges; -20 dB mids reach half of 92%; -40 dB highs are flat
    expect(Math.min(...ys(p.low))).toBe(0);
    expect(Math.max(...ys(p.low))).toBe(40);
    expect(Math.min(...ys(p.mid))).toBeCloseTo(20 - 20 * 0.5 * 0.92, 1);
    expect(new Set(ys(p.high))).toEqual(new Set([20]));
  });
  it("cutting the low eq takes the red down", () => {
    const b = flat(4, 1, 0.5, 0.1, 0.1);
    const open = Math.min(...ys(zoomPaths(b, 1, 40, 20).low));
    const cut = Math.min(...ys(zoomPaths(b, 1, 40, 20, -15).low));
    expect(cut).toBeGreaterThan(open);
    expect(waveH(0.5 * Math.pow(10, -15 / 20))).toBeLessThan(waveH(0.5));
  });
  it("keeps the playhead in the middle: the track slides left as it plays", () => {
    expect(zoomShift(0, 8, 40)).toBe(160);
    expect(zoomShift(4, 8, 40)).toBe(0);
    expect(zoomShift(5, 8, 40) - zoomShift(4, 8, 40)).toBe(-40);
  });
  it("shows the beats around the playhead, wrapping round a looped track", () => {
    const b = zoomBeats(1, 8, 64);
    expect(b[0]).toEqual({ beat: 61, at: -3 });
    expect(b.at(-1)).toEqual({ beat: 5, at: 5 });
    expect(zoomBeats(32, 8, 64).map(x => x.beat)).toEqual([28, 29, 30, 31, 32, 33, 34, 35, 36]);
  });
  it("goes round inside a loop that is on", () => {
    expect(inLoop(33.5, { start: 32, len: 1 })).toBeCloseTo(32.5);
    expect(inLoop(40, { start: 32, len: 4 })).toBe(32);
    expect(inLoop(10, { start: 32, len: 4 })).toBe(10);
    expect(inLoop(10, null)).toBe(10);
  });
  it("draws a bank track", () => {
    const b = bankBands("warm-up");
    expect(b).not.toBeNull();
    const p = zoomPaths(b!, b!.beats, 40, 20);
    const n = b!.beats * b!.perBeat;
    expect(ys(p.low).length).toBe(2 * (n + 2));
  });
});
