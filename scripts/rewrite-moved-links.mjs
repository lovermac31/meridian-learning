/**
 * IELTS migration P7: point every built page's link to a moved /ai-speaking address straight at jurassicielts.com
 * (no redirect hop). Reads the same vercel.json rows as src/config/movedToJurassicielts.ts (movedHref keeps the query
 * string and fragment for /ai-speaking). Runs after the prerender steps in `npm run build`, over every built HTML file,
 * so prerendered React pages and copied static pages (index.html, young-learners-speaking, challenges, film) agree.
 * Only /ai-speaking links are touched; the 30-day held pages (exam, solutions, ladder) and /api stay as written.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { walkFiles } from './lib/built-site.mjs';
import { isMovedToJurassicielts, movedHref } from '../src/config/movedToJurassicielts.ts';

export const isAiSpeakingHref = (href) => /^(?:https:\/\/(?:www\.)?jurassicenglish\.com)?\/ai-speaking(?:[/?#]|$)/.test(href);

/**
 * IELTS migration P10: every other moved address (country pages, guides, tools, the founder film's market links) also goes
 * straight to jurassicielts.com, so a crawl of the built site finds no link that hops through a redirect (acceptance A1).
 */
export const isMovedHrefOnJe = (href) => {
  const m = /^(?:https:\/\/(?:www\.)?jurassicenglish\.com)?(\/[^?#]*)/.exec(href);
  return Boolean(m) && isMovedToJurassicielts(m[1]);
};

export function rewriteAiSpeakingLinks(html) {
  let changed = 0;
  const out = html.replace(/(<a\b[^>]*?\shref=)(["'])(.*?)\2/gi, (whole, head, quote, raw) => {
    const href = raw.replace(/&amp;/g, '&');
    if (!isAiSpeakingHref(href) && !isMovedHrefOnJe(href)) return whole;
    const next = movedHref(href);
    if (next === href) return whole;
    changed++;
    return `${head}${quote}${next.replace(/&/g, '&amp;')}${quote}`;
  });
  return { html: out, changed };
}

async function main(directory = 'dist') {
  const root = path.resolve(directory);
  let files = 0, links = 0;
  for (const file of await walkFiles(root)) {
    if (!file.endsWith('.html')) continue;
    const { html, changed } = rewriteAiSpeakingLinks(await readFile(file, 'utf8'));
    if (changed) { await writeFile(file, html); files++; links += changed; }
  }
  console.log(JSON.stringify({ event: 'moved_ai_speaking_links_rewritten', files, links }));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main(process.argv[2]);
