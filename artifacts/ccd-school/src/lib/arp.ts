/**
 * Arpeggiator and key shift: two midi tools that change which notes play, not how they sound.
 *
 * The arpeggiator is stored on a layer (`arp`) and expanded when the song plays or exports: at each step it
 * plays one of the notes held at that moment, in order (up, down, up and down), over one or two octaves.
 * The notes you played stay as they are, so turning it off gives your chords back. Pure.
 */
import type { LayerV2, NoteEvent, TrackV2 } from "./track2";

export type ArpMode = "up" | "down" | "updown";
export type Arp = { mode: ArpMode; /** steps per beat: 2 is 1/8, 4 is 1/16 */ rate: 2 | 4; oct: 1 | 2 };

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
    out.push({ start: Math.round(s * 1000) / 1000, note: order[k % order.length], vel, len: step * 0.85 });
    k++;
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
