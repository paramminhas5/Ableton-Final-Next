// Time to first sound on a fresh profile: open "/", take the shortest path a new visitor is offered to a sound
// (the welcome's first tap), and time from navigation start to the first audible sample out of the engine.
// The engine's output is tapped with an analyser (wrapping AudioNode.connect to the destination), so this is
// sound actually rendered, not a click. Run with the network and CPU at a mid-range phone's (perf.mjs) and
// without. Usage: node scripts/shots/first-sound.mjs <base> [runs] [throttle:0|1]
import { chromium } from "playwright";
const base = process.argv[2] ?? "http://localhost:3000";
const runs = Number(process.argv[3] ?? 3);
const throttle = process.argv[4] === "1";
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const out = [];
for (let r = 0; r < runs; r++) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, colorScheme: "dark" });
  const p = await ctx.newPage();
  if (throttle) {
    const cdp = await ctx.newCDPSession(p);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  }
  await p.addInitScript(() => {
    window.__firstSound = 0; window.__taps = [];
    const orig = AudioNode.prototype.connect;
    AudioNode.prototype.connect = function (dest, ...rest) {
      const r = orig.call(this, dest, ...rest);
      try {
        if (dest instanceof AudioDestinationNode && !this.__tapped) {
          this.__tapped = true;
          const an = this.context.createAnalyser(); an.fftSize = 512; orig.call(this, an);
          const buf = new Float32Array(an.fftSize);
          const poll = () => { an.getFloatTimeDomainData(buf); let pk = 0; for (const v of buf) pk = Math.max(pk, Math.abs(v)); if (pk > 0.01 && !window.__firstSound) window.__firstSound = performance.now(); if (!window.__firstSound) setTimeout(poll, 4); };
          poll();
        }
      } catch {}
      return r;
    };
    addEventListener("pointerdown", () => window.__taps.push(performance.now()), true);
  });
  await p.goto(base + "/", { waitUntil: "load", timeout: 180000 });
  // The shortest path the screen offers: whatever control it puts first for a sound.
  const steps = [];
  for (let i = 0; i < 6; i++) {
    const has = await p.evaluate(() => !!window.__firstSound);
    if (has) break;
    const pad = p.locator('[data-first-sound]').first();
    if (await pad.count() && await pad.isVisible()) { await pad.click(); steps.push("tap the sound"); await p.waitForTimeout(1500); continue; }
    const kick = p.getByRole("button", { name: "Play a kick" });
    if (await kick.count()) { await kick.dispatchEvent("pointerdown"); steps.push("tap the kick"); await p.waitForTimeout(1500); continue; }
    const show = p.getByRole("button", { name: /show me/i });
    if (await show.count()) { await show.first().click(); steps.push("show me"); await p.waitForTimeout(300); continue; }
    break;
  }
  await p.waitForFunction(() => !!window.__firstSound, null, { timeout: 30000 }).catch(() => {});
  const m = await p.evaluate(() => ({ first: window.__firstSound, lastTap: window.__taps[window.__taps.length - 1] ?? 0, taps: window.__taps.length }));
  out.push(m);
  console.log(`run ${r + 1}: first sound ${(m.first / 1000).toFixed(2)} s after navigation, ${m.first ? Math.round(m.first - m.lastTap) : "-"} ms after the last tap, ${m.taps} taps (${steps.join(" > ")})`);
  await ctx.close();
}
const s = out.map(x => x.first).sort((a, b) => a - b);
console.log(`median ${(s[Math.floor(s.length / 2)] / 1000).toFixed(2)} s ${throttle ? "(4x cpu, 4g)" : "(no throttling)"}`);
await b.close();
