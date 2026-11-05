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

/** A part that runs free (Elektron's master length at inf): its own length, and never restarted by the loop. */
export const isFree = (l: Pick<LayerV2, "len" | "free">, loop: number) => l.free === true && partLen(l, loop) !== null;

/** Every part with its own length tiled across the loop. Unchanged (the same object) when none has one.
 * `keepFree` leaves free-running parts as they are (an arrangement lays them across the whole song). */
export function withPartLengths(t: TrackV2, opts?: { keepFree?: boolean }): TrackV2 {
  const L = t.loop || 4;
  const tile = (l: LayerV2) => partLen(l, L) !== null && !(opts?.keepFree && isFree(l, L));
  if (!t.layers.some(tile)) return t;
  return { ...t, layers: t.layers.map(l => (tile(l) ? { ...l, events: tiled(l.events, partLen(l, L)!, L) } : l)) };
}

/**
 * A free-running part laid across `total` beats from the song's start: its first `len` beats over and over,
 * never restarted, each copy marked with which play of the part it is (`it`, for chance and conditions) when
 * it has any. Used by the arrangement and the midi export; the engine runs an unarranged song's free part
 * itself (cmd partLen).
 */
export function freeTiled(events: NoteEvent[], len: number, from: number, to: number): NoteEvent[] {
  const one = events.filter(e => e.start < len - 1e-9).map(e => ({ ...e, len: Math.min(e.len, len) }));
  const out: NoteEvent[] = [];
  if (!one.length || len <= 0) return out;
  for (let g = Math.max(0, Math.floor(from / len)); g * len < to - 1e-9; g++) {
    for (const e of one) {
      const start = Math.round((g * len + e.start) * 1e6) / 1e6;
      if (start < from - 1e-9 || start >= to - 1e-9) continue;
      out.push(e.cond || (e.chance ?? 1) < 1 ? { ...e, start, it: g } : { ...e, start });
    }
  }
  return out.sort((a, b) => a.start - b.start || a.note - b.note);
}

/** The swing a part plays with: its own, or the song's. */
export const swingOf = (l: Pick<LayerV2, "swing">, t: Pick<TrackV2, "swing">) => (typeof l.swing === "number" && Number.isFinite(l.swing) ? Math.min(0.75, Math.max(0, l.swing)) : t.swing ?? 0);
