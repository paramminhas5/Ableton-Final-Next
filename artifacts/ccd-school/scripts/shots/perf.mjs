// Speed budget on a mid-range Android over 4G: Chromium with CPU throttled 4x and Lighthouse's mobile network
// (150 ms round trip, 1.6 Mbps down, 750 kbps up), a fresh profile per run (cold cache), 390x844.
// Reports first contentful paint, largest contentful paint, time to interactive (the end of the last long task
// before a 5 s window with none, never earlier than first paint, as Lighthouse defines it without the network
// part), the long tasks' total blocking time, and the JavaScript and total bytes the page pulled.
// Usage: node scripts/shots/perf.mjs <base> [runs] [route,route]
import { chromium } from "playwright";
const base = process.argv[2] ?? "http://localhost:3000";
const runs = Number(process.argv[3] ?? 3);
const routes = (process.argv[4] ?? "/,/learn,/learn/your-kick").split(",");
const b = await chromium.launch();
const median = a => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const rows = [];
for (const route of routes) {
  const res = [];
  for (let r = 0; r < runs; r++) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, colorScheme: "dark",
      userAgent: "Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36" });
    // A returning visitor would skip the welcome; a first visit is what we measure on "/".
    const p = await ctx.newPage();
    const cdp = await ctx.newCDPSession(p);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    let js = 0, all = 0;
    const types = new Map();
    cdp.on("Network.responseReceived", e => types.set(e.requestId, e.type));
    cdp.on("Network.loadingFinished", e => { all += e.encodedDataLength; if (types.get(e.requestId) === "Script") js += e.encodedDataLength; });
    await p.addInitScript(() => {
      window.__lt = []; window.__lcp = 0;
      try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([e.startTime, e.duration]); }).observe({ type: "longtask", buffered: true }); } catch {}
      try { new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true }); } catch {}
    });
    await p.goto(base + route, { waitUntil: "load", timeout: 180000 });
    // Wait for 5 s with no long task (up to 40 s after load).
    const t0 = Date.now();
    for (;;) {
      const q = await p.evaluate(() => { const lt = window.__lt; const last = lt.length ? lt[lt.length - 1][0] + lt[lt.length - 1][1] : 0; return performance.now() - Math.max(last, 0); });
      if (q > 5000 || Date.now() - t0 > 40000) break;
      await p.waitForTimeout(500);
    }
    const m = await p.evaluate(() => {
      const fcp = performance.getEntriesByName("first-contentful-paint")[0]?.startTime ?? 0;
      const lt = window.__lt;
      let tti = fcp;
      for (const [s, d] of lt) if (s + d > tti) tti = s + d;
      const tbt = lt.filter(([s]) => s > fcp).reduce((a, [, d]) => a + Math.max(0, d - 50), 0);
      return { fcp, lcp: window.__lcp, tti, tbt, longtasks: lt.length };
    });
    res.push({ ...m, js, all });
    await ctx.close();
  }
  const row = { route, fcp: median(res.map(x => x.fcp)), lcp: median(res.map(x => x.lcp)), tti: median(res.map(x => x.tti)), tbt: median(res.map(x => x.tbt)), js: median(res.map(x => x.js)), all: median(res.map(x => x.all)), ttis: res.map(x => Math.round(x.tti)) };
  rows.push(row);
  console.log(`${route.padEnd(20)} fcp ${(row.fcp / 1000).toFixed(2)} s · lcp ${(row.lcp / 1000).toFixed(2)} s · interactive ${(row.tti / 1000).toFixed(2)} s (runs ${row.ttis.join(", ")} ms) · blocking ${Math.round(row.tbt)} ms · js ${Math.round(row.js / 1024)} kB · all ${Math.round(row.all / 1024)} kB`);
}
await b.close();
