/**
 * Copy by ear (Building Blocks' recreation challenges, on our grid and engine; see design/audible-genius.md).
 * A hidden drum pattern, bass line, chord progression or melody plays; the learner writes it on a grid and
 * checks. Each note comes back right, wrong (with which way it was off) or missed. Pure, so it is tested.
 *
 * Patterns are written in a lesson file in two shapes, both one character or token per sixteenth:
 * - drums: rows by name, `{kick: "x...x...x...x...", clap: "....x.......x..."}`. `x` is a hit, `o` a soft one.
 * - a tune: `"1 - . . 3 - . . 5 . 1' ."`. `.` is a rest, `-` holds the note before, a number is a note of the
 *   song's own scale (1 is its root), `'` and `,` move it an octave up or down, `b` and `#` a semitone, and
 *   `+` joins notes into a chord (`1+3+5`). Scale steps, not fixed notes, so a pattern fits any song's key.
 */
import { SCALES, asScale, type ScaleName } from "./theory";
import type { NoteEvent } from "./track2";

export const STEP = 0.25;

/** The drums a pattern can name, and the note each is on (players.ts and the drum rack's pads). */
export const DRUM_ROWS: Record<string, number> = { kick: 36, rim: 37, snare: 38, clap: 39, "low tom": 41, hat: 42, "mid tom": 45, "open hat": 46, "high tom": 48, ride: 51, shaker: 70 };
export const DRUM_NAME: Record<number, string> = Object.fromEntries(Object.entries(DRUM_ROWS).map(([k, v]) => [v, k]));
/** Drum notes that play on the hats part rather than the drum rack. */
export const HAT_NOTES = new Set([42, 46, 51, 70]);

export type CopyLayer = "drums" | "bass" | "chords" | "lead";
export type Pattern = string | Record<string, string>;

/** Where a part's scale step 1 sits: the bass in the second octave, chords and leads around middle c. */
export function baseNote(layer: CopyLayer, root: number): number {
  const pc = ((root % 12) + 12) % 12;
  if (layer === "bass") { const b = 36 + pc; return b > 43 ? b - 12 : b; }
  const m = 60 + pc;
  return m > 67 ? m - 12 : m;
}

const TOKEN = /^(b|#)?([1-9])([',]*)$/;

/** One scale step to a note: "3" is the third note of the scale, "b7" a semitone under the seventh, "1'" the root an octave up. */
export function degreeNote(tok: string, base: number, scale: ScaleName): number | null {
  const m = TOKEN.exec(tok);
  if (!m) return null;
  const s = SCALES[scale];
  const n = Number(m[2]) - 1;
  const oct = Math.floor(n / s.length) + (m[3].split("").reduce((a, c) => a + (c === "'" ? 1 : -1), 0));
  return base + oct * 12 + s[n % s.length] + (m[1] === "b" ? -1 : m[1] === "#" ? 1 : 0);
}

/** Problems with a pattern, in words (empty when it is fine). Used by the lesson compiler. */
export function patternProblems(layer: CopyLayer, p: unknown): string[] {
  const out: string[] = [];
  if (layer === "drums") {
    if (!p || typeof p !== "object" || Array.isArray(p)) return ["a drum pattern maps drum names to rows like \"x...x...\""];
    const lens = new Set<number>();
    for (const [name, row] of Object.entries(p as Record<string, unknown>)) {
      if (!(name in DRUM_ROWS)) out.push(`"${name}" is not a drum, use one of ${Object.keys(DRUM_ROWS).join(", ")}`);
      if (typeof row !== "string" || !/^[xo.\s]+$/.test(row)) { out.push(`the ${name} row may only hold x, o and dots`); continue; }
      const n = row.replace(/\s/g, "").length;
      lens.add(n);
      if (n !== 16 && n !== 32) out.push(`the ${name} row is ${n} steps: use 16 (one bar) or 32 (two bars)`);
    }
    if (lens.size > 1) out.push("every row must be the same length");
    if (!Object.keys(p as object).length) out.push("the pattern has no rows");
    return out;
  }
  if (typeof p !== "string") return ["a tune is one line of steps like \"1 - . . 3 - . .\""];
  const toks = p.trim().split(/\s+/);
  if (toks.length !== 16 && toks.length !== 32) out.push(`the line is ${toks.length} steps: use 16 (one bar) or 32 (two bars)`);
  if (toks[0] === "-") out.push("the line cannot start by holding a note");
  for (const t of toks) if (t !== "." && t !== "-" && !t.split("+").every(x => TOKEN.test(x))) out.push(`"${t}" is not a step: use a scale number like 1, b3 or 5', a chord like 1+3+5, a dot or a dash`);
  if (!toks.some(t => t !== "." && t !== "-")) out.push("the line has no notes");
  return out;
}

/** A pattern as notes in a song of this key. Drum hits are a sixteenth long; tune notes hold through their dashes. */
export function parsePattern(layer: CopyLayer, p: Pattern, root: number, scaleIn: string): { events: NoteEvent[]; loop: number } {
  const scale = asScale(scaleIn);
  if (layer === "drums") {
    const rows = p as Record<string, string>;
    const events: NoteEvent[] = [];
    let steps = 16;
    for (const [name, row] of Object.entries(rows)) {
      const cells = row.replace(/\s/g, "");
      steps = cells.length;
      [...cells].forEach((c, i) => { if (c !== ".") events.push({ start: i * STEP, len: STEP, note: DRUM_ROWS[name], vel: c === "o" ? 0.45 : 0.9 }); });
    }
    return { events: sortEvents(events), loop: steps * STEP };
  }
  const toks = (p as string).trim().split(/\s+/);
  const base = baseNote(layer, root);
  const events: NoteEvent[] = [];
  let open: NoteEvent[] = [];
  toks.forEach((t, i) => {
    if (t === "-") { for (const e of open) e.len += STEP; return; }
    open = [];
    if (t === ".") return;
    for (const d of t.split("+")) {
      const note = degreeNote(d, base, scale);
      if (note === null) continue;
      const e = { start: i * STEP, len: STEP, note, vel: 0.85 };
      events.push(e);
      open.push(e);
    }
  });
  return { events: sortEvents(events), loop: toks.length * STEP };
}

export const sortEvents = (es: NoteEvent[]) => [...es].sort((a, b) => a.start - b.start || a.note - b.note);
const col = (b: number) => Math.round(b / STEP);

export type Mark = "right" | "wrong" | "missed";
export interface Grade {
  /** For each of the learner's notes: right, or wrong with a hint of which way the nearest target note is. */
  mine: { mark: "right" | "wrong"; dir?: "up" | "down" | "early" | "late" }[];
  /** Target notes nobody wrote. */
  missed: number[];
  right: number;
  total: number;
  done: boolean;
}

/**
 * Compare the learner's notes with the target's, on the sixteenth grid. A note is right when the target has
 * the same note starting on the same step. A wrong one says "up" or "down" when the target has a note on that
 * step at another pitch, "early" or "late" when the right pitch is a step or two away. Lengths and velocity
 * are not marked: the ear is learning where the notes are and what they are first.
 */
export function gradeCopy(target: NoteEvent[], mine: NoteEvent[]): Grade {
  const key = (e: NoteEvent) => `${col(e.start)}:${e.note}`;
  const want = new Map<string, number>();
  target.forEach((e, i) => want.set(key(e), i));
  const used = new Set<number>();
  const marks: Grade["mine"] = mine.map(e => {
    const i = want.get(key(e));
    if (i !== undefined && !used.has(i)) { used.add(i); return { mark: "right" as const }; }
    return { mark: "wrong" as const };
  });
  // Directions for the wrong ones, against target notes still unclaimed.
  mine.forEach((e, k) => {
    if (marks[k].mark === "right") return;
    const c = col(e.start);
    const free = target.map((t, i) => ({ t, i })).filter(x => !used.has(x.i));
    const same = free.filter(x => col(x.t.start) === c);
    if (same.length) {
      const near = same.reduce((a, b) => (Math.abs(b.t.note - e.note) < Math.abs(a.t.note - e.note) ? b : a));
      marks[k].dir = near.t.note > e.note ? "up" : "down";
      return;
    }
    const pitch = free.filter(x => x.t.note === e.note && Math.abs(col(x.t.start) - c) <= 2);
    if (pitch.length) {
      const near = pitch.reduce((a, b) => (Math.abs(col(b.t.start) - c) < Math.abs(col(a.t.start) - c) ? b : a));
      marks[k].dir = col(near.t.start) > c ? "late" : "early";
    }
  });
  const missed = target.map((_, i) => i).filter(i => !used.has(i));
  const right = used.size;
  return { mine: marks, missed, right, total: target.length, done: missed.length === 0 && marks.every(m => m.mark === "right") };
}

/** Stars, as Syntorial gives them: three for a first or second check with no hints, fewer with more of either. */
export function copyStars(checks: number, hints: number): 1 | 2 | 3 {
  const cost = Math.max(0, checks - 2) + hints * 2;
  return cost === 0 ? 3 : cost <= 3 ? 2 : 1;
}

/**
 * The rows the grid shows: few enough to find the notes by ear, like Syntorial's notched knobs. Drums: the
 * target's drums plus one it doesn't use (gentle: none extra). A tune: the scale's notes from a step under
 * the lowest target note to a step over the highest (hard: every semitone in that range).
 */
export function rowsFor(layer: CopyLayer, target: NoteEvent[], root: number, scaleIn: string, level: "gentle" | "standard" | "hard" = "standard"): number[] {
  if (layer === "drums") {
    const used = [...new Set(target.map(e => e.note))];
    const order = [36, 38, 39, 37, 41, 45, 48, 42, 46, 51, 70];
    if (level !== "gentle") { const extra = order.find(n => !used.includes(n) && (used.some(u => HAT_NOTES.has(u)) ? true : !HAT_NOTES.has(n))); if (extra !== undefined) used.push(extra); }
    return order.filter(n => used.includes(n)).reverse();
  }
  const scale = asScale(scaleIn);
  const notes = target.map(e => e.note);
  const lo = Math.min(...notes), hi = Math.max(...notes);
  const inKey = (n: number) => (SCALES[scale] as readonly number[]).includes((((n - root) % 12) + 12) % 12);
  const out: number[] = [];
  // One scale step past each end.
  let a = lo - 1; while (a > lo - 4 && !inKey(a)) a--;
  let b = hi + 1; while (b < hi + 4 && !inKey(b)) b++;
  for (let n = b; n >= a; n--) if (level === "hard" || inKey(n) || notes.includes(n)) out.push(n);
  return out;
}

export interface CopyQuestion { drill: "copy"; layer: CopyLayer; pattern: Pattern; bpm: number; root: number; scale: ScaleName; label: string }

type Rng = () => number;
const pick = <T,>(r: Rng, xs: T[]) => xs[Math.floor(r() * xs.length)];

/**
 * A gym question at a level, 1 to 8. The levels follow Building Blocks' order: the kick, then kick and
 * backbeat, then hats, then a root-note bass, a bass with octaves and fifths, chord roots, chords, and a
 * short melody. Everything is one bar, so a learner hears it many times while they work.
 */
export function makeCopyQuestion(level: number, rng: Rng): CopyQuestion {
  const root = 45 + Math.floor(rng() * 7) - 3;
  const scale: ScaleName = rng() < 0.6 ? "minor" : "major";
  const bpm = 100 + Math.floor(rng() * 5) * 6;
  const L = Math.max(1, Math.min(8, level));
  const row = (hits: number[], n = 16) => Array.from({ length: n }, (_, i) => (hits.includes(i) ? "x" : ".")).join("");
  if (L === 1) {
    const kicks = pick(rng, [[0, 4, 8, 12], [0, 8], [0, 6, 8], [0, 4, 8], [0, 3, 8, 12], [0, 10]]);
    return { layer: "drums", pattern: { kick: row(kicks) }, bpm, root, scale, drill: "copy", label: "a kick pattern" };
  }
  if (L === 2) {
    const kicks = pick(rng, [[0, 4, 8, 12], [0, 6, 8], [0, 10], [0, 3, 8, 11], [0, 8, 10]]);
    const back = pick(rng, ["snare", "clap"]);
    return { layer: "drums", pattern: { kick: row(kicks), [back]: row([4, 12]) }, bpm, root, scale, drill: "copy", label: "a kick and a backbeat" };
  }
  if (L === 3) {
    const kicks = pick(rng, [[0, 4, 8, 12], [0, 6, 8, 14], [0, 10]]);
    const hats = pick(rng, [[2, 6, 10, 14], [0, 2, 4, 6, 8, 10, 12, 14], [2, 3, 6, 10, 11, 14]]);
    return { layer: "drums", pattern: { kick: row(kicks), clap: row([4, 12]), hat: row(hats) }, bpm, root, scale, drill: "copy", label: "a beat with hats" };
  }
  if (L === 4) {
    const line = pick(rng, ["1 - . . 1 - . . 1 - . . 1 - . .", "1 - - - . . 1 . . . 1 - . . . .", "1 . . 1 . . 1 . . . 1 . . . . .", "1 - . . . . 1 - . . 1 . . . . ."]);
    return { layer: "bass", pattern: line, bpm, root, scale, drill: "copy", label: "a bass line on one note" };
  }
  if (L === 5) {
    const line = pick(rng, ["1 - . . 1' . . . 1 - . . 5 - . .", "1 . 1' . 1 . 1' . 1 . 1' . 5 . 5' .", "1 - . 5, . . 1 - . . 1 . 5, - . .", "1 - . . . . 1' . 1 - . . 7, - . ."]);
    return { layer: "bass", pattern: line, bpm, root, scale, drill: "copy", label: "a bass line with octaves and fifths" };
  }
  if (L === 6) {
    const prog = pick(rng, [["1", "6,", "3,", "7,"], ["1", "4,", "5,", "1"], ["1", "5,", "6,", "4,"], ["6,", "4,", "1", "5,"]]);
    return { layer: "bass", pattern: prog.map(p => `${p} - - -`).join(" "), bpm, root, scale, drill: "copy", label: "the roots of four chords" };
  }
  if (L === 7) {
    const prog = pick(rng, [["1+3+5", "6,+1+3", "3+5+7", "7,+2+4"], ["1+3+5", "4+6+1'", "5+7+2'", "1+3+5"], ["1+3+5", "5,+7,+2", "6,+1+3", "4,+6,+1"]]);
    return { layer: "chords", pattern: prog.map(p => `${p} - - -`).join(" "), bpm, root, scale, drill: "copy", label: "four chords" };
  }
  const tune = pick(rng, ["1 - 3 - 5 - 3 - 2 - 1 - - - . .", "5 - 4 3 - 1 - . 2 - 3 - 1 - - -", "1 . 1 . 5 - . 4 3 - 2 - 1 - . .", "3 - . 3 2 - 1 - 2 - 3 - 5 - - -"]);
  return { layer: "lead", pattern: tune, bpm, root, scale, drill: "copy", label: "a short melody" };
}
