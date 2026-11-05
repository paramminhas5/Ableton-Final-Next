import { describe, expect, it } from "vitest";
import { REAL_TRACKS } from "../src/content/djTracks";
import { ALL_BANK, camelotOf, fitShift, preferReal, similarFirst } from "../src/content/djBank";

describe("param's dj picks in the bank", () => {
  it("thirteen measured picks, numbers only, keys that agree with their camelot codes", () => {
    expect(REAL_TRACKS).toHaveLength(13);
    for (const t of REAL_TRACKS) {
      expect(camelotOf(t.root, t.minor)).toBe(t.camelot);
      expect(t.bpm).toBeGreaterThan(90);
      expect(t.cues[0]).toEqual({ name: "intro", bar: 1 });
      expect(t.name).toBe(t.name.toLowerCase());
    }
    expect(ALL_BANK.length).toBe(20);
  });
  it("a similar real song goes on deck b first", () => {
    // "smooth" is a 128 bpm 6A stand-in; aline umber's track is 128 bpm 6A.
    expect(preferReal("operator").id).toBe("aline-umber-les-mecs-en-chemise-radio-ed");
    expect(preferReal("warm-up").id).toBe("warm-up");
    // With the song's key (a minor, 8A) a blend lesson never starts on a clash.
    const pick = preferReal("operator", "8A");
    const n = fitShift(pick, "8A");
    expect(["7A", "8A", "9A", "8B"]).toContain(camelotOf(pick.root + n, pick.minor));
    const list = similarFirst(128, "4A");
    expect(list[0].id).toBe("barry-can-t-swim-sonder");
  });
});
