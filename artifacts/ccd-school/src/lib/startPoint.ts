/**
 * Where a learner starts, from the world they picked and the chapter the placement test unlocked.
 * Derived from the chapter and path content, so it cannot point at a lesson that does not exist.
 */
import { CHAPTERS } from "../content/chapters";
import { PATHS } from "../content/paths";

export type WorldId = "fundamentals" | "dj" | "producer";

/** first lesson of chapter `number` in a world, or undefined if there is no such chapter */
export function chapterStartSlug(world: WorldId, number: number): string | undefined {
  const ch = CHAPTERS.find((c) => c.world === world && c.number === number);
  if (!ch) return undefined;
  for (const ps of ch.pathSlugs) {
    const first = PATHS.find((p) => p.slug === ps)?.missionSlugs[0];
    if (first) return first;
  }
  return undefined;
}

export function startSlug(world: WorldId | null | undefined, chapter: number | null | undefined): string {
  const w: WorldId = world ?? "fundamentals";
  const c = Math.max(1, Math.round(chapter ?? 1));
  return chapterStartSlug(w, c) ?? chapterStartSlug(w, 1) ?? "what-is-sound";
}
