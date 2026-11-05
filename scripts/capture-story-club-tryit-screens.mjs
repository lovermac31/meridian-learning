/**
 * Visual check for the Story Club free try-it change (5 Nov 2026).
 *
 * Renders /story-club, /vi/story-club, /en/story-club/reserve and /story-club/reserve (the Vietnamese reserve page has no
 * /vi prefix) at 375, 768, 1024 and 1440 px in muted headless Chromium against a LOCAL preview, saves full-page screenshots
 * and writes results.json: horizontal overflow, axe colour contrast, label and link-name rules. Nothing leaves localhost:
 * every request to another origin and every /api, /go or non-GET request is answered by a synthetic fixture or aborted.
 *
 * Usage: npm run build && npm run preview -- --host 127.0.0.1 --port 4176 --strictPort
 *        node scripts/capture-story-club-tryit-screens.mjs http://127.0.0.1:4176 docs/qa/story-club-tryit/evidence
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const base = process.argv[2] ?? 'http://127.0.0.1:4176';
const outDir = resolve(process.argv[3] ?? 'docs/qa/story-club-tryit/evidence');
if (!/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(base)) throw new Error(`Refusing to run against ${base}: local preview only.`);
await mkdir(outDir, { recursive: true });

const TINY_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
const pages = [
  { name: 'landing-en', path: '/story-club', lang: 'en', kind: 'landing' },
  { name: 'landing-vi', path: '/vi/story-club', lang: 'vi', kind: 'landing' },
  { name: 'reserve-en', path: '/en/story-club/reserve', lang: 'en', kind: 'reserve' },
  { name: 'reserve-vi', path: '/story-club/reserve', lang: 'vi', kind: 'reserve' },
];
const widths = [375, 768, 1024, 1440];

const browser = await chromium.launch({ args: ['--mute-audio'] });
const results = [];
for (const spec of pages) for (const width of widths) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  await page.route('**/*', (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin === base && url.pathname === '/api/sample-pack' && request.method() === 'POST') return route.fulfill({ json: { ok: true, memo: 'SC-AB12CD' } });
    if (url.origin === 'https://qr.sepay.vn') return route.fulfill({ body: TINY_PNG, contentType: 'image/png' });
    if (url.origin !== base || url.pathname.startsWith('/api/') || url.pathname.startsWith('/go/') || request.method() !== 'GET') return route.abort();
    return route.fallback();
  });
  const nonGet = [];
  // POST /api/event is the existing reserve_view analytics beacon (stubbed here); only payment-path calls are counted.
  page.on('request', (request) => { const call = `${request.method()} ${new URL(request.url()).pathname}`; if (request.method() !== 'GET' && call !== 'POST /api/event') nonGet.push(call); });
  await page.goto(`${base}${spec.path}`, { waitUntil: 'networkidle' });
  let beforeClick = null;
  if (spec.kind === 'reserve') {
    // The payment is prepared only after a click: wait past the old 2 s auto-prepare, capture the gate, then click.
    await page.waitForTimeout(3_000);
    beforeClick = { nonGetRequestsOnLoad: [...nonGet], buttonVisible: await page.locator('[data-get-payment-code]').isVisible() };
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: resolve(outDir, `${spec.name}-before-click-${width}.png`), fullPage: true });
    await page.locator('[data-get-payment-code]').click();
    await page.locator('[data-payment-instructions]').waitFor({ timeout: 15_000 });
  }
  // The analytics choice is left alone; it is part of the real first screen. Wait for fonts so the shot is stable.
  await page.evaluate(() => document.fonts.ready);
  const overflow = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth, overflowing: document.documentElement.scrollWidth > innerWidth }));
  const axe = await new AxeBuilder({ page }).withRules(['color-contrast', 'label', 'link-name', 'button-name', 'image-alt', 'select-name']).analyze();
  const order = spec.kind === 'reserve' ? await page.evaluate(() => {
    const summary = document.querySelector('[data-reserve-summary]');
    const pay = document.querySelector('[data-payment-instructions]');
    return { summaryBeforePay: !!(summary && pay && (summary.compareDocumentPosition(pay) & Node.DOCUMENT_POSITION_FOLLOWING)), summaryBottom: Math.round(summary.getBoundingClientRect().bottom + scrollY), payTop: Math.round(pay.getBoundingClientRect().top + scrollY) };
  }) : null;
  const file = `${spec.name}-${width}.png`;
  await page.screenshot({ path: resolve(outDir, file), fullPage: true });
  results.push({
    file, path: spec.path, width, overflow, order, beforeClick,
    axeViolations: axe.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => n.target.join(' ')).slice(0, 5) })),
  });
  await context.close();
}
await browser.close();
await writeFile(resolve(outDir, 'results.json'), JSON.stringify({ base, capturedAt: new Date().toISOString(), results }, null, 2));
const failed = results.filter((r) => r.overflow.overflowing || r.axeViolations.length || (r.order && !r.order.summaryBeforePay) || (r.beforeClick && (r.beforeClick.nonGetRequestsOnLoad.length || !r.beforeClick.buttonVisible)));
console.log(`${results.length} captures, ${failed.length} with findings`);
for (const r of failed) console.log(JSON.stringify(r));
process.exit(failed.length ? 1 : 0);
