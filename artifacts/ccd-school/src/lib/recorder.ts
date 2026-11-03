/**
 * Recording what you play. The engine reports each note you play with the loop beat it
 * happened on (already corrected for the time the touch took to reach the engine).
 * This pairs note on and off into events, snaps them, and adds them on top of what the
 * layer already has (overdub).
 */
import { snapBeat, wrapBeat, type Snap } from "./theory";
import type { NoteEvent } from "./track2";

/** Notes played just before the downbeat at the end of the count-in land on beat 1. */
export const COUNT_IN_GRACE = 0.25;
const MIN_LEN = 1 / 16;

export type Held = Map<string, { note: number; vel: number; start: number }>;

export type RecordOpts = { loop: number; snap: Snap; strength: number; swing: number };

/** Start a held note. Returns false if it should not be recorded (too early in the count-in). */
export function pressNote(held: Held, layerId: string, note: number, vel: number, beat: number, countingIn: boolean): boolean {
  let b = beat;
  if (countingIn || b < 0) {
    if (b < -COUNT_IN_GRACE) return false;
    b = 0;
  }
  held.set(`${layerId}:${note}`, { note, vel, start: b });
  return true;
}

/** Finish a held note into an event, or null if it was not being recorded. */
export function releaseNote(held: Held, layerId: string, note: number, beat: number, o: RecordOpts): NoteEvent | null {
  const key = `${layerId}:${note}`;
  const h = held.get(key);
  if (!h) return null;
  held.delete(key);
  let len = beat - h.start;
  if (len < 0) len += o.loop; // held across the loop end
  len = Math.min(Math.max(len, MIN_LEN), o.loop);
  const start = wrapBeat(snapBeat(h.start, o.snap, o.strength, o.swing), o.loop);
  return { note: h.note, vel: h.vel, start, len };
}

/**
 * Add a recorded event on top of the layer. A note that lands on the same note within
 * half a grid step of an existing one replaces it, so looping over a part and playing it
 * again tightens it instead of doubling it.
 */
export function overdub(events: NoteEvent[], ev: NoteEvent, o: RecordOpts): NoteEvent[] {
  const near = o.snap === "off" ? 1 / 32 : o.snap === "1/32" ? 1 / 16 : 1 / 8;
  const kept = events.filter(e => !(e.note === ev.note && Math.abs(circular(e.start - ev.start, o.loop)) < near));
  return [...kept, ev].sort((a, b) => a.start - b.start || a.note - b.note);
}

/** Toggle a step: add a note on the step, or remove whatever note is there. */
export function toggleStep(events: NoteEvent[], note: number | null, step: number, stepBeats: number, len: number, vel = 0.9): NoteEvent[] {
  const s = step * stepBeats;
  const at = (e: NoteEvent) => Math.abs(e.start - s) < stepBeats / 2 && (note === null || e.note === note);
  if (events.some(at)) return events.filter(e => !at(e));
  if (note === null) return events;
  return [...events, { note, vel, start: s, len }].sort((a, b) => a.start - b.start || a.note - b.note);
}

function circular(d: number, loop: number) {
  const w = wrapBeat(d, loop);
  return w > loop / 2 ? w - loop : w;
}
