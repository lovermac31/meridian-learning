/**
 * Prerender the Vietnamese young-learners page to a real, indexable URL.
 *
 * Why: /young-learners-speaking/?lang=vi served byte-identical English HTML
 * (lang="en", English <title>, canonical → the English URL). The Vietnamese
 * copy only appeared after the client runtime swapped text in, so search
 * engines had no Vietnamese page to index for the site's only priced offer.
 *
 * What: take the built English page, apply the existing VI dictionary to every
 * [data-i18n] / [data-i18n-html] element exactly as pageI18n.ts does at
 * runtime, localise <head>, and write dist/vi/luyen-noi-ielts/index.html.
 *
 * The page declares data-yl-page-lang="vi" so the runtime keeps it Vietnamese
 * instead of resetting to English (see resolveInitialLang in src/yl/i18n.ts).
 *
 * No dependency added: the runtime sets textContent on 254 elements and
 * innerHTML on 10, none of which nest their own tag name, so a balanced-tag
 * scan is sufficient. Every substitution is re-checked before writing.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(ROOT, 'dist/young-learners-speaking/index.html');
const OUT = resolve(ROOT, 'dist/vi/luyen-noi-ielts/index.html');
const VI = JSON.parse(readFileSync(resolve(ROOT, 'src/yl/i18n.vi.json'), 'utf8'));

export const SITE = 'https://jurassicenglish.com';
export const EN_PATH = '/young-learners-speaking/';
export const VI_PATH = '/vi/luyen-noi-ielts/';

const escapeText = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapeAttr = (s) => escapeText(s).replace(/"/g, '&quot;');

/** Index of the closing tag that balances the element opened just before `from`. */
function findClose(html, tag, from) {
  const re = new RegExp(`<${tag}(?=[\\s>/])|</${tag}\\s*>`, 'gi');
  re.lastIndex = from;
  let depth = 1;
  let m;
  while ((m = re.exec(html))) {
    depth += m[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return m.index;
  }
  throw new Error(`unbalanced <${tag}> starting at ${from}`);
}

/** Replace the inner content of every element carrying attr="key". */
function localiseBody(html) {
  const re = /<([a-zA-Z][\w-]*)\b[^>]*?\sdata-i18n(-html)?="([^"]+)"[^>]*>/g;
  let out = '';
  let cursor = 0;
  let replaced = 0;
  let m;
  while ((m = re.exec(html))) {
    const [open, tag, isHtml, key] = m;
    if (!(key in VI)) continue; // keep English, exactly as the runtime falls back
    const innerStart = m.index + open.length;
    const innerEnd = findClose(html, tag, innerStart);
    out += html.slice(cursor, innerStart) + (isHtml ? VI[key] : escapeText(VI[key]));
    cursor = innerEnd;
    re.lastIndex = innerEnd;
    replaced++;
  }
  return { html: out + html.slice(cursor), replaced };
}

function setMeta(html, attr, name, value) {
  const re = new RegExp(`(<meta\\s+${attr}="${name}"\\s+content=")[^"]*(")`);
  if (!re.test(html)) throw new Error(`meta ${attr}="${name}" not found`);
  return html.replace(re, `$1${escapeAttr(value)}$2`);
}

function localiseHead(html) {
  let h = html
    .replace(/<html\b([^>]*?)\slang="[^"]*"/, '<html$1 lang="vi" data-yl-page-lang="vi"')
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeText(VI['meta.title'])}</title>`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${SITE}${VI_PATH}$2`);

  h = setMeta(h, 'name', 'description', VI['meta.description']);
  h = setMeta(h, 'property', 'og:title', VI['meta.ogTitle']);
  h = setMeta(h, 'property', 'og:description', VI['meta.ogDescription']);
  h = setMeta(h, 'property', 'og:url', `${SITE}${VI_PATH}`);
  h = setMeta(h, 'property', 'og:locale', 'vi_VN');
  h = setMeta(h, 'name', 'twitter:title', VI['meta.twitterTitle']);
  h = setMeta(h, 'name', 'twitter:description', VI['meta.twitterDescription']);
  return h;
}

/** The page references its images relatively; anchor them to the EN page's asset tree. */
function absolutiseAssets(html) {
  return html.replace(/(\s(?:src|href|srcset|content|data-src)=")assets\//g, `$1${EN_PATH}assets/`)
             .replace(/(,\s*)assets\//g, `$1${EN_PATH}assets/`);
}

export function buildViPage(enHtml) {
  const body = localiseBody(enHtml);
  const html = absolutiseAssets(localiseHead(body.html));
  return { html, replaced: body.replaced };
}

// Run only when executed directly (tests import buildViPage without writing).
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const en = readFileSync(SRC, 'utf8');
  const { html, replaced } = buildViPage(en);
  const expected = (en.match(/\sdata-i18n(-html)?="/g) || []).length;
  if (replaced !== expected) {
    throw new Error(`[prerender-yl-vi] localised ${replaced}/${expected} elements — refusing to write a partial page`);
  }
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, html);
  console.log(`[prerender-yl-vi] wrote ${VI_PATH} (${replaced}/${expected} elements localised)`);
}
