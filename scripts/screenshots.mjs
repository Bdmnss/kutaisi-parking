import { chromium } from 'playwright-core';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const out = [];
for (const w of [320, 768, 1280, 1920]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  for (const [name, path] of [['home', '/'], ['booking', '/booking'], ['esim', '/esim'], ['404', '/nope']]) {
    await p.goto('http://localhost:4173' + path); await p.waitForTimeout(1200);
    const sw = await p.evaluate(() => document.documentElement.scrollWidth);
    out.push(`${name} ${w}: scrollWidth=${sw} ${sw > w ? 'OVERFLOW' : 'ok'}`);
    if (name === 'home' || name === 'booking') await p.screenshot({ path: `screenshots/${name}-${w}.png`, fullPage: true });
  }
  await p.close();
}
// flow test
const p = await b.newPage({ viewport: { width: 320, height: 800 } });
await p.goto('http://localhost:4173/booking'); await p.waitForTimeout(1000);
await p.click('button[type=submit]'); out.push('plate err: ' + (await p.textContent('#plate-error')));
await p.fill('#plate', 'GE-777-AA'); await p.click('button[type=submit]');
await p.fill('#name', 'Test User'); await p.fill('#email', 't@x.ge'); await p.fill('#phone', '+995 555 123 456'); await p.click('button[type=submit]');
await p.check('input[value=have]'); await p.fill('#voucher', 'WELCOME10'); await p.click('text=Apply'); await p.waitForTimeout(700);
await p.click('button[type=submit]'); await p.check('input[value=arrival]');
out.push('summary: ' + (await p.textContent('aside')).replace(/\s+/g, ' '));
await p.screenshot({ path: 'screenshots/booking-payment-320.png', fullPage: true });
await p.check('input[type=checkbox]'); await p.click('button[type=submit]'); await p.waitForTimeout(1300);
out.push('result: ' + await p.textContent('h1'));
await p.screenshot({ path: 'screenshots/booking-request-received-320.png', fullPage: true });
console.log(out.join('\n')); await b.close();
