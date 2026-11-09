// Records the first-visit tour clips: the real app, driven by script, with a finger drawn where it taps.
// Usage: node scripts/shots/tour-clips.mjs <rawdir> [learn,practice,studio,dj,library]
// Writes <rawdir>/<product>/NNNNN.jpg + frames.json (wall-clock seconds per frame) and <rawdir>/marks.json.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
const [raw, only = "learn,practice,studio,dj,library"] = process.argv.slice(2);
mkdirSync(raw, { recursive: true });
const base = process.env.BASE ?? "http://localhost:3000";
const hit = (note, starts, vel = 0.9, len = 0.2) => starts.map(start => ({ note, vel, start, len }));
const layer = (type, from, events) => ({ id: `${type}-${from}`, type, events, params: {}, mute: false, solo: false, duck: { src: null, note: null }, surface: type === "drums" || type === "hats" ? "pads" : "keys", pad: 0, from, world: "producer", variant: 0 });
const song = { v: 2, bpm: 122, root: 45, scale: "minor", swing: 0, loop: 16, added: ["your-kick", "synth-what-is-sound"], updatedAt: Date.now(), layers: [
  layer("drums", "your-kick", [...hit(36, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], 1), ...hit(39, [1, 3, 5, 7, 9, 11, 13, 15], 0.8)].sort((a, b) => a.start - b.start)),
  layer("lead", "synth-what-is-sound", [[57, 0], [60, 1.5], [64, 3], [62, 4], [60, 5.5], [57, 7], [57, 8], [60, 9.5], [64, 11], [67, 12], [64, 13.5], [62, 15]].map(([note, start]) => ({ note, start, vel: 0.8, len: 1 }))),
] };
const seen = Object.fromEntries(["home", "lesson", "studio", "dj", "practice", "syllabus", "wiki"].map(s => [`ccd.walk.${s}`, "1"]));
const done = s => Object.fromEntries(s.map(x => [x, { score: 90, at: Date.now() - 3600e3 }]));
const store = (d) => ({ ...seen, "ccd.track.v2": song, "ccd.songs.v1": { v: 1, active: "a1", songs: [{ id: "a1", name: "night bus", updatedAt: Date.now() }] }, "ccd.studio.seeded": "1", "ccd.progress.v2": { onboardingDone: true, selectedWorld: "producer", completedMissions: done(d), xp: 120, streakDays: 0 } });
const finger = () => {
  let f;
  const get = () => {
    if (f && f.isConnected) return f;
    f = document.createElement("div");
    Object.assign(f.style, { position: "fixed", left: "-60px", top: "-60px", width: "40px", height: "40px", margin: "-20px 0 0 -20px", borderRadius: "50%", background: "rgba(255,255,255,.30)", border: "2px solid rgba(255,255,255,.9)", boxShadow: "0 0 0 8px rgba(255,255,255,.10), 0 4px 14px rgba(0,0,0,.4)", pointerEvents: "none", zIndex: "2147483647", opacity: "0", transition: "opacity 140ms, transform 90ms" });
    document.documentElement.appendChild(f);
    return f;
  };
  const mv = e => { const d = get(); d.style.left = `${e.clientX}px`; d.style.top = `${e.clientY}px`; };
  addEventListener("pointerdown", e => { mv(e); const d = get(); d.style.opacity = "1"; d.style.transform = "scale(.8)"; }, true);
  addEventListener("pointermove", e => { mv(e); if (e.buttons) get().style.opacity = "1"; }, true);
  addEventListener("pointerup", () => { const d = get(); d.style.transform = "scale(1)"; setTimeout(() => { d.style.opacity = "0"; }, 280); }, true);
};
const marks = existsSync(`${raw}/marks.json`) ? JSON.parse(readFileSync(`${raw}/marks.json`, "utf8")) : {};
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });

async function session(name, url, d, run) {
  // Frames come from Chrome's own screencast at device pixels (Playwright's recorder keeps CSS pixels: too soft).
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: "dark" });
  const p = await ctx.newPage();
  const dir = `${raw}/${name}`; rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
  const frames = [];
  const cdp = await ctx.newCDPSession(p);
  cdp.on("Page.screencastFrame", f => { const i = frames.length; frames.push(f.metadata.timestamp); writeFileSync(`${dir}/${String(i).padStart(5, "0")}.jpg`, Buffer.from(f.data, "base64")); void cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {}); });
  const cast = () => cdp.send("Page.startScreencast", { format: "jpeg", quality: 88, maxWidth: 780, maxHeight: 1688, everyNthFrame: 1 }).catch(() => {});
  await cast();
  const t0 = Date.now();
  p.on("pageerror", e => console.log(`  ${name} pageerror`, e.message.slice(0, 160)));
  await p.addInitScript(([s]) => { if (sessionStorage.getItem("__s")) return; sessionStorage.setItem("__s", "1"); localStorage.setItem("ccd.mode", "dark"); for (const [k, v] of Object.entries(s)) localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)); }, [store(d)]);
  await p.addInitScript(finger);
  await p.goto(base + url, { waitUntil: "load", timeout: 120000 });
  await p.waitForTimeout(2200);
  const m = {};
  const at = () => Date.now() / 1000;
  const W = ms => p.waitForTimeout(ms);
  const center = async loc => { await loc.evaluate(e => { const r = e.getBoundingClientRect(); if (r.top < 0 || r.bottom > innerHeight - 150) e.scrollIntoView({ block: "center" }); }, null, { timeout: 4000 }).catch(() => {}); await p.waitForTimeout(150); const r = await loc.boundingBox({ timeout: 4000 }).catch(() => null); return r ? [r.x + r.width / 2, r.y + r.height / 2] : null; };
  const tap = async (loc, hold = 90) => { const c = await center(loc); if (!c) { console.log("  miss", name); return; } await p.mouse.move(c[0], c[1], { steps: 6 }); await p.mouse.down(); await W(hold); await p.mouse.up(); };
  const drag = async (loc, dx, dy, ms = 900) => { const c = await center(loc); if (!c) { console.log("  miss drag", name); return; } await p.mouse.move(c[0], c[1], { steps: 5 }); await p.mouse.down(); const n = Math.max(8, Math.round(ms / 30)); for (let i = 1; i <= n; i++) { await p.mouse.move(c[0] + (dx * i) / n, c[1] + (dy * i) / n); await W(ms / n); } await p.mouse.up(); };
  await run({ p, W, tap, drag, center, cast, mark: k => { m[k] = at(); void p.screenshot({ path: `${raw}/${name}-${k}.png` }).catch(() => {}); } });
  await W(400);
  await cdp.send("Page.stopScreencast").catch(() => {});
  await ctx.close();
  writeFileSync(`${dir}/frames.json`, JSON.stringify(frames));
  marks[name] = m;
  console.log(name, JSON.stringify(m));
}

const role = (p, name, r = "button") => p.getByRole(r, { name, exact: true }).first();
if (only.includes("learn")) await session("learn", "/learn/hats", ["your-kick", "synth-what-is-sound"], async ({ p, W, tap, drag, mark }) => {
  mark("a0"); await W(900);
  await tap(p.locator(".fl-bottom .is-wide, .ls-bottom .is-wide").first()); await W(1000);
  // hits on every "and" after the four-click count-in, timed from the moment rec is pressed
  await tap(p.getByRole("button", { name: /^Record/ }).first());
  const beat = 60000 / 122;
  await p.waitForFunction(() => /count in · 2/.test(document.querySelector(".m1-glass")?.textContent ?? ""), null, { timeout: 15000, polling: 8 }).catch(() => {});
  const pb = await role(p, "open hat").boundingBox(); const pad = [pb.x + pb.width / 2, pb.y + pb.height / 2];
  await p.mouse.move(pad[0], pad[1], { steps: 8 });
  await p.waitForFunction(() => /recording · beat 1 of/.test(document.querySelector(".m1-glass")?.textContent ?? ""), null, { timeout: 15000, polling: 8 }).catch(() => {});
  const t = Date.now();
  for (let k = 0; k < 4; k++) { const due = t + beat / 2 + k * beat - 40; while (Date.now() < due) await W(4); await p.mouse.down(); await W(60); await p.mouse.up(); }
  await W(700); mark("a1"); mark("b0");
  await tap(p.locator(".fl-bottom .is-wide, .ls-bottom .is-wide").first()); await W(1800);
  await drag(p.getByRole("slider", { name: /decay/i }).first(), 0, -60, 1200); await W(500);
  await drag(p.getByRole("slider", { name: /decay/i }).first(), 0, 90, 1200); await W(1200);
  mark("b1");
});
if (only.includes("practice")) await session("practice", "/gym", ["your-kick", "synth-what-is-sound", "hats"], async ({ p, W, tap, mark }) => {
  mark("a0"); await W(1000);
  await tap(p.locator(".ls-pad", { hasText: "copy by ear" }).first()); await W(2600);
  mark("a1"); mark("b0");
  await tap(p.locator(":is(button,[role=radio]):visible", { hasText: "yours" }).first()); await W(500);
  for (const s of [1, 5, 9, 13]) { await tap(p.locator(`[aria-label="kick, step ${s}"]:visible`).first()); await W(380); }
  await tap(p.locator(":is(button,[role=radio]):visible", { hasText: "the target" }).first()); await W(1300);
  await tap(p.locator("[aria-label='Check your notes']:visible, button:visible:has-text('check')").first()); await W(2600);
  mark("b1");
});
if (only.includes("studio")) await session("studio", "/studio?all=1", ["your-kick", "synth-what-is-sound", "hats"], async ({ p, W, tap, drag, mark }) => {
  mark("a0"); await W(600);
  for (const n of ["kick", "closed hat", "clap", "closed hat", "kick", "open hat", "clap", "closed hat"]) { await tap(role(p, n), 70); await W(190); }
  await drag(p.getByRole("slider", { name: /decay/i }).first(), 0, -70, 900); await W(500);
  mark("a1"); mark("b0");
  const arr = p.locator("[role=radio]:visible", { hasText: "arrange" }).first();
  await tap(arr); await W(1100);
  await tap(p.locator("button:visible", { hasText: /to a new section/ }).first()); await W(1000);
  await tap(arr); await W(2000);
  await tap(p.locator("button:visible", { hasText: "to live" }).first()); await W(1800);
  mark("b1");
});
if (only.includes("dj")) await session("dj", "/dj?all=1", ["your-kick", "synth-what-is-sound", "hats", "what-is-djing"], async ({ p, W, tap, drag, mark }) => {
  mark("a0"); await W(500);
  await tap(role(p, "Play deck a")); await W(1000);
  await tap(role(p, "Play deck b")); await W(700);
  await drag(p.getByRole("slider", { name: "crossfader" }), 120, 0, 2400); await W(700);
  mark("a1"); mark("b0");
  await drag(p.getByRole("slider", { name: "low a" }), 0, 60, 900); await W(300);
  await drag(p.getByRole("slider", { name: "tempo deck b" }), 0, -30, 900); await W(300);
  await tap(role(p, "Sync deck b")); await W(900);
  await drag(p.getByRole("slider", { name: "crossfader" }), -120, 0, 1800); await W(800);
  mark("b1");
});
if (only.includes("library")) await session("library", "/atlas", ["your-kick", "synth-what-is-sound", "hats"], async ({ p, W, tap, mark, cast }) => {
  mark("a0"); await W(600);
  await tap(p.locator("#lb-q")); await p.keyboard.type("warm", { delay: 160 }); await W(1500);
  await tap(p.locator(".lb-intent", { hasText: "more space" })); await W(1700);
  mark("a1"); mark("b0");
  await tap(p.locator(".lb-tile", { hasText: "reverb" }).first()); await p.waitForURL(/device/); await cast(); await W(1800);
  await p.locator(".dl-scr").evaluate(e => window.scrollTo({ top: e.getBoundingClientRect().top + window.scrollY - 8 })); await W(500);
  await tap(p.locator(".dl-transport button").first()); await W(600);
  const k = p.locator(".dl-knob [role=slider]");
  for (const [i, dy] of [[0, -70], [1, -50]]) { const c = await k.nth(i).boundingBox(); if (!c) continue; await p.mouse.move(c.x + c.width / 2, c.y + c.height / 2, { steps: 6 }); await p.mouse.down(); for (let j = 1; j <= 26; j++) { await p.mouse.move(c.x + c.width / 2, c.y + c.height / 2 + (dy * j) / 26); await W(36); } await p.mouse.up(); await W(500); }
  const ab = await p.locator(".dl-ab").boundingBox();
  if (ab) for (let j = 0; j < 2; j++) { await p.mouse.move(ab.x + ab.width / 2, ab.y + ab.height / 2, { steps: 6 }); await p.mouse.down(); await W(80); await p.mouse.up(); await W(900); }
  mark("b1");
});
writeFileSync(`${raw}/marks.json`, JSON.stringify(marks, null, 1));
await b.close();
