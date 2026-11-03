import { describe, it, expect } from "vitest";
import { BASS_PARAMS, CURVE_VECTORS, DRUM_PAD_PARAMS, INSTRUMENT_BASE, LAYER_PARAMS, MAX_PARAMS } from "../src/engine/params.gen";
import { display, faderDb, faderNorm, fromValue, snapDetent, toValue } from "../src/engine/format";
import { paramIndex } from "../src/engine";

const all = [...LAYER_PARAMS, ...BASS_PARAMS, ...DRUM_PAD_PARAMS];
const byId = (id: string) => all.find(p => p.id === id)!;

describe("engine params (generated from Rust)", () => {
  it("TypeScript curves match what Rust computed", () => {
    for (const v of CURVE_VECTORS) {
      const spec = byId(v.id);
      const got = toValue(spec, v.n);
      if (!Number.isFinite(v.v)) expect(got).toBe(v.v);
      else expect(Math.abs(got - v.v)).toBeLessThan(Math.max(1e-4, Math.abs(v.v) * 1e-5)); // f32 in Rust
    }
  });

  it("fader law: 75% is 0 db, round trips", () => {
    expect(faderDb(0.75)).toBe(0);
    expect(faderDb(1)).toBe(6);
    expect(faderDb(0)).toBe(-Infinity);
    for (let n = 0.01; n <= 1; n += 0.01) expect(faderNorm(faderDb(n))).toBeCloseTo(n, 4);
  });

  it("every curve round trips", () => {
    for (const s of all) {
      for (const n of [0.05, 0.3, 0.5, 0.8, 1]) expect(fromValue(s, toValue(s, n))).toBeCloseTo(n, 4);
    }
  });

  it("wire indices fit and do not collide", () => {
    expect(LAYER_PARAMS.length).toBeLessThanOrEqual(INSTRUMENT_BASE);
    const idx = LAYER_PARAMS.map(p => p.index);
    expect(new Set(idx).size).toBe(idx.length);
    expect(paramIndex("mix.duck")).toBe(11);
    expect(paramIndex("bass.cutoff")).toBe(INSTRUMENT_BASE);
    expect(paramIndex("drums.pad.decay", 3)).toBe(INSTRUMENT_BASE + 3 * 4 + 1);
    expect(paramIndex("drums.pad.level", 15)).toBeLessThan(MAX_PARAMS);
  });

  it("shows values the way the screen should", () => {
    const level = byId("mix.level");
    expect(display(level, 0.75)).toBe("0 db");
    expect(display(level, 0)).toBe("off");
    expect(display(level, 1)).toBe("+6 db");
    const pan = byId("mix.pan");
    expect(display(pan, 0.5)).toBe("centre");
    expect(display(pan, 0.3)).toBe("pan l 20");
    expect(display(pan, 0.9)).toBe("pan r 40");
    const cut = byId("bass.cutoff");
    expect(display(cut, 0)).toBe("40 hz");
    expect(display(cut, 1)).toBe("12 khz");
    expect(display(byId("drums.pad.tune"), 0.75)).toBe("+6 st");
    expect(display(byId("bass.glide"), 0.25)).toBe("100 ms");
  });

  it("catches centre detents", () => {
    const pan = byId("mix.pan");
    expect(snapDetent(pan, 0.51)).toBe(0.5);
    expect(snapDetent(pan, 0.6)).toBe(0.6);
  });

  it("all labels are lowercase", () => {
    for (const s of all) expect(s.label).toBe(s.label.toLowerCase());
  });
});
