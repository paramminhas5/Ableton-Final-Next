import { chromium, webkit } from "playwright";
import { mkdirSync } from "node:fs";
const ROOT = "/tmp/claude-0/-home-claude/14482081-5c9f-509e-afde-b9b4be190bf9/scratchpad/review3/shots/lessons";
const slug = process.argv[2];
const [W, H] = (process.argv[3] ?? "390x844").split("x").map(Number);
const eng = process.argv[4] === "webkit" ? webkit : chromium;
const OUT = `${ROOT}/${slug}-${W}${process.argv[4] === "webkit" ? "-wk" : ""}`; mkdirSync(OUT, { recursive: true });
const b = await eng.launch(eng === chromium ? { args: ["--autoplay-policy=no-user-gesture-required"] } : {});
const ctx = await b.newContext({ viewport: { width: W, height: H }, colorScheme: process.argv[5] ?? "light" });
const p = await ctx.newPage(); const errs = [];
p.on("pageerror", e => errs.push(e.message.slice(0, 200)));
await p.goto(`http://localhost:3100/learn/${slug}`, { waitUntil: "load" });
await p.waitForSelector(".fl", { timeout: 60000 }).catch(() => errs.push("no player"));
await p.waitForTimeout(1500);
let stuck = 0;
for (let i = 0; i < 40; i++) {
  const kind = await p.locator(".fl").getAttribute("data-page-kind").catch(() => null);
  const step = await p.locator(".fl").getAttribute("data-step").catch(() => null);
  await p.screenshot({ path: `${OUT}/${String(i).padStart(2, "0")}-${kind}.png` }); if (kind === "done") await p.screenshot({ path: `${OUT}/${String(i).padStart(2, "0")}-${kind}-full.png`, fullPage: true });
  const go = p.locator(".ls-bottom .m1-g > :last-child").first();
  const info = await p.evaluate(() => {
    const fl = document.querySelector(".fl");
    const t = (fl?.innerText ?? "").replace(/\s+/g, " ").slice(0, 600);
    const goEl = document.querySelector(".ls-bottom .m1-g > :last-child");
    const g = goEl ? { txt: goEl.innerText.trim(), dis: goEl.disabled || goEl.getAttribute("aria-disabled"), y: Math.round(goEl.getBoundingClientRect().bottom) } : null;
    const pinks = [...document.querySelectorAll(".m1-gopill, [class*=gopill], [class*=GoPill]")].filter(e => e.offsetParent).length;
    return { t, g, pinks, em: document.body.innerText.includes("—"), hs: document.documentElement.scrollWidth > innerWidth, sh: document.documentElement.scrollHeight };
  });
  console.log(`#${i} step=${step} kind=${kind} go=${JSON.stringify(info.g)} em=${info.em} hscroll=${info.hs} pageH=${info.sh}\n   ${info.t}`);
  if (kind === "done" || !kind) break;
  const before = step;
  try {
    const skip = p.getByRole("button", { name: "Skip this step" });
    if (kind === "check") await p.getByText("skip the challenge").click({ timeout: 3000 });
    else if (kind === "ear") { for (let k = 0; k < 20 && (await p.locator(".fl").getAttribute("data-page-kind")) === "ear"; k++) { await p.locator('[role="radio"]:not([disabled]), .ls-pad:not([disabled])').first().click({ timeout: 2000 }).catch(() => {}); await p.waitForTimeout(250); await go.click({ timeout: 2000 }).catch(() => {}); await p.waitForTimeout(250); } }
    else if (await go.isDisabled().catch(() => false) || /not yet/.test(await go.innerText().catch(() => ""))) { if (await skip.count()) await skip.first().click(); else { errs.push(`go disabled on ${kind}, no skip`); await go.click({ force: true, timeout: 2000 }).catch(() => {}); } }
    else await go.click({ timeout: 4000 });
  } catch (e) { errs.push(`threw on ${kind}: ${String(e.message).split("\n")[0].slice(0, 150)}`); const skip = p.getByRole("button", { name: "Skip this step" }); if (await skip.count()) await skip.first().click().catch(() => {}); }
  await p.waitForTimeout(900);
  const after = await p.locator(".fl").getAttribute("data-step").catch(() => null);
  if (after === before) { if (++stuck > 2) { errs.push(`stuck on ${kind}`); break; } } else stuck = 0;
}
console.log("ERRS", JSON.stringify(errs));
await b.close();
