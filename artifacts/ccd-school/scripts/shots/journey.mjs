// The journey screens: each world in song and list view, the worlds overview and the dashboard,
// phone and desktop, light and dark. Usage: node scripts/shots/journey.mjs <base> [chromium|webkit] [out]
import { chromium, webkit } from "playwright";
import { mkdirSync } from "node:fs";
const base = process.argv[2] ?? "http://localhost:3000";
const name = process.argv[3] ?? "chromium";
const out = process.argv[4] ?? "shots/journey";
mkdirSync(out, { recursive: true });
const b = await (name === "webkit" ? webkit : chromium).launch();
const problems = [];
const pages = [["/worlds", "worlds", null], ["/dashboard", "dash", null],
  ...["fundamentals", "producer", "dj"].flatMap(w => [[`/world/${w}`, `${w}-song`, "song"], [`/world/${w}`, `${w}-list`, "list"]])];
for (const scheme of (process.env.SCHEMES ?? "dark,light").split(",")) {
  for (const [label, w, h] of [["phone", 390, 844], ["desk", 1440, 900]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: scheme });
    await ctx.addInitScript(() => { try { localStorage.setItem("ccd.onboarded", "1"); localStorage.setItem("ccd.tour.done", "1"); } catch {} });
    const page = await ctx.newPage();
    page.on("pageerror", e => problems.push(`${scheme} ${label}: ${e.message}`));
    for (const [path, file, view] of pages) {
      if (view) await page.addInitScript(v => { try { localStorage.setItem("ccd.journey.view", v); } catch {} }, view);
      await page.goto(base + path, { waitUntil: "load" });
      await page.waitForTimeout(1500);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (overflow > 1) problems.push(`${scheme} ${label} ${file}: ${overflow}px sideways scroll`);
      await page.screenshot({ path: `${out}/${name}-${scheme}-${label}-${file}.png`, fullPage: label === "phone" ? false : true });
    }
    await ctx.close();
  }
}
await b.close();
console.log(problems.length ? problems.join("\n") : "no problems");
