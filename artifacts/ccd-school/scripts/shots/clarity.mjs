// Shots for the 10 Nov clarity pass: home, the first lesson's steps and the syllabus, as a new learner
// and as one a few lessons in. Usage: node scripts/shots/clarity.mjs <out dir> <tag> [width] [only,scenes]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const [out = "/tmp/clarity", tag = "after", w = "390", onlyArg = ""] = process.argv.slice(2);
const base = process.env.BASE ?? "http://localhost:3000";
const only = onlyArg ? onlyArg.split(",") : null;
mkdirSync(out, { recursive: true });
const W = Number(w), H = W > 600 ? 900 : 844;
const SCREENS = ["home", "lesson", "studio", "practice", "dj", "library", "syllabus"];
const seen = Object.fromEntries(SCREENS.map(s => [`ccd.walk.${s}`, "1"]));
const fresh = { "ccd.progress.v2": { onboardingDone: true, selectedWorld: "fundamentals", completedMissions: {}, xp: 0, streakDays: 0 }, ...seen };
const someDone = Object.fromEntries(["tempo-bpm", "bars-time-signatures", "note-values"].map(s => [s, { score: 90, at: Date.now() - 3600e3 }]));
const going = { "ccd.progress.v2": { onboardingDone: true, selectedWorld: "fundamentals", completedMissions: someDone, xp: 160, streakDays: 2 }, ...seen };

const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
async function shot(name, url, { store = fresh, steps = 0, full = false, wait = 1500 } = {}) {
  if (only && !only.includes(name)) return;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, colorScheme: "dark" });
  const p = await ctx.newPage();
  p.on("pageerror", e => console.log(`  ${name} pageerror`, e.message.slice(0, 160)));
  await p.addInitScript(s => {
    if (sessionStorage.getItem("__seeded")) return;
    sessionStorage.setItem("__seeded", "1");
    for (const [k, v] of Object.entries(s)) localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));
  }, store);
  await p.goto(base + url, { waitUntil: "load", timeout: 180000 });
  await p.waitForTimeout(wait);
  if (steps) await p.screenshot({ path: `${out}/${tag}-${W}-${name}-s0.png` });
  for (let i = 0; i < steps; i++) {
    const go = p.locator(".ls-bottom .m1-g > :last-child").first();
    if (await go.count()) { await go.click().catch(() => {}); await p.waitForTimeout(900); }
    await p.screenshot({ path: `${out}/${tag}-${W}-${name}-s${i + 1}.png` });
  }
  await p.screenshot({ path: `${out}/${tag}-${W}-${name}.png`, fullPage: full });
  console.log(`${name} ok`);
  await ctx.close();
}
await shot("home-new", "/dashboard", { full: true });
await shot("home-going", "/dashboard", { store: going, full: true });
await shot("lesson", process.env.LESSON ?? "/learn/your-kick", { steps: Number(process.env.STEPS ?? 4) });
await shot("syllabus", "/learn", { store: going, full: true });
await b.close();
