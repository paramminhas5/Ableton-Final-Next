/**
 * A stand-in for src/lib/remakes.ts (the engine agent's list of remakes, 8 Nov), with the shape the remakes
 * screen reads (src/lib/remakesSource.ts). Remove once the real list is on the branch. Each remake is a patch we
 * program in the style of a well-known sound, named as a style, never as a track; no audio from any record.
 */
import type { NoteEvent } from "./track2";

export type Remake = {
  id: string;
  /** A style, never a track: "a 90s acid line". */
  name: string;
  /** What makes the sound, in one line. */
  says: string;
  part: "bass" | "lead" | "chords" | "drums";
  bpm: number;
  /** One bar. */
  notes: NoteEvent[];
  /** The whole patch: knob key to 0..1. */
  params: Record<string, number>;
  /** The knobs the learner matches, most telling first. */
  knobs: string[];
};

const n = (start: number, len: number, note: number, vel = 0.85): NoteEvent => ({ start, len, note, vel });

export const REMAKES: Remake[] = [
  { id: "acid-line", name: "a 90s acid line", says: "a saw bass with the filter nearly shut, resonance high and a short envelope, so every note squelches.", part: "bass", bpm: 128,
    notes: [n(0, 0.25, 33), n(0.5, 0.25, 45), n(0.75, 0.25, 33), n(1.25, 0.25, 36), n(1.5, 0.25, 33), n(2, 0.25, 45, 0.95), n(2.5, 0.25, 31), n(3, 0.25, 33), n(3.5, 0.25, 43)],
    params: { cutoff: 0.25, res: 0.75, env: 0.75, decay: 0.25, glide: 0.375 }, knobs: ["cutoff", "res", "env"] },
  { id: "trance-supersaw", name: "a supersaw like early trance", says: "detuned saws spread wide, a bright filter and a slow release, so a chord fills the whole room.", part: "chords", bpm: 138,
    notes: [...[57, 60, 64].map(x => n(0, 1.75, x, 0.8)), ...[55, 59, 62].map(x => n(2, 1.75, x, 0.8))],
    params: { spread: 0.875, cutoff: 0.75, attack: 0.125, release: 0.625 }, knobs: ["spread", "cutoff", "release"] },
  { id: "boom-kick", name: "a long 808-style kick", says: "a low tuned kick with a long decay and a little drive, more a note than a hit.", part: "drums", bpm: 92,
    notes: [n(0, 0.5, 36, 1), n(1.5, 0.5, 36, 0.9), n(2.5, 0.5, 36, 0.95)],
    params: { tune: 0.25, decay: 0.875, drive: 0.375 }, knobs: ["decay", "tune", "drive"] },
  { id: "pluck-lead", name: "a short house pluck", says: "a bright lead that dies away fast: quick attack, short release, a touch of resonance.", part: "lead", bpm: 124,
    notes: [n(0, 0.25, 69), n(0.75, 0.25, 72), n(1.5, 0.25, 76), n(2, 0.25, 74), n(2.75, 0.25, 72), n(3.5, 0.25, 69)],
    params: { cutoff: 0.625, res: 0.5, attack: 0, release: 0.125 }, knobs: ["release", "cutoff", "res"] },
  { id: "warm-pad", name: "a slow warm pad like 80s ballads", says: "soft chords that fade in and out: a slow attack, a long release, the filter half closed.", part: "chords", bpm: 96,
    notes: [...[53, 57, 60].map(x => n(0, 3.75, x, 0.7))],
    params: { attack: 0.75, release: 0.75, cutoff: 0.375, spread: 0.375 }, knobs: ["attack", "release", "cutoff"] },
];
