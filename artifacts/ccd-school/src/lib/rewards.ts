/**
 * Stripes and trophies. You earn a lesson's stripe by taking its challenge (the questions at the end);
 * it is gold when every answer was right first time. Trophies unlock from what you have done.
 * Stored in this browser. Pure helpers are exported for tests.
 */
export type Stripe = { gold: boolean; at: number };
export type Stripes = Record<string, Stripe>;
export type Trophy = { id: string; name: string; line: string; icon: string };

const KEY = "ccd.stripes.v1";
export const STRIPES_EVENT = "ccd:stripes";

export const TROPHIES: (Trophy & { test: (s: Stripes, done: Record<string, unknown>) => boolean })[] = [
  { id: "first-sound", name: "first sound", line: "made your first sound", icon: "note", test: (_, d) => !!d["what-is-sound"] || !!d["synth-what-is-sound"] },
  { id: "first-kick", name: "heartbeat", line: "put a kick in your song", icon: "flame", test: (_, d) => !!d["your-kick"] || !!d["tempo-bpm"] },
  { id: "first-mix", name: "first blend", line: "finished your first dj lesson", icon: "loop", test: (_, d) => !!d["what-is-djing"] },
  { id: "stripes-3", name: "three stripes", line: "earned three stripes", icon: "bolt", test: s => Object.keys(s).length >= 3 },
  { id: "gold-1", name: "clean sheet", line: "a gold stripe, every answer right first time", icon: "gem", test: s => Object.values(s).some(x => x.gold) },
  { id: "all-worlds", name: "three worlds", line: "a lesson done in basics, producer and dj", icon: "globe", test: (_, d) => (!!d["tempo-bpm"] || !!d["what-is-sound"] || !!d["synth-what-is-sound"]) && !!d["your-kick"] && !!d["what-is-djing"] },
];

export function trophiesFor(s: Stripes, done: Record<string, unknown>): (Trophy & { won: boolean })[] {
  return TROPHIES.map(({ test, ...t }) => ({ ...t, won: test(s, done) }));
}

/** Trophies that a new stripe or lesson would add. */
export function newTrophies(before: Stripes, after: Stripes, doneBefore: Record<string, unknown>, doneAfter: Record<string, unknown>): Trophy[] {
  const was = new Set(trophiesFor(before, doneBefore).filter(t => t.won).map(t => t.id));
  return trophiesFor(after, doneAfter).filter(t => t.won && !was.has(t.id)).map(({ won: _w, ...t }) => t);
}

export function readStripes(): Stripes {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Stripes; } catch { return {}; }
}

/** Saves a stripe (gold is kept once earned) and returns the stripes before and after. */
export function earnStripe(slug: string, gold: boolean): { before: Stripes; after: Stripes } {
  const before = readStripes();
  const prev = before[slug];
  const after = { ...before, [slug]: { gold: gold || !!prev?.gold, at: prev?.at ?? Date.now() } };
  try { localStorage.setItem(KEY, JSON.stringify(after)); window.dispatchEvent(new Event(STRIPES_EVENT)); } catch { /* ignore */ }
  return { before, after };
}
