import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const p = await b.newPage();
p.on('console', m => { if (!/analytics|Analytics|Fast Refresh|auth/i.test(m.text())) console.log('console', m.type(), m.text().slice(0,300)); });
p.on('pageerror', e => console.log('pageerror', e.message));
await p.goto('http://localhost:3000/lab/engine', { waitUntil: 'networkidle' });
const r = await p.evaluate(async () => {
  const ctx = new AudioContext({ latencyHint: 0 });
  const out = { state: ctx.state };
  try {
    const mod = await WebAssembly.compile(await (await fetch('/engine/ccd_engine.wasm')).arrayBuffer());
    await ctx.audioWorklet.addModule('/engine/ccd-worklet.js');
    const node = new AudioWorkletNode(ctx, 'ccd-engine', { numberOfInputs: 0, outputChannelCount: [2] });
    node.connect(ctx.destination);
    node.onprocessorerror = (e) => { out.procerr = String(e); };
    const msg = new Promise(res => { node.port.onmessage = m => res(m.data); setTimeout(() => res('timeout'), 3000); });
    node.port.postMessage({ t: 'ping' });
    out.ping = JSON.stringify(await msg);
    const msg2 = new Promise(res => { node.port.onmessage = m => res(m.data); setTimeout(() => res('timeout'), 3000); });
    const bytes = await (await fetch('/engine/ccd_engine.wasm')).arrayBuffer(); node.port.postMessage({ t: 'init', bytes });
    out.init = JSON.stringify(await msg2);
    await ctx.resume();
    out.first = JSON.stringify(await msg);
    out.state2 = ctx.state;
  } catch (e) { out.err = String(e); }
  return out;
});
console.log(JSON.stringify(r));
await b.close();
