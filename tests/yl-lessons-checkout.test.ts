/**
 * Guards the 1-to-1 lesson checkout buttons on /young-learners-speaking/ and its
 * Vietnamese edition: both packs link to the AI Speaking checkout (VI page → VI
 * checkout), prices use one format (800.000₫), and no card-payment promise remains
 * (payments are VietQR bank transfer only until cards are offered).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildViPage } from '../scripts/prerender-yl-vi.mjs';
import { lessonsHref } from '../src/yl/pageI18n.ts';

const ROOT = resolve(import.meta.dirname, '..');
const read = (p: string) => readFileSync(resolve(ROOT, p), 'utf8');
const EN_HTML = read('young-learners-speaking/index.html');
const VI_HTML = buildViPage(EN_HTML).html;
const DICTS = {
  en: read('src/yl/i18n.ts'),
  vi: read('src/yl/i18n.vi.json'),
  zh: read('src/yl/i18n.zh-CN.json'),
};
const links = (html: string) =>
  [...html.matchAll(/<a\b[^>]*\sdata-lessons-pack="([^"]+)"[^>]*\shref="([^"]+)"/g)].map((m) => ({ pack: m[1], href: m[2] }));

test('EN page links both lesson packs to the AI Speaking checkout', () => {
  assert.deepEqual(links(EN_HTML), [
    { pack: 'lesson_single', href: '/ai-speaking/lessons?pack=lesson_single' },
    { pack: 'lesson_month', href: '/ai-speaking/lessons?pack=lesson_month' },
  ]);
});

test('VI edition links to the Vietnamese checkout', () => {
  assert.deepEqual(links(VI_HTML), [
    { pack: 'lesson_single', href: '/ai-speaking/lessons?lang=vi&amp;pack=lesson_single' },
    { pack: 'lesson_month', href: '/ai-speaking/lessons?lang=vi&amp;pack=lesson_month' },
  ]);
});

test('runtime language switch rewrites the links the same way', () => {
  assert.equal(lessonsHref('lesson_single', 'en'), '/ai-speaking/lessons?pack=lesson_single');
  assert.equal(lessonsHref('lesson_month', 'vi'), '/ai-speaking/lessons?lang=vi&pack=lesson_month');
  assert.equal(lessonsHref('lesson_month', 'zh-CN'), '/ai-speaking/lessons?pack=lesson_month');
});

test('no card-payment promise remains in any language', () => {
  for (const [name, text] of Object.entries({ EN_HTML, VI_HTML, ...DICTS })) {
    assert.doesNotMatch(text, /international card|thẻ quốc tế|国际银行卡/i, name);
  }
});

test('one VND price format: 800.000₫, never 800,000d', () => {
  for (const [name, text] of Object.entries({ EN_HTML, VI_HTML, ...DICTS })) {
    assert.doesNotMatch(text, /\d{1,3}(?:,\d{3})+\s?(?:d\b|₫|đ|VND)/, name);
  }
  assert.match(EN_HTML, /800\.000₫/);
});
