import { describe, expect, it } from "vitest";
import { allWorldRanks, rankUpFrom, worldRankFor, WORLD_RANKS } from "../src/lib/worldRanks";
import { curPaths, songItems } from "../src/content/curriculum";

describe("ranks per world", () => {
  it("every world has eight ranks, lowercase", () => {
    for (const l of Object.values(WORLD_RANKS)) {
      expect(l).toHaveLength(8);
      for (const r of l) expect(r.name).toBe(r.name.toLowerCase());
    }
  });
  it("a dj lesson moves the dj rank and nothing else", () => {
    const dj = Object.fromEntries(songItems("dj").slice(0, 3).map(i => [i.slug, true]));
    expect(worldRankFor("dj", dj).idx).toBeGreaterThan(0);
    expect(worldRankFor("producer", dj).idx).toBe(0);
    expect(allWorldRanks(dj)[0].world).toBe("dj");
    expect(worldRankFor("dj", {}).current.name).toBe("bedroom dj");
  });
  it("finishing every lesson in a world reaches its top rank, and a rank-up is reported once", () => {
    const all = Object.fromEntries(curPaths("producer").flatMap(p => p.items).map(i => [i.slug, true]));
    expect(worldRankFor("producer", all).current.name).toBe("finisher");
    const first = songItems("producer")[0].slug;
    const before = {};
    const after = { [first]: true, [songItems("producer")[1].slug]: true, [songItems("producer")[2].slug]: true };
    const up = rankUpFrom("producer", before, after);
    expect(up?.current.name).toBe("loop maker");
    expect(rankUpFrom("producer", after, after)).toBeNull();
  });
});
