// Walk a lesson as different people at every voice and level.
//   node scripts/lesson-walk.mjs http://localhost:3000 your-kick [careful|rusher|all] [voice] [level]
// "careful" does every step properly. "rusher" taps the go key on every step before doing anything and
// must never get past a question, an ear round or the play step without doing it.
import { chromium } from "playwright";
const [base = "http://localhost:3000", slug = "your-kick", who = "all", vOnly, lOnly] = process.argv.slice(2);
const VOICES = vOnly ? [vOnly] : ["mentor", "straight", "eli5"];
const LEVELS = lOnly ? [lOnly] : ["gentle", "standard", "hard"];
const PERSONAS = who === "all" ? ["careful", "rusher"] : [who];
const GATED = new Set(["quiz", "audio-id", "ear", "play", "type-answer", "sequence", "match"]);
const BAD = /undefined|NaN|\[object|—|\{\{|\bnull\b/;

const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
let fails = 0;
for (const persona of PERSONAS) for (const voice of VOICES) for (const level of LEVELS) {
  if (persona === "rusher" && !(level === "standard" || level === "hard")) continue;
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "dark" });
  const p = await ctx.newPage();
  const problems = [];
  p.on("pageerror", e => problems.push("pageerror: " + e.message.slice(0, 120)));
  p.on("console", m => { if (m.type() === "error" && !/404|500|authjs|auth/i.test(m.text())) problems.push("console: " + m.text().slice(0, 120)); });
  await p.addInitScript(([v, l]) => {
    localStorage.setItem("ccd.prefs.v1", JSON.stringify({ voice: v, level: l, sound: false }));
    localStorage.setItem("ccd.studio.seeded", "1"); localStorage.setItem("ccd.hearts.explained", "1");
  }, [voice, level]);
  await p.goto(`${base}/learn/${slug}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  const go = () => p.locator("button.m1-m.is-wide, a.m1-m.is-wide").last();
  const state = async () => {
    const r = await p.locator(".ls").first().evaluate(el => ({ kinds: el.dataset.steps.split(","), at: +el.dataset.step })).catch(() => null);
    return r;
  };
  let kinds = [], reached = false, seen = [];
  for (let guard = 0; guard < 80; guard++) {
    const st = await state();
    if (!st) break;
    kinds = st.kinds;
    const kind = kinds[st.at];
    seen.push(kind);
    const text = (await p.locator("main, body").first().innerText()).replace(/\s+/g, " ").replace(/source: .*$/i, "");
    if (BAD.test(text)) { const i = text.search(BAD); problems.push(`step ${st.at} (${kind}) text has "${text.slice(Math.max(0, i - 40), i + 30)}"`); };
    if (kind === "summary") { reached = true; break; }
    if (persona === "rusher" && GATED.has(kind)) {
      for (let t = 0; t < 3; t++) await go().click({ timeout: 800, force: true }).catch(() => {});
      await p.waitForTimeout(300);
      const after = await state();
      if (after && after.at !== st.at) problems.push(`rusher got past ${kind} at step ${st.at} without doing it`);
    }
    // do the step properly
    if (kind === "play") {
      await p.locator('button[aria-label^="Record"]').click().catch(() => {});
      await p.waitForTimeout(2300);
      for (let k = 0; k < 4; k++) { await p.locator('button[aria-label="kick"]').click().catch(() => {}); await p.waitForTimeout(480); }
      await p.locator('button[aria-label="Play the loop"]').click().catch(() => {});
      await p.waitForTimeout(500);
    } else if (kind === "quiz" || kind === "audio-id") {
      await p.locator('[role="radio"]:not([disabled])').first().click().catch(() => {});
      await go().click().catch(() => {});
      await p.waitForTimeout(250);
    } else if (kind === "ear") {
      // rounds replace each other inside one step: answer until the step changes
      for (let r = 0; r < 12; r++) {
        const s2 = await state();
        if (!s2 || s2.at !== st.at) break;
        const radio = p.locator('[role="radio"]:not([disabled])').first();
        if (await radio.count()) { await radio.click().catch(() => {}); await p.waitForTimeout(150); }
        await go().click().catch(() => {});
        await p.waitForTimeout(250);
      }
      continue;
    }
    const before = (await state())?.at;
    await go().click({ timeout: 3000 }).catch(e => problems.push(`could not press go at step ${st.at} (${kind}): ${e.message.split("\n")[0]}`));
    await p.waitForTimeout(450);
    const after = (await state())?.at;
    if (after === before && kind !== "summary") {
      // a wrong-answer screen needs one more press
      await go().click().catch(() => {});
      await p.waitForTimeout(350);
      if ((await state())?.at === before) { problems.push(`stuck at step ${st.at} (${kind})`); break; }
    }
  }
  if (!reached) problems.push("never reached the summary");
  const ok = problems.length === 0;
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"} ${persona.padEnd(7)} ${voice.padEnd(8)} ${level.padEnd(8)} steps=${kinds.length}${ok ? "" : "\n   " + problems.slice(0, 6).join("\n   ")}`);
  await ctx.close();
}
await browser.close();
process.exit(fails ? 1 : 0);
