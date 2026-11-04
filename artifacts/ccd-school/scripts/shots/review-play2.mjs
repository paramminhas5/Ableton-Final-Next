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


const OUTX=OUT;
let stuck = 0;
for (let i = 0; i < 40; i++) {
  const kind = await p.locator(".fl").getAttribute("data-page-kind").catch(() => null);
  const step = await p.locator(".fl").getAttribute("data-step").catch(() => null);
  await p.screenshot({ path: `${OUT}/tempo-cont-${W}-${String(i).padStart(2, "0")}-${kind}.png` });
  const go = p.locator(".ls-bottom .m1-g > :last-child").first();
  const info = await p.evaluate(() => {
    const fl = document.querySelector(".fl");
    const t = (fl?.innerText ?? "").replace(/\s+/g, " ").slice(0, 600);
    const goEl = document.querySelector(".ls-bottom .m1-g > :last-child");
    const g = goEl ? { txt: goEl.innerText.trim(), dis: goEl.disabled || goEl.getAttribute("aria-disabled"), y: Math.round(goEl.getBoundingClientRect().bottom) } : null;
    const pinks = [...document.querySelectorAll(".m1-gopill, [class*=gopill], [class*=GoPill]")].filter(e => e.offsetParent).length;
    return { t, g, pinks, em: document.body.innerText.includes("—"), hs: document.documentElement.scrollWidth > innerWidth, sh: document.documentElement.scrollHeight };
  });
  console.log(`#${i} step=${step} kind=${kind} go=${JSON.stringify(info.g)} em=${info.em} hscroll=${info.hs} pageH=${info.sh}\n   ${info.t}`);
  if (kind === "done" || !kind) break;
  const before = step;
  try {
    const skip = p.getByRole("button", { name: "Skip this step" });
    if (kind === "check") await p.getByText("skip the challenge").click({ timeout: 3000 });
    else if (kind === "ear") { for (let k = 0; k < 20 && (await p.locator(".fl").getAttribute("data-page-kind")) === "ear"; k++) { await p.locator('[role="radio"]:not([disabled]), .ls-pad:not([disabled])').first().click({ timeout: 2000 }).catch(() => {}); await p.waitForTimeout(250); await go.click({ timeout: 2000 }).catch(() => {}); await p.waitForTimeout(250); } }
    else if (await go.isDisabled().catch(() => false) || /not yet/.test(await go.innerText().catch(() => ""))) { if (await skip.count()) await skip.first().click(); else { errs.push(`go disabled on ${kind}, no skip`); await go.click({ force: true, timeout: 2000 }).catch(() => {}); } }
    else await go.click({ timeout: 4000 });
  } catch (e) { errs.push(`threw on ${kind}: ${String(e.message).split("\n")[0].slice(0, 150)}`); const skip = p.getByRole("button", { name: "Skip this step" }); if (await skip.count()) await skip.first().click().catch(() => {}); }
  await p.waitForTimeout(900);
  const after = await p.locator(".fl").getAttribute("data-step").catch(() => null);
  if (after === before) { if (++stuck > 2) { errs.push(`stuck on ${kind}`); break; } } else stuck = 0;
}
console.log("ERRS", JSON.stringify(errs));
await b.close();
