// Which lesson first teaches each studio control, read from the lesson files' shape steps (layer + knobs),
// in curriculum order (basics, producer, dj; song lessons before deeper ones). Writes src/content/taught.gen.json:
// { first: { "drums:decay": "your-kick", ... }, bySlug: { "your-kick": ["drums:decay", "drums:tune"], ... } }.
// The studio uses it to show only what you have learnt (or mark it), and the beginner check reads it.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const root = new URL("..", import.meta.url).pathname;
const dir = join(root, "src/content/lessons");
const bySlug = {};
for (const w of ["foundations", "producer", "dj"]) {
  for (const f of readdirSync(join(dir, w)).filter(f => f.endsWith(".yaml"))) {
    const y = readFileSync(join(dir, w, f), "utf8");
    const slug = y.match(/^slug:\s*(\S+)/m)?.[1];
    if (!slug) continue;
    const keys = [];
    for (const m of y.matchAll(/kind:\s*shape\s*\n\s*layer:\s*(\w+)\s*\n\s*knobs:\s*\[([^\]]*)\]/g)) {
      for (const k of m[2].split(",").map(s => s.trim()).filter(Boolean)) keys.push(`${m[1]}:${k}`);
    }
    if (keys.length) bySlug[slug] = [...new Set(keys)];
  }
}
const cur = JSON.parse(readFileSync(join(root, "src/content/curriculum.gen.json"), "utf8"));
const order = [];
for (const kind of ["song", "deeper", "bonus"]) for (const p of cur) for (const it of p.items) if (it.kind === kind) order.push(it.slug);
const first = {};
for (const s of order) for (const k of bySlug[s] ?? []) if (!first[k]) first[k] = s;
writeFileSync(join(root, "src/content/taught.gen.json"), JSON.stringify({ first, bySlug }, null, 0) + "\n");
console.log(`taught: ${Object.keys(first).length} controls across ${Object.keys(bySlug).length} lessons`);
