// Writes src/content/lessonIndex.gen.json: per lesson the title, tagline, picture, tools, what it teaches and
// minutes (src/lib/lessonInfo.ts), so pages that list lessons don't ship every lesson's content. Runs in
// `npm run lessons`, after the lessons compile. Usage: npx tsx scripts/gen-lesson-index.mjs
import { writeFileSync } from "node:fs";
import { buildIndex } from "../src/lib/lessonInfo.ts";

const index = buildIndex();
writeFileSync(new URL("../src/content/lessonIndex.gen.json", import.meta.url), JSON.stringify(index) + "\n");
console.log(`lesson index: ${index.length} lessons`);
