// A brand new visitor opens Studio: pads, a loop in the track, and it plays on the first touch.
// Usage: node scripts/shots/first-visit.mjs [base url] [out dir] [dark|light] [chromium|webkit]
import { chromium, webkit } from "playwright";
import { mkdirSync } from "node:fs";
const base = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? "/tmp/first-visit";
const theme = process.argv[4] ?? "dark";
const name = process.argv[5] ?? "chromium";
mkdirSync(out, { recursive: true });
const b = await (name === "webkit" ? webkit : chromium).launch(name === "chromium" ? { args: ["--autoplay-policy=no-user-gesture-required"] } : {});
const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: theme })).newPage();
const errors = [];
p.on("pageerror", e => errors.push(e.message));
await p.addInitScript(th => localStorage.setItem("ccd.theme", th), theme);
await p.goto(`${base}/studio`, { waitUntil: "networkidle", timeout: 180000 });
await p.waitForTimeout(700);
await p.screenshot({ path: `${out}/${name}-${theme}-0-landing.png` });
await p.locator(".st-tray .st-sp").nth(0).click(); // first touch: a pad
await p.waitForTimeout(2500);
const label = await p.locator(".st-transport button").first().getAttribute("aria-label");
await p.screenshot({ path: `${out}/${name}-${theme}-1-playing.png` });
console.log(`${name} ${theme}: transport says "${label}" after the first touch, ${errors.length} page errors`);
for (const e of errors) console.log("  ", e.slice(0, 200));
await b.close();
