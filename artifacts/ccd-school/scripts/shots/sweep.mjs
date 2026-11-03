// Bug sweep: open each main screen, click every visible link and button, and report the ones that
// throw, land on an error page, or visibly do nothing.
// Usage: node scripts/shots/sweep.mjs [base url] [chromium|webkit] [path ...]
import { chromium, webkit } from "playwright";
const base = process.argv[2] ?? "http://localhost:3000";
const name = process.argv[3] ?? "chromium";
const paths = process.argv.slice(4).length ? process.argv.slice(4) : ["/", "/dashboard", "/studio", "/dj", "/learn", "/path", "/profile"];
const b = await (name === "webkit" ? webkit : chromium).launch(name === "chromium" ? { args: ["--autoplay-policy=no-user-gesture-required"] } : {});
const report = [];
const noise = /analytics|favicon|auth|posthog|500 \(Internal|ClientFetchError/i;

async function fresh(path) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on("pageerror", e => errs.push(e.message.slice(0, 160)));
  p.on("console", m => { if (m.type() === "error" && !noise.test(m.text())) errs.push(m.text().slice(0, 160)); });
  await p.addInitScript(() => localStorage.setItem("ccd.studio.seeded", "1"));
  const r = await p.goto(base + path, { waitUntil: "domcontentloaded", timeout: 120000 }).catch(e => ({ status: () => 0, err: e }));
  await p.waitForTimeout(1200);
  return { ctx, p, errs, status: r?.status?.() ?? 0 };
}

for (const path of paths) {
  const { ctx, p, errs, status } = await fresh(path);
  const items = await p.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 4 && r.height > 4 && s.visibility !== "hidden" && s.display !== "none" && !el.disabled && el.getAttribute("aria-disabled") !== "true"; };
    return [...document.querySelectorAll("a[href], button, [role=button], [role=radio], [role=tab]")].filter(vis).map((el, i) => ({ i, tag: el.tagName, text: (el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 40), href: el.getAttribute("href") || "" }));
  });
  console.log(`${path}: HTTP ${status}, ${items.length} controls`);
  await ctx.close();
  for (const it of items) {
    if (/^(play|rec|stop)$/i.test(it.text) && path !== "/studio") continue;
    const s = await fresh(path);
    try {
      const sel = "a[href], button, [role=button], [role=radio], [role=tab]";
      const loc = s.p.locator(sel);
      // Find the same control again by index among the visible ones.
      const handle = await s.p.evaluateHandle(i => {
        const vis = el => { const r = el.getBoundingClientRect(); const st = getComputedStyle(el); return r.width > 4 && r.height > 4 && st.visibility !== "hidden" && st.display !== "none" && !el.disabled && el.getAttribute("aria-disabled") !== "true"; };
        return [...document.querySelectorAll("a[href], button, [role=button], [role=radio], [role=tab]")].filter(vis)[i];
      }, it.i);
      const before = await s.p.evaluate(() => document.body.innerHTML.length + "|" + location.pathname + document.body.innerText.slice(0, 400));
      const url0 = s.p.url();
      await handle.asElement().click({ timeout: 4000, noWaitAfter: true });
      await s.p.waitForTimeout(700);
      const after = await s.p.evaluate(() => document.body.innerHTML.length + "|" + location.pathname + document.body.innerText.slice(0, 400));
      const url1 = s.p.url();
      const text = await s.p.evaluate(() => document.body.innerText.slice(0, 200));
      const broken = /application error|something went wrong|404|this page could not be found/i.test(text);
      let verdict = "";
      if (s.errs.length) verdict = `errors: ${s.errs[0]}`;
      else if (broken) verdict = "error page";
      else if (before === after && url0 === url1 && !/^(sound|eq|fx|mix|play|mode)/i.test(it.text)) verdict = "does nothing";
      if (verdict) report.push(`${path}  [${it.tag.toLowerCase()}] "${it.text}" ${it.href ? "-> " + it.href : ""}  ${verdict}`);
    } catch (e) {
      report.push(`${path}  [${it.tag.toLowerCase()}] "${it.text}"  could not click: ${String(e.message).split("\n")[0].slice(0, 80)}`);
    }
    await s.ctx.close();
  }
}
console.log(`\n${name}: ${report.length} problems`);
for (const r of report) console.log("  " + r);
await b.close();
