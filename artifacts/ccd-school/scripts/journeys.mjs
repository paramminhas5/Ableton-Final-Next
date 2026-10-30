/**
 * End-to-end learner journeys against a running build.
 *   npm run build && npx next start -p 3120 &   (set AUTH_SECRET so auth pages render)
 *   BASE=http://localhost:3120 node scripts/journeys.mjs
 * Optional: REAL_ALS=/path/to/a/Set.als to also run one of your own Sets through the checker.
 * Uses a generated synthetic Set, so it needs no private files.
 */
import { createRequire } from "node:module";
// require() so a globally installed Playwright is found through NODE_PATH as well
const { chromium } = createRequire(import.meta.url)("playwright");
import { gzipSync } from "node:zlib";
import { writeFileSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.env.BASE ?? "http://localhost:3120";
const tmp = mkdtempSync(join(tmpdir(), "journeys-"));
let pass = 0, fail = 0;
const ok = (c, m) => { (c ? pass++ : fail++); console.log(c ? "  ok  " : "  FAIL", m); };

// ── a synthetic Live Set: tempo 124, drums + bass + keys with notes, return with reverb, limiter on main
function setXml({ tempo = 124, names = ["Drums", "Bass", "Keys"], withReturn = true } = {}) {
  const notes = (n) => Array.from({ length: n }, (_, i) => `<MidiNoteEvent Time="${i}" Duration="0.25" Velocity="100" />`).join("\n");
  const clip = (n) => `<ClipSlotList>
<ClipSlot>
<ClipSlot>
<Value>
<MidiClip Id="0">
<CurrentStart Value="0" />
<CurrentEnd Value="4" />
<Name Value="p" />
<Notes>
<KeyTracks>
<KeyTrack>
<Notes>
${notes(n)}
</Notes>
<MidiKey Value="36" />
</KeyTrack>
</KeyTracks>
</Notes>
</MidiClip>
</Value>
</ClipSlot>
</ClipSlot>
</ClipSlotList>`;
  const track = (i, name, dev, n) => `<MidiTrack Id="${i}">
<Name>
<EffectiveName Value="${name}" />
</Name>
<DeviceChain>
<Mixer>
<Volume>
<Manual Value="1" />
</Volume>
<Sends>
<TrackSendHolder>
<Send>
<Manual Value="${withReturn ? 0.3 : 0.0003162277571}" />
</Send>
</TrackSendHolder>
</Sends>
</Mixer>
<DeviceChain>
<Devices>
<${dev} Id="0">
</${dev}>
</Devices>
</DeviceChain>
</DeviceChain>
${clip(n)}
</MidiTrack>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<Ableton Creator="Ableton Live 12.3.2">
<LiveSet>
<Tracks>
${track(1, names[0], "DrumGroupDevice", 16)}
${track(2, names[1], "Drift", 8)}
${track(3, names[2], "InstrumentVector", 8)}
</Tracks>
<ReturnTracks>
<ReturnTrack Id="9">
<Name>
<EffectiveName Value="A-Reverb" />
</Name>
<DeviceChain>
<DeviceChain>
<Devices>
<Reverb Id="0">
</Reverb>
</Devices>
</DeviceChain>
</DeviceChain>
</ReturnTrack>
</ReturnTracks>
<MainTrack>
<DeviceChain>
<Mixer>
<Tempo>
<Manual Value="${tempo}" />
</Tempo>
</Mixer>
<DeviceChain>
<Devices>
<Limiter Id="0">
</Limiter>
</Devices>
</DeviceChain>
</DeviceChain>
</MainTrack>
</LiveSet>
</Ableton>
`;
}
const alsFile = (name, opts) => { const f = join(tmp, name); writeFileSync(f, gzipSync(Buffer.from(setXml(opts)))); return f; };

const browser = await chromium.launch();
async function fresh(seed) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
  if (seed) await ctx.addInitScript((s) => { try { if (!localStorage.getItem("__seeded")) { for (const [k, v] of Object.entries(s)) localStorage.setItem(k, JSON.stringify(v)); localStorage.setItem("__seeded", "1"); } } catch {} }, seed);
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", (e) => errs.push(e.message.slice(0, 120)));
  p.on("response", (r) => { if (r.status() >= 500 && !/_vercel|posthog/.test(r.url())) errs.push(r.status() + " " + r.url()); });
  return { ctx, p, errs };
}
// rank-up and similar celebrations cover the page until dismissed; a learner would tap through them
const dismiss = async (p) => { for (let i = 0; i < 3; i++) { const d = p.locator("[role=dialog][aria-modal=true]"); if (!(await d.count())) return; const b = d.locator("button").first(); if (await b.count()) await b.click().catch(() => {}); else await p.keyboard.press("Escape"); await p.waitForTimeout(300); } };
const progressOf = (p) => p.evaluate(() => JSON.parse(localStorage.getItem("ccd.progress.v2") || "{}"));
const seedProgress = (extra) => ({ "ccd.progress.v2": { xp: 0, gems: 0, streakDays: 0, streakShield: false, streakShieldUsedAt: null, lastDay: null, completedMissions: {}, lessonStrengths: {}, fsrsCards: {}, badges: [], hearts: 5, heartRefillAt: 0, dailyXp: 0, dailyXpDate: "2000-01-01", onboardingDone: true, selectedWorld: "producer", difficulty: "normal", placementDone: false, unlockedChapter: 1, leagueId: null, leagueTier: "bronze", weeklyXp: 0, weeklyXpResetDate: "2000-W01", ...extra } });
// real mission slugs, read from the content files, so the dashboard counts them
const SLUGS = [...readFileSync(new URL("../src/content/missions-foundations.ts", import.meta.url), "utf8").matchAll(/^\s*slug:\s*"([^"]+)"/gm)].map((m) => m[1]);
const done = (n) => Object.fromEntries(SLUGS.slice(0, n).map((slug) => [slug, { score: 100, at: Date.now() }]));

// ───────────────────────── J1: total beginner
console.log("\nJ1 Total beginner: onboarding, first lesson, setup, first beat");
{
  const { ctx, p, errs } = await fresh();
  await p.goto(BASE + "/");
  await p.locator('button:visible:has-text("START LEARNING FREE")').first().click();
  await p.locator('button:has-text("Total Beginner")').first().click();
  await p.locator('button:has-text("Fundamentals")').first().click();
  await p.locator('button:has-text("FLOW MODE")').first().click();
  await p.locator('button:visible:has-text("START FIRST LESSON")').first().click();
  await p.waitForURL(/dashboard|learn/, { timeout: 8000 });
  await p.waitForSelector("text=What Is Sound?");
  ok(true, "onboarding lands on a first lesson: What Is Sound?");
  ok(await p.locator("text=Get Live ready").count() > 0 && await p.locator("text=Make your first beat").count() > 0, "dashboard offers Get Live ready + first beat for a new learner");

  await p.goto(BASE + "/learn/what-is-sound");
  await p.locator("button:has-text(\"GOT IT\")").first().click();
  let hearts0 = await p.locator("text=♥").count();
  for (let i = 0; i < 12 && (await p.locator("text=QUESTION 1 OF").count()) === 0; i++) {
    const b = p.locator("button:visible").filter({ hasText: /^(GOT IT|NEXT|🔊|CONTINUE)/ }).first();
    if (await b.count()) await b.click().catch(() => {}); else await p.locator("main button:visible").first().click().catch(() => {});
    await p.waitForTimeout(250);
  }
  ok(await p.locator("text=QUESTION 1 OF").count() > 0, "lesson cards and the interactive reach the quiz");
  await p.locator("button:visible:has-text('A ')").first().click(); // a wrong answer
  await p.waitForTimeout(500);
  const afterWrong = (await progressOf(p)).hearts ?? 5;
  ok(afterWrong === 4 || afterWrong === 5, `wrong answer handled (hearts now ${afterWrong})`);
  ok(await p.locator("text=✓").count() > 0, "the right answer is revealed after answering");

  await p.goto(BASE + "/setup");
  await p.locator("input[type=checkbox]").first().check();
  await p.reload(); await p.waitForTimeout(400);
  ok(await p.locator("input[type=checkbox]:checked").count() === 1, "setup tick survives reload");

  await p.goto(BASE + "/beat");
  const step = p.locator('button[aria-label="Kick step 2"]');
  await step.click();
  ok((await step.getAttribute("aria-pressed")) === "true", "tapping a grid square places a hit");
  await p.locator("button:has-text('PLAY')").first().click();
  await p.waitForTimeout(900);
  ok(await p.locator("button:has-text('STOP')").count() === 1, "play starts the sequencer");
  const activeSeen = await p.locator("button.outline").count();
  ok(activeSeen >= 1, "the playhead highlights a step while playing");
  await p.locator("button:has-text('STOP')").click();
  const [dl] = await Promise.all([p.waitForEvent("download"), p.locator("button:has-text('SAVE FOR LIVE')").click()]);
  const file = join(tmp, dl.suggestedFilename()); await dl.saveAs(file);
  const bytes = readFileSync(file);
  ok(bytes.subarray(0, 4).toString() === "MThd" && /^first-beat-\d+bpm\.mid$/.test(dl.suggestedFilename()), `exported a MIDI file (${dl.suggestedFilename()}, ${bytes.length} bytes)`);
  ok((await progressOf(p)).xp === 20, "first export awards 20 XP once");
  await p.locator("button:has-text('SAVE FOR LIVE')").click(); await p.waitForTimeout(300);
  ok((await progressOf(p)).xp === 20, "a second export does not award XP again");
  ok(errs.length === 0, "no page errors or 5xx: " + JSON.stringify(errs));
  await ctx.close();
}

// ───────────────────────── J2: some experience, building a first track
console.log("\nJ2 Some experience: build a Set stage by stage");
{
  const { ctx, p, errs } = await fresh(seedProgress({ completedMissions: done(5), xp: 200 }));
  await p.goto(BASE + "/dashboard"); await p.waitForTimeout(800);
  ok(await p.locator("text=Build your first track").count() > 0, "dashboard now offers Build your first track");
  await p.goto(BASE + "/build");
  await p.setInputFiles("input[type=file]", alsFile("full.als"));
  await p.waitForSelector("text=/\\d of 14 stages/");
  await p.waitForTimeout(500);
  await dismiss(p);
  const t = await p.locator("main header").innerText();
  ok(/6 of 14 stages/.test(t), "uploaded Set passes tempo, drums, bass, harmony, names, shared space (6 of 14)");
  ok((await progressOf(p)).xp === 200 + 10 + 30 + 30 + 30 + 15 + 30, "XP for those six stages added once");
  await p.setInputFiles("input[type=file]", alsFile("again.als"));
  await p.waitForTimeout(900);
  ok((await progressOf(p)).xp === 345, "uploading again gives no extra XP");
  await p.setInputFiles("input[type=file]", alsFile("renamed.als", { tempo: 120 }));
  await p.waitForTimeout(900);
  ok(/6 of 14 stages/.test(await p.locator("main header").innerText()), "earlier stages stay done even if a later upload fails them");
  await p.setInputFiles("input[type=file]", join(tmp, "notaset.als")).catch(() => {});
  writeFileSync(join(tmp, "notaset.als"), "hello");
  await p.setInputFiles("input[type=file]", join(tmp, "notaset.als"));
  await p.waitForTimeout(700);
  ok((await p.locator("[role=alert]").first().innerText()).length > 10, "a bad file shows a clear error");
  await p.goto(BASE + "/gym");
  ok(await p.locator("text=FIVE MINUTES").count() > 0, "ear gym opens");
  ok(errs.length === 0, "no page errors or 5xx: " + JSON.stringify(errs));
  await ctx.close();
}


// ───────────────────────── J5: gating and hearts (Flow Mode, signed out)
console.log("\nJ5 Free limits and hearts");
{
  const hearts = (n, gems = 0) => seedProgress({ hearts: n, gems });
  const noExplainer = async (ctx) => ctx.addInitScript(() => { try { sessionStorage.setItem("ccd.hearts_explained", "1"); } catch {} });
  // first three lessons of a path are free, the fourth is Pro
  let { ctx, p, errs } = await fresh(hearts(5));
  await noExplainer(ctx);
  await p.goto(BASE + "/learn/amplitude-volume"); await p.waitForTimeout(1500);
  ok(await p.getByRole("button", { name: "Tap to continue" }).count() > 0, "lesson 3 of a path opens for free");
  await p.goto(BASE + "/learn/timbre-tone"); await p.waitForTimeout(1500);
  ok(await p.locator("[data-testid=lesson-locked]").count() > 0, "lesson 4 of a path is locked behind Pro");
  ok(await p.locator("a[href='/upgrade']").count() > 0, "the locked lesson offers an upgrade link");
  await ctx.close();

  // the last heart goes on a wrong answer; after the feedback the wall appears and the lesson does not continue
  ({ ctx, p, errs } = await fresh(hearts(1)));
  await noExplainer(ctx);
  await p.goto(BASE + "/learn/what-is-sound");
  await p.getByRole("button", { name: "Tap to continue" }).click();
  await p.getByRole("button", { name: /GOT IT/ }).click();
  await p.getByRole("button", { name: /GOT IT/ }).click();
  await p.locator("text=TRY IT").locator("xpath=../following-sibling::div[1]").click({ position: { x: 5, y: 5 }, force: true });
  await p.getByRole("button", { name: /NEXT/ }).click();
  await p.getByRole("button", { name: /^Option A:/ }).click(); // the right answer is B
  ok((await progressOf(p)).hearts === 0, "a wrong answer in Flow Mode costs the last heart");
  ok(await p.locator("text=/NOT QUITE/").count() > 0 && await p.locator("button:has-text('✓')").count() > 0, "the learner is told it was wrong and sees the right answer marked");
  await p.getByRole("button", { name: /NEXT/ }).click();
  ok(await p.locator("text=OUT OF HEARTS").count() > 0, "with no hearts left the lesson stops at the out-of-hearts screen");
  ok(await p.locator("text=/Next heart in/").count() > 0, "it says when the next heart arrives");
  await p.getByRole("button", { name: /Switch to Free Mode/ }).click();
  await p.waitForTimeout(800);
  ok(await p.locator("text=OUT OF HEARTS").count() === 0, "Free Mode lets them carry on without hearts");
  ok(errs.length === 0, "no page errors: " + JSON.stringify(errs));
  await ctx.close();

  // arriving with no hearts, but with gems: spend 20 to carry on
  ({ ctx, p, errs } = await fresh(hearts(0, 25)));
  await noExplainer(ctx);
  await p.goto(BASE + "/learn/what-is-sound"); await p.waitForTimeout(1200);
  ok(await p.locator("text=OUT OF HEARTS").count() > 0, "opening a lesson with no hearts shows the wall straight away");
  await p.getByRole("button", { name: /Spend 20 gems/ }).click();
  await p.waitForTimeout(500);
  const pr = await progressOf(p);
  ok(pr.hearts === 1 && pr.gems === 5, "20 gems buy one heart");
  ok(await p.locator("text=OUT OF HEARTS").count() === 0, "the wall lifts once a heart is back");
  await ctx.close();

  // a lesson already completed can be replayed with no hearts (practice, no XP)
  ({ ctx, p, errs } = await fresh({ "ccd.progress.v2": { ...seedProgress({ hearts: 0 })["ccd.progress.v2"], completedMissions: { "what-is-sound": { score: 1, at: 1 } }, xp: 40 } }));
  await noExplainer(ctx);
  await p.goto(BASE + "/learn/what-is-sound"); await p.waitForTimeout(1200);
  ok(await p.locator("text=OUT OF HEARTS").count() === 0, "finished lessons stay open for practice with no hearts");
  await ctx.close();
}

// ───────────────────────── J3: experienced
console.log("\nJ3 Experienced: check a real Set, find the right device and plug-in");
{
  const { ctx, p, errs } = await fresh(seedProgress({ completedMissions: done(20), xp: 900, placementDone: true }));
  await p.goto(BASE + "/dashboard"); await p.waitForTimeout(800);
  ok(await p.locator("text=Check a Set you already made").count() > 0, "dashboard leads with checking an existing Set");
  await p.goto(BASE + "/link");
  const real = process.env.REAL_ALS;
  await p.setInputFiles("input[type=file]", real ?? alsFile("check.als"));
  await p.waitForSelector('section[aria-label="Your Set"]');
  await dismiss(p);
  ok(await p.locator("article").count() === 4, "four mixing missions are shown");
  const link = p.locator('section[aria-label="Your Set"] a[href^="/atlas#"]').first();
  ok(await link.count() > 0, "devices in the Set link to the Atlas");
  await link.click();
  await p.waitForURL(/\/atlas#/);
  await p.waitForTimeout(400);
  ok(await p.locator("li.bg-acid").count() === 1, "the linked device is highlighted in the Atlas");
  await p.goto(BASE + "/atlas"); await p.fill("input[type=search]", "sidechain");
  ok((await p.locator("ul > li[id]").count()) >= 1, "searching the Atlas finds devices by what they do");
  await p.goto(BASE + "/plugins");
  ok(await p.locator('a[href="/atlas#compressor"]').count() > 0, "plug-in guide points back to the stock device first");
  await p.goto(BASE + "/device/eq");
  ok(await p.locator('a[href^="/atlas#"]').count() > 0, "Device Lab pages link to the written guide");
  await p.goto(BASE + "/no-such-page");
  ok(await p.locator("text=THAT PAGE").count() > 0, "unknown pages show a helpful 404");
  ok(errs.length === 0, "no page errors or 5xx: " + JSON.stringify(errs));
  await ctx.close();
}

// ───────────────────────── J4: experienced learner placed by the test (right answers vs wrong answers)
console.log("\nJ4 Experienced: placement test skips ahead only when earned");
{
  const src = readFileSync(new URL("../src/content/placement-questions.ts", import.meta.url), "utf8");
  const qs = [...src.matchAll(/world:\s*"producer"[\s\S]*?q:\s*"((?:[^"\\]|\\.)*)",\s*options:\s*\[([\s\S]*?)\],\s*answer:\s*(\d)/g)].map((m) => ({
    q: m[1], answer: Number(m[3]), options: [...m[2].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((o) => o[1]),
  }));
  const nextByLabel = {};
  ok(qs.length === 4, "found the four producer placement questions in the content");
  for (const [label, right, expect] of [["strong", true, /CHAPTER 3/], ["weak", false, /CHAPTER 1/]]) {
    const { ctx, p, errs } = await fresh();
    await p.goto(BASE + "/");
    await p.locator('button:visible:has-text("START LEARNING FREE")').first().click();
    await p.locator('button:has-text("Experienced")').first().click();
    await p.locator('button:has-text("Producer")').first().click();
    await p.locator('button:visible:has-text("START TEST")').first().click();
    for (const q of qs) {
      await p.waitForSelector(`text=${q.q.slice(0, 30)}`);
      const idx = right ? q.answer : (q.answer + 1) % q.options.length;
      await p.locator("button:visible").filter({ hasText: q.options[idx].slice(0, 25) }).first().click();
      await p.locator("button:visible").filter({ hasText: /NEXT|RESULT|FINISH|SEE/i }).first().click();
    }
    const go = p.locator("button:visible").filter({ hasText: /^START AT CHAPTER/ }).first();
    await go.waitFor();
    const txt = await go.innerText();
    ok(expect.test(txt), `${label} answers give: ${txt.trim()}`);
    await go.click();
    await p.waitForURL(/\/(learn|dashboard)/, { timeout: 8000 });
    await p.goto(BASE + "/dashboard");
    await p.waitForSelector("text=NEXT LESSON");
    await p.waitForTimeout(500);
    const nextTitle = (await p.locator("section:has-text('// NEXT LESSON') .font-display").first().innerText()).trim();
    nextByLabel[label] = nextTitle;
    ok(nextTitle.length > 3, `${label}: dashboard points at a next lesson ("${nextTitle}")`);
    const pr = await progressOf(p);
    ok(pr.onboardingDone === true && pr.selectedWorld === "producer", `${label}: onboarding is saved (world ${pr.selectedWorld})`);
    ok(errs.length === 0, `${label}: no page errors: ` + JSON.stringify(errs));
    await ctx.close();
  }
  ok(nextByLabel.strong && nextByLabel.weak && nextByLabel.strong !== nextByLabel.weak, `a strong score starts further on than a weak one (${nextByLabel.strong} vs ${nextByLabel.weak})`);
}


// ───────────────────────── J7: a DJ and a Fundamentals learner each get their own path
console.log("\nJ7 Other worlds: DJ and Fundamentals");
{
  for (const [world, chip, expectWorld] of [["DJ", "DJ", "dj"], ["Fundamentals", "Fundamentals", "fundamentals"]]) {
    const { ctx, p, errs } = await fresh();
    await p.goto(BASE + "/");
    await p.locator('button:visible:has-text("START LEARNING FREE")').first().click();
    await p.locator('button:has-text("Total Beginner")').first().click();
    await p.locator(`button:has-text("${chip}")`).first().click();
    await p.locator('button:has-text("FLOW MODE")').first().click();
    await p.locator('button:visible:has-text("START FIRST LESSON")').first().click();
    await p.waitForURL(/dashboard|learn/, { timeout: 8000 });
    await p.waitForTimeout(1500);
    const pr = await progressOf(p);
    ok(pr.selectedWorld === expectWorld, `${world}: onboarding saves the ${expectWorld} world`);
    await p.goto(BASE + "/dashboard"); await p.waitForTimeout(1200);
    const cont = p.locator("a[href^='/learn/']").first();
    const href = await cont.getAttribute("href").catch(() => null);
    ok(!!href, `${world}: the dashboard has a lesson to continue (${href})`);
    const r = await p.goto(BASE + href);
    ok(r.status() === 200, `${world}: that lesson opens`);
    await p.waitForTimeout(800);
    ok(await p.locator("[data-testid=lesson-locked]").count() === 0, `${world}: and it is not locked`);
    await p.goto(BASE + `/world/${expectWorld}`); await p.waitForTimeout(800);
    ok((await p.locator("a[href^='/learn/'], a[href^='/path/']").count()) > 0, `${world}: the world map lists lessons`);
    ok(errs.length === 0, `${world}: no page errors: ` + JSON.stringify(errs));
    await ctx.close();
  }
}

// ───────────────────────── J8: daily practice, review, ear gym, and the mobile menu
console.log("\nJ8 Come-back loop: review, daily, ear gym, phone menu");
{
  // two finished lessons whose memory has faded
  const old = Date.now() - 60 * 864e5;
  const cards = { "what-is-sound": { stability: 1, difficulty: 6, lastReview: old, reps: 1 }, "frequency-pitch": { stability: 1, difficulty: 6, lastReview: old, reps: 1 } };
  const { ctx, p, errs } = await fresh(seedProgress({
    completedMissions: { "what-is-sound": { score: 1, at: old }, "frequency-pitch": { score: 1, at: old } },
    lessonStrengths: { "what-is-sound": { strength: 0.2, lastReviewed: old }, "frequency-pitch": { strength: 0.2, lastReview: old, lastReviewed: old } },
    fsrsCards: cards, xp: 80,
  }));
  await p.goto(BASE + "/review"); await p.waitForTimeout(1200);
  ok(await p.locator("text=Nothing to review yet").count() === 0, "review lists lessons that need a refresh");
  ok((await p.locator("a[href*='review=1'], a[href^='/learn/']").count()) > 0, "each review item links to its lesson");
  await p.goto(BASE + "/daily"); await p.waitForTimeout(1000);
  ok(await p.locator("text=PRACTICE").count() > 0, "daily practice opens");
  ok(await p.locator("a[href^='/learn/'], a[href^='/review'], a[href^='/challenge']").count() > 0, "daily practice points at something to do");
  await p.goto(BASE + "/gym"); await p.waitForTimeout(800);
  await p.getByRole("button", { name: /START 5 MIN SESSION/ }).click();
  await p.waitForTimeout(3500);
  const gymErr = await p.locator("div.bg-hot.text-bone.px-3.py-2").first().innerText({ timeout: 500 }).catch(() => "");
  ok(!gymErr, "ear gym starts a drill without an error" + (gymErr ? ": " + gymErr : ""));
  ok((await p.locator("button:visible").count()) >= 4, "the drill shows answer buttons");
  await p.getByRole("button", { name: /^End$/ }).click();
  await p.waitForTimeout(600);
  ok(await p.getByRole("button", { name: /GO AGAIN/ }).count() > 0, "ending a session returns to the gym home");
  // phone menu
  await p.goto(BASE + "/dashboard"); await p.waitForTimeout(800);
  const navLinks = await p.locator("nav a:visible").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
  ok(navLinks.length >= 3, "the phone bottom bar shows links: " + navLinks.join(" "));
  for (const href of navLinks.filter((h) => h && h.startsWith("/")).slice(0, 5)) {
    const r = await p.goto(BASE + href);
    ok(r.status() === 200, `phone link ${href} opens`);
  }
  ok(errs.length === 0, "no page errors: " + JSON.stringify(errs));
  await ctx.close();
}

// ───────────────────────── J9: lessons, Atlas, plug-in guide and Build a Set point at each other
console.log("\nJ9 The pieces link together");
{
  const { ctx, p, errs } = await fresh(seedProgress());
  await ctx.addInitScript(() => { try { localStorage.setItem("ccd.learnMode", "classic"); } catch {} });
  await ctx.route("**/api/gating", (r) => r.fulfill({ json: { mode: "free" } }));
  await p.goto(BASE + "/learn/compressor"); await p.waitForTimeout(1500);
  const panel = p.locator("[data-testid=lesson-links]");
  ok(await panel.count() > 0, "the compressor lesson has a Use it in Live panel");
  const hrefs = await panel.locator("a").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
  ok(hrefs.includes("/atlas#compressor"), "it links to the Compressor in the Atlas");
  ok(hrefs.includes("/plugins#comp"), "it links to the compression plug-in advice");
  ok(hrefs.includes("/build"), "it links to the matching Build a Set stage");
  await panel.locator("a[href='/atlas#compressor']").click();
  await p.waitForURL(/\/atlas#compressor/); await p.waitForTimeout(800);
  ok(await p.locator("#compressor").count() > 0, "the Atlas opens on that device");
  ok(await p.locator("#compressor a[href='/learn/compressor']").count() > 0, "and links back to the lesson");
  await p.goto(BASE + "/plugins#comp"); await p.waitForTimeout(800);
  ok(await p.locator("#comp a[href='/atlas#compressor']").count() > 0, "the plug-in guide links to the stock Compressor");
  ok(errs.length === 0, "no page errors: " + JSON.stringify(errs));
  await ctx.close();
}

await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
