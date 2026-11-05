import { chromium } from "playwright";
const OUT = "/tmp/claude-0/-home-claude/14482081-5c9f-509e-afde-b9b4be190bf9/scratchpad/review1/shots/onb";
const [w, h] = (process.argv[2] ?? "390x844").split("x").map(Number);
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
await p.goto("http://localhost:3100/", { waitUntil: "load" }); await p.waitForTimeout(1500);
await p.evaluate(() => sessionStorage.setItem("ccd.tour.first", "your-kick"));
await p.goto("http://localhost:3100/dashboard?tour=1", { waitUntil: "load" }); await p.waitForTimeout(2000);
for (let i = 0; i < 6; i++) {
  await p.screenshot({ path: `${OUT}/${w}-tour-${i}.png` });
  const r = await p.evaluate(() => { const hole = document.querySelector(".tr-hole"); const c = document.querySelector(".tr-card"); return { hole: hole && hole.getAttribute("style"), card: c && c.innerText.replace(/\n/g," | ") }; });
  console.log(i, JSON.stringify(r));
  const go = p.locator(".tr-card .tr-keys button").last();
  if (!(await go.count())) break;
  await go.click(); await p.waitForTimeout(1200);
}
await p.waitForTimeout(2500);
console.log("url", p.url());
await p.screenshot({ path: `${OUT}/${w}-tour-end.png` });
await b.close();
