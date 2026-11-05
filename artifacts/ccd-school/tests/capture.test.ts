import { describe, expect, it } from "vitest";
import { captureTake, trimPlayed, type Played } from "../src/lib/capture";

const ms = 500; // one beat at 120 bpm
const o = { loop: 4, bpm: 120, snap: "1/16" as const, swing: 0, now: 100000 };
const free = (beat: number, note = 36, len = 0.25): Played => ({ layerId: "a", note, vel: 0.8, tOn: 1000 + beat * ms, tOff: 1000 + (beat + len) * ms, bOn: null, bOff: null });

describe("capture", () => {
  it("played with the loop stopped: the first note lands on beat one, the rest follow at the tempo", () => {
    const take = captureTake([free(0.03), free(1.02), free(2)], "a", o);
    expect(take.map(e => e.start)).toEqual([0, 1, 2]);
  });
  it("keeps only the last loop's worth", () => {
    const take = captureTake([free(0), free(1), free(5), free(6), free(7.5)], "a", o);
    expect(take.length).toBe(3);
    expect(take[0].start).toBe(0);
  });
  it("played over the running loop: notes keep the beats the engine reported, wrapping the loop end", () => {
    const p: Played[] = [
      { layerId: "a", note: 45, vel: 0.9, tOn: 0, tOff: 200, bOn: 2.01, bOff: 2.4 },
      { layerId: "a", note: 47, vel: 0.9, tOn: 900, tOff: 1500, bOn: 3.76, bOff: 0.3 },
    ];
    const take = captureTake(p, "a", o);
    expect(take[0]).toMatchObject({ note: 45, start: 2 });
    expect(take[1].start).toBe(3.75);
    expect(take[1].len).toBeCloseTo(0.54, 2);
  });
  it("only the layer asked for, and nothing when nothing was played", () => {
    expect(captureTake([{ ...free(0), layerId: "b" }], "a", o)).toEqual([]);
  });
  it("forgets old notes", () => {
    expect(trimPlayed([free(0), free(100)], 1000 + 101 * ms, 10 * ms).length).toBe(1);
  });
});
