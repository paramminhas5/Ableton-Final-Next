/**
 * Remakes: well-known kinds of sound, made our way on our own instruments, for the "match this sound" step
 * (Syntorial's famous-sounds challenges, done with the match step's notched knobs: src/lib/gym/match.ts and
 * src/components/m1/MatchSound.tsx). Each is a part type and the settings that make the sound; the learner
 * turns 2 to 4 of them (`knobs`) from `start` to `target`, and every other setting in `target` is already set
 * in `start`, so the target can always be reached with the lit knobs.
 *
 * Named only as styles ("a 303-style acid line"), never as records or artists, and no audio from any record:
 * every target is our own engine with these numbers. The match score hears the mono sum (src/lib/matchScore.ts),
 * so width is never a lit knob here: where a sound is wide, its width is set from the start. Values are normalised knob positions (0..1, as saved in a
 * song), by param key; the lit knobs' targets and starts sit on eighths, so they land on the match step's
 * notches (five or nine positions; within the pass tolerance at twenty). Checked in tests/remakes.test.ts:
 * each renders through the engine, can be reached, and sounds clearly unlike the part's own defaults.
 */
import {
  BASS_PARAMS, CHORD_PARAMS, DRUM_PAD2_BASE, DRUM_PAD2_PARAMS, DRUM_PAD_PARAMS, INSTRUMENT_BASE, LAYER_PARAMS, LEAD_PARAMS, type ParamSpec,
} from "@/engine/params.gen";
import { newLayerV2, type LayerType, type LayerV2, type NoteEvent } from "./track2";

export type RemakePart = Extract<LayerType, "drums" | "bass" | "chords" | "lead">;

export type Remake = {
  id: string;
  /** Lowercase, a style, never a track or an artist. */
  name: string;
  part: RemakePart;
  /** The knobs the learner turns (2 to 4), by param key, most audible first. */
  knobs: string[];
  /** Every setting that makes the sound, by param key (the lit knobs' hidden values among them). */
  target: Record<string, number>;
  /** Where the knobs start (the rest of `target` is set from the start). Missing knobs start at the part's default, on the nearest eighth. */
  start?: Record<string, number>;
  /** One line on what the sound is and what to listen for. Sentence case, no em dashes. */
  blurb: string;
  /** A one-bar phrase in the sound's own idiom (beats), and its tempo. */
  notes: NoteEvent[];
  bpm: number;
};

const n = (start: number, note: number, len: number, vel = 0.85): NoteEvent => ({ start, note, len, vel });

/** A 16-step acid line in A minor: (step, note, accent, slide into the next). Slides overlap the next note, so it glides. */
const ACID: [number, number, boolean, boolean][] = [
  [0, 33, true, false], [2, 33, false, false], [3, 45, false, true], [4, 43, true, false], [6, 33, false, false], [7, 36, false, true],
  [8, 38, true, false], [10, 33, false, false], [11, 45, true, false], [12, 33, false, true], [13, 40, false, false], [14, 31, true, false], [15, 33, false, false],
];
const acid = ACID.map(([s, note, acc, slide], k) => {
  const next = ACID[k + 1]?.[0] ?? 16;
  return n(s / 4, note, slide ? (next - s) / 4 + 0.02 : 0.14, acc ? 1 : 0.7);
});

export const REMAKES: Remake[] = [
  {
    id: "acid-303",
    name: "a 303-style acid line",
    part: "bass",
    knobs: ["res", "env", "cutoff", "decay"],
    target: { cutoff: 0.125, res: 0.875, env: 0.875, decay: 0.25, glide: 0.15, sub: 0, wave: 0, drift: 0, fdrive: 0.3 },
    blurb: "One saw through a resonant filter that snaps open on every note and closes fast. Listen for the squelch: resonance high, the envelope doing the work, the cutoff low.",
    notes: acid,
    bpm: 130,
  },
  {
    id: "hoover",
    name: "a hoover",
    part: "lead",
    knobs: ["detune", "glide", "cutoff"],
    target: { detune: 1, glide: 0.625, cutoff: 0.75, res: 0.35, wave: 0.2, attack: 0.1, release: 0.45, env: 0.4, width: 0.75, fdrive: 0.25 },
    blurb: "A stack of saws detuned as far as they go, sliding from note to note. Listen for the swarm and the long swoop between notes.",
    notes: [n(0, 57, 1.1), n(1, 64, 0.6), n(1.5, 62, 0.6), n(2, 60, 1.1), n(3, 55, 0.95)],
    bpm: 132,
  },
  {
    id: "trance-supersaw",
    name: "a supersaw like early trance",
    part: "chords",
    knobs: ["spread", "cutoff", "release"],
    target: { spread: 0.75, cutoff: 0.875, release: 0.625, width: 0.875, voicing: 0.5, attack: 0.1, res: 0.1, env: 0.15, drift: 0.2 },
    blurb: "Seven saws a note, detuned into a shimmer and spread across the speakers. Listen for how wide it gets and how bright the top is.",
    notes: [...[57, 60, 64, 69].map(x => n(0, x, 1.9, 0.8)), ...[53, 57, 60, 65].map(x => n(2, x, 1.9, 0.8))],
    bpm: 138,
  },
  {
    id: "808-boom",
    name: "an 808 boom",
    part: "drums",
    knobs: ["decay", "tune"],
    target: { decay: 0.875, tune: 0.25, drive: 0.15, shape: 0, sweep: 0.375 },
    blurb: "A deep kick that rings on like a bass note. Listen for how long it holds and how low it sits.",
    notes: [n(0, 36, 0.9, 0.95), n(1.5, 36, 0.4, 0.9), n(2.5, 36, 0.9, 0.95)],
    bpm: 140,
  },
  {
    id: "reese",
    name: "a reese bass",
    part: "lead",
    knobs: ["detune", "cutoff", "fdrive"],
    target: { detune: 0.375, cutoff: 0.25, fdrive: 0.5, res: 0.2, env: 0.1, attack: 0.05, release: 0.3, glide: 0, wave: 0 },
    blurb: "Low saws a little out of tune with each other, so they beat and churn, kept dark and pushed into the filter. Listen for the slow movement inside the note.",
    notes: [n(0, 33, 1.9, 0.9), n(2, 31, 0.9, 0.9), n(3, 36, 0.9, 0.9)],
    bpm: 172,
  },
  {
    id: "house-organ",
    name: "a house organ stab",
    part: "chords",
    knobs: ["voicing", "release", "cutoff"],
    target: { voicing: 1, release: 0.125, cutoff: 0.875, spread: 0.05, attack: 0, res: 0.05, env: 0.1, drift: 0.1 },
    blurb: "Short chords with the organ's drawbars pulled out (a sub, the octave and the fifth on every note), on the offbeat. Listen for the hollow, bright stab that stops dead.",
    notes: [0.5, 1.5, 2.5, 3.5].flatMap(b => [57, 60, 64, 67].map(x => n(b, x, 0.2, 0.85))),
    bpm: 122,
  },
  {
    id: "detuned-pad",
    name: "a detuned pad",
    part: "chords",
    knobs: ["attack", "release", "spread", "drift"],
    target: { attack: 0.75, release: 0.75, spread: 0.625, drift: 0.75, cutoff: 0.5, res: 0.1, env: 0.1, voicing: 0.35, width: 0.625 },
    blurb: "Chords that swell in slowly and fade slowly, every voice a little out of tune and drifting. Listen for the slow start, the long tail and the wobble.",
    notes: [...[57, 60, 64].map(x => n(0, x, 1.9, 0.75)), ...[55, 59, 62].map(x => n(2, x, 1.9, 0.75))],
    bpm: 100,
  },
  {
    id: "prog-pluck",
    name: "a pluck like progressive house",
    part: "chords",
    knobs: ["cutoff", "env", "fdecay", "release"],
    target: { cutoff: 0.125, env: 0.75, fdecay: 0.25, release: 0.375, attack: 0, res: 0.3, spread: 0.5, voicing: 0.2, width: 0.5 },
    blurb: "A dark filter that flicks open at the start of each note and shuts again almost at once. Listen for the click of brightness, then the short tail.",
    notes: [69, 72, 76, 72, 69, 74, 76, 74].map((x, i) => n(i * 0.5, x, 0.3, i % 2 ? 0.75 : 0.9)),
    bpm: 124,
  },
];

export type RemakeKnob = { index: number; spec: ParamSpec };

/** A remake's setting by key, with its wire index: the part's own, the kick pad's (both pages), then the channel's. */
export function remakeKnob(part: RemakePart, key: string): RemakeKnob | undefined {
  const own: RemakeKnob[] = part === "drums"
    ? [
        ...DRUM_PAD_PARAMS.map((sp, k) => ({ index: INSTRUMENT_BASE + k, spec: sp as ParamSpec })),
        ...DRUM_PAD2_PARAMS.map((sp, k) => ({ index: INSTRUMENT_BASE + DRUM_PAD2_BASE + k, spec: sp as ParamSpec })),
      ]
    : (part === "bass" ? BASS_PARAMS : part === "lead" ? LEAD_PARAMS : CHORD_PARAMS).map(sp => ({ index: sp.index, spec: sp as ParamSpec }));
  return [...own, ...LAYER_PARAMS.map(sp => ({ index: sp.index, spec: sp as ParamSpec }))].find(k => k.spec.key === key);
}

/** Where every setting starts: the target's, except the lit knobs, which start where `start` says (else the part's default on the nearest eighth). */
export function remakeStart(r: Remake): Record<string, number> {
  const out: Record<string, number> = { ...r.target };
  for (const k of r.knobs) out[k] = r.start?.[k] ?? Math.round(remakeKnob(r.part, k)!.spec.default * 8) / 8;
  return out;
}

/** The remake as a part, at its target or its start: wire-indexed params and the phrase. */
export function remakeLayer(r: Remake, at: "target" | "start", from = "__remake"): LayerV2 {
  const layer = newLayerV2(r.part, from);
  const vals = at === "target" ? r.target : remakeStart(r);
  layer.params = Object.fromEntries(Object.entries(vals).map(([k, v]) => [remakeKnob(r.part, k)!.index, v]));
  layer.events = r.notes.map(e => ({ ...e }));
  return layer;
}
