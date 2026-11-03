/**
 * Lessons in teaching order for each world, and helpers the Model 1 screens use:
 * the next lesson, a world's 16-step banks, a lesson's picture.
 */
import { CHAPTERS } from "../content/chapters";
import { PATHS } from "../content/paths";
import { MISSIONS } from "../content/missions";
import { FOUNDATIONS_MISSIONS } from "../content/missions-foundations";
import { DJ_WORLD_MISSIONS } from "../content/missions-dj";
import type { Mission } from "../content/types";

export type WorldId = "fundamentals" | "dj" | "producer";
export const WORLD_IDS: WorldId[] = ["fundamentals", "dj", "producer"];
export const WORLD_LABEL: Record<WorldId, string> = { fundamentals: "basics", dj: "dj", producer: "producer" };

const ALL: Mission[] = [...FOUNDATIONS_MISSIONS, ...DJ_WORLD_MISSIONS, ...MISSIONS];
const BY_SLUG = new Map(ALL.map(m => [m.slug, m]));
export const missionAny = (slug: string) => BY_SLUG.get(slug);

export type Step = { slug: string; title: string; path: string; pathTitle: string; chapter: string; index: number };

const cache = new Map<WorldId, Step[]>();
export function worldSteps(world: WorldId): Step[] {
  const hit = cache.get(world);
  if (hit) return hit;
  const chapters = CHAPTERS.filter(c => c.world === world).sort((a, b) => a.number - b.number);
  const out: Step[] = [];
  for (const ch of chapters) {
    for (const ps of ch.pathSlugs) {
      const p = PATHS.find(x => x.slug === ps);
      if (!p) continue;
      for (const s of p.missionSlugs) {
        const m = BY_SLUG.get(s);
        if (!m || out.some(o => o.slug === s)) continue;
        out.push({ slug: s, title: m.title, path: p.slug, pathTitle: p.title, chapter: ch.slug, index: out.length });
      }
    }
  }
  cache.set(world, out);
  return out;
}

export function nextStep(world: WorldId, done: Record<string, unknown>): Step | undefined {
  const steps = worldSteps(world);
  return steps.find(s => !done[s.slug]) ?? steps[steps.length - 1];
}

export function worldDone(world: WorldId, done: Record<string, unknown>) {
  const steps = worldSteps(world);
  return { done: steps.filter(s => !!done[s.slug]).length, total: steps.length };
}

export function worldOf(slug: string): WorldId | null {
  for (const w of WORLD_IDS) if (worldSteps(w).some(s => s.slug === slug)) return w;
  return null;
}

/** First picture in the lesson, or the world's picture. */
export function missionImage(slug: string, world: WorldId): string {
  const m = BY_SLUG.get(slug);
  const shot = m?.screens?.find(s => "imageUrl" in s && (s as { imageUrl?: string }).imageUrl) as { imageUrl?: string } | undefined;
  return shot?.imageUrl ?? `/ai-images/world-${world}.webp`;
}

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

export type Use = { tool: string; why: string };

/** What you will touch in this lesson, named for the thing being learnt, with what it is for. */
export function missionUses(slug: string): Use[] {
  const m = BY_SLUG.get(slug);
  const out: Use[] = [];
  for (const s of m?.screens ?? []) {
    if (s.kind === "interact") {
      const tool = SIM_TOOL[s.sim] ?? s.sim.replace(/-/g, " ");
      if (!out.some(u => u.tool === tool)) out.push({ tool, why: s.prompt.toLowerCase().replace(/\.$/, "") });
    }
  }
  const q = (m?.screens ?? []).filter(s => s.kind === "quiz" || s.kind === "audio-id" || s.kind === "match" || s.kind === "type-answer" || s.kind === "sequence").length;
  if (q) out.push({ tool: "answer pads", why: `${q} quick ${q === 1 ? "question" : "questions"}` });
  return out.slice(0, 3);
}

/** What the lesson teaches, from its summary. */
export function missionLearns(slug: string): string[] {
  const m = BY_SLUG.get(slug);
  const sum = m?.screens?.find(s => s.kind === "summary") as { learned?: string[] } | undefined;
  return (sum?.learned ?? []).slice(0, 3);
}

/** Short form for one line: the first tool by name. */
export function missionTools(slug: string): string[] {
  return missionUses(slug).map(u => u.tool).slice(0, 2);
}

export function minutesFor(slug: string): number {
  const n = BY_SLUG.get(slug)?.screens?.length ?? 8;
  return Math.max(3, Math.round(n * 0.7));
}
