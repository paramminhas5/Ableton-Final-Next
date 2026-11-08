/**
 * Imagine it first (Building Blocks' Mind's Ear; design/audible-genius.md). The learner sees the notes of a
 * short phrase on the grid and hears nothing; they hum it, or hear it in their head, then pick which of a few
 * phrases played on the engine is the one they saw, and only then hear it. Trains the inner ear: reading notes
 * and knowing how they sound, which no DAW teaches.
 *
 * Phrases are copy patterns (src/lib/copyEar.ts): a drum map or a tune line in the song's scale. The phrases
 * it could be mistaken for are written in the lesson file (`others`) or made here from the phrase itself: its
 * mirror image (up where it went down), one note moved, or one note moved in time. Pure, so it is tested.
 */
import { makeCopyQuestion, patternProblems, type CopyLayer, type Pattern } from "./copyEar";
import type { ScaleName } from "./theory";

type Rng = () => number;
export type ImagineLevel = "gentle" | "standard" | "hard";

const TOK = /^(b|#)?([1-9])([',]*)$/;
type Deg = { acc: string; step: number }; // step: scale steps from the root, 0 = 1, 7 = 1'
const parseTok = (t: string): Deg | null => {
  const m = TOK.exec(t);
  if (!m) return null;
  const oct = m[3].split("").reduce((a, c) => a + (c === "'" ? 1 : -1), 0);
  return { acc: m[1] ?? "", step: Number(m[2]) - 1 + oct * 7 };
};
const showTok = (d: Deg): string => {
  const oct = Math.floor(d.step / 7);
  const n = (((d.step % 7) + 7) % 7) + 1;
  return `${d.acc}${n}${oct > 0 ? "'".repeat(oct) : ",".repeat(-oct)}`;
};
/** Move every note of a step (a note or a chord) by some scale steps. */
const moveStep = (tok: string, by: number): string => tok.split("+").map(x => { const d = parseTok(x); return d ? showTok({ acc: "", step: d.step + by }) : x; }).join("+");
const isNote = (t: string) => t !== "." && t !== "-";
const firstStep = (toks: string[]) => parseTok((toks.find(isNote) ?? "1").split("+")[0])?.step ?? 0;

/** The tune upside down around its first note: where it went up, the mirror goes down. */
function mirror(toks: string[]): string[] {
  const f = firstStep(toks);
  return toks.map(t => (isNote(t) ? t.split("+").map(x => { const d = parseTok(x); return d ? showTok({ acc: d.acc, step: 2 * f - d.step }) : x; }).join("+") : t));
}
/** One note (not the first) moved by `by` scale steps. */
function oneNote(toks: string[], rng: Rng, by: number): string[] {
  const at = toks.map((t, i) => (isNote(t) ? i : -1)).filter(i => i > 0);
  if (!at.length) return toks;
  const i = at[Math.floor(rng() * at.length)];
  return toks.map((t, k) => (k === i ? moveStep(t, rng() < 0.5 ? -by : by) : t));
}
/** One note (with its holds) moved a step earlier or later, into a rest. */
function oneLate(toks: string[], rng: Rng): string[] {
  const cand: { from: number; to: number }[] = [];
  toks.forEach((t, i) => {
    if (!isNote(t) || i === 0) return;
    if (toks[i - 1] === ".") cand.push({ from: i, to: i - 1 });
    if (i + 1 < toks.length && toks[i + 1] === ".") cand.push({ from: i, to: i + 1 });
  });
  if (!cand.length) return oneNote(toks, rng, 1);
  const c = cand[Math.floor(rng() * cand.length)];
  const out = toks.slice();
  out[c.to] = toks[c.from];
  // a note moved earlier holds into its old step; one moved later leaves it empty
  out[c.from] = c.to < c.from ? "-" : ".";
  return out;
}

/** A drum map with one hit moved (`by` steps) or one row's hits swapped onto another drum. */
function drumDecoy(p: Record<string, string>, rng: Rng, kind: "move" | "swap"): Record<string, string> {
  const rows = Object.entries(p).map(([k, v]) => [k, v.replace(/\s/g, "")] as const);
  if (kind === "swap" && rows.length >= 2) {
    const [a, b] = [rows[0], rows[1]];
    return Object.fromEntries(rows.map(([k, v]) => [k, k === a[0] ? b[1] : k === b[0] ? a[1] : v]));
  }
  const hits = rows.flatMap(([k, v]) => [...v].map((c, i) => (c !== "." ? { k, i } : null)).filter((x): x is { k: string; i: number } => !!x));
  const pick = hits[Math.floor(rng() * hits.length)];
  if (!pick) return p;
  const row = rows.find(([k]) => k === pick.k)![1];
  const n = row.length;
  for (const by of rng() < 0.5 ? [2, -2, 1, -1, 4] : [-2, 2, -1, 1, 4]) {
    const to = (pick.i + by + n) % n;
    if (row[to] === ".") {
      const cells = [...row];
      cells[to] = cells[pick.i];
      cells[pick.i] = ".";
      return Object.fromEntries(rows.map(([k, v]) => [k, k === pick.k ? cells.join("") : v]));
    }
  }
  return p;
}

const key = (p: Pattern) => (typeof p === "string" ? p.trim().split(/\s+/).join(" ") : JSON.stringify(Object.fromEntries(Object.entries(p).map(([k, v]) => [k, v.replace(/\s/g, "")]))));

/** Phrases the shown one could be mistaken for, by level: gentle one far one, standard a far and a near, hard two near. */
export function decoys(layer: CopyLayer, pattern: Pattern, level: ImagineLevel, rng: Rng): Pattern[] {
  const want = level === "gentle" ? 1 : 2;
  const tries: (() => Pattern)[] = [];
  if (layer === "drums") {
    const p = pattern as Record<string, string>;
    if (level !== "hard") tries.push(() => drumDecoy(p, rng, "swap"));
    tries.push(() => drumDecoy(p, rng, "move"), () => drumDecoy(drumDecoy(p, rng, "move"), rng, "move"), () => drumDecoy(p, rng, "move"));
  } else {
    const toks = (pattern as string).trim().split(/\s+/);
    const j = (t: string[]) => t.join(" ");
    // A chord progression upside down is a pile of odd voicings, so chords get two chords moved instead.
    if (level !== "hard") tries.push(...(layer === "chords" ? [] : [() => j(mirror(toks))]), () => j(oneNote(oneNote(toks, rng, 2), rng, 2)));
    tries.push(() => j(oneNote(toks, rng, level === "hard" ? 1 : 2)), () => j(oneLate(toks, rng)), () => j(oneNote(toks, rng, 1)), () => j(oneNote(toks, rng, 3)));
  }
  const seen = new Set([key(pattern)]);
  const out: Pattern[] = [];
  for (let round = 0; round < 4 && out.length < want; round++)
    for (const t of tries) {
      if (out.length >= want) break;
      const d = t();
      if (seen.has(key(d)) || patternProblems(layer, d).length) continue;
      seen.add(key(d));
      out.push(d);
    }
  return out;
}

/** The phrases to choose from, shuffled, and which one was shown. `others` (from the file) are used before made ones. */
export function imagineChoices(layer: CopyLayer, pattern: Pattern, level: ImagineLevel, rng: Rng, others: Pattern[] = []): { choices: Pattern[]; answer: number } {
  const want = level === "gentle" ? 1 : 2;
  const given = others.filter(o => key(o) !== key(pattern)).slice(0, want);
  const made = given.length < want ? decoys(layer, pattern, level, rng).filter(d => !given.some(g => key(g) === key(d))) : [];
  const all = [pattern, ...given, ...made].slice(0, want + 1);
  const order = all.map((_, i) => i);
  for (let a = order.length - 1; a > 0; a--) { const b = Math.floor(rng() * (a + 1)); [order[a], order[b]] = [order[b], order[a]]; }
  return { choices: order.map(i => all[i]), answer: order.indexOf(0) };
}

/** Problems with an imagine step's phrases, in words, for the lesson compiler. */
export function imagineProblems(layer: CopyLayer, pattern: unknown, others: unknown): string[] {
  const out = patternProblems(layer, pattern).map(p => `pattern: ${p}`);
  if (others === undefined) return out;
  if (!Array.isArray(others) || others.length < 1 || others.length > 2) return [...out, "others lists one or two phrases it could be mistaken for"];
  others.forEach((o, i) => {
    for (const p of patternProblems(layer, o)) out.push(`others ${i + 1}: ${p}`);
    if (!out.length && key(o as Pattern) === key(pattern as Pattern)) out.push(`others ${i + 1} is the same as the pattern`);
  });
  return out;
}

export interface ImagineQuestion { drill: "imagine"; layer: CopyLayer; pattern: Pattern; choices: Pattern[]; answer: number; bpm: number; root: number; scale: ScaleName; label: string }

/**
 * A gym round at a level, 1 to 8, on the copy drill's material (a kick, kick and backbeat, hats, a bass line,
 * octaves and fifths, chord roots, chords, a melody): two phrases to choose from at levels 1 and 2, three
 * after, and from level 6 the others are only one note away.
 */
export function makeImagineQuestion(level: number, rng: Rng): ImagineQuestion {
  const c = makeCopyQuestion(level, rng);
  const lv: ImagineLevel = level <= 2 ? "gentle" : level <= 5 ? "standard" : "hard";
  const { choices, answer } = imagineChoices(c.layer, c.pattern, lv, rng);
  return { drill: "imagine", layer: c.layer, pattern: c.pattern, choices, answer, bpm: c.bpm, root: c.root, scale: c.scale, label: c.label };
}
