import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { chapterStartSlug, startSlug } from "../src/lib/startPoint";
import { CHAPTERS } from "../src/content/chapters";

const missionSrc = ["missions", "missions-foundations", "missions-dj", "missions-synths"]
  .map((f) => readFileSync(new URL(`../src/content/${f}.ts`, import.meta.url), "utf8"))
  .join("\n");

describe("start point", () => {
  it("defaults to the first fundamentals lesson", () => {
    expect(startSlug(null, null)).toBe("what-is-sound");
    expect(startSlug(undefined, 1)).toBe("what-is-sound");
  });
  it("follows the chosen world and placement chapter", () => {
    expect(startSlug("producer", 1)).toBe("what-is-live");
    expect(startSlug("producer", 3)).toBe("the-mixer");
    expect(startSlug("dj", 3)).toBe("beatmatching-manual");
    expect(startSlug("fundamentals", 4)).toBe("what-are-chords");
  });
  it("falls back to chapter one for odd input", () => {
    expect(startSlug("producer", 0)).toBe("what-is-live");
    expect(startSlug("producer", 99)).toBe("what-is-live");
  });
  it("every chapter in every world starts on a lesson that really exists", () => {
    for (const c of CHAPTERS) {
      const slug = chapterStartSlug(c.world, c.number);
      expect(slug, `${c.world} chapter ${c.number}`).toBeTruthy();
      expect(missionSrc, `${c.world} ${c.number} -> ${slug}`).toContain(`slug: "${slug}"`);
    }
  });
});
