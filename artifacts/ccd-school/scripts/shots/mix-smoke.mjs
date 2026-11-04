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
  ["long-mix-blend", async p => { await cutOnTheOne(p); }],
  ["key-detection-dj", async p => {
    for (const n of ["warm up", "smooth", "long roller", "tool", "skywalker", "space bass", "fast one"]) { await p.getByRole("radio", { name: new RegExp("^" + n) }).click(); await p.waitForTimeout(150); if (/fits/.test(await p.locator(".mx-decks").innerText())) return; }
    // No bank track fits this song's key: shift deck b's key, as the hint says.
    for (let i = 0; i < 12 && !/fits/.test(await p.locator(".mx-decks").innerText()); i++) await p.getByRole("button", { name: /^key b \+/ }).click();
  }],
  ["effects-performance-dj", async p => { await press(p, "echo a", "ArrowUp", 60); await press(p, "deck a", "ArrowDown", 60); }],
  ["sync-function", async p => { await p.getByRole("button", { name: "sync b", exact: true }).click(); }],
  ["loop-function-dj", async p => { await p.getByRole("button", { name: "loop 4", exact: true }).click(); await press(p, "deck b", "ArrowUp", 60); }],
  ["loop-performance-dj", async p => { await p.getByRole("button", { name: /^cue 3/ }).click(); await p.waitForTimeout(300); await p.getByRole("button", { name: /^cue 4/ }).click(); }],
  ["stem-djing", async p => { await p.getByRole("button", { name: "drums b stem" }).click(); await press(p, "deck b", "ArrowUp", 60); await press(p, "deck a", "ArrowUp", 10); }],
  ["harmonic-key-shift-dj", async p => {
    for (let i = 0; i < 12 && !/fits/.test(await p.locator(".mx-decks").innerText()); i++) await p.getByRole("button", { name: /^key b \+/ }).click();
    await p.getByRole("button", { name: "sync b", exact: true }).click();
  }],
  ["crossfader-technique", async p => { if (!/sharp/.test(await p.locator(".mx-tools").innerText())) await p.getByRole("button", { name: /^curve/ }).click(); await cutOnTheOne(p); }],
  ["recording-your-set-dj", async p => { await p.getByRole("button", { name: "record mix", exact: true }).click(); await p.waitForTimeout(1500); await p.getByRole("button", { name: "stop recording", exact: true }).click(); await p.waitForTimeout(800); }],
  ["music-library-dj", async () => {}],
  ["your-first-mix", async p => { await press(p, "deck b", "ArrowUp", 60); await press(p, "low a", "ArrowDown", 60); await press(p, "Crossfader", "ArrowRight", 60); }],
]) {
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: "dark" }); const p = await ctx.newPage(); const errs = [];
    p.on("pageerror", e => errs.push(e.message));
    await p.goto(`${process.env.BASE ?? "http://localhost:3000"}/learn/${slug}`, { waitUntil: "load" }); await p.waitForTimeout(1200);
    // Click on until the mixer is on screen (hear and say steps come first in some lessons).
    for (let i = 0; i < 4 && !(await p.locator(".mx-decks").count()); i++) { await p.locator(".ls-bottom .m1-g > :last-child").first().click(); await p.waitForTimeout(800); }
    const before = await p.locator(".ls-bottom .m1-g > :last-child").first().innerText();
    await act(p); await p.waitForTimeout(400);
    const after = await p.locator(".ls-bottom .m1-g > :last-child").first().innerText();
    await p.screenshot({ path: `${out}/mix-${slug}-${w}.png` });
    log.push(`${slug} ${w}: go "${before.trim()}" -> "${after.trim()}" | ${(await p.locator(".mx-decks").innerText()).replace(/\s+/g, " ")}${errs.length ? " ERR " + errs.join(";") : ""}`);
    await ctx.close();
  }
}
/** A person tries the cut again until it lands on the one: back to a, then slam to b. */
async function cutOnTheOne(p) {
  for (let i = 0; i < 30 && /not yet/.test(await p.locator(".ls-bottom .m1-g > :last-child").first().innerText()); i++) {
    await press(p, "Crossfader", "Home", 1); await p.waitForTimeout(90 + (i * 37) % 200); await press(p, "Crossfader", "End", 1); await p.waitForTimeout(120);
  }
}
async function press(p, name, key, n) { const el = name === "Deck b tempo" ? p.getByRole("slider", { name: /^Deck b tempo/ }) : p.getByRole("slider", { name, exact: true }); await el.focus(); for (let i = 0; i < n; i++) await p.keyboard.press(key); }
console.log(log.join("\n")); await b.close();
