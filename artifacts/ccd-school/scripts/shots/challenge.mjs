// The end-of-world challenge: intro, the match round, the copy round (solved with hints), the summary, and the
// stars on all lessons. Usage: node scripts/shots/challenge.mjs <base> <outdir> [w] [h] [dark|light] [world]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const base = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? "/tmp/challenge";
const W = Number(process.argv[4] ?? 390), H = Number(process.argv[5] ?? 844);
const theme = process.argv[6] ?? "dark";
const world = process.argv[7] ?? "producer";
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const p = await (await b.newContext({ viewport: { width: W, height: H }, colorScheme: theme })).newPage();
const errs = [];
p.on("pageerror", e => errs.push(e.message.slice(0, 200)));
await p.addInitScript(th => localStorage.setItem("ccd.mode", th), theme);
const tag = `${world}-${W}-${theme}`;
const shot = n => p.screenshot({ path: `${out}/${tag}-${n}.png` });
await p.goto(`${base}/world/${world}/challenge`, { waitUntil: "load" });
await p.waitForSelector(".wc .ls-col", { timeout: 120000 });
await p.waitForTimeout(600);
await shot("0-intro");
await p.getByRole("button", { name: "Start the challenge" }).click();
await p.waitForTimeout(800);
await p.getByRole("button", { name: /Check how close/ }).click();
await p.waitForTimeout(2500);
await shot("1-match");
await p.getByRole("button", { name: "Skip this step" }).click();
await p.waitForTimeout(800);
// Copy: check, then take hints and fill the outlined cells until it's done.
for (let i = 0; i < 20; i++) {
  if (await p.getByRole("button", { name: "Next round" }).count()) break;
  await p.getByRole("button", { name: /Check your notes/ }).click();
  await p.waitForTimeout(200);
  if (await p.getByRole("button", { name: "Next round" }).count()) break;
  // Take out red notes first.
  const wrong = p.locator(".cp-cell.is-wrong");
  if (await wrong.count()) { await wrong.first().click(); continue; }
  await p.getByRole("button", { name: /Show where one missing/ }).click();
  await p.waitForTimeout(150);
  const g = p.locator(".cp-cell.is-ghost").first();
  if (await g.count()) await g.click();
}
await p.waitForTimeout(300);
await shot("2-copy");
await p.getByRole("button", { name: "Next round" }).click().catch(() => {});
await p.waitForTimeout(800);
await shot("3-summary");
const says = await p.locator(".ls-title").first().textContent();
await p.goto(`${base}/learn`, { waitUntil: "load" });
await p.waitForSelector(".wd-cols", { timeout: 60000 });
await p.waitForTimeout(800);
await shot("4-learn");
const card = await p.locator(".wc-card").nth(world === "fundamentals" ? 1 : world === "producer" ? 2 : 3).getAttribute("aria-label").catch(() => null);
console.log(`${tag}: summary "${says}"; learn page card: ${card}; ${errs.length} page errors${errs.length ? ": " + errs.join(" | ") : ""}`);
await b.close();
