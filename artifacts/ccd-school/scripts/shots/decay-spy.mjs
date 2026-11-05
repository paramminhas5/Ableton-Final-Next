// Does turning the decay knob on the kick lesson reach the engine? Spies on the worklet port.
// Usage: node scripts/shots/decay-spy.mjs (dev server on :3000)
import { chromium } from "playwright";
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.addInitScript(() => {
  window.__cmds = [];
  const orig = MessagePort.prototype.postMessage;
  MessagePort.prototype.postMessage = function (m, t) {
    if (m && m.t === "cmds") { const c = Array.from(m.c); for (let i = 0; i < c.length; i += 6) window.__cmds.push(c.slice(i, i + 6)); }
    return orig.call(this, m, t);
  };
});
// seed a recorded kick take so the shape step has a loop, then jump to the shape step (index 5)
await p.goto("http://localhost:3000/learn/your-kick", { waitUntil: "load" });
await p.evaluate(() => {
  sessionStorage.setItem("ccd.lesson.your-kick", JSON.stringify({ idx: 5, at: Date.now() }));
});
await p.reload({ waitUntil: "load" }); await p.waitForTimeout(2500);
const kind = await p.locator(".fl").getAttribute("data-page-kind"); console.log("page", kind);
const before = await p.evaluate(() => window.__cmds.filter(c => c[0] === 3 && c[2] === 17));
console.log("decay (index 17) sent on arrival:", JSON.stringify(before));
const knob = p.getByRole("slider", { name: /decay/i });
await knob.focus();
for (let i = 0; i < 30; i++) await p.keyboard.press("ArrowUp");
await p.waitForTimeout(400);
const after = await p.evaluate(() => window.__cmds.filter(c => c[0] === 3 && c[2] === 17).slice(-5));
console.log("after 30 arrow-ups:", JSON.stringify(after));
for (let i = 0; i < 60; i++) await p.keyboard.press("ArrowDown");
await p.waitForTimeout(400);
const after2 = await p.evaluate(() => window.__cmds.filter(c => c[0] === 3 && c[2] === 17).slice(-3));
console.log("after 60 arrow-downs:", JSON.stringify(after2));
console.log("knob value now:", await knob.getAttribute("aria-valuenow"));
await b.close();
