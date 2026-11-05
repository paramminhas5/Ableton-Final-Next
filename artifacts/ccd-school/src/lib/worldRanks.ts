/**
 * Ranks per world (Param, 5 Nov: "different ranks contextual to different worlds"). Each world has its own
 * ladder of eight, earned by the share of that world's lessons you have done, song lessons counting double.
 * A dj lesson moves your dj rank and nothing else.
 */
import { curPaths, type CurWorld } from "../content/curriculum";

export type WorldRank = { slug: string; name: string; line: string };

export const WORLD_RANKS: Record<CurWorld, WorldRank[]> = {
  fundamentals: [
    { slug: "first-listen", name: "first listen", line: "ears on, nothing assumed." },
    { slug: "counting-in", name: "counting in", line: "you can feel where the one is." },
    { slug: "steady-hands", name: "steady hands", line: "your beats land on the grid." },
    { slug: "ear-open", name: "ear open", line: "pitch and tone start to make sense." },
    { slug: "pattern-reader", name: "pattern reader", line: "scales and rhythms read like words." },
    { slug: "chord-hunter", name: "chord hunter", line: "you hear the harmony under a tune." },
    { slug: "music-brain", name: "music brain", line: "theory is a tool now, not a wall." },
    { slug: "fluent", name: "fluent", line: "you speak music." },
  ],
  producer: [
    { slug: "bedroom-producer", name: "bedroom producer", line: "day one. headphones on." },
    { slug: "loop-maker", name: "loop maker", line: "first loops that won't stop." },
    { slug: "demo-tape", name: "demo tape", line: "ideas leaving the hard drive." },
    { slug: "beatmaker", name: "beatmaker", line: "the drums hit right." },
    { slug: "sound-shaper", name: "sound shaper", line: "synths do what you mean." },
    { slug: "mix-head", name: "mix head", line: "eq, compression, space, on purpose." },
    { slug: "arranger", name: "arranger", line: "loops become songs with a drop." },
    { slug: "finisher", name: "finisher", line: "tracks leave the studio, done." },
  ],
  dj: [
    { slug: "bedroom-dj", name: "bedroom dj", line: "two decks and a lot of questions." },
    { slug: "beat-matcher", name: "beat matcher", line: "the kicks stop galloping." },
    { slug: "smooth-blender", name: "smooth blender", line: "one bass at a time." },
    { slug: "phrase-counter", name: "phrase counter", line: "mixes land on the one." },
    { slug: "warm-up-set", name: "warm-up set", line: "you can open a night." },
    { slug: "crowd-reader", name: "crowd reader", line: "you play the room, not the list." },
    { slug: "peak-time", name: "peak time", line: "the floor is yours." },
    { slug: "resident", name: "resident", line: "they book you back." },
  ],
};

/** Share of a world's weight needed for each rank, from the first to the eighth. */
const AT = [0, 0.04, 0.1, 0.18, 0.3, 0.45, 0.65, 0.88];

/** Every lesson in the world with its weight: song lessons 2, deeper lessons and bonus rounds 1. */
function weights(world: CurWorld): [string, number][] {
  return curPaths(world).flatMap(p => p.items.map(i => [i.slug, i.kind === "song" ? 2 : 1] as [string, number]));
}

export function worldShare(world: CurWorld, done: Record<string, unknown>): number {
  const w = weights(world);
  const total = w.reduce((a, [, n]) => a + n, 0);
  return total ? w.reduce((a, [s, n]) => a + (done[s] ? n : 0), 0) / total : 0;
}

export function worldRankFor(world: CurWorld, done: Record<string, unknown>) {
  const share = worldShare(world, done);
  const ladder = WORLD_RANKS[world];
  let idx = 0;
  AT.forEach((t, i) => { if (share >= t) idx = i; });
  const next = ladder[idx + 1] ?? null;
  const progress = next ? (share - AT[idx]) / (AT[idx + 1] - AT[idx]) : 1;
  return { current: ladder[idx], next, idx, total: ladder.length, progress: Math.max(0, Math.min(1, progress)), share };
}

/** The world rank a finished lesson moved you to, or null when it didn't move. */
export function rankUpFrom(world: CurWorld, before: Record<string, unknown>, after: Record<string, unknown>) {
  const a = worldRankFor(world, before), b = worldRankFor(world, after);
  return b.idx > a.idx ? b : null;
}

export const WORLD_NAME: Record<CurWorld, string> = { fundamentals: "basics", producer: "producer", dj: "dj" };

export const RANK_WORLDS: CurWorld[] = ["fundamentals", "producer", "dj"];

/** Your rank in every world, the one you've gone furthest in first. */
export function allWorldRanks(done: Record<string, unknown>) {
  return RANK_WORLDS.map(world => ({ world, ...worldRankFor(world, done) })).sort((a, b) => b.share - a.share);
}
