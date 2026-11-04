// Full-page screenshots of /products and /vi/products at 390 and 1280 px (muted Chromium, no sound ever).
// Usage: node scripts/screenshot-products.mjs <baseUrl> <outDir> <tag>   e.g. https://jurassicenglish.com docs/qa/products-stitch before
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const [base = 'http://127.0.0.1:4178', dir = 'docs/qa/products-stitch', tag = 'after'] = process.argv.slice(2);
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--mute-audio'] });
try {
  for (const locale of ['en', 'vi']) {
    for (const width of [390, 1280]) {
      const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, reducedMotion: 'reduce', extraHTTPHeaders: { 'x-je-automation': 'playwright' } });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));
      const route = `/${locale === 'vi' ? 'vi/' : ''}products${base.includes('127.0.0.1') ? '/' : ''}`;
      await page.goto(base + route, { waitUntil: 'networkidle', timeout: 90_000 });
      await page.evaluate(() => document.fonts.ready);
      // Scroll through so lazy images load before the full-page capture.
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); });
      await page.waitForLoadState('networkidle');
      const file = `${dir}/${tag}-${locale}-${width}.png`;
      await page.screenshot({ path: file, fullPage: true });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      console.log(JSON.stringify({ file, overflow, errors, height: await page.evaluate(() => document.documentElement.scrollHeight) }));
      await context.close();
    }
  }
} finally {
  await browser.close();
}
