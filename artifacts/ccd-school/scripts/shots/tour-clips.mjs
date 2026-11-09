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
const seen = Object.fromEntries(["home", "lesson", "studio", "dj", "practice", "syllabus", "wiki", "device"].map(s => [`ccd.walk.${s}`, "1"]));
const done = s => Object.fromEntries(s.map(x => [x, { score: 90, at: Date.now() - 3600e3 }]));
const newSeen = Object.fromEntries(Object.keys(JSON.parse(readFileSync(new URL("../../src/content/taught.gen.json", import.meta.url), "utf8")).first).map(k => [`ccd.new.studio:${k}`, "1"]));
const SECS = [{ name: "intro", bars: 4, off: ["lead-synth-what-is-sound"] }, { name: "drop", bars: 4, off: [] }];
const store = (d, secs) => ({ ...seen, ...newSeen, "ccd.dj.upright": "1", "ccd.track.v2": secs ? { ...song, sections: SECS } : song, "ccd.songs.v1": { v: 1, active: "a1", songs: [{ id: "a1", name: "night bus", updatedAt: Date.now() }] }, "ccd.studio.seeded": "1", "ccd.progress.v2": { onboardingDone: true, selectedWorld: "producer", completedMissions: done(d), xp: 120, streakDays: 0 } });
// The finger: rests at the bottom, glides to each control (420 ms, eased), presses with a ring, follows drags closely.
const finger = () => {
  let f, ring;
  const get = () => {
    if (f && f.isConnected) return f;
    f = document.createElement("div");
    // a small, quiet touch mark (10 Nov): a soft white dot with a dark edge, so it reads on light and dark controls
    Object.assign(f.style, { position: "fixed", left: "195px", top: "900px", width: "18px", height: "18px", margin: "-9px 0 0 -9px", borderRadius: "50%", background: "rgba(255,255,255,.9)", boxShadow: "0 0 0 1.5px rgba(0,0,0,.45), 0 3px 8px rgba(0,0,0,.45)", pointerEvents: "none", zIndex: "2147483647", opacity: ".92", transition: "left 420ms cubic-bezier(.25,.8,.3,1), top 420ms cubic-bezier(.25,.8,.3,1), transform 110ms ease-out, opacity 300ms" });
    ring = document.createElement("i");
    Object.assign(ring.style, { position: "absolute", inset: "-1px", borderRadius: "50%", border: "1.5px solid rgba(255,255,255,.85)", opacity: "0", transition: "transform 420ms ease-out, opacity 420ms ease-out" });
    f.appendChild(ring);
    document.documentElement.appendChild(f);
    return f;
  };
  const to = (e, fast) => { const d = get(); d.style.transitionDuration = fast ? "40ms, 40ms, 110ms, 300ms" : ""; d.style.left = `${e.clientX}px`; d.style.top = `${e.clientY}px`; };
  addEventListener("DOMContentLoaded", () => get());
  addEventListener("pointermove", e => to(e, !!e.buttons), true);
  addEventListener("pointerdown", e => { to(e, true); const d = get(); d.style.transform = "scale(.8)"; ring.style.transition = "none"; ring.style.transform = "scale(1)"; ring.style.opacity = ".9"; requestAnimationFrame(() => { ring.style.transition = "transform 420ms ease-out, opacity 420ms ease-out"; ring.style.transform = "scale(2.6)"; ring.style.opacity = "0"; }); }, true);
  addEventListener("pointerup", () => { get().style.transform = "scale(1)"; }, true);
};
// Sound: every connection to the speakers is also sent to a recorder, so each clip carries what the app played.
const tapAudio = () => {
  if (!window.AudioNode || !window.MediaRecorder) return;
  const orig = AudioNode.prototype.connect;
  const recs = new Map();
  window.__audio = [];
  const ensure = ctx => {
    if (recs.has(ctx)) return recs.get(ctx);
    const dest = ctx.createMediaStreamDestination();
    const r = new MediaRecorder(dest.stream, { mimeType: "audio/webm;codecs=opus", audioBitsPerSecond: 128000 });
    const o = { dest, r, chunks: [], t0: 0 };
    r.ondataavailable = e => { if (e.data.size) o.chunks.push(e.data); };
    r.onstart = () => { o.t0 = Date.now(); };
    r.start(200);
    recs.set(ctx, o); window.__audio.push(o);
    return o;
  };
  AudioNode.prototype.connect = function (target, ...rest) {
    const out = orig.call(this, target, ...rest);
    try { if (target instanceof AudioDestinationNode) orig.call(this, ensure(this.context).dest, ...rest); } catch { /* not a node we can tap */ }
    return out;
  };
  window.__dumpAudio = async () => {
    const res = [];
    for (const o of window.__audio) {
      await new Promise(done => { o.r.onstop = done; o.r.stop(); });
      const u = new Uint8Array(await new Blob(o.chunks, { type: "audio/webm" }).arrayBuffer());
      let bin = ""; for (let i = 0; i < u.length; i += 0x8000) bin += String.fromCharCode(...u.subarray(i, i + 0x8000));
      res.push({ t0: o.t0, b64: btoa(bin) });
    }
    return res;
  };
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
  const cast = () => cdp.send("Page.startScreencast", { format: "jpeg", quality: 95, maxWidth: 780, maxHeight: 1688, everyNthFrame: 1 }).catch(() => {});
  await cast();
  const t0 = Date.now();
  p.on("pageerror", e => console.log(`  ${name} pageerror`, e.message.slice(0, 160)));
  await p.addInitScript(([s]) => { if (sessionStorage.getItem("__s")) return; sessionStorage.setItem("__s", "1"); localStorage.setItem("ccd.mode", "dark"); for (const [k, v] of Object.entries(s)) localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v)); }, [store(d, name === "studio")]);
  await p.addInitScript(finger);
  await p.addInitScript(tapAudio);
  await p.goto(base + url, { waitUntil: "load", timeout: 120000 });
  await p.waitForTimeout(2200);
  const m = {};
  const at = () => Date.now() / 1000;
  const W = ms => p.waitForTimeout(ms);
  const center = async loc => { const r = await loc.boundingBox({ timeout: 4000 }).catch(() => null); return r ? [r.x + r.width / 2, r.y + r.height / 2] : null; };
  const glide = async c => { await p.mouse.move(c[0], c[1], { steps: 1 }); await W(480); };
  const tap = async (loc, hold = 110, after = 350) => { const c = await center(loc); if (!c) { console.log("  miss", name); return; } await glide(c); await p.mouse.down(); await W(hold); await p.mouse.up(); await W(after); };
  const drag = async (loc, dx, dy, ms = 1100) => { const c = await center(loc); if (!c) { console.log("  miss drag", name); return; } await glide(c); await p.mouse.down(); const n = Math.max(10, Math.round(ms / 30)); for (let i = 1; i <= n; i++) { const e = i / n; const k = e < 0.5 ? 2 * e * e : 1 - Math.pow(-2 * e + 2, 2) / 2; await p.mouse.move(c[0] + dx * k, c[1] + dy * k); await W(ms / n); } await p.mouse.up(); await W(300); };
  // a horizontal fader follows the finger 1:1: start on its cap, end where the value should be
  const slideTo = async (loc, frac, ms = 1600) => {
    const r = await loc.boundingBox({ timeout: 4000 }).catch(() => null); if (!r) { console.log("  miss slide", name); return; }
    const v = (+(await loc.getAttribute("aria-valuenow")) || 0) / 100;
    const y = r.y + r.height / 2, x0 = r.x + v * r.width, x1 = r.x + frac * r.width;
    await glide([x0, y]); await p.mouse.down();
    const n = Math.max(12, Math.round(ms / 30));
    for (let i = 1; i <= n; i++) { const e = i / n; const k = e < 0.5 ? 2 * e * e : 1 - Math.pow(-2 * e + 2, 2) / 2; await p.mouse.move(x0 + (x1 - x0) * k, y); await W(ms / n); }
    await p.mouse.up(); await W(300);
  };
  const caps = [];
  await run({ p, W, tap, drag, slideTo, center, glide, cast, cap: text => caps.push({ t: at(), text }), mark: k => { m[k] = at(); void p.screenshot({ path: `${raw}/${name}-${k}.png` }).catch(() => {}); } });
  m.caps = caps;
  await W(400);
  const audio = await p.evaluate(() => window.__dumpAudio ? window.__dumpAudio() : []).catch(() => []);
  const tracks = audio.map((a, i) => { writeFileSync(`${dir}/audio${i}.webm`, Buffer.from(a.b64, "base64")); return { file: `audio${i}.webm`, t0: a.t0 / 1000 }; });
  writeFileSync(`${dir}/audio.json`, JSON.stringify(tracks));
  await cdp.send("Page.stopScreencast").catch(() => {});
  await ctx.close();
  writeFileSync(`${dir}/frames.json`, JSON.stringify(frames));
  marks[name] = m;
  console.log(name, JSON.stringify(m));
}

const role = (p, name, r = "button") => p.getByRole(r, { name, exact: true }).first();
const go = p => p.locator(".fl-bottom .is-wide, .ls-bottom .is-wide").first();

if (only.includes("learn")) await session("learn", "/learn/hats", ["your-kick", "synth-what-is-sound"], async ({ p, W, tap, drag, glide, mark, cap }) => {
  await go(p).click(); await W(1600); // onto the play-in before the clip starts: one screen per clip
  mark("a0"); cap("a lesson: the instrument, and what to do"); await W(1600);
  cap("press rec. four clicks count you in");
  await tap(p.getByRole("button", { name: /^Record/ }).first(), 110, 0);
  const beat = 60000 / 122;
  await p.waitForFunction(() => /count in · 2/.test(document.querySelector(".m1-glass")?.textContent ?? ""), null, { timeout: 15000, polling: 8 }).catch(() => {});
  const pb = await role(p, "open hat").boundingBox(); const pad = [pb.x + pb.width / 2, pb.y + pb.height / 2];
  await p.mouse.move(pad[0], pad[1], { steps: 1 });
  await p.waitForFunction(() => /recording · beat 1 of/.test(document.querySelector(".m1-glass")?.textContent ?? ""), null, { timeout: 15000, polling: 8 }).catch(() => {});
  cap("tap the open hat on every \"and\"");
  const t = Date.now();
  for (let k = 0; k < 4; k++) { const due = t + beat / 2 + k * beat - 40; while (Date.now() < due) await W(4); await p.mouse.down(); await W(70); await p.mouse.up(); }
  await W(500); cap("four of four: your hats are in"); await W(1900);
  mark("a1");
  await tap(go(p), 110, 0); await W(1700); // keep it: the next step opens before clip b starts
  mark("b0"); cap("kept. now shape it"); await W(1500);
  cap("decay makes each hat short or long");
  await drag(p.getByRole("slider", { name: /decay/i }).first(), 0, -40, 1300); await W(400);
  await drag(p.getByRole("slider", { name: /decay/i }).first(), 0, 60, 1300);
  cap("the screen draws what the knob is doing"); await W(2200);
  mark("b1");
});

if (only.includes("practice")) await session("practice", "/gym", ["your-kick", "synth-what-is-sound", "hats"], async ({ p, W, tap, glide, mark, cap, center }) => {
  mark("a0"); cap("five minutes a day, picked from your lessons"); await W(1800);
  cap("each drill trains one thing your ears need");
  const c = await center(p.locator(".ls-pad", { hasText: "copy by ear" }).first()); if (c) await glide(c);
  await W(1600);
  cap("open copy by ear"); await W(900);
  mark("a1");
  await p.mouse.down(); await W(110); await p.mouse.up(); await W(2600);
  mark("b0"); cap("listen to the target, then write it down"); await W(1600);
  await tap(p.locator(":is(button,[role=radio]):visible", { hasText: "yours" }).first());
  cap("tap the steps you heard");
  for (const st of [1, 5, 9, 13]) await tap(p.locator(`[aria-label="kick, step ${st}"]:visible`).first(), 90, 120);
  await tap(p.locator(":is(button,[role=radio]):visible", { hasText: "the target" }).first()); await W(900);
  cap("check: it marks every note right or off");
  await tap(p.locator("[aria-label='Check your notes']:visible, button:visible:has-text('check')").first(), 110, 2400);
  mark("b1");
});

if (only.includes("studio")) await session("studio", "/studio?all=1", ["your-kick", "synth-what-is-sound", "hats"], async ({ p, W, tap, drag, mark, cap }) => {
  mark("a0"); cap("the studio: your song on real instruments"); await W(1700);
  cap("play the pads");
  for (const n of ["kick", "closed hat", "clap", "closed hat", "kick", "open hat", "clap", "closed hat"]) await tap(role(p, n), 70, 60);
  await W(300); cap("turn a knob and watch the sound change");
  await drag(p.getByRole("slider", { name: /decay/i }).first(), 0, -45, 1200); await W(1400);
  mark("a1");
  await W(300);
  mark("b0"); cap("press play"); await W(800);
  await tap(p.locator(".st-transport button").first(), 110, 500);
  cap("arrange: your loop as sections");
  await tap(p.locator("[role=radio]:visible", { hasText: "arrange" }).first(), 110, 900);
  cap("switch a part on or off in each section");
  await tap(p.locator('[aria-label^="lead in intro"]:visible').first(), 110, 500);
  await tap(p.locator('[aria-label^="lead in intro"]:visible').first(), 110, 700);
  cap("to live sends your song to Ableton Live");
  await tap(p.locator("button:visible", { hasText: "to live" }).first(), 110, 2200);
  mark("b1");
});

if (only.includes("dj")) await session("dj", "/dj?all=1", ["your-kick", "synth-what-is-sound", "hats", "what-is-djing"], async ({ p, W, tap, drag, slideTo, mark, cap }) => {
  await p.evaluate(() => window.scrollTo({ top: 150 })); await W(700); // decks and mixer in view before the clip starts
  mark("a0"); cap("two decks and a mixer, like a real controller"); await W(1600);
  cap("play deck a: your song");
  await tap(role(p, "Play deck a"), 110, 600);
  cap("play deck b");
  await tap(role(p, "Play deck b"), 110, 500);
  cap("slide the crossfader from a to b");
  await slideTo(p.getByRole("slider", { name: "crossfader" }), 0.96, 2600); await W(1200);
  mark("a1");
  await W(300);
  mark("b0"); cap("turn down the bass on deck a"); await W(600);
  await drag(p.getByRole("slider", { name: "low a" }), 0, 36, 1200);
  cap("match deck b's tempo");
  await drag(p.getByRole("slider", { name: "tempo deck b" }), 0, -30, 1200);
  cap("or press sync");
  await tap(role(p, "Sync deck b"), 110, 700);
  cap("and mix back");
  await slideTo(p.getByRole("slider", { name: "crossfader" }), 0.04, 2000); await W(1200);
  mark("b1");
});

if (only.includes("library")) await session("library", "/atlas", ["your-kick", "synth-what-is-sound", "hats"], async ({ p, W, tap, mark, cap, center, glide }) => {
  mark("a0"); cap("every device in Live, in one place"); await W(1600);
  cap("search by name, or by what you want to hear");
  await tap(p.locator("#lb-q"), 90, 200); await p.keyboard.type("warm", { delay: 170 }); await W(1500);
  cap("more space: the devices that do it");
  await tap(p.locator(".lb-intent", { hasText: "more space" }), 110, 1800);
  mark("a1");
  await p.locator(".lb-tile", { hasText: "reverb" }).first().locator(".lb-tilelink").click();
  await p.waitForURL(/device/); await W(1500);
  await p.evaluate(() => { const e = document.querySelector(".dl-scr"); if (e) window.scrollTo({ top: e.getBoundingClientRect().top + window.scrollY - 8 }); }); await W(900);
  mark("b0"); cap("each device opens on a loop"); await W(1500);
  cap("press play");
  await tap(p.locator(".dl-transport button").first(), 110, 700);
  cap("turn a knob: the screen says what it does");
  const k = p.locator(".dl-knob [role=slider]");
  for (const [i, dy] of [[0, -42], [1, -34]]) { const c = await center(k.nth(i)); if (!c) continue; await glide(c); await p.mouse.down(); for (let j = 1; j <= 30; j++) { await p.mouse.move(c[0], c[1] + (dy * j) / 30); await W(36); } await p.mouse.up(); await W(600); }
  cap("a and b: hear it without, then with");
  await tap(p.locator(".dl-ab"), 110, 1100);
  await tap(p.locator(".dl-ab"), 110, 1500);
  mark("b1");
});
writeFileSync(`${raw}/marks.json`, JSON.stringify(marks, null, 1));
await b.close();
