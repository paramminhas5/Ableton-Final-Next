// Long tasks and requests on one route under the 4x CPU, 4G profile (as perf.mjs), to see what holds up interactive.
// Usage: node scripts/shots/longtasks.mjs <url>
import { chromium } from "playwright";
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await cdp.send("Network.enable");
await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
const t0 = Date.now(); const reqs = [];
cdp.on("Network.loadingFinished", e => reqs.push([Date.now() - t0, e.requestId, e.encodedDataLength]));
const urls = new Map(); cdp.on("Network.requestWillBeSent", e => urls.set(e.requestId, e.request.url));
await p.addInitScript(() => { window.__lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ type: "longtask", buffered: true }); });
await p.goto(process.argv[2], { waitUntil: "load" });
await p.waitForTimeout(9000);
console.log("long tasks [start, ms]:", JSON.stringify(await p.evaluate(() => window.__lt)));
for (const [t, id, n] of reqs.sort((a, b) => a[0] - b[0])) console.log(String(t).padStart(6), String(Math.round(n / 1024)).padStart(5) + "kB", (urls.get(id) ?? "").replace(/^https?:\/\/[^/]+/, "").slice(0, 90));
await b.close();
