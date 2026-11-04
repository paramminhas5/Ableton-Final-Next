import { chromium } from "playwright";
const OUT = "/tmp/claude-0/-home-claude/14482081-5c9f-509e-afde-b9b4be190bf9/scratchpad/review2/shots";
const [W, H] = (process.argv[2] ?? "390x844").split("x").map(Number);
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
await p.goto("http://localhost:3100/dashboard?tour=1", { waitUntil: "load" }); await p.waitForTimeout(2500);
for (let i = 1; i <= 6; i++) {
  await p.screenshot({ path: `${OUT}/tour-${W}-${i}.png` });
  const info = await p.evaluate(() => {
    const t = [...document.querySelectorAll("*")].find(e => /\d of 5/.test(e.innerText || "") && e.children.length === 0);
    const box = t?.closest("[role=dialog],div")?.parentElement?.getBoundingClientRect();
    return { text: t?.parentElement?.innerText?.replace(/\s+/g, " ").slice(0, 160), scrollY };
  });
  console.log(i, JSON.stringify(info));
  const n = p.getByRole("button", { name: /^(next|done|got it|finish)/i }).first();
  if (!(await n.count())) break;
  await n.click().catch(e => console.log("click fail", e.message.split("\n")[0])); await p.waitForTimeout(900);
}
// scroll containers on dashboard
await p.goto("http://localhost:3100/dashboard", { waitUntil: "load" }); await p.waitForTimeout(2000);
await p.screenshot({ path: `${OUT}/dash-${W}.png` });
console.log(await p.evaluate(() => [...document.querySelectorAll("*")].filter(e => { const s = getComputedStyle(e); return (s.overflowY === "auto" || s.overflowY === "scroll" || s.overflowY === "hidden") && e.scrollHeight > e.clientHeight + 4 && e.clientHeight > 100; }).map(e => ({ cls: e.className?.toString().slice(0, 60), ch: e.clientHeight, sh: e.scrollHeight, ov: getComputedStyle(e).overflowY }))));
await b.close();
