/**
 * Plays every lesson in a real browser, answering each screen correctly from the lesson data.
 * Fails a lesson if a screen does not render, a control is missing, or the lesson cannot be finished.
 *   npm run crawl:dump   (once, writes .tmp/missions.json)
 *   BASE=http://localhost:3120 node scripts/lessons-crawl.mjs [slug-prefix|--world=dj] [--limit=N]
 * missions.json comes from `npm run crawl:dump`.
 */
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import { readFileSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:3120";
const missions = JSON.parse(readFileSync(process.env.MISSIONS_JSON ?? ".tmp/missions.json", "utf8"));
const arg = process.argv.slice(2);
const world = arg.find((a) => a.startsWith("--world="))?.slice(8);
const limit = Number(arg.find((a) => a.startsWith("--limit="))?.slice(8) ?? 0);
const only = arg.find((a) => !a.startsWith("--"));
let list = missions.filter((m) => (!world || m.world === world) && (!only || m.slug.startsWith(only)));
if (limit) list = list.slice(0, limit);

const progress = { xp: 0, gems: 0, streakDays: 0, streakShield: false, streakShieldUsedAt: null, lastDay: null, completedMissions: {}, lessonStrengths: {}, fsrsCards: {}, badges: [], hearts: 5, heartRefillAt: 0, dailyXp: 0, dailyXpDate: "2000-01-01", onboardingDone: true, selectedWorld: "producer", difficulty: "normal", placementDone: false, unlockedChapter: 1, leagueId: null, leagueTier: "bronze", weeklyXp: 0, weeklyXpResetDate: "2000-W01" };

const browser = await chromium.launch();
const results = [];
const T = 12000;

async function clickBtn(p, re) {
  const b = p.getByRole("button", { name: re }).first();
  await b.waitFor({ state: "visible", timeout: T });
  await b.click({ timeout: T });
}

async function playScreen(p, s) {
  switch (s.kind) {
    case "hook": return p.getByRole("button", { name: "Tap to continue" }).click({ timeout: T });
    case "concept": case "diagram": return clickBtn(p, /GOT IT|NEXT|CONTINUE/i);
    case "interact": {
      const sim = p.locator("text=TRY IT").locator("xpath=../following-sibling::div[1]");
      await sim.waitFor({ timeout: T });
      await sim.click({ position: { x: 5, y: 5 }, force: true, timeout: T });
      return clickBtn(p, /NEXT/);
    }
    case "quiz": case "audio-id": {
      if (s.kind === "audio-id") {
        const ctx = p.getByRole("button", { name: /PLAY THE AUDIO/i });
        if (await ctx.count()) await ctx.click();
        await clickBtn(p, /SHOW ANSWERS|skip/i);
      }
      const letter = String.fromCharCode(65 + s.answer);
      await p.getByRole("button", { name: new RegExp(`^Option ${letter}:`) }).click({ timeout: T });
      return clickBtn(p, /NEXT/);
    }
    case "match": {
      for (const pair of s.pairs) {
        await p.getByRole("button", { name: `Left item: ${pair.left}`, exact: true }).click({ timeout: T });
        await p.getByRole("button", { name: `Right item: ${pair.right}`, exact: true }).click({ timeout: T });
      }
      return p.getByRole("button", { name: "Continue to next screen" }).click({ timeout: T });
    }
    case "type-answer": {
      await p.getByLabel("Your answer").fill(s.acceptableAnswers[0]);
      await p.getByRole("button", { name: "Submit answer" }).click({ timeout: T });
      const ok = await p.getByText("✓ CORRECT").count();
      if (!ok) throw new Error(`canonical answer rejected: "${s.acceptableAnswers[0]}"`);
      return clickBtn(p, /NEXT/);
    }
    case "sequence": {
      for (let guard = 0; guard < 200; guard++) {
        const texts = await p.locator('[role="list"][aria-label="Items to order"] > *').allInnerTexts();
        const at = s.items.findIndex((it, i) => !texts[i]?.includes(it));
        if (at < 0) break;
        await p.getByRole("button", { name: `Move "${s.items[at]}" up` }).click({ timeout: T });
      }
      await p.getByRole("button", { name: "Check your order" }).click({ timeout: T });
      if (!(await p.getByText("✓ CORRECT ORDER").count())) throw new Error("could not solve sequence");
      return clickBtn(p, /NEXT/);
    }
    case "summary": return;
  }
  throw new Error("unknown screen kind " + s.kind);
}

async function runOne(m) {
  const ctx = await browser.newContext({ viewport: { width: 420, height: 860 } });
  await ctx.addInitScript((pr) => { try { if (!localStorage.getItem("__seeded")) { localStorage.setItem("ccd.progress.v2", JSON.stringify(pr)); localStorage.setItem("__seeded", "1"); } sessionStorage.setItem("ccd.hearts_explained", "1"); } catch {} }, progress);
  // Gating is its own journey; here every lesson must be reachable so its content can be played.
  await ctx.route("**/api/gating", (r) => r.fulfill({ json: { mode: "free" } }));
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(String(e).slice(0, 160)));
  const t0 = Date.now();
  let failure = null, at = -1;
  try {
    const r = await p.goto(`${BASE}/learn/${m.slug}`, { waitUntil: "domcontentloaded" });
    if (!r || r.status() >= 400) throw new Error("HTTP " + r?.status());
    const hearts = p.getByRole("button", { name: /LET'S GO/i });
    await hearts.waitFor({ timeout: 4000 }).then(() => hearts.click()).catch(() => {});
    for (let i = 0; i < m.screens.length; i++) {
      at = i;
      await playScreen(p, m.screens[i]);
    }
    await p.getByText("LESSON COMPLETE").first().waitFor({ timeout: T });
    if (process.env.DEBUG) { await p.screenshot({ path: process.env.DEBUG }); console.log(await p.evaluate(() => Object.keys(localStorage).map(k => k + "=" + localStorage.getItem(k).slice(0, 400)))); }
    const xp = await p.evaluate(() => JSON.parse(localStorage.getItem("ccd.progress.v2") || "{}"));
    if (!xp.completedMissions?.[m.slug]) throw new Error("lesson finished but completion not saved");
  } catch (e) {
    if (process.env.FAILSHOT) await p.screenshot({ path: `${process.env.FAILSHOT}/${m.slug}.png` }).catch(() => {});
    failure = `screen ${at + 1}/${m.screens.length} (${m.screens[at]?.kind}): ${String(e.message).split("\n")[0].slice(0, 140)}`;
  }
  if (errs.length && !failure) failure = "page error: " + errs[0];
  results.push({ slug: m.slug, world: m.world, ok: !failure, failure, ms: Date.now() - t0 });
  console.log(failure ? `FAIL ${m.slug}: ${failure}` : `ok   ${m.slug} (${m.screens.length} screens)`);
  await ctx.close();
}
const WORKERS = Number(process.env.WORKERS ?? 4);
const queue = [...list];
await Promise.all(Array.from({ length: WORKERS }, async () => { for (let m; (m = queue.shift()); ) await runOne(m); }));
await browser.close();
const bad = results.filter((r) => !r.ok);
console.log(`\n${results.length - bad.length}/${results.length} lessons play through`);
process.exit(bad.length ? 1 : 0);
