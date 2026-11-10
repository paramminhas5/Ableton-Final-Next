// 10 Nov: the same screens on two builds, for a side-by-side on the canvas.
// Usage: node scripts/shots/compare.mjs <base url> <label> <out dir>
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const [base, label, out] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const seen = Object.fromEntries(["home", "lesson", "studio", "practice", "dj", "library", "syllabus", "wiki", "device", "dashboard"].map(s => [`ccd.walk.${s}`, "1"]));
const done = l => Object.fromEntries(l.map(s => [s, { score: 90, at: Date.now() - 3600e3 }]));
const prog = { "ccd.progress.v2": { onboardingDone: true, selectedWorld: "fundamentals", completedMissions: done(["tempo-bpm", "set-your-tempo", "bars-time-signatures"]), xp: 420, streakDays: 3 }, "ccd.gloss.seen": "1", ...seen };
const fresh = {};
const shots = [
  ["01-first-visit", "/start", fresh, 0, 3500],
  ["02-home", "/dashboard", prog, 0],
  ["03-lesson-start", "/learn/tempo-bpm", prog, 0],
  ["04-lesson-listen", "/learn/tempo-bpm", prog, 1],
  ["05-lesson-play", "/learn/tempo-bpm", prog, 4],
  ["06-lesson-shape", "/learn/groove-feel", prog, 2],
  ["07-syllabus", "/learn", prog, 0],
  ["08-studio", "/studio", prog, 0],
  ["09-library", "/atlas", prog, 0],
];
const sizes = [["phone", 390, 844, 2], ["laptop", 1440, 900, 1]];
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
for (const [sz, w, h, dpr] of sizes) for (const [name, url, store, steps, wait = 1800] of shots) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, colorScheme: "dark" });
  const p = await ctx.newPage();
  await p.addInitScript(s => { if (sessionStorage.getItem("__s")) return; sessionStorage.setItem("__s", "1"); for (const [k, v] of Object.entries(s)) localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)); }, store);
  try {
    await p.goto(base + url, { waitUntil: "load", timeout: 180000 });
    await p.waitForTimeout(wait);
    for (let i = 0; i < steps; i++) {
      await p.evaluate(() => { const ks = [...document.querySelectorAll(".ls-bottom .m1-g > :last-child, .fl-bottom .is-wide, .ls-bottom .is-wide")].filter(e => !e.disabled); ks[ks.length - 1]?.click(); });
      await p.waitForTimeout(900);
    }
    // close any tip or tour still open
    await p.evaluate(() => { document.querySelectorAll(".tr .ls-chip").forEach(b => b.click()); document.querySelectorAll("nextjs-portal").forEach(e => e.remove()); });
    await p.waitForTimeout(300);
    await p.screenshot({ path: `${out}/${label}-${sz}-${name}.png` });
    console.log(label, sz, name);
  } catch (e) { console.log("fail", label, sz, name, e.message.slice(0, 80)); }
  await ctx.close();
}
await b.close();
