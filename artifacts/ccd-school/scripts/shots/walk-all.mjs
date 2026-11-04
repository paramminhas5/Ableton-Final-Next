// Walk every lesson file from start to done the quick way: next on every step, skip on play-ins,
// skip the challenge. Reports page errors, steps that don't advance, and go keys below the fold.
// Usage: node scripts/shots/walk-all.mjs <base> [chromium|webkit] [w] [h]
import { chromium, webkit } from "playwright";
import { readFileSync } from "node:fs";
const base = process.argv[2] ?? "http://localhost:3000";
const eng = process.argv[3] === "webkit" ? webkit : chromium;
const W = Number(process.argv[4] ?? 1440), H = Number(process.argv[5] ?? 900);
// The dj mixer lessons need their goals done first: scripts/shots/mix-smoke.mjs covers those.
const slugs = JSON.parse(readFileSync(new URL("../../src/content/lessons/lessons.gen.json", import.meta.url), "utf8")).lessons.filter(l => !l.steps.some(s => s.kind === "mix") && (process.env.ALL || l.number < 200)).map(l => l.slug);
const b = await eng.launch({ args: eng === chromium ? ["--autoplay-policy=no-user-gesture-required"] : [] });
const out = [];
for (const slug of slugs) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, colorScheme: "dark" });
  const p = await ctx.newPage(); const errs = [];
  p.on("pageerror", e => errs.push(e.message.slice(0, 140)));
  await p.goto(`${base}/learn/${slug}`, { waitUntil: "load" });
  await p.waitForSelector(".fl", { timeout: 60000 }).catch(() => errs.push("no player"));
  const seen = []; let stuck = 0;
  for (let i = 0; i < 30; i++) {
    const kind = await p.locator(".fl").getAttribute("data-page-kind").catch(() => null);
    if (!kind) break;
    seen.push(kind);
    if (kind === "done") break;
    const go = p.locator(".ls-bottom .m1-g > :last-child").first();
    const box = await go.boundingBox().catch(() => null);
    if (box && box.y + box.height > H + 1) errs.push(`go key below the fold on ${kind}`);
    const before = await p.locator(".fl").getAttribute("data-step");
    if (kind === "play") await p.getByRole("button", { name: "Skip this step" }).click();
    else if (kind === "check") await p.getByText("skip the challenge").click();
    else if (kind === "ear") { for (let k = 0; k < 20 && (await p.locator(".fl").getAttribute("data-page-kind")) === "ear"; k++) { await p.locator('[role="radio"]:not([disabled]), .ls-pad:not([disabled])').first().click({ timeout: 2000 }).catch(() => {}); await p.waitForTimeout(250); await go.click({ timeout: 2000 }).catch(() => {}); await p.waitForTimeout(250); } }
    else if (kind === "arrange" && /not yet/.test(await go.innerText())) { await p.locator('.ar-fill[aria-label^="Riser"]').nth(1).click().catch(() => {}); await go.click(); }
    else await go.click();
    await p.waitForTimeout(450);
    const after = await p.locator(".fl").getAttribute("data-step");
    if (after === before && kind !== "add") { if (++stuck > 2) { errs.push(`stuck on ${kind}`); break; } } else stuck = 0;
  }
  const last = seen[seen.length - 1];
  out.push(`${last === "done" && !errs.length ? "ok  " : "FAIL"} ${slug.padEnd(24)} ${seen.join(" > ")}${errs.length ? "\n      " + [...new Set(errs)].join("\n      ") : ""}`);
  await ctx.close();
}
await b.close();
console.log(out.join("\n"));
