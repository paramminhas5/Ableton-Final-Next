import { beforeEach, describe, expect, it, vi } from "vitest";
import { CHALLENGES, challengeKnob, clockStars, copyTarget, mainStars, matchPart, matchRoundStars, matchSetup, ownCopy } from "../src/lib/worldChallenge";
import { patternProblems } from "../src/lib/copyEar";
import { emptyTrackV2, newLayerV2, type TrackV2 } from "../src/lib/track2";
import { curItem } from "../src/content/curriculum";

const song = (): TrackV2 => {
  const t = emptyTrackV2();
  const d = newLayerV2("drums", "t"); d.events = [0, 1, 2, 3].map(start => ({ note: 36, vel: 0.9, start, len: 0.2 })).concat([{ note: 39, vel: 0.8, start: 1, len: 0.2 }, { note: 39, vel: 0.8, start: 3, len: 0.2 }]);
  const b = newLayerV2("bass", "t"); b.events = [{ note: 33, vel: 0.9, start: 0.02, len: 0.5 }, { note: 45, vel: 0.9, start: 1.5, len: 0.25 }, { note: 40, vel: 0.9, start: 6, len: 0.25 }];
  t.layers = [d, b];
  return t;
};

describe("end-of-world challenges", () => {
  it("name real knobs, real lessons and valid patterns", () => {
    for (const ch of Object.values(CHALLENGES)) {
      expect(curItem(ch.after)?.kind, ch.after).toBe("song");
      for (const r of [...ch.main, ...ch.bonus]) {
        if (r.kind === "match") for (const k of r.knobs) expect(challengeKnob(r.part, k), `${ch.world} ${r.id} ${k}`).toBeDefined();
        else expect(patternProblems(r.layer, r.fallback), `${ch.world} ${r.id}`).toEqual([]);
      }
    }
  });

  it("copy your own part: the first bar on the grid, without hats", () => {
    const own = ownCopy(song(), "bass")!;
    expect(own.map(e => [e.start, e.note])).toEqual([[0, 33], [1.5, 45]]);
    expect(ownCopy(song(), "drums")!.length).toBe(6);
    expect(ownCopy(song(), "lead")).toBeNull();
    const r = CHALLENGES.producer.main[1];
    expect(copyTarget(song(), r).own).toBe(true);
    expect(copyTarget(emptyTrackV2(), r).own).toBe(false);
    expect(copyTarget(emptyTrackV2(), r).events.length).toBeGreaterThan(2);
  });

  it("match your own part: targets on the notches, knobs starting at least two notches away", () => {
    for (const ch of Object.values(CHALLENGES)) for (const r of [...ch.main, ...ch.bonus]) {
      if (r.kind !== "match") continue;
      const { layer } = matchPart(song(), r.part);
      const knobs = r.knobs.map(k => challengeKnob(r.part, k)!);
      const { target, start } = matchSetup(layer, knobs, r.notches, 7);
      for (const k of knobs) {
        expect(Math.abs(target[k.index] * r.notches - Math.round(target[k.index] * r.notches))).toBeLessThan(1e-9);
        expect(Math.abs(start[k.index] - target[k.index]) * r.notches).toBeGreaterThanOrEqual(1.99);
      }
    }
  });

  it("scores with stars", () => {
    expect(mainStars(3, 2)).toBe(2);
    expect(mainStars(3, 0)).toBe(1);
    expect(matchRoundStars(1)).toBe(3);
    expect(matchRoundStars(4)).toBe(2);
    expect(matchRoundStars(9)).toBe(1);
    expect(clockStars(30, 60)).toBe(3);
    expect(clockStars(5, 60)).toBe(2);
    expect(clockStars(0, 60)).toBe(1);
  });
});

describe("challenge records", () => {
  beforeEach(() => {
    vi.resetModules();
    const store = new Map<string, string>();
    vi.stubGlobal("localStorage", { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v), removeItem: (k: string) => void store.delete(k) });
  });
  it("keep the best stars per round, and the challenge's from its rounds", async () => {
    const w = await import("../src/lib/worldChallenge");
    w.saveRound("producer", "lead", 3, false);
    expect(w.readChallenges().producer!.main).toBe(1);
    w.saveRound("producer", "bass", 2, false);
    expect(w.readChallenges().producer!.main).toBe(2);
    w.saveRound("producer", "bass", 1, false);
    expect(w.readChallenges().producer!.rounds.bass).toBe(2);
    w.saveRound("producer", "kick", 2, true);
    expect(w.worldStars(w.readChallenges().producer, "producer")).toEqual({ main: 2, bonus: 2, bonusOf: 6 });
  });
});
