// Renders Studio's six layer types and their own surfaces at 390x844 and plays them, for checking by eye.
// Usage: node scripts/shots/layers.mjs [base url] [out dir] [dark|light] [chromium|webkit]
import { chromium, webkit } from "playwright";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? "/tmp/layer-shots";
const theme = process.argv[4] ?? "dark";
const browserName = process.argv[5] ?? "chromium";
mkdirSync(out, { recursive: true });

const ev = (note, starts, len = 0.2, vel = 0.9) => starts.map(start => ({ note, vel, start, len }));
const layer = (id, type, events, extra = {}) => ({ id, type, events, params: {}, mute: false, solo: false, duck: { src: null, note: null }, surface: "pads", pad: 0, variant: 0, ...extra });
const track = {
  v: 2, bpm: 120, root: 45, scale: "minor", swing: 0, loop: 4, added: [], updatedAt: Date.now(),
  layers: [
    layer("d", "drums", [...ev(36, [0, 1, 2, 3]), ...ev(38, [1, 3])]),
    layer("h", "hats", ev(42, Array.from({ length: 8 }, (_, i) => i * 0.5 + 0.25), 0.1, 0.6)),
    layer("b", "bass", ev(33, [0.25, 0.75, 1.25, 2.25, 2.75, 3.25], 0.25)),
    layer("c", "chords", [57, 60, 64].map(note => ({ note, vel: 0.7, start: 0, len: 3.5 }))),
    layer("l", "lead", ev(69, [0.5, 1.5, 2.5, 3.5], 0.4, 0.7)),
    layer("f", "fx", ev(41, [0], 0.5, 0.8)),
  ],
};

const launch = browserName === "webkit" ? webkit : chromium;
const b = await launch.launch(browserName === "chromium" ? { args: ["--autoplay-policy=no-user-gesture-required"] } : {});
const errors = [];
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: false, colorScheme: theme });
const p = await ctx.newPage();
p.on("pageerror", e => { errors.push(e.message); console.log("pageerror:", e.message.slice(0, 400)); });
p.on("console", m => { if (m.type() === "error" && !/analytics|favicon|auth|posthog/i.test(m.text())) errors.push(m.text().slice(0, 200)); });
await p.addInitScript(([tr, th]) => {
  if (!sessionStorage.getItem("seeded")) {
    sessionStorage.setItem("seeded", "1");
    localStorage.setItem("ccd.track.v2", JSON.stringify(tr));
  }
  localStorage.setItem("ccd.theme", th);
}, [track, theme]);
await p.goto(`${base}/studio`, { waitUntil: "networkidle", timeout: 180000 });
await p.waitForTimeout(600);
const shot = name => p.screenshot({ path: `${out}/${browserName}-${theme}-${name}.png` });
const slot = i => p.locator(".st-slot").nth(i).click();
const own = () => p.locator(".st-pick button").last().click();
const box = sel => p.locator(sel).first().boundingBox();
const drag = async (sel, pts, hold = 300) => {
  const r = await box(sel);
  await p.mouse.move(r.x + r.width * pts[0][0], r.y + r.height * pts[0][1]);
  await p.mouse.down();
  for (const [x, y] of pts.slice(1)) {
    await p.mouse.move(r.x + r.width * x, r.y + r.height * y, { steps: 6 });
    await p.waitForTimeout(120);
  }
  await p.waitForTimeout(hold);
  await shot(`${sel.replace(/[^a-z]/g, "")}-held`);
  await p.mouse.up();
};

for (const [i, name] of ["drums", "hats", "bass", "chords", "lead", "fx"].entries()) {
  await slot(i);
  await p.waitForTimeout(200);
  await shot(`${name}-pads`);
  await own();
  await p.waitForTimeout(300);
  await shot(`${name}-own`);
}

// Play each own surface.
await slot(2); await own();
await drag(".st-lanes", [[0.1, 0.5], [0.4, 0.5], [0.8, 0.5]]);
await slot(4); await own();
await drag(".st-xy", [[0.2, 0.7], [0.5, 0.3], [0.75, 0.2]]);
await slot(3); await own();
await p.locator(".st-tray .st-sp").nth(1).dispatchEvent("pointerdown", { pointerId: 5, pointerType: "mouse", button: 0 }).catch(() => {});
await p.locator(".st-tray .st-sp").nth(1).dispatchEvent("pointerup", { pointerId: 5 }).catch(() => {});
await drag(".st-strum", [[0.1, 0.5], [0.9, 0.5]]);
await slot(0); await own();
await p.locator(".st-lanetabs button").nth(1).click();
await p.waitForTimeout(100);
await shot("circle-snare");
await slot(1); await own();
{
  const pad = await box(".st-tray .st-sp");
  await p.mouse.move(pad.x + 20, pad.y + 20);
  await p.mouse.down();
  await p.locator(".st-rates button").nth(0).click();
  await p.waitForTimeout(700);
  await shot("rolls-held");
  await p.mouse.up();
}
await slot(5); await own();
await drag(".st-fader", [[0.05, 0.5], [0.7, 0.5]]);

// Steps with 1/32 and four bars on the lead.
await slot(4);
await p.locator(".st-pick button").first().click();
await p.locator(".st-head .st-tag").last().click(); // 1/16 -> 1/32
await p.locator('button[aria-label="4 bars"]').click();
await p.waitForTimeout(200);
await shot("steps-1-32-4bars");

// Songs.
await p.locator('.st-head button[aria-label^="Songs"]').click();
await p.locator(".st-tray + div button:has-text('+ new')").click().catch(() => {});
await p.waitForTimeout(300);
await shot("songs");

console.log(`${browserName} ${theme}: ${errors.length} errors`);
for (const e of errors) console.log("  ", e);
await b.close();
