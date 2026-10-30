/**
 * Runs axe-core (WCAG 2 A/AA) on every public page, phone size, and a lesson.
 *   BASE=http://localhost:3120 node scripts/a11y.mjs
 * Fails on serious or critical violations. Set MINOR=1 to list moderate ones too.
 */
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const axeSrc = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const BASE = process.env.BASE ?? "http://localhost:3120";
const smoke = readFileSync(new URL("./smoke.mjs", import.meta.url), "utf8");
const routes = [...smoke.match(/const routes = \[([\s\S]*?)\];/)[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]).filter((r) => r !== "/not-a-real-page");
routes.push("/learn/compressor");
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
await ctx.addInitScript(() => { try { sessionStorage.setItem("ccd.hearts_explained", "1"); } catch {} });
const tally = new Map();
let bad = 0;
for (const r of routes) {
  const p = await ctx.newPage();
  await p.goto(BASE + r, { waitUntil: "load" }).catch(() => {});
  await p.waitForTimeout(2500);
  await p.evaluate(axeSrc);
  const res = await p.evaluate(() => axe.run(document, { runOnly: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] }));
  for (const v of res.violations) {
    const hard = v.impact === "serious" || v.impact === "critical";
    if (!hard && !process.env.MINOR) continue;
    const key = `${v.impact} ${v.id}`;
    const e = tally.get(key) ?? { help: v.help, pages: new Set(), sample: "" };
    e.pages.add(r);
    e.sample ||= v.nodes[0]?.target?.join(" ") + " :: " + (v.nodes[0]?.html ?? "").slice(0, 140);
    tally.set(key, e);
    if (hard) bad++;
  }
  await p.close();
}
for (const [k, e] of tally) console.log(`${k}: ${e.help}\n  ${e.pages.size} pages (${[...e.pages].slice(0, 5).join(", ")})\n  e.g. ${e.sample}`);
await browser.close();
console.log(bad ? `\n${bad} serious or critical violations` : "\nno serious or critical violations");
process.exit(bad ? 1 : 0);
