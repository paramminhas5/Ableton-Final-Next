/**
 * Which studio controls you have learnt (9 Nov): a control is learnt once you finish a lesson whose shape step
 * turns it. The map comes from the lesson files (scripts/gen-taught.mjs). How the studio shows the rest is a
 * setting: "hide" (dim caps that say where you learn them, with a switch to show everything) or "mark"
 * (everything live, the learnt ones lit).
 */
import taught from "@/content/taught.gen.json";
import { partOf } from "@/content/curriculum";

export type LearntView = "hide" | "mark" | "all";
const T = taught as { first: Record<string, string>; bySlug: Record<string, string[]> };
const KEY = "ccd.studio.learnt";

/** Layer type plus param key, the way the lesson files name a control. */
export const ctlKey = (layerType: string, paramKey: string) => `${layerType}:${paramKey}`;

export function learntSet(done: Record<string, unknown>): Set<string> {
  const s = new Set<string>();
  for (const slug of Object.keys(done)) for (const k of T.bySlug[slug] ?? []) s.add(k);
  return s;
}

/** Where a control is first taught: the lesson's slug and the part it adds, or null if no lesson turns it yet. */
export function whereTaught(key: string): { slug: string; part: string } | null {
  const slug = T.first[key];
  return slug ? { slug, part: partOf(slug) } : null;
}

export function readLearntView(): LearntView {
  try {
    const q = new URLSearchParams(window.location.search).get("learnt");
    if (q === "hide" || q === "mark" || q === "all") return q;
    const v = localStorage.getItem(KEY);
    if (v === "hide" || v === "mark" || v === "all") return v;
  } catch { /* default */ }
  return "hide";
}
export function saveLearntView(v: LearntView) { try { localStorage.setItem(KEY, v); } catch { /* ignore */ } }
