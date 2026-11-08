// Remakes, the engine side (src/lib/remakes.ts; the screen's own test is tests/remakes.test.ts): well-known kinds of sound on our own instruments, for "match this sound". Each
// renders through the real engine (WebAssembly), can be reached with its lit knobs, and sounds clearly unlike
// the part's own defaults.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderPart } from "../src/lib/offline";
import { features, MATCH_PASS, mono, score } from "../src/lib/matchScore";
import { REMAKES, remakeKnob, remakeLayer, remakeStart } from "../src/lib/remakes";
import { emptyTrackV2, newLayerV2 } from "../src/lib/track2";

const wasm = readFileSync(join(__dirname, "../public/engine/ccd_engine.wasm"));
const onEighth = (v: number) => Math.abs(v * 8 - Math.round(v * 8)) < 1e-9;

describe("remakes", () => {
  it("are eight styles, named in lowercase, never a record or an artist", () => {
    expect(REMAKES.length).toBe(8);
    expect(new Set(REMAKES.map(r => r.id)).size).toBe(8);
    for (const r of REMAKES) {
      expect(r.name).toBe(r.name.toLowerCase());
      expect(r.name).toMatch(/^an? /);
      expect(`${r.name} ${r.blurb}`).not.toMatch(/—|–/);
      expect(r.notes.length).toBeGreaterThan(0);
      expect(r.notes.every(e => e.start >= 0 && e.start < 4)).toBe(true);
      // The match score hears the mono sum, so width is never a lit knob.
      expect(r.knobs).not.toContain("width");
    }
  });

  it("can be reached: 2 to 4 lit knobs on eighths, everything else already set from the start", () => {
    for (const r of REMAKES) {
      expect(r.knobs.length, r.id).toBeGreaterThanOrEqual(2);
      expect(r.knobs.length, r.id).toBeLessThanOrEqual(4);
      for (const k of Object.keys(r.target)) expect(remakeKnob(r.part, k), `${r.id} ${k}`).toBeTruthy();
      const start = remakeStart(r);
      for (const k of r.knobs) {
        expect(k in r.target, `${r.id} ${k}`).toBe(true);
        expect(onEighth(r.target[k]) && onEighth(start[k]), `${r.id} ${k} on eighths`).toBe(true);
        expect(start[k], `${r.id} ${k} starts somewhere else`).not.toBe(r.target[k]);
      }
      for (const k of Object.keys(r.target)) if (!r.knobs.includes(k)) expect(start[k], `${r.id} ${k}`).toBe(r.target[k]);
      for (const v of [...Object.values(r.target), ...Object.values(start)]) expect(v >= 0 && v <= 1).toBe(true);
    }
  });

  for (const r of REMAKES) it(`${r.name}: renders, sounds unlike the part's defaults, and is not matched before you turn a knob`, async () => {
    {
      const song = { ...emptyTrackV2(), bpm: r.bpm };
      const plain = newLayerV2(r.part, "__remake");
      plain.events = r.notes.map(e => ({ ...e }));
      const [t, d, s] = await Promise.all([
        renderPart(song, remakeLayer(r, "target"), 4, 0.4, wasm),
        renderPart(song, plain, 4, 0.4, wasm),
        renderPart(song, remakeLayer(r, "start"), 4, 0.4, wasm),
      ]);
      const ft = features(mono(t.l, t.r), t.sr);
      expect(t.l.every(Number.isFinite) && t.r.every(Number.isFinite), r.id).toBe(true);
      expect(t.lufs, `${r.id} is heard`).toBeGreaterThan(-45);
      const vsDefault = score(ft, features(mono(d.l, d.r), d.sr), []);
      const knobs = r.knobs.map(k => ({ target: r.target[k], mine: remakeStart(r)[k] }));
      const vsStart = score(ft, features(mono(s.l, s.r), s.sr), knobs);
      console.log(`${r.name}: ${t.lufs.toFixed(1)} LUFS; against the part's defaults ${vsDefault.close} (spectrum ${vsDefault.spectrum.toFixed(1)} dB, envelope ${vsDefault.envelope.toFixed(1)} dB); where the knobs start ${vsStart.close}`);
      expect(vsDefault.close, `${r.id} unlike the defaults`).toBeLessThan(72);
      expect(vsStart.close, `${r.id} not matched at the start`).toBeLessThan(MATCH_PASS);
    }
  }, 30_000);
});
