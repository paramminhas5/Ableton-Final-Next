// A phone-size screen recording of the first visit's watch screens (9 Nov night), for review.
import { chromium } from "playwright";
const out = process.argv[2] ?? "/tmp/tour-video";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: "dark", recordVideo: { dir: out, size: { width: 780, height: 1688 } } });
const p = await ctx.newPage();
await p.addInitScript(() => { if (!sessionStorage.getItem("v")) { sessionStorage.setItem("v", "1"); localStorage.setItem("ccd.mode", "dark"); } });
await p.goto("http://localhost:3000/", { waitUntil: "load" });
await p.waitForTimeout(3500);
const go = () => p.locator(".wl-go button").first().click();
for (let i = 0; i < 11; i++) { await go(); await p.waitForTimeout(i % 2 === 0 ? 3800 : 1600); }
await ctx.close();
await b.close();
