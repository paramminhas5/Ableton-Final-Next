/**
 * Opens every public page on a phone and a laptop and fails on a 4xx/5xx, a page error or sideways scroll.
 *   BASE=http://localhost:3120 node scripts/smoke.mjs
 */
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const BASE = process.env.BASE ?? "http://localhost:3120";
const routes = ["/", "/dashboard", "/worlds", "/world/fundamentals", "/world/dj", "/world/producer", "/missions", "/learn", "/path/acoustics",
  "/daily", "/review", "/challenge", "/gym", "/train", "/match", "/leaderboard", "/profile", "/shop", "/upgrade", "/glossary", "/wiki", "/shortcuts", "/signal-flow",
  "/playground", "/devices", "/atlas", "/plugins", "/setup", "/build", "/link", "/beat", "/placement", "/login", "/not-a-real-page"];
const sizes = [["phone", { width: 390, height: 844 }], ["laptop", { width: 1440, height: 900 }]];
const browser = await chromium.launch();
let bad = 0;
for (const [label, viewport] of sizes) {
  const ctx = await browser.newContext({ viewport });
  await ctx.addInitScript(() => { try { sessionStorage.setItem("ccd.hearts_explained", "1"); } catch {} });
  for (const r of routes) {
    const p = await ctx.newPage();
    const errs = [];
    p.on("pageerror", (e) => errs.push(String(e).slice(0, 110)));
    const res = await p.goto(BASE + r, { waitUntil: "load" }).catch((e) => ({ status: () => 0, err: e }));
    await p.waitForTimeout(700);
    const status = res.status();
    const expect404 = r === "/not-a-real-page";
    const wide = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2).catch(() => false);
    const problems = [];
    if (expect404 ? status !== 404 : status >= 400 || status === 0) problems.push("HTTP " + status);
    if (errs.length) problems.push("page error: " + errs[0]);
    if (wide && label === "phone") problems.push("sideways scroll");
    if (problems.length) { bad++; console.log(`FAIL ${label} ${r}: ${problems.join("; ")}`); }
    await p.close();
  }
  await ctx.close();
}
await browser.close();
console.log(bad ? `${bad} problems` : `all ${routes.length * sizes.length} page loads clean`);
process.exit(bad ? 1 : 0);
