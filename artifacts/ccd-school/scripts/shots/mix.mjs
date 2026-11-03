// Renders Studio's mix mode at 390x844 in the states drawn on the canvas (ZStage,
// ZStageFixed, ZCompare, ZFaders), playing through the real engine, for checking by eye.
// Usage: node scripts/shots/mix.mjs [base url] [out dir] [dark|light] [chromium|webkit]
import { chromium, webkit } from "playwright";

const base = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? "/tmp/mix-shots";
const theme = process.argv[4] ?? "dark";
const browserName = process.argv[5] ?? "chromium";

const kick = [0, 1, 2, 3].map(b => ({ note: 36, vel: 1, start: b, len: 0.2 }));
const snare = [1, 3].map(b => ({ note: 38, vel: 0.9, start: b, len: 0.2 }));
const hat = [0, 1, 2, 3].map(b => ({ note: 42, vel: 0.7, start: b + 0.5, len: 0.1 }));
const hats16 = Array.from({ length: 16 }, (_, s) => ({ note: s % 4 === 2 ? 46 : 42, vel: 0.6, start: s * 0.25, len: 0.1 }));
const bass = [[0.25, 33], [0.75, 33], [1.25, 45], [1.5, 43], [2.25, 36], [2.75, 33], [3.25, 40], [3.5, 38]].map(([start, note]) => ({ note, vel: 0.9, start, len: 0.25 }));
const chords = [0, 2].map(b => ({ note: 57, vel: 0.7, start: b, len: 1.8 }));
const lead = [[0.5, 69], [1.5, 72], [2.5, 76], [3.5, 74]].map(([start, note]) => ({ note, vel: 0.7, start, len: 0.4 }));
const fx = [{ note: 54, vel: 0.6, start: 3, len: 0.5 }];
const layer = (id, type, events, extra = {}) => ({ id, type, events, params: {}, mute: false, solo: false, duck: { src: null, note: null }, surface: "pads", pad: 0, variant: 0, ...extra });
// Wire indices: eq.cut 3, tone 7, level 8, pan 9, send 10, duck 11.
const track = {
  v: 2, bpm: 120, root: 45, scale: "minor", swing: 0, loop: 4, added: [], updatedAt: Date.now(),
  layers: [
    layer("d", "drums", [...kick, ...snare, ...hat]),
    layer("h", "hats", hats16, { params: { 9: 0.62 } }),
    layer("b", "bass", bass, { surface: "keys" }),
    layer("c", "chords", chords, { params: { 9: 0.28, 10: 0.45, 3: 0.5 } }),
    layer("l", "lead", lead, { params: { 9: 0.72, 10: 0.2 } }),
    layer("f", "fx", fx, { params: { 9: 0.2, 10: 0.7 } }),
  ],
};

const launch = browserName === "webkit" ? webkit : chromium;
const b = await launch.launch(browserName === "chromium" ? { args: ["--autoplay-policy=no-user-gesture-required"] } : {});
const errors = [];
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: false, colorScheme: theme });
const p = await ctx.newPage();
p.on("pageerror", e => errors.push(e.message));
p.on("console", m => { if (m.type() === "error" && !/analytics|favicon|auth|posthog/i.test(m.text())) errors.push(m.text().slice(0, 200)); });
await p.addInitScript(([tr, th]) => {
  if (!sessionStorage.getItem("seeded")) {
    sessionStorage.setItem("seeded", "1");
    localStorage.setItem("ccd.track.v2", JSON.stringify(tr));
    localStorage.setItem("ccd.mix.view", "stage");
  }
  localStorage.setItem("ccd.theme", th);
}, [track, theme]);
await p.goto(`${base}/studio`, { waitUntil: "networkidle", timeout: 180000 });
await p.waitForTimeout(500);
const shot = async name => {
  await p.screenshot({ path: `${out}/${browserName}-${theme}-${name}.png` });
};

// Stopped: the stage estimates from the knobs.
await p.locator('.st-mode button:has-text("mix")').click();
await p.locator(".st-slot").nth(2).click();
await p.waitForTimeout(600);
await shot("0-stage-stopped");

// Playing: drums and bass clash.
await p.locator('button[aria-label="Play"]').click();
await p.waitForTimeout(4500);
const state = await p.evaluate(() => document.querySelector(".mx-scr-hold")?.textContent ?? "");
console.log(`${browserName} ${theme} playing:`, state.slice(0, 120));
await shot("1-stage-clash");

// Fix it with the first pad.
const pad = p.locator(".mx-fixes button").first();
if (await pad.count()) {
  console.log("fix pad:", await pad.textContent());
  await pad.click();
  await p.waitForTimeout(3500);
}
await shot("2-stage-fixed");

// Hold the stage to compare.
const stage = await p.locator(".mx-stage").boundingBox();
await p.mouse.move(stage.x + 30, stage.y + stage.height - 30);
await p.mouse.down();
await p.waitForTimeout(1500);
await shot("3-compare");
await p.mouse.up();
await p.waitForTimeout(400);

// Faders, bass open.
await p.locator('.mx-views button:has-text("faders")').click();
await p.waitForTimeout(300);
const openBass = p.locator('button[aria-label="Open bass"]');
if (await openBass.count()) await openBass.click();
await p.waitForTimeout(800);
await shot("4-faders");

// Master open.
await p.locator('button[aria-label="Open the master"]').click();
await p.waitForTimeout(800);
await shot("5-master");

await p.locator('button[aria-label="Stop"]').click().catch(() => {});
console.log(errors.length ? errors.join("\n") : "no page errors");
await b.close();
