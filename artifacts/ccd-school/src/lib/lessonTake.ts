/**
 * The line you play in a lesson's try-it step, and how it joins your track.
 *
 * Try it records into the layer the lesson offers (bass for a bass lesson, drums for a
 * rhythm lesson). "use this line" keeps the take for this lesson; it joins the track only
 * when you press "add to my track" on the last screen. Pure helpers plus a small
 * session store, so a refresh mid-lesson keeps the take.
 */
import { DRUM_LANES, MAX_LAYERS, newLayerV2, type LayerType, type LayerV2, type NoteEvent, type TrackV2 } from "./track2";
import type { LayerKind, WorldKey } from "./track";
import { scaleNote, type ScaleName } from "./theory";
import { BASS_PARAMS, CHORD_PARAMS, DRUM_PAD_PARAMS, INSTRUMENT_BASE, LEAD_PARAMS, type ParamSpec } from "../engine/params.gen";
import type { LessonScreen } from "../content/types";

export type Step = LessonScreen | { kind: "tryit" };

/** A lesson's steps in order: its screens, with try it just before what you learned. */
export function lessonSteps(screens: readonly LessonScreen[]): Step[] {
  const out: Step[] = [];
  let tried = false;
  for (const s of screens) {
    if (s.kind === "summary" && !tried) {
      out.push({ kind: "tryit" });
      tried = true;
    }
    out.push(s);
  }
  if (!tried) out.push({ kind: "tryit" });
  return out;
}

export type Shape = { index: number; spec: ParamSpec };

/** The two knobs a layer type offers to shape before it joins the track. */
export function shapeKnobs(type: LayerType): Shape[] {
  const drumPad = (pad: number, k: number) => ({ index: INSTRUMENT_BASE + pad * DRUM_PAD_PARAMS.length + k, spec: DRUM_PAD_PARAMS[k] as ParamSpec });
  switch (type) {
    case "drums": return [drumPad(0, 0), drumPad(0, 1)];
    case "hats": return [drumPad(4, 1), drumPad(4, 0)];
    case "bass": return [BASS_PARAMS[0], BASS_PARAMS[3]].map(s => ({ index: s.index, spec: s as ParamSpec }));
    case "chords": return [CHORD_PARAMS[1], CHORD_PARAMS[3]].map(s => ({ index: s.index, spec: s as ParamSpec }));
    default: return [LEAD_PARAMS[0], LEAD_PARAMS[3]].map(s => ({ index: s.index, spec: s as ParamSpec }));
  }
}

export type Take = { type: LayerType; events: NoteEvent[] };

/** A lesson's v1 offer kind as the v2 layer it records into. */
export function takeType(kind: LayerKind): LayerType {
  switch (kind) {
    case "kick":
    case "clap":
    case "perc":
      return "drums";
    case "hats":
      return "hats";
    case "bass":
      return "bass";
    case "chords":
    case "pad":
      return "chords";
    default:
      return "lead";
  }
}

export type PlayPad = { label: string; notes: number[] };

const DRUM_LABEL: Record<number, string> = { 36: "kick", 38: "snare", 39: "clap", 42: "hat", 37: "rim", 41: "low tom", 45: "mid tom", 48: "high tom", 46: "open hat", 70: "shaker", 51: "ride", 49: "crash" };
const NOTE = ["c", "c#", "d", "d#", "e", "f", "f#", "g", "g#", "a", "a#", "b"];
const ROMAN = ["i", "ii", "iii", "iv", "v", "vi", "vii"];

/**
 * The eight things you can play in try it, for a layer type in the track's key:
 * drum sounds, scale notes (bass and lead) or triads on each scale degree (chords).
 */
export function playPads(type: LayerType, root: number, scale: ScaleName): PlayPad[] {
  if (type === "drums" || type === "hats") {
    return DRUM_LANES[type].slice(0, 8).map(n => ({ label: DRUM_LABEL[n] ?? `pad ${n}`, notes: [n] }));
  }
  const pc = ((root % 12) + 12) % 12;
  // Bass from a1 to g#2, chords from c3 to b3, lead from c4 to b4, all starting on the key's root.
  const base = type === "bass" ? 33 + ((pc - 9 + 12) % 12) : type === "chords" ? 48 + pc : 60 + pc;
  return Array.from({ length: 8 }, (_, i) => {
    if (type === "chords") {
      const notes = [scaleNote(base, scale, i), scaleNote(base, scale, i + 2), scaleNote(base, scale, i + 4)];
      const third = notes[1] - notes[0];
      const fifth = notes[2] - notes[0];
      const deg = ROMAN[i % 7];
      const label = i === 7 ? "i up" : fifth === 6 ? `${deg}°` : third === 4 ? deg.toUpperCase() : deg;
      return { label, notes };
    }
    const n = scaleNote(base, scale, i);
    return { label: NOTE[((n % 12) + 12) % 12], notes: [n] };
  });
}

/**
 * Put a take into the track. Melodic layers take the new line in place of the old one;
 * drum layers keep their other sounds and swap only the sounds you played. Adds a layer
 * of that type when there is none (and room for one). Records the lesson as added.
 */
export function applyTake(t: TrackV2, slug: string, take: Take, world?: WorldKey, params?: Record<number, number>): TrackV2 {
  if (t.added.includes(slug)) return t;
  const drumLike = take.type === "drums" || take.type === "hats";
  const events = take.events.map(e => ({ ...e })).sort((a, b) => a.start - b.start || a.note - b.note);
  const idx = t.layers.findIndex(l => l.type === take.type);
  let layers: LayerV2[];
  if (idx >= 0) {
    layers = t.layers.map((l, i) => {
      if (i !== idx) return l;
      const played = new Set(events.map(e => e.note));
      const kept = drumLike ? l.events.filter(e => !played.has(e.note)) : [];
      const merged = [...kept, ...events].sort((a, b) => a.start - b.start || a.note - b.note);
      return { ...l, events: merged, params: params ? { ...l.params, ...params } : l.params, variant: l.variant + 1, from: l.from ?? slug };
    });
  } else if (t.layers.length < MAX_LAYERS) {
    const l = newLayerV2(take.type, slug, world);
    l.events = events;
    if (params) l.params = { ...params };
    layers = [...t.layers, l];
  } else {
    return { ...t, added: [...t.added, slug], updatedAt: Date.now() };
  }
  return { ...t, layers, added: [...t.added, slug], updatedAt: Date.now() };
}

/** The track you play along to in try it: your track with the lesson's layer emptied (or added empty). */
export function practiceTrack(t: TrackV2, type: LayerType): { track: TrackV2; index: number } {
  const idx = t.layers.findIndex(l => l.type === type);
  if (idx >= 0) {
    const layers = t.layers.map((l, i) => (i === idx ? { ...l, events: [], mute: false, solo: false } : l));
    return { track: { ...t, layers }, index: idx };
  }
  if (t.layers.length >= MAX_LAYERS) {
    // Full track: borrow the last slot for practice; your real track is untouched.
    const layers = [...t.layers.slice(0, MAX_LAYERS - 1), { ...newLayerV2(type, "__take"), events: [] }];
    return { track: { ...t, layers }, index: layers.length - 1 };
  }
  const layers = [...t.layers, { ...newLayerV2(type, "__take"), events: [] }];
  return { track: { ...t, layers }, index: layers.length - 1 };
}

// ── session store: the take survives a refresh until the lesson ends ──────────
const key = (slug: string) => `ccd.take.${slug}`;

export function saveTake(slug: string, take: Take | null) {
  try {
    if (take) sessionStorage.setItem(key(slug), JSON.stringify(take));
    else sessionStorage.removeItem(key(slug));
  } catch {
    /* private mode: the take lives only in memory */
  }
}

export function readTake(slug: string): Take | null {
  try {
    const raw = sessionStorage.getItem(key(slug));
    if (!raw) return null;
    const t = JSON.parse(raw) as Take;
    return t && Array.isArray(t.events) ? t : null;
  } catch {
    return null;
  }
}
