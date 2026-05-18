/**
 * missionContext — resolves a mission slug to its path, chapter and world
 * 
 * Producer missions have world:"first-contact" etc in missions.ts (old per-chapter slugs)
 * but paths.ts uses world:"producer". This file bridges that gap for breadcrumbs.
 */
import { PATHS, pathBySlug, type LearningPath } from "@/content/paths";
import { chapterBySlug, type Chapter } from "@/content/chapters";

export type MissionContext = {
  path: LearningPath | null;
  chapter: Chapter | null;
  world: "fundamentals" | "dj" | "producer" | null;
  worldLabel: string;
  worldRoute: string;
};

// Build slug → path index once
const SLUG_TO_PATH = new Map<string, LearningPath>();
for (const path of PATHS) {
  for (const slug of path.missionSlugs) {
    SLUG_TO_PATH.set(slug, path);
  }
}

export function getMissionContext(missionSlug: string): MissionContext {
  const path = SLUG_TO_PATH.get(missionSlug) ?? null;
  const chapter = path ? (chapterBySlug(path.chapter) ?? null) : null;
  const world = path?.world ?? null;

  const WORLD_LABELS: Record<string, string> = {
    fundamentals: "Fundamentals",
    dj: "DJ World",
    producer: "Producer",
  };

  return {
    path,
    chapter,
    world,
    worldLabel: world ? (WORLD_LABELS[world] ?? world) : "Unknown",
    worldRoute: world === "fundamentals" ? "/world/fundamentals"
              : world === "dj" ? "/world/dj"
              : world === "producer" ? "/world/producer"
              : "/worlds",
  };
}
