// 10 Nov: walk a lesson step by step at one size and shoot every screen.
// Usage: node scripts/shots/lesson-walk.mjs <slug> <WxH> <out dir> [max steps]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const [slug = "tempo-bpm", size = "1440x900", out = "/tmp/walk", max = "14"] = process.argv.slice(2);
const [w, h] = size.split("x").map(Number);
const base = process.env.BASE ?? "http://localhost:3000";
mkdirSync(out, { recursive: true });
const seen = Object.fromEntries(["home", "lesson", "studio", "practice", "dj", "library", "syllabus"].map(s => [`ccd.walk.${s}`, "1"]));
const store = { "ccd.progress.v2": { onboardingDone: true, selectedWorld: "fundamentals", completedMissions: {}, xp: 0, streakDays: 1 }, ...seen };
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, colorScheme: "dark" });
const p = await ctx.newPage();
p.on("pageerror", e => console.log("pageerror", e.message.slice(0, 160)));
await p.addInitScript(s => { if (sessionStorage.getItem("__seeded")) return; sessionStorage.setItem("__seeded", "1"); for (const [k, v] of Object.entries(s)) localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)); }, store);
await p.goto(`${base}/learn/${slug}`, { waitUntil: "load", timeout: 180000 });
await p.waitForTimeout(2000);
for (let i = 0; i < Number(max); i++) {
  await p.screenshot({ path: `${out}/${slug}-${size}-${String(i).padStart(2, "0")}.png` });
  const moved = await p.evaluate(() => {
    const keys = [...document.querySelectorAll(".ls-bottom .m1-g > :last-child, .fl-bottom .is-wide, .ls-bottom .is-wide")].filter(e => !e.disabled);
    const k = keys[keys.length - 1]; if (!k) return false; k.click(); return true;
  });
  if (!moved) break;
  await p.waitForTimeout(1100);
}
await b.close();
