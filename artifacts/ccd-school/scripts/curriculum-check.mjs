// Every lesson slug in the app appears exactly once in design/curriculum.md, and every slug there
// is either an app lesson or marked (new). Usage: npx tsx scripts/curriculum-check.mjs
import { readFileSync } from "node:fs";
import { MISSIONS } from "../src/content/missions.ts";
const doc = readFileSync(new URL("../design/curriculum.md", import.meta.url), "utf8");
const rows = [...doc.matchAll(/^\|\s*([SDB])\s*\|\s*(\(new\)\s*)?`([a-z0-9-]+)`/gm)].map(m => ({ kind: m[1], isNew: !!m[2], slug: m[3] }));
const app = new Set(MISSIONS.map(m => m.slug));
const seen = new Map();
let bad = 0;
for (const r of rows) {
  seen.set(r.slug, (seen.get(r.slug) ?? 0) + 1);
  if (!r.isNew && !app.has(r.slug)) { console.log(`not an app lesson: ${r.slug}`); bad++; }
  if (r.isNew && app.has(r.slug)) { console.log(`marked new but exists: ${r.slug}`); bad++; }
}
for (const [s, n] of seen) if (n > 1) { console.log(`placed ${n} times: ${s}`); bad++; }
for (const s of app) if (!seen.has(s)) { console.log(`missing from the plan: ${s}`); bad++; }
const by = k => rows.filter(r => r.kind === k).length;
console.log(`song ${by("S")}, deeper ${by("D")}, bonus ${by("B")}, new ${rows.filter(r => r.isNew).length}, app lessons ${app.size}`);
process.exit(bad ? 1 : 0);
