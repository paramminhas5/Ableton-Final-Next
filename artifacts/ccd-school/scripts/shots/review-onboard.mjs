import { chromium } from "playwright";
const OUT = "/tmp/claude-0/-home-claude/14482081-5c9f-509e-afde-b9b4be190bf9/scratchpad/review1/shots/onb";
import { mkdirSync } from "node:fs"; mkdirSync(OUT, { recursive: true });
const [w, h] = (process.argv[2] ?? "390x844").split("x").map(Number);
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
const errs = []; p.on("pageerror", e => errs.push(e.message));
p.on("response", r => { if (r.status() >= 400) errs.push(r.status() + " " + r.url()); });
await p.goto("http://localhost:3100/", { waitUntil: "load" }); await p.waitForTimeout(2000);
const shot = async n => { await p.screenshot({ path: `${OUT}/${w}-${n}.png` }); };
const clickText = async t => { await p.getByRole("button", { name: t }).first().click(); await p.waitForTimeout(900); };
await clickText(/show me/); await shot("1-learn");
await p.getByRole("button", { name: "Play a kick" }).dispatchEvent("pointerdown"); await p.waitForTimeout(400);
await p.getByRole("button", { name: "Play a kick" }).dispatchEvent("pointerdown"); await p.waitForTimeout(400); await shot("1b-learn-tapped");
await clickText(/next: make/); await shot("2-make");
await clickText(/add a clap/); await p.waitForTimeout(1500); await shot("2b-make-added");
await clickText(/add hats/); await clickText(/add a synth/); await p.waitForTimeout(1200); await shot("2c-make-full");
await clickText(/next: practice/); await shot("3-practice");
await clickText(/play the two notes/); await clickText(/^first$/); await shot("3b-practice-ans");
await clickText(/next: studio/); await shot("4-studio");
// drag knob
const knob = p.locator(".wl-try [role=slider], .wl-row [role=slider]").first();
const kb = await knob.boundingBox(); console.log("knob", kb);
if (kb) { await p.mouse.move(kb.x + kb.width/2, kb.y + kb.height/2); await p.mouse.down(); await p.mouse.move(kb.x + kb.width/2, kb.y - 80, { steps: 10 }); await p.waitForTimeout(600); await shot("4b-studio-knob-drag"); await p.mouse.up(); }
await clickText(/next: mix/); await shot("5-mix");
const fd = p.locator("[role=slider]").first(); const fb = await fd.boundingBox(); console.log("fader", fb);
if (fb) { await p.mouse.move(fb.x + 10, fb.y + fb.height/2); await p.mouse.down(); await p.mouse.move(fb.x + fb.width - 10, fb.y + fb.height/2, { steps: 10 }); await p.mouse.up(); await p.waitForTimeout(800); await shot("5b-mix-moved"); }
await clickText(/that's ccd school/); await shot("6-start");
await clickText(/make my own tracks/); await shot("7-know");
await clickText(/completely new/); await shot("8-explain");
await clickText(/walk me through/); await shot("8b-explain-picked");
await clickText(/take me in/); await p.waitForTimeout(2500); await shot("9-dashboard-tour"); console.log("url", p.url());
await p.screenshot({ path: `${OUT}/${w}-9-dashboard-tour-full.png`, fullPage: true });
const t = await p.evaluate(() => document.body.innerText.slice(0, 1500)); console.log(t);
for (let i = 0; i < 6; i++) {
  const btn = p.locator(".tour button, [class*=tour] button").filter({ hasText: /next|got it|ok|start|go/i }).first();
  if (!(await btn.count())) break;
  const txt = await btn.innerText(); await btn.click(); await p.waitForTimeout(900); await shot(`10-tour-${i}`); console.log("tour btn", txt, p.url());
}
console.log("final url", p.url());
console.log("errs", errs.slice(0, 10));
await b.close();
