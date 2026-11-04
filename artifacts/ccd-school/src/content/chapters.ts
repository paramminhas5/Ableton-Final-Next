import { PATHS } from "./paths";

export type Chapter = {
  slug: string;
  world: "fundamentals" | "dj" | "producer";
  number: number;
  title: string;
  tagline: string;
  description: string;
  pathSlugs: string[];
  trophy: { slug: string; name: string; description: string };
};

/** One chapter per path (5 Nov 2026), so finishing a path earns its own trophy. */
export const CHAPTERS: Chapter[] = PATHS.map(p => ({
  slug: p.slug,
  world: p.world,
  number: p.number,
  title: p.title,
  tagline: p.tagline,
  description: p.description,
  pathSlugs: [p.slug],
  trophy: { slug: `path-${p.slug}`, name: p.title, description: `finished the ${p.title} path` },
}));

export const chapterBySlug = (slug: string) => CHAPTERS.find((c) => c.slug === slug);
export const chaptersByWorld = (world: Chapter["world"]) =>
  CHAPTERS.filter((c) => c.world === world).sort((a, b) => a.number - b.number);

export const WORLD_TROPHIES: Record<string, { slug: string; name: string; description: string }> = {
  fundamentals: { slug: "fundamentals-master", name: "Fundamentals Master", description: "finished every basics path" },
  dj: { slug: "dj-master", name: "DJ Master", description: "finished every dj path" },
  producer: { slug: "producer-master", name: "Producer Master", description: "finished every producer path" },
};

export const MASTER_TROPHY = {
  slug: "ccd-master",
  name: "CCD Master",
  description: "finished all three worlds: basics, producer and dj",
};
