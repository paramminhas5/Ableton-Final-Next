// Load time on a mid-range phone (4x slower CPU, a 9 Mbps / 40 ms link): LCP, CLS and JS weight per page.
import { chromium } from "playwright";
const base = process.env.BASE ?? "http://localhost:3000";
const pages = process.argv.slice(2).length ? process.argv.slice(2) : ["/", "/dashboard", "/learn", "/gym", "/atlas", "/device/reverb", "/studio", "/dj"];
const b = await chromium.launch();
for (const url of pages) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.addInitScript(onboarded => {
    localStorage.setItem("ccd.progress.v2", JSON.stringify({ onboardingDone: onboarded, selectedWorld: "fundamentals", completedMissions: {}, xp: 0, streakDays: 0 }));
    for (const s of ["home", "lesson", "studio", "dj", "practice", "syllabus", "wiki", "device"]) localStorage.setItem(`ccd.walk.${s}`, "1");
    window.__lcp = 0; window.__cls = 0;
    new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true });
  }, url !== "/");
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 40, downloadThroughput: 9e6 / 8, uploadThroughput: 3e6 / 8 });
  let js = 0;
  p.on("response", async r => { if (r.url().endsWith(".js")) { const h = await r.headerValue("content-length").catch(() => null); js += +(h ?? 0); } });
  const t0 = Date.now();
  await p.goto(base + url, { waitUntil: "load", timeout: 120000 });
  const load = Date.now() - t0;
  await p.waitForTimeout(2500);
  const [lcp, cls] = await p.evaluate(() => [window.__lcp, window.__cls]);
  console.log(`${url.padEnd(16)} load ${String(load).padStart(5)} ms   lcp ${String(Math.round(lcp)).padStart(5)} ms   cls ${cls.toFixed(3)}   js ${Math.round(js / 1024)} KB`);
  await ctx.close();
}
await b.close();
