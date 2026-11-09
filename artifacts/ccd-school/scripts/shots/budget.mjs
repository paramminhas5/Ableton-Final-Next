// The control budget for a new learner (simple mode): how many things you can press on the first screen,
// and whether instrument screens fit without scrolling. Exits 1 when a screen is over its budget.
// Usage: node scripts/shots/budget.mjs [width] [height]
import { chromium } from "playwright";
const [w = "390", h = "844"] = process.argv.slice(2); // the budget is for phones; wider screens are reported, not judged
const base = process.env.BASE ?? "http://localhost:3000";
const BUDGET = { "/dashboard": 18, "/learn/your-kick": 12, "/studio": 16, "/dj": 16, "/gym": 14, "/atlas": 18, "/learn": 16 };
const INSTRUMENT = ["/studio", "/dj", "/learn/your-kick"];
const b = await chromium.launch();
let over = 0;
for (const [url, max] of Object.entries(BUDGET)) {
  const ctx = await b.newContext({ viewport: { width: +w, height: +h }, hasTouch: +w < 1000 });
  await ctx.addInitScript(() => {
    localStorage.setItem("ccd.progress.v2", JSON.stringify({ onboardingDone: true, selectedWorld: "fundamentals", completedMissions: {}, xp: 0, streakDays: 0 }));
    for (const s of ["home", "lesson", "studio", "dj", "practice", "syllabus", "wiki", "device"]) localStorage.setItem(`ccd.walk.${s}`, "1");
    localStorage.setItem("ccd.dj.upright", "1");
  });
  const p = await ctx.newPage();
  await p.goto(base + url, { waitUntil: "load" });
  await p.waitForTimeout(1800);
  const r = await p.evaluate(() => {
    const vis = e => { const r = e.getBoundingClientRect(); const st = getComputedStyle(e); return r.width > 4 && r.height > 4 && r.bottom > 0 && r.top < innerHeight && st.visibility !== "hidden" && st.opacity !== "0" && !e.closest("[aria-hidden=true]"); };
    // A list of rows (lessons, devices, drills), a row of filter chips and an instrument's pads or keys each count
    // once: the budget is for things to operate, not for how long a list is.
    const els = [...document.querySelectorAll("button, a[href], input, select, textarea, [role=slider], [role=radio], [role=gridcell]")].filter(e => !e.classList.contains("skip-link") && vis(e));
    const groups = new Set(); let n = 0;
    for (const e of els) { const g = e.closest("[data-budget]"); if (g) { if (!groups.has(g)) { groups.add(g); n++; } } else n++; }
    return { n, raw: els.length, scroll: document.documentElement.scrollHeight - innerHeight };
  });
  const scrolls = INSTRUMENT.includes(url) && r.scroll > 4;
  const bad = (+w < 700 && r.n > max) || scrolls;
  if (bad) over++;
  console.log(`${bad ? "OVER" : "ok  "}  ${url.padEnd(18)} ${String(r.n).padStart(3)} controls (budget ${max}, ${r.raw} before grouping)${INSTRUMENT.includes(url) ? `  scroll ${Math.max(0, r.scroll)} px` : ""}`);
  await ctx.close();
}
await b.close();
process.exit(over ? 1 : 0);
