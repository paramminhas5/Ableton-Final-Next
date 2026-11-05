// Touch and hear, item 13: "match this sound". The target and yours are rendered through the real engine
// (WebAssembly) and compared by spectrum, envelope and settings.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderPart } from "../src/lib/offline";
import { features, MATCH_PASS, mono, score } from "../src/lib/matchScore";
import { emptyTrackV2, newLayerV2, type LayerV2 } from "../src/lib/track2";
import { BASS_PARAMS, INSTRUMENT_BASE, LEAD_PARAMS } from "../src/engine/params.gen";

const wasm = readFileSync(join(__dirname, "../public/engine/ccd_engine.wasm"));
const t = emptyTrackV2();

async function closeness(layer: LayerV2, target: Record<number, number>, mine: Record<number, number>) {
  const [a, b] = await Promise.all([renderPart(t, { ...layer, params: { ...layer.params, ...target } }, 4, 0.4, wasm), renderPart(t, { ...layer, params: { ...layer.params, ...mine } }, 4, 0.4, wasm)]);
  const knobs = Object.keys(target).map(k => ({ target: target[Number(k)], mine: mine[Number(k)] ?? 0.5 }));
  return score(features(mono(a.l, a.r), a.sr), features(mono(b.l, b.r), b.sr), knobs);
}

const kick = () => { const l = newLayerV2("drums"); l.events = [0, 1, 2, 3].map(b => ({ note: 36, vel: 0.9, start: b, len: 0.2 })); return l; };
const bass = () => { const l = newLayerV2("bass"); l.events = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5].map((b, i) => ({ note: 33 + (i % 2) * 7, vel: 0.9, start: b, len: 0.4 })); return l; };
const lead = () => { const l = newLayerV2("lead"); l.events = [0, 1, 2, 3].map((b, i) => ({ note: 64 + (i % 2) * 3, vel: 0.9, start: b, len: 0.75 })); return l; };
const D = INSTRUMENT_BASE + 1, T = INSTRUMENT_BASE + 0; // kick pad: decay, tune
const B = (k: string) => BASS_PARAMS.find(p => p.key === k)!.index;
const L = (k: string) => LEAD_PARAMS.find(p => p.key === k)!.index;

describe("match this sound", () => {
  it("the same settings score 100", async () => {
    const s = await closeness(kick(), { [D]: 0.25, [T]: 0.35 }, { [D]: 0.25, [T]: 0.35 });
    expect(s.close).toBe(100);
  });
  it("a kick: far off fails, close passes, and the score grows as you get closer", async () => {
    const target = { [D]: 0.2, [T]: 0.3 };
    const far = await closeness(kick(), target, { [D]: 0.5, [T]: 0.5 });
    const mid = await closeness(kick(), target, { [D]: 0.3, [T]: 0.36 });
    const near = await closeness(kick(), target, { [D]: 0.22, [T]: 0.31 });
    console.log(`kick: far ${far.close} (spectrum ${far.spectrum.toFixed(1)} dB, envelope ${far.envelope.toFixed(1)} dB), mid ${mid.close}, near ${near.close}`);
    expect(far.close).toBeLessThan(MATCH_PASS - 15);
    expect(mid.close).toBeGreaterThan(far.close);
    expect(near.close).toBeGreaterThanOrEqual(MATCH_PASS);
  });
  it("a bass: cutoff and decay", async () => {
    const target = { [B("cutoff")]: 0.3, [B("decay")]: 0.25 };
    const far = await closeness(bass(), target, { [B("cutoff")]: 0.45, [B("decay")]: 0.45 });
    const near = await closeness(bass(), target, { [B("cutoff")]: 0.31, [B("decay")]: 0.27 });
    console.log(`bass: far ${far.close} (spectrum ${far.spectrum.toFixed(1)} dB, envelope ${far.envelope.toFixed(1)} dB), near ${near.close}`);
    expect(far.close).toBeLessThan(MATCH_PASS - 10);
    expect(near.close).toBeGreaterThanOrEqual(MATCH_PASS);
  });
  it("a lead: attack and release", async () => {
    const target = { [L("attack")]: 0.6, [L("release")]: 0.7 };
    const far = await closeness(lead(), target, { [L("attack")]: 0.1, [L("release")]: 0.4 });
    const near = await closeness(lead(), target, { [L("attack")]: 0.58, [L("release")]: 0.68 });
    console.log(`lead: far ${far.close} (spectrum ${far.spectrum.toFixed(1)} dB, envelope ${far.envelope.toFixed(1)} dB), near ${near.close}`);
    expect(far.close).toBeLessThan(MATCH_PASS - 10);
    expect(near.close).toBeGreaterThanOrEqual(MATCH_PASS);
  });
});
