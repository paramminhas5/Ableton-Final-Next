// Apply edits from the copy page back into the lesson files (10 Nov).
// Usage: node scripts/copy-apply.mjs <edits.json>   (rows as the copy page stores them; only rows with edited: true)
import fs from "node:fs"; import path from "node:path"; import YAML from "yaml";
const rows = JSON.parse(fs.readFileSync(process.argv[2], "utf8")).filter(r => r.edited);
const byFile = new Map();
for (const r of rows) { if (!byFile.has(r.file)) byFile.set(r.file, []); byFile.get(r.file).push(r); }
let n = 0;
for (const [file, rs] of byFile) {
  const p = path.join("src/content/lessons", file);
  const doc = YAML.parseDocument(fs.readFileSync(p, "utf8"));
  for (const r of rs) {
    if (r.i === -1) { if (r.mentor) doc.set("learn", r.mentor); if (r.why) doc.setIn(["song", "why"], r.why); n++; continue; }
    const step = doc.getIn(["steps", r.i], true);
    if (!step) continue;
    if (r.kind === "ask") { doc.setIn(["steps", r.i, "q"], r.mentor); n++; continue; }
    const say = doc.getIn(["steps", r.i, "say"]);
    if (typeof say === "string" || !say) doc.setIn(["steps", r.i, "say"], r.mentor);
    else { for (const k of ["mentor", "straight", "eli5"]) if (r[k]) doc.setIn(["steps", r.i, "say", k], r[k]); }
    if (r.why) doc.setIn(["steps", r.i, "why"], r.why);
    if (r.hint) doc.setIn(["steps", r.i, "hint"], r.hint);
    n++;
  }
  fs.writeFileSync(p, doc.toString({ lineWidth: 110 }));
}
console.log(`applied ${n} edited steps across ${byFile.size} files. run npm run lessons next.`);
