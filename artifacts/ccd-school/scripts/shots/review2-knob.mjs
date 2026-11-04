import { chromium } from "playwright";
const OUT = "/tmp/claude-0/-home-claude/14482081-5c9f-509e-afde-b9b4be190bf9/scratchpad/review2/shots";
const [slug, n] = [process.argv[2], Number(process.argv[3])];
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await p.goto("http://localhost:3100/learn/" + slug, { waitUntil: "load" }); await p.waitForTimeout(2000);
const go = p.locator(".ls-bottom .m1-g > :last-child").first();
for (let i = 0; i < n; i++) { const t = await go.innerText(); if (/more|not yet/.test(t)) await p.getByRole("button", { name: /^skip/i }).first().click(); else await go.click(); await p.waitForTimeout(900); }
console.log("kind", await p.locator(".fl").getAttribute("data-page-kind"));
const fi = () => p.evaluate(() => { const e = document.activeElement; return { tag: e.tagName, role: e.getAttribute("role"), label: (e.getAttribute("aria-label") || e.innerText || "").trim().replace(/\s+/g, " ").slice(0, 40), vnow: e.getAttribute("aria-valuenow"), vtext: e.getAttribute("aria-valuetext"), vmax: e.getAttribute("aria-valuemax") }; });
const sliders = await p.evaluate(() => [...document.querySelectorAll("[role=slider]")].map(e => (e.getAttribute("aria-label") || "") + " tabindex=" + e.tabIndex + " now=" + e.getAttribute("aria-valuetext") ?? e.getAttribute("aria-valuenow")));
console.log("sliders", sliders);
for (let i = 0; i < 40; i++) { await p.keyboard.press("Tab"); const f = await fi(); if (f.role === "slider") { console.log("focus", JSON.stringify(f)); for (const k of ["ArrowUp", "ArrowUp", "ArrowRight", "PageUp", "Home", "End"]) { await p.keyboard.press(k); await p.waitForTimeout(200); const g = await fi(); console.log(" ", k, g.vtext || g.vnow); } await p.screenshot({ path: `${OUT}/kbd-knob-${slug}.png` }); break; } }
await b.close();
