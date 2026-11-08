// Console errors on a page. Usage: node scripts/shots/console.mjs <url> [w] [h]
import { chromium } from "playwright";
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: Number(process.argv[3] ?? 390), height: Number(process.argv[4] ?? 844) } })).newPage();
p.on("console", m => { if (m.type() === "error" || m.type() === "warning") console.log(m.type(), m.text().slice(0, 400)); });
p.on("pageerror", e => console.log("pageerror", e.message.slice(0, 300)));
await p.goto(process.argv[2], { waitUntil: "load" });
await p.waitForTimeout(4000);
await b.close();
