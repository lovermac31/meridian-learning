// Writes src/content/seoPagesMeta.json: every SEO page minus its `html` body.
// Routing, head metadata and the app shell import this light file, so the ~0.5 MB of
// article HTML only loads on the SEO pages themselves (src/lib/seoPages.ts).
// Runs at the start of `npm run build`; tests/seo-pages-meta.test.ts fails on drift.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('..', import.meta.url);
export function buildSeoPagesMeta(pages) {
  return pages.map(({ html, ...meta }) => meta);
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const pages = JSON.parse(readFileSync(new URL('src/content/seoPages.json', root), 'utf8'));
  writeFileSync(new URL('src/content/seoPagesMeta.json', root), `${JSON.stringify(buildSeoPagesMeta(pages), null, 2)}\n`);
  console.log(`[seo-pages-meta] ${pages.length} pages`);
}
