// Engine 2, item 6: the wav export renders the song offline through the real engine (WebAssembly)
// and lands it on the export loudness under the true-peak ceiling.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { bounce } from "../src/lib/bounce";
import { emptyTrackV2, newLayerV2, type TrackV2 } from "../src/lib/track2";
import { EXPORT_LOUD_LUFS, EXPORT_LUFS } from "../src/engine/params.gen";

const wasm = readFileSync(join(__dirname, "../public/engine/ccd_engine.wasm"));

function song(): TrackV2 {
  const t = emptyTrackV2();
  const drums = newLayerV2("drums");
  drums.events = [0, 1, 2, 3].map(b => ({ note: 36, vel: 0.9, start: b, len: 0.2 })).concat([1, 3].map(b => ({ note: 39, vel: 0.8, start: b, len: 0.2 })));
  const bass = newLayerV2("bass");
  bass.events = [0.5, 1.5, 2.5, 3.5].map(b => ({ note: 33, vel: 0.9, start: b, len: 0.25 }));
  t.layers = [drums, bass];
  return t;
}

describe("wav export", () => {
  it("renders the song and lands on -14 LUFS under -1 dBTP", async () => {
    const b = await bounce(song(), false, wasm);
    expect(b.wav.type).toBe("audio/wav");
    expect(b.wav.size).toBeGreaterThan(44 + Math.floor(b.seconds * 48_000) * 4 - 8);
    expect(Math.abs(b.lufs - EXPORT_LUFS)).toBeLessThan(0.15);
    expect(b.truePeakDb).toBeLessThanOrEqual(-0.95);
  });
  it("the loud option lands on -9 LUFS, still under the ceiling", async () => {
    const b = await bounce(song(), true, wasm);
    expect(Math.abs(b.lufs - EXPORT_LOUD_LUFS)).toBeLessThan(0.15);
    expect(b.truePeakDb).toBeLessThanOrEqual(-0.95);
  });
});
