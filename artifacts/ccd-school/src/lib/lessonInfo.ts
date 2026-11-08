/**
 * The few facts about each lesson that lists and cards need (title, tagline, picture, what you'll touch, what
 * you'll learn, minutes), worked out from the full lesson content. Run at build time by
 * scripts/gen-lesson-index.mjs into src/content/lessonIndex.gen.json, so pages that list lessons don't ship
 * every lesson's content (about 500 kB compressed) to the browser. tests/lesson-index.test.ts checks the
 * committed index matches the content.
 */
import { MISSIONS } from "../content/missions";
import { FOUNDATIONS_MISSIONS } from "../content/missions-foundations";
import { DJ_WORLD_MISSIONS } from "../content/missions-dj";
import type { Mission } from "../content/types";

export type Use = { tool: string; why: string };
/** One lesson in the index. */
export type LessonInfo = { slug: string; title: string; tagline: string; world: string; rebuilt: boolean; image: string | null; uses: Use[]; learns: string[]; minutes: number };

/** The real control each kind of try-it step puts in your hands. */
const SIM_TOOL: Record<string, string> = {
  "drum-pad": "drum pads", "beat-builder": "step sequencer", "groove-extractor": "swing knob", "bpm-tap": "tap tempo",
  "piano-roll": "piano roll", "note-explorer": "keys", "chord-stacker": "keys", "chord-progression": "keys", "melody-shaper": "keys",
  "bassline-lab": "keys", "scale-aware": "keys", "mixer": "faders", "decibel-meter": "level meter", "comp-lake": "compressor",
  "sidechain": "sidechain", "send-return": "send knob", "device-chain": "device rack", "device-lab": "device knobs",
  "subtractive-synth": "filter knob", "filter-envelope": "filter envelope", "osc-mixer": "oscillator mix", "lfo-lab": "lfo",
  "waveform-visualizer": "oscillator", "signal-flow-builder": "patch cables", "routing-puzzle": "routing",
  "session-grid": "clip grid", "arrangement": "arrangement", "warp-lab": "warp markers", "midi-map": "midi map",
  "midi-vs-audio": "clips", "beatmatch-trainer": "pitch fader", "hot-cue-drill": "hot cues", "loop-roll": "loop roll",
  "harmonic-mix-wheel": "key wheel", "ear-training": "your ears", "song-structure": "arrangement", "granular": "grain knobs",
  "stem-splitter": "stems", "midi-transform": "midi tools", "push3": "push pads", "interface-tour": "live's interface", "browser-tour": "browser",
};

function uses(m: Mission): Use[] {
  const out: Use[] = [];
  for (const s of m.screens ?? []) {
    if (s.kind === "interact") {
      const tool = SIM_TOOL[s.sim] ?? s.sim.replace(/-/g, " ");
      if (!out.some(u => u.tool === tool)) out.push({ tool, why: s.prompt.toLowerCase().replace(/\.$/, "") });
    }
  }
  const q = (m.screens ?? []).filter(s => s.kind === "quiz" || s.kind === "audio-id" || s.kind === "match" || s.kind === "type-answer" || s.kind === "sequence").length;
  if (q) out.push({ tool: "answer pads", why: `${q} quick ${q === 1 ? "question" : "questions"}` });
  return out.slice(0, 3);
}

export function infoOf(m: Mission): LessonInfo {
  const shot = m.screens?.find(s => "imageUrl" in s && (s as { imageUrl?: string }).imageUrl) as { imageUrl?: string } | undefined;
  const sum = m.screens?.find(s => s.kind === "summary") as { learned?: string[] } | undefined;
  return {
    slug: m.slug, title: m.title, tagline: m.tagline ?? "", world: m.world, rebuilt: !!m.fromFile,
    image: shot?.imageUrl ?? null, uses: uses(m), learns: (sum?.learned ?? []).slice(0, 3),
    minutes: Math.max(3, Math.round((m.screens?.length ?? 8) * 0.7)),
  };
}

/** Every lesson, a file lesson winning over an older one of the same slug (as the app has always picked). */
export function allMissions(): Map<string, Mission> {
  const by = new Map<string, Mission>();
  for (const m of [...FOUNDATIONS_MISSIONS, ...DJ_WORLD_MISSIONS, ...MISSIONS]) if (!by.has(m.slug) || m.fromFile) by.set(m.slug, m);
  return by;
}

/** The index, in slug order. */
export function buildIndex(): LessonInfo[] {
  return [...allMissions().values()].map(infoOf).sort((a, b) => (a.slug < b.slug ? -1 : 1));
}

/** The full lesson, for the few places that need its steps (placing a learner builds the parts of the lessons it skips). */
let cache: Map<string, Mission> | null = null;
export const missionFull = (slug: string): Mission | undefined => (cache ??= allMissions()).get(slug);
