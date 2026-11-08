// Renders this round's screens at a size and theme, optionally high contrast: remakes (list and a match), the
// gym with its remakes pad, settings with contrast, a lesson step, the studio, all lessons.
// Usage: node scripts/shots/screens.mjs <base> <outdir> [w] [h] [dark|light] [hc:0|1]
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const [base = "http://localhost:3000", out = "/tmp/screens", W = "390", H = "844", theme = "dark", hc = "0"] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const p = await (await b.newContext({ viewport: { width: +W, height: +H }, colorScheme: theme })).newPage();
const errs = []; p.on("pageerror", e => errs.push(e.message.slice(0, 160)));
await p.addInitScript(([th, c]) => { localStorage.setItem("ccd.mode", th); if (c === "1") localStorage.setItem("ccd.contrast", "high"); }, [theme, hc]);
const tag = `${W}-${theme}${hc === "1" ? "-hc" : ""}`;
const go = async (path, name, sel) => { await p.goto(base + path, { waitUntil: "load" }); if (sel) await p.waitForSelector(sel, { timeout: 60000 }); await p.waitForTimeout(900); await p.screenshot({ path: `${out}/${tag}-${name}.png` }); };
await go("/gym/remakes", "remakes", ".rm");
await p.getByRole("button", { name: /^Match a 90s acid line/ }).first().click(); await p.waitForTimeout(700);
await p.getByRole("button", { name: /Check how close/ }).click(); await p.waitForTimeout(2500);
await p.screenshot({ path: `${out}/${tag}-remake-match.png` });
await go("/gym", "gym");
await go("/settings", "settings");
await go("/learn/first-bass", "lesson", ".fl");
await go("/studio", "studio", ".st-root");
await go("/learn", "learn", ".wd-cols");
console.log(`${tag}: ${errs.length} page errors ${errs.join(" | ")}`);
await b.close();
