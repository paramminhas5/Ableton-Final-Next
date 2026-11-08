/**
 * Learning paths, built from the course structure in design/curriculum.md (see curriculum.ts).
 * `missionSlugs` lists every lesson in the path that exists in the app, in teaching order (song
 * lessons with their deeper lessons and bonus rounds after them). `songSlugs` is the spine:
 * the song lessons, including ones still to be made. The old per-chapter paths (before 5 Nov
 * 2026) are in git history; every one of their lessons is placed in a path here.
 */
import { CURRICULUM, partOf, type CurItem } from "./curriculum";
// Which lessons exist, from the small lesson index (src/lib/lessonInfo.ts), not every lesson's content.
import LESSONS from "./lessonIndex.gen.json";

export type LearningPath = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  color: string;
  missionSlugs: string[];
  world: "fundamentals" | "dj" | "producer";
  chapter: string;       // chapter slug (one chapter per path)
  number: number;        // path number within its world
  source?: string;
  songSlugs: string[];
  items: CurItem[];
};

const EXISTS = new Set((LESSONS as { slug: string }[]).map(m => m.slug));
const COLOR = { fundamentals: "bg-acid", producer: "bg-sun", dj: "bg-ink" } as const;

export const PATHS: LearningPath[] = CURRICULUM.map(p => {
  const songs = p.items.filter(i => i.kind === "song");
  return {
    slug: p.slug,
    title: p.title,
    tagline: songs.length ? `your song gets: ${songs.map(s => partOf(s.slug)).join(", ")}` : p.note,
    description: songs.map(s => `${s.title}: ${s.does}`).join(". "),
    color: COLOR[p.world],
    missionSlugs: p.items.filter(i => EXISTS.has(i.slug)).map(i => i.slug),
    world: p.world,
    chapter: p.slug,
    number: p.number,
    songSlugs: songs.map(s => s.slug),
    items: p.items,
  };
});

export function pathBySlug(slug: string) {
  return PATHS.find((p) => p.slug === slug);
}

export function pathsByChapter(chapterSlug: string) {
  return PATHS.filter((p) => p.chapter === chapterSlug).sort((a, b) => a.number - b.number);
}

export function pathsByWorld(world: LearningPath["world"]) {
  return PATHS.filter((p) => p.world === world).sort((a, b) => a.number - b.number);
}
