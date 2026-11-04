// Page screenshots at 390x844 (set VW and VH for another size), light and dark, full page.
// Usage: node scripts/shots/pages.mjs <base url> <chromium|webkit> <out dir> /path [/path ...]
// A path may end in "!click=<button name>" to press a button before the shot.
import { chromium, webkit } from "playwright";
import { mkdirSync } from "node:fs";

const [base = "http://localhost:3000", name = "chromium", out = "shots/pages", ...paths] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const b = await (name === "webkit" ? webkit : chromium).launch(name === "chromium" ? { args: ["--autoplay-policy=no-user-gesture-required"] } : {});
const problems = [];
const noise = /auth|favicon|posthog|_vercel|500 \(Internal|access control|ClientFetchError/i;
for (const scheme of ["light", "dark"]) {
  for (const raw of paths) {
    const [path, act] = raw.split("!");
    const ctx = await b.newContext({ viewport: { width: +(process.env.VW || 390), height: +(process.env.VH || 844) }, colorScheme: scheme, deviceScaleFactor: 2 });
    const p = await ctx.newPage();
    const file = (path.replace(/\W+/g, "-").replace(/^-|-$/g, "") || "home") + (act ? "-" + act.split("=")[1].replace(/\W+/g, "-") : "");
    p.on("pageerror", e => problems.push(`${file} ${scheme}: ${e.message.slice(0, 160)}`));
    p.on("console", m => { if (m.type() === "error" && !noise.test(m.text())) problems.push(`${file} ${scheme}: ${m.text().slice(0, 160)}`); });
    await p.addInitScript(() => { localStorage.setItem("ccd.studio.seeded", "1"); localStorage.setItem("ccd.hearts.explained", "1"); });
    await p.goto(base + path, { waitUntil: "networkidle", timeout: 120000 }).catch(e => problems.push(`${file}: ${e.message.slice(0, 80)}`));
    await p.waitForTimeout(800);
    if (act?.startsWith("click=")) {
      await p.getByRole("button", { name: act.slice(6) }).first().click().catch(e => problems.push(`${file}: click failed ${e.message.split("\n")[0].slice(0, 80)}`));
      await p.waitForTimeout(4000);
    }
    await p.screenshot({ path: `${out}/${file}-${scheme}.png`, fullPage: true });
    if (await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)) problems.push(`${file} ${scheme}: horizontal scroll`);
    await ctx.close();
  }
}
await b.close();
console.log(problems.length ? problems.join("\n") : "no problems");
