// Shots for the 9 Nov "song first" design pass: first visit, home with and without a song, a lesson on an
// empty song, the studio on a first visit, the syllabus, the song key, the done screen, the part card.
// Usage: node scripts/shots/song-first.mjs <out dir> <tag: before|after> [dark|light] [chromium|webkit] [width] [only,scenes]
import { chromium, webkit } from "playwright";
import { mkdirSync } from "node:fs";
const [out = "/tmp/song-first", tag = "after", theme = "dark", bn = "chromium", w = "390", onlyArg = ""] = process.argv.slice(2);
const base = process.env.BASE ?? "http://localhost:3000";
const only = onlyArg ? onlyArg.split(",") : null;
mkdirSync(out, { recursive: true });
const W = Number(w), H = W > 600 ? 900 : 844;

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

const b = await (bn === "webkit" ? webkit : chromium).launch(bn === "webkit" ? {} : { args: ["--autoplay-policy=no-user-gesture-required"] });
async function shot(name, url, { store = {}, before, full = false, wait = 900 } = {}) {
  if (only && !only.includes(name)) return;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, colorScheme: theme });
  const p = await ctx.newPage();
  p.on("pageerror", e => console.log(`  ${name} pageerror`, e.message.slice(0, 160)));
  await p.addInitScript(([th, s]) => {
    if (sessionStorage.getItem("__seeded")) return;
    sessionStorage.setItem("__seeded", "1");
    localStorage.setItem("ccd.theme", th);
    for (const [k, v] of Object.entries(s)) localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));
  }, [theme, store]);
  await p.goto(base + url, { waitUntil: "load", timeout: 180000 });
  await p.waitForTimeout(wait);
  if (before) await before(p);
  const file = `${out}/${tag}-${bn}-${theme}-${W}-${name}.png`;
  await p.screenshot({ path: file, fullPage: full });
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  console.log(`${name}: ${file} (page ${h}px)`);
  await ctx.close();
}

const withSong = { "ccd.progress.v2": progress(true), "ccd.track.v2": song, "ccd.songs.v1": { v: 1, active: "a1", songs: [{ id: "a1", name: "night bus", updatedAt: Date.now() - 3600e3 }, { id: "b2", name: "two am", updatedAt: Date.now() - 86400e3 * 2 }] } };
const starter = { v: 2, bpm: 120, root: 45, scale: "minor", swing: 0, loop: 4, added: [], updatedAt: Date.now(), layers: [
  layer("drums", "starter", [...hit(36, [0, 1, 2, 3], 1), ...hit(38, [1, 3]), ...hit(42, [0.5, 1.5, 2.5, 3.5], 0.6, 0.1)].sort((a, c) => a.start - c.start)),
  layer("bass", "starter", [[0.25, 33], [0.75, 33], [1.25, 45], [1.75, 43], [2.25, 36], [2.75, 33], [3.25, 40], [3.5, 38]].map(([start, note]) => ({ note, vel: 0.9, start, len: 0.25 }))),
] };
const seeded = { "ccd.progress.v2": progress(false), "ccd.track.v2": starter, "ccd.studio.seeded": "1", "ccd.songs.v1": { v: 1, active: "s1", songs: [{ id: "s1", name: "starter loop", updatedAt: Date.now(), seed: "starter" }] } };
const fresh = { "ccd.progress.v2": progress(false) };
const click = (sel) => async p => { await p.locator(sel).first().click(); await p.waitForTimeout(700); };

await shot("welcome-1", "/", { wait: 2200 });
await shot("welcome-2", "/", { before: async p => { await p.getByRole("button", { name: /show me|start my song/i }).first().click(); await p.waitForTimeout(800); } });
await shot("home-nosong", "/dashboard", { store: fresh });
await shot("home-song", "/dashboard", { store: withSong, full: true });
await shot("home-song-fold", "/dashboard", { store: withSong });
await shot("home-song-map", "/dashboard", { store: withSong, before: async p => { await p.evaluate(() => window.scrollTo(0, document.querySelector(".hm-b")?.getBoundingClientRect().top + window.scrollY - 60)); await p.waitForTimeout(400); } });
await shot("welcome-2b", "/", { before: async p => { await p.getByRole("button", { name: /start my song/i }).click(); await p.waitForTimeout(600); const pad = p.getByRole("button", { name: "Kick", exact: true }); await pad.dispatchEvent("pointerdown"); await p.waitForTimeout(1200); for (let i = 0; i < 4; i++) { await pad.dispatchEvent("pointerdown"); await p.waitForTimeout(545); } await p.waitForTimeout(200); } });
await shot("welcome-3", "/", { before: async p => { await p.getByRole("button", { name: /start my song/i }).click(); await p.waitForTimeout(500); const pad = p.getByRole("button", { name: "Kick", exact: true }); await pad.dispatchEvent("pointerdown"); await p.waitForTimeout(1200); for (let i = 0; i < 4; i++) { await pad.dispatchEvent("pointerdown"); await p.waitForTimeout(545); } await p.getByRole("button", { name: /keep it in my song/i }).click(); await p.waitForTimeout(700); } });
await shot("welcome-4", "/", { before: async p => { await p.getByRole("button", { name: /start my song/i }).click(); await p.waitForTimeout(500); const pad = p.getByRole("button", { name: "Kick", exact: true }); await pad.dispatchEvent("pointerdown"); await p.waitForTimeout(1200); for (let i = 0; i < 4; i++) { await pad.dispatchEvent("pointerdown"); await p.waitForTimeout(545); } await p.getByRole("button", { name: /keep it in my song/i }).click(); await p.waitForTimeout(500); await p.getByRole("button", { name: /^make my own tracks/ }).click(); await p.waitForTimeout(700); } });
await shot("part-hats-2", "/part/hats", { store: withSong, before: async p => { await p.evaluate(() => window.scrollTo(0, 900)); await p.waitForTimeout(400); } });
await shot("lesson-empty", "/learn/your-kick", { store: fresh, wait: 1500 });
await shot("lesson-song", "/learn/clap-and-snare", { store: withSong, wait: 1500 });
await shot("songkey", "/learn/clap-and-snare", { store: withSong, wait: 1500, before: click('[data-song-key]') });
await shot("lesson-seeded", "/learn/your-kick", { store: seeded, wait: 1500 });
await shot("home-seeded", "/dashboard", { store: seeded });
await shot("studio-first", "/studio", { store: fresh, wait: 1500 });
await shot("studio-learnt", "/studio?learnt=hide", { store: withSong, wait: 1500 });
await shot("studio-marked", "/studio?learnt=mark", { store: withSong, wait: 1500 });
await shot("syllabus", "/learn", { store: withSong });
await shot("syllabus-2", "/learn#your-kick", { store: withSong, wait: 1400 });
// The done screen: the player resumes at a saved step, so walk back from a high step until "lesson done" shows.
await shot("done", "/learn/your-kick", { store: withSong, wait: 1500, before: async p => {
  for (let k = 30; k > 3; k--) {
    await p.evaluate(n => sessionStorage.setItem("ccd.lesson.your-kick", JSON.stringify({ idx: n, at: Date.now() })), k);
    await p.reload({ waitUntil: "load" }); await p.waitForTimeout(900);
    if (await p.getByText("lesson done").count()) break;
  }
} });
await shot("part-hats", "/part/hats", { store: withSong });
await b.close();
