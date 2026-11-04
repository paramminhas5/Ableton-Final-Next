import { chromium } from "playwright";
const OUT = "/tmp/claude-0/-home-claude/14482081-5c9f-509e-afde-b9b4be190bf9/scratchpad/review1/shots/world";
import { mkdirSync } from "node:fs"; mkdirSync(OUT, { recursive: true });
const b = await chromium.launch();
for (const [w, h] of [[390, 844], [1440, 900]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
  for (const id of ["fundamentals", "producer", "dj"]) {
    await p.goto(`http://localhost:3100/learn/world/${id}`, { waitUntil: "load" }); await p.waitForTimeout(2000);
    await p.screenshot({ path: `${OUT}/${id}-${w}-song.png` });
    const l = p.getByRole("radio", { name: /^list$/ }).first();
    if (await l.count()) { await l.click(); await p.waitForTimeout(900); await p.screenshot({ path: `${OUT}/${id}-${w}-list.png` }); await p.screenshot({ path: `${OUT}/${id}-${w}-list-full.png`, fullPage: true }); }
    else console.log("no list toggle", id, w);
    // tap a +N
    await p.getByRole("radio", { name: /^song$/ }).first().click().catch(() => {});
    await p.waitForTimeout(500);
    const plus = p.locator(".jv-row :is(a,button)", { hasText: /^\+\d+$/ }).first();
    if (await plus.count()) { await plus.click({timeout:3000}).catch(()=>{}); await p.waitForTimeout(800); await p.screenshot({ path: `${OUT}/${id}-${w}-plus.png` }); }
  }
}
await b.close();
