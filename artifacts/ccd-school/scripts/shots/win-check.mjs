// Tries to meet the first play step's goal by recording four kicks on the beat, to see the win. Usage: node scripts/shots/win-check.mjs <out>
import { chromium } from "playwright";
const out = process.argv[2] ?? "/tmp/win";
const base = process.env.BASE ?? "http://localhost:3000";
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: "dark" });
const p = await ctx.newPage();
await p.addInitScript(() => {
  if (sessionStorage.getItem("__seeded")) return;
  sessionStorage.setItem("__seeded", "1");
  localStorage.setItem("ccd.progress.v2", JSON.stringify({ onboardingDone: true, selectedWorld: "fundamentals", completedMissions: {}, xp: 0, streakDays: 0 }));
  for (const s of ["home", "lesson", "studio"]) localStorage.setItem(`ccd.walk.${s}`, "1");
});
await p.goto(`${base}/learn/tempo-bpm`, { waitUntil: "load", timeout: 180000 });
await p.waitForTimeout(1500);
for (let i = 0; i < 3; i++) { await p.locator(".ls-bottom .m1-g > :last-child").first().click(); await p.waitForTimeout(900); }
// tap in time with the engine's own beat: watch the playhead position the page reports
await p.evaluate(() => (document.querySelector('[aria-label="Record with a one bar count-in"]'))?.click());
const kick = p.getByRole("button", { name: /^kick/ }).first();
await kick.focus();
let hits = 0, last = -1;
const t0 = Date.now();
while (hits < 4 && Date.now() - t0 < 12000) {
  const st = await p.evaluate(() => document.querySelector(".fl-gnowt")?.textContent ?? "");
  if (/recording|now|tap/.test(st) && !/count-in/.test(st)) {
    const now = Date.now();
    if (last < 0 || now - last >= 495) { await p.keyboard.down("Enter"); await p.waitForTimeout(60); await p.keyboard.up("Enter"); last = now; hits++; }
  }
  await p.waitForTimeout(10);
}
await p.waitForTimeout(Number(process.env.WAIT ?? 1500));
console.log("card:", (await p.locator(".fl-gnow").first().innerText().catch(() => "")).replace(/\s+/g, " "));
await p.screenshot({ path: `${out}/win.png` });
await b.close();
