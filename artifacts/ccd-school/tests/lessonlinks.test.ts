import { describe, it, expect } from "vitest";
import { LESSON_LINKS } from "../src/content/lessonLinks";
import { MISSIONS } from "../src/content/missions";

// atlas.ts, plugins.ts and build.ts import with "@/", which vitest does not resolve,
// so read their ids from source instead of importing them.
import { readFileSync } from "node:fs";
const ids = (file: string, re: RegExp) => new Set([...readFileSync(file, "utf8").matchAll(re)].map((m) => m[1]));
const atlas = ids("src/content/atlas.ts", /\{ id: "([a-z0-9-]+)", name:/g);
const jobs = ids("src/content/plugins.ts", /^\s{4}id: "([a-z0-9-]+)"/gm);
const stages = ids("src/content/build.ts", /^ {4}id: "([a-z0-9-]+)"/gm);
const slugs = new Set(MISSIONS.map((m) => m.slug));

describe("lesson links", () => {
  it("reads ids from the reference files", () => {
    expect(atlas.size).toBeGreaterThan(60);
    expect(jobs.size).toBeGreaterThan(10);
    expect(stages.size).toBeGreaterThan(5);
  });
  it("only names lessons that exist", () => {
    expect(Object.keys(LESSON_LINKS).filter((s) => !slugs.has(s))).toEqual([]);
  });
  it("only names devices, jobs and stages that exist", () => {
    const bad: string[] = [];
    for (const [slug, l] of Object.entries(LESSON_LINKS)) {
      for (const d of l.devices ?? []) if (!atlas.has(d)) bad.push(`${slug}: device ${d}`);
      for (const j of l.jobs ?? []) if (!jobs.has(j)) bad.push(`${slug}: job ${j}`);
      if (l.stage && !stages.has(l.stage)) bad.push(`${slug}: stage ${l.stage}`);
    }
    expect(bad).toEqual([]);
  });
});

import { LIVE_TASKS } from "../src/content/liveTasks";
describe("live tasks", () => {
  it("point at real lessons and have checks", () => {
    for (const [slug, t] of Object.entries(LIVE_TASKS)) {
      expect(MISSIONS.some((m) => m.slug === slug), slug).toBe(true);
      expect(t.checks.length, slug).toBeGreaterThan(0);
      expect(t.xp).toBeGreaterThan(0);
    }
  });
});
