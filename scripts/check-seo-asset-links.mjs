/** Verify built HTML and HTTP destinations; no SPA fallback, mocks, writes or browser needed. */
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const cards = JSON.parse(await readFile('src/content/assetLinks.json', 'utf8'));
const academy = 'docs/jurassic-english---b2b-evidence-showcase/ecosystem-landing/.next/server/app';
const log = (event, detail) => console.log(JSON.stringify({ event, ...detail }));
let baseline;
const server = createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  try {
    let body;
    if (pathname === '/ai-speaking/baseline') {
      // Same read-only upstream as vercel.json; cache one GET for this run.
      baseline ??= fetch('https://jurassic-ai-speaking.vercel.app/ai-speaking/baseline', { signal: AbortSignal.timeout(20000) }).then(async response => {
        assert.equal(response.status, 200, 'baseline upstream');
        const html = await response.text();
        assert.match(html, /<link[^>]+rel="canonical"[^>]+href="https:\/\/jurassicenglish\.com\/ai-speaking\/baseline"/, 'baseline canonical, not a generic fallback');
        log('upstream_verified', { pathname, status: response.status });
        return html;
      });
      body = await baseline;
    } else {
      assert.ok(/^\/[a-zA-Z0-9/_-]*$/.test(pathname), 'safe built route');
      const file = pathname.includes('student-academy')
        ? path.join(root, academy, `${pathname.slice(1)}.html`)
        : path.join(root, 'dist', pathname.slice(1), 'index.html');
      body = await readFile(file, 'utf8');
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(body);
  } catch {
    res.writeHead(502, { 'Content-Type': 'text/plain' }).end('Built route verification failed');
  }
});
server.requestTimeout = 25000;
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const get = async href => {
  const response = await fetch(new URL(href, origin), { signal: AbortSignal.timeout(25000), redirect: 'error' });
  assert.equal(response.status, 200, href);
  return response.text();
};
try {
  let internal = 0;
  for (const card of cards) {
    const html = await get(card.path);
    const markers = [...html.matchAll(/<aside\b[^>]*data-seo-asset-links="[^"]+"[^>]*>[\s\S]*?<\/aside>/g)];
    assert.equal(markers.length, 1, `${card.path}: exactly one rendered card`);
    const hrefs = [...markers[0][0].matchAll(/href="([^"]+)"/g)].map(match => match[1].replaceAll('&amp;', '&'));
    assert.deepEqual(hrefs, card.links.map(link => link.href), `${card.path}: inventory matches built links`);
    for (const { href } of card.links) {
      if (!href.startsWith('/')) continue;
      const body = await get(href);
      assert.doesNotMatch(body, /<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i, href);
      internal++;
      log('internal_link_ok', { from: card.path, to: href, status: 200 });
    }
  }
  const sitemap = await readFile('dist/sitemap.xml', 'utf8');
  for (const route of ['/story-club/reserve', '/en/story-club/reserve']) {
    const body = await get(route);
    assert.doesNotMatch(body, /<meta[^>]+name="robots"[^>]+content="[^"]*noindex/i);
    const entry = sitemap.split('<url>').find(part => part.includes(`<loc>https://jurassicenglish.com${route}</loc>`));
    assert.ok(entry, `${route}: sitemap entry`);
    for (const [lang, href] of [['vi', '/story-club/reserve'], ['en', '/en/story-club/reserve']]) {
      assert.ok(entry.includes(`hreflang="${lang}" href="https://jurassicenglish.com${href}"`), `${route}: reciprocal ${lang}`);
    }
  }
  log('asset_links_pass', { pages: cards.length, links: cards.reduce((n, card) => n + card.links.length, 0), internal, reserveSitemap: 'indexable with reciprocal hreflang' });
} finally {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
