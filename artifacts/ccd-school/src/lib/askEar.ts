/**
 * Questions you answer by ear (design/audible-genius.md, "turn quizzes into ears"). An `ask` step can carry
 * sounds: each is the learner's own song with one thing changed (a knob on a part, a part on its own or
 * muted, a different pattern, another tempo or swing, the glue on the master). "Which one is compressed?"
 * plays a, b and c, and the learner picks by listening, as Syntorial's quizzes have audio answers.
 *
 * In a lesson file (design/lesson-format.md):
 *   part: bass                 # the part every sound plays on its own and turns knobs on (default: the whole song)
 *   with: [kick]               # parts that play under it
 *   play: {cutoff: 0.2}        # a sound for the question (or two, [a, b]); the options are words
 *   sounds: [{cutoff: 0.15}, {cutoff: 0.85}]   # or one sound per option, in the same order: picked by ear
 *
 * A sound is a small map: knob keys of the part (0 to 1, as `match` targets), and `part`, `with`, `notes`
 * (a copy pattern, src/lib/copyEar.ts), `mute` (parts), `bpm`, `swing`, `master` ({glue: 0.8}), `label`.
 * Pure, so the compiler validates with it and the tests render with it.
 */
import { BASS_PARAMS, CHORD_PARAMS, DRUM_PAD_NOTES, DRUM_PAD_PARAMS, DRUM_RACK_PARAMS, INSTRUMENT_BASE, LAYER_PARAMS, LEAD_PARAMS, MASTER_PARAMS } from "../engine/params.gen";
import { DRUM_ROWS, HAT_NOTES, parsePattern, patternProblems, type CopyLayer } from "./copyEar";
import { newLayerV2, type LayerType, type LayerV2, type NoteEvent, type TrackV2 } from "./track2";

/** The parts a sound can name: a layer, one drum of the rack, or the whole song. */
export const EAR_PARTS = ["song", "drums", "hats", "bass", "chords", "lead", "kick", "snare", "clap", "rim", "hat", "open hat"] as const;
export type EarPart = (typeof EAR_PARTS)[number];
/** A sound as written in the file. Keys other than the reserved ones are knobs of its part. */
export type EarSound = Record<string, unknown>;
export const EAR_RESERVED = ["part", "with", "notes", "mute", "bpm", "swing", "master", "label"] as const;

const VOICE_NOTE: Partial<Record<EarPart, number>> = { kick: 36, snare: 38, clap: 39, rim: 37, hat: 42, "open hat": 46 };
const isVoice = (p: EarPart) => VOICE_NOTE[p] !== undefined;
/** The layer a part lives on. */
export function layerOf(p: EarPart): LayerType | null {
  if (p === "song") return null;
  if (isVoice(p)) return HAT_NOTES.has(VOICE_NOTE[p]!) ? "hats" : "drums";
  return p as LayerType;
}

type Knob = { index: number; key: string };
const padKnobs = (pad: number): Knob[] => DRUM_PAD_PARAMS.map((sp, k) => ({ index: INSTRUMENT_BASE + pad * DRUM_PAD_PARAMS.length + k, key: sp.key }));
/**
 * The knobs a part has, by key, in the order MatchSound's knobFor finds them (so `cutoff` or `tune` is the same
 * knob a match or shape step turns): a drum's own pad, the part's instrument, the kick or hat pad, the rack,
 * then the channel's eq, fx and mix.
 */
export function earKnobs(p: EarPart): Knob[] {
  const layer = layerOf(p);
  if (!layer) return [];
  const ch = LAYER_PARAMS.map(sp => ({ index: sp.index, key: sp.key as string }));
  if (isVoice(p)) {
    const pad = (DRUM_PAD_NOTES as readonly number[]).indexOf(VOICE_NOTE[p]!);
    return [...padKnobs(pad), ...DRUM_RACK_PARAMS.map(sp => ({ index: sp.index, key: sp.key as string })), ...ch];
  }
  const inst = layer === "lead" ? LEAD_PARAMS : layer === "bass" ? BASS_PARAMS : layer === "chords" ? CHORD_PARAMS : [];
  const pad = layer === "drums" ? 0 : layer === "hats" ? 4 : -1;
  return [
    ...inst.map(sp => ({ index: sp.index, key: sp.key as string })),
    ...(pad >= 0 ? padKnobs(pad) : []),
    ...(pad >= 0 ? DRUM_RACK_PARAMS.map(sp => ({ index: sp.index, key: sp.key as string })) : []),
    ...ch,
  ];
}
const knobIndex = (p: EarPart, key: string) => earKnobs(p).find(k => k.key === key)?.index;

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const partsList = (v: unknown): v is EarPart[] => Array.isArray(v) && v.length > 0 && v.every(x => (EAR_PARTS as readonly unknown[]).includes(x));
/** The copy layer a part's `notes` are written for: a drum map, one drum's row, or a tune line. */
const notesLayer = (p: EarPart): CopyLayer | "row" => (isVoice(p) ? "row" : p === "drums" || p === "hats" ? "drums" : (p as CopyLayer));

/**
 * Problems with one sound, in words, for the lesson compiler. `part` is the step's part (a sound may name its own).
 */
export function earSoundProblems(s: unknown, stepPart?: unknown): string[] {
  if (!isObj(s)) return ["a sound is a map like {cutoff: 0.2} or {part: bass}"];
  const out: string[] = [];
  const pv = s.part ?? stepPart ?? "song";
  if (!(EAR_PARTS as readonly unknown[]).includes(pv)) return [`part "${String(pv)}" is not one of ${EAR_PARTS.join(", ")}`];
  const part = pv as EarPart;
  if (s.with !== undefined && !partsList(s.with)) out.push(`with must list parts from ${EAR_PARTS.join(", ")}`);
  if (s.mute !== undefined && !partsList(s.mute)) out.push(`mute must list parts from ${EAR_PARTS.join(", ")}`);
  if (s.bpm !== undefined && (typeof s.bpm !== "number" || s.bpm < 60 || s.bpm > 180)) out.push("bpm must be a number from 60 to 180");
  if (s.swing !== undefined && (typeof s.swing !== "number" || s.swing < 0 || s.swing > 0.75)) out.push("swing must be a number from 0 to 0.75");
  if (s.label !== undefined && (typeof s.label !== "string" || !s.label.trim() || s.label.length > 18)) out.push("label must be a few words (18 characters at most)");
  if (s.master !== undefined) {
    if (!isObj(s.master)) out.push("master must map master knobs to values, like {glue: 0.8}");
    else for (const [k, v] of Object.entries(s.master)) {
      if (!MASTER_PARAMS.some(m => m.key === k)) out.push(`master.${k} is not a master knob, use one of ${MASTER_PARAMS.map(m => m.key).join(", ")}`);
      else if (typeof v !== "number" || v < 0 || v > 1) out.push(`master.${k} must be a number from 0 to 1`);
    }
  }
  if (s.notes !== undefined) {
    if (part === "song") out.push("notes need a part to play them");
    else {
      const nl = notesLayer(part);
      if (nl === "row") { if (typeof s.notes !== "string" || !/^[xo.\s]+$/.test(s.notes) || ![16, 32].includes(s.notes.replace(/\s/g, "").length)) out.push(`notes for the ${part} are one row of 16 or 32 steps, like "x...x...x...x..."`); }
      else for (const p of patternProblems(nl, s.notes)) out.push(`notes: ${p}`);
    }
  }
  for (const [k, v] of Object.entries(s)) {
    if ((EAR_RESERVED as readonly string[]).includes(k)) continue;
    if (part === "song") { out.push(`"${k}" is a knob, so the sound needs a part (part: bass)`); continue; }
    if (knobIndex(part, k) === undefined) out.push(`"${k}" is not a knob of the ${part}, use one of ${[...new Set(earKnobs(part).map(x => x.key))].join(", ")}`);
    else if (typeof v !== "number" || v < 0 || v > 1) out.push(`${k} must be a number from 0 to 1`);
  }
  return out;
}

/** What each part plays when the learner's song doesn't have it yet. */
const DEFAULT_NOTES: Record<Exclude<EarPart, "song">, string | Record<string, string>> = {
  kick: "x...x...x...x...", snare: "....x.......x...", clap: "....x.......x...", rim: "..x.....x.....x.", hat: "..x...x...x...x.", "open hat": "..x...x...x...x.",
  drums: { kick: "x...x...x...x...", clap: "....x.......x..." },
  hats: { hat: "..x...x...x...x." },
  bass: ". . 1 . . . 1 . . . 1 . . . 5, .",
  chords: "1+3+5 - - - - - - - 6,+1+3 - - - - - - -",
  lead: "5 - 3 - 1 - . . 2 - 3 - 5 - . .",
};

const tile = (evs: NoteEvent[], from: number, to: number): NoteEvent[] => {
  if (from >= to || from <= 0) return evs.filter(e => e.start < to - 1e-9);
  const out: NoteEvent[] = [];
  for (let o = 0; o < to - 1e-9; o += from) for (const e of evs) if (e.start + o < to - 1e-9) out.push({ ...e, start: e.start + o });
  return out;
};

/** A part's notes in the song's key, from a pattern (a drum map, one drum's row, or a tune line). */
function notesFor(part: Exclude<EarPart, "song">, p: unknown, root: number, scale: string): { events: NoteEvent[]; loop: number } {
  const nl = notesLayer(part);
  if (nl === "row") {
    const name = Object.entries(DRUM_ROWS).find(([, n]) => n === VOICE_NOTE[part])?.[0] ?? "kick";
    return parsePattern("drums", { [name]: p as string }, root, scale);
  }
  return parsePattern(nl, p as string | Record<string, string>, root, scale);
}

/** Does this layer play the part? (a drum is a note on the drums or hats layer) */
const holds = (part: EarPart, l: LayerV2) => l.type === layerOf(part) && (!isVoice(part) || l.events.some(e => e.note === VOICE_NOTE[part]));

/**
 * The learner's song as one sound: the step's part on its own (with the `with` parts under it), the sound's
 * changes applied. A part the song lacks plays a default line in the song's key; an empty song gets a kick and
 * clap first. Sections, punches and cues are left out: it is the loop, changed in one way.
 */
export function earTrack(song: TrackV2, sound: EarSound = {}, step: { part?: string; with?: string[] } = {}): TrackV2 {
  const part = (sound.part ?? step.part ?? "song") as EarPart;
  const withParts = ((sound.with ?? step.with ?? []) as EarPart[]).filter(p => p !== part);
  const root = song.root ?? 45, scale = song.scale;
  let loop = song.loop || 4;
  let layers: LayerV2[] = song.layers.map(l => ({ ...l, params: { ...l.params }, events: l.events.slice(), mute: false, solo: false }));
  // An empty song: a kick and a clap to hear things against.
  if (!layers.some(l => l.events.length)) layers = [{ ...newLayerV2("drums", "__ear"), events: notesFor("drums", DEFAULT_NOTES.drums, root, scale).events }];
  // Parts the sound plays that the song doesn't have yet get a default line.
  const want = [part, ...withParts, ...(((sound.mute as EarPart[]) ?? []))].filter((p): p is Exclude<EarPart, "song"> => p !== "song");
  for (const p of want) {
    if (layers.some(l => holds(p, l))) continue;
    const n = notesFor(p, DEFAULT_NOTES[p], root, scale);
    const type = layerOf(p)!;
    const has = layers.find(l => l.type === type);
    const evs = tile(n.events, n.loop, loop);
    if (has) has.events = [...has.events, ...evs].sort((a, b) => a.start - b.start);
    else if (layers.length < 8) layers.push({ ...newLayerV2(type, "__ear"), events: evs });
  }
  // A different pattern for the part.
  if (sound.notes !== undefined && part !== "song") {
    const n = notesFor(part, sound.notes, root, scale);
    if (n.loop > loop) { layers = layers.map(l => ({ ...l, events: tile(l.events, loop, n.loop) })); loop = n.loop; }
    const evs = tile(n.events, n.loop, loop);
    const l = layers.find(x => x.type === layerOf(part));
    if (l) l.events = isVoice(part) ? [...l.events.filter(e => e.note !== VOICE_NOTE[part]), ...evs].sort((a, b) => a.start - b.start) : evs;
  }
  // Knobs on the part.
  if (part !== "song") {
    const l = layers.find(x => holds(part, x)) ?? layers.find(x => x.type === layerOf(part));
    if (l) for (const [k, v] of Object.entries(sound)) {
      if ((EAR_RESERVED as readonly string[]).includes(k) || typeof v !== "number") continue;
      const i = knobIndex(part, k);
      if (i !== undefined) l.params[i] = v;
    }
  }
  // Only the part (and what plays under it), unless the sound is the whole song.
  const keep = (l: LayerV2): LayerV2 | null => {
    if (part === "song") return l;
    const ps = [part, ...withParts].filter(p => p !== "song");
    if (withParts.includes("song")) return l;
    const mine = ps.filter(p => layerOf(p) === l.type);
    if (!mine.length) return null;
    // Whole layer when it is named as a layer; just its drums when only drums of it are named.
    if (mine.some(p => !isVoice(p))) return l;
    const notes = new Set(mine.map(p => VOICE_NOTE[p]!));
    return { ...l, events: l.events.filter(e => notes.has(e.note)) };
  };
  let heard = layers.map(keep).filter((l): l is LayerV2 => !!l && l.events.length > 0);
  // Muted parts drop out.
  for (const m of ((sound.mute as EarPart[]) ?? [])) {
    if (m === "song") continue;
    heard = heard.map(l => (l.type !== layerOf(m) ? l : isVoice(m) ? { ...l, events: l.events.filter(e => e.note !== VOICE_NOTE[m]) } : { ...l, events: [] })).filter(l => l.events.length > 0);
  }
  const master = { ...(song.master ?? {}) };
  if (isObj(sound.master)) for (const [k, v] of Object.entries(sound.master)) { const m = MASTER_PARAMS.find(x => x.key === k); if (m && typeof v === "number") master[m.index] = v; }
  return {
    ...song,
    bpm: typeof sound.bpm === "number" ? sound.bpm : song.bpm,
    swing: typeof sound.swing === "number" ? sound.swing : song.swing,
    loop,
    layers: heard,
    master,
    sections: undefined,
    punches: undefined,
    cues: undefined,
  };
}

/** The words on a sound's key: its label, else a, b, c by position. */
export function earLabel(s: EarSound | undefined, i: number, of: number, question = false): string {
  if (s && typeof s.label === "string") return s.label;
  if (question && of === 1) return "hear it";
  return String.fromCharCode(97 + i);
}
