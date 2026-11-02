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

/** Which hardware the lesson has you touch, from its screens. */
export function missionTools(slug: string): ("knob" | "keys" | "pads")[] {
  const m = BY_SLUG.get(slug);
  const t = new Set<"knob" | "keys" | "pads">();
  for (const s of m?.screens ?? []) {
    const k = s.kind as string;
    if (k === "interact") t.add("knob");
    if (k === "quiz" || k === "audio-id" || k === "match") t.add("pads");
    if (k === "sequence") t.add("keys");
  }
  if (!t.size) t.add("pads");
  return [...t].slice(0, 2);
}

export function minutesFor(slug: string): number {
  const n = BY_SLUG.get(slug)?.screens?.length ?? 8;
  return Math.max(3, Math.round(n * 0.7));
}
