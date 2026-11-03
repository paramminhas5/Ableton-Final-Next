/**
 * Your track. A one-bar loop that grows as you learn.
 *
 * Learn: when a lesson is finished, the app offers what that lesson adds
 * (a new layer, or a change to one you have). Nothing is added unless you
 * press "add to my track".
 * Studio: every layer can be edited: steps, four knobs, mute, remove.
 *
 * Stored in localStorage "ccd.track.v1". Plays only when you press play.
 */
"use client";
import { useEffect, useState, useCallback } from "react";
import { hasTrackV2, mergeV1, readTrackV2, toV1View, writeTrackV2 } from "./track2";

export type LayerKind = "kick" | "hats" | "clap" | "bass" | "chords" | "lead" | "pad" | "perc";
export type WorldKey = "fundamentals" | "dj" | "producer";

export type Layer = {
  id: string;
  kind: LayerKind;
  steps: boolean[];          // 16
  notes: number[];           // 16 midi notes (melodic kinds); ignored for drums
  params: [number, number, number, number]; // 0..1, meaning per kind (see KIND)
  mute: boolean;
  sidechain?: boolean;        // ducks under the kick
  from?: string;             // mission slug that added it
  world?: WorldKey;
  variant: number;           // how many times a lesson has improved it
};

export type Track = { v: 1; bpm: number; layers: Layer[]; added: string[]; updatedAt: number };

export const MAX_LAYERS = 8;

export const KIND: Record<LayerKind, { label: string; knobs: [string, string, string, string]; color: string; defaults: [number, number, number, number] }> = {
  kick:   { label: "kick",   knobs: ["tune", "decay", "drive", "level"],  color: "#4FE3B6",   defaults: [0.45, 0.5, 0.2, 0.85] },
  hats:   { label: "hats",   knobs: ["tone", "decay", "swing", "level"],  color: "#4FE3B6",   defaults: [0.7, 0.25, 0.0, 0.55] },
  clap:   { label: "clap",   knobs: ["tone", "decay", "space", "level"],  color: "#4FE3B6",   defaults: [0.5, 0.4, 0.3, 0.6] },
  perc:   { label: "perc",   knobs: ["tune", "decay", "pan", "level"],    color: "#4FE3B6",   defaults: [0.6, 0.2, 0.5, 0.45] },
  bass:   { label: "bass",   knobs: ["cutoff", "res", "glide", "level"],  color: "#FF4F9A",     defaults: [0.4, 0.3, 0.0, 0.75] },
  lead:   { label: "lead",   knobs: ["cutoff", "res", "echo", "level"],   color: "#7D96FF", defaults: [0.6, 0.25, 0.3, 0.5] },
  chords: { label: "chords", knobs: ["cutoff", "attack", "space", "level"], color: "#B89CFF", defaults: [0.5, 0.1, 0.35, 0.5] },
  pad:    { label: "pad",    knobs: ["cutoff", "attack", "space", "level"], color: "#B89CFF", defaults: [0.35, 0.6, 0.6, 0.45] },
};

const S = (s: string) => s.split("").map(c => c === "x");
const A = 45; // A2

/** Starting patterns, and the variation each further lesson brings. */
const PATTERNS: Record<LayerKind, { steps: string[]; notes?: number[][] }> = {
  kick:   { steps: ["x...x...x...x...", "x...x...x...x.x.", "x..xx...x..xx..."] },
  hats:   { steps: ["..x...x...x...x.", "x.x.x.x.x.x.x.x.", "xxx.xxx.xxx.xx.x"] },
  clap:   { steps: ["....x.......x...", "....x.......x..x", "....x..x....x..."] },
  perc:   { steps: ["...x..x....x.x..", ".x..x..x.x..x..x", "xx.x.xx.xx.x.xx."] },
  bass:   { steps: ["x..x..x.x..x..x.", "x.xx..x.x.xx..x.", "x..x.xx.x..x.xxx"],
            notes: [[A,A,A,A+12,A,A,A,A,A+3,A,A,A+3,A,A,A+5,A], [A,A,A+12,A,A,A,A+7,A,A+3,A,A+15,A+3,A,A,A+5,A], [A,A,A,A+12,A,A+7,A+10,A,A+3,A,A,A+15,A,A+5,A+7,A+10]] },
  lead:   { steps: ["x...x..x..x.....", "x.x.x..x..x...x.", "x.xxx..x.xx.x.x."],
            notes: [[69,69,69,69,72,72,72,74,74,74,76,76,76,76,76,76],[69,69,72,72,72,72,72,76,76,76,74,74,74,74,79,79],[69,69,72,74,76,76,76,79,79,81,79,79,76,76,74,72]] },
  chords: { steps: ["x.......x.......", "x.......x...x...", "x..x....x..x...."],
            notes: [[57],[57],[57]] },
  pad:    { steps: ["x...............", "x.......x.......", "x.......x.......",] , notes: [[57],[57],[57]] },
};

const uid = () => Math.random().toString(36).slice(2, 9);

export function newLayer(kind: LayerKind, from?: string, world?: WorldKey): Layer {
  const p = PATTERNS[kind];
  return {
    id: uid(), kind,
    steps: S(p.steps[0]),
    notes: p.notes ? [...p.notes[0]] : Array(16).fill(36),
    params: [...KIND[kind].defaults] as Layer["params"],
    mute: false, from, world, variant: 0,
  };
}

export function emptyTrack(): Track {
  return { v: 1, bpm: 120, layers: [], added: [], updatedAt: Date.now() };
}

// ── Which lesson adds what ───────────────────────────────────────────────────

const RULES: [RegExp, LayerKind][] = [
  [/kick|four.on|808|low end|sub\b/i, "kick"],
  [/hat|hi-hat|swing|groove|shuffle|16th/i, "hats"],
  [/clap|snare|backbeat/i, "clap"],
  [/perc|shaker|polyrhythm|syncopat|fill/i, "perc"],
  [/bass|poli|glide|portamento|octave/i, "bass"],
  [/chord|harmony|progression|triad|seventh|voicing|key\b|keys|scale|mode/i, "chords"],
  [/pad|reverb|space|ambien|texture|wavetable|drift|granular/i, "pad"],
  [/melod|lead|arp|synth|oscillat|filter|envelope|lfo|operator|wave/i, "lead"],
  [/rhythm|beat|tempo|bpm|drum|loop|pattern|step|sequenc|metronome|time sig/i, "kick"],
];
const ORDER: LayerKind[] = ["kick", "hats", "bass", "chords", "clap", "lead", "pad", "perc"];

export type Offer = { kind: LayerKind; isNew: boolean; layerId?: string; what: string };

/** What finishing this lesson would add. Pure: does not change the track. */
export function offerFor(track: Track, mission: { slug: string; title: string; tagline?: string; number?: number }): Offer {
  const text = `${mission.slug} ${mission.title} ${mission.tagline ?? ""}`;
  let kind: LayerKind | null = null;
  for (const [re, k] of RULES) if (re.test(text)) { kind = k; break; }
  if (!kind) {
    const missing = ORDER.find(k => !track.layers.some(l => l.kind === k));
    kind = missing ?? ORDER[(mission.number ?? 0) % ORDER.length];
  }
  const existing = track.layers.find(l => l.kind === kind);
  if (!existing && track.layers.length < MAX_LAYERS) return { kind, isNew: true, what: `new layer · ${kind}` };
  const target = existing ?? track.layers[(mission.number ?? 0) % Math.max(1, track.layers.length)];
  const k = target.kind;
  return { kind: k, isNew: false, layerId: target.id, what: target.variant >= 2 ? `${k} · more character` : `${k} · new pattern` };
}

/** Apply an offer. Returns the new track. */
export function applyOffer(track: Track, offer: Offer, from: string, world?: WorldKey, tweak?: Layer["params"]): Track {
  if (track.added.includes(from)) return track;
  let layers = track.layers;
  if (offer.isNew) {
    const l = newLayer(offer.kind, from, world);
    if (tweak) l.params = tweak;
    layers = [...layers, l];
  } else {
    layers = layers.map(l => {
      if (l.id !== offer.layerId) return l;
      const v = l.variant + 1;
      const p = PATTERNS[l.kind];
      const idx = Math.min(v, p.steps.length - 1);
      const params = (tweak ?? l.params.map((x, i) => i === 3 ? x : Math.min(1, x + 0.06)) as Layer["params"]);
      return { ...l, variant: v, steps: S(p.steps[idx]), notes: p.notes ? [...p.notes[Math.min(v, p.notes.length - 1)]] : l.notes, params };
    });
  }
  return { ...track, layers, added: [...track.added, from], updatedAt: Date.now() };
}

/** Preview layer for the "add" screen: what the layer would look like after adding. */
export function previewLayer(track: Track, offer: Offer): Layer {
  const t = applyOffer({ ...track, added: [] }, offer, "__preview__");
  return offer.isNew ? t.layers[t.layers.length - 1] : t.layers.find(l => l.id === offer.layerId)!;
}

// ── Store ────────────────────────────────────────────────────────────────────
// Once Studio has opened, the track lives in v2 (src/lib/track2.ts). This API then
// reads a v1-shaped view of it and writes lesson changes back into v2, so lessons,
// Today, World and DJ work unchanged.

const KEY = "ccd.track.v1";
const EVT = "track:change";
const V2_EVT = "track2:change";

function readV1(): Track {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyTrack();
    const t = JSON.parse(raw) as Track;
    return t && t.v === 1 ? t : emptyTrack();
  } catch { return emptyTrack(); }
}

export function readTrack(): Track {
  if (typeof window === "undefined") return emptyTrack();
  if (hasTrackV2()) return toV1View(readTrackV2());
  return readV1();
}

export function writeTrack(t: Track) {
  if (hasTrackV2()) {
    const before = toV1View(readTrackV2());
    writeTrackV2(mergeV1(readTrackV2(), before, t));
  } else {
    try { localStorage.setItem(KEY, JSON.stringify(t)); } catch {}
  }
  window.dispatchEvent(new CustomEvent(EVT, { detail: readTrack() }));
}

export function useTrack() {
  const [track, setTrack] = useState<Track>(emptyTrack);
  useEffect(() => {
    setTrack(readTrack());
    const on = (e: Event) => setTrack((e as CustomEvent<Track>).detail);
    const onV2 = () => setTrack(readTrack());
    const onStore = (e: StorageEvent) => { if (e.key === KEY || e.key === "ccd.track.v2") setTrack(readTrack()); };
    window.addEventListener(EVT, on);
    window.addEventListener(V2_EVT, onV2);
    window.addEventListener("storage", onStore);
    return () => { window.removeEventListener(EVT, on); window.removeEventListener(V2_EVT, onV2); window.removeEventListener("storage", onStore); };
  }, []);
  const update = useCallback((fn: (t: Track) => Track) => {
    const next = { ...fn(readTrack()), updatedAt: Date.now() };
    writeTrack(next);
    setTrack(readTrack());
  }, []);
  return { track, update };
}

export const layerColor = (k: LayerKind) => KIND[k].color;
