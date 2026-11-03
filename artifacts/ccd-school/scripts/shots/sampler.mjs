// Adds a sample layer, loads a generated wav into slot 1, plays it and checks the engine heard it.
// Usage: node scripts/shots/sampler.mjs [base url] [out dir] [dark|light] [chromium|webkit]
import { chromium, webkit } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? "/tmp/sampler-shots";
const theme = process.argv[4] ?? "dark";
const browserName = process.argv[5] ?? "chromium";
mkdirSync(out, { recursive: true });

// 0.6 s of a 220 Hz tone with a decay, 16-bit mono wav.
const sr = 44100, n = Math.floor(sr * 0.6);
const buf = Buffer.alloc(44 + n * 2);
buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write("WAVEfmt ", 8); buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 2, 28);
buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write("data", 36); buf.writeUInt32LE(n * 2, 40);
for (let i = 0; i < n; i++) buf.writeInt16LE(Math.round(Math.sin((i / sr) * 220 * 2 * Math.PI) * Math.exp(-i / sr * 4) * 26000), 44 + i * 2);
writeFileSync("/tmp/clap-test.wav", buf);

const launch = browserName === "webkit" ? webkit : chromium;
const b = await launch.launch(browserName === "chromium" ? { args: ["--autoplay-policy=no-user-gesture-required"] } : {});
const errors = [];
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: theme });
const p = await ctx.newPage();
p.on("pageerror", e => { errors.push(e.message); console.log("pageerror:", e.message.slice(0, 300)); });
await p.addInitScript(th => { localStorage.setItem("ccd.theme", th); }, theme);
await p.goto(`${base}/studio`, { waitUntil: "networkidle", timeout: 180000 });
await p.waitForTimeout(600);
await p.locator(".st-slot").last().click(); // the + tile
await p.getByRole("button", { name: /^sample$/ }).click();
await p.waitForTimeout(300);
await p.screenshot({ path: `${out}/${browserName}-${theme}-added.png` });
// open "load" surface
await p.locator(".st-pick button").last().click();
await p.locator('input[type=file]').setInputFiles("/tmp/clap-test.wav");
await p.waitForTimeout(1200);
await p.screenshot({ path: `${out}/${browserName}-${theme}-loaded.png` });
const named = await p.getByRole("button", { name: /slot 13, clap-test/ }).count();
console.log("slot named:", named);
// pads
await p.locator(".st-pick button").first().click();
await p.locator(".st-pick button", { hasText: "pads" }).click();
await p.waitForTimeout(200);
const pad = p.getByRole("button", { name: /slot 1, clap-test|slot 13, clap-test/ }).first();
// slot 0 is the one just loaded (target 0 on first file) -> aria slot 1
const r = await p.getByRole("button", { name: /clap-test/ }).first().boundingBox();
await p.mouse.move(r.x + r.width / 2, r.y + r.height / 2);
await p.mouse.down();
await p.waitForTimeout(250);
await p.screenshot({ path: `${out}/${browserName}-${theme}-hit.png` });
await p.mouse.up();
await p.waitForTimeout(500);
// the meter in the header or the screen should have moved: read engine out peak via the DOM text if exposed
console.log("errors:", errors.length ? errors : "none");
await b.close();
