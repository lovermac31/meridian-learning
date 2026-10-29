/** Check every built sitemap entry. Native pages use a strict local static server;
 * external rewrite pages use bounded public GETs on the canonical production origin.
 * No SPA fallback, external-route exemption, credentials, GSC or write requests.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { countMainContentWords, countWords, extractVisibleText, decodeEntities } from '../lib/visible-text.mjs';

export const ORIGIN = 'https://jurassicenglish.com';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const dist = path.join(root, 'dist');
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g)].map((m) => [m[1].toLowerCase(), decodeEntities(m[3])]));
export function inspectHtml(html, url, xrobots = '') {
  const errors = [];
  const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => attrs(m[0]));
  const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => attrs(m[0]));
  const canonicals = links.filter((a) => a.rel === 'canonical');
  // URL() normalizes the equivalent bare origin and origin + '/' spelling.
  try {
    if (canonicals.length !== 1 || !canonicals[0].href?.trim() || new URL(canonicals[0].href, ORIGIN).href !== new URL(url).href) errors.push('non-self-canonical');
  } catch { errors.push('non-self-canonical'); }
  if (/noindex|none/i.test([xrobots, ...metas.filter((a) => /^(robots|googlebot|bingbot)$/i.test(a.name || '')).map((a) => a.content)].join(' '))) errors.push('noindex');
  const main = countMainContentWords(html);
  const mainHtml = /<main\b[^>]*>[\s\S]*?<\/main>/i.exec(html)?.[0] || '';
  if (main.mainCount < 1 || main.words < 150 || countWords(extractVisibleText(mainHtml)) < 50 || !/<h1\b/i.test(html)) errors.push('empty-or-placeholder-content');
  const title = decodeEntities(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] || '').trim();
  const description = metas.find((a) => a.name === 'description')?.content?.trim();
  if (!title) errors.push('missing-title');
  if (!description) errors.push('missing-description');
  const lang = attrs(/<html\b[^>]*>/i.exec(html)?.[0] || '').lang;
  if (!lang || (/\/vi(?:\/|$)/.test(new URL(url).pathname) && lang !== 'vi')) errors.push('wrong-html-lang');
  return { errors, title, description, mainWords: main.words, lang, alternates: links.filter((a) => a.hreflang).map((a) => ({ lang: a.hreflang, url: new URL(a.href, url).href })) };
}

async function main() {
  const config = JSON.parse(await readFile(path.join(root, 'vercel.json'), 'utf8'));
  const sitemap = await readFile(path.join(dist, 'sitemap.xml'), 'utf8');
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => decodeEntities(m[1]));
  if (!urls.length || new Set(urls).size !== urls.length) throw new Error('Empty or duplicate sitemap inventory');
  for (const url of urls) if (new URL(url).origin !== ORIGIN || new URL(url).search || new URL(url).hash) throw new Error('Invalid sitemap origin/query/fragment');
  const isExternal = (pathname) => config.rewrites.some((rule) => /^https:\/\//.test(rule.destination) && (pathname === rule.source || (rule.source.endsWith('/:path*') && pathname.startsWith(rule.source.split('/:path*')[0] + '/'))));
  const server = createServer(async (req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    const redirect = config.redirects.find((rule) => rule.source === pathname && !rule.has);
    if (redirect) { res.writeHead(redirect.permanent ? 308 : 307, { Location: redirect.destination }); res.end(); return; }
    try {
      const target = path.join(dist, pathname, 'index.html');
      if (!target.startsWith(dist + '/')) throw new Error('Invalid path');
      await stat(target);
      res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(await readFile(target));
    } catch { res.writeHead(404); res.end('Not found'); }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const localOrigin = `http://127.0.0.1:${server.address().port}`;
  const rows = [];
  const deadline = AbortSignal.timeout(180000);
  try {
    for (const url of urls) {
      const pathname = new URL(url).pathname;
      const external = isExternal(pathname);
      const row = { url, source: external ? 'live-external-rewrite' : 'local-build', errors: [], warnings: [] };
      try {
        const response = await fetch(external ? url : `${localOrigin}${pathname}`, { redirect: 'manual', signal: AbortSignal.any([deadline, AbortSignal.timeout(20000)]) });
        row.status = response.status;
        if (response.status !== 200) row.errors.push(`http-${response.status}`);
        const html = await response.text();
        const parsed = inspectHtml(html, url, response.headers.get('x-robots-tag') || '');
        Object.assign(row, parsed, { errors: [...row.errors, ...parsed.errors] });
        // Local transport is strict static hosting. Enforce declared noindex headers as well.
        for (const rule of config.headers) {
          if (!rule.headers.some((h) => h.key.toLowerCase() === 'x-robots-tag' && /noindex|none/i.test(h.value))) continue;
          const pattern = rule.source.replace(/:\w+\*/g, '.*');
          if (new RegExp(`^${pattern}$`).test(pathname)) row.errors.push('configured-noindex-header');
        }
      } catch (error) { row.errors.push(`fetch-or-parse-${error.name}`); }
      rows.push(row);
      console.log(JSON.stringify({ event: 'indexability_check', ...row }));
    }
    const titles = new Map(), descriptions = new Map();
    for (const row of rows) {
      for (const [value, inventory, label] of [[row.title, titles, 'duplicate-title'], [row.description, descriptions, 'duplicate-description']]) {
        if (!value) continue;
        if (inventory.has(value)) (row.source === 'live-external-rewrite' ? row.warnings : row.errors).push(`${label}:${inventory.get(value)}`);
        else inventory.set(value, row.url);
      }
      for (const alt of row.alternates || []) {
        const target = rows.find((r) => r.url === alt.url);
        if (!target || !target.alternates?.some((a) => a.url === row.url) || target.status !== 200) row.errors.push(`hreflang-not-reciprocal:${alt.url}`);
      }
    }
    if (process.argv.includes('--report')) await import('node:fs/promises').then((fs) => fs.writeFile(path.join(root, 'docs/seo/indexability-after-2026-10-29.json'), JSON.stringify(rows, null, 2) + '\n'));
    const failures = rows.filter((r) => r.errors.length);
    console.log(JSON.stringify({ event: 'indexability_summary', total: rows.length, local: rows.filter((r) => r.source === 'local-build').length, failures: failures.map(({ url, errors }) => ({ url, errors })), warnings: rows.filter((r) => r.warnings.length).map(({ url, warnings }) => ({ url, warnings })) }));
    if (failures.length) process.exitCode = 1;
  } finally { await new Promise((resolve) => server.close(resolve)); }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
