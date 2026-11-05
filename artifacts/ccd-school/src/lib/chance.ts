/**
 * Chance (Live 12) and trig conditions (Elektron) on steps. Set like a parameter lock: hold a step, turn
 * chance, or pick a condition. The engine decides at the step whether it plays (engine/src/seq.rs): play n
 * of the loop, the song's seed and the note give a number, and the note plays when it is under its chance.
 * `roll` here gives the same number as the engine's, so the screen and the tests can say which plays will
 * sound. Pure, tested in tests/chance.test.ts.
 */
import type { NoteEvent } from "./track2";

/** Elektron's trig conditions we offer, in the engine's wire order (seq::cond). "" is none. */
export const CONDS = ["", "1:2", "2:2", "1:4", "2:4", "3:4", "4:4", "fill", "not fill"] as const;
export type Cond = Exclude<(typeof CONDS)[number], "">;
export const condCode = (c: Cond | undefined) => (c ? CONDS.indexOf(c) : 0);
export const isCond = (c: unknown): c is Cond => typeof c === "string" && c !== "" && (CONDS as readonly string[]).includes(c);

/** The same hash as the engine's `roll`. */
export function roll(seed: number, n: number, key: number): number {
  let h = ((seed >>> 0) ^ Math.imul(n >>> 0, 0x9e3779b1) ^ Math.imul(key >>> 0, 0x85ebca77)) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  h = Math.imul(h, 0x7feb352d) >>> 0;
  h = (h ^ (h >>> 15)) >>> 0;
  h = Math.imul(h, 0x846ca68b) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return (h >>> 8) / 16777216;
}

/** The engine's key for an event: where it starts, in 1/960 beats, and its note. */
export const evKey = (e: Pick<NoteEvent, "start" | "note">) => ((Math.round(e.start * 960) >>> 0) ^ (e.note << 20)) >>> 0;

/** Whether an event plays on play `n` of its loop, with the fill key held or not. Same rule as the engine. */
export function plays(e: Pick<NoteEvent, "start" | "note" | "chance" | "cond">, n: number, fill: boolean, seed: number): boolean {
  const c = e.cond;
  const ok = c === "1:2" ? n % 2 === 0 : c === "2:2" ? n % 2 === 1 : c === "1:4" ? n % 4 === 0 : c === "2:4" ? n % 4 === 1 : c === "3:4" ? n % 4 === 2 : c === "4:4" ? n % 4 === 3
    : c === "fill" ? fill : c === "not fill" ? !fill : true;
  const ch = e.chance ?? 1;
  return ok && (ch >= 1 || roll(seed, n, evKey(e)) < Math.fround(ch));
}

/** How a step shows its chance or condition: "50%", "1:2", "fill". Empty when it always plays. */
export function stepTag(e: Pick<NoteEvent, "chance" | "cond"> | undefined): string {
  if (!e) return "";
  if (e.cond) return e.cond === "not fill" ? "!fill" : e.cond;
  return e.chance !== undefined && e.chance < 1 ? `${Math.round(e.chance * 100)}%` : "";
}

/** Set (or clear, with null) the chance on matching events. 1 clears it: the note always plays. */
export function setChance(events: NoteEvent[], match: (e: NoteEvent) => boolean, v: number | null): NoteEvent[] {
  return events.map(e => {
    if (!match(e)) return e;
    const { chance: _c, ...rest } = e; // eslint-disable-line @typescript-eslint/no-unused-vars
    const x = v === null ? 1 : Math.round(Math.min(1, Math.max(0, v)) * 100) / 100;
    return x >= 1 ? rest : { ...rest, chance: x };
  });
}

/** Set (or clear, with null) the trig condition on matching events. */
export function setCond(events: NoteEvent[], match: (e: NoteEvent) => boolean, c: Cond | null): NoteEvent[] {
  return events.map(e => {
    if (!match(e)) return e;
    const { cond: _c, ...rest } = e; // eslint-disable-line @typescript-eslint/no-unused-vars
    return c ? { ...rest, cond: c } : rest;
  });
}

/** Whether the song has any step that waits for the fill key. */
export const hasFillSteps = (layers: { events: NoteEvent[] }[]) => layers.some(l => l.events.some(e => e.cond === "fill" || e.cond === "not fill"));

/** Make stored chance and conditions safe: chance a number in 0..1 (1 dropped), conditions we know. */
export function cleanChance<T extends { layers: { events: NoteEvent[] }[] }>(t: T): T {
  let changed = false;
  const layers = t.layers.map(l => {
    if (!Array.isArray(l.events) || !l.events.some(e => e && (e.chance !== undefined || e.cond !== undefined || e.it !== undefined || e.reps !== undefined))) return l;
    changed = true;
    return {
      ...l,
      events: l.events.map(e => {
        const { chance, cond, it: _it, reps: _reps, ...rest } = e; // eslint-disable-line @typescript-eslint/no-unused-vars
        const out: NoteEvent = { ...rest };
        if (typeof chance === "number" && Number.isFinite(chance) && chance < 1) out.chance = Math.max(0, Math.round(chance * 100) / 100);
        if (isCond(cond)) out.cond = cond;
        return out;
      }),
    };
  });
  return changed ? { ...t, layers } : t;
}
