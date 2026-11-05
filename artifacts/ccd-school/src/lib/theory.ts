/**
 * Music theory the playing surfaces share: note names, scales, the pad grid, and the
 * timing maths for recording (snap and swing).
 */

export const NOTE_NAMES = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"] as const;

/**
 * Ableton Live 12's scale list, in the order of its scale chooser (control bar, clip view, Push 3),
 * lowercase. Intervals in semitones from the root. "minor" and "major" stay first so old songs, which
 * only ever had those two, load unchanged.
 */
export const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
  "whole tone": [0, 2, 4, 6, 8, 10],
  "half-whole dim.": [0, 1, 3, 4, 6, 7, 9, 10],
  "whole-half dim.": [0, 2, 3, 5, 6, 8, 9, 11],
  "minor blues": [0, 3, 5, 6, 7, 10],
  "minor pentatonic": [0, 3, 5, 7, 10],
  "major pentatonic": [0, 2, 4, 7, 9],
  "harmonic minor": [0, 2, 3, 5, 7, 8, 11],
  "harmonic major": [0, 2, 4, 5, 7, 8, 11],
  "dorian #4": [0, 2, 3, 6, 7, 9, 10],
  "phrygian dominant": [0, 1, 4, 5, 7, 8, 10],
  "melodic minor": [0, 2, 3, 5, 7, 9, 11],
  "lydian augmented": [0, 2, 4, 6, 8, 9, 11],
  "lydian dominant": [0, 2, 4, 6, 7, 9, 10],
  "super locrian": [0, 1, 3, 4, 6, 8, 10],
  "8-tone spanish": [0, 1, 3, 4, 5, 6, 8, 10],
  bhairav: [0, 1, 4, 5, 7, 8, 11],
  "hungarian minor": [0, 2, 3, 6, 7, 8, 11],
  hirajoshi: [0, 2, 3, 7, 8],
  "in-sen": [0, 1, 5, 7, 10],
  iwato: [0, 1, 5, 6, 10],
  kumoi: [0, 2, 3, 7, 9],
  "pelog selisir": [0, 1, 3, 7, 8],
  "pelog tembung": [0, 1, 5, 7, 8],
  "messiaen 3": [0, 2, 3, 4, 6, 7, 8, 10, 11],
  "messiaen 4": [0, 1, 2, 5, 6, 7, 8, 11],
  "messiaen 5": [0, 1, 5, 6, 7, 11],
  "messiaen 6": [0, 2, 4, 5, 6, 8, 10, 11],
  "messiaen 7": [0, 1, 2, 3, 5, 6, 7, 8, 9, 11],
} as const;
export type ScaleName = keyof typeof SCALES;
/** Every scale, in Live's order. */
export const SCALE_NAMES = Object.keys(SCALES) as ScaleName[];
/** A stored scale name, or minor when it is missing or unknown (an old or damaged song). */
export function asScale(s: unknown): ScaleName {
  return typeof s === "string" && s in SCALES ? (s as ScaleName) : "minor";
}
/** A scale with a minor third and no major third: minor, dorian, phrygian, the minor pentatonic... Camelot and
 * other major-or-minor views use this. */
export function minorish(s: ScaleName | string | undefined): boolean {
  const iv = SCALES[asScale(s ?? "minor")] as readonly number[];
  return iv.includes(3) && !iv.includes(4);
}
/** "a minor", "c# dorian #4". */
export const keyName = (root: number, scale: ScaleName | string) => `${NOTE_NAMES[((root % 12) + 12) % 12]} ${scale}`;

/** "a2" for 45. Octave numbering where 60 is c4 (Ableton uses c3 for 60: see `liveName`). */
export function noteName(midi: number): string {
  return `${NOTE_NAMES[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;
}

/** Ableton Live's naming, where 60 is c3. */
export function liveName(midi: number): string {
  return `${NOTE_NAMES[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 2}`;
}

export function pitchClass(midi: number) {
  return ((midi % 12) + 12) % 12;
}

export function inScale(midi: number, root: number, scale: ScaleName): boolean {
  return (SCALES[scale] as readonly number[]).includes(pitchClass(midi - root));
}

/** The n-th note of the scale counting up from `root` (n can be negative). */
export function scaleNote(root: number, scale: ScaleName, n: number): number {
  const s = SCALES[scale];
  const oct = Math.floor(n / s.length);
  const i = ((n % s.length) + s.length) % s.length;
  return root + oct * 12 + s[i];
}

/**
 * Move a note from one scale to another by its place in the scale: the 3rd note of a minor scale
 * becomes the 3rd note of the major scale, in the same octave. Notes outside the scale snap first.
 */
export function remapToScale(midi: number, root: number, from: ScaleName, to: ScaleName): number {
  const a = SCALES[from] as readonly number[];
  const n = snapToScale(midi, root, from);
  const oct = Math.floor((n - root) / 12);
  const idx = a.indexOf(pitchClass(n - root));
  return scaleNote(root, to, oct * (SCALES[to] as readonly number[]).length + Math.min(idx, SCALES[to].length - 1));
}

/** Nearest note in the scale (ties go down). */
export function snapToScale(midi: number, root: number, scale: ScaleName): number {
  for (let d = 0; d < 12; d++) {
    if (inScale(midi - d, root, scale)) return midi - d;
    if (inScale(midi + d, root, scale)) return midi + d;
  }
  return midi;
}

/**
 * The 4x4 scale grid for pads: bottom-left is the lowest note, rows go up in fourths
 * the way Push lays them out (3 scale steps per row on a 7-note scale), so a shape
 * plays the same in any key. Returns 16 notes, row 0 = top row (screen order).
 */
export function padGrid(root: number, scale: ScaleName, rows = 4, cols = 4): number[] {
  // A row is a fourth up, as on Push: as many scale steps as the scale has notes below the fourth
  // (3 on a seven-note scale, 2 on a pentatonic, 4 on the eight-note ones).
  const rowStep = Math.max(1, (SCALES[scale] as readonly number[]).filter(i => i < 5).length);
  const out: number[] = [];
  for (let r = rows - 1; r >= 0; r--) {
    for (let c = 0; c < cols; c++) out.push(scaleNote(root, scale, r * rowStep + c));
  }
  return out;
}

/** White and black keys for an octave of keys starting at `low` (a c or the root). */
export function keyRow(low: number, whiteCount = 8): { white: number[]; black: { note: number; after: number }[] } {
  const white: number[] = [];
  let n = low;
  while (white.length < whiteCount) {
    if (![1, 3, 6, 8, 10].includes(pitchClass(n))) white.push(n);
    n++;
  }
  const black: { note: number; after: number }[] = [];
  white.forEach((w, i) => {
    if (i < white.length - 1 && white[i + 1] - w === 2) black.push({ note: w + 1, after: i });
  });
  return { white, black };
}

// ── timing ─────────────────────────────────────────────────────────────────

export type Snap = "off" | "1/8" | "1/16" | "1/32";
export const SNAP_BEATS: Record<Snap, number> = { off: 0, "1/8": 0.5, "1/16": 0.25, "1/32": 0.125 };

/**
 * Move a beat toward the grid. `strength` 1 lands exactly on it, 0.5 halfway.
 * With swing, every second grid line is pushed later by swing * half a grid step.
 */
export function snapBeat(beat: number, snap: Snap, strength = 1, swing = 0): number {
  const g = SNAP_BEATS[snap];
  if (!g) return beat;
  const idx = Math.round(beat / g);
  let target = idx * g;
  if (swing > 0 && idx % 2 === 1) target += swing * g * 0.5;
  return beat + (target - beat) * Math.min(1, Math.max(0, strength));
}

/** Wrap a beat into the loop. */
export function wrapBeat(beat: number, loop: number): number {
  return ((beat % loop) + loop) % loop;
}

/** The 16th step a beat falls in (for lighting steps). */
export function stepOf(beat: number, steps = 16, loop = 4): number {
  return Math.floor(wrapBeat(beat, loop) / (loop / steps)) % steps;
}
