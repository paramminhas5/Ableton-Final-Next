import { describe, expect, it } from "vitest";
import { filterAt, PUNCH_KEYS, punchReadout, repeatBeats, tapeSeconds } from "../src/lib/punch";
import { PUNCH } from "../src/engine/params.gen";

describe("punch-in effects", () => {
  it("four keys, in the engine's modes", () => {
    expect(PUNCH_KEYS.map(k => k.label)).toEqual(["beat repeat", "filter", "tape stop", "reverb throw"]);
    expect(PUNCH_KEYS.map(k => k.mode)).toEqual([PUNCH.repeat, PUNCH.filter, PUNCH.tapeStop, PUNCH.throw]);
    expect(PUNCH.off).toBe(0);
  });
  it("reads the amount the way the engine plays it (engine/tests/punch.rs)", () => {
    expect([0, 0.3, 0.6, 0.99].map(repeatBeats)).toEqual([1, 0.5, 0.25, 0.125]);
    expect(tapeSeconds(0.2)).toBeCloseTo(0.52);
    expect(filterAt(0.1).hz).toBeCloseTo(327, 0);
    expect(filterAt(0.9)).toEqual({ hz: expect.closeTo(1386, 0), hp: true });
    expect(punchReadout("repeat", 0.6)).toBe("1/16");
    expect(punchReadout("filter", 0.1)).toBe("low pass 327 hz");
    expect(punchReadout("tapeStop", 1)).toBe("2.0 s");
  });
});
