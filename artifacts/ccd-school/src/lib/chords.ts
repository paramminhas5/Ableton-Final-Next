/**
 * The chord track (Logic Pro's Chord Track, FL Studio's chord progression tool): one chord per bar of
 * your loop, with its name ("am", "f", "c", "g") and its roman numeral in your key. The chord pads,
 * bass and lead light the notes of the chord under the playhead. Pure, tested in tests/chords.test.ts.
 */
import { NOTE_NAMES, SCALES, pitchClass, type ScaleName } from "./theory";
import type { NoteEvent } from "./track2";

export type Quality = "maj" | "min" | "dim" | "aug" | "sus2" | "sus4";
/** A chord: its root as a pitch class (0 = c), its quality, and whether it has a seventh. */
export type Chord = { root: number; q: Quality; sev?: boolean };

const SHAPE: Record<Quality, number[]> = { maj: [0, 4, 7], min: [0, 3, 7], dim: [0, 3, 6], aug: [0, 4, 8], sus2: [0, 2, 7], sus4: [0, 5, 7] };
const SUFFIX: Record<Quality, string> = { maj: "", min: "m", dim: "dim", aug: "aug", sus2: "sus2", sus4: "sus4" };
const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii"];

/** "am", "f", "bdim", "g7". The way chord tracks and lead sheets write them, lowercase. */
export function chordName(c: Chord): string {
  const seven = c.sev ? (c.q === "maj" ? "maj7" : "7") : "";
  return `${NOTE_NAMES[pitchClass(c.root)]}${SUFFIX[c.q]}${seven}`;
}

/** The chord's pitch classes, root first. */
export function chordTones(c: Chord): number[] {
  const tones = SHAPE[c.q].map(i => pitchClass(c.root + i));
  if (c.sev) tones.push(pitchClass(c.root + (c.q === "maj" ? 11 : c.q === "dim" ? 9 : 10)));
  return tones;
}

/** The chord's notes as midi, voiced upward from the first root at or above `low`. */
export function chordNotes(c: Chord, low = 48): number[] {
  const r = low + ((pitchClass(c.root) - pitchClass(low) + 12) % 12);
  const notes = SHAPE[c.q].map(i => r + i);
  if (c.sev) notes.push(r + (c.q === "maj" ? 11 : c.q === "dim" ? 9 : 10));
  return notes;
}

/** Which quality three stacked notes make, from the third and fifth above the root. */
function qualityOf(third: number, fifth: number): Quality {
  if (third === 4) return fifth === 8 ? "aug" : "maj";
  if (third === 3) return fifth === 6 ? "dim" : "min";
  return third === 2 ? "sus2" : "sus4";
}

/**
 * The chords in a key: one built on each note of the scale by stacking every other scale note (on a
 * scale of seven notes, the usual i to vii). `roman` is the numeral: upper case major, lower case minor.
 */
export function chordsInKey(root: number, scale: ScaleName): (Chord & { roman: string; degree: number })[] {
  const s = SCALES[scale] as readonly number[];
  const n = s.length;
  return s.map((iv, d) => {
    const at = (k: number) => s[(d + k) % n] + 12 * Math.floor((d + k) / n);
    const third = at(2) - iv, fifth = at(4) - iv;
    const q = qualityOf(third, fifth);
    const c: Chord = { root: pitchClass(root + iv), q };
    return { ...c, degree: d, roman: romanOf(c, root, scale) };
  });
}

/** The roman numeral of a chord in a key ("vi", "IV", "vii°"), or its name when its root is outside the scale. */
export function romanOf(c: Chord, root: number, scale: ScaleName): string {
  const s = SCALES[scale] as readonly number[];
  const d = s.indexOf(pitchClass(c.root - root));
  if (d < 0 || d > 6) return chordName(c);
  const base = c.q === "maj" || c.q === "aug" ? ROMAN[d].toUpperCase() : ROMAN[d];
  const mark = c.q === "dim" ? "°" : c.q === "aug" ? "+" : c.q === "sus2" || c.q === "sus4" ? SUFFIX[c.q] : "";
  return `${base}${mark}${c.sev ? "7" : ""}`;
}

/** The chord under a beat: one per bar, round the loop. Null with no chord track or an empty bar. */
export function chordAt(chords: (Chord | null)[] | undefined, beat: number, loop: number): Chord | null {
  if (!chords?.length) return null;
  const bars = Math.max(1, Math.round(loop / 4));
  const b = Math.floor((((beat % loop) + loop) % loop) / 4) % bars;
  return chords[b % chords.length] ?? null;
}

/** A clean chord list from storage: known qualities, roots 0..11, nulls for empty bars. */
export function cleanChords(x: unknown): (Chord | null)[] | undefined {
  if (!Array.isArray(x)) return undefined;
  return x.slice(0, 16).map(c => {
    if (!c || typeof c !== "object") return null;
    const { root, q, sev } = c as Chord;
    if (typeof root !== "number" || !Number.isFinite(root) || !(q in SHAPE)) return null;
    return sev ? { root: pitchClass(Math.round(root)), q, sev: true } : { root: pitchClass(Math.round(root)), q };
  });
}

/** Common progressions, by scale degree (0 = the first chord), the way FL's chord progression tool offers
 * them. Shown with their roman numerals in your key (`progressionName`). */
export const PROGRESSIONS: number[][] = [
  [0, 5, 2, 6],
  [0, 3, 4, 0],
  [0, 4, 5, 3],
  [5, 3, 0, 4],
  [0, 5, 3, 4],
];

/** A progression in a key, one chord per bar for `bars` bars. Roman names follow the key's own chords. */
export function progression(root: number, scale: ScaleName, degrees: number[], bars: number): Chord[] {
  const key = chordsInKey(root, scale);
  return Array.from({ length: bars }, (_, i) => {
    const k = key[degrees[i % degrees.length] % key.length];
    return { root: k.root, q: k.q };
  });
}

/** The name a progression has in this key ("i VI III VII" in a minor). */
export function progressionName(root: number, scale: ScaleName, degrees: number[]): string {
  const key = chordsInKey(root, scale);
  return degrees.map(d => key[d % key.length].roman).join(" ");
}

/**
 * The chord track as notes for a chords part: each bar's chord held for the bar, voiced near `low`.
 * What "play the chord track" writes into your song (FL's chord stamp does the same).
 */
export function chordEvents(chords: (Chord | null)[], loop: number, low = 52, vel = 0.75): NoteEvent[] {
  const bars = Math.max(1, Math.round(loop / 4));
  const out: NoteEvent[] = [];
  for (let b = 0; b < bars; b++) {
    const c = chords[b % chords.length];
    if (!c) continue;
    for (const note of chordNotes(c, low)) out.push({ note, vel, start: b * 4, len: 3.9 });
  }
  return out;
}

/**
 * Put a chord track on a song. A track longer than the loop grows the loop (to four bars at most) and
 * repeats every part's notes to fill it, so nothing goes quiet in the new bars. Pure.
 */
export function withChordTrack<T extends { loop: number; layers: { events: NoteEvent[] }[]; chords?: (Chord | null)[] }>(t: T, chords: (Chord | null)[]): T {
  const L = t.loop || 4;
  const want = Math.min(16, Math.max(L, chords.length * 4));
  if (want <= L) return { ...t, chords: chords.slice(0, Math.round(L / 4)) };
  const reps = Math.ceil(want / L);
  const layers = t.layers.map(l => ({ ...l, events: Array.from({ length: reps }, (_, k) => l.events.map(e => ({ ...e, start: e.start + k * L }))).flat().filter(e => e.start < want) }));
  return { ...t, loop: want, layers, chords: chords.slice(0, want / 4) };
}

/** True when `midi` is one of the chord's notes (any octave). What the surfaces light as a suggestion. */
export function inChord(c: Chord | null, midi: number): boolean {
  return !!c && chordTones(c).includes(pitchClass(midi));
}

// ── chord pads ──────────────────────────────────────────────────────────────

/** A chord pad: scale degrees stacked from the key's root, and its roman numeral. */
export type PadChord = { deg: number[]; roman: string };
type ChordDef = PadChord;
/** Minor and major keep the eight pads they always had, so old songs play the same chords. */
const CHORDS: Partial<Record<ScaleName, ChordDef[]>> = {
  minor: [
    { deg: [0, 2, 4], roman: "i" }, { deg: [3, 5, 7], roman: "iv" }, { deg: [4, 6, 8], roman: "v" }, { deg: [5, 7, 9], roman: "VI" },
    { deg: [2, 4, 6], roman: "III" }, { deg: [6, 8, 10], roman: "VII" }, { deg: [0, 2, 4, 6], roman: "i7" }, { deg: [3, 5, 7, 9], roman: "iv9" },
  ],
  major: [
    { deg: [0, 2, 4], roman: "I" }, { deg: [3, 5, 7], roman: "IV" }, { deg: [4, 6, 8], roman: "V" }, { deg: [5, 7, 9], roman: "vi" },
    { deg: [1, 3, 5], roman: "ii" }, { deg: [2, 4, 6], roman: "iii" }, { deg: [0, 2, 4, 6], roman: "I7" }, { deg: [3, 5, 7, 9], roman: "IV9" },
  ],
};

/** Eight chord pads for any scale: a chord on each scale note (the i, iv, v and vi first), then sevenths. */
export function chordPads(root: number, scale: ScaleName): ChordDef[] {
  const fixed = CHORDS[scale];
  if (fixed) return fixed;
  const key = chordsInKey(root, scale);
  const n = (SCALES[scale] as readonly number[]).length;
  const order = [0, 3, 4, 5, 2, 6, 1, 7, 8, 9].filter(d => d < n);
  const out: ChordDef[] = order.map(d => ({ deg: [d, d + 2, d + 4], roman: key[d].roman }));
  for (let k = 0; out.length < 8; k++) {
    const d = order[k % order.length];
    out.push({ deg: [d, d + 2, d + 4, d + 6], roman: `${key[d].roman}7` });
  }
  return out.slice(0, 8);
}

