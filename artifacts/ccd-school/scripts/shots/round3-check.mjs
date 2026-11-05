// Round 3: the drop opens unsolved, the done screen says what changed, hats ask for the "and".
// Usage: BASE=http://localhost:3100 node scripts/shots/round3-check.mjs <out dir>
import { chromium } from "playwright";
const out = process.argv[2], BASE = process.env.BASE ?? "http://localhost:3100";
const L = (id, type, events) => ({ id, type, events, params: {}, mute: false, solo: false, duck: { src: null, note: null }, surface: "pads", pad: 0, variant: 0 });
const song = { v: 2, bpm: 120, root: 45, scale: "minor", swing: 0, loop: 4, added: ["your-kick", "hats"], updatedAt: 1,
  layers: [L("k", "drums", [0, 1, 2, 3].map(s => ({ note: 36, vel: 1, start: s, len: 0.25 }))), L("h", "hats", [0.5, 1.5, 2.5, 3.5].map(s => ({ note: 46, vel: 0.8, start: s, len: 0.25 }))), L("l", "lead", [{ note: 69, vel: 0.9, start: 0, len: 1 }])] };
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
let bad = 0;
for (const [label, w, h, scheme] of [["phone-dark", 390, 844, "dark"], ["desk-light", 1440, 900, "light"]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: scheme });
  const p = await ctx.newPage(); const errs = [];
  p.on("pageerror", e => errs.push(e.message));
  await p.goto(`${BASE}/`, { waitUntil: "load" });
  await p.evaluate(t => { localStorage.setItem("ccd.track.v2", JSON.stringify(t)); sessionStorage.clear(); }, song);
  await p.goto(`${BASE}/learn/the-drop`, { waitUntil: "load" }); await p.waitForTimeout(1500);
  const go = p.locator(".ls-bottom .m1-g > :last-child").first();
  for (let i = 0; i < 12 && (await p.locator(".fl").getAttribute("data-page-kind")) !== "arrange"; i++) { await go.click(); await p.waitForTimeout(500); }
  const aria = await go.getAttribute("aria-label");
  console.log(label, "arrange opens:", aria, "| key text:", (await go.innerText()).replace(/\s+/g, " "));
  if (!/^not yet/i.test(aria ?? "")) { bad++; console.log("  BAD: the drop opened already solved"); }
  await p.screenshot({ path: `${out}/drop-${label}.png` });
  for (const n of ["drums in break", "hats in break"]) await p.locator(`.ar-cell[aria-label^="${n}"]`).first().click();
  console.log(label, "after taking drums out:", await go.getAttribute("aria-label"));
  await go.click(); await p.waitForTimeout(700);
  for (let i = 0; i < 12 && (await p.locator(".fl").getAttribute("data-page-kind")) !== "done"; i++) {
    const skip = p.getByRole("button", { name: "Skip this step" });
    if (await skip.count()) await skip.first().click(); else if (await p.getByText("skip the challenge").count()) await p.getByText("skip the challenge").click(); else await go.click();
    await p.waitForTimeout(600);
  }
  await p.waitForTimeout(1200);
  const changed = await p.locator(".fl-changed").allInnerTexts();
  console.log(label, "done kind:", await p.locator(".fl").getAttribute("data-page-kind"), "| what changed:", changed.join(" / ").replace(/\s+/g, " "), "| a/b:", await p.locator(".fl-ab button").count(), "| overlay:", await p.locator('[role="dialog"]').count());
  if (!changed.length) { bad++; console.log("  BAD: no what-changed line"); }
  await p.screenshot({ path: `${out}/drop-done-${label}.png`, fullPage: true });
  // hats play-in copy
  await p.evaluate(t => { localStorage.setItem("ccd.track.v2", JSON.stringify({ ...t, added: ["your-kick"], layers: t.layers.slice(0, 1) })); sessionStorage.clear(); }, song);
  await p.goto(`${BASE}/learn/hats`, { waitUntil: "load" }); await p.waitForTimeout(1200);
  for (let i = 0; i < 10 && (await p.locator(".fl").getAttribute("data-page-kind")) !== "play"; i++) { await go.click(); await p.waitForTimeout(500); }
  console.log(label, "hats play-in:", (await p.locator(".ls-now, .fl-turnhead").allInnerTexts()).join(" / ").replace(/\s+/g, " "), "| go:", (await go.innerText()).replace(/\s+/g, " "));
  await p.screenshot({ path: `${out}/hats-${label}.png` });
  if (errs.length) { bad++; console.log("  ERR", errs.join("; ")); }
  await ctx.close();
}
await b.close();
console.log(bad ? `${bad} bad` : "all ok");
process.exit(bad ? 1 : 0);
