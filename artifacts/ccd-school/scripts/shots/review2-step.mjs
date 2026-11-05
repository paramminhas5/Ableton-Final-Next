// open lesson, press next N times, screenshot viewport+full, dump info
import { chromium, webkit } from "playwright";
const OUT = "/tmp/claude-0/-home-claude/14482081-5c9f-509e-afde-b9b4be190bf9/scratchpad/review2/shots";
const [slug, n, size, engName, scheme] = process.argv.slice(2);
const [W, H] = (size ?? "390x844").split("x").map(Number);
const eng = engName === "webkit" ? webkit : chromium;
const b = await eng.launch(eng === chromium ? { args: ["--autoplay-policy=no-user-gesture-required"] } : {});
const ctx = await b.newContext({ viewport: { width: W, height: H }, colorScheme: scheme || "dark" });
const p = await ctx.newPage(); const errs = [];
p.on("pageerror", e => errs.push(e.message.slice(0, 200)));
await p.goto(`http://localhost:3100${slug.startsWith("/") ? slug : "/learn/" + slug}`, { waitUntil: "load" });
await p.waitForTimeout(2000);
const go = p.locator(".ls-bottom .m1-g > :last-child").first();
for (let i = 0; i < Number(n || 0); i++) { await go.click({ timeout: 5000 }).catch(e => errs.push("go: " + e.message.split("\n")[0])); await p.waitForTimeout(900); }
const tag = `${slug.replace(/\//g, "_")}-n${n}-${W}${engName === "webkit" ? "-wk" : ""}${scheme ? "-" + scheme : ""}`;
await p.screenshot({ path: `${OUT}/${tag}.png` });
await p.screenshot({ path: `${OUT}/${tag}-full.png`, fullPage: true });
const info = await p.evaluate(() => {
  const fl = document.querySelector(".fl");
  return { kind: fl?.getAttribute("data-page-kind"), step: fl?.getAttribute("data-step"), text: (document.body.innerText).replace(/\s+/g, " ").slice(0, 1500), hs: document.documentElement.scrollWidth > innerWidth, em: document.body.innerText.includes("—"), sh: document.documentElement.scrollHeight };
});
console.log(tag, JSON.stringify(info, null, 1), errs);
await b.close();
