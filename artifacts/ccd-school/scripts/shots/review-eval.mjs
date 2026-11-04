import { chromium } from "playwright";
const slug = process.argv[2]; const [W, H] = (process.argv[3] ?? "390x844").split("x").map(Number);
const steps = Number(process.argv[4] ?? 2); const js = process.argv[5];
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
await p.goto(`http://localhost:3100/learn/${slug}`, { waitUntil: "load" }); await p.waitForSelector(".fl"); await p.waitForTimeout(1200);
const go = p.locator(".ls-bottom .m1-g > :last-child").first();
for (let i = 0; i < steps; i++) { await go.click(); await p.waitForTimeout(700); }
await p.waitForTimeout(800);
console.log(JSON.stringify(await p.evaluate(js), null, 1));
await b.close();
