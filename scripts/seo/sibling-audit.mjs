/** Baseline comparison from rendered pages, before editorial changes. */
import { readFile, writeFile } from 'node:fs/promises';
import { extractVisibleText } from '../lib/visible-text.mjs';
const rows = (await readFile('docs/seo/data/gsc-not-indexed-2026-10-29.csv', 'utf8')).trim().split(/\r?\n/).slice(1).map(line => line.split(','));
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const paths = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => new URL(m[1]).pathname);
const corpus = new Map();
for (const pathname of paths) {
  try {
    const html = await readFile(`dist${pathname === '/' ? '' : pathname}/index.html`, 'utf8');
    const main = html.match(/<main\b[^>]*>[\s\S]*?<\/main>/i)?.[0] || html;
    corpus.set(pathname, { title: html.match(/<title[^>]*>(.*?)<\/title>/s)?.[1], h1: extractVisibleText(main.match(/<h1\b[^>]*>(.*?)<\/h1>/s)?.[1] || ''), words: new Set(extractVisibleText(main).toLowerCase().match(/[\p{L}\p{N}]+/gu) || []) });
  } catch { /* Rewritten app, audited separately. */ }
}
const template = p => p.includes('/syllabus') ? 'syllabus' : p.includes('/series/') && !p.endsWith('/compare') ? 'series' : p.includes('/thinking-cycle/') && !p.endsWith('/compare') ? 'thinking-cycle' : p.includes('/legal/') ? 'legal' : 'standalone';
const result = [];
for (const [url, reason] of rows.filter(r => r[1].startsWith('Crawled'))) {
 const pathname = new URL(url).pathname, current = corpus.get(pathname);
 if (!current) { result.push({ url, template: 'external-rewrite', status: 'See external review; local baseline unavailable' }); continue; }
 const vi = pathname.startsWith('/vi/');
 const nearest = [...corpus].filter(([p]) => p !== pathname && p.startsWith('/vi/') === vi && template(p) === template(pathname)).map(([p, other]) => {
   const intersection = [...current.words].filter(w => other.words.has(w)).length;
   return { path: p, title: other.title, h1: other.h1, bodyTokenJaccard: intersection / new Set([...current.words, ...other.words]).size };
 }).sort((a,b) => b.bodyTokenJaccard-a.bodyTokenJaccard)[0];
 result.push({ url, template: template(pathname), title: current.title, h1: current.h1, nearest, decision: 'Keep: distinct page purpose; add worked example or decision guidance. Token overlap includes shared template and is diagnostic, not a quality score.' });
}
await writeFile('docs/seo/gsc-sibling-baseline.json', JSON.stringify(result, null, 2)+'\n');
console.log(JSON.stringify({ event: 'sibling_baseline', pages: result.length }));
