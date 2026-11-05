// Shots of the screens the improvement check touched. Usage: node scripts/shots/pass-shots.mjs <base> <out>
import { chromium } from "playwright";
const base = process.argv[2] ?? "http://localhost:3000", out = process.argv[3] ?? "shots";
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const go = async p => { await p.locator(".ls-bottom .m1-g > :last-child").first().click(); await p.waitForTimeout(700); };
const shots = [
  ["studio", "/studio", 0, 7000],
  ["roll", "/learn/midi-piano-roll", 2, 1500],
  ["lfo", "/learn/synth-lfo", 2, 2500],
  ["sync", "/learn/sync-function", 2, 1500],
  ["slicing", "/learn/slicing", 2, 2500],
  ["playin", "/learn/tempo-bpm", 2, 1200],
  ["dash", "/dashboard", 0, 2500],
];
for (const [w, h] of [[390, 844], [1440, 900]]) for (const [name, url, steps, wait] of shots) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: "dark" }); const p = await ctx.newPage(); const errs = [];
  p.on("pageerror", e => errs.push(e.message.slice(0, 120)));
  await p.goto(base + url, { waitUntil: "load" }); await p.waitForTimeout(1200);
  for (let i = 0; i < steps; i++) await go(p);
  await p.waitForTimeout(wait);
  await p.screenshot({ path: `${out}/${name}-${w}.png` });
  console.log(`${name} ${w}${errs.length ? " ERR " + errs.join("; ") : " ok"}`);
  await ctx.close();
}
await b.close();
