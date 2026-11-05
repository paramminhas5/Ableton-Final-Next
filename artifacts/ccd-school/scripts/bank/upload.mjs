// Upload the chopped dj bank to the private `dj-bank` bucket (design/dj-bank-private.md).
// Usage: CCD_BANK_SERVICE_KEY=<service role key> node scripts/bank/upload.mjs <folder chop.py wrote>
// The folder holds one sub-folder per track id with full.ogg, intro.ogg, drums-in.ogg, break.ogg, drop.ogg.
// Nothing here is public: the app hands out ten-minute signed links to signed-in learners only.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
const dir = process.argv[2];
const key = process.env.CCD_BANK_SERVICE_KEY;
const url = process.env.CCD_BANK_SUPABASE_URL ?? "https://kpxywzhwcptvfdocnazd.supabase.co";
if (!dir || !key) { console.error("usage: CCD_BANK_SERVICE_KEY=... node scripts/bank/upload.mjs <folder>"); process.exit(1); }
let n = 0, bad = 0;
for (const id of readdirSync(dir)) {
  const d = join(dir, id);
  if (!statSync(d).isDirectory()) continue;
  for (const f of readdirSync(d).filter(x => x.endsWith(".ogg"))) {
    const res = await fetch(`${url}/storage/v1/object/dj-bank/${id}/${f}`, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, apikey: key, "content-type": "audio/ogg", "x-upsert": "true" },
      body: readFileSync(join(d, f)),
    });
    if (res.ok) n++; else { bad++; console.error("failed", id, f, res.status, await res.text()); }
  }
  console.log("uploaded", id);
}
console.log(`${n} files up${bad ? `, ${bad} failed` : ""}`);
process.exit(bad ? 1 : 0);
