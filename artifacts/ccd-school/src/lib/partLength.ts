/**
 * Per-part loop length and swing (Elektron's per-track length, Live's groove per clip). A part with its own
 * length repeats its first `len` beats across the song's loop, so hats three steps long against a sixteen
 * step kick drift against it (polymeter), starting together again at the top of the loop, as Elektron
 * does with the master length set to the pattern. A part with its own swing swings by that, not the song's.
 * Songs without either play exactly as before. Pure, tested in tests/partLength.test.ts.
 */
import type { LayerV2, NoteEvent, TrackV2 } from "./track2";

/** A part's own loop length in beats, or null when it follows the song. */
export function partLen(l: Pick<LayerV2, "len">, loop: number): number | null {
  const n = l.len;
  return typeof n === "number" && Number.isFinite(n) && n > 0 && n < loop - 1e-9 ? n : null;
}

/** The part's notes laid across the song's loop: its first `len` beats, over and over. */
export function tiled(events: NoteEvent[], len: number, loop: number): NoteEvent[] {
  const one = events.filter(e => e.start < len - 1e-9).map(e => ({ ...e, len: Math.min(e.len, len) }));
  const out: NoteEvent[] = [];
  for (let k = 0; k * len < loop - 1e-9; k++) {
    for (const e of one) {
      const start = Math.round((e.start + k * len) * 1e6) / 1e6;
      if (start < loop - 1e-9) out.push({ ...e, start });
    }
  }
  return out.sort((a, b) => a.start - b.start || a.note - b.note);
}

/** Every part with its own length tiled across the loop. Unchanged (the same object) when none has one. */
export function withPartLengths(t: TrackV2): TrackV2 {
  const L = t.loop || 4;
  if (!t.layers.some(l => partLen(l, L) !== null)) return t;
  return { ...t, layers: t.layers.map(l => { const n = partLen(l, L); return n === null ? l : { ...l, events: tiled(l.events, n, L) }; }) };
}

/** The swing a part plays with: its own, or the song's. */
export const swingOf = (l: Pick<LayerV2, "swing">, t: Pick<TrackV2, "swing">) => (typeof l.swing === "number" && Number.isFinite(l.swing) ? Math.min(0.75, Math.max(0, l.swing)) : t.swing ?? 0);
