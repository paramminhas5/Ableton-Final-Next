/**
 * Find your level: a short placement for learners who already make music (src/components/m1/Placement.tsx).
 * It is done by ear and by hand, not by questions: a timing take, a copy by ear, a few ears and a match. The
 * scores pick where in a world's song lessons the learner starts. The song lessons before that point are
 * marked passed, and their parts still go into the learner's song, as if each lesson had been skipped
 * through (the lesson's own pattern, or what its copy step would have given), so every later lesson that acts
 * on the song has its kick, its bass and the rest. Can be taken again; a lower result gives back the lessons it
 * had passed (never ones the learner did), a higher one passes more.
 */
import { worldSteps, type WorldId } from "./worldOrder";

/** What the placement measured. Nulls are stations the learner skipped. */
export type PlaceScores = {
  /** Median distance of the taps from the beat, in ms. */
  timingMs: number | null;
  /** Stars for the copy by ear: 0 when it wasn't solved. */
  copyStars: 0 | 1 | 2 | 3;
  /** Ears right, out of how many. */
  ears: number;
  earsTotal: number;
  /** Stars for the match: 0 when it didn't match. */
  matchStars: 0 | 1 | 2 | 3;
};

export type PlaceLevel = 0 | 1 | 2 | 3;

/** Taps within this of the beat (median) count as steady time; the tighter one as sharp. */
export const STEADY_MS = 45;
export const SHARP_MS = 28;

/**
 * The level the scores earn. Each level needs everything below it:
 * 1 steady time and a pattern copied by ear (two stars or more): the drums lessons are known.
 * 2 a sound matched and the ears nearly all right: the first synth and low-end lessons are known.
 * 3 sharp time, every ear, a three-star copy and a two-star match: sound design is known too.
 */
export function placeLevel(s: PlaceScores): PlaceLevel {
  const steady = s.timingMs !== null && s.timingMs <= STEADY_MS;
  if (!steady || s.copyStars < 2) return 0;
  if (s.matchStars < 1 || s.ears < s.earsTotal - 1) return 1;
  const sharp = s.timingMs !== null && s.timingMs <= SHARP_MS;
  if (!sharp || s.copyStars < 3 || s.ears < s.earsTotal || s.matchStars < 2) return 2;
  return 3;
}

/**
 * Where each level starts, per world: the song lesson the learner lands on. Beyond level 3 the placement
 * can't tell (mixing, arranging and a dj set aren't heard in three minutes), so it stops there.
 */
export const LEVEL_START: Record<WorldId, [string, string, string, string]> = {
  producer: ["your-kick", "first-bass", "kick-designer", "balance"],
  fundamentals: ["tempo-bpm", "what-is-sound", "waveforms", "major-scale"],
  dj: ["what-is-djing", "tempo-bpm-dj", "phrasing", "music-library-dj"],
};

/** What each level means, in words, for the result screen. */
export const LEVEL_SAYS: Record<WorldId, [string, string, string, string]> = {
  producer: ["start at the top: your kick", "you have the drums: start at your first bass line", "you have drums, bass and a synth: start at sound design", "you have the sound: start at the mix"],
  fundamentals: ["start at the top: the pulse", "you have the pulse: start at sound", "you have pulse and pitch: start at waves and the studio", "start at melody"],
  dj: ["start at the top: the booth", "you have the beat: start at matching tempo", "start at the blend", "start at the library"],
};

export type PlaceResult = { world: WorldId; level: PlaceLevel; slug: string; index: number; skipped: string[]; scores: PlaceScores; at: number };

/** Where the scores put a learner in a world: the lesson they start on and the song lessons before it. */
export function placeIn(world: WorldId, scores: PlaceScores, now = Date.now()): PlaceResult {
  const level = placeLevel(scores);
  const steps = worldSteps(world);
  let index = steps.findIndex(s => s.slug === LEVEL_START[world][level]);
  if (index < 0) index = 0;
  return { world, level, slug: steps[index]?.slug ?? LEVEL_START[world][0], index, skipped: steps.slice(0, index).map(s => s.slug), scores, at: now };
}

/** Median of the absolute offsets, in ms; null with fewer than four taps. */
export function medianOffset(offsets: number[]): number | null {
  if (offsets.length < 4) return null;
  const a = offsets.map(Math.abs).sort((x, y) => x - y);
  return Math.round(a[Math.floor(a.length / 2)]);
}

/** Each tap's distance in ms from the nearest beat, from beat positions (in beats) at the tap and the tempo. */
export function tapOffsets(beats: number[], bpm: number): number[] {
  const ms = 60000 / bpm;
  return beats.map(b => (b - Math.round(b)) * ms);
}

// ── the record of the last placement, for the learn page and a retake ─────────

const KEY = "ccd.placement.v1";
export function readPlacement(): PlaceResult | null {
  try { const r = JSON.parse(localStorage.getItem(KEY) ?? "null") as PlaceResult | null; return r && r.world && typeof r.index === "number" ? r : null; } catch { return null; }
}
export function savePlacement(r: PlaceResult) {
  try { localStorage.setItem(KEY, JSON.stringify(r)); } catch { /* storage blocked */ }
}
