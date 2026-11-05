import { chromium } from "playwright";
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(`http://localhost:3100/learn/${process.argv[2]}`, { waitUntil: "load" });
await p.waitForSelector(".fl");
for (let i = 0; i < 2; i++) { await p.locator(".ls-bottom .m1-g > :last-child").first().click(); await p.waitForTimeout(600); }
const go = p.locator(".ls-bottom .m1-g > :last-child").first();
console.log(await go.boundingBox(), await p.evaluate(() => [document.documentElement.scrollHeight, window.innerHeight, document.querySelector(".ls-bottom").getBoundingClientRect().bottom]));
await b.close();
