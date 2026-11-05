/**
 * Parameter locks (Elektron's "hold a step, turn a knob"). A note event can carry `p`, normalised
 * values by wire index that apply from that note until the next note that uses the same param.
 * The engine plays one value per layer, so the host sends the locked value at the note's time and
 * puts the layer's own value back at the next note without a lock (`lockSchedule`, played by
 * `LockPlayer`). Pure parts tested in tests/plock.test.ts.
 */
import { DRUM_PAD_NOTES, DRUM_PAD_PARAMS, DRUM_RACK_BASE, INSTRUMENT_BASE, MAX_PARAMS } from "../engine/params.gen";
import type { NoteEvent, TrackV2 } from "./track2";

export type Change = { beat: number; index: number; value: number };

/** The drum pad a wire index belongs to, or null for a param the whole layer shares. */
export function padOfIndex(index: number, drums: boolean): number | null {
  if (!drums || index < INSTRUMENT_BASE) return null;
  const i = index - INSTRUMENT_BASE;
  if (i >= DRUM_RACK_BASE) return null;
  return Math.floor(i / DRUM_PAD_PARAMS.length);
}

const padOfNote = (note: number) => DRUM_PAD_NOTES.indexOf(note as (typeof DRUM_PAD_NOTES)[number]);

/**
 * When to send what, for one layer's events over a loop of `loop` beats. Each locked param gets a
 * change at every note where its value differs from the note before (round the loop), so a lock
 * holds for its note and the layer's own value comes back at the next unlocked note.
 */
export function lockSchedule(events: NoteEvent[], base: (index: number) => number, drums = false): Change[] {
  const indices = new Set<number>();
  for (const e of events) if (e.p) for (const k of Object.keys(e.p)) indices.add(Number(k));
  const out: Change[] = [];
  const sorted = [...events].sort((a, b) => a.start - b.start);
  for (const index of indices) {
    const pad = padOfIndex(index, drums);
    const uses = pad === null ? sorted : sorted.filter(e => padOfNote(e.note) === pad);
    if (!uses.length) continue;
    // Notes on the same beat share one value: a lock on any of them wins.
    const beats: { beat: number; value: number }[] = [];
    for (const e of uses) {
      const v = e.p?.[index];
      const last = beats[beats.length - 1];
      if (last && Math.abs(last.beat - e.start) < 1e-6) { if (v !== undefined) last.value = v; continue; }
      beats.push({ beat: e.start, value: v ?? base(index) });
    }
    if (beats.every(b => b.value === beats[0].value) && beats[0].value === base(index)) continue;
    beats.forEach((b, i) => {
      const prev = beats[(i - 1 + beats.length) % beats.length];
      if (beats.length === 1 || prev.value !== b.value) out.push({ beat: b.beat, index, value: b.value });
    });
  }
  return out.sort((a, b) => a.beat - b.beat || a.index - b.index);
}

/** Set (or with `v` null, clear) a lock on every event `match` picks. Empty lock maps are dropped. */
export function setLock(events: NoteEvent[], match: (e: NoteEvent) => boolean, index: number, v: number | null): NoteEvent[] {
  return events.map(e => {
    if (!match(e)) return e;
    const p = { ...(e.p ?? {}) };
    if (v === null) delete p[index];
    else p[index] = Math.min(1, Math.max(0, v));
    const { p: _old, ...rest } = e; // eslint-disable-line @typescript-eslint/no-unused-vars
    return Object.keys(p).length ? { ...rest, p } : rest;
  });
}

/** Make stored locks safe: whole wire indices in range, finite values clamped to 0..1, empty maps gone. */
export function cleanLocks<T extends Pick<TrackV2, "layers">>(t: T): T {
  let changed = false;
  const layers = t.layers.map(l => {
    if (!Array.isArray(l.events) || !l.events.some(e => e && (e as NoteEvent).p !== undefined)) return l;
    changed = true;
    return {
      ...l,
      events: l.events.map(e => {
        if (e.p === undefined) return e;
        const p: Record<number, number> = {};
        if (e.p && typeof e.p === "object") {
          for (const [k, v] of Object.entries(e.p)) {
            const i = Number(k);
            if (Number.isInteger(i) && i >= 0 && i < MAX_PARAMS + 64 && typeof v === "number" && Number.isFinite(v)) p[i] = Math.min(1, Math.max(0, v));
          }
        }
        const { p: _old, ...rest } = e; // eslint-disable-line @typescript-eslint/no-unused-vars
        return Object.keys(p).length ? { ...rest, p } : rest;
      }),
    };
  });
  return changed ? { ...t, layers } : t;
}

/**
 * Which changes fall due between two playhead readings, `from` (exclusive) to `to` (inclusive), on
 * a loop of `loop` beats, handling the wrap at the loop end. Returns each with how many beats ahead
 * of `from` it is, so the caller can time it.
 */
export function dueBetween(changes: Change[], from: number, to: number, loop: number): { change: Change; ahead: number }[] {
  const out: { change: Change; ahead: number }[] = [];
  const span = ((to - from) % loop + loop) % loop;
  for (const c of changes) {
    const d = ((c.beat - from) % loop + loop) % loop;
    if (d > 0 && d <= span) out.push({ change: c, ahead: d });
  }
  return out.sort((a, b) => a.ahead - b.ahead);
}

/** The value each locked param has at `beat`: the last change at or before it, round the loop. */
export function valuesAt(changes: Change[], beat: number, loop: number): Map<number, number> {
  const out = new Map<number, number>();
  const best = new Map<number, number>();
  for (const c of changes) {
    const back = ((beat - c.beat) % loop + loop) % loop;
    if (!best.has(c.index) || back < best.get(c.index)!) { best.set(c.index, back); out.set(c.index, c.value); }
  }
  return out;
}

/**
 * The locks the engine plays (cmd evLock): each note that uses a locked param carries its value, a lock or -1
 * for the knob's own, so the engine sets it on the note's exact sample, before it sounds (Elektron). Same-beat
 * notes share the winning value, as `lockSchedule` does. A note whose value is the same as the note before it
 * carries nothing, unless that note may not play (chance or a condition), so a skipped note never leaves a lock
 * behind. Events with no locks come back unchanged (the same array).
 */
export function withEngineLocks<E extends NoteEvent>(events: E[], drums = false): (E & { locks?: [number, number][] })[] {
  const indices = new Set<number>();
  for (const e of events) if (e.p) for (const k of Object.keys(e.p)) indices.add(Number(k));
  if (!indices.size) return events;
  const add = new Map<E, [number, number][]>();
  const order = events.map((e, i) => ({ e, i })).sort((a, b) => a.e.start - b.e.start || a.i - b.i).map(x => x.e);
  for (const index of indices) {
    const pad = padOfIndex(index, drums);
    const uses = pad === null ? order : order.filter(e => padOfNote(e.note) === pad);
    if (!uses.length) continue;
    const groups: { beat: number; value: number; evs: E[]; sure: boolean }[] = [];
    for (const e of uses) {
      const v = e.p?.[index];
      const g = groups[groups.length - 1];
      const sure = !e.cond && (e.chance ?? 1) >= 1;
      if (g && Math.abs(g.beat - e.start) < 1e-6) { if (v !== undefined) g.value = v; g.evs.push(e); g.sure &&= sure; continue; }
      groups.push({ beat: e.start, value: v ?? -1, evs: [e], sure });
    }
    if (groups.every(g => g.value === -1)) continue;
    groups.forEach((g, i) => {
      const prev = groups[(i - 1 + groups.length) % groups.length];
      if (groups.length > 1 && prev.value === g.value && prev.sure) return;
      for (const e of g.evs) add.set(e, [...(add.get(e) ?? []), [index, g.value]]);
    });
  }
  return events.map(e => { const l = add.get(e); return l ? { ...e, locks: l } : e; });
}
