/* Node only (reads the lesson folders). The browser imports resolve.ts instead. */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { LessonError, parseLesson } from "./compile";
import type { Lesson } from "./schema";

/** Reads every `<dir>/<world>/*.yaml` (folders starting with `_` are skipped), sorted by world then number. */
export function compileLessons(dir: string): Lesson[] {
  const out: Lesson[] = [];
  let worlds: string[] = [];
  try {
    worlds = readdirSync(dir).filter((w) => !w.startsWith("_") && statSync(join(dir, w)).isDirectory());
  } catch {
    return out;
  }
  for (const world of worlds.sort()) {
    for (const f of readdirSync(join(dir, world)).filter((n) => /\.ya?ml$/.test(n)).sort()) {
      const file = `${world}/${f}`;
      const lesson = parseLesson(readFileSync(join(dir, world, f), "utf8"), file);
      if (lesson.world !== world) throw new LessonError(file, [`${file}: world "${lesson.world}" does not match its folder "${world}"`]);
      out.push(lesson);
    }
  }
  const slugs = new Map<string, string>();
  const nums = new Map<string, string>();
  for (const l of out) {
    const prev = slugs.get(l.slug);
    if (prev) throw new LessonError(l.file, [`${l.file}: duplicate slug "${l.slug}", already used by ${prev}`]);
    slugs.set(l.slug, l.file);
    const nk = `${l.world}:${l.number}`;
    const pn = nums.get(nk);
    if (pn) throw new LessonError(l.file, [`${l.file}: duplicate number ${l.number} in ${l.world}, already used by ${pn}`]);
    nums.set(nk, l.file);
  }
  return out.sort((a, b) => a.world.localeCompare(b.world) || a.number - b.number);
}
