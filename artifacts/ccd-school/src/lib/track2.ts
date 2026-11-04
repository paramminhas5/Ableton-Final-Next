/**
 * Your track, version 2. Up to 8 layers; each layer is an instrument, a list of note
 * events, the parameters behind its knob banks, and its own mix (level, pan, send,
 * duck under a chosen layer). Every surface (steps, keys, pads) edits the same events.
 *
 * Stored in localStorage "ccd.track.v2". The first read migrates "ccd.track.v1" and
 * leaves the old copy in place, so nothing is lost if we ever need to roll back.
 */
"use client";
import { useCallback, useEffect, useState } from "react";
import type { Layer as V1Layer, LayerKind, Track as V1Track, WorldKey } from "./track";
import {
  BASS_PARAMS,
  CHORD_PARAMS,
  DRUM_RACK_BASE,
  DRUM_RACK_PARAMS,
  FX_PARAMS,
  SAMPLER_PARAMS,
  LEAD_PARAMS,
  DRUM_PAD_NOTES,
  DRUM_PAD_PARAMS,
  INSTRUMENT_BASE,
  LAYER_PARAMS,
  MASTER_PARAMS,
  type InstrumentName,
} from "../engine/params.gen";

export const MAX_LAYERS = 8;
export const LOOP_BEATS = 4;
export const STEP_BEATS = 0.25;

export type LayerType = "drums" | "hats" | "bass" | "chords" | "lead" | "fx" | "sample";
export type Surface = "steps" | "keys" | "pads" | "own";
export type Bank = "sound" | "eq" | "fx" | "mix";

export type NoteEvent = { note: number; vel: number; start: number; len: number };

export type LayerV2 = {
  id: string;
  type: LayerType;
  events: NoteEvent[];
  /** Normalised 0..1, keyed by engine wire index (see params.gen.ts). Missing = default. */
  params: Record<number, number>;
  mute: boolean;
  solo: boolean;
  /** Ducks under hits on this layer (id) and note (null = any). */
  duck: { src: string | null; note: number | null };
  surface: Surface;
  /** Drum pad the sound bank is shaping. */
  pad: number;
  from?: string;
  world?: WorldKey;
  variant: number;
  /** Index into this type's presets, for the picker's name. */
  preset?: number;
  /** The circle surface's settings per drum note: hits out of 16 and rotation. */
  euclid?: Record<number, { hits: number; rot: number }>;
  /** Sampler layers: the name of the sample in each of the 16 slots (the audio lives in this browser). */
  samples?: Record<number, string>;
  /** Arpeggiator on this part (src/lib/arp.ts); off when missing. */
  arp?: { mode: "up" | "down" | "updown"; rate: 2 | 4; oct: 1 | 2 };
};

export type TrackV2 = {
  v: 2;
  bpm: number;
  root: number;
  scale: "minor" | "major";
  swing: number;
  /** Loop length in beats: 4 per bar, one to four bars. */
  loop: number;
  /** Beats per step in the steps view: 0.5 (1/8), 0.25 (1/16) or 0.125 (1/32). Missing = 0.25. */
  grid?: number;
  layers: LayerV2[];
  /** Master bus, normalised, by MASTER_PARAMS index. Missing = default. */
  master?: Record<number, number>;
  /** The arrangement, when the song has one (src/lib/arrange.ts). */
  sections?: { name: string; bars: number; off: string[]; fill?: boolean; riser?: boolean }[];
  added: string[];
  updatedAt: number;
};

export const TYPE: Record<LayerType, { label: string; color: string; engine: InstrumentName; own: string; surfaces: Surface[] }> = {
  drums: { label: "drums", color: "#4FE3B6", engine: "drums", own: "circle", surfaces: ["steps", "keys", "pads"] },
  hats: { label: "hats", color: "#F3C14F", engine: "drums", own: "rolls", surfaces: ["steps", "keys", "pads"] },
  bass: { label: "bass", color: "#FF4F9A", engine: "bass", own: "glide", surfaces: ["steps", "keys", "pads"] },
  chords: { label: "chords", color: "#B89CFF", engine: "chords", own: "chord pads", surfaces: ["steps", "keys", "pads"] },
  lead: { label: "lead", color: "#7D96FF", engine: "lead", own: "xy", surfaces: ["steps", "keys", "pads"] },
  fx: { label: "fx", color: "#E9E9E6", engine: "fx", own: "riser", surfaces: ["steps", "pads"] },
  sample: { label: "sample", color: "#FFB35C", engine: "sampler", own: "load", surfaces: ["steps", "pads", "keys"] },
};

export const LAYER_ORDER: LayerType[] = ["drums", "hats", "bass", "chords", "lead", "fx", "sample"];

/** Drum sounds per lane, for the steps view (a lane per sound, 8 steps a page). */
export const DRUM_LANES: Record<"drums" | "hats", number[]> = {
  drums: [36, 38, 39, 42, 37, 41, 45, 48],
  hats: [42, 46, 70, 51, 49],
};

const uid = () => Math.random().toString(36).slice(2, 9);

export function newLayerV2(type: LayerType, from?: string, world?: WorldKey): LayerV2 {
  return { id: uid(), type, events: [], params: {}, mute: false, solo: false, duck: { src: null, note: null }, surface: type === "bass" ? "keys" : "pads", pad: 0, from, world, variant: 0 };
}

export function emptyTrackV2(): TrackV2 {
  return { v: 2, bpm: 120, root: 45, scale: "minor", swing: 0, loop: LOOP_BEATS, layers: [], added: [], updatedAt: Date.now() };
}

/** Normalised value of a param on a layer, falling back to the registry default. */
export function paramOf(l: LayerV2, index: number): number {
  if (l.params[index] !== undefined) return l.params[index];
  if (index < INSTRUMENT_BASE) return LAYER_PARAMS.find(p => p.index === index)?.default ?? 0;
  const engine = TYPE[l.type].engine;
  if (engine === "drums") {
    const i = index - INSTRUMENT_BASE;
    if (i >= DRUM_RACK_BASE) return DRUM_RACK_PARAMS[i - DRUM_RACK_BASE]?.default ?? 0;
    return DRUM_PAD_PARAMS[i % DRUM_PAD_PARAMS.length]?.default ?? 0;
  }
  return INSTRUMENT_TABLES[engine]?.find(p => p.index === index)?.default ?? 0;
}

/** The knob tables of the single-voice instruments, by engine name. */
export const INSTRUMENT_TABLES: Partial<Record<InstrumentName, readonly { index: number; default: number; bank: string }[]>> = {
  bass: BASS_PARAMS,
  chords: CHORD_PARAMS,
  lead: LEAD_PARAMS,
  fx: FX_PARAMS,
  sampler: SAMPLER_PARAMS,
};

/** How many wire params the engine takes for an instrument (layer params excluded). */
export function instrumentParamCount(engine: InstrumentName): number {
  if (engine === "drums") return DRUM_RACK_BASE + DRUM_RACK_PARAMS.length;
  return INSTRUMENT_TABLES[engine]?.length ?? 0;
}

/** Beats per step for this track, and how many steps one bar page holds on a 16 step screen. */
export function gridOf(t: TrackV2): number {
  return t.grid && [0.5, 0.25, 0.125].includes(t.grid) ? t.grid : STEP_BEATS;
}
export const barsOf = (t: TrackV2) => Math.max(1, Math.min(4, Math.round(t.loop / 4)));

/** Normalised value of a master param, falling back to the registry default. */
export function masterOf(t: TrackV2, index: number): number {
  return t.master?.[index] ?? MASTER_PARAMS[index]?.default ?? 0;
}

// ── migration from v1 ────────────────────────────────────────────────────────

const V1_DRUM_NOTE: Partial<Record<LayerKind, number>> = { kick: 36, clap: 39, perc: 60, hats: 42 };
const DRUM_KINDS: LayerKind[] = ["kick", "clap", "perc"];
const B = BASS_PARAMS.reduce<Record<string, number>>((a, p) => ((a[p.id] = p.index), a), {});
const L = LAYER_PARAMS.reduce<Record<string, number>>((a, p) => ((a[p.id] = p.index), a), {});
const padParam = (pad: number, k: number) => INSTRUMENT_BASE + pad * DRUM_PAD_PARAMS.length + k;

function v1Events(l: V1Layer): NoteEvent[] {
  const out: NoteEvent[] = [];
  const drum = V1_DRUM_NOTE[l.kind];
  l.steps.forEach((on, i) => {
    if (!on) return;
    const start = i * STEP_BEATS;
    if (drum !== undefined) out.push({ note: drum, vel: 0.9, start, len: 0.2 });
    else if (l.kind === "chords" || l.kind === "pad") {
      const root = l.notes[0] ?? 57;
      out.push({ note: root - 12, vel: 0.8, start, len: l.kind === "pad" ? 3.8 : 1.8 });
    } else out.push({ note: l.notes[i] ?? 45, vel: 0.9, start, len: 0.4 });
  });
  return out;
}

/** v1 knob values onto the v2 param registry, as close as the meanings allow. */
function v1Params(l: V1Layer, pad = 0): Record<number, number> {
  const [a, b, c, level] = l.params;
  const p: Record<number, number> = {};
  switch (l.kind) {
    case "kick":
    case "clap":
    case "perc":
    case "hats":
      p[padParam(pad, 0)] = 0.5 + (a - 0.5) * 0.5; // tune: keep near centre
      p[padParam(pad, 1)] = b; // decay
      if (l.kind === "kick") p[padParam(pad, 2)] = c; // drive
      p[padParam(pad, 3)] = level;
      break;
    case "bass":
      p[B["bass.cutoff"]] = a;
      p[B["bass.res"]] = b;
      p[B["bass.glide"]] = c;
      p[L["mix.level"]] = level;
      break;
    default:
      p[B["bass.cutoff"]] = a;
      p[L["mix.send"]] = Math.min(1, c * 0.6);
      p[L["mix.level"]] = level;
  }
  return p;
}

/**
 * v1 to v2. Kick, clap and perc become one drum rack (one lane each, like the canvas
 * drum layer); hats keep their own layer; pad joins chords. Sidechain becomes duck
 * under the drums' kick. Pure: does not touch storage.
 */
export function migrateV1(t: V1Track): TrackV2 {
  const out: TrackV2 = { ...emptyTrackV2(), bpm: t.bpm, added: [...t.added], updatedAt: Date.now() };
  let drums: LayerV2 | null = null;
  const byType = new Map<LayerType, LayerV2>();
  for (const l of t.layers) {
    if (DRUM_KINDS.includes(l.kind)) {
      if (!drums) {
        drums = { ...newLayerV2("drums", l.from, l.world), id: l.id, mute: l.mute };
        out.layers.push(drums);
      }
      const pad = DRUM_PAD_NOTES.indexOf(V1_DRUM_NOTE[l.kind] as (typeof DRUM_PAD_NOTES)[number]);
      drums.events.push(...v1Events(l));
      Object.assign(drums.params, v1Params(l, pad));
      drums.variant = Math.max(drums.variant, l.variant);
      continue;
    }
    const type: LayerType = l.kind === "pad" ? "chords" : (l.kind as LayerType);
    const existing = byType.get(type);
    if (existing) {
      // Chords and pad both in v1: fold into one chords layer.
      existing.events.push(...v1Events(l));
      continue;
    }
    const v2: LayerV2 = {
      ...newLayerV2(type, l.from, l.world),
      id: l.id,
      events: v1Events(l),
      params: v1Params(l, 4),
      mute: l.mute,
      variant: l.variant,
    };
    byType.set(type, v2);
    out.layers.push(v2);
  }
  // Sidechain: duck under the drums' kick.
  const drumId = drums?.id ?? null;
  for (const l of t.layers) {
    if (!l.sidechain || !drumId) continue;
    const v2 = out.layers.find(x => x.id === l.id) ?? (l.kind === "pad" ? byType.get("chords") : undefined);
    if (v2 && v2.id !== drumId) {
      v2.duck = { src: drumId, note: 36 };
      v2.params[L["mix.duck"]] = 0.5;
    }
  }
  for (const l of out.layers) l.events.sort((a, b) => a.start - b.start || a.note - b.note);
  out.layers = out.layers.slice(0, MAX_LAYERS);
  return out;
}

// ── v2 to the v1 shape, so lessons, Today and DJ keep working unchanged ──────

const PATTERN_LANE: Partial<Record<LayerKind, number>> = { kick: 36, clap: 39, perc: 60 };

/** A v1 view of the track: one v1 layer per drum lane in use, ids "<drums id>:<kind>". */
export function toV1View(t: TrackV2): V1Track {
  const layers: V1Layer[] = [];
  const stepsOf = (evs: NoteEvent[]) => {
    const s = Array<boolean>(16).fill(false);
    for (const e of evs) s[Math.floor((((e.start % t.loop) + t.loop) % t.loop) / STEP_BEATS) % 16] = true;
    return s;
  };
  const notesOf = (evs: NoteEvent[], fallback: number) => {
    const n = Array<number>(16).fill(fallback);
    for (const e of evs) n[Math.floor(e.start / STEP_BEATS) % 16] = e.note;
    return n;
  };
  const level = (l: LayerV2) => paramOf(l, L["mix.level"]);
  for (const l of t.layers) {
    const duck = paramOf(l, L["mix.duck"]) > 0 && !!l.duck.src;
    if (l.type === "drums") {
      for (const kind of ["kick", "clap", "perc"] as LayerKind[]) {
        const evs = l.events.filter(e => e.note === PATTERN_LANE[kind]);
        if (!evs.length && kind !== "kick") continue;
        layers.push({ id: `${l.id}:${kind}`, kind, steps: stepsOf(evs), notes: Array(16).fill(36), params: [0.5, 0.5, 0.2, level(l)], mute: l.mute, from: l.from, world: l.world, variant: l.variant });
      }
      continue;
    }
    const kind: LayerKind = l.type === "fx" ? "perc" : (l.type as LayerKind);
    layers.push({
      id: l.id,
      kind,
      steps: stepsOf(l.events),
      notes: notesOf(l.events, kind === "chords" ? 57 : 45),
      params: [paramOf(l, B["bass.cutoff"]), paramOf(l, B["bass.res"]), paramOf(l, B["bass.glide"]), level(l)],
      mute: l.mute,
      sidechain: duck,
      from: l.from,
      world: l.world,
      variant: l.variant,
    });
  }
  return { v: 1, bpm: t.bpm, layers, added: [...t.added], updatedAt: t.updatedAt };
}

/**
 * Bring v1-shaped edits (a lesson adding or upgrading a layer) into the v2 track.
 * New v1 layers are migrated in; a drum kind lands as a lane in the drums layer;
 * an upgraded layer (variant went up) takes the lesson's new pattern.
 */
export function mergeV1(t2: TrackV2, before: V1Track, after: V1Track): TrackV2 {
  const out: TrackV2 = { ...t2, bpm: after.bpm, added: [...after.added], layers: t2.layers.map(l => ({ ...l, events: [...l.events], params: { ...l.params } })) };
  const prev = new Map(before.layers.map(l => [l.id, l]));
  for (const l of after.layers) {
    const old = prev.get(l.id);
    if (old && old.variant === l.variant && old.steps.join() === l.steps.join() && old.params.join() === l.params.join() && old.mute === l.mute) continue;
    const [baseId, lane] = l.id.split(":");
    const isDrum = DRUM_KINDS.includes(l.kind);
    let target = isDrum ? out.layers.find(x => x.type === "drums") : out.layers.find(x => x.id === baseId);
    if (!target) {
      if (out.layers.length >= MAX_LAYERS) continue;
      const m = migrateV1({ v: 1, bpm: after.bpm, layers: [l], added: [], updatedAt: 0 });
      target = m.layers[0];
      if (!target) continue;
      out.layers.push(target);
      continue;
    }
    const fresh = migrateV1({ v: 1, bpm: after.bpm, layers: [l], added: [], updatedAt: 0 }).layers[0];
    if (isDrum) {
      const note = V1_DRUM_NOTE[(lane as LayerKind) ?? l.kind] ?? V1_DRUM_NOTE[l.kind]!;
      target.events = [...target.events.filter(e => e.note !== note), ...fresh.events].sort((a, b) => a.start - b.start);
      Object.assign(target.params, fresh.params);
    } else {
      target.events = fresh.events;
      Object.assign(target.params, fresh.params);
    }
    target.variant = Math.max(target.variant, l.variant);
    target.mute = l.mute;
  }
  // Layers a lesson screen removed (none do today) stay: v2 is the source of truth.
  return out;
}

// ── store, with undo ─────────────────────────────────────────────────────────

const KEY = "ccd.track.v2";
const V1_KEY = "ccd.track.v1";
const EVT = "track2:change";

export function readTrackV2(): TrackV2 {
  if (typeof window === "undefined") return emptyTrackV2();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const t = JSON.parse(raw) as TrackV2;
      if (t && t.v === 2) return t;
    }
    const v1 = localStorage.getItem(V1_KEY);
    if (v1) {
      const t1 = JSON.parse(v1) as V1Track;
      if (t1 && t1.v === 1) {
        const t2 = migrateV1(t1);
        localStorage.setItem(KEY, JSON.stringify(t2));
        return t2;
      }
    }
  } catch {
    /* fall through */
  }
  return emptyTrackV2();
}

export function writeTrackV2(t: TrackV2) {
  try {
    localStorage.setItem(KEY, JSON.stringify(t));
  } catch {
    /* storage full or blocked: keep going in memory */
  }
  window.dispatchEvent(new CustomEvent(EVT, { detail: t }));
}

export function hasTrackV2(): boolean {
  try {
    return typeof window !== "undefined" && !!localStorage.getItem(KEY);
  } catch {
    return false;
  }
}

/** Undo history: every edit is one step. Kept in memory for the session. */
const past: TrackV2[] = [];
const future: TrackV2[] = [];
const HISTORY = 100;

/** Forget undo steps, eg after switching songs, so undo never pulls in another song. */
export function clearHistory() {
  past.length = 0;
  future.length = 0;
}

export function useTrackV2() {
  const [track, setTrack] = useState<TrackV2>(emptyTrackV2);
  const [, tick] = useState(0);
  useEffect(() => {
    setTrack(readTrackV2());
    const on = (e: Event) => setTrack((e as CustomEvent<TrackV2>).detail);
    const onStore = (e: StorageEvent) => {
      if (e.key === KEY) setTrack(readTrackV2());
    };
    window.addEventListener(EVT, on);
    window.addEventListener("storage", onStore);
    return () => {
      window.removeEventListener(EVT, on);
      window.removeEventListener("storage", onStore);
    };
  }, []);

  /** `undoable` false for things that should not clutter undo (selecting a surface). */
  const update = useCallback((fn: (t: TrackV2) => TrackV2, undoable = true) => {
    const cur = readTrackV2();
    const next = { ...fn(cur), updatedAt: Date.now() };
    if (undoable) {
      past.push(cur);
      if (past.length > HISTORY) past.shift();
      future.length = 0;
    }
    writeTrackV2(next);
    setTrack(next);
    tick(n => n + 1);
  }, []);

  const undo = useCallback(() => {
    const prev = past.pop();
    if (!prev) return;
    future.push(readTrackV2());
    writeTrackV2(prev);
    setTrack(prev);
    tick(n => n + 1);
  }, []);

  const redo = useCallback(() => {
    const nxt = future.pop();
    if (!nxt) return;
    past.push(readTrackV2());
    writeTrackV2(nxt);
    setTrack(nxt);
    tick(n => n + 1);
  }, []);

  return { track, update, undo, redo, canUndo: past.length > 0, canRedo: future.length > 0 };
}

/** A hats layer plays the closed hat (pad 4), never the kick that pad 0 would give it. */
export function effectivePad(l: Pick<LayerV2, "type" | "pad">): number {
  return l.type === "hats" && l.pad === 0 ? 4 : l.pad;
}
