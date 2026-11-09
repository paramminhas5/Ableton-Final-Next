/**
 * The course structure: worlds, paths, and per path the song lessons (the spine), the deeper
 * lessons that hang off them, and bonus rounds. Written in design/curriculum.md and generated into
 * curriculum.gen.json by scripts/gen-curriculum.mjs (`npm run lessons`). Edit the doc, not the json.
 */
import RAW from "./curriculum.gen.json";

export type CurWorld = "fundamentals" | "producer" | "dj";
export type CurKind = "song" | "deeper" | "bonus";
export type CurItem = { slug: string; kind: CurKind; isNew: boolean; title: string; does: string; code: string; parent?: string };
export type CurPath = { world: CurWorld; slug: string; number: number; title: string; note: string; items: CurItem[] };

export const CURRICULUM = RAW as CurPath[];

const ITEM = new Map<string, { item: CurItem; path: CurPath }>();
for (const p of CURRICULUM) for (const item of p.items) ITEM.set(item.slug, { item, path: p });

export const curItem = (slug: string) => ITEM.get(slug)?.item;
export const curPathOf = (slug: string) => ITEM.get(slug)?.path;
export const curPaths = (world: CurWorld) => CURRICULUM.filter(p => p.world === world).sort((a, b) => a.number - b.number);
export const songItems = (world: CurWorld) => curPaths(world).flatMap(p => p.items.filter(i => i.kind === "song"));
/** Deeper lessons and bonus rounds that hang off a song lesson, in order. */
export const extrasOf = (slug: string) => {
  const p = curPathOf(slug);
  return p ? p.items.filter(i => i.kind !== "song" && i.parent === slug) : [];
};

/**
 * The part of the song each song lesson gives you, as one or two words: the lane name in the
 * song view. Lessons not listed show their title.
 */
export const PART: Record<string, string> = {
  "tempo-bpm": "kick", "set-your-tempo": "tempo", "bars-time-signatures": "clap", "note-values": "hats", "groove-feel": "swing",
  "what-is-sound": "first notes", "frequency-pitch": "a tune", "amplitude-volume": "dynamics", "timbre-tone": "tone",
  "waveforms": "wave shape", "overtones-harmonics": "a fifth", "noise": "noise hats", "samples-loops": "a sample",
  "notes-and-octaves": "octave jumps", "major-scale": "your scale", "intervals": "a phrase", "melody-writing": "the melody", "pentatonic-scales": "the hook",
  "what-are-chords": "chords", "chord-progressions": "a progression", "bass-follows": "bass", "song-structure": "intro and drop",
  "your-kick": "kick", "synth-what-is-sound": "lead", "midi-piano-roll": "edited notes", "hats": "hats", "clap-and-snare": "clap",
  "first-bass": "bass", "kick-and-bass": "room for the kick", "shape-your-synth": "lead shape", "chords-on-top": "chords",
  "kick-designer": "your own kick", "real-drums": "a real kit", "lead-width": "width", "fx-riser": "riser",
  "balance": "levels", "eq-place": "eq", "space": "space", "glue": "glue",
  "sections": "sections", "fills": "fills", "the-drop": "the drop", "finish-export": "export",
  "what-is-djing": "a clap on 2 and 4", "dj-equipment": "a second deck", "tempo-bpm-dj": "matched tempo", "your-first-mix": "first blend",
  "phrasing": "phrasing", "eq-mixing-dj": "bass swap", "headphone-monitoring": "cue", "long-mix-blend": "long blend",
  "music-library-dj": "three tracks", "key-detection-dj": "keys that fit", "cue-points-dj": "cue points", "waveform-reading": "the drop, seen",
  "set-structure-dj": "the arc", "effects-performance-dj": "effects", "preparing-a-set-dj": "your crate",
  "recording-your-set-dj": "a recording", "dj-advanced-complete": "your track in your set",
};
export const partOf = (slug: string) => PART[slug] ?? curItem(slug)?.title ?? slug;
