import { chromium, webkit } from "playwright";
const OUT = "/tmp/claude-0/-home-claude/14482081-5c9f-509e-afde-b9b4be190bf9/scratchpad/review1/shots";
const eng = process.argv[2] === "webkit" ? webkit : chromium;
const b = await eng.launch();
for (const [w, h] of [[390, 844], [1440, 900]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  await p.goto("http://localhost:3100/studio", { waitUntil: "load" }); await p.waitForTimeout(7000);
  await p.screenshot({ path: `${OUT}/studio-${process.argv[2] ?? "cr"}-${w}-late.png` });
  console.log(w, JSON.stringify(await p.evaluate(() => { const q = s => { const e = document.querySelector(s); return e && e.getBoundingClientRect().toJSON(); }; return { transport: q(".st-transport"), tray: q(".st-tray"), live: [...document.querySelectorAll("button,a")].filter(e => /to live/.test(e.innerText)).map(e => { const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height, getComputedStyle(e.parentElement).position]; }), tp: (() => { const e = document.querySelector(".st-transport"); return e && getComputedStyle(e).position; })() }; })));
}
await b.close();
