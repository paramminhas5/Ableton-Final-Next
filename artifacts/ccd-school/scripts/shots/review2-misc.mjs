import { chromium } from "playwright";
const OUT = "/tmp/claude-0/-home-claude/14482081-5c9f-509e-afde-b9b4be190bf9/scratchpad/review2/shots";
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
for (const [W, H] of [[390, 844], [1440, 900]]) {
  const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
  const errs = []; p.on("pageerror", e => errs.push(e.message.slice(0, 150)));
  await p.goto("http://localhost:3100/studio", { waitUntil: "load" }); await p.waitForTimeout(2000);
  await p.getByText("mix", { exact: true }).first().click(); await p.waitForTimeout(1200);
  await p.screenshot({ path: `${OUT}/studio-mix-${W}.png` }); await p.screenshot({ path: `${OUT}/studio-mix-${W}-full.png`, fullPage: true });
  console.log(W, "studio mix:", await p.evaluate(() => document.body.innerText.replace(/\s+/g, " ").slice(0, 600)), "h", await p.evaluate(() => document.documentElement.scrollHeight));
  await p.goto("http://localhost:3100/learn/world/fundamentals", { waitUntil: "load" }); await p.waitForTimeout(1800);
  await p.getByText("list", { exact: true }).first().click(); await p.waitForTimeout(900);
  await p.screenshot({ path: `${OUT}/world-list-${W}.png` }); await p.screenshot({ path: `${OUT}/world-list-${W}-full.png`, fullPage: true });
  console.log(W, "world list:", await p.evaluate(() => document.body.innerText.replace(/\s+/g, " ").slice(0, 700)));
  for (const u of ["/practice", "/gym", "/learn/world/producer", "/learn/world/dj"]) {
    await p.goto("http://localhost:3100" + u, { waitUntil: "load" }); await p.waitForTimeout(2000);
    const tag = u.replace(/\//g, "_");
    await p.screenshot({ path: `${OUT}/${tag}-${W}.png` }); await p.screenshot({ path: `${OUT}/${tag}-${W}-full.png`, fullPage: true });
    console.log(W, u, "->", p.url(), await p.evaluate(() => ({ t: document.title, h: document.documentElement.scrollHeight, hs: document.documentElement.scrollWidth > innerWidth, em: document.body.innerText.includes("—"), txt: document.body.innerText.replace(/\s+/g, " ").slice(0, 600) })));
  }
  console.log("errs", errs);
}
await b.close();
