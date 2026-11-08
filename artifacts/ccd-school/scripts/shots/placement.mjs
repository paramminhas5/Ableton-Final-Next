// Find your level, walked as a learner who knows drums would: taps in time, copies the pattern, answers the
// ears, tries the match; then checks they land on first bass with the earlier lessons passed and their parts
// in the song. Screenshots each station. Usage: node scripts/shots/placement.mjs <base> <outdir> [w] [h] [dark|light] [chromium|webkit]
import { chromium, webkit } from "playwright";
import { mkdirSync } from "node:fs";
const base = process.argv[2] ?? "http://localhost:3000";
const out = process.argv[3] ?? "/tmp/placement";
const W = Number(process.argv[4] ?? 390), H = Number(process.argv[5] ?? 844);
const theme = process.argv[6] ?? "dark";
const eng = process.argv[7] === "webkit" ? webkit : chromium;
mkdirSync(out, { recursive: true });
const b = await eng.launch(eng === chromium ? { args: ["--autoplay-policy=no-user-gesture-required"] } : {});
const p = await (await b.newContext({ viewport: { width: W, height: H }, colorScheme: theme })).newPage();
const errs = [];
p.on("pageerror", e => errs.push(e.message.slice(0, 200)));
await p.addInitScript(th => localStorage.setItem("ccd.mode", th), theme);
const tag = `${W}-${theme}`;
const shot = async n => p.screenshot({ path: `${out}/${tag}-${n}.png`, fullPage: false });
await p.goto(`${base}/placement`, { waitUntil: "load" });
await p.waitForSelector(".pl", { timeout: 120000 });
await p.waitForTimeout(800);
await shot("0-intro");
await p.getByRole("button", { name: "Start finding your level" }).click();
await p.waitForTimeout(500);
// 1 time: start, find the bar line from the counter, then tap on the beat.
await p.getByRole("button", { name: "Start the beat" }).click();
await p.waitForFunction(() => document.querySelector(".fl-count4 .is-on"), null, { timeout: 20000 });
await p.evaluate(async () => {
  const ms = 60000 / 112;
  // Wait for beat 1 to light, so the taps land near the beat.
  await new Promise(res => { const o = new MutationObserver(() => { const on = document.querySelector(".fl-count4 .is-on"); if (on && on.textContent === "1") { o.disconnect(); res(); } }); o.observe(document.querySelector(".fl-count4"), { subtree: true, attributes: true }); });
  const t0 = performance.now();
  const el = document.querySelector(".pl-tap");
  for (let i = 1; i <= 13; i++) {
    const at = t0 + i * ms;
    await new Promise(r => setTimeout(r, Math.max(0, at - performance.now())));
    el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
  }
});
await p.waitForTimeout(600);
await shot("1-time");
const timeSays = await p.locator(".ms-done, .fl-text .ls-read").last().textContent();
await p.locator(".ls-bottom .m1-g > :last-child").click();
await p.waitForTimeout(600);
// 2 copy: write the pattern.
const pat = { kick: "x.....x...x.....", clap: "....x.......x...", hat: "..x...x...x...x." };
for (const [row, cells] of Object.entries(pat)) for (let k = 0; k < 16; k++) if (cells[k] === "x") await p.locator(`[role="gridcell"][aria-label="${row}, step ${k + 1}"]`).click();
await p.waitForTimeout(300);
await shot("2-copy");
await p.getByRole("button", { name: "Check your notes" }).click();
await p.waitForTimeout(400);
await p.locator(".ls-bottom .m1-g > :last-child").click();
await p.waitForTimeout(600);
// 3 ears: play, pick the first each time.
for (let i = 0; i < 4; i++) {
  await p.getByRole("button", { name: "Play the two" }).first().click();
  await p.waitForTimeout(400);
  await p.locator('.ls-pads [role="radio"]').first().click();
  await p.waitForTimeout(250);
  if (i === 0) await shot("3-ears");
  await p.locator(".ls-bottom .m1-g > :last-child").click();
  await p.waitForTimeout(300);
}
// 4 match: three checks without touching.
await p.waitForTimeout(400);
await shot("4-match");
for (let i = 0; i < 3; i++) { await p.getByRole("button", { name: /Check how close/ }).click().catch(() => {}); await p.waitForTimeout(2500); }
await shot("4-match-out");
await p.getByRole("button", { name: "See your level" }).click();
await p.waitForTimeout(600);
await shot("5-result");
const result = await p.locator(".ls-title").first().textContent();
await p.locator(".ls-bottom .m1-g > :last-child").click();
await p.waitForURL(/\/learn\//, { timeout: 60000 });
await p.waitForSelector(".fl", { timeout: 60000 });
await p.waitForTimeout(800);
await shot("6-lesson");
const state = await p.evaluate(() => {
  const prog = JSON.parse(localStorage.getItem("ccd.progress.v2") ?? "{}");
  const t = JSON.parse(localStorage.getItem("ccd.track.v2") ?? "{}");
  return { placed: Object.entries(prog.completedMissions ?? {}).filter(([, v]) => v.placed).map(([k]) => k), layers: (t.layers ?? []).map(l => `${l.type}:${l.events.length}`), added: t.added ?? [] };
});
console.log(`${eng.name()} ${tag}: time said "${timeSays?.trim()}"; result "${result}"; now at ${p.url().replace(base, "")}`);
console.log(`  placed: ${state.placed.join(", ") || "none"}\n  song: ${state.layers.join(", ")}\n  added: ${state.added.join(", ")}`);
console.log(`  ${errs.length} page errors${errs.length ? ": " + errs.join(" | ") : ""}`);
await b.close();
