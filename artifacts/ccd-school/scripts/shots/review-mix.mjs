import { chromium } from "playwright";
const OUT = "/tmp/claude-0/-home-claude/14482081-5c9f-509e-afde-b9b4be190bf9/scratchpad/review1/shots/touch";
const slug = process.argv[2]; const [W, H] = (process.argv[3] ?? "390x844").split("x").map(Number);
const acts = JSON.parse(process.argv[4] ?? "[]");
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
const errs = []; p.on("pageerror", e => errs.push(e.message));
await p.goto(`http://localhost:3100/learn/${slug}`, { waitUntil: "load" }); await p.waitForSelector(".fl"); await p.waitForTimeout(1200);
const go = p.locator(".ls-bottom .m1-g > :last-child").first();
for (let i = 0; i < 2; i++) { await go.click(); await p.waitForTimeout(700); }
await p.waitForTimeout(1000);
await p.screenshot({ path: `${OUT}/${slug}-${W}-mix0-full.png`, fullPage: true });
await p.screenshot({ path: `${OUT}/${slug}-${W}-mix0.png` });
const txt = async () => p.evaluate(() => document.querySelector(".fl").innerText.replace(/\s+/g, " "));
console.log("TEXT0", (await txt()).slice(0, 2500));
let n = 1;
for (const a of acts) {
  try {
    if (a.text) await p.getByRole("button", { name: a.text, exact: !!a.exact }).first().click({ timeout: 3000 });
    if (a.drag) { const el = p.locator(a.drag).nth(a.nth ?? 0); await el.scrollIntoViewIfNeeded(); const bb = await el.boundingBox(); await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.down(); await p.mouse.move(bb.x + bb.width / 2 + (a.dx ?? 0), bb.y + bb.height / 2 + (a.dy ?? 0), { steps: 15 }); await p.mouse.up(); }
    if (a.wait) await p.waitForTimeout(a.wait);
  } catch (e) { console.log("fail", JSON.stringify(a), String(e.message).split("\n")[0]); }
  await p.waitForTimeout(a.after ?? 800);
  await p.screenshot({ path: `${OUT}/${slug}-${W}-mix${n}.png` });
  console.log(n, JSON.stringify(a), "GO:", await go.innerText(), "|", (await txt()).slice(0, 400));
  n++;
}
console.log("errs", errs);
await b.close();
