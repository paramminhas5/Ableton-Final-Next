// Screenshots of the instrument pictures and controls (the "world apart" pass).
// Usage: node scripts/shots/inst.mjs <base> [chromium|webkit] [scenario,...] [out dir]
// Each scenario runs at 390x844 and 1440x900, light and dark (webkit: 390 only).
import { chromium, webkit } from "playwright";
import { mkdirSync } from "node:fs";
const base = process.argv[2] ?? "http://localhost:3400";
const engName = process.argv[3] === "webkit" ? "webkit" : "chromium";
const eng = engName === "webkit" ? webkit : chromium;
const only = (process.argv[4] ?? "").split(",").filter(Boolean);
const OUT = process.argv[5] ?? "/tmp/claude-0/-home-claude/14482081-5c9f-509e-afde-b9b4be190bf9/scratchpad/inst";
mkdirSync(OUT, { recursive: true });

const hold = async (p, loc, ms = 260, at = 0.5) => {
  const b = await loc.boundingBox();
  if (!b) return;
  await p.mouse.move(b.x + b.width / 2, b.y + b.height * at);
  await p.mouse.down();
  await p.waitForTimeout(ms);
  return async () => p.mouse.up();
};

const toLesson = async (p, slug, kind, nth = 0) => {
  await p.goto(`${base}/learn/${slug}`, { waitUntil: "load" });
  await p.waitForSelector(".fl", { timeout: 60000 });
  let seen = 0;
  for (let i = 0; i < 20; i++) {
    const k = await p.locator(".fl").getAttribute("data-page-kind");
    if (k === kind && seen++ === nth) return true;
    if (k === "done") return false;
    const skip = p.getByRole("button", { name: "Skip this step" });
    if (k === "play" || (await skip.count())) await skip.first().click();
    else await p.locator(".ls-bottom .m1-g > :last-child").first().click();
    await p.waitForTimeout(400);
  }
  return false;
};

const studioLayer = async (p, name) => {
  await p.goto(`${base}/studio`, { waitUntil: "load" });
  await p.waitForSelector(".st-slots", { timeout: 60000 });
  await p.waitForTimeout(800);
  const slot = p.locator(".st-slot", { hasText: new RegExp(`^${name}$`) });
  if (!(await slot.count())) {
    await p.getByRole("button", { name: "Add a layer" }).click();
    await p.locator(".st-sp", { hasText: new RegExp(`^${name}$`) }).first().click();
  } else await slot.first().click();
  await p.waitForTimeout(300);
};

const SCENES = {
  // the envelope and filter in the studio's sound bank, mid-note
  "studio-lead": async (p, shot) => {
    await studioLayer(p, "lead");
    await p.getByRole("radio", { name: "pads" }).click().catch(() => {});
    const pad = p.locator(".st-tray .st-sp").nth(5);
    const up = await hold(p, pad, 120);
    await shot("held");
    await up?.();
    await p.waitForTimeout(140);
    await shot("released");
  },
  "studio-bass2": async (p, shot) => {
    await studioLayer(p, "bass");
    await p.getByRole("radio", { name: "sound" }).click();
    await p.getByRole("radio", { name: "sound" }).click();
    await p.getByRole("button", { name: "Play" }).click({ timeout: 2000 }).catch(() => {});
    await p.waitForTimeout(900);
    await shot("playing");
  },
  "studio-drums": async (p, shot) => {
    await studioLayer(p, "drums");
    await p.getByRole("radio", { name: "pads" }).click().catch(() => {});
    const pad = p.locator(".st-tray .st-sp").nth(12);
    const up = await hold(p, pad, 60, 0.15);
    await shot("hit");
    await up?.();
  },
  "studio-lock": async (p, shot) => {
    await studioLayer(p, "drums");
    await p.locator(".st-vk", { hasText: /^steps$/ }).first().click();
    await p.waitForTimeout(300);
    const step = p.locator('.st-tray button[aria-label^="kick step 3 "]').first();
    const up = await hold(p, step, 520);
    await up?.();
    const k = p.getByRole("slider", { name: "decay" }).first();
    await k.focus();
    for (let i = 0; i < 18; i++) await p.keyboard.press("ArrowUp");
    await p.waitForTimeout(250);
    await shot("held");
    await p.getByRole("button", { name: "done" }).click();
    await p.waitForTimeout(250);
    await shot("locked");
    console.log("  stored:", await p.evaluate(() => JSON.stringify(JSON.parse(localStorage.getItem("ccd.track.v2")).layers.flatMap(l => l.events.filter(e => e.p)))));
  },
  "studio-capture": async (p, shot) => {
    await studioLayer(p, "lead");
    await p.locator(".st-vk", { hasText: /^pads$/ }).first().click();
    for (const i of [12, 13, 14, 9, 12, 10]) { const up = await hold(p, p.locator(".st-tray .st-sp").nth(i), 160, 0.3); await up?.(); await p.waitForTimeout(220); }
    await shot("key");
    await p.getByRole("button", { name: /^Capture what you just played/ }).click();
    await p.waitForTimeout(200);
    await shot("ghost");
    await p.getByRole("button", { name: "keep it" }).click();
    await p.waitForTimeout(200);
    console.log("  lead events:", await p.evaluate(() => JSON.parse(localStorage.getItem("ccd.track.v2")).layers.find(l => l.type === "lead")?.events.length));
  },
  "grid-edit": async (p, shot) => {
    if (!(await toLesson(p, "midi-piano-roll", "tempo"))) throw new Error("no grid step");
    await p.waitForSelector(".gr-roll");
    const bar = p.locator(".gr-bar").first();
    const bb = await bar.boundingBox();
    // tap the note to pick it, then hold another to pick it too
    await p.mouse.click(bb.x + 4, bb.y + bb.height / 2);
    await p.waitForTimeout(150);
    const h = p.locator(".gr-handle").first();
    const hb = await h.boundingBox();
    await p.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
    await p.mouse.down();
    await p.mouse.move(hb.x + hb.width / 2 + 2, hb.y - 30, { steps: 6 });
    await shot("vel");
    await p.mouse.up();
    const bars = p.locator(".gr-bar");
    if ((await bars.count()) > 1) { const b2 = await bars.nth(1).boundingBox(); await p.mouse.move(b2.x + 4, b2.y + b2.height / 2); await p.mouse.down(); await p.waitForTimeout(500); await p.mouse.up(); }
    await p.waitForTimeout(150);
    await shot("picked");
  },
  "dice-studio": async (p, shot) => {
    await studioLayer(p, "drums");
    await p.locator(".st-vk", { hasText: /^steps$/ }).first().click();
    await p.getByRole("button", { name: "roll" }).click();
    await p.waitForTimeout(150);
    const f = p.getByRole("slider", { name: "fill" });
    await f.focus();
    for (let i = 0; i < 12; i++) await p.keyboard.press("ArrowUp");
    await p.waitForTimeout(200);
    await shot("fill");
  },
  "dice-arp": async (p, shot) => {
    if (!(await toLesson(p, "midi-effects", "tempo"))) throw new Error("no arp step");
    await p.getByRole("button", { name: "roll" }).click();
    await p.waitForTimeout(400);
    await shot("arp");
  },
  "dj-waves": async (p, shot) => {
    if (!(await toLesson(p, "eq-mixing-dj", "mix"))) throw new Error("no mix step");
    await p.waitForTimeout(2500);
    await shot("full");
    const k = p.getByRole("slider", { name: /low a|deck a low|a low/i }).first();
    if (await k.count()) { await k.focus(); for (let i = 0; i < 30; i++) await p.keyboard.press("ArrowDown"); }
    await p.waitForTimeout(400);
    await shot("lowcut");
  },
  "dj-key": async (p, shot) => {
    if (!(await toLesson(p, "key-detection-dj", "mix"))) throw new Error("no mix step");
    await p.waitForTimeout(2000);
    await shot("key");
  },
  "tryit-pads": async (p, shot) => {
    if (!(await toLesson(p, "hats", "play"))) throw new Error("no play step");
    const pad = p.locator(".ls-tray .ls-key").first();
    await pad.scrollIntoViewIfNeeded();
    const up = await hold(p, pad, 70, 0.12);
    await shot("hit");
    await up?.();
  },
  "shape-amp": async (p, shot) => {
    if (!(await toLesson(p, "synth-amp-envelope", "shape"))) throw new Error("no shape step");
    await p.waitForTimeout(1500);
    await shot("shape");
  },
  "shape-synth": async (p, shot) => {
    if (!(await toLesson(p, "shape-your-synth", "shape"))) throw new Error("no shape step");
    await p.waitForTimeout(1500);
    await shot("shape");
  },
  "shape-filter": async (p, shot) => {
    if (!(await toLesson(p, "synth-filters", "shape"))) throw new Error("no shape step");
    const k = p.getByRole("slider", { name: "res" }).first();
    await k.focus();
    for (let i = 0; i < 12; i++) await p.keyboard.press("ArrowUp");
    await p.waitForTimeout(800);
    await shot("shape");
  },
};

const b = await eng.launch({ args: engName === "chromium" ? ["--autoplay-policy=no-user-gesture-required"] : [] });
const sizes = engName === "webkit" ? [[390, 844]] : [[390, 844], [1440, 900]];
for (const [name, fn] of Object.entries(SCENES)) {
  if (only.length && !only.includes(name)) continue;
  for (const [w, h] of sizes) for (const mode of ["dark", "light"]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: mode });
    await ctx.addInitScript(m => { try { localStorage.setItem("ccd.mode", m); } catch {} }, mode);
    const p = await ctx.newPage();
    const errs = [];
    p.on("pageerror", e => errs.push(e.message.slice(0, 160)));
    const shot = async tag => p.screenshot({ path: `${OUT}/${name}-${tag}-${engName}-${w}-${mode}.png` });
    try { await fn(p, shot); console.log("ok", name, w, mode, errs.join(" | ")); }
    catch (e) { console.log("FAIL", name, w, mode, String(e.message ?? e).split("\n")[0], errs.join(" | ")); await shot("fail").catch(() => {}); }
    await ctx.close();
  }
}
await b.close();
