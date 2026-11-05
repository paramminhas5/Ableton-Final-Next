// Screenshots of the renamed controls and the "same control elsewhere" notes (design/naming.md).
// Usage: node scripts/shots/naming.mjs <base> [chromium|webkit] [scenario,...] [out dir]
// Each scenario runs at 390x844 and 1440x900, light and dark (webkit: 390 only).
import { chromium, webkit } from "playwright";
import { mkdirSync } from "node:fs";
const base = process.argv[2] ?? "http://localhost:3400";
const engName = process.argv[3] === "webkit" ? "webkit" : "chromium";
const eng = engName === "webkit" ? webkit : chromium;
const only = (process.argv[4] ?? "").split(",").filter(Boolean);
const OUT = process.argv[5] ?? "/tmp/claude-0/-home-claude/14482081-5c9f-509e-afde-b9b4be190bf9/scratchpad/naming";
mkdirSync(OUT, { recursive: true });

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
const turn = async (p, name, n, key = "ArrowUp") => {
  const k = p.getByRole("slider", { name }).first();
  await k.focus();
  for (let i = 0; i < n; i++) await p.keyboard.press(key);
  await p.waitForTimeout(250);
};
const openElse = async p => {
  const s = p.locator(".fl-else summary").first();
  if (await s.count()) { await s.click(); await s.scrollIntoViewIfNeeded(); await p.waitForTimeout(200); }
};

const SCENES = {
  "shape-filter": async (p, shot) => {
    if (!(await toLesson(p, "synth-filters", "shape"))) throw new Error("no shape step");
    await turn(p, "circuit", 50);
    await openElse(p);
    await shot("circuit");
  },
  "shape-bass": async (p, shot) => {
    if (!(await toLesson(p, "bass-poli", "shape"))) throw new Error("no shape step");
    await turn(p, "shape", 20);
    await openElse(p);
    await shot("shape");
  },
  "studio-bass2": async (p, shot) => {
    await studioLayer(p, "bass");
    await p.getByRole("radio", { name: "sound" }).click();
    await turn(p, "circuit", 50);
    await shot("circuit");
  },
  "studio-kick2": async (p, shot) => {
    await studioLayer(p, "drums");
    await p.getByRole("radio", { name: "sound" }).click();
    await turn(p, "pitch env", 10);
    await shot("pitchenv");
  },
  "studio-lead2": async (p, shot) => {
    await studioLayer(p, "lead");
    await p.getByRole("radio", { name: "sound" }).click();
    await turn(p, "exciter", 40);
    await shot("exciter");
  },
  "studio-lock": async (p, shot) => {
    await studioLayer(p, "drums");
    await p.locator(".st-vk", { hasText: /^steps$/ }).first().click();
    await p.waitForTimeout(300);
    const step = p.locator('.st-tray button[aria-label^="kick step 3 "]').first();
    const b = await step.boundingBox();
    await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await p.mouse.down(); await p.waitForTimeout(520); await p.mouse.up();
    await turn(p, "decay", 18);
    await shot("plock");
  },
  "mix-master": async (p, shot) => {
    await p.goto(`${base}/studio`, { waitUntil: "load" });
    await p.waitForSelector(".st-slots", { timeout: 60000 });
    await p.getByRole("radio", { name: "mix" }).first().click();
    await p.waitForTimeout(400);
    await p.getByText("faders", { exact: true }).first().click();
    await p.waitForTimeout(300);
    await p.getByRole("button", { name: "Open the master" }).click();
    await p.waitForTimeout(400);
    await shot("master");
  },
  glossary: async (p, shot) => {
    await p.goto(`${base}/glossary#filter-circuit-prd-ms2-svf`, { waitUntil: "load" });
    await p.waitForTimeout(1500);
    await shot("circuit");
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
