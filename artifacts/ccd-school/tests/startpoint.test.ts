import { describe, it, expect } from "vitest";
import { FILE_LESSONS } from "../src/content/lessons/adapt";
const FILE_LESSON_SLUGS = new Set(FILE_LESSONS.map(l => l.slug));
import { readFileSync } from "node:fs";
import { chapterStartSlug, startSlug } from "../src/lib/startPoint";
import { CHAPTERS } from "../src/content/chapters";

const missionSrc = ["missions", "missions-foundations", "missions-dj", "missions-synths"]
  .map((f) => readFileSync(new URL(`../src/content/${f}.ts`, import.meta.url), "utf8"))
  .join("\n");

describe("start point", () => {
  it("defaults to the first basics song lesson", () => {
    expect(startSlug(null, null)).toBe("tempo-bpm");
    expect(startSlug(undefined, 1)).toBe("tempo-bpm");
  });
  it("follows the chosen world and placement chapter", () => {
    expect(startSlug("producer", 1)).toBe("your-kick");
    // design/curriculum.md: the first song lesson you can open from that path on
    expect(startSlug("producer", 3)).toBe("balance");
    expect(startSlug("dj", 3)).toBe("music-library-dj");
    expect(startSlug("fundamentals", 4)).toBe("major-scale");
  });
  it("falls back to chapter one for odd input", () => {
    expect(startSlug("producer", 0)).toBe("your-kick");
    expect(startSlug("producer", 99)).toBe("your-kick");
  });
  it("every chapter in every world starts on a lesson that really exists", () => {
    for (const c of CHAPTERS) {
      const slug = chapterStartSlug(c.world, c.number);
      expect(slug, `${c.world} chapter ${c.number}`).toBeTruthy();
      if (FILE_LESSON_SLUGS.has(slug as string)) continue;
      expect(missionSrc, `${c.world} ${c.number} -> ${slug}`).toContain(`slug: "${slug}"`);
    }
  });
});
