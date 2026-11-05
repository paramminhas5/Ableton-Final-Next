import { chromium } from "playwright";
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
const pages = ["/", "/dashboard", "/worlds", "/learn/world/fundamentals", "/learn/world/producer", "/learn/world/dj", "/gym", "/studio", "/sound", "/upgrade", "/profile", "/settings", "/wiki", "/glossary", "/leaderboard", "/placement", "/daily", "/review", "/shop", "/learn/tempo-bpm", "/learn/the-drop", "/missions", "/path", "/atlas"];
for (const u of pages) {
  const r = await p.goto("http://localhost:3100" + u, { waitUntil: "load" }).catch(() => null); await p.waitForTimeout(1300);
  const i = await p.evaluate(() => {
    const t = document.body.innerText;
    const up = [...document.querySelectorAll("body *")].filter(e => e.offsetParent && getComputedStyle(e).textTransform === "uppercase" && e.innerText?.trim()).map(e => e.innerText.trim().slice(0, 25)).slice(0, 5);
    const caps = (t.match(/\b[A-Z]{3,}\b/g) || []).filter(w => !["CCD", "BPM", "EQ", "DJ", "MIDI", "LFO", "ADSR", "DAW", "XP"].includes(w)).slice(0, 6);
    const pinkGo = [...document.querySelectorAll("body *")].filter(e => { if (!e.offsetParent) return false; const s = getComputedStyle(e); const re = /rgb\(255, 79, 154\)/; return re.test(s.backgroundColor) || re.test(s.backgroundImage) ; }).length;
    return { title: document.title, em: (t.match(/.{0,30}—.{0,30}/g) || []).slice(0, 3), n153: /\d{3} missions|missions/i.test(t) ? t.match(/.{0,30}missions.{0,30}/i)[0] : null, up, caps, pinkBg: pinkGo, notfound: /that page isn't here/.test(t) };
  });
  console.log(u, r?.status(), JSON.stringify(i));
}
await b.close();
