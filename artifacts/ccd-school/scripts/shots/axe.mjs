// Accessibility scan with axe (WCAG 2.1 A and AA rules) on the studio, a lesson at several steps, the welcome,
// all lessons and the gym, in dark and light. Prints violations by rule with node counts, and a total.
// Usage: node scripts/shots/axe.mjs <base> [theme: dark|light|both] [contrast: 0|1]
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
const base = process.argv[2] ?? "http://localhost:3000";
const themes = (process.argv[3] ?? "both") === "both" ? ["dark", "light"] : [process.argv[3]];
const hc = process.argv[4] === "1";
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const pages = [
  { name: "studio", path: "/studio" },
  { name: "lesson: first step", path: "/learn/first-bass" },
  { name: "lesson: match step", path: "/learn/first-bass", step: "matchsound" },
  { name: "lesson: copy step", path: "/learn/your-kick", step: "copy" },
  { name: "welcome", path: "/" },
  { name: "all lessons", path: "/learn" },
  { name: "practice", path: "/gym" },
];
let total = 0, nodes = 0;
const byRule = new Map();
for (const theme of themes) {
  for (const pg of pages) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, colorScheme: theme });
    const p = await ctx.newPage();
    await p.addInitScript(([th, c]) => { localStorage.setItem("ccd.mode", th); if (c) localStorage.setItem("ccd.contrast", "high"); }, [theme, hc]);
    await p.goto(base + pg.path, { waitUntil: "load" });
    await p.waitForTimeout(1500);
    if (pg.step) {
      for (let i = 0; i < 12; i++) {
        const k = await p.locator(".fl").getAttribute("data-page-kind").catch(() => null);
        if (!k || k === pg.step) break;
        const skip = p.getByRole("button", { name: "Skip this step" });
        if (await skip.count()) await skip.first().click(); else await p.locator(".ls-bottom .m1-g > :last-child").first().click();
        await p.waitForTimeout(500);
      }
    }
    const r = await new AxeBuilder({ page: p }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    const n = r.violations.reduce((a, v) => a + v.nodes.length, 0);
    total += r.violations.length; nodes += n;
    console.log(`${theme.padEnd(5)} ${pg.name.padEnd(20)} ${r.violations.length} rules, ${n} nodes${r.violations.length ? ": " + r.violations.map(v => `${v.id} (${v.nodes.length})`).join(", ") : ""}`);
    for (const v of r.violations) {
      const e = byRule.get(v.id) ?? { n: 0, impact: v.impact, ex: [] };
      e.n += v.nodes.length;
      if (e.ex.length < 3) e.ex.push(`${pg.name}: ${v.nodes[0].target.join(" ")} ${v.nodes[0].failureSummary?.split("\n")[1]?.trim() ?? ""}`.slice(0, 220));
      byRule.set(v.id, e);
    }
    await ctx.close();
  }
}
console.log(`\ntotal: ${total} rule violations over the pages, ${nodes} nodes`);
for (const [id, e] of [...byRule].sort((a, b) => b[1].n - a[1].n)) console.log(`  ${id} (${e.impact}) ${e.n}\n    ${e.ex.join("\n    ")}`);
await b.close();
