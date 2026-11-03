// Screenshots a list of routes at 390x844 for a look audit. Usage: node scripts/shots/audit.mjs out dark|light route...
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const [out, theme, ...routes] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, colorScheme: theme });
const p = await ctx.newPage();
await p.addInitScript(th => { localStorage.setItem("ccd.theme", th); localStorage.setItem("ccd.onboarded", "1"); }, theme);
for (const r of routes) {
  try {
    await p.goto(`http://localhost:3000${r}`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await p.waitForTimeout(2500);
    await p.screenshot({ path: `${out}/${theme}${r.replace(/\//g, "_") || "_home"}.png` });
    console.log("ok", r);
  } catch (e) { console.log("fail", r, String(e).slice(0, 80)); }
}
await b.close();
