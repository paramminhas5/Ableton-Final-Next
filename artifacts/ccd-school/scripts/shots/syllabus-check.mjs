// 10 Nov: the whole syllabus per world, as a basics grad, plus doing steps with their new "why".
// Usage: node scripts/shots/syllabus-check.mjs <out dir>
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const [out = "/tmp/syl"] = process.argv.slice(2);
const base = process.env.BASE ?? "http://localhost:3000";
mkdirSync(out, { recursive: true });
const seen = Object.fromEntries(["home", "lesson", "studio", "practice", "dj", "library", "syllabus"].map(s => [`ccd.walk.${s}`, "1"]));
const done = list => Object.fromEntries(list.map(s => [s, { score: 90, at: Date.now() - 3600e3 }]));
const basics = ["tempo-bpm", "set-your-tempo", "bars-time-signatures", "note-values", "groove-feel", "what-is-sound", "frequency-pitch", "amplitude-volume", "timbre-tone", "waveforms", "overtones-harmonics", "noise", "samples-loops", "notes-and-octaves", "major-scale", "intervals", "melody-writing", "pentatonic-scales", "what-are-chords", "chord-progressions", "bass-follows", "song-structure"];
const st = (world, list) => ({ "ccd.progress.v2": { onboardingDone: true, selectedWorld: world, completedMissions: done(list), xp: 900, streakDays: 4 }, "ccd.world": world, ...seen });
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
async function shot(name, url, store, { steps = 0, full = false, w = 390, open = "" } = {}) {
  const ctx = await b.newContext({ viewport: { width: w, height: 844 }, deviceScaleFactor: 2, colorScheme: "dark" });
  const p = await ctx.newPage();
  p.on("pageerror", e => console.log(`  ${name} pageerror`, e.message.slice(0, 160)));
  await p.addInitScript(s => { if (sessionStorage.getItem("__seeded")) return; sessionStorage.setItem("__seeded", "1"); for (const [k, v] of Object.entries(s)) localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)); }, store);
  await p.goto(base + url, { waitUntil: "load", timeout: 180000 });
  await p.waitForTimeout(1800);
  for (let i = 0; i < steps; i++) {
    await p.evaluate(() => { const g = document.querySelector(".ls-bottom .m1-g > :last-child, .fl-bottom .is-wide"); g && g.click(); });
    await p.waitForTimeout(900);
  }
  if (open) { await p.evaluate(s => document.querySelector(`#l-${s} .sr-x`)?.click(), open); await p.waitForTimeout(400); }
  await p.screenshot({ path: `${out}/${name}.png`, fullPage: full });
  console.log(name, "ok");
  await ctx.close();
}
await shot("syl-basics", "/learn", st("fundamentals", basics.slice(0, 3)), { full: true, open: "tempo-bpm" });
await shot("syl-basics-top", "/learn", st("fundamentals", basics.slice(0, 3)), { open: "tempo-bpm" });
await shot("syl-producer-grad", "/learn", st("producer", [...basics, "midi-piano-roll"]), { full: true });
await shot("syl-dj", "/learn", st("dj", basics), { full: true });
for (const [slug, n] of (process.env.STEPS ?? "midi-piano-roll:3,your-kick:4,waveforms:3").split(",").map(x => x.split(":")))
  await shot(`why-${slug}`, `/learn/${slug}`, st("producer", basics), { steps: Number(n) });
await b.close();
