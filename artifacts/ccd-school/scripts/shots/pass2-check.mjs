// Re-checks the pass 2 fixes: phone play-in, dashboard and tour, gym, world tiles, the drop's keep step.
import { chromium, webkit } from "playwright";
const OUT = process.env.OUT ?? "/tmp";
const B = process.env.BASE ?? "http://localhost:3100";
const eng = process.argv[2] === "webkit" ? webkit : chromium;
const b = await eng.launch({ args: eng === chromium ? ["--autoplay-policy=no-user-gesture-required"] : [] });
const shot = async (p, n) => p.screenshot({ path: `${OUT}/${n}.png` });
const nextTo = async (p, kind) => { for (let i = 0; i < 12; i++) { if ((await p.locator(".fl").getAttribute("data-page-kind")) === kind) return true; await p.locator(".ls-bottom .m1-g > :last-child").first().click(); await p.waitForTimeout(500); } return false; };
for (const [w, h] of [[390, 844], [1440, 900]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  p.on("pageerror", e => console.log("PAGEERROR", e.message.slice(0, 200)));
  await p.goto(B + "/learn/tempo-bpm", { waitUntil: "load" }); await p.waitForSelector(".fl");
  await nextTo(p, "play"); await p.waitForTimeout(400);
  const pad = await p.locator(".ls-tray .ls-key").first().boundingBox(); const bar = await p.locator(".ls-bottom .m1-g").boundingBox();
  console.log(w, "kick pad bottom", Math.round(pad.y + pad.height), "bar top", Math.round(bar.y), pad.y + pad.height <= bar.y ? "CLEAR" : "COVERED");
  // keyboard: focus the kick and press space
  await p.locator(".ls-tray .ls-key").first().focus(); await p.keyboard.press("Space");
  await shot(p, `play-${w}`);
  await p.goto(B + "/learn/the-drop", { waitUntil: "load" }); await p.waitForSelector(".fl");
  await nextTo(p, "arrange");
  // take the drums out of section 2 so the goal is met
  const cells = p.locator(".ar-cell"); const n = await cells.count(); console.log("arrange cells", n);
  for (let i = 0; i < n; i++) { const l = await cells.nth(i).getAttribute("aria-label"); if (/^drums in \S+ 2,/i.test(l ?? "")) { await cells.nth(i).click(); break; } }
  await p.getByRole("button", { name: "Keep this arrangement" }).click(); await p.waitForTimeout(600);
  console.log(w, "drop add title:", await p.locator(".ls-title").first().textContent());
  await shot(p, `drop-add-${w}`);
  await p.goto(B + "/dashboard?tour=1", { waitUntil: "load" }); await p.waitForTimeout(1500); await shot(p, `tour1-${w}`);
  await p.goto(B + "/dashboard", { waitUntil: "load" }); await p.waitForTimeout(1200); await shot(p, `dash-${w}`);
  await p.goto(B + "/gym", { waitUntil: "load" }); await p.waitForTimeout(1200); await shot(p, `gym-${w}`);
  await p.goto(B + "/learn/world/producer", { waitUntil: "load" }); await p.waitForTimeout(1200); await shot(p, `world-${w}`);
  for (const u of ["/missions", "/practice"]) { await p.goto(B + u, { waitUntil: "load" }); console.log(u, "->", new URL(p.url()).pathname, "|", await p.title()); }
  await p.close();
}
await b.close();
