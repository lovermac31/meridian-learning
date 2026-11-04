/** Rendered-anchor graph; bounded, read-only upstreams for separate rewritten apps. */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { decodeEntities } from '../lib/visible-text.mjs';
const ORIGIN = 'https://jurassicenglish.com';
export function anchors(html, base) {
  return [...html.matchAll(/<a\b[^>]*\bhref\s*=\s*(["'])(.*?)\1/gi)].flatMap(m => {
    try { const url = new URL(decodeEntities(m[2]), base); return ['jurassicenglish.com', 'www.jurassicenglish.com'].includes(url.hostname) ? [url] : []; } catch { return []; }
  });
}
export function clickDepth(graph, start = '/') {
  const depths = new Map([[start, 0]]), queue = [start];
  for (let i = 0; i < queue.length; i++) for (const target of graph.get(queue[i]) || []) {
    if (!depths.has(target)) { depths.set(target, depths.get(queue[i]) + 1); queue.push(target); }
  }
  return depths;
}
export function normalizeTarget(pathname) {
  return pathname.replace(/\/samples\/basic$/, '/samples');
}
async function main() {
 const config = JSON.parse(await readFile('vercel.json', 'utf8'));
 const sitemap = await readFile('dist/sitemap.xml', 'utf8');
 const paths = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname);
 const rows = (await readFile('docs/seo/data/gsc-not-indexed-2026-10-29.csv', 'utf8')).trim().split(/\r?\n/).slice(1).map(line => {
   const [url, reason] = line.split(','); return { url, reason, path: new URL(url.replace(' (query string omitted)', '')).pathname };
 });
 if (rows.length !== 91 || rows.filter(r => r.reason.startsWith('Discovered')).length !== 61) throw new Error('Unexpected GSC input inventory');
 const excluded = new Set(rows.map(r => r.url));
 const indexed = new Set(paths.filter(p => !excluded.has(ORIGIN+p) && !['/site-map','/vi/so-do-trang'].includes(p)));
 const inventory = new Set(paths), graph = new Map(), htmls = new Map(), failures = [], upstreamWarnings = [];
 const directRedirects = new Set(config.redirects.filter(r => !r.has && !r.source.includes(':')).map(r => r.source));
 const work = [...paths];
 await Promise.all(Array.from({length: 5}, async () => {
   while (work.length) {
    const pathname = work.shift();
    const external = config.rewrites.some(rule => /^https:\/\//.test(rule.destination) && (pathname === rule.source || rule.source.endsWith('/:path*') && pathname.startsWith(rule.source.split('/:path*')[0]+'/')));
    let html, source = 'local-build';
    try {
      if (external && /student-academy|interactive-demo|book-diagnostic|digital-reasoning-engine|school-framework|evidence/.test(pathname)) {
        html = await readFile(`docs/jurassic-english---b2b-evidence-showcase/ecosystem-landing/.next/server/app${pathname}.html`, 'utf8'); source = 'local-academy-build';
      } else if (external) {
        const response = await fetch(ORIGIN+pathname, { redirect: 'manual', signal: AbortSignal.timeout(20000) });
        if (response.status !== 200) throw new Error(`upstream HTTP ${response.status}`);
        html = await response.text(); source = 'live-external-rewrite';
      } else html = await readFile(`dist${pathname === '/' ? '' : pathname}/index.html`, 'utf8');
      htmls.set(pathname, html);
      const links = anchors(html, ORIGIN+pathname);
      graph.set(pathname, new Set(links.map(u => u.pathname).filter(p => inventory.has(p))));
      // Only actual hrefs count. Do not silently resolve redirects or canonicalise broken links.
      for (const url of links) if (directRedirects.has(url.pathname) || url.hostname === 'www.jurassicenglish.com' || url.protocol === 'http:') (source === 'live-external-rewrite' && url.pathname.endsWith('/samples/basic') ? upstreamWarnings : failures).push({ from: pathname, error: 'redirecting-internal-link', href: url.href, source });
    } catch(error) { failures.push({ from: pathname, error: error.message, source }); }
   }
 }));
 const depths = clickDepth(graph);
 for (const pathname of paths) if (!depths.has(pathname) || depths.get(pathname) > 3) failures.push({ path: pathname, error: 'click-depth', depth: depths.get(pathname) ?? null });
 const inbound = p => [...graph].filter(([from, links]) => indexed.has(from) && links.has(p)).map(([from]) => from).sort();
 const contextual = p => [...htmls].filter(([from, html]) => indexed.has(from) && [...html.matchAll(/<section\b[^>]*data-crawl-resources=[\s\S]*?<\/section>/g)].some(m => anchors(m[0], ORIGIN+from).some(u => u.pathname === p))).map(([from]) => from).sort();
 const report = rows.map(row => {
   const target = normalizeTarget(row.path), sources = inbound(target), contextSources = contextual(target);
   if (row.reason.startsWith('Discovered') && contextSources.length < 3) failures.push({ path: row.path, target, error: 'fewer-than-three-indexed-contextual-sources', sources: contextSources });
   return { ...row, target, indexedInboundCount: sources.length, indexedSources: sources, contextualSources: contextSources, clickDepth: depths.get(target) ?? null };
 });
 failures.sort((a,b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
 upstreamWarnings.sort((a,b) => a.from.localeCompare(b.from));
 await writeFile('docs/seo/gsc-crawl-report.json', JSON.stringify({ rows: report, failures, upstreamWarnings, inventory: paths.map(p => ({ path: p, depth: depths.get(p) ?? null })) }, null, 2)+'\n');
 console.log(JSON.stringify({ event: 'crawl_graph_summary', pages: paths.length, gscRows: rows.length, failures, upstreamWarnings }));
 if (failures.length) process.exitCode = 1;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
