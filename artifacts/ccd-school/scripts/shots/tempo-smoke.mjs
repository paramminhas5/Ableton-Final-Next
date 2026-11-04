// Basics 1 (pulse and tempo): play the kick in, turn the tempo, check the song gets it and the
// engine plays at it, the cat sways only while sound plays. Usage: node scripts/shots/tempo-smoke.mjs <out>
import { chromium } from "playwright";
const out = process.argv[2] ?? "shots";
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
const p = await ctx.newPage(); const log = []; const errs = [];
p.on("pageerror", e => errs.push(e.message));
await p.addInitScript(() => {
  window.__cmds = [];
  const orig = MessagePort.prototype.postMessage;
  MessagePort.prototype.postMessage = function (m, t) { if (m && m.t === "cmds") { const c = Array.from(m.c); for (let i = 0; i < c.length; i += 6) window.__cmds.push(c.slice(i, i + 6)); } return orig.call(this, m, t); };
});
await p.goto("http://localhost:3000/learn/tempo-bpm", { waitUntil: "load" });
await p.waitForTimeout(1500);
const kind = () => p.locator(".fl").getAttribute("data-page-kind");
const go = () => p.locator(".ls-bottom .m1-g > :last-child").first().click();
log.push("1 " + await kind() + " | dancing class on html: " + await p.evaluate(() => document.documentElement.classList.contains("ccd-playing")));
await go(); await p.waitForTimeout(600); log.push("2 " + await kind());
await go(); await p.waitForTimeout(800); log.push("3 " + await kind());
// the play-in itself is the same recorder as the kick lesson (checked there); skip it here
await p.getByRole("button", { name: "Skip this step" }).click(); await p.waitForTimeout(800);
log.push("4 " + await kind());
await p.getByRole("radio", { name: /^128/ }).click(); await p.waitForTimeout(1200);
const tempoCmds = await p.evaluate(() => window.__cmds.filter(c => c[0] === 4 || c[0] === 5).slice(-3));
log.push("   readout: " + (await p.locator(".fl-bpm").innerText()).replace(/\s+/g, " ") + " | last tempo-ish cmds " + JSON.stringify(tempoCmds));
log.push("   cat dancing while playing: " + await p.evaluate(() => document.documentElement.classList.contains("ccd-playing")) + " beat-ms " + await p.evaluate(() => document.documentElement.style.getPropertyValue("--beat-ms")));
await p.screenshot({ path: `${out}/tempo-step.png` });
await go(); await p.waitForTimeout(800);
log.push("5 " + await kind() + " | song bpm " + await p.evaluate(() => JSON.parse(localStorage.getItem("ccd.track.v2") || "{}").bpm));
log.push("   strip: " + (await p.locator(".fl-songname").innerText()).replace(/\s+/g, " "));
console.log(log.join("\n") + (errs.length ? "\nERRORS " + errs.join("; ") : ""));
await b.close();
