/**
 * Arpeggiator and key shift: two midi tools that change which notes play, not how they sound.
 *
 * The arpeggiator is stored on a layer (`arp`) and expanded when the song plays or exports: at each step it
 * plays one of the notes held at that moment, in order (up, down, up and down), over one or two octaves.
 * The notes you played stay as they are, so turning it off gives your chords back. Pure.
 */
import type { LayerV2, NoteEvent, TrackV2 } from "./track2";
import { cellRand } from "./dice";

export type ArpMode = "up" | "down" | "updown";
export type Arp = { mode: ArpMode; /** steps per beat: 2 is 1/8, 4 is 1/16 */ rate: 2 | 4; oct: 1 | 2;
  /** Variation 0..1 and its dice: some steps rest, jump to another note of the chord or up an octave, louder or softer. */
  rand?: number; seed?: number };

export const ARP_MODES: ArpMode[] = ["up", "down", "updown"];
export const ARP_LABEL: Record<ArpMode, string> = { up: "up", down: "down", updown: "up and down" };

/** The note order an arpeggio cycles through for one held chord. */
export function arpOrder(held: number[], mode: ArpMode, oct: 1 | 2): number[] {
  const up = [...new Set(held)].sort((a, b) => a - b);
  const span = oct === 2 ? [...up, ...up.map(n => n + 12)] : up;
  if (mode === "down") return [...span].reverse();
  if (mode === "updown") return span.length > 2 ? [...span, ...span.slice(1, -1).reverse()] : span;
  return span;
}

/** One layer's events with its arpeggiator applied. Unchanged with no arp. */
export function arpEvents(events: NoteEvent[], arp: Arp | undefined, loop: number): NoteEvent[] {
  if (!arp || !events.length) return events;
  const step = 1 / arp.rate;
  const out: NoteEvent[] = [];
  let key = "";
  let k = 0;
  for (let s = 0; s < loop - 1e-6; s += step) {
    const held = events.filter(e => e.start <= s + 1e-6 && e.start + Math.max(e.len, step) > s + 1e-6);
    if (!held.length) { key = ""; continue; }
    const order = arpOrder(held.map(e => e.note), arp.mode, arp.oct);
    const now = order.join(",");
    if (now !== key) { key = now; k = 0; }
    const vel = Math.max(...held.map(e => e.vel));
    let note = order[k % order.length], v = vel;
    const amt = arp.rand ?? 0;
    if (amt > 0) {
      const i = Math.round(s / step), seed = arp.seed ?? 1;
      const r = cellRand(seed, 1, i);
      // The more variation, the more steps change: a rest, a jump, an octave, or just a different touch.
      if (r < amt * 0.22) { k++; continue; }
      if (r < amt * 0.5) note = order[Math.floor(cellRand(seed, 2, i) * order.length)];
      else if (r < amt * 0.62) note += 12;
      v = Math.max(0.2, Math.min(1, vel * (1 - amt * 0.35 + amt * 0.5 * cellRand(seed, 3, i))));
    }
    out.push({ start: Math.round(s * 1000) / 1000, note, vel: Math.round(v * 100) / 100, len: step * 0.85 });
    k++;
  }
  return out;
}

/**
 * One cell per arp step from `from` to `to` (beats): what the arpeggiator really plays there, read from
 * `arpEvents` so the screen and the engine can't disagree. `note` is null on a rest (variation dropped the
 * step) and on a step with nothing held (`held` false). `varied`: variation moved this note (another note
 * of the chord, or up an octave) from where the plain pattern would be.
 */
export type ArpCell = { start: number; note: number | null; vel: number; held: boolean; varied: boolean };
export function arpSteps(events: NoteEvent[], arp: Arp, loop: number, from: number, to: number): ArpCell[] {
  const step = 1 / arp.rate;
  const played = arpEvents(events, arp, loop);
  const plain = arp.rand ? arpEvents(events, { ...arp, rand: 0 }, loop) : played;
  const at = (list: NoteEvent[], s: number) => list.find(e => Math.abs(e.start - s) < 1e-3);
  const out: ArpCell[] = [];
  for (let i = Math.ceil(from / step - 1e-6); i * step < Math.min(to, loop) - 1e-6; i++) {
    const s = Math.round(i * step * 1000) / 1000 + 0;
    const held = events.some(e => e.start <= s + 1e-6 && e.start + Math.max(e.len, step) > s + 1e-6);
    const e = at(played, s);
    const p = at(plain, s);
    out.push({ start: s, note: e ? e.note : null, vel: e ? e.vel : 0, held, varied: !!e && !!p && e.note !== p.note });
  }
  return out;
}

/** The song with every layer's arpeggiator expanded (what the engine plays and the midi file holds). */
export function withArps(t: TrackV2): TrackV2 {
  if (!t.layers.some(l => l.arp)) return t;
  // Expanded once: the result carries no arp, so applying it twice changes nothing.
  return { ...t, layers: t.layers.map((l): LayerV2 => (l.arp ? { ...l, events: arpEvents(l.events, l.arp, t.loop || 4), arp: undefined } : l)) };
}

/** Melodic parts, the ones a key shift moves (drums and hats keep their pads). */
const MELODIC = new Set(["bass", "chords", "lead"]);

/** The whole song moved up or down by `semis` semitones: every melodic note and the song's key. */
export function transposed(t: TrackV2, semis: number): TrackV2 {
  if (!semis) return t;
  return {
    ...t,
    root: (t.root ?? 45) + semis,
    layers: t.layers.map(l => (MELODIC.has(l.type) ? { ...l, events: l.events.map(e => ({ ...e, note: Math.max(0, Math.min(127, e.note + semis)) })) } : l)),
  };
}
