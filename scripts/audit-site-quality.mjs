/** Offline built-site audit. No credentials, APIs, third-party requests or SPA fallbacks. */
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const { builtSite } = await import('./lib/built-site.mjs');
const inventory = await builtSite();
const output = process.argv[2] || '/tmp/site-quality.json';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.json': 'application/json', '.pdf': 'application/pdf' };
const server = createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405).end(); return; }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = inventory.files.get(pathname) || inventory.files.get(pathname.replace(/\/$/, '') + '/index.html');
    if (!file) throw Error('missing');
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(await readFile(file));
  } catch { res.writeHead(404).end('Not found'); }
});
server.requestTimeout = 15000;
server.headersTimeout = 10000;
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const routes = inventory.pages.filter(p => !process.env.QUALITY_ONLY_ACADEMY || p.source === 'academy').map(p => p.route).sort();
const browser = await chromium.launch({ args: ['--mute-audio'] });
const rows = [];
try {
  const queue = [...routes];
  await Promise.all(Array.from({ length: 4 }, async () => {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
    await context.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.origin !== origin || url.pathname.startsWith('/api/') || !['GET', 'HEAD'].includes(route.request().method())) return route.abort();
      return route.continue();
    });
    await context.addInitScript(() => {
      window.addEventListener('je:hydrated', () => { window.__qualityHydrated = true; });
    });
    const page = await context.newPage();
    while (queue.length) {
      const route = queue.shift();
      try {
        const response = await page.goto(origin + route, { waitUntil: 'networkidle', timeout: 30000 });
        if (response.status() !== 200) throw new Error(`Built page returned HTTP ${response.status()}`);
        if (await page.locator('[data-ssr-route]').count()) {
          await page.waitForFunction(() => window.__qualityHydrated === true, undefined, { timeout: 15000 });
          await page.locator('h1').waitFor({ state: 'attached', timeout: 10000 });
        }
        // Trigger every below-fold reveal before checking its contrast and image loading.
        await page.evaluate(async () => {
          for (let y = 0; y < document.documentElement.scrollHeight; y += 650) {
            scrollTo(0, y);
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
          }
          scrollTo(0, 0);
        });
        await page.waitForTimeout(1000);
        await page.locator('img').evaluateAll(images => Promise.race([Promise.all(images.filter(img => img.getClientRects().length).map(img => img.decode().catch(() => {}))), new Promise(resolve => setTimeout(resolve, 5000))]));
        const metrics = await page.evaluate(() => {
          const visible = el => el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden';
          return {
            h1: document.querySelectorAll('h1').length,
            overflow: document.documentElement.scrollWidth > innerWidth + 1,
            overflowing: [...document.querySelectorAll('body *')].filter(el => visible(el) && el.getBoundingClientRect().right > innerWidth + 1).slice(0, 6).map(el => el.outerHTML.slice(0, 240)),
            images: [...document.images].map(img => ({ src: img.getAttribute('src'), alt: img.getAttribute('alt'), width: img.getAttribute('width'), height: img.getAttribute('height'), loading: img.loading, top: img.getBoundingClientRect().top, broken: img.currentSrc.startsWith(location.origin) && img.complete && !img.naturalWidth })),
            links: [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')),
            fonts: [...document.querySelectorAll('link[rel="preload"][as="font"]')].map(l => ({ href: l.href, used: [...document.querySelectorAll('body *')].some(el => visible(el) && el.textContent.trim() && getComputedStyle(el).fontFamily.includes(l.href.includes('lilitaone') ? 'Lilita One' : 'Neuland')) })),
          };
        });
        // All requested checks plus WCAG AA contrast; disabled/hidden controls follow axe semantics.
        const axe = await new AxeBuilder({ page }).withRules(['image-alt', 'button-name', 'link-name', 'label', 'select-name', 'color-contrast', 'input-button-name', 'input-image-alt']).analyze();
        rows.push({ route, ...metrics, violations: axe.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, html: n.html, summary: n.failureSummary })) })) });
      } catch (error) { rows.push({ route, error: error.message }); }
      if (rows.length % 25 === 0) { await writeFile(output + '.partial', JSON.stringify(rows, null, 2)); }
      if (rows.length % 25 === 0) console.log(JSON.stringify({ event: 'quality_progress', completed: rows.length, total: routes.length }));
    }
    await context.close();
  }));
} finally { await browser.close(); server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
rows.sort((a,b) => a.route.localeCompare(b.route));
const counts = { brokenImages: rows.flatMap(r => r.images || []).filter(i => i.broken).length, pages: rows.length, errors: rows.filter(r => r.error).length, h1: rows.filter(r => r.h1 !== 1).length, overflow: rows.filter(r => r.overflow).length, missingAlt: rows.flatMap(r => r.images || []).filter(i => i.alt === null).length, missingDimensions: rows.flatMap(r => r.images || []).filter(i => !i.width || !i.height).length, belowFoldEager: rows.flatMap(r => r.images || []).filter(i => i.top > 812 && i.loading !== 'lazy').length, unusedFontPreloads: rows.flatMap(r => r.fonts || []).filter(f => !f.used).length };
for (const v of rows.flatMap(r => r.violations || [])) counts[v.id] = (counts[v.id] || 0) + v.nodes.length;
await writeFile(output, JSON.stringify({ counts, rows }, null, 2) + '\n');
console.log(JSON.stringify({ event: 'quality_summary', ...counts, report: output }));
if (counts.errors || counts.brokenImages || counts.belowFoldEager || counts.h1 || counts.missingAlt || counts.missingDimensions || counts.unusedFontPreloads || counts.overflow || counts['button-name'] || counts['link-name'] || counts.label || counts['select-name'] || counts['color-contrast']) process.exitCode = 1;
