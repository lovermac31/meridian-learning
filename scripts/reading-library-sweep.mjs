// Reading & Reasoning Library preview sweep: 8 widths x EN/VI x (/products, level hub), flag on. Muted headless Chromium.
// Usage: node scripts/reading-library-sweep.mjs <productsBase> <hubBase> <outDir>
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const [productsBase = 'http://127.0.0.1:4177', hubBase = 'http://127.0.0.1:3100', outDir = 'docs/qa/reading-library-preview-2026-11-15'] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const WIDTHS = [360, 375, 390, 414, 768, 1024, 1440, 1920];
const PAGES = [
  { key: 'products', base: productsBase, path: { en: '/products', vi: '/vi/products' }, expectCards: 3, scope: '[data-library-band]' },
  { key: 'hub', base: hubBase, path: { en: '/student-academy/stories', vi: '/vi/student-academy/stories' }, expectCards: 3, scope: '[data-library-row]' },
];
const browser = await chromium.launch({ args: ['--mute-audio'] });
const results = [];
for (const page of PAGES) for (const lang of ['en', 'vi']) for (const width of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width, height: width < 768 ? 844 : 900 }, extraHTTPHeaders: { 'x-je-automation': 'playwright' } });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  const entry = { page: page.key, lang, width, ok: false, failures: [] };
  try {
    // Default render first: the flag is off, so there must be no library cards.
    await p.goto(`${page.base}${page.path[lang]}`, { waitUntil: 'networkidle' });
    const defaultCards = await p.locator('[data-library-title]').count();
    if (defaultCards !== 0) entry.failures.push(`default render shows ${defaultCards} library cards`);
    await p.goto(`${page.base}${page.path[lang]}?library-preview=1`, { waitUntil: 'networkidle' });
    await p.waitForSelector('[data-library-title]', { timeout: 8000 });
    const m = await p.evaluate((scope) => {
      const doc = document.documentElement;
      const cards = [...document.querySelectorAll('[data-library-title]')];
      const rect = (el) => { const r = el.getBoundingClientRect(); return { l: r.left + scrollX, t: r.top + scrollY, r: r.right + scrollX, b: r.bottom + scrollY }; };
      const hit = (a, b) => a.l < b.r - 1 && b.l < a.r - 1 && a.t < b.b - 1 && b.t < a.b - 1;
      const rects = cards.map(rect);
      let overlap = 0;
      for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) if (hit(rects[i], rects[j])) overlap++;
      // Children of a card must not overlap each other (cover, eyebrow, title, pill, text, link).
      for (const card of cards) {
        const kids = [...card.children].map(rect);
        for (let i = 0; i < kids.length; i++) for (let j = i + 1; j < kids.length; j++) if (hit(kids[i], kids[j])) overlap++;
        const cr = rect(card);
        for (const k of kids) if (k.r > cr.r + 1 || k.l < cr.l - 1) overlap++;
      }
      // The library block must not overlap the hub story list or the next section's content.
      const row = document.querySelector(scope);
      const rowR = row ? rect(row) : null;
      if (rowR) for (const sib of row.parentElement ? [...row.parentElement.children] : []) if (sib !== row && sib.tagName !== 'SCRIPT' && !sib.hidden && sib.getBoundingClientRect().height) if (hit(rowR, rect(sib))) overlap++;
      const small = [...document.querySelectorAll('[data-library-waitlist]')].filter((a) => a.getBoundingClientRect().height < 44).length;
      const text = cards.map((c) => c.textContent).join(' ');
      const buy = document.querySelectorAll('[data-library-title] [data-buy-now], [data-library-title] [data-price], [data-library-title] [data-portal-buy], [data-library-title] button').length;
      const hrefs = [...document.querySelectorAll('[data-library-waitlist]')].map((a) => a.getAttribute('href'));
      return { sw: doc.scrollWidth, iw: window.innerWidth, cards: cards.length, overlap, small, buy, price: /₫|US\$/.test(text), hrefs, lang: document.documentElement.lang };
    }, page.scope);
    Object.assign(entry, { scrollWidth: m.sw, innerWidth: m.iw, cards: m.cards, overlap: m.overlap, smallTargets: m.small });
    if (m.sw > m.iw) entry.failures.push(`horizontal scroll ${m.sw} > ${m.iw}`);
    if (m.cards !== page.expectCards) entry.failures.push(`cards ${m.cards} != ${page.expectCards}`);
    if (m.overlap) entry.failures.push(`overlap ${m.overlap}`);
    if (m.small) entry.failures.push(`${m.small} targets < 44px`);
    if (m.buy || m.price) entry.failures.push('price or buy control found');
    if (m.hrefs.some((h) => !/^\/go\/zalo\/rl-je-[a-z0-9-]+\?utm_content=.*&utm_campaign=reading-library&utm_source=(products|academy)$/.test(h))) entry.failures.push('bad waitlist href');
    if (errors.length) entry.failures.push(`pageerror: ${errors[0]}`);
    const shot = path.join(outDir, `${page.key}-${lang}-${width}.png`);
    const target = p.locator(page.scope).first();
    await target.scrollIntoViewIfNeeded();
    await target.screenshot({ path: shot });
    entry.screenshot = path.basename(shot);
    entry.ok = entry.failures.length === 0;
  } catch (e) { entry.failures.push(`error: ${e.message.split('\n')[0]}`); }
  results.push(entry);
  await ctx.close();
}
await browser.close();
const summary = { generatedAt: new Date().toISOString(), entries: results.length, passed: results.filter((r) => r.ok).length, failed: results.filter((r) => !r.ok).length, results };
fs.writeFileSync(path.join(outDir, 'sweep.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ entries: summary.entries, passed: summary.passed, failed: summary.failed, failures: results.filter((r) => !r.ok).map((r) => [r.page, r.lang, r.width, r.failures]) }, null, 1));
