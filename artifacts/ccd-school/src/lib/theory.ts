/**
 * Music theory the playing surfaces share: note names, scales, the pad grid, and the
 * timing maths for recording (snap and swing).
 */

export const NOTE_NAMES = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"] as const;

export const SCALES = {
  minor: [0, 2, 3, 5, 7, 8, 10],
  major: [0, 2, 4, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  "minor pentatonic": [0, 3, 5, 7, 10],
} as const;
export type ScaleName = keyof typeof SCALES;

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
  const len = SCALES[scale].length;
  const rowStep = len >= 7 ? 3 : 2;
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
