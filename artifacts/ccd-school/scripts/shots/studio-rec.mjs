// Plays and records in Studio through the real engine (WebAssembly), then checks the take
// landed in the track and that undo takes it back.
import { chromium } from "playwright";
const base = process.argv[2] ?? "http://localhost:3000";
const b = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, colorScheme: "dark" });
const p = await ctx.newPage();
const errs = [];
p.on("pageerror", e => errs.push(e.message));
await p.addInitScript(() => {
  if (!localStorage.getItem("seeded")) {
    localStorage.setItem("seeded", "1");
    localStorage.setItem("ccd.track.v2", JSON.stringify({ v: 2, bpm: 120, root: 45, scale: "minor", swing: 0, loop: 4, added: [], updatedAt: 0,
      layers: [{ id: "d", type: "drums", events: [], params: {}, mute: false, solo: false, duck: { src: null, note: null }, surface: "pads", pad: 0, variant: 0 }] }));
  }
});
await p.goto(`${base}/studio`, { waitUntil: "networkidle" });
const events = () => p.evaluate(() => JSON.parse(localStorage.getItem("ccd.track.v2")).layers[0].events);
const tapKick = async () => {
  const k = p.locator('.st-sp[aria-label="kick"]');
  await k.dispatchEvent("pointerdown", { pointerId: 1, pointerType: "touch", isPrimary: true, width: 20, height: 20 });
  await p.waitForTimeout(60);
  await k.dispatchEvent("pointerup", { pointerId: 1, pointerType: "touch", isPrimary: true });
};
await tapKick(); // warm the engine up, like playing around before recording
await p.waitForTimeout(800);
await p.locator('button[aria-label^="Record"]').click();
await p.waitForTimeout(500);
await p.screenshot({ path: "/tmp/claude-0/shots/count-in.png" });
const countText = await p.locator(".st-scr").innerText();
// count-in is 2 s at 120 bpm; then tap on roughly beats 1, 2, 3 of the loop
await p.waitForTimeout(1500);
for (let i = 0; i < 3; i++) { await tapKick(); await p.waitForTimeout(440); }
await p.waitForTimeout(300);
const recText = await p.locator(".st-scr").innerText();
await p.locator('button[aria-label="Play"]').click(); // stop recording, keep looping
await p.waitForTimeout(400);
const take = await events();
await p.locator('button[aria-label="Undo"]').click();
await p.waitForTimeout(200);
const afterUndo = await events();
console.log(JSON.stringify({ countText: countText.replace(/\n/g, " | "), recText: recText.replace(/\n/g, " | "), take: take.map(e => [e.note, +e.start.toFixed(3), +e.len.toFixed(3)]), afterUndo: afterUndo.length, errs }, null, 1));
await b.close();
