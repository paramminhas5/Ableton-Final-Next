/** A remake's sound as knob values, and putting it into the learner's song (src/components/m1/Remakes.tsx). Pure, so it is tested. */
import { remakeKnob } from "./remakes";
import { MAX_LAYERS, newLayerV2, type TrackV2 } from "./track2";
import type { Remake } from "./remakesSource";

/** Remakes are matched on nine positions a knob. */
export const REMAKE_NOTCHES = 8;

/** The remake's patch by wire index: the part's own knobs (both of the kick's pages) and the channel's. The lit knobs' values sit on the notches already. */
export function patch(r: Remake, from: Record<string, number> = r.params): Record<number, number> {
  const out: Record<number, number> = {};
  for (const [key, v] of Object.entries(from)) { const k = remakeKnob(r.part, key); if (k) out[k.index] = v; }
  return out;
}

/** Your song with the remade sound on its part: the part's knobs set to the patch, or a new part with the remake's bar. */
export function keepRemake(t: TrackV2, r: Remake): TrackV2 {
  const p = patch(r);
  const i = t.layers.findIndex(l => l.type === r.part && l.events.length);
  if (i >= 0) return { ...t, layers: t.layers.map((l, k) => (k === i ? { ...l, params: { ...l.params, ...p } } : l)), updatedAt: Date.now() };
  if (t.layers.length >= MAX_LAYERS) return t;
  const l = newLayerV2(r.part, `remake-${r.id}`);
  l.events = r.notes.map(e => ({ ...e }));
  l.params = p;
  return { ...t, layers: [...t.layers, l], updatedAt: Date.now() };
}
