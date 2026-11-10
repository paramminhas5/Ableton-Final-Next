// Export lesson words for the copy page (10 Nov). Usage: node scripts/copy-export.mjs <out.json> [world] [slug...]
// Every step that has words: the three voices of `say`, plus `why` and `hint` where present. One row per step.
import fs from "node:fs"; import path from "node:path"; import YAML from "yaml";
const [out, world = "foundations", ...only] = process.argv.slice(2);
const dir = path.join("src/content/lessons", world);
const rows = [];
for (const f of fs.readdirSync(dir).filter(f => f.endsWith(".yaml")).sort()) {
  const doc = YAML.parse(fs.readFileSync(path.join(dir, f), "utf8"));
  if (only.length && !only.includes(doc.slug)) continue;
  const voice = v => (typeof v === "string" ? { mentor: v, straight: "", eli5: "" } : { mentor: v?.mentor ?? "", straight: v?.straight ?? "", eli5: v?.eli5 ?? "" });
  rows.push({ id: `${doc.slug}__learn`, slug: doc.slug, lesson: doc.title, file: `${world}/${f}`, i: -1, kind: "lesson", title: "what you'll learn", mentor: doc.learn ?? "", straight: "", eli5: "", why: doc.song?.why ?? "", hint: "" });
  (doc.steps ?? []).forEach((s, i) => {
    if (!s.say && !s.q) return;
    const v = s.kind === "ask" ? { mentor: s.q, straight: "", eli5: "" } : voice(s.say);
    rows.push({ id: `${doc.slug}__${i}`, slug: doc.slug, lesson: doc.title, file: `${world}/${f}`, i, kind: s.kind, title: s.title ?? (s.kind === "ask" ? "question" : s.kind), ...v, why: typeof s.why === "string" ? s.why : "", hint: typeof s.hint === "string" ? s.hint : "" });
  });
}
fs.writeFileSync(out, JSON.stringify(rows, null, 1));
console.log(`${rows.length} rows from ${new Set(rows.map(r => r.slug)).size} lessons`);
