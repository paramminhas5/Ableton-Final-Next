// Add a part, check the song gets a name, the done screen a/b and go deeper, and rename.
// Usage: node scripts/shots/done-smoke.mjs <out dir> (dev server on :3000)
import { chromium } from "playwright";
const out = process.argv[2];
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
for (const [label, w, h] of [["desk", 1440, 900], ["phone", 390, 844]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: "dark" });
  const p = await ctx.newPage(); const errs = [];
  p.on("pageerror", e => errs.push(e.message));
  await p.goto("http://localhost:3000/learn/what-is-sound", { waitUntil: "load" });
  const total = Number((await p.locator(".fl-count").innerText()).split("/").pop());
  // jump to add (third from the end when there is a check)
  await p.evaluate(i => sessionStorage.setItem("ccd.lesson.what-is-sound", JSON.stringify({ idx: i, at: Date.now() })), total - 3);
  await p.reload({ waitUntil: "load" }); await p.waitForTimeout(1500);
  console.log(label, "page", await p.locator(".fl").getAttribute("data-page-kind"), "song before:", (await p.locator(".fl-songname").innerText()).replace(/\s+/g, " "));
  await p.locator(".ls-bottom .m1-g > :last-child").first().click(); await p.waitForTimeout(1500);
  console.log(label, "song after add:", (await p.locator(".fl-songname").innerText()).replace(/\s+/g, " "));
  await p.evaluate(i => sessionStorage.setItem("ccd.lesson.what-is-sound", JSON.stringify({ idx: i, at: Date.now() })), total - 1);
  await p.reload({ waitUntil: "load" }); await p.waitForTimeout(1800);
  console.log(label, "page", await p.locator(".fl").getAttribute("data-page-kind"), "| crumb:", await p.locator(".fl-crumb span").innerText());
  console.log(label, "ab:", await p.locator(".fl-ab button").count(), "deeper:", await p.locator(".fl-deeper li").allInnerTexts().then(a => a.map(x => x.replace(/\s+/g, " ")).join(" / ")));
  await p.locator(".fl-ab button").nth(1).click(); await p.waitForTimeout(600);
  await p.screenshot({ path: `${out}/done-${label}.png`, fullPage: true });
  // rename
  await p.locator(".fl-songrename").click(); await p.locator(".fl-songinput").fill("rooftop"); await p.keyboard.press("Enter"); await p.waitForTimeout(300);
  console.log(label, "renamed:", (await p.locator(".fl-songname").innerText()).replace(/\s+/g, " "), errs.length ? "ERR " + errs.join(";") : "");
  await ctx.close();
}
await b.close();
