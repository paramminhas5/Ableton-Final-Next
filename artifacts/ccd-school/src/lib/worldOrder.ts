/**
 * Lessons in teaching order for each world, and helpers the Model 1 screens use:
 * the next lesson, a world's 16-step banks, a lesson's picture.
 */
import { curItem, curPathOf, curPaths, extrasOf, partOf, songItems, type CurItem, type CurKind } from "../content/curriculum";
// Lists and cards read a small index of the lessons (src/lib/lessonInfo.ts), not every lesson's content.
import INDEX from "../content/lessonIndex.gen.json";
import type { LessonInfo, Use } from "./lessonInfo";

export type WorldId = "fundamentals" | "dj" | "producer";
export const WORLD_IDS: WorldId[] = ["fundamentals", "producer", "dj"];
export const WORLD_LABEL: Record<WorldId, string> = { fundamentals: "basics", dj: "dj", producer: "producer" };

const BY_SLUG = new Map<string, LessonInfo>();
for (const m of INDEX as LessonInfo[]) BY_SLUG.set(m.slug, m);
/** A lesson's title, tagline and world, from the index (the full lesson is src/lib/lessonInfo.ts missionFull). */
export const missionAny = (slug: string) => BY_SLUG.get(slug);
/** A lesson that is written as a lesson file and plays in the new player. */
export const isRebuilt = (slug: string) => !!BY_SLUG.get(slug)?.rebuilt;

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

/**
 * Producer's first loop gives your song a kick, a lead, hats and a clap, which basics already gave it.
 * Once the basics lesson is done, its producer twin counts as done: continue skips it and the map shows it
 * as covered, but it stays open (Param, 10 Nov). Nothing is written to progress, so it is undone by itself.
 */
export const COVERED_BY: Record<string, string> = {
  "your-kick": "tempo-bpm", "synth-what-is-sound": "what-is-sound", "hats": "note-values", "clap-and-snare": "bars-time-signatures",
  // 10 Nov: the bass and the chords are basics parts too, so a basics grad doesn't record them twice
  "first-bass": "bass-follows", "chords-on-top": "what-are-chords",
};
/** Lesson 1 used to set the tempo too; it was split in two on 10 Nov. Anyone who finished it before then has a tempo. */
const SPLIT_AT = Date.UTC(2026, 10, 9, 21, 0); // when the split went live
/** The lesson that already covers this one for you, if any. */
export const coveredBy = (slug: string, done: Record<string, unknown>): string | null => {
  if (done[slug]) return null;
  if (slug === "set-your-tempo") {
    const d = done["tempo-bpm"] as { at?: number } | true | undefined;
    return d && typeof d === "object" && typeof d.at === "number" && d.at < SPLIT_AT ? "tempo-bpm" : null;
  }
  const twin = COVERED_BY[slug];
  return twin && done[twin] ? twin : null;
};
const isDone = (slug: string, done: Record<string, unknown>) => !!done[slug] || !!coveredBy(slug, done);

export function nextStep(world: WorldId, done: Record<string, unknown>): Step | undefined {
  const steps = worldSteps(world);
  return steps.find(s => !isDone(s.slug, done)) ?? steps[steps.length - 1];
}

/** Song lessons done out of all song lessons in the world, counting the ones still to be made. */
export function worldDone(world: WorldId, done: Record<string, unknown>) {
  const songs = songItems(world);
  return { done: songs.filter(s => isDone(s.slug, done)).length, total: songs.length, open: worldSteps(world).length };
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

/** `covered`: not done itself, but the basics lesson that gives your song the same part is (see COVERED_BY). */
export type JourneyItem = CurItem & { exists: boolean; rebuilt: boolean; done: boolean; covered?: string };
export type JourneyLesson = JourneyItem & { extras: JourneyItem[] };
export type JourneyPath = { slug: string; number: number; title: string; note: string; lessons: JourneyLesson[]; songTotal: number; songDone: number; extraTotal: number; extraDone: number };

/** A world's paths with their song lessons and, under each, its deeper lessons and bonus rounds. */
export function journey(world: WorldId, done: Record<string, unknown>): JourneyPath[] {
  const mark = (i: CurItem): JourneyItem => {
    const cov = coveredBy(i.slug, done);
    return { ...i, exists: BY_SLUG.has(i.slug), rebuilt: isRebuilt(i.slug), done: !!done[i.slug] || !!cov, ...(cov ? { covered: cov } : {}) };
  };
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

/** First picture in the lesson, or the world's picture: "sm" for a thumbnail (192 px), "md" for a card (720 px). */
export function missionImage(slug: string, world: WorldId, size?: "sm" | "md"): string {
  return BY_SLUG.get(slug)?.image ?? `/ai-images/world-${world}${size ? `-${size}` : ""}.webp`;
}

export type { Use };

/** What you will touch in this lesson, named for the thing being learnt, with what it is for. */
export function missionUses(slug: string): Use[] {
  return BY_SLUG.get(slug)?.uses ?? [];
}

/** What the lesson teaches, from its summary. */
export function missionLearns(slug: string): string[] {
  return BY_SLUG.get(slug)?.learns ?? [];
}

/** Short form for one line: the first tool by name. */
export function missionTools(slug: string): string[] {
  return missionUses(slug).map(u => u.tool).slice(0, 2);
}

export function minutesFor(slug: string): number {
  return BY_SLUG.get(slug)?.minutes ?? 6;
}
