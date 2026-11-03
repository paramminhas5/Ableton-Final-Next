import { chromium } from 'playwright';
const url = process.argv[2], shot = process.argv[3];
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required','--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream'] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });
const logs = [];
p.on('console', m => logs.push(m.type() + ': ' + m.text()));
p.on('pageerror', e => logs.push('pageerror: ' + e.message));
await p.goto(url, { waitUntil: 'networkidle', timeout: 120000 });
await p.click('[data-a="start"]');
await p.waitForTimeout(1500);
for (let i = 0; i < 6; i++) { await p.locator('[data-p="rim"]').dispatchEvent('pointerdown', { pointerId: 1, isPrimary: true, clientX: 100, clientY: 400 }); await p.waitForTimeout(250); }
await p.click('[data-a="play"]');
await p.waitForTimeout(1500);
const txt = await p.locator('.lab').innerText();
console.log(txt.split('\n').slice(0, 30).join('\n'));
await p.screenshot({ path: shot });
console.log(logs.filter(l => !l.includes('Download the React')).slice(0, 15).join('\n'));
await b.close();
