// Free stories page sweep: 8 widths x EN/VI. Muted headless Chromium. Usage: node scripts/free-stories-sweep.mjs <base> <outDir>
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
const [base = 'http://127.0.0.1:4177', outDir = 'docs/qa/free-stories-preview-2026-11-15'] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const WIDTHS = [360, 375, 390, 414, 768, 1024, 1440, 1920];
const PATHS = { en: '/free-stories', vi: '/vi/free-stories' };
const browser = await chromium.launch({ args: ['--mute-audio'] });
const results = [];
for (const lang of ['en', 'vi']) for (const width of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width, height: width < 768 ? 844 : 900 }, extraHTTPHeaders: { 'x-je-automation': 'playwright' } });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  const entry = { lang, width, ok: false, failures: [] };
  try {
    await p.goto(`${base}${PATHS[lang]}`, { waitUntil: 'networkidle' });
    const m = await p.evaluate(() => {
      const cards = [...document.querySelectorAll('[data-free-story]')];
      const rect = (el) => { const r = el.getBoundingClientRect(); return { l: r.left + scrollX, t: r.top + scrollY, r: r.right + scrollX, b: r.bottom + scrollY }; };
      const hit = (a, b) => a.l < b.r - 1 && b.l < a.r - 1 && a.t < b.b - 1 && b.t < a.b - 1;
      let overlap = 0;
      const rects = cards.map(rect);
      for (let i = 0; i < rects.length; i++) for (let j = i + 1; j < rects.length; j++) if (hit(rects[i], rects[j])) overlap++;
      for (const card of cards) {
        const cr = rect(card); const kids = [...card.children].map(rect);
        for (let i = 0; i < kids.length; i++) { if (kids[i].r > cr.r + 1 || kids[i].l < cr.l - 1) overlap++; for (let j = i + 1; j < kids.length; j++) if (hit(kids[i], kids[j])) overlap++; }
      }
      const small = [...document.querySelectorAll('.free-story-link')].filter((a) => a.getBoundingClientRect().height < 44).length;
      const text = cards.map((c) => c.textContent).join(' ');
      const hrefs = [...document.querySelectorAll('.free-story-card a')].map((a) => a.getAttribute('href'));
      return { sw: document.documentElement.scrollWidth, iw: innerWidth, cards: cards.length, overlap, small, price: /₫|US\$/.test(text), buy: document.querySelectorAll('[data-buy-now],[data-price],.free-story-card button').length, hrefs, pending: document.querySelectorAll('[data-pending-pdf]').length };
    });
    Object.assign(entry, { scrollWidth: m.sw, innerWidth: m.iw, cards: m.cards, overlap: m.overlap });
    if (m.sw > m.iw) entry.failures.push(`horizontal scroll ${m.sw} > ${m.iw}`);
    if (m.cards !== 7) entry.failures.push(`cards ${m.cards}`);
    if (m.overlap) entry.failures.push(`overlap ${m.overlap}`);
    if (m.small) entry.failures.push(`${m.small} targets < 44px`);
    if (m.price || m.buy) entry.failures.push('price or buy control');
    if (m.pending !== 7) entry.failures.push(`pending pdf ${m.pending}`);
    if (m.hrefs.some((h) => !/^(\/vi)?\/(products\/story-workbooks-l[1345]|story-club)\?utm_source=free-stories$/.test(h))) entry.failures.push('unexpected link');
    if (errors.length) entry.failures.push(`pageerror: ${errors[0]}`);
    const shot = path.join(outDir, `free-stories-${lang}-${width}.png`);
    await p.locator('main').screenshot({ path: shot });
    entry.screenshot = path.basename(shot);
    entry.ok = !entry.failures.length;
  } catch (e) { entry.failures.push(`error: ${e.message.split('\n')[0]}`); }
  results.push(entry); await ctx.close();
}
await browser.close();
const summary = { generatedAt: new Date().toISOString(), entries: results.length, passed: results.filter((r) => r.ok).length, failed: results.filter((r) => !r.ok).length, results };
fs.writeFileSync(path.join(outDir, 'sweep.json'), JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ entries: summary.entries, passed: summary.passed, failed: summary.failed, failures: results.filter((r) => !r.ok).map((r) => [r.lang, r.width, r.failures]) }));
