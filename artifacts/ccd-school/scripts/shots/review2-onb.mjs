import { chromium } from "playwright";
const OUT = "/tmp/claude-0/-home-claude/14482081-5c9f-509e-afde-b9b4be190bf9/scratchpad/review2/shots";
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
for (let run = 0; run < 6; run++) {
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  await p.goto("http://localhost:3100/", { waitUntil: "load" }); await p.waitForTimeout(1800);
  const c = async t => { await p.getByRole("button", { name: t }).first().click(); await p.waitForTimeout(700); };
  try {
    await c(/show me/); await c(/next: make/); await c(/next: practice/);
    const q = await p.evaluate(() => document.body.innerText.replace(/\s+/g, " ").match(/which[^?]*\?|higher[^?]*\?/i)?.[0]);
    await c(/play the two notes/); await p.waitForTimeout(1500);
    await c(/^first$/);
    const fb = await p.evaluate(() => document.body.innerText.replace(/\s+/g, " ").match(/(right|not quite|nope|wrong|actually)[^.]{0,80}/i)?.[0] ?? document.body.innerText.replace(/\s+/g, " ").match(/higher\?.{0,160}/)?.[0]);
    if (run === 0) await p.screenshot({ path: `${OUT}/onb-practice.png` });
    console.log(run, "Q:", q, "| answered first ->", fb);
  } catch (e) { console.log(run, "err", e.message.split("\n")[0]); }
  await p.context().close();
}
await b.close();
