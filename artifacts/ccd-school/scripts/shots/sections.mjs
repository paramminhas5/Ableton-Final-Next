// Shots for the 10 Nov sections pass: the instrument screens and a lesson as a learner a few lessons in,
// with a song. Usage: node scripts/shots/sections.mjs <out dir> <tag> [width] [only,scenes]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const [out = "/tmp/sections", tag = "after", w = "390", onlyArg = ""] = process.argv.slice(2);
const base = process.env.BASE ?? "http://localhost:3000";
const only = onlyArg ? onlyArg.split(",") : null;
mkdirSync(out, { recursive: true });
const W = Number(w), H = Number(process.env.H ?? (W > 600 ? 900 : 844));

const hit = (note, starts, vel = 0.9, len = 0.2) => starts.map(start => ({ note, vel, start, len }));
const layer = (type, from, events, extra = {}) => ({ id: `${type}-${from}`, type, events, params: {}, mute: false, solo: false, duck: { src: null, note: null }, surface: type === "bass" || type === "lead" || type === "chords" ? "keys" : "pads", pad: 0, from, world: "producer", variant: 0, ...extra });
const song = {
  v: 2, bpm: 122, root: 45, scale: "minor", swing: 0, loop: 16, added: ["your-kick", "synth-what-is-sound", "hats"], updatedAt: Date.now(),
  layers: [
    layer("drums", "your-kick", hit(36, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 1)),
    layer("hats", "hats", hit(42, [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5, 13.5, 14.5, 15.5], 0.6, 0.1)),
    layer("lead", "synth-what-is-sound", [[57, 0], [60, 1.5], [64, 3], [62, 4], [60, 5.5], [57, 7], [57, 8], [60, 9.5], [64, 11], [67, 12], [64, 13.5], [62, 15]].map(([note, start]) => ({ note, start, vel: 0.8, len: 1 }))),
  ],
};
const done = Object.fromEntries(["your-kick", "synth-what-is-sound", "hats"].map(s => [s, { score: 90, at: Date.now() - 3600e3 }]));
const progress = (withSong) => ({ onboardingDone: true, selectedWorld: "producer", completedMissions: withSong ? done : {}, xp: withSong ? 340 : 0, streakDays: withSong ? 3 : 0 });

const seen = Object.fromEntries(["home", "lesson", "studio", "practice", "dj", "library", "syllabus"].map(s => [`ccd.walk.${s}`, "1"]));
const doneList = ["tempo-bpm", "set-your-tempo", "bars-time-signatures", "note-values", "your-kick", "synth-what-is-sound", "hats"];
const store = {
  "ccd.progress.v2": { onboardingDone: true, selectedWorld: "producer", completedMissions: Object.fromEntries(doneList.map(s => [s, { score: 90, at: Date.now() - 3600e3 }])), xp: 340, streakDays: 3 },
  "ccd.track.v2": song, "ccd.songs.v1": { v: 1, active: "a1", songs: [{ id: "a1", name: "night bus", updatedAt: Date.now() - 3600e3 }] }, ...seen,
};
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
async function shot(name, url, { steps = 0, full = true, wait = 2000, act, big = false } = {}) {
  if (only && !only.includes(name)) return;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, colorScheme: "dark" });
  const p = await ctx.newPage();
  p.on("pageerror", e => console.log(`  ${name} pageerror`, e.message.slice(0, 160)));
  await p.addInitScript(s => {
    if (sessionStorage.getItem("__seeded")) return;
    sessionStorage.setItem("__seeded", "1");
    for (const [k, v] of Object.entries(s)) localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));
  }, big ? { ...store, "ccd.textsize": "big" } : store);
  await p.goto(base + url, { waitUntil: "load", timeout: 180000 });
  await p.waitForTimeout(wait);
  for (let i = 0; i < steps; i++) { const go = p.locator(".ls-bottom .m1-g > :last-child").first(); if (await go.count()) { await go.click().catch(() => {}); await p.waitForTimeout(900); } }
  const close = p.getByRole("button", { name: /^close$/i });
  if (await close.count()) await close.first().click().catch(() => {});
  const skip = p.getByRole("button", { name: /^skip$/i });
  if (await skip.count()) await skip.first().click().catch(() => {});
  await p.waitForTimeout(300);
  if (act) await act(p);
  await p.screenshot({ path: `${out}/${tag}-${W}-${name}.png`, fullPage: full });
  console.log(`${name} ok`);
  await ctx.close();
}
await shot("studio", "/studio", { full: false });
await shot("studio-played", "/studio", { full: false, act: async p => { await p.evaluate(() => (document.querySelector(".st-transport [aria-label=Play]"))?.click()); await p.waitForTimeout(1200); } });
await shot("dj", "/dj", { full: false });
await shot("practice", "/gym");
await shot("library", "/atlas");
await shot("shape", "/learn/hats", { steps: 2, full: false });
await shot("home", "/dashboard");
await shot("lesson-play", "/learn/tempo-bpm", { steps: 3, full: false });
await shot("lesson-start", "/learn/tempo-bpm", { full: false });
await shot("settings", "/settings");
await shot("studio-big", "/studio", { full: false, big: true });
await shot("home-big", "/dashboard", { full: false, big: true });
await b.close();
