import test from 'node:test';
import assert from 'node:assert/strict';
// @ts-ignore Build tooling is deliberately plain ESM.
import { anchors, clickDepth, normalizeTarget } from '../scripts/seo/crawl-check.mjs';
import entries from '../src/content/gscEditorial.json';
import { resolveRouteMetadata } from '../src/lib/routeMetadata';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { GscEditorial } from '../src/components/GscEditorial';
import { setServerLocation } from '../src/lib/ssrLocation';

test('click graph finds shortest paths, cycles and unreachable pages', () => {
 const graph = new Map([['/',new Set(['/a','/b'])],['/a',new Set(['/b','/c'])],['/b',new Set(['/c'])],['/c',new Set(['/'])],['/orphan',new Set()]]);
 const depth = clickDepth(graph);
 assert.equal(depth.get('/c'),2);
 assert.equal(depth.has('/orphan'),false);
 assert.equal(clickDepth(new Map([['/',new Set(['/a'])],['/a',new Set(['/b'])],['/b',new Set(['/c'])],['/c',new Set(['/d'])]])).get('/d'),4);
});
test('only rendered anchor hrefs count; fragments and query are parsed', () => {
 const links=anchors('<a href="/products?a=1&amp;b=2#x">A</a><button data-href="/fake">B</button><a href="https://example.com/">C</a>', 'https://jurassicenglish.com/');
 assert.equal(links.length,1);
 assert.equal(links[0].search,'?a=1&b=2');
 assert.equal(normalizeTarget('/ai-speaking/vi/samples/basic'),'/ai-speaking/vi/samples');
});
test('editorial is page-specific, substantial and rendered; Article and Course schema have valid fields', () => {
 assert.equal(Object.keys(entries).length,22);
 for(const [pathname, entry] of Object.entries(entries)) {
   assert.ok(entry.paragraphs.join(' ').split(/\s+/).length >= 150,pathname);
   setServerLocation(pathname);
   const html=renderToStaticMarkup(createElement(GscEditorial));
   assert.ok(html.includes('data-gsc-editorial'),pathname);
   assert.ok(html.includes(entry.title),pathname);
   const meta=resolveRouteMetadata(pathname);
   for(const ld of meta.jsonLd ?? []) {
     if(ld['@type']==='Course') { assert.ok(ld.name); assert.ok(ld.description); assert.ok(ld.provider); }
     if(ld['@type']==='FAQPage') for(const question of ld.mainEntity as any[]) { assert.equal(question['@type'],'Question'); assert.ok(question.name); assert.equal(question.acceptedAnswer['@type'],'Answer'); assert.ok(question.acceptedAnswer.text); }
   }
   if(pathname.includes('/thinking-cycle/')) {
     const raw=html.match(/<script[^>]*>(.*?)<\/script>/s)?.[1];
     const article=JSON.parse(raw!);
     assert.equal(article['@type'],'Article');
     assert.equal(article.articleBody,entry.paragraphs.join('\n\n'));
     assert.equal(article.mainEntityOfPage,`https://jurassicenglish.com${pathname}`);
     assert.equal(article.inLanguage,pathname.startsWith('/vi/')?'vi':'en');
   }
 }
 setServerLocation('/');
});

test('host and index redirects preserve canonical final destinations', async () => {
 const { readFile } = await import('node:fs/promises');
 const config=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url),'utf8'));
 const index=config.redirects.find((r: any)=>r.source==='/index.html');
 assert.equal(index.destination,'/');
 assert.equal(index.permanent,true);
 const www=config.redirects.find((r: any)=>r.has?.some((h: any)=>h.type==='host'&&h.value==='www.jurassicenglish.com'));
 assert.ok(www.destination.startsWith('https://jurassicenglish.com/'));
 assert.equal(www.permanent,true);
});
