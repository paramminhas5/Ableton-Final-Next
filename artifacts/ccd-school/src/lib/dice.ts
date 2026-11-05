/**
 * Fill and randomise with an amount (Polyend Play's fill, Elektron's probability): one amount, one
 * dice key. Every cell gets a fixed random number from the seed, and a cell fills when that number is
 * under amount x how likely that kind of hit is there. So turning the amount up grows the same fill,
 * and the dice key picks a new one. Your own notes are never removed. Pure, tested in tests/dice.test.ts.
 */
import { SCALES, type ScaleName } from "./theory";
import type { NoteEvent } from "./track2";

/** A number in 0..1 that depends only on the seed and the two coordinates. */
export function cellRand(seed: number, a: number, b: number): number {
  let h = (seed ^ Math.imul(a + 0x9e37, 0x85ebca6b) ^ Math.imul(b + 0x7f4a, 0xc2b2ae35)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967296;
}

export const newSeed = () => Math.floor(Math.random() * 2 ** 31);

/** How likely a drum sound is at a position in the beat: kicks on beats, claps on two and four, hats on eighths. */
export function drumWeight(note: number, beat: number): number {
  const inBeat = ((beat % 1) + 1) % 1;
  const onBeat = inBeat < 1e-6, on8 = Math.abs(inBeat - 0.5) < 1e-6;
  const bar = Math.floor(beat) % 4;
  switch (note) {
    case 36: return onBeat ? 0.6 : on8 ? 0.3 : 0.14;
    case 38: case 39: return onBeat && (bar === 1 || bar === 3) ? 0.8 : on8 ? 0.06 : onBeat ? 0.05 : 0.16;
    case 42: case 70: return on8 || onBeat ? 0.75 : 0.5;
    case 46: return on8 ? 0.5 : 0.05;
    default: return onBeat ? 0.2 : 0.12;
  }
}

/** Drums: `base` plus hits the dice chose, on `lanes`, over `loop` beats of `grid`-beat steps. */
export function fillDrums(base: NoteEvent[], lanes: number[], loop: number, grid: number, amount: number, seed: number): NoteEvent[] {
  if (amount <= 0) return base;
  const out = [...base];
  const steps = Math.round(loop / grid);
  lanes.forEach((note, li) => {
    for (let s = 0; s < steps; s++) {
      const beat = s * grid;
      if (base.some(e => e.note === note && Math.abs(e.start - beat) < grid / 2)) continue;
      const r = cellRand(seed, li, s);
      if (r < Math.min(1, amount * drumWeight(note, beat) * 1.4)) {
        // Fills come in softer than the groove, like ghost notes.
        out.push({ note, vel: Math.round((0.42 + 0.4 * cellRand(seed + 1, li, s)) * 100) / 100, start: beat, len: Math.min(0.2, grid) });
      }
    }
  });
  return out.sort((a, b) => a.start - b.start || a.note - b.note);
}

/** A melody: notes the dice chose on empty steps, walking the scale from the notes around them. */
export function fillMelody(base: NoteEvent[], o: { loop: number; step: number; root: number; scale: ScaleName; amount: number; seed: number; lo?: number; hi?: number }): NoteEvent[] {
  if (o.amount <= 0) return base;
  const scale = SCALES[o.scale] as readonly number[];
  const inScale = (n: number) => scale.includes((((n - o.root) % 12) + 12) % 12);
  const pool: number[] = [];
  const lo = o.lo ?? o.root + 12, hi = o.hi ?? o.root + 31;
  for (let n = lo; n <= hi; n++) if (inScale(n)) pool.push(n);
  if (!pool.length) return base;
  const out = [...base];
  const steps = Math.round(o.loop / o.step);
  const sounding = (b: number) => out.some(e => e.start <= b + 1e-6 && e.start + e.len > b + 1e-6);
  let last = base.length ? base[0].note : pool[Math.floor(pool.length / 2)];
  for (let s = 0; s < steps; s++) {
    const beat = s * o.step;
    const here = base.find(e => Math.abs(e.start - beat) < 1e-6);
    if (here) { last = here.note; continue; }
    if (sounding(beat)) continue;
    const w = Math.abs(beat % 0.5) < 1e-6 ? 0.55 : 0.3;
    if (cellRand(o.seed, 7, s) >= Math.min(1, o.amount * w * 1.5)) continue;
    // Step up or down the scale a little from the last note.
    const i = pool.indexOf(pool.reduce((a, n) => (Math.abs(n - last) < Math.abs(a - last) ? n : a), pool[0]));
    const move = Math.round((cellRand(o.seed, 8, s) - 0.5) * 5);
    const n = pool[Math.max(0, Math.min(pool.length - 1, i + move))];
    out.push({ note: n, vel: Math.round((0.55 + 0.35 * cellRand(o.seed, 9, s)) * 100) / 100, start: beat, len: o.step });
    last = n;
  }
  return out.sort((a, b) => a.start - b.start || a.note - b.note);
}
