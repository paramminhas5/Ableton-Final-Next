/**
 * Lessons in teaching order for each world, and helpers the Model 1 screens use:
 * the next lesson, a world's 16-step banks, a lesson's picture.
 */
import { curItem, curPathOf, curPaths, extrasOf, partOf, songItems, type CurItem, type CurKind } from "../content/curriculum";
import { MISSIONS } from "../content/missions";
import { FOUNDATIONS_MISSIONS } from "../content/missions-foundations";
import { DJ_WORLD_MISSIONS } from "../content/missions-dj";
import type { Mission } from "../content/types";

export type WorldId = "fundamentals" | "dj" | "producer";
export const WORLD_IDS: WorldId[] = ["fundamentals", "producer", "dj"];
export const WORLD_LABEL: Record<WorldId, string> = { fundamentals: "basics", dj: "dj", producer: "producer" };

const ALL: Mission[] = [...FOUNDATIONS_MISSIONS, ...DJ_WORLD_MISSIONS, ...MISSIONS];
const BY_SLUG = new Map<string, Mission>();
for (const m of ALL) if (!BY_SLUG.has(m.slug) || m.fromFile) BY_SLUG.set(m.slug, m);
export const missionAny = (slug: string) => BY_SLUG.get(slug);
/** A lesson that is written as a lesson file and plays in the new player. */
export const isRebuilt = (slug: string) => !!BY_SLUG.get(slug)?.fromFile;

/** A song lesson you can open, in world order: the spine of the journey. */
export type Step = { slug: string; title: string; path: string; pathTitle: string; chapter: string; index: number };

const cache = new Map<WorldId, Step[]>();
export function worldSteps(world: WorldId): Step[] {
  const hit = cache.get(world);
  if (hit) return hit;
  const out: Step[] = [];
  for (const p of curPaths(world)) {
    for (const it of p.items) {
      if (it.kind !== "song") continue;
      const m = BY_SLUG.get(it.slug);
      if (!m) continue;
      out.push({ slug: it.slug, title: m.title, path: p.slug, pathTitle: p.title, chapter: p.slug, index: out.length });
    }
  }
  cache.set(world, out);
  return out;
}

export function nextStep(world: WorldId, done: Record<string, unknown>): Step | undefined {
  const steps = worldSteps(world);
  return steps.find(s => !done[s.slug]) ?? steps[steps.length - 1];
}

/** Song lessons done out of all song lessons in the world, counting the ones still to be made. */
export function worldDone(world: WorldId, done: Record<string, unknown>) {
  const songs = songItems(world);
  return { done: songs.filter(s => !!done[s.slug]).length, total: songs.length, open: worldSteps(world).length };
}

export function worldOf(slug: string): WorldId | null {
  return curPathOf(slug)?.world ?? null;
}

/** What a lesson is in the course: a song lesson, a deeper lesson or a bonus round. */
export const kindOf = (slug: string): CurKind | null => curItem(slug)?.kind ?? null;
export { extrasOf, partOf };

/**
 * The lesson that comes after this one. After a song lesson: the next song lesson you can open.
 * After a deeper lesson or bonus round: the next song lesson after the one it hangs off.
 */
export function nextAfter(slug: string): string | undefined {
  const w = worldOf(slug);
  if (!w) return undefined;
  const it = curItem(slug);
  const from = it && it.kind !== "song" ? it.parent : slug;
  if (!from) return undefined;
  const songs = songItems(w);
  const at = songs.findIndex(s => s.slug === from);
  for (let i = at + 1; i < songs.length; i++) if (BY_SLUG.has(songs[i].slug)) return songs[i].slug;
  return undefined;
}

export type JourneyItem = CurItem & { exists: boolean; rebuilt: boolean; done: boolean };
export type JourneyLesson = JourneyItem & { extras: JourneyItem[] };
export type JourneyPath = { slug: string; number: number; title: string; note: string; lessons: JourneyLesson[]; songTotal: number; songDone: number; extraTotal: number; extraDone: number };

/** A world's paths with their song lessons and, under each, its deeper lessons and bonus rounds. */
export function journey(world: WorldId, done: Record<string, unknown>): JourneyPath[] {
  const mark = (i: CurItem): JourneyItem => ({ ...i, exists: BY_SLUG.has(i.slug), rebuilt: isRebuilt(i.slug), done: !!done[i.slug] });
  return curPaths(world).map(p => {
    const lessons: JourneyLesson[] = [];
    const loose: JourneyItem[] = [];
    for (const it of p.items) {
      if (it.kind === "song") lessons.push({ ...mark(it), extras: [] });
    }
    for (const it of p.items) {
      if (it.kind === "song") continue;
      const host = lessons.find(l => l.slug === it.parent);
      (host ? host.extras : loose).push(mark(it));
    }
    // A path with no song lesson (producer's "live, properly") lists its bonus rounds as the lessons.
    if (!lessons.length) {
      let cur: JourneyLesson | null = null;
      for (const it of loose) {
        if (it.kind === "bonus" || !cur) { cur = { ...it, extras: [] }; lessons.push(cur); } else cur.extras.push(it);
      }
    }
    const songs = lessons.filter(l => l.kind === "song");
    const extras = lessons.flatMap(l => l.extras);
    return {
      slug: p.slug, number: p.number, title: p.title, note: p.note, lessons,
      songTotal: songs.length, songDone: songs.filter(l => l.done).length,
      extraTotal: extras.length, extraDone: extras.filter(e => e.done).length,
    };
  });
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
