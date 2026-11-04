// The hear-the-difference page: shots at phone and desktop, light and dark, Chromium and WebKit, and a
// check that play starts both engines and the switch flips. Usage: node scripts/shots/sound.mjs <base> <out>
import { chromium, webkit } from "playwright";
const base = process.argv[2] ?? "http://localhost:3000", out = process.argv[3] ?? "shots";
for (const [name, eng] of [["chromium", chromium], ["webkit", webkit]]) {
  const b = await eng.launch({ args: eng === chromium ? ["--autoplay-policy=no-user-gesture-required"] : [] });
  for (const [w, h] of [[390, 844], [1440, 900]]) for (const scheme of ["light", "dark"]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: scheme });
    const p = await ctx.newPage(); const errs = [];
    p.on("pageerror", e => errs.push(e.message)); p.on("console", m => { if (m.type() === "error" && !/404/.test(m.text())) errs.push(m.text()); });
    await p.goto(`${base}/sound`, { waitUntil: "load" }); await p.waitForTimeout(600);
    await p.getByRole("button", { name: "Play hats" }).click(); await p.waitForTimeout(1500);
    const on = await p.locator(".ab-row.is-on").count();
    await p.getByRole("radio", { name: "before" }).click(); await p.waitForTimeout(300);
    const now = await p.locator(".ab-now").innerText().catch(() => "");
    await p.screenshot({ path: `${out}/sound-${name}-${w}-${scheme}.png` });
    console.log(`${name} ${w} ${scheme}: playing rows ${on}, badge "${now}"${errs.length ? " ERR " + errs.join("; ").slice(0, 200) : ""}`);
    await ctx.close();
  }
  await b.close();
}
