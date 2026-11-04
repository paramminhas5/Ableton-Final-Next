import { chromium } from "playwright";
const OUT = "/tmp/claude-0/-home-claude/14482081-5c9f-509e-afde-b9b4be190bf9/scratchpad/review1/shots";
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
await p.goto("http://localhost:3100/sound", { waitUntil: "load" }); await p.waitForTimeout(2000);
console.log(await p.evaluate(() => document.querySelector("[role=radiogroup], .m1-sw")?.outerHTML.slice(0, 400)));
await p.getByRole("button", { name: /try it blind/ }).click(); await p.waitForTimeout(600);
await p.getByRole("button", { name: "Play hats" }).click(); await p.waitForTimeout(1000);
await p.getByRole("button", { name: /i like x/ }).first().click(); await p.waitForTimeout(800);
await p.screenshot({ path: `${OUT}/sound-390-blind-answer.png` });
console.log(await p.evaluate(() => document.querySelector(".fl, main").innerText.slice(0, 700)));
// scroll down to whole song and play, check toggle visibility
await p.getByRole("button", { name: /leave blind/ }).click(); await p.waitForTimeout(500);
const ws = p.getByRole("button", { name: "Play the whole song" }); await ws.scrollIntoViewIfNeeded(); await ws.click(); await p.waitForTimeout(800);
await p.screenshot({ path: `${OUT}/sound-390-wholesong.png` });
await b.close();
