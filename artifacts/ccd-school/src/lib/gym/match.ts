/**
 * "Match this sound" as an ear gym drill (Syntorial's method, src/components/m1/MatchSound.tsx in the
 * lessons): a short phrase on one of four parts (kick, bass, lead, pad) plays with hidden settings of a few
 * knobs; the learner turns the same knobs until theirs sounds the same, and one check scores it
 * (src/lib/matchScore.ts). Difficulty adds knobs: two at levels 1 and 2, three at 3 to 5, four at 6 to 8,
 * and the hidden settings sit closer to where the knobs start as the level rises. Pure, so it is tested.
 */
import { BASS_PARAMS, CHORD_PARAMS, DRUM_PAD_PARAMS, INSTRUMENT_BASE, LAYER_PARAMS, LEAD_PARAMS, type ParamSpec } from "@/engine/params.gen";
import { emptyTrackV2, newLayerV2, type LayerType, type LayerV2, type NoteEvent, type TrackV2 } from "../track2";
import type { Rng } from "./engine";

export type MatchPart = "kick" | "bass" | "lead" | "pad";
export const MATCH_PARTS: MatchPart[] = ["kick", "bass", "lead", "pad"];
export const PART_LAYER: Record<MatchPart, LayerType> = { kick: "drums", bass: "bass", lead: "lead", pad: "chords" };

/** The knobs each part's drill turns, most audible first: a level adds the next one. */
export const MATCH_KNOBS: Record<MatchPart, string[]> = {
  kick: ["decay", "tune", "drive", "tone"],
  bass: ["cutoff", "decay", "res", "env"],
  lead: ["cutoff", "attack", "release", "res"],
  pad: ["attack", "release", "cutoff", "spread"],
};

export type MatchKnob = { index: number; spec: ParamSpec };

/** A knob on one of the drill's parts by key, with its wire index: the part's own, the kick pad's, or the channel's. */
export function matchKnob(part: MatchPart, key: string): MatchKnob | undefined {
  const own: MatchKnob[] = part === "kick"
    ? DRUM_PAD_PARAMS.map((sp, k) => ({ index: INSTRUMENT_BASE + k, spec: sp as ParamSpec }))
    : (part === "bass" ? BASS_PARAMS : part === "lead" ? LEAD_PARAMS : CHORD_PARAMS).map(sp => ({ index: sp.index, spec: sp as ParamSpec }));
  return [...own, ...LAYER_PARAMS.map(sp => ({ index: sp.index, spec: sp as ParamSpec }))].find(k => k.spec.key === key);
}

export const matchKnobCount = (level: number) => (level <= 2 ? 2 : level <= 5 ? 3 : 4);

/** How far (share of travel) each hidden setting sits from where the knob starts: plainer to hear at level 1. */
export const matchSpread = (level: number) => Math.max(0.2, 0.38 - (Math.max(1, Math.min(8, level)) - 1) * 0.025);

export interface MatchQuestion {
  drill: "match";
  part: MatchPart;
  /** Keys, in MATCH_KNOBS order. */
  knobs: string[];
  /** The hidden settings and where the knobs start, normalised, by key. */
  target: Record<string, number>;
  start: Record<string, number>;
  /** Semitones the phrase is moved, so the key changes between rounds. */
  transpose: number;
  bpm: number;
}

const q05 = (v: number) => Math.round(v * 20) / 20;

export function makeMatchQuestion(level: number, rng: Rng, prev?: MatchPart): MatchQuestion {
  const pool = MATCH_PARTS.filter(p => p !== prev);
  const part = pool[Math.floor(rng() * pool.length)];
  const knobs = MATCH_KNOBS[part].slice(0, matchKnobCount(level));
  const d = matchSpread(level);
  const target: Record<string, number> = {}, start: Record<string, number> = {};
  for (const key of knobs) {
    const s = matchKnob(part, key)!.spec.default;
    start[key] = s;
    // Up or down from the start, whichever has room, by at least the level's spread.
    const room = { up: 0.92 - s, down: s - 0.08 };
    const up = room.up >= d && (room.down < d || rng() < 0.5);
    const far = d + rng() * Math.max(0, (up ? room.up : room.down) - d) * 0.6;
    target[key] = q05(Math.max(0.08, Math.min(0.92, up ? s + far : s - far)));
  }
  return { drill: "match", part, knobs, target, start, transpose: Math.floor(rng() * 7) - 3, bpm: 112 + Math.floor(rng() * 4) * 4 };
}

/** A one-bar phrase for the part, short enough to hear in a second or two. */
function phrase(part: MatchPart, t: number): NoteEvent[] {
  const n = (start: number, len: number, note: number, vel = 0.85) => ({ start, len, note, vel });
  switch (part) {
    case "kick": return [0, 1, 2, 3].map(b => n(b, 0.25, 36, 0.95));
    case "bass": return [n(0, 0.5, 33 + t), n(0.75, 0.25, 33 + t), n(1.5, 0.5, 45 + t), n(2, 0.5, 36 + t), n(3, 0.25, 33 + t), n(3.5, 0.5, 40 + t)];
    case "lead": return [n(0, 0.5, 69 + t), n(0.5, 0.5, 72 + t), n(1, 1, 76 + t), n(2, 0.5, 74 + t), n(2.5, 0.5, 72 + t), n(3, 1, 69 + t)];
    case "pad": return [...[57, 60, 64].map(x => n(0, 1.9, x + t, 0.75)), ...[55, 59, 62].map(x => n(2, 1.9, x + t, 0.75))];
  }
}

/** The drill's song: the part alone, its knobs where they start, at the question's tempo. */
export function matchSong(q: MatchQuestion): { song: TrackV2; part: LayerV2 } {
  const layer = newLayerV2(PART_LAYER[q.part], "__gym");
  layer.events = phrase(q.part, q.transpose);
  layer.params = Object.fromEntries(q.knobs.map(k => [matchKnob(q.part, k)!.index, q.start[k]]));
  const song: TrackV2 = { ...emptyTrackV2(), bpm: q.bpm, loop: 4, layers: [layer] };
  return { song, part: layer };
}
