/**
 * Sound presets per layer type: drum kits, bass patches, chord pads, leads, fx sets.
 * A preset is a set of normalised values on the engine's wire indices. Picking one
 * replaces the layer's instrument knobs (its mix and eq stay yours).
 */
import { BASS_PARAMS, CHORD_PARAMS, DRUM_PAD_PARAMS, DRUM_RACK_BASE, FX_PARAMS, INSTRUMENT_BASE, LEAD_PARAMS, SAMPLER_PARAMS } from "../engine/params.gen";
import type { LayerType, LayerV2 } from "./track2";

export type Preset = { name: string; values: Record<number, number> };

const byKey = (table: readonly { key: string; index: number }[], v: Record<string, number>) =>
  Object.fromEntries(Object.entries(v).map(([k, n]) => [table.find(p => p.key === k)!.index, n]));

const bass = (name: string, v: Record<string, number>): Preset => ({ name, values: byKey(BASS_PARAMS, v) });
const chords = (name: string, v: Record<string, number>): Preset => ({ name, values: byKey(CHORD_PARAMS, v) });
const lead = (name: string, v: Record<string, number>): Preset => ({ name, values: byKey(LEAD_PARAMS, v) });
const fx = (name: string, v: Record<string, number>): Preset => ({ name, values: byKey(FX_PARAMS, v) });

const smp = (name: string, v: Record<string, number>): Preset => ({ name, values: byKey(SAMPLER_PARAMS, v) });

const BASS: Preset[] = [
  bass("round", {}),
  bass("sub", { cutoff: 0.3, res: 0.1, env: 0.2, glide: 0.1, decay: 0.6, wave: 0, sub: 0.85, drift: 0.1 }),
  bass("pluck", { cutoff: 0.55, res: 0.3, env: 0.7, glide: 0, decay: 0.2, wave: 0.3, sub: 0.3, drift: 0.2 }),
  bass("acid", { cutoff: 0.42, res: 0.78, env: 0.85, glide: 0.25, decay: 0.35, wave: 1, sub: 0.15, drift: 0.2 }),
  bass("growl", { cutoff: 0.5, res: 0.5, env: 0.6, glide: 0.45, decay: 0.6, wave: 1, sub: 0.5, drift: 0.5 }),
];

const CHORDS: Preset[] = [
  chords("warm", {}),
  chords("stab", { voicing: 0.3, spread: 0.3, attack: 0, release: 0.2, cutoff: 0.7, res: 0.2, env: 0.7, drift: 0.2 }),
  chords("organ", { voicing: 1, spread: 0.1, attack: 0.02, release: 0.15, cutoff: 0.85, res: 0.05, env: 0.1, drift: 0.1 }),
  chords("glass", { voicing: 0.8, spread: 0.7, attack: 0.2, release: 0.8, cutoff: 0.9, res: 0.1, env: 0.2, drift: 0.4, width: 0.6 }),
];

const LEAD: Preset[] = [
  lead("saw", {}),
  lead("square", { cutoff: 0.55, res: 0.2, attack: 0.05, release: 0.3, glide: 0.1, wave: 1, detune: 0.1, env: 0.3 }),
  lead("soft", { cutoff: 0.4, res: 0.15, attack: 0.3, release: 0.6, glide: 0.3, wave: 0, detune: 0.4, env: 0.15 }),
  lead("hoover", { cutoff: 0.7, res: 0.4, attack: 0.1, release: 0.5, glide: 0.5, wave: 0.2, detune: 1, env: 0.5, width: 0.75 }),
];

const FX: Preset[] = [
  fx("default", {}),
  fx("short hits", { length: 0.1, noise: 0.5, filter: 0.6, reverb: 0.15, build: 0, tune: 0.5 }),
  fx("long build", { length: 0.7, noise: 0.7, filter: 0.85, reverb: 0.4, build: 0, tune: 0.5 }),
  fx("dark", { length: 0.43, noise: 0.4, filter: 0.35, reverb: 0.5, build: 0, tune: 0.35 }),
];

/** A drum kit is the four knobs of each of the 16 pads: tune, decay, drive, level. */
function kit(name: string, f: (pad: number) => [number, number, number, number], open = 0): Preset {
  const values: Record<number, number> = {};
  for (let pad = 0; pad < 16; pad++) {
    const four = f(pad);
    four.forEach((v, k) => (values[INSTRUMENT_BASE + pad * DRUM_PAD_PARAMS.length + k] = v));
  }
  values[INSTRUMENT_BASE + DRUM_RACK_BASE] = open;
  return { name, values };
}

const DRUMS: Preset[] = [
  kit("house", pad => [0.5, 0.5, 0, 0.75]),
  kit("tight", pad => [pad === 0 ? 0.55 : 0.52, pad === 0 ? 0.35 : 0.3, 0.1, 0.75]),
  kit("boom", pad => (pad === 0 ? [0.4, 0.8, 0.35, 0.8] : pad === 1 ? [0.45, 0.6, 0.2, 0.75] : [0.5, 0.55, 0.1, 0.7])),
  kit("dusty", pad => [0.46, 0.4, 0.55, pad >= 4 && pad <= 7 ? 0.6 : 0.72], 0.2),
  kit("hard", pad => [0.5, 0.45, 0.8, 0.75]),
];

const SAMPLE: Preset[] = [
  smp("one shot", {}),
  smp("gate", { gate: 1, release: 0.15 }),
  smp("keys", { keys: 1, gate: 1, release: 0.3 }),
  smp("reverse", { reverse: 1 }),
];

export const PRESETS: Record<LayerType, Preset[]> = { drums: DRUMS, hats: DRUMS, bass: BASS, chords: CHORDS, lead: LEAD, fx: FX, sample: SAMPLE };

/** Apply preset `i` of this layer's type. Clears the old instrument knobs first. */
export function applyPreset(l: LayerV2, i: number): LayerV2 {
  const list = PRESETS[l.type];
  const n = ((i % list.length) + list.length) % list.length;
  const keep = Object.fromEntries(Object.entries(l.params).filter(([k]) => Number(k) < INSTRUMENT_BASE));
  return { ...l, params: { ...keep, ...list[n].values }, preset: n };
}
