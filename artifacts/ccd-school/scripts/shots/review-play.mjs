// do the tempo-bpm play-in step for real: rec, wait count-in, tap kick on beats
import { chromium } from "playwright";
const OUT = "/tmp/claude-0/-home-claude/14482081-5c9f-509e-afde-b9b4be190bf9/scratchpad/review1/shots/lessons";
const [W, H] = (process.argv[2] ?? "390x844").split("x").map(Number);
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
const errs = []; p.on("pageerror", e => errs.push(e.message));
await p.goto("http://localhost:3100/learn/tempo-bpm", { waitUntil: "load" }); await p.waitForSelector(".fl"); await p.waitForTimeout(1200);
const go = p.locator(".ls-bottom .m1-g > :last-child").first();
await go.click(); await p.waitForTimeout(600); await go.click(); await p.waitForTimeout(900);
await p.screenshot({ path: `${OUT}/tempo-play-${W}-full.png`, fullPage: true });
const rec = p.getByRole("button", { name: /^rec/i }).first();
console.log("rec count", await p.getByRole("button", { name: /rec/i }).count(), await p.evaluate(() => [...document.querySelectorAll("button")].filter(b=>/rec/i.test(b.innerText+b.getAttribute("aria-label"))).map(b=>b.outerHTML.slice(0,160))));
await rec.scrollIntoViewIfNeeded(); await rec.click();
const t0 = Date.now();
await p.waitForTimeout(400); await p.screenshot({ path: `${OUT}/tempo-play-${W}-countin.png` });
// 120bpm: 4 clicks count-in = 2s, then beats every 500ms
const kick = p.getByRole("button", { name: /^kick/i }).first();
console.log("kick", await kick.count(), await kick.getAttribute("aria-label").catch(()=>null));
const kb = await kick.boundingBox();
for (let i = 0; i < 4; i++) {
  const target = 2000 + i * 500 + 20;
  const wait = target - (Date.now() - t0); if (wait > 0) await p.waitForTimeout(wait);
  await p.mouse.move(kb.x + kb.width / 2, kb.y + kb.height / 2); await p.mouse.down(); await p.waitForTimeout(60); await p.mouse.up();
}
await p.waitForTimeout(1500);
await p.screenshot({ path: `${OUT}/tempo-play-${W}-after.png` });
console.log(await p.evaluate(() => document.querySelector(".fl").innerText.replace(/\s+/g," ").slice(0,700)));
console.log("go", await go.innerText());
await go.click(); await p.waitForTimeout(1200);
await p.screenshot({ path: `${OUT}/tempo-play-${W}-next.png` });
console.log("next", await p.locator(".fl").getAttribute("data-page-kind"), errs);
await b.close();
