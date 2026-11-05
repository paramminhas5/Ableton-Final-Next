// Reads design/curriculum.md (the one place the course structure is written) and writes
// src/content/curriculum.gen.json: worlds, paths, and per path the song, deeper and bonus lessons
// in order. Fails if a lesson in the app is missing from the plan or placed twice, or if a slug
// marked (new) already exists. Runs in `npm run lessons`.
// Usage: npx tsx scripts/gen-curriculum.mjs [--check]
import { readFileSync, writeFileSync } from "node:fs";
import { MISSIONS } from "../src/content/missions.ts";

const doc = readFileSync(new URL("../design/curriculum.md", import.meta.url), "utf8");
const WORLD = { basics: "fundamentals", producer: "producer", dj: "dj" };
const SHORT = { fundamentals: "basics", producer: "producer", dj: "dj" };
const KIND = { S: "song", D: "deeper", B: "bonus" };
const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const paths = [];
let world = null, path = null;
for (const line of doc.split("\n")) {
  const w = line.match(/^## (Basics|Producer|DJ) \(world/i);
  if (w) { world = WORLD[w[1].toLowerCase()]; path = null; continue; }
  if (/^## /.test(line)) { world = null; path = null; continue; }
  const p = line.match(/^### Path (\d+): (.+?)(?: \((.+)\))?$/);
  if (p && world) {
    path = { world, slug: `${SHORT[world]}-${slugify(p[2])}`, number: Number(p[1]), title: p[2].trim(), note: p[3] ?? "", items: [] };
    paths.push(path);
    continue;
  }
  const r = line.match(/^\|\s*([SDB])\s*\|\s*(\(new\)\s*)?`([a-z0-9-]+)`\s*\|\s*([^|]*?)\s*\|\s*([^|]*?)\s*\|\s*([^|]*?)\s*\|$/);
  if (r && path) path.items.push({ slug: r[3], kind: KIND[r[1]], isNew: !!r[2], title: r[4], does: r[5].toLowerCase(), code: r[6] });
}

// Each deeper or bonus lesson hangs off the song lesson above it, or the first one below it
// when it opens a path.
for (const p of paths) {
  let last = null;
  const firstSong = p.items.find(i => i.kind === "song")?.slug ?? null;
  for (const it of p.items) {
    if (it.kind === "song") { last = it.slug; continue; }
    it.parent = last ?? firstSong;
  }
}

const app = new Set(MISSIONS.map(m => m.slug));
const seen = new Map();
const problems = [];
for (const p of paths) for (const it of p.items) {
  seen.set(it.slug, (seen.get(it.slug) ?? 0) + 1);
  if (!it.isNew && !app.has(it.slug)) problems.push(`not an app lesson: ${it.slug}`);
  if (it.isNew && app.has(it.slug)) problems.push(`marked (new) but already in the app: ${it.slug}`);
}
for (const [s, n] of seen) if (n > 1) problems.push(`placed ${n} times: ${s}`);
for (const s of app) if (!seen.has(s)) problems.push(`missing from design/curriculum.md: ${s}`);
for (const p of paths) if (!p.items.some(i => i.kind === "song") && !/bonus|deeper/.test(p.note)) problems.push(`path with no song lesson: ${p.slug}`);
if (problems.length) { console.error(problems.join("\n")); process.exit(1); }

const all = paths.flatMap(p => p.items);
const count = k => all.filter(i => i.kind === k).length;
console.log(`curriculum: ${paths.length} paths, ${count("song")} song, ${count("deeper")} deeper, ${count("bonus")} bonus, ${all.filter(i => i.isNew).length} still to make, all ${app.size} app lessons placed once`);
if (!process.argv.includes("--check")) {
  writeFileSync(new URL("../src/content/curriculum.gen.json", import.meta.url), JSON.stringify(paths, null, 1) + "\n");
}
