// Browser acceptance for the /products Stitch layout (segment filter + one card per row). Run against the built site:
//   npm run build && npm run preview -- --host 127.0.0.1 --port 4178 --strictPort   then   node scripts/test-products-stitch-browser.mjs
// Muted Chromium, no sound ever. Checks both languages at 390 and 1280 px: all 35 cards in SSR, the filter and its
// count line, deep links (sections, cards, former ids, samples), the sample viewer's focus return, 44 px targets,
// no horizontal overflow, no page errors, and an axe scan in each state.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const base = process.env.BASE_URL || 'http://127.0.0.1:4178';
const dir = process.env.EVIDENCE_DIR || 'docs/qa/products-stitch';
await fs.mkdir(dir, { recursive: true });
const browser = await chromium.launch({ headless: true, args: ['--mute-audio'] });
const report = [];
try {
  for (const width of [390, 1280]) for (const locale of ['en', 'vi']) {
    const context = await browser.newContext({ viewport: { width, height: width === 390 ? 844 : 900 }, reducedMotion: 'reduce', extraHTTPHeaders: { 'x-je-automation': 'playwright' } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const route = `/${locale === 'vi' ? 'vi/' : ''}products/`;
    await page.goto(base + route, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const tile = (id) => page.locator(`[data-category-tile="${id}"]`);
    const count = () => page.locator('[data-products-count]').getAttribute('data-products-count');
    const ids = await page.locator('.products-page li[id]').evaluateAll((es) => es.map((e) => e.id));
    assert.equal(ids.length, 35, `${locale} ${width}: 35 cards`);
    assert.equal(await page.locator('h1').count(), 1);
    for (const id of ['families', 'teachers', 'centres', 'ielts']) assert.equal(await tile(id).getAttribute('aria-pressed'), 'false');
    assert.equal(await count(), '35');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${locale} ${width}: no horizontal overflow`);
    const undersized = await page.locator('[data-category-tile], [data-sample-open], [data-watch], [data-buy-now], [data-cta^="product-"], [data-product-page], [data-products-show-all], .products-faq summary').evaluateAll((es) => es.filter((e) => e.offsetParent !== null).filter((e) => e.getBoundingClientRect().height < 44 || e.getBoundingClientRect().width < 44).map((e) => e.outerHTML.slice(0, 120)));
    assert.deepEqual(undersized, [], `${locale} ${width}: every control at least 44 px`);
    const scans = [];
    const capture = async (state) => {
      const axe = await new AxeBuilder({ page }).disableRules(['region']).analyze(); // 'region': the site-wide Zalo float, outside this page
      scans.push({ state, violations: axe.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })) });
      assert.equal(axe.violations.length, 0, `${locale} ${width} ${state}: ${JSON.stringify(scans.at(-1))}`);
    };
    await capture('all');
    // Filter: one segment at a time, the count follows, and "show all" restores the page.
    await tile('teachers').click();
    assert.equal(await tile('teachers').getAttribute('aria-pressed'), 'true');
    assert.equal(await page.locator('#families').isHidden(), true);
    assert.equal(await page.locator('#teachers li[id]').count(), 15);
    assert.equal(await count(), '15');
    await capture('teachers');
    await tile('ielts').click();
    assert.equal(await tile('teachers').getAttribute('aria-pressed'), 'false');
    assert.equal(await count(), '8');
    await page.locator('[data-products-show-all]').click();
    assert.equal(await count(), '35');
    // Sample viewer: opens from the card button, Escape closes it and returns focus.
    await page.locator('[data-sample-open="story-club"]').click();
    await page.locator('[data-sample-viewer="story-club"]').waitFor();
    await capture('sample-modal');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('[data-sample-viewer]').count(), 0);
    assert.equal(await page.locator('[data-sample-open="story-club"]').evaluate((e) => e === document.activeElement), true);
    // Deep links: a section anchor selects its segment; a card anchor lands on a visible card whatever the filter.
    for (const id of ['teachers', 'ielts-speaking', 'families', 'centres', 'teacher-pack', 'ielts-essay-bank-task2', 'story-club']) {
      await page.evaluate((hash) => { location.hash = hash; }, id);
      const product = id === 'teacher-pack' ? 'teacher-pack-l1' : ids.includes(id) ? id : null;
      const target = product ?? id;
      await page.waitForFunction((t) => { const el = document.getElementById(t); if (!el || el.closest('[hidden]')) return false; const r = el.getBoundingClientRect(); return r.top >= 60 && r.top < innerHeight; }, target, { timeout: 5000 });
      if (!product) assert.equal(await tile(id.startsWith('ielts-') ? 'ielts' : id).getAttribute('aria-pressed'), 'true', `${id}: segment selected`);
    }
    await page.goto(base + route + '?utm_source=fb-teachers#teacher-pack', { waitUntil: 'networkidle' });
    await page.waitForFunction(() => document.getElementById('teacher-pack-l1')?.getBoundingClientRect().top < innerHeight);
    assert.match(await page.locator('[data-order-code="teacher-pack-l1"]').innerText(), /FBT/);
    await page.evaluate(() => { location.hash = 'baseline-sample'; });
    await page.locator('[data-sample-viewer="baseline"]').waitFor();
    await page.keyboard.press('Escape');
    assert.equal(new URL(page.url()).hash, '#baseline');
    assert.deepEqual(errors, [], `${locale} ${width}: no page errors`);
    report.push({ locale, width, cards: ids.length, axeScans: scans.length, errors });
    await context.close();
  }
} finally {
  await browser.close();
}
await fs.writeFile(`${dir}/browser-acceptance.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
