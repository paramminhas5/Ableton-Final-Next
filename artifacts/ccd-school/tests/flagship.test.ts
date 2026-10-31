import { describe, expect, it } from "vitest";
import { FLAGSHIP_SCREENS } from "../src/content/flagship-screens";
import { MISSIONS } from "../src/content/missions";

describe("deep lessons", () => {
  const entries = Object.entries(FLAGSHIP_SCREENS);

  it("has 40 deep lessons and every one matches a real lesson", () => {
    expect(entries.length).toBe(58);
    for (const [slug] of entries) expect(MISSIONS.some((m) => m.slug === slug), slug).toBe(true);
  });

  it("each lesson is 8 to 13 screens, opens with a hook and ends with a summary", () => {
    for (const [slug, screens] of entries) {
      expect(screens.length, slug).toBeGreaterThanOrEqual(8);
      expect(screens.length, slug).toBeLessThanOrEqual(13);
      expect(screens[0].kind, slug).toBe("hook");
      expect(screens[screens.length - 1].kind, slug).toBe("summary");
      expect(screens.some((s) => s.kind === "interact"), `${slug} has something to move`).toBe(true);
      expect(screens.filter((s) => s.kind === "quiz").length, `${slug} scenario questions`).toBeGreaterThanOrEqual(3);
    }
  });

  it("every answer index is valid and every explanation is filled in", () => {
    for (const [slug, screens] of entries) {
      for (const [i, s] of screens.entries()) {
        if (s.kind === "quiz" || s.kind === "audio-id") {
          expect(s.answer, `${slug}#${i}`).toBeGreaterThanOrEqual(0);
          expect(s.answer, `${slug}#${i}`).toBeLessThan(s.options.length);
          expect(new Set(s.options).size, `${slug}#${i} duplicate options`).toBe(s.options.length);
          expect(s.explain.length, `${slug}#${i}`).toBeGreaterThan(20);
        }
      }
    }
  });

  it("the right answer is not stuck on one button", () => {
    const counts = [0, 0, 0, 0];
    for (const [, screens] of entries) for (const s of screens) if (s.kind === "quiz") counts[s.answer]++;
    const total = counts.reduce((a, b) => a + b, 0);
    // Before the shuffle, 74 of 75 answers in the first 20 lessons were option 1. No position should dominate now.
    for (const c of counts.slice(0, 3)) expect(c / total).toBeLessThan(0.5);
    expect(counts[0] / total).toBeGreaterThan(0.1);
  });

  it("uses no em dashes in copy", () => {
    for (const [slug, screens] of entries) expect(JSON.stringify(screens), slug).not.toMatch(/—/);
  });
});
