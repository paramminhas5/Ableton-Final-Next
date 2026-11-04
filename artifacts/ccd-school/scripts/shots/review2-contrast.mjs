import { chromium } from "playwright";
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, colorScheme: "light" })).newPage();
for (const u of ["/learn/tempo-bpm", "/dashboard", "/learn/world/fundamentals", "/gym", "/studio"]) {
  await p.goto("http://localhost:3100" + u, { waitUntil: "load" }); await p.waitForTimeout(1600);
  const r = await p.evaluate(() => {
    const lum = c => { const m = c.match(/[\d.]+/g); if (!m) return null; const [r, g, b] = m.slice(0, 3).map(Number).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
    const bgOf = e => { while (e) { const s = getComputedStyle(e); const m = s.backgroundColor.match(/[\d.]+/g); if (m && (m.length < 4 || Number(m[3]) > 0.8)) return s.backgroundColor; e = e.parentElement; } return "rgb(255,255,255)"; };
    const out = [];
    for (const e of document.querySelectorAll("body *")) {
      if (!e.offsetParent || !e.childNodes.length || ![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
      const s = getComputedStyle(e); const fg = s.color; const op = Number(s.opacity);
      const L1 = lum(fg), L2 = lum(bgOf(e)); if (L1 == null || L2 == null) continue;
      const cr = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
      if (cr < 3) out.push(`${cr.toFixed(2)} ${parseFloat(s.fontSize)}px "${e.innerText.trim().slice(0, 30)}"`);
    }
    return [...new Set(out)].slice(0, 12);
  });
  console.log(u, r);
}
await b.close();
