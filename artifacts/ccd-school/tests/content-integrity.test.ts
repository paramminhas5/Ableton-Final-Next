import { describe, it, expect } from "vitest";
import { MISSIONS } from "../src/content/missions";
import { PATHS } from "../src/content/paths";
import { CHAPTERS } from "../src/content/chapters";
import { PLACEMENT_QUESTIONS } from "../src/content/placement-questions";

const slugs = new Set(MISSIONS.map((m) => m.slug));

describe("lesson content integrity", () => {
  it("mission slugs are unique", () => {
    const seen = new Set<string>();
    const dupes = MISSIONS.filter((m) => (seen.has(m.slug) ? true : (seen.add(m.slug), false))).map((m) => m.slug);
    expect(dupes).toEqual([]);
  });

  it("every path points only at missions that exist", () => {
    const bad = PATHS.flatMap((p) => p.missionSlugs.filter((s) => !slugs.has(s)).map((s) => `${p.slug} -> ${s}`));
    expect(bad).toEqual([]);
  });

  it("every chapter points only at paths that exist", () => {
    const ps = new Set(PATHS.map((p) => p.slug));
    const bad = CHAPTERS.flatMap((c) => c.pathSlugs.filter((s) => !ps.has(s)).map((s) => `${c.slug} -> ${s}`));
    expect(bad).toEqual([]);
  });

  it("every mission is reachable from some path", () => {
    const inPath = new Set(PATHS.flatMap((p) => p.missionSlugs));
    expect(MISSIONS.filter((m) => !inPath.has(m.slug)).map((m) => m.slug)).toEqual([]);
  });

  it("every mission has screens or a quiz, and quiz answers are valid", () => {
    const problems: string[] = [];
    for (const m of MISSIONS) {
      if (!m.screens?.length && !m.quiz?.length) problems.push(`${m.slug}: no screens and no quiz`);
      for (const q of m.quiz ?? []) {
        if (q.answer < 0 || q.answer >= q.options.length) problems.push(`${m.slug}: quiz answer out of range "${q.q}"`);
        if (new Set(q.options).size !== q.options.length) problems.push(`${m.slug}: duplicate options "${q.q}"`);
      }
      for (const [i, s] of (m.screens ?? []).entries()) {
        const at = `${m.slug}#${i + 1}`;
        if (s.kind === "quiz" || s.kind === "audio-id") {
          if (s.answer < 0 || s.answer >= s.options.length) problems.push(`${at}: answer out of range`);
          if (new Set(s.options).size !== s.options.length) problems.push(`${at}: duplicate options`);
        }
        if (s.kind === "match" && (s.pairs.length < 2 || new Set(s.pairs.map((p) => p.right)).size !== s.pairs.length)) problems.push(`${at}: bad match pairs`);
        if (s.kind === "sequence" && (s.items.length < 2 || new Set(s.items).size !== s.items.length)) problems.push(`${at}: bad sequence`);
        if (s.kind === "type-answer" && !s.acceptableAnswers.length) problems.push(`${at}: no accepted answers`);
      }
      const last = m.screens?.[m.screens.length - 1];
      if (m.screens?.length && last?.kind !== "summary") problems.push(`${m.slug}: last screen is not a summary`);
    }
    expect(problems).toEqual([]);
  });

  it("mission links inside explainers resolve", () => {
    const bad: string[] = [];
    for (const m of MISSIONS)
      for (const b of m.explainer ?? [])
        if (b.kind === "link" && b.to === "mission" && !slugs.has(b.slug)) bad.push(`${m.slug} -> ${b.slug}`);
    expect(bad).toEqual([]);
  });

  it("placement questions are well formed", () => {
    const bad = PLACEMENT_QUESTIONS.filter((q: any) => q.answer < 0 || q.answer >= q.options.length).map((q: any) => q.q);
    expect(bad).toEqual([]);
  });
});
