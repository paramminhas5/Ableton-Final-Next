import { chromium } from "playwright";
const OUT = "/tmp/claude-0/-home-claude/14482081-5c9f-509e-afde-b9b4be190bf9/scratchpad/review2/shots";
const [W, H] = (process.argv[2] ?? "390x844").split("x").map(Number);
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
const errs = []; p.on("pageerror", e => errs.push(e.message));
await p.goto("http://localhost:3100/sound", { waitUntil: "load" }); await p.waitForTimeout(2000);
await p.getByRole("button", { name: /^play/i }).first().click(); await p.waitForTimeout(1200);
await p.screenshot({ path: `${OUT}/sound-play-${W}.png` });
await p.mouse.wheel(0, 900); await p.waitForTimeout(700);
await p.screenshot({ path: `${OUT}/sound-scrolled-${W}.png` });
console.log("btns", await p.evaluate(() => [...document.querySelectorAll("button")].filter(b => b.offsetParent).map(b => (b.innerText || b.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ")).join(" | ")));
await p.mouse.wheel(0, -3000); await p.waitForTimeout(400);
await p.getByRole("button", { name: /blind test/i }).click(); await p.waitForTimeout(1200);
for (let r = 0; r < 7; r++) {
  await p.screenshot({ path: `${OUT}/sound-blind-${W}-${r}.png` });
  const t = await p.evaluate(() => document.querySelector("main")?.innerText.replace(/\s+/g, " ").slice(0, 500));
  console.log("R", r, t);
  const btns = await p.evaluate(() => [...document.querySelectorAll("main button")].filter(b => b.offsetParent).map(b => (b.innerText || b.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ")));
  console.log("  btns", btns.join(" | "));
  const pick = p.getByRole("button", { name: /^i like x/i }).first();
  if (await pick.count()) { await pick.click(); await p.waitForTimeout(600); console.log("  after pick:", (await p.evaluate(() => document.querySelector("main")?.innerText.replace(/\s+/g, " ").slice(0, 300)))); }
  const nx = p.getByRole("button", { name: /^(next|next round|see (my )?score|finish|done|reveal|show)/i }).first();
  if (await nx.count()) { await nx.click(); await p.waitForTimeout(800); } else if (!(await pick.count())) break;
}
console.log(errs);
await b.close();
