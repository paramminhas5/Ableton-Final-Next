import { chromium } from "playwright";
const [base, out] = process.argv.slice(2);
const b = await chromium.launch();
for (const [n, w, h] of [["laptop", 1440, 900], ["phone", 390, 844]]) {
  const p = await (await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })).newPage();
  await p.goto(base + "/", { waitUntil: "load", timeout: 180000 }); await p.waitForTimeout(2500);
  await p.evaluate(() => document.querySelectorAll("nextjs-portal").forEach(e => e.remove()));
  await p.screenshot({ path: `${out}-${n}.png`, fullPage: true });
}
await b.close();
