// open a lesson, advance to its tool step, touch controls, screenshot before/after each touch
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const ROOT = "/tmp/claude-0/-home-claude/14482081-5c9f-509e-afde-b9b4be190bf9/scratchpad/review1/shots/touch";
mkdirSync(ROOT, { recursive: true });
const slug = process.argv[2]; const [W, H] = (process.argv[3] ?? "390x844").split("x").map(Number);
const steps = Number(process.argv[4] ?? 2);
const actions = JSON.parse(process.argv[5] ?? "[]");
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
const errs = []; p.on("pageerror", e => errs.push(e.message));
await p.goto(`http://localhost:3100/learn/${slug}`, { waitUntil: "load" }); await p.waitForSelector(".fl"); await p.waitForTimeout(1200);
const go = p.locator(".ls-bottom .m1-g > :last-child").first();
for (let i = 0; i < steps; i++) { await go.click(); await p.waitForTimeout(700); }
await p.waitForTimeout(800);
const st = async () => p.evaluate(() => document.querySelector(".fl .m1-screen, .fl [class*=screen]")?.innerText.replace(/\s+/g, " ").slice(0, 200));
await p.screenshot({ path: `${ROOT}/${slug}-${W}-0.png` });
console.log("0", await st());
let n = 1;
for (const a of actions) {
  try {
    if (a.drag) { const el = p.locator(a.drag).nth(a.nth ?? 0); await el.scrollIntoViewIfNeeded(); const bb = await el.boundingBox(); await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.down(); await p.mouse.move(bb.x + bb.width / 2 + (a.dx ?? 0), bb.y + bb.height / 2 + (a.dy ?? -80), { steps: 12 }); await p.waitForTimeout(300); await p.screenshot({ path: `${ROOT}/${slug}-${W}-${n}-during.png` }); await p.mouse.up(); }
    else if (a.click) { const el = p.locator(a.click).nth(a.nth ?? 0); await el.scrollIntoViewIfNeeded(); await el.click({ timeout: 3000 }); }
    else if (a.text) { const el = p.getByRole("button", { name: a.text, exact: !!a.exact }).nth(a.nth ?? 0); await el.scrollIntoViewIfNeeded(); await el.click({ timeout: 3000 }); }
    else if (a.wait) await p.waitForTimeout(a.wait);
  } catch (e) { console.log("action failed", JSON.stringify(a), String(e.message).split("\n")[0]); }
  await p.waitForTimeout(a.after ?? 700);
  await p.screenshot({ path: `${ROOT}/${slug}-${W}-${n}.png` });
  console.log(n, JSON.stringify(a), await st());
  n++;
}
console.log("errs", errs);
await b.close();
