import { chromium } from "playwright";
const OUT = "/tmp/claude-0/-home-claude/14482081-5c9f-509e-afde-b9b4be190bf9/scratchpad/review2/shots";
const [W, H] = (process.argv[2] ?? "1440x900").split("x").map(Number);
const slug = process.argv[3] ?? "tempo-bpm";
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
await p.goto("http://localhost:3100/learn/" + slug, { waitUntil: "load" }); await p.waitForTimeout(2000);
const fi = () => p.evaluate(() => { const e = document.activeElement; const r = e.getBoundingClientRect(); return { tag: e.tagName, role: e.getAttribute("role"), label: (e.getAttribute("aria-label") || e.innerText || "").trim().replace(/\s+/g, " ").slice(0, 40), vis: r.top >= 0 && r.bottom <= innerHeight, vnow: e.getAttribute("aria-valuenow"), vtext: e.getAttribute("aria-valuetext") }; });
const kind = () => p.locator(".fl").getAttribute("data-page-kind");
async function cycle() { await p.evaluate(() => document.activeElement?.blur()); await p.locator("body").focus().catch(() => {}); const out = []; for (let i = 0; i < 70; i++) { await p.keyboard.press("Tab"); const f = await fi(); if (out.length && f.label === out[0].label && f.tag === out[0].tag) break; out.push(f); } return out; }
for (let s = 0; s < 6; s++) {
  const k = await kind(); const c = await cycle();
  console.log(`STEP ${s} kind=${k} stops=${c.length}: ` + c.map(f => `${f.role ? "[" + f.role + "]" : ""}${f.label}${f.vnow ? "=" + (f.vtext || f.vnow) : ""}${f.vis ? "" : "(offscreen)"}`).join(" | "));
  // test sliders
  for (let i = 0; i < 70; i++) { await p.keyboard.press("Tab"); const f = await fi(); if (f.role === "slider") { const v0 = f.vtext || f.vnow; await p.keyboard.press("ArrowUp"); await p.keyboard.press("ArrowUp"); await p.keyboard.press("ArrowRight"); const f2 = await fi(); console.log(`  slider ${f.label}: ${v0} -> ${f2.vtext || f2.vnow}`); await p.keyboard.press("ArrowDown"); await p.keyboard.press("ArrowDown"); await p.keyboard.press("ArrowLeft"); break; } if (i > 40) break; }
  if (k === "play") {
    // reach rec via tab and press Enter; then try keyboard pad hits
    for (let i = 0; i < 70; i++) { await p.keyboard.press("Tab"); const f = await fi(); if (/record/i.test(f.label)) { await p.keyboard.press("Enter"); break; } }
    await p.waitForTimeout(2000);
    for (let i = 0; i < 70; i++) { await p.keyboard.press("Tab"); const f = await fi(); if (/^kick/i.test(f.label)) { console.log("  kick focus reached after", i + 1); for (let j = 0; j < 4; j++) { await p.keyboard.press(process.env.KEY || "Enter"); await p.waitForTimeout(470); } break; } }
    await p.waitForTimeout(600);
    console.log("  after keyboard kicks:", await p.evaluate(() => document.querySelector(".fl").innerText.replace(/\s+/g, " ").match(/(\d+ (kicks?|notes?)|nothing yet)[^.]{0,30}/)?.[0]));
    await p.screenshot({ path: `${OUT}/kbd-play-${W}.png` });
  }
  // Enter on go
  let ok = false;
  for (let i = 0; i < 70; i++) { await p.keyboard.press("Tab"); const f = await fi(); if (/^(next|use|keep|add|earn|\d more)/i.test(f.label) && f.tag === "BUTTON") { if (/\d more/i.test(f.label)) { console.log("  go says", f.label, "-> using skip"); for (let j = 0; j < 70; j++) { await p.keyboard.press("Shift+Tab"); const g = await fi(); if (/^skip/i.test(g.label)) break; } } await p.keyboard.press("Enter"); ok = true; break; } }
  await p.waitForTimeout(1100);
  await p.screenshot({ path: `${OUT}/kbd-${slug}-${s}-${W}.png` });
  if (!ok) { console.log("  could not reach go"); break; }
}
await b.close();
