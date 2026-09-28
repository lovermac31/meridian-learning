/**
 * Guards the prerendered Vietnamese edition of /young-learners-speaking/.
 *
 * Regression being prevented: /young-learners-speaking/?lang=vi used to serve
 * byte-identical English HTML (lang="en", English title, canonical → EN), so
 * search engines had no Vietnamese page for the site's only priced offer.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildViPage, SITE, EN_PATH, VI_PATH } from '../scripts/prerender-yl-vi.mjs';

const ROOT = resolve(import.meta.dirname, '..');
const EN_HTML = readFileSync(resolve(ROOT, 'young-learners-speaking/index.html'), 'utf8');
const VI: Record<string, string> = JSON.parse(
  readFileSync(resolve(ROOT, 'src/yl/i18n.vi.json'), 'utf8'),
);
const { html, replaced } = buildViPage(EN_HTML);

const unescape = (s: string) =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const alternates = (page: string) =>
  Object.fromEntries([...page.matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]]));

test('every translatable element is localised — no partial page', () => {
  const expected = (EN_HTML.match(/\sdata-i18n(-html)?="/g) ?? []).length;
  assert.ok(expected > 200, `source should carry the full i18n surface, found ${expected}`);
  assert.equal(replaced, expected);
});

test('every page key has a Vietnamese string', () => {
  const keys = new Set([...EN_HTML.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)].map((m) => m[1]));
  const missing = [...keys].filter((k) => !(k in VI));
  assert.deepEqual(missing, []);
});

test('text elements carry exactly the dictionary value', () => {
  const re = /<(\w+)[^>]*?\sdata-i18n="([^"]+)"[^>]*>([^<]*)<\/\1>/g;
  let checked = 0;
  for (const m of html.matchAll(re)) {
    assert.equal(unescape(m[3]), VI[m[2]], `key ${m[2]}`);
    checked++;
  }
  assert.ok(checked > 200, `checked ${checked}`);
});

test('head is Vietnamese and self-canonical', () => {
  assert.match(html, /<html\b[^>]*\slang="vi"/);
  assert.match(html, /data-yl-page-lang="vi"/);
  assert.equal(unescape(html.match(/<title>([^<]*)/)![1]), VI['meta.title']);
  assert.match(html, new RegExp(`rel="canonical" href="${SITE}${VI_PATH}"`));
  assert.match(html, new RegExp(`property="og:url" content="${SITE}${VI_PATH}"`));
  assert.match(html, /property="og:locale" content="vi_VN"/);
  assert.equal(
    unescape(html.match(/name="description" content="([^"]*)"/)![1]),
    VI['meta.description'],
  );
});

test('language alternates are reciprocal between EN and VI, with no ?lang= targets', () => {
  const expected = {
    en: `${SITE}${EN_PATH}`,
    vi: `${SITE}${VI_PATH}`,
    'x-default': `${SITE}${EN_PATH}`,
  };
  assert.deepEqual(alternates(html), expected);
  assert.deepEqual(alternates(EN_HTML), expected);
});

test('no relative asset paths survive the move to /vi/', () => {
  assert.doesNotMatch(html, /\s(?:src|href|srcset|content)="assets\//);
});

test('English page is not declared as a language page', () => {
  assert.doesNotMatch(EN_HTML, /data-yl-page-lang/);
});
