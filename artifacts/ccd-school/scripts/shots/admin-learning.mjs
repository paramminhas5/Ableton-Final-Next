// Walk a lesson quickly (to make some learning events), then open /admin/learning on "this device".
// Usage: node scripts/shots/admin-learning.mjs <base> <outdir> [w] [h] [dark|light]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const [base = "http://localhost:3000", out = "/tmp/al", W = "390", H = "844", theme = "dark"] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const p = await (await b.newContext({ viewport: { width: +W, height: +H }, colorScheme: theme })).newPage();
await p.addInitScript(th => localStorage.setItem("ccd.mode", th), theme);
for (const slug of ["your-kick", "hats"]) {
  await p.goto(`${base}/learn/${slug}`, { waitUntil: "load" });
  await p.waitForSelector(".fl", { timeout: 120000 });
  for (let i = 0; i < 14; i++) {
    const kind = await p.locator(".fl").getAttribute("data-page-kind");
    if (kind === "done") break;
    const skip = p.getByRole("button", { name: "Skip this step" });
    if (await skip.count()) await skip.first().click();
    else if (kind === "check") await p.getByText("skip the challenge").click();
    else await p.locator(".ls-bottom .m1-g > :last-child").first().click();
    await p.waitForTimeout(350);
  }
}
const n = await p.evaluate(() => JSON.parse(localStorage.getItem("ccd.learn.log.v1") ?? "[]").length);
await p.goto(`${base}/admin/learning`, { waitUntil: "load" });
await p.waitForSelector(".al", { timeout: 120000 });
await p.waitForTimeout(1500);
await p.getByRole("button", { name: "this device" }).click();
await p.waitForTimeout(500);
await p.screenshot({ path: `${out}/admin-${W}-${theme}.png`, fullPage: true });
console.log(`${n} events on the device; ${await p.locator(".al-t tbody tr").count()} table rows`);
await b.close();
