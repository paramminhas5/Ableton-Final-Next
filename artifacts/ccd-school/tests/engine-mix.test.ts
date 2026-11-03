import { describe, expect, it } from "vitest";
import { FIX, MASTER_LAYER, OUT } from "../src/engine/params.gen";
import { MixReader, decodeClash, panName, rangeName, stageSize, stageY } from "../src/engine/mix";
import type { EngineEvent } from "../src/engine/host";
import { emptyTrackV2, masterOf } from "../src/lib/track2";

const ev = (kind: number, layer: number, note: number, flags: number, vel: number, aux: number, beat: number): EngineEvent => ({ kind, layer, note, flags, vel, aux, beat });

describe("mix readings", () => {
  it("builds a frame from meters, bands, clashes and the master", () => {
    const r = new MixReader();
    expect(r.feed([ev(OUT.meter, 0, 92, 1, -6, -14, 0), ev(OUT.bands, 0, 0, 0, -10, -30, -60)])).toBeNull();
    const clashFlags = 0 | (0 << 2) | (FIX.duck << 5) | (FIX.eq << 7);
    const frame = r.feed([
      ev(OUT.meter, 2, 7000, 1, -12, -24, 0.6),
      ev(OUT.clash, 0, 1, clashFlags, 0.7, 0.55, 0.48),
      ev(OUT.masterMeter, MASTER_LAYER, 150, 1 | (1 << 8), -1.2, -9, 2.5),
    ]);
    expect(frame).not.toBeNull();
    expect(frame!.layers[0]).toMatchObject({ active: true, centreHz: 92, pan: 0, low: -10, high: -60 });
    expect(frame!.layers[2]).toMatchObject({ centreHz: 7000, pan: 0.6 });
    expect(frame!.layers[1]).toBeNull();
    expect(frame!.clashes).toEqual([{ target: 0, other: 1, group: "low", band: 0, severity: 0.7, fix: "duck", value: 0.55, fix2: "eq", value2: 0.48 }]);
    expect(frame!.master).toEqual({ truePeakDb: -1.2, lufs: -9, glueGrDb: 2.5, limiterGrDb: 1.5, comparing: true });
    // The next frame starts with no clashes.
    const next = r.feed([ev(OUT.masterMeter, MASTER_LAYER, 0, 0, -3, -10, 0)]);
    expect(next!.clashes).toEqual([]);
  });

  it("decodes a mid clash with a pan fix and no second fix", () => {
    const c = decodeClash(ev(OUT.clash, 4, 3, 1 | (3 << 2) | (FIX.pan << 5) | (FIX.none << 7), 0.4, 0.2, 0));
    expect(c).toMatchObject({ target: 4, other: 3, group: "mid", band: 3, fix: "pan", fix2: null });
  });
});

describe("the stage", () => {
  it("places pitch on a log scale, low at the bottom", () => {
    expect(stageY(40)).toBe(0);
    expect(stageY(12_000)).toBe(1);
    expect(stageY(700)).toBeGreaterThan(0.45);
    expect(stageY(700)).toBeLessThan(0.55);
    expect(stageY(0)).toBe(0.5);
  });
  it("makes loud things big", () => {
    expect(stageSize(-6)).toBe(46);
    expect(stageSize(-60)).toBe(18);
    expect(stageSize(-20)).toBeGreaterThan(stageSize(-30));
  });
  it("names ranges and pans the way the screen prints them", () => {
    expect(rangeName(90)).toBe("low");
    expect(rangeName(300)).toBe("low mid");
    expect(rangeName(9000)).toBe("high");
    expect(panName(0)).toBe("c");
    expect(panName(-0.4)).toBe("l 20");
    expect(panName(0.8)).toBe("r 40");
  });
});

describe("master params on the track", () => {
  it("fall back to the registry defaults", () => {
    const t = emptyTrackV2();
    expect(masterOf(t, 0)).toBe(0.75);
    expect(masterOf(t, 1)).toBe(0.25);
    expect(masterOf({ ...t, master: { 0: 0.6 } }, 0)).toBe(0.6);
  });
});
