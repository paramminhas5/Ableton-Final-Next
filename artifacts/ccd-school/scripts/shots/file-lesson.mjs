// Screens of a file lesson, every step, phone and desktop, light and dark.
// Usage: node scripts/shots/file-lesson.mjs <base url> <slug> [chromium|webkit] [out dir]
// Jumps to a step by seeding the player's saved place. Reports any step whose go key
// is off screen on desktop (process.md: the whole step fits without scrolling).
import { chromium, webkit } from "playwright";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3000";
const slug = process.argv[3] ?? "your-kick";
const name = process.argv[4] ?? "chromium";
const out = process.argv[5] ?? `shots/file-${slug}`;
mkdirSync(out, { recursive: true });
const SIZES = [["phone", 390, 844], ["desk", 1440, 900]];
const b = await (name === "webkit" ? webkit : chromium).launch();
const problems = [];
for (const scheme of (process.env.SCHEMES ?? "dark,light").split(",")) {
  for (const [label, w, h] of SIZES) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: scheme });
    const page = await ctx.newPage();
    page.on("pageerror", e => problems.push(`${scheme} ${label}: ${e.message}`));
    await page.goto(`${base}/learn/${slug}`, { waitUntil: "load" });
    const total = Number((await page.locator(".fl-count").innerText()).split("/").pop());
    for (let i = 0; i < total; i++) {
      await page.evaluate(([s, i]) => sessionStorage.setItem(`ccd.lesson.${s}`, JSON.stringify({ idx: i, at: Date.now() })), [slug, i]);
      await page.reload({ waitUntil: "load" });
      await page.waitForTimeout(900);
      await page.waitForSelector(".fl", { timeout: 60000 });
      const kind = await page.locator(".fl").getAttribute("data-page-kind");
      await page.screenshot({ path: `${out}/${name}-${scheme}-${label}-${String(i).padStart(2, "0")}-${kind}.png` });
      const go = page.locator(".ls-bottom .m1-g > :last-child").first();
      if (await go.count()) {
        const box = await go.boundingBox();
        if (!box || box.y + box.height > h + 1) problems.push(`${scheme} ${label} step ${i} (${kind}): go key below the fold`);
      }
    }
    await ctx.close();
  }
}
await b.close();
console.log(problems.length ? problems.join("\n") : "no problems");
