// Which lesson first teaches each studio control, read from the lesson files' shape steps (layer + knobs),
// in curriculum order (basics, producer, dj; song lessons before deeper ones). Writes src/content/taught.gen.json:
// { first: { "drums:decay": "your-kick", ... }, bySlug: { "your-kick": ["drums:decay", "drums:tune"], ... } }.
// The studio uses it to show only what you have learnt (or mark it), and the beginner check reads it.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const root = new URL("..", import.meta.url).pathname;
const dir = join(root, "src/content/lessons");
const bySlug = {};
// Read the compiled lessons, not the yaml text, so a field in any order (a step's why, say) never hides a knob.
const gen = JSON.parse(readFileSync(join(dir, "lessons.gen.json"), "utf8"));
for (const l of gen.lessons) {
  const keys = [];
  for (const s of l.steps) if (s.kind === "shape") for (const k of s.knobs ?? []) keys.push(`${s.layer}:${k}`);
  if (keys.length) bySlug[l.slug] = [...new Set(keys)];
}
const cur = JSON.parse(readFileSync(join(root, "src/content/curriculum.gen.json"), "utf8"));
const order = [];
for (const kind of ["song", "deeper", "bonus"]) for (const p of cur) for (const it of p.items) if (it.kind === kind) order.push(it.slug);
const first = {};
for (const s of order) for (const k of bySlug[s] ?? []) if (!first[k]) first[k] = s;
writeFileSync(join(root, "src/content/taught.gen.json"), JSON.stringify({ first, bySlug }, null, 0) + "\n");
console.log(`taught: ${Object.keys(first).length} controls across ${Object.keys(bySlug).length} lessons`);
