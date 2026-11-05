import { describe, expect, it } from "vitest";
import { ampEnv, dragCutoff, dragTime, envDot, envHandles, envPath, filterDb, filterEnv, freqX, levelAt, stageAt, type Env } from "../src/lib/shapes";
import { LEAD_PARAMS } from "../src/engine/params.gen";

const env: Env = { a: 0.01, d: 0.3, s: 0.9, r: 0.4, kind: "adsr" };

describe("envelope, as env.rs plays it", () => {
  it("attack reaches full level exactly at the attack time", () => {
    expect(levelAt(env, 0.01)).toBeCloseTo(1, 4);
    expect(levelAt(env, 0.005)).toBeLessThan(1);
    expect(stageAt(env, 0.005, null)).toBe("attack");
  });
  it("decay is 95% of the way to sustain after the decay time", () => {
    const l = levelAt(env, 0.01 + 0.3);
    expect((1 - l) / (1 - 0.9)).toBeCloseTo(0.95, 2);
  });
  it("release falls from where the note was let go", () => {
    const off = 1;
    const l0 = levelAt(env, off);
    expect(levelAt(env, off + 0.4, off) / l0).toBeCloseTo(Math.exp(-3), 3);
    expect(stageAt(env, off + 0.1, off)).toBe("release");
  });
  it("lead attack and release come from the knobs, in the engine's units", () => {
    const a = LEAD_PARAMS.find(p => p.key === "attack")!;
    const e = ampEnv("lead", { [a.index]: 1 })!;
    expect(e.a).toBeCloseTo(0.8, 3);
    expect(e.s).toBe(0.9);
  });
  it("a drum pad decays over its length, scaled by its decay knob", () => {
    expect(ampEnv("drums", {}, 0)!.d).toBeCloseTo(0.45, 3);
    expect(ampEnv("drums", { 17: 1 }, 0)!.d).toBeCloseTo(0.45 * 4, 3);
    expect(levelAt(ampEnv("drums", {}, 0)!, 0.45)).toBeCloseTo(0.001, 4);
  });
  it("bass's filter envelope closes fully, its amp holds at 55%", () => {
    expect(ampEnv("bass", {})!.s).toBe(0.55);
    expect(filterEnv("bass", {})!.env.s).toBe(0);
  });
  it("the drawn path starts at zero and the dot moves left to right", () => {
    const p = envPath(env);
    expect(p[0]).toEqual([0, 0]);
    const xs = [0.001, 0.05, 0.2, 0.5].map(t => envDot(env, t, null).x);
    expect([...xs].sort((a, b) => a - b)).toEqual(xs);
    expect(envDot(env, 1.1, 1).x).toBeGreaterThan(envDot(env, 0.9, null).x);
  });
});

describe("filter curve, as the ladder in filter.rs", () => {
  it("passes the bass flat with no resonance and is 12 db down at the cutoff", () => {
    expect(filterDb(20, 1000, 0)).toBeCloseTo(0, 1);
    expect(filterDb(1000, 1000, 0)).toBeCloseTo(-12.04, 1);
  });
  it("peaks at the cutoff as resonance rises, and loses some bass", () => {
    expect(filterDb(1000, 1000, 1)).toBeGreaterThan(25);
    expect(filterDb(20, 1000, 1)).toBeLessThan(-3);
  });
  it("falls 24 db an octave well above the cutoff", () => {
    const d = filterDb(8000, 1000, 0) - filterDb(16000, 1000, 0);
    expect(d).toBeGreaterThan(22);
    expect(d).toBeLessThan(26);
  });
});

describe("filter characters, as engine item 7 built them", () => {
  it("scream and smooth keep their bass and fall 12 db an octave", () => {
    for (const c of ["scream", "smooth"] as const) {
      expect(filterDb(20, 1000, 0.8, c)).toBeGreaterThan(-4);
      const d = filterDb(8000, 1000, 0, c) - filterDb(16000, 1000, 0, c);
      expect(d).toBeGreaterThan(10);
      expect(d).toBeLessThan(13);
    }
  });
  it("scream peaks far higher than smooth at full resonance", () => {
    expect(filterDb(1000, 1000, 1, "scream")).toBeGreaterThan(filterDb(1000, 1000, 1, "smooth") + 10);
  });
});

describe("drag on the picture", () => {
  it("an envelope corner dragged to a time lands its knob on that time", () => {
    for (const engine of ["lead", "chords"]) {
      const h = envHandles(engine, {});
      expect(h.a && h.r).toBeTruthy();
      const a = ampEnv(engine, { [h.a!.index]: h.a!.toN(0.12), [h.r!.index]: h.r!.toN(0.9) })!;
      expect(a.a).toBeCloseTo(0.12, 4);
      expect(a.r).toBeCloseTo(0.9, 4);
    }
    const b = envHandles("bass", {});
    expect(ampEnv("bass", { [b.d!.index]: b.d!.toN(0.4) })!.d).toBeCloseTo(0.4, 4);
    for (const [pad, t] of [[0, 0.3], [4, 0.05]]) {
      const d = envHandles("drums", {}, pad);
      expect(ampEnv("drums", { [d.d!.index]: d.d!.toN(t) }, pad)!.d).toBeCloseTo(t, 4);
    }
  });
  it("the filter knee follows the finger: the axis spans 1000x, so a tenth of it is 2x", () => {
    expect(dragCutoff(1000, 0)).toBe(1000);
    expect(dragCutoff(1000, 1 / 3)).toBeCloseTo(10000, 3);
    expect(freqX(dragCutoff(440, 0.2)) - freqX(440)).toBeCloseTo(0.2, 6);
    expect(dragTime(0.1, 0.5)).toBeCloseTo(0.4, 6);
    expect(dragTime(0.1, -0.5)).toBeCloseTo(0.025, 6);
  });
});
