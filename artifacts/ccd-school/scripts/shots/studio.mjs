// Renders Studio at 390x844 in the states drawn on the canvas, for checking by eye.
// Usage: node scripts/shots/studio.mjs [base url] [out dir]
import { chromium } from "playwright";

const base = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? "/tmp/studio-shots";
const theme = process.argv[4] ?? "dark";

const kick = [0, 1, 2, 3].map(b => ({ note: 36, vel: 1, start: b, len: 0.2 }));
const snare = [1, 3].map(b => ({ note: 38, vel: 0.9, start: b, len: 0.2 }));
const hat = [0, 1, 2, 3].map(b => ({ note: 42, vel: 0.7, start: b + 0.5, len: 0.1 }));
const bass = [[0.25, 33], [0.75, 33], [1.25, 45], [1.5, 43], [2.25, 36], [2.75, 33], [3.25, 40], [3.5, 38]].map(([start, note]) => ({ note, vel: 0.9, start, len: 0.25 }));
const layer = (id, type, events, extra = {}) => ({ id, type, events, params: {}, mute: false, solo: false, duck: { src: null, note: null }, surface: "pads", pad: 0, variant: 0, ...extra });
const track = {
  v: 2, bpm: 120, root: 45, scale: "minor", swing: 0, loop: 4, added: [], updatedAt: Date.now(),
  layers: [
    layer("d", "drums", [...kick, ...snare, ...hat]),
    layer("h", "hats", hat),
    layer("b", "bass", bass, { surface: "keys", duck: { src: "d", note: 36 }, params: { 11: 0.6 } }),
    layer("c", "chords", []),
    layer("l", "lead", []),
    layer("f", "fx", []),
  ],
};

const states = [
  { name: "drums-pads", sel: 0 },
  { name: "drums-steps", sel: 0, surface: "steps" },
  { name: "drums-keys", sel: 0, surface: "keys" },
  { name: "bass-keys", sel: 2, bank: "mix" },
  { name: "bass-pads", sel: 2, surface: "pads" },
  { name: "bass-steps", sel: 2, surface: "steps" },
];

const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const errors = [];
for (const s of states) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, colorScheme: theme });
  const p = await ctx.newPage();
  p.on("pageerror", e => errors.push(`${s.name}: ${e.message}`));
  const t = structuredClone(track);
  if (s.surface) t.layers[s.sel].surface = s.surface;
  await p.addInitScript(([tr, th]) => {
    localStorage.setItem("ccd.track.v2", JSON.stringify(tr));
    localStorage.setItem("ccd.theme", th);
  }, [t, theme]);
  await p.goto(`${base}/studio`, { waitUntil: "networkidle", timeout: 120000 });
  await p.waitForTimeout(400);
  await p.locator(".st-slot").nth(s.sel).click();
  if (s.bank) await p.locator(`.st-bank button:has-text("${s.bank}")`).click();
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${out}/${s.name}.png` });
  await ctx.close();
}
console.log(errors.length ? errors.join("\n") : "no page errors");
await b.close();
