import { chromium } from "playwright";
const slug = process.argv[2];
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
p.on("pageerror", e => console.log("PAGEERROR", e.message.slice(0, 300)));
p.on("console", m => { if (m.type() === "error") console.log("CONSOLE", m.text().slice(0, 300)); });
await p.goto(`http://localhost:3100/learn/${slug}`, { waitUntil: "load" });
await p.waitForSelector(".fl");
for (let i = 0; i < 3; i++) { await p.locator(".ls-bottom .m1-g > :last-child").first().click(); await p.waitForTimeout(800); console.log("kind", await p.locator(".fl").getAttribute("data-page-kind")); }
await p.waitForTimeout(3000);
console.log("after wait", await p.locator(".fl").getAttribute("data-page-kind").catch(e => "ERR " + e.message.slice(0, 100)));
await p.screenshot({ path: "/tmp/claude-0/-home-claude/14482081-5c9f-509e-afde-b9b4be190bf9/scratchpad/one.png" });
await b.close();
