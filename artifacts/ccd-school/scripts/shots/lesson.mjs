// Lesson player screenshots: every step type, light and dark, at 390x844.
// Usage: node scripts/shots/lesson.mjs [base url] [chromium|webkit] [out dir]
// Jumps straight to a step by seeding the player's session state, then (for answers)
// taps a pad and checks, so the right and wrong states are captured too.
import { chromium, webkit } from "playwright";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3000";
const name = process.argv[3] ?? "chromium";
const out = process.argv[4] ?? "shots/lesson";
mkdirSync(out, { recursive: true });

// [file, slug, step kind, action, mode]. The player lists its steps in data-steps.
const ONLY = (process.env.ONLY ?? "").split(",").filter(Boolean);
const SHOTS = [
  ["hook", "bass-poli", "hook", null, "flow"],
  ["hearts-intro", "bass-poli", "hook", "intro", "flow"],
  ["concept", "frequency-pitch", "concept", null, "flow"],
  ["concept-plain", "frequency-pitch", "concept#2", null, "flow"],
  ["sim", "what-is-rhythm", "interact", null, "flow"],
  ["listen", "frequency-pitch", "audio-id", null, "flow"],
  ["quiz", "frequency-pitch", "quiz", "pick", "flow"],
  ["quiz-right", "frequency-pitch", "quiz", "right", "flow"],
  ["quiz-wrong", "frequency-pitch", "quiz", "wrong", "flow"],
  ["order", "frequency-pitch", "sequence", "order1", "flow"],
  ["type", "amplitude-volume", "type-answer", "type", "flow"],
  ["match", "what-is-sound", "match", "match1", "flow"],
  ["tryit-bass", "bass-poli", "tryit", null, "flow"],
  ["tryit-drums", "what-is-rhythm", "tryit", null, "flow"],
  ["done", "bass-poli", "summary", null, "flow"],
  ["hearts-out", "frequency-pitch", "quiz", "noHearts", "flow"],
  ["practice", "frequency-pitch", "quiz", "practice", "flow"],
  ["free", "frequency-pitch", "quiz", null, "classic"],
];

const b = await (name === "webkit" ? webkit : chromium).launch();
const problems = [];
for (const scheme of ["light", "dark"]) {
  for (const [file, slug, idx, action, mode] of SHOTS.filter(x => !ONLY.length || ONLY.includes(x[0]))) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, colorScheme: scheme, deviceScaleFactor: 2 });
    const p = await ctx.newPage();
    p.on("pageerror", e => problems.push(`${file} ${scheme}: ${e.message.slice(0, 160)}`));
    p.on("console", m => { if (m.type() === "error" && !/auth|500|favicon|posthog/i.test(m.text())) problems.push(`${file} ${scheme}: ${m.text().slice(0, 160)}`); });
    await p.addInitScript(([mode, action]) => {
      localStorage.setItem("ccd.studio.seeded", "1");
      localStorage.setItem("ccd.learnMode", mode);
      if (action !== "intro") localStorage.setItem("ccd.hearts.explained", "1");
      if (action === "noHearts" || action === "practice") {
        const raw = JSON.parse(localStorage.getItem("ccd.progress.v2") || "null");
        localStorage.setItem("ccd.progress.v2", JSON.stringify({ ...(raw || {}), hearts: 0, heartRefillAt: Date.now() - 600000 }));
      }
    }, [mode, action]);
    await p.goto(`${base}/learn/${slug}`, { waitUntil: "domcontentloaded", timeout: 180000 });
    await p.waitForTimeout(1500);
    const [kind, nth] = idx.split("#");
    const steps = (await p.locator(".ls").getAttribute("data-steps")).split(",");
    const at = steps.map((k, i) => (k === kind ? i : -1)).filter(i => i >= 0)[(Number(nth) || 1) - 1];
    if (at === undefined) { problems.push(`${file}: no ${idx} step in ${slug}`); await ctx.close(); continue; }
    if (at > 0) {
      await p.evaluate(([slug, i]) => sessionStorage.setItem(`ccd.lesson.${slug}`, JSON.stringify({ idx: i, correct: 2, at: Date.now() })), [slug, at]);
      await p.reload({ waitUntil: "domcontentloaded" });
      await p.waitForTimeout(1500);
    }
    try {
      const pads = p.locator(".ls-pads .ls-pad");
      if (action === "pick") await pads.nth(1).click();
      if (action === "right" || action === "wrong") {
        const n = await pads.count();
        // Try each pad until the verdict matches what we want to show.
        for (let i = 0; i < n; i++) {
          await p.reload({ waitUntil: "domcontentloaded" });
          await p.waitForTimeout(900);
          await p.locator(".ls-pads .ls-pad").nth(i).click();
          await p.getByRole("button", { name: "check" }).click();
          await p.waitForTimeout(300);
          const txt = await p.locator(".ls-meta").first().innerText();
          if ((action === "right") === txt.startsWith("right")) break;
        }
      }
      if (action === "order1") await pads.nth(0).click();
      if (action === "practice") await p.getByRole("button", { name: "practice for a heart" }).click();
      if (action === "type") { const nums = p.locator(".ls-num .ls-pad"); if (await nums.count()) { await nums.nth(5).click(); } else await p.locator(".ls-input").fill("rt60"); }
      if (action === "match1") { await p.locator(".ls-mrow .ls-pad").nth(0).click(); await p.locator(".ls-mrow .ls-pad").nth(3).click(); }
    } catch (e) {
      problems.push(`${file} ${scheme}: action failed ${String(e.message).split("\n")[0].slice(0, 100)}`);
    }
    await p.waitForTimeout(1200);
    await p.screenshot({ path: `${out}/${file}-${scheme}.png`, fullPage: false });
    // Anything wider than the phone is a layout bug.
    const wide = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    if (wide) problems.push(`${file} ${scheme}: horizontal scroll`);
    await ctx.close();
  }
}
await b.close();
console.log(problems.length ? problems.join("\n") : "no problems");
