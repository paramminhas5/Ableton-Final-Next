// real learner: do tempo-bpm for real, then open later lessons with that song
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const OUT = "/tmp/claude-0/-home-claude/14482081-5c9f-509e-afde-b9b4be190bf9/scratchpad/review2/shots/journey"; mkdirSync(OUT, { recursive: true });
const [W, H] = (process.argv[2] ?? "390x844").split("x").map(Number);
const later = (process.argv[3] ?? "the-drop").split(",");
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await b.newContext({ viewport: { width: W, height: H } });
const p = await ctx.newPage(); const errs = []; p.on("pageerror", e => errs.push(e.message.slice(0, 200)));
const go = p.locator(".ls-bottom .m1-g > :last-child").first();
const kind = () => p.locator(".fl").getAttribute("data-page-kind").catch(() => null);
const txt = () => p.evaluate(() => document.querySelector(".fl")?.innerText.replace(/\s+/g, " ").slice(0, 700));
async function walk(tag, max = 30) {
  let stuck = 0;
  for (let i = 0; i < max; i++) {
    const k = await kind(); const st = await p.locator(".fl").getAttribute("data-step").catch(() => null);
    await p.screenshot({ path: `${OUT}/${tag}-${String(i).padStart(2, "0")}-${k}.png` });
    console.log(`[${tag}] #${i} ${k} go="${await go.innerText().catch(() => "")}" :: ${(await txt())?.slice(0, 420)}`);
    if (k === "done" || !k) { await p.screenshot({ path: `${OUT}/${tag}-done-full.png`, fullPage: true }); return; }
    if (k === "play") {
      const rec = p.getByRole("button", { name: /^record/i }).first();
      const kc = await p.getByRole("button", { name: /^kick/i }).count();
      if (await rec.count() && kc) {
        const kick = p.getByRole("button", { name: /^kick/i }).first();
        await rec.click(); const t0 = Date.now(); const kb = await kick.boundingBox();
        for (let j = 0; j < 4; j++) { const w = 2000 + j * 500 + 20 - (Date.now() - t0); if (w > 0) await p.waitForTimeout(w); await p.mouse.move(kb.x + kb.width / 2, kb.y + 10); await p.mouse.down(); await p.waitForTimeout(50); await p.mouse.up(); }
        await p.waitForTimeout(800);
      } else if (await rec.count()) {
        // keys: rec then tap first key 4 times on beats
        const keys = p.locator("button[aria-label]").filter({ hasText: /^[a-g]$/ });
        const n = await keys.count(); console.log("  keys found", n);
        await rec.click(); const t0 = Date.now();
        for (let j = 0; j < 4 && n; j++) { const w = 2000 + j * 500 + 20 - (Date.now() - t0); if (w > 0) await p.waitForTimeout(w); const kb = await keys.nth(j % n).boundingBox(); await p.mouse.move(kb.x + kb.width / 2, kb.y + 10); await p.mouse.down(); await p.waitForTimeout(50); await p.mouse.up(); }
        await p.waitForTimeout(1200);
        await p.screenshot({ path: `${OUT}/${tag}-keys-after.png` });
        console.log("  after keys:", (await txt())?.slice(0, 500));
      }
    }
    if (k === "check") { await p.getByText("skip the challenge").click({ timeout: 3000 }).catch(() => {}); }
    else if (k === "ear") { for (let q = 0; q < 20 && (await kind()) === "ear"; q++) { await p.locator('[role="radio"]:not([disabled]), .ls-pad:not([disabled])').first().click({ timeout: 2000 }).catch(() => {}); await p.waitForTimeout(250); await go.click({ timeout: 2000 }).catch(() => {}); await p.waitForTimeout(250); } }
    else {
      const t = await go.innerText().catch(() => "");
      if (/more|not yet/.test(t)) { const sk = p.getByRole("button", { name: /^skip/i }).first(); if (await sk.count()) await sk.click().catch(() => {}); else { console.log("  no skip on", k); } }
      else await go.click({ timeout: 4000 }).catch(e => console.log("  click fail", e.message.split("\n")[0]));
    }
    await p.waitForTimeout(1000);
    const st2 = await p.locator(".fl").getAttribute("data-step").catch(() => null);
    if (st2 === st && (await kind()) === k) { if (++stuck > 2) { console.log("  STUCK on", k); return; } } else stuck = 0;
  }
}
await p.goto("http://localhost:3100/learn/tempo-bpm", { waitUntil: "load" }); await p.waitForTimeout(2000);
await walk("tempo");
for (const s of later) { await p.goto(`http://localhost:3100/learn/${s}`, { waitUntil: "load" }); await p.waitForTimeout(2000); await walk(s); }
for (const u of ["/learn/world/fundamentals", "/studio", "/dashboard"]) { await p.goto("http://localhost:3100" + u, { waitUntil: "load" }); await p.waitForTimeout(2200); await p.screenshot({ path: `${OUT}/after${u.replace(/\//g, "_")}-${W}.png`, fullPage: true }); }
console.log("ERRS", errs);
await b.close();
