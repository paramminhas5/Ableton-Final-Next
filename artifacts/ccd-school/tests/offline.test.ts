// Touch and hear, item 3: a/b plays both settings at the same loudness. Each is rendered offline
// through the real engine (WebAssembly) and the louder one is trimmed by the difference.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { levelMatch, renderPart } from "../src/lib/offline";
import { emptyTrackV2, newLayerV2 } from "../src/lib/track2";
import { LAYER_PARAMS } from "../src/engine/params.gen";

const wasm = readFileSync(join(__dirname, "../public/engine/ccd_engine.wasm"));
const DRIVE = LAYER_PARAMS.find(p => p.key === "drive")!.index;

function part() {
  const t = emptyTrackV2();
  const bass = newLayerV2("bass");
  bass.events = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5].map((b, i) => ({ note: 33 + (i % 3) * 5, vel: 0.9, start: b, len: 0.4 }));
  t.layers = [bass];
  return { t, bass };
}

describe("a/b level match", () => {
  it("renders one part through the engine and measures it", async () => {
    const { t, bass } = part();
    const r = await renderPart(t, bass, 4, 0.4, wasm);
    expect(r.l.length).toBe(Math.ceil((2 + 0.4) * 48_000));
    expect(r.lufs).toBeGreaterThan(-30);
    expect(r.lufs).toBeLessThan(-6);
  });
  it("trims the louder setting by the difference, and the same setting not at all", async () => {
    const { t, bass } = part();
    const loud = { ...bass, params: { ...bass.params, [DRIVE]: 0.8 } };
    const m = await levelMatch(t, bass, loud, wasm);
    expect(m.diff).toBeGreaterThan(1);
    expect(m.a).toBe(0);
    expect(m.b).toBeCloseTo(-m.diff, 6);
    const same = await levelMatch(t, bass, bass, wasm);
    expect(Math.abs(same.diff)).toBeLessThan(0.01);
  });
});
