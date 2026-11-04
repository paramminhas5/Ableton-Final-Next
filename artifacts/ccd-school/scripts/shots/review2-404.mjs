import { chromium } from "playwright";
const b = await chromium.launch(); const p = await b.newPage();
p.on("response", r => { if (r.status() >= 400) console.log(r.status(), r.url()); });
await p.goto("http://localhost:3100/worlds", { waitUntil: "load" }); await p.waitForTimeout(2000); await b.close();
