// Checks "keep what you just played" on the first play step: play the loop without rec, tap the kick,
// keep it, and see the goal count move. Usage: node scripts/shots/capture-check.mjs <out dir>
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
const out = process.argv[2] ?? "/tmp/capture";
mkdirSync(out, { recursive: true });
const base = process.env.BASE ?? "http://localhost:3000";
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: "dark" });
const p = await ctx.newPage();
p.on("pageerror", e => console.log("pageerror", e.message.slice(0, 160)));
await p.addInitScript(() => {
  if (sessionStorage.getItem("__seeded")) return;
  sessionStorage.setItem("__seeded", "1");
  localStorage.setItem("ccd.progress.v2", JSON.stringify({ onboardingDone: true, selectedWorld: "fundamentals", completedMissions: {}, xp: 0, streakDays: 0 }));
  for (const s of ["home", "lesson", "studio"]) localStorage.setItem(`ccd.walk.${s}`, "1");
});
await p.goto(`${base}/learn/tempo-bpm`, { waitUntil: "load", timeout: 180000 });
await p.waitForTimeout(1500);
const go = () => p.locator(".ls-bottom .m1-g > :last-child").first().click();
for (let i = 0; i < 3; i++) { await go(); await p.waitForTimeout(900); }
await p.getByRole("button", { name: "Play the loop" }).click();
await p.waitForTimeout(800);
const kick = p.getByRole("button", { name: /^kick/ }).first();
for (let i = 0; i < 4; i++) { await kick.dispatchEvent("pointerdown", { pointerId: 1, buttons: 1 }); await p.waitForTimeout(80); await kick.dispatchEvent("pointerup", { pointerId: 1 }); await p.waitForTimeout(420); }
await p.waitForTimeout(300);
const keep = p.getByRole("button", { name: /Keep what you just played/ });
console.log("keep key shown:", await keep.count());
await p.screenshot({ path: `${out}/capture-before.png` });
if (await keep.count()) { await keep.click(); await p.waitForTimeout(500); }
console.log("turn:", (await p.locator(".fl-turnhead").first().innerText()).replace(/\s+/g, " "));
await p.screenshot({ path: `${out}/capture-after.png` });
await b.close();
