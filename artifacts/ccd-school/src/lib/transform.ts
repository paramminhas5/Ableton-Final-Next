/**
 * MIDI transformations on the note grid (Live 12's MIDI Transformations): strum, humanize and the velocity
 * shaper. Each works on the picked notes (all notes when none are picked), takes one amount, and returns
 * new notes; the note grid makes each press one undo step. Deterministic: humanize takes a seed. Pure,
 * tested in tests/transform.test.ts.
 */
import { cellRand } from "./dice";
import type { NoteEvent } from "./track2";

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const r4 = (v: number) => Math.round(v * 10000) / 10000;
const r2 = (v: number) => Math.round(v * 100) / 100;
const pickedOf = (events: NoteEvent[], picked?: Set<number>) => (picked && picked.size ? picked : new Set(events.map((_, i) => i)));

/** The most a note moves per strum step, in beats: a 1/32 note at full amount. */
export const STRUM_MAX = 0.125;

/**
 * Strum: notes that start together are spread out, lowest first for a positive amount (a down strum on a
 * guitar), highest first for a negative one. Each note's end stays where it was. `amount` -1..1.
 */
export function strum(events: NoteEvent[], amount: number, picked?: Set<number>): NoteEvent[] {
  const on = pickedOf(events, picked);
  const step = clamp(amount, -1, 1) * STRUM_MAX;
  if (!step) return events;
  const groups = new Map<number, number[]>();
  events.forEach((e, i) => {
    if (!on.has(i)) return;
    const k = Math.round(e.start * 1000);
    groups.set(k, [...(groups.get(k) ?? []), i]);
  });
  const out = events.map(e => ({ ...e }));
  for (const idx of groups.values()) {
    if (idx.length < 2) continue;
    const order = [...idx].sort((a, b) => (step > 0 ? events[a].note - events[b].note : events[b].note - events[a].note));
    order.forEach((i, k) => {
      const e = events[i];
      const off = Math.min(Math.abs(step) * k, Math.max(0, e.len - 0.0625));
      out[i] = { ...e, start: r4(e.start + off), len: r4(e.len - off) };
    });
  }
  return out;
}

/**
 * Humanize: every note moves a little early or late and plays a little softer or harder, the way a person
 * plays. `amount` 0..1: at 1, up to a 64th note either way in time and 25% either way in velocity.
 */
export function humanize(events: NoteEvent[], amount: number, seed: number, picked?: Set<number>, loop = Infinity): NoteEvent[] {
  const on = pickedOf(events, picked);
  const a = clamp(Math.abs(amount), 0, 1);
  if (!a) return events;
  return events.map((e, i) => {
    if (!on.has(i)) return e;
    const dt = (cellRand(seed, 41, i) * 2 - 1) * a * 0.0625;
    const dv = (cellRand(seed, 42, i) * 2 - 1) * a * 0.25;
    const start = r4(clamp(e.start + dt, 0, Math.max(0, loop - 1e-4)));
    return { ...e, start, vel: r2(clamp(e.vel + dv, 0.05, 1)) };
  });
}

/**
 * Velocity shaper: a ramp over the picked notes from first to last. A positive amount gets louder (soft
 * first, the loudest note last), a negative one gets softer. At 1 the first note plays at 15% of the peak.
 */
export function velocityShape(events: NoteEvent[], amount: number, picked?: Set<number>): NoteEvent[] {
  const on = pickedOf(events, picked);
  const a = clamp(amount, -1, 1);
  const idx = events.map((_, i) => i).filter(i => on.has(i));
  if (!a || idx.length < 2) return events;
  const t0 = Math.min(...idx.map(i => events[i].start)), t1 = Math.max(...idx.map(i => events[i].start));
  const peak = Math.max(...idx.map(i => events[i].vel));
  const span = t1 - t0 || 1;
  return events.map((e, i) => {
    if (!on.has(i)) return e;
    const t = (e.start - t0) / span;
    const f = a > 0 ? 1 - a * 0.85 * (1 - t) : 1 + a * 0.85 * t;
    return { ...e, vel: r2(clamp(peak * f, 0.05, 1)) };
  });
}
