// Compiles src/content/lessons/<world>/*.yaml into lessons.gen.json. Run through tsx (see `npm run lessons`).
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compileLessons } from "../src/content/lessons/compile-fs.ts";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "content", "lessons");
try {
  const lessons = compileLessons(dir);
  writeFileSync(join(dir, "lessons.gen.json"), JSON.stringify({ lessons }, null, 2) + "\n");
  console.log(`lessons: compiled ${lessons.length} lesson${lessons.length === 1 ? "" : "s"}`);
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
}
