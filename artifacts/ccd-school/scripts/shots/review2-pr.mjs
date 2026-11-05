import { chromium } from "playwright";
const OUT = "/tmp/claude-0/-home-claude/14482081-5c9f-509e-afde-b9b4be190bf9/scratchpad/review2/shots";
const [W, H] = (process.argv[2] ?? "390x844").split("x").map(Number);
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const p = await (await b.newContext({ viewport: { width: W, height: H } })).newPage();
const errs = []; p.on("pageerror", e => errs.push(e.message));
await p.goto("http://localhost:3100/learn/midi-piano-roll", { waitUntil: "load" }); await p.waitForTimeout(2000);
const go = p.locator(".ls-bottom .m1-g > :last-child").first();
await go.click(); await p.waitForTimeout(800); await go.click(); await p.waitForTimeout(1200);
// find note elements: pink bars
const notes = await p.evaluate(() => [...document.querySelectorAll("button,[role=button],div")].filter(e => { const s = getComputedStyle(e); return /rgb\(2[34]\d, (7\d|8\d), 1[45]\d\)/.test(s.backgroundColor) && e.getBoundingClientRect().width > 10 && e.getBoundingClientRect().height < 20; }).map(e => { const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height, tag: e.tagName, al: e.getAttribute("aria-label") }; }));
console.log("notes", JSON.stringify(notes.slice(0, 6)));
const cells = await p.evaluate(() => { const c = [...document.querySelectorAll("[aria-label]")].filter(e => /step|row|cell|note/i.test(e.getAttribute("aria-label"))).slice(0, 4).map(e => ({ al: e.getAttribute("aria-label"), w: e.getBoundingClientRect().width, h: e.getBoundingClientRect().height })); return c; });
console.log("cells", JSON.stringify(cells));
console.log(await p.locator("[aria-label^=\"c4, step 9\"]").first().evaluate(e=>e.outerHTML.slice(0,300))); await p.locator("[aria-label^=\"c4, step 9\"]").first().click(); await p.waitForTimeout(700);
await p.screenshot({ path: `${OUT}/pr-sel-${W}.png`, fullPage: true });
const txt = await p.evaluate(() => document.querySelector(".fl").innerText.replace(/\s+/g, " ").slice(0, 900));
console.log(txt);
const longer = p.getByRole("button", { name: /longer/i }).first();
if (await longer.count()) { await longer.click(); await longer.click(); await p.waitForTimeout(400); console.log("after longer:", await p.evaluate(() => document.querySelector(".fl").innerText.match(/.{0,80}(step|beat|long).{0,80}/gi)?.slice(0, 5))); }
const softer = p.getByRole("button", { name: /softer|quieter/i }).first(); if (await softer.count()) { await softer.click(); }
await p.screenshot({ path: `${OUT}/pr-edit-${W}.png` });
console.log("after", await p.evaluate(() => document.querySelector(".fl").innerText.replace(/\s+/g, " ").slice(0, 900)));
console.log("buttons", await p.evaluate(() => [...document.querySelectorAll(".fl button")].filter(b => b.offsetParent).map(b => (b.innerText || b.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ")).filter(Boolean).filter(t=>!/step \d/.test(t)).join(" | ")));
console.log(errs);
await b.close();
