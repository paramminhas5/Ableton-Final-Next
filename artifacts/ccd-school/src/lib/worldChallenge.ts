/**
 * End-of-world challenges (Syntorial's group challenges and bonus rounds, design/audible-genius.md): at the end
 * of each world, one challenge that combines what the world taught, on the learner's own song. A match on
 * several of the world's knobs (the learner's own part, set out of sight, to bring back by ear) and a copy of
 * one of their own parts by ear. Scored with stars (the two rounds' average). Optional bonus rounds earn more:
 * a finer match on another part, and a copy against the clock. Nothing is locked: a challenge can be tried any
 * time; it says which lesson it comes after. Pure (what to play and how it scores), so it is tested.
 */
import { DRUM_PAD_PARAMS, INSTRUMENT_BASE, LAYER_PARAMS, type ParamSpec } from "../engine/params.gen";
import { HAT_NOTES, STEP, parsePattern, type CopyLayer, type Pattern } from "./copyEar";
import { notch } from "./matchScore";
import { BASS_PARAMS, CHORD_PARAMS, LEAD_PARAMS } from "../engine/params.gen";
import { emptyTrackV2, newLayerV2, paramOf, type LayerType, type LayerV2, type NoteEvent, type TrackV2 } from "./track2";
import type { WorldId } from "./worldOrder";

export type MatchRound = { kind: "match"; id: string; part: LayerType; knobs: string[]; notches: number; name: string; line: string };
export type CopyRound = { kind: "copy"; id: string; layer: CopyLayer; fallback: Pattern; clock?: number; name: string; line: string };
export type Round = MatchRound | CopyRound;
export type Challenge = { world: WorldId; title: string; after: string; afterTitle: string; main: [MatchRound, CopyRound]; bonus: Round[] };

export const CHALLENGES: Record<WorldId, Challenge> = {
  fundamentals: {
    world: "fundamentals", title: "the basics challenge", after: "song-structure", afterTitle: "song structure",
    main: [
      { kind: "match", id: "lead", part: "lead", knobs: ["cutoff", "wave", "release"], notches: 8, name: "your lead's tone", line: "cutoff, shape and release, from timbre, waveforms and amplitude" },
      { kind: "copy", id: "melody", layer: "lead", fallback: "1 - 3 - 5 - 3 - 2 - 1 - - - . .", name: "your melody", line: "the tune you wrote, by ear, from melody and intervals" },
    ],
    bonus: [
      { kind: "copy", id: "chords", layer: "chords", fallback: "1+3+5 - - - 6,+1+3 - - - 4,+6,+1 - - - 5,+7,+2 - - -", name: "bonus: your chords", line: "the progression you made, chord by chord" },
      { kind: "match", id: "bass", part: "bass", knobs: ["cutoff", "decay"], notches: 20, name: "bonus: your bass, finer", line: "every 5% of the knob, not nine steps" },
    ],
  },
  producer: {
    world: "producer", title: "the producer challenge", after: "finish-export", afterTitle: "finish and export",
    main: [
      { kind: "match", id: "lead", part: "lead", knobs: ["cutoff", "res", "release"], notches: 8, name: "your synth", line: "cutoff, resonance and release, from shape your synth" },
      { kind: "copy", id: "bass", layer: "bass", fallback: "1 - . . 1' . . . 1 - . . 5 - . .", name: "your bass line", line: "the line under your kick, by ear" },
    ],
    bonus: [
      { kind: "match", id: "kick", part: "drums", knobs: ["decay", "tune", "drive"], notches: 20, name: "bonus: your kick, finer", line: "decay, tune and drive, from kick designer, every 5%" },
      { kind: "copy", id: "drums", layer: "drums", fallback: { kick: "x...x...x...x...", clap: "....x.......x..." }, clock: 60, name: "bonus: your drums on the clock", line: "copy your beat in 60 seconds" },
    ],
  },
  dj: {
    world: "dj", title: "the dj challenge", after: "dj-advanced-complete", afterTitle: "your track in your set",
    main: [
      { kind: "match", id: "eq", part: "drums", knobs: ["low", "mid", "high"], notches: 8, name: "the eq on your deck", line: "low, mid and high, from the bass swap and eq mixing" },
      { kind: "copy", id: "drums", layer: "drums", fallback: { kick: "x...x...x...x...", clap: "....x.......x..." }, name: "your beat", line: "the kick and clap a dj counts phrases on" },
    ],
    bonus: [
      { kind: "match", id: "cut", part: "bass", knobs: ["cut", "level"], notches: 20, name: "bonus: the low cut", line: "where the bass goes when you mix out, every 5%" },
      { kind: "copy", id: "hats", layer: "drums", fallback: { hat: "..x...x...x...x.", "open hat": "......x.......x." }, clock: 45, name: "bonus: hats on the clock", line: "the hats in 45 seconds" },
    ],
  },
};

export type K = { index: number; spec: ParamSpec };
/** A knob on a part by key: the part's own instrument, the kick pad's, or the channel's (eq, level). */
export function challengeKnob(part: LayerType, key: string): K | undefined {
  const inst = part === "lead" ? LEAD_PARAMS : part === "bass" ? BASS_PARAMS : part === "chords" ? CHORD_PARAMS : [];
  const own: K[] = part === "drums"
    ? DRUM_PAD_PARAMS.map((sp, k) => ({ index: INSTRUMENT_BASE + k, spec: sp as ParamSpec }))
    : inst.map(sp => ({ index: sp.index, spec: sp as ParamSpec }));
  return [...own, ...LAYER_PARAMS.map(sp => ({ index: sp.index, spec: sp as ParamSpec }))].find(k => k.spec.key === key);
}

/** A part for the match round to play: the learner's own (one bar of it), or a short line of that type. */
export function matchPart(song: TrackV2, part: LayerType): { song: TrackV2; layer: LayerV2; own: boolean } {
  const own = song.layers.find(l => l.type === part && l.events.length);
  const n = (start: number, len: number, note: number, vel = 0.85) => ({ start, len, note, vel });
  const line: Record<string, NoteEvent[]> = {
    drums: [0, 1, 2, 3].map(b => n(b, 0.25, 36, 0.95)),
    bass: [n(0, 0.5, 33), n(0.75, 0.25, 33), n(1.5, 0.5, 45), n(2, 0.5, 36), n(3, 0.25, 33), n(3.5, 0.5, 40)],
    lead: [n(0, 0.5, 69), n(0.5, 0.5, 72), n(1, 1, 76), n(2, 0.5, 74), n(2.5, 0.5, 72), n(3, 1, 69)],
    chords: [...[57, 60, 64].map(x => n(0, 1.9, x, 0.75)), ...[55, 59, 62].map(x => n(2, 1.9, x, 0.75))],
  };
  const base = own ?? { ...newLayerV2(part, "__wc"), events: line[part] ?? line.lead };
  // The kick alone for a kick match; a bar of the part otherwise.
  const evs = base.events.filter(e => e.start < 4 && (part !== "drums" || e.note === 36 || !own));
  const layer: LayerV2 = { ...base, events: evs.length ? evs : base.events.slice(0, 8), mute: false, solo: false };
  return { song: { ...emptyTrackV2(), bpm: song.bpm, root: song.root, scale: song.scale, loop: 4, layers: [layer] }, layer, own: !!own };
}

/**
 * The hidden target is the part's own setting of each knob, on the round's notches; the knobs start two to
 * four notches away, the way the learner would find them after someone else had a go at their mix.
 */
export function matchSetup(layer: LayerV2, knobs: K[], notches: number, seed: number): { target: Record<number, number>; start: Record<number, number> } {
  const target: Record<number, number> = {}, start: Record<number, number> = {};
  let h = seed >>> 0;
  const rnd = () => { h = (h * 1664525 + 1013904223) >>> 0; return h / 2 ** 32; };
  for (const k of knobs) {
    const t = notch(Math.max(0.1, Math.min(0.9, paramOf(layer, k.index))), notches);
    const away = Math.max(2, Math.round((notches / 8) * (2 + Math.floor(rnd() * 3)))) / notches;
    const up = t + away <= 0.95, down = t - away >= 0.05;
    const s = up && down ? (rnd() < 0.5 ? t + away : t - away) : up ? t + away : t - away;
    target[k.index] = t;
    start[k.index] = notch(Math.max(0, Math.min(1, s)), notches);
  }
  return { target, start };
}

/**
 * The learner's own part as a copy target: the first bar on the sixteenth grid, at most 12 notes (16 for
 * chords), drums without the hats (or only the hats for a hats round). Null when their part is missing,
 * empty or too busy to copy in a minute, so the round uses the challenge's own pattern.
 */
export function ownCopy(song: TrackV2, layer: CopyLayer, hatsOnly = false): NoteEvent[] | null {
  const type: LayerType = layer === "drums" ? (hatsOnly ? "hats" : "drums") : layer;
  const src = song.layers.filter(l => l.type === type).flatMap(l => l.events);
  const seen = new Set<string>();
  const out: NoteEvent[] = [];
  for (const e of src) {
    if (e.start >= 4) continue;
    if (layer === "drums" && hatsOnly !== HAT_NOTES.has(e.note)) continue;
    const start = Math.round(e.start / STEP) * STEP;
    if (start >= 4) continue;
    const k = `${start}:${e.note}`;
    if (seen.has(k)) continue;
    seen.add(k);
    out.push({ note: e.note, start, len: Math.max(STEP, Math.round(e.len / STEP) * STEP), vel: e.vel });
  }
  const max = layer === "chords" ? 16 : 12;
  if (out.length < 2 || out.length > max) return null;
  return out.sort((a, b) => a.start - b.start || a.note - b.note);
}

/** What a copy round plays: the learner's own part when it can be copied, else the round's pattern in the song's key. */
export function copyTarget(song: TrackV2, r: CopyRound): { events: NoteEvent[]; own: boolean } {
  const hats = r.layer === "drums" && typeof r.fallback === "object" && Object.keys(r.fallback).every(k => k === "hat" || k === "open hat");
  const own = ownCopy(song, r.layer, hats);
  if (own) return { events: own, own: true };
  return { events: parsePattern(r.layer, r.fallback, song.root ?? 45, song.scale).events, own: false };
}

/** The challenge's stars: the average of its two rounds, rounded down (a round not passed counts 0). */
export const mainStars = (match: number, copy: number) => Math.floor((match + copy) / 2) as 0 | 1 | 2 | 3;
/** Stars for a match round by checks: three in one or two, two in three or four, one after that. */
export const matchRoundStars = (checks: number) => (checks <= 2 ? 3 : checks <= 4 ? 2 : 1) as 1 | 2 | 3;
/** A copy against the clock: three stars with a third of the time left, two with any left, one when it ran out. */
export const clockStars = (left: number, clock: number) => (left >= clock / 3 ? 3 : left > 0 ? 2 : 1) as 1 | 2 | 3;

// ── what the learner has earned, kept on the device ──────────────────────────
export type ChallengeRecord = { main: number; rounds: Record<string, number>; bonus: Record<string, number>; at: number };
const KEY = "ccd.challenges.v1";
export function readChallenges(): Partial<Record<WorldId, ChallengeRecord>> {
  try { const r = JSON.parse(localStorage.getItem(KEY) ?? "{}"); return r && typeof r === "object" ? r : {}; } catch { return {}; }
}
/** Keep the best stars per round and per bonus round; the challenge's own stars follow from its rounds. */
export function saveRound(world: WorldId, round: string, stars: number, bonus: boolean): ChallengeRecord {
  const all = readChallenges();
  const cur: ChallengeRecord = all[world] ?? { main: 0, rounds: {}, bonus: {}, at: 0 };
  const next: ChallengeRecord = bonus
    ? { ...cur, bonus: { ...cur.bonus, [round]: Math.max(cur.bonus[round] ?? 0, stars) }, at: Date.now() }
    : { ...cur, rounds: { ...cur.rounds, [round]: Math.max(cur.rounds[round] ?? 0, stars) }, at: Date.now() };
  const [m, c] = CHALLENGES[world].main;
  next.main = Math.max(cur.main, mainStars(next.rounds[m.id] ?? 0, next.rounds[c.id] ?? 0));
  try { localStorage.setItem(KEY, JSON.stringify({ ...all, [world]: next })); } catch { /* storage blocked */ }
  return next;
}
/** Stars per world for the learn page: the challenge's (of 3) and the bonus rounds' (of 3 each). */
export function worldStars(rec: ChallengeRecord | undefined, world: WorldId): { main: number; bonus: number; bonusOf: number } {
  const n = CHALLENGES[world].bonus.length;
  return { main: rec?.main ?? 0, bonus: Object.values(rec?.bonus ?? {}).reduce((a, b) => a + b, 0), bonusOf: n * 3 };
}
