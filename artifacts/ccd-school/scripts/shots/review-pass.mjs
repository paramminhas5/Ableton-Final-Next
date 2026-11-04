import { chromium, webkit } from "playwright";
const OUT = "/tmp/claude-0/-home-claude/14482081-5c9f-509e-afde-b9b4be190bf9/scratchpad/review1/shots";
const base = "http://localhost:3100";
const pages = process.argv[2].split(",");
const sizes = (process.argv[3] ?? "390x844,1440x900").split(",");
const eng = process.argv[4] === "webkit" ? webkit : chromium;
const b = await eng.launch(process.argv[4] === "webkit" ? {} : { args: ["--autoplay-policy=no-user-gesture-required"] });
for (const s of sizes) {
  const [w, h] = s.split("x").map(Number);
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  for (const path of pages) {
    const p = await ctx.newPage();
    const errs = [];
    p.on("pageerror", e => errs.push(e.message));
    p.on("console", m => { if (m.type() === "error") errs.push("console: " + m.text()); });
    await p.goto(base + path, { waitUntil: "load", timeout: 60000 });
    await p.waitForTimeout(2500);
    const tag = (path.replace(/\//g, "_") || "_root") + "-" + w;
    await p.screenshot({ path: `${OUT}/${tag}.png` });
    await p.screenshot({ path: `${OUT}/${tag}-full.png`, fullPage: true });
    const info = await p.evaluate(() => {
      const ov = document.documentElement.scrollWidth > window.innerWidth;
      const em = document.body.innerText.includes("—");
      const btns = [...document.querySelectorAll("button,a")].filter(e => e.offsetParent).map(e => (e.innerText || e.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ")).filter(Boolean).slice(0, 60);
      return { url: location.pathname, title: document.title, hscroll: ov, sw: document.documentElement.scrollWidth, emdash: em, h: document.documentElement.scrollHeight, btns };
    });
    console.log(JSON.stringify({ tag, ...info, errs: errs.slice(0, 5) }));
    await p.close();
  }
  await ctx.close();
}
await b.close();
