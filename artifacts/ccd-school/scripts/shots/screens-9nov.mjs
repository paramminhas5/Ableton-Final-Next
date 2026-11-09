// Shots for the 9 Nov "simple first" screens at four sizes, light and dark.
// Usage: node scripts/shots/screens-9nov.mjs <out> <tag> <themes: dark,light> <sizes: 390,820,1180,1440> <scenes: dj,dj-all,...>
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const [out, tag = "after", themes = "dark", sizes = "390", scenes = ""] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const base = process.env.BASE ?? "http://localhost:3000";
const SZ = { 390: [390, 844], 820: [820, 1180], 1180: [1180, 820], 1440: [1440, 900] };
const hit = (note, starts, vel = 0.9, len = 0.2) => starts.map(start => ({ note, vel, start, len }));
const layer = (type, from, events) => ({ id: `${type}-${from}`, type, events, params: {}, mute: false, solo: false, duck: { src: null, note: null }, surface: type === "drums" || type === "hats" ? "pads" : "keys", pad: 0, from, world: "producer", variant: 0 });
const song = { v: 2, bpm: 122, root: 45, scale: "minor", swing: 0, loop: 16, added: ["your-kick", "synth-what-is-sound", "hats"], updatedAt: Date.now(), layers: [
  layer("drums", "your-kick", [...hit(36, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 1), ...hit(39, [1, 3, 5, 7, 9, 11, 13, 15], 0.8)].sort((a, b) => a.start - b.start)),
  layer("hats", "hats", hit(42, [0.5, 1.5, 2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5, 11.5, 12.5, 13.5, 14.5, 15.5], 0.6, 0.1)),
  layer("lead", "synth-what-is-sound", [[57, 0], [60, 1.5], [64, 3], [62, 4], [60, 5.5], [57, 7], [57, 8], [60, 9.5], [64, 11], [67, 12], [64, 13.5], [62, 15]].map(([note, start]) => ({ note, start, vel: 0.8, len: 1 }))),
] };
const done = s => Object.fromEntries(s.map(x => [x, { score: 90, at: Date.now() - 3600e3 }]));
const seen = Object.fromEntries(["home", "lesson", "studio", "dj", "practice", "syllabus", "wiki"].map(s => [`ccd.walk.${s}`, "1"]));
const songs = { v: 1, active: "a1", songs: [{ id: "a1", name: "night bus", updatedAt: Date.now() - 3600e3 }] };
const P = (world, d, xp = 340) => ({ onboardingDone: true, selectedWorld: world, completedMissions: done(d), xp, streakDays: 3, dailyXp: 999, lastActiveDate: new Date().toISOString().slice(0, 10) });
const mine = { "ccd.track.v2": song, "ccd.songs.v1": songs, "ccd.studio.seeded": "1", ...seen };
const S = {
  "dj": ["/dj", { ...mine, "ccd.progress.v2": P("dj", ["what-is-djing", "dj-equipment"]) }],
  "dj-mid": ["/dj", { ...mine, "ccd.progress.v2": P("dj", ["what-is-djing", "dj-equipment", "tempo-bpm-dj", "your-first-mix"]) }],
  "dj-all": ["/dj?all=1", { ...mine, "ccd.progress.v2": P("dj", ["what-is-djing"]) }],
  "dj-tour": ["/dj?tour=1", { ...mine, "ccd.progress.v2": P("dj", ["what-is-djing", "dj-equipment", "tempo-bpm-dj"]) }],
  "studio": ["/studio", { ...mine, "ccd.progress.v2": P("producer", ["your-kick", "synth-what-is-sound", "hats"]) }],
  "studio-all": ["/studio?all=1", { ...mine, "ccd.progress.v2": P("producer", ["your-kick"]) }],
  "studio-arrange": ["/studio?all=1&mode=arrange", { ...mine, "ccd.progress.v2": P("producer", ["your-kick", "synth-what-is-sound", "hats"]) }],
  "studio-tour": ["/studio?tour=1", { ...mine, "ccd.progress.v2": P("producer", ["your-kick", "synth-what-is-sound", "hats"]) }],
  "home": ["/dashboard", { ...mine, "ccd.progress.v2": P("producer", ["your-kick", "synth-what-is-sound", "hats"]) }],
  "home-tour": ["/dashboard?tour=1", { ...mine, "ccd.progress.v2": P("producer", ["your-kick", "synth-what-is-sound", "hats"]) }],
  "lesson-seeded": ["/learn/your-kick", { "ccd.progress.v2": P("producer", []), ...seen, "ccd.studio.seeded": "1", "ccd.track.v2": { v: 2, bpm: 120, root: 45, scale: "minor", swing: 0, loop: 4, added: [], updatedAt: 1, layers: [layer("drums", "starter", hit(36, [0, 1, 2, 3], 1)), layer("bass", "starter", hit(33, [0.25, 0.75, 1.25, 1.75, 2.25, 2.75, 3.25], 0.9, 0.25))] }, "ccd.songs.v1": { v: 1, active: "s1", songs: [{ id: "s1", name: "starter loop", updatedAt: 1, seed: "starter" }] } }],
  "lesson-tour": ["/learn/clap-and-snare?tour=1", { ...mine, "ccd.progress.v2": P("producer", ["your-kick", "synth-what-is-sound", "hats"]) }],
  "practice": ["/practice", { ...mine, "ccd.progress.v2": P("producer", ["your-kick", "synth-what-is-sound", "hats"]) }],
  "syllabus": ["/learn", { ...mine, "ccd.progress.v2": P("producer", ["your-kick", "synth-what-is-sound", "hats"]) }],
  "device": ["/device/reverb", { ...mine, "ccd.progress.v2": P("producer", ["your-kick", "synth-what-is-sound", "hats"]) }],
  "wiki-warm": ["/atlas", { ...mine, "ccd.progress.v2": P("producer", ["your-kick", "synth-what-is-sound", "hats"]) }],
  "wiki": ["/atlas", { ...mine, "ccd.progress.v2": P("producer", ["your-kick", "synth-what-is-sound", "hats"]) }],
  "w00": ["/", {}, 0], "w01": ["/", {}, 1], "w02": ["/", {}, 2], "w03": ["/", {}, 3], "w04": ["/", {}, 4], "w05": ["/", {}, 5], "w06": ["/", {}, 6], "w07": ["/", {}, 7], "w08": ["/", {}, 8], "w09": ["/", {}, 9], "w10": ["/", {}, 10], "w11": ["/", {}, 11],
};
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
for (const th of themes.split(",")) for (const sz of sizes.split(",")) for (const name of (scenes ? scenes.split(",") : Object.keys(S))) {
  const [url, store, steps = 0] = S[name];
  const [w, h] = SZ[sz];
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, colorScheme: th, hasTouch: w < 1300 });
  const p = await ctx.newPage();
  p.on("pageerror", e => console.log(`  ${name} pageerror`, e.message.slice(0, 160)));
  await p.addInitScript(([s, th]) => { if (sessionStorage.getItem("__s")) return; sessionStorage.setItem("__s", "1"); localStorage.setItem("ccd.mode", th); for (const [k, v] of Object.entries(s)) localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)); }, [store, th]);
  await p.goto(base + url, { waitUntil: "load", timeout: 180000 });
  await p.waitForTimeout(1600);
  for (let k = 0; k < steps; k++) { await p.locator(".wl-go button, .wl-go a").first().click(); await p.waitForTimeout(650); }
  if (name.endsWith("-tour")) await p.waitForTimeout(900);
  if (name === "studio-arrange") { await p.getByRole("radio", { name: "arrange" }).click().catch(() => {}); await p.waitForTimeout(500); }
  if (name.startsWith("w") && name.length === 3) await p.waitForTimeout(1300);
  if (name === "wiki-warm") { await p.locator("#lb-q").fill("warm"); await p.waitForTimeout(500); }
  const file = `${out}/${tag}-${th}-${sz}-${name}.png`;
  await p.screenshot({ path: file });
  console.log(file.split("/").pop());
  await ctx.close();
}
await b.close();
