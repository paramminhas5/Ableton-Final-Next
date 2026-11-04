// The dj mixer lessons: do each goal with the keyboard and check go unlocks. Usage: node scripts/shots/mix-smoke.mjs <out>
import { chromium } from "playwright";
const out = process.argv[2] ?? "shots";
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const log = [];
for (const [slug, act] of [
  ["dj-equipment", async p => { await press(p, "Crossfader", "ArrowRight", 60); await press(p, "Crossfader", "ArrowLeft", 60); }],
  ["tempo-bpm-dj", async p => {
    for (let i = 0; i < 200; i++) {
      const t = await p.locator(".mx-decks").innerText();
      const [a, bb] = [...t.matchAll(/([\d.]+) bpm/g)].map(m => Number(m[1]));
      if (Math.abs(a - bb) <= 0.3) break;
      await press(p, "Deck b tempo", bb > a ? "ArrowLeft" : "ArrowRight", 1);
    }
  }],
  ["eq-mixing-dj", async p => { await press(p, "deck b", "ArrowUp", 60); await press(p, "low a", "ArrowDown", 60); }],
  ["long-mix-blend", async p => { await press(p, "Crossfader", "Home", 1); await press(p, "Crossfader", "End", 1); }],
  ["key-detection-dj", async p => { for (const n of ["warm up", "smooth", "long roller", "tool", "skywalker", "space bass", "fast one"]) { await p.getByRole("radio", { name: new RegExp("^" + n) }).click(); await p.waitForTimeout(150); if (/fits/.test(await p.locator(".mx-decks").innerText())) break; } }],
  ["effects-performance-dj", async p => { await press(p, "echo a", "ArrowUp", 60); await press(p, "deck a", "ArrowDown", 60); }],
  ["your-first-mix", async p => { await press(p, "deck b", "ArrowUp", 60); await press(p, "low a", "ArrowDown", 60); await press(p, "Crossfader", "ArrowRight", 60); }],
]) {
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: "dark" }); const p = await ctx.newPage(); const errs = [];
    p.on("pageerror", e => errs.push(e.message));
    await p.goto(`http://localhost:3000/learn/${slug}`, { waitUntil: "load" }); await p.waitForTimeout(1200);
    await p.locator(".ls-bottom .m1-g > :last-child").first().click(); await p.waitForTimeout(800);
    const before = await p.locator(".ls-bottom .m1-g > :last-child").first().innerText();
    await act(p); await p.waitForTimeout(400);
    const after = await p.locator(".ls-bottom .m1-g > :last-child").first().innerText();
    await p.screenshot({ path: `${out}/mix-${slug}-${w}.png` });
    log.push(`${slug} ${w}: go "${before.trim()}" -> "${after.trim()}" | ${(await p.locator(".mx-decks").innerText()).replace(/\s+/g, " ")}${errs.length ? " ERR " + errs.join(";") : ""}`);
    await ctx.close();
  }
}
async function press(p, name, key, n) { const el = p.getByRole("slider", { name, exact: true }); await el.focus(); for (let i = 0; i < n; i++) await p.keyboard.press(key); }
console.log(log.join("\n")); await b.close();
