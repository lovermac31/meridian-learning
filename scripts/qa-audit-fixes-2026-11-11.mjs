// Visual + layout check for the 11 Nov 2026 audit fixes (PR A). Muted headless Chromium only; no API calls leave the
// browser (every /api and /go request is aborted, so no payment memo or CRM lead is written).
// Usage: node scripts/qa-audit-fixes-2026-11-11.mjs <baseURL> <outDir> [label]
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const [base = 'http://127.0.0.1:4177', out = 'docs/qa/audit-fixes-2026-11-11', label = 'A'] = process.argv.slice(2);
await mkdir(out, { recursive: true });
const widths = [375, 768, 1024, 1440];
const pages = [
  ['home', '/'], ['products', '/products'], ['mango', '/products/mango-l2'], ['l1', '/products/story-workbooks-l1'],
  ['l2', '/products/story-workbooks-l2'], ['paused-teacher-l2', '/products/teacher-pack-l2'], ['paused-bundle', '/products/teacher-bundle'],
  ['mango-checkout', '/products/mango-l2?checkout=1'],
];
const browser = await chromium.launch({ headless: true, args: ['--mute-audio', '--autoplay-policy=user-gesture-required'] });
const results = [];
for (const locale of ['en', 'vi']) for (const width of widths) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, extraHTTPHeaders: { 'x-je-automation': 'playwright' } });
  const page = await context.newPage();
  await page.route('**/*', (route) => {
    const url = new URL(route.request().url());
    if (url.origin === new URL(base).origin && (url.pathname.startsWith('/api/') || url.pathname.startsWith('/go/'))) return route.abort();
    if (url.origin !== new URL(base).origin && !url.hostname.endsWith('qr.sepay.vn')) return route.abort();
    return route.fallback();
  });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 160)));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::ERR_FAILED/.test(m.text())) errors.push(m.text().slice(0, 160)); });
  for (const [name, path] of pages) {
    errors.length = 0;
    const url = `${base}${locale === 'vi' ? (path === '/' ? '/vi' : `/vi${path}`) : path}`;
    await page.goto(url, { waitUntil: 'networkidle' });
    const reject = page.getByRole('button', { name: /reject analytics|từ chối phân tích/i });
    if (await reject.isVisible().catch(() => false)) await reject.click();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    const checks = await page.evaluate(() => ({
      buy: document.querySelectorAll('[data-buy-now]').length,
      paused: document.querySelectorAll('[data-paused-waitlist]').length,
      credit: document.querySelectorAll('[data-ai-credit]').length,
      gate: document.querySelectorAll('[data-get-payment-code]').length,
      qr: document.querySelectorAll('[data-payment-qr]').length,
    }));
    const file = `${label}-${name}-${locale}-${width}.png`;
    if (name === 'home' || width === 375 || width === 1440) await page.screenshot({ path: resolve(out, file), fullPage: false });
    results.push({ locale, width, name, overflow, errors: [...errors], ...checks });
  }
  await context.close();
}
await browser.close();
const bad = results.filter((r) => r.overflow > 0 || r.errors.length);
console.log(JSON.stringify({ checked: results.length, problems: bad }, null, 1));
console.table(results.map(({ locale, width, name, overflow, buy, paused, credit, gate, qr, errors }) => ({ locale, width, name, overflow, buy, paused, credit, gate, qr, errors: errors.length })));
