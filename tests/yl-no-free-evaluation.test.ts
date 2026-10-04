/**
 * Owner decision (4 Oct 2026): "This is a commercial site, nothing free."
 *
 * The free 30-minute Young Learners evaluation is gone from the main site. The
 * paid Live Speaking Baseline (690.000₫, booked in the AI Speaking app at
 * /ai-speaking/baseline) is the entry offer. This guards:
 *   - no free-evaluation offer or its Google Apps Script form in EN / VI / zh-CN
 *     (static EN page, prerendered VI page, the three YL dictionaries, and the
 *     SPA surfaces that used to link to it);
 *   - every Baseline CTA links to the right language of the booking page;
 *   - the printed-QR path /book-evaluation redirects to the booking page;
 *   - no promise that the 690.000₫ is credited against lessons (not built yet).
 *
 * Out of scope (reported to the owner, deliberately not matched here): the
 * Band 7 Target Pathway's "re-sit preparation at no extra tuition" terms.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildViPage, VI_BASELINE_HREF } from '../scripts/prerender-yl-vi.mjs';
import { baselineHref } from '../src/yl/pageI18n.ts';
import { STRINGS } from '../src/yl/i18n.ts';
import { getHomeContent } from '../src/i18n/content/home.ts';

const ROOT = resolve(import.meta.dirname, '..');
const read = (p: string) => readFileSync(resolve(ROOT, p), 'utf8');
const EN_HTML = read('young-learners-speaking/index.html');
const VI_HTML = buildViPage(EN_HTML).html;

const DICT_TEXT = {
  en: Object.values(STRINGS.en).join('\n'),
  vi: Object.values(STRINGS.vi).join('\n'),
  'zh-CN': Object.values(STRINGS['zh-CN']).join('\n'),
};
const SPA_SOURCES = [
  'src/i18n/content/home.ts',
  'src/i18n/ui/en.ts',
  'src/i18n/ui/vi.ts',
  'src/components/AudienceFork.tsx',
  'src/components/ProofStrip.tsx',
  'src/components/TestimonialsEmptyState.tsx',
  'src/lib/routeMetadata.ts',
  'src/yl/YlBotUI.tsx',
];

/** Phrasings of the retired free offer, per language. Targeted, not a blanket "free". */
const FREE_OFFER: { re: RegExp; label: string }[] = [
  { re: /\bfree\b[^.!?\n]{0,30}\b(evaluation|diagnostic|assessment)/i, label: 'en: free evaluation' },
  { re: /\bbook\s+(a\s+)?free\b/i, label: 'en: book free' },
  { re: /30[- ]minute[^.!?\n]{0,20}evaluation/i, label: 'en: 30-minute evaluation' },
  { re: /(đánh giá|chẩn đoán)[^.!?\n]{0,40}miễn phí|miễn phí[^.!?\n]{0,40}(đánh giá|chẩn đoán)/i, label: 'vi: đánh giá miễn phí' },
  { re: /免费[^。！？\n]{0,6}(测评|评估|诊断)|30\s*分钟[^。！？\n]{0,10}免费/, label: 'zh: 免费测评' },
  { re: /script\.google\.com|docs\.google\.com\/forms|forms\.gle/i, label: 'Google form URL' },
  { re: /free[-_]evaluation/i, label: 'free-evaluation id/asset/utm' },
];

function freeOfferHits(text: string): string[] {
  return FREE_OFFER.flatMap(({ re, label }) => {
    const m = text.match(re);
    return m ? [`[${label}] ${m[0]}`] : [];
  });
}

const baselineLinks = (html: string) =>
  [...html.matchAll(/<a\b[^>]*\sdata-baseline-link\b[^>]*>/g)].map((m) => m[0].match(/\shref="([^"]*)"/)?.[1]);

test('no free-evaluation offer remains on the EN page, the VI page or in any YL dictionary', () => {
  for (const [name, text] of Object.entries({ EN_HTML, VI_HTML, ...DICT_TEXT })) {
    assert.deepEqual(freeOfferHits(text), [], name);
  }
  // The old "Free" price chip is gone, not just reworded.
  for (const lang of ['en', 'vi', 'zh-CN'] as const) {
    const values = Object.values(STRINGS[lang]);
    for (const v of ['Free', 'Miễn phí', '免费']) assert.ok(!values.includes(v), `${lang}: a "${v}" value remains`);
    for (const k of ['nav.freeEval', 'pricing.card1price', 'book.openForm', 'book.formQrLabel']) {
      assert.ok(!(k in STRINGS[lang]), `${lang}: stale key ${k}`);
    }
  }
});

test('the page no longer offers the Apps Script form or its QR code', () => {
  for (const [name, html] of Object.entries({ EN_HTML, VI_HTML })) {
    assert.doesNotMatch(html, /data-form-href|free-speaking-evaluation-qr|href="\/book-evaluation"/, name);
  }
});

test('no free-evaluation offer remains on the SPA surfaces that linked to it', () => {
  for (const f of SPA_SOURCES) assert.deepEqual(freeOfferHits(read(f)), [], f);
  for (const locale of ['en', 'vi'] as const) {
    const fork = getHomeContent(locale)?.hero?.fork;
    assert.ok(fork, `${locale}: home fork content`);
    assert.deepEqual(freeOfferHits(JSON.stringify(fork)), [], `${locale}: home fork`);
  }
});

test('EN page: every Baseline CTA opens the English booking page', () => {
  const links = baselineLinks(EN_HTML);
  assert.ok(links.length >= 3, `hero, pricing card and booking CTAs expected, found ${links.length}`);
  for (const href of links) assert.equal(href, '/ai-speaking/baseline');
});

test('VI page: every Baseline CTA opens the Vietnamese booking page', () => {
  const links = baselineLinks(VI_HTML);
  assert.equal(links.length, baselineLinks(EN_HTML).length);
  for (const href of links) assert.equal(href, '/ai-speaking/baseline?lang=vi');
  assert.equal(VI_BASELINE_HREF, baselineHref('vi'));
});

test('runtime language switch: vi gets ?lang=vi, zh-CN falls back to the English page', () => {
  assert.equal(baselineHref('en'), '/ai-speaking/baseline');
  assert.equal(baselineHref('vi'), '/ai-speaking/baseline?lang=vi');
  assert.equal(baselineHref('zh-CN'), '/ai-speaking/baseline');
  const runtime = read('src/yl/pageI18n.ts');
  assert.match(runtime, /querySelectorAll<HTMLAnchorElement>\('a\[data-baseline-link\]'\)/);
  assert.match(runtime, /applyBaselineLinks\(lang\);/);
});

test('SPA Baseline CTAs link to the booking page in the visitor language', () => {
  for (const f of ['src/components/AudienceFork.tsx', 'src/components/ProofStrip.tsx']) {
    assert.match(read(f), /href=\{baselineHref\(locale\)\}/, f);
  }
  assert.match(read('src/components/TestimonialsEmptyState.tsx'), /ctaHref = baselineHref\(locale\)/);
});

test('the Baseline is named, priced and described in all three languages', () => {
  assert.match(EN_HTML, /<strong[^>]*>690\.000₫<\/strong><br><span data-i18n="pricing\.card1p">/);
  assert.match(EN_HTML, /<strong class="form-price">690\.000₫<\/strong>/);
  assert.equal(STRINGS.en['pricing.card1h'], 'Live Speaking Baseline');
  assert.equal(STRINGS.vi['pricing.card1h'], 'Đánh giá Nói trực tiếp'); // the AI Speaking app's VI name
  assert.ok(STRINGS['zh-CN']['pricing.card1h'].includes('口语基线测评'));
  assert.match(STRINGS.en['pricing.card1p'], /^15–20 minutes live on Google Meet with an assessor/);
  assert.match(STRINGS.en['pricing.buyNote'], /after the Speaking Baseline\.$/);
  assert.match(STRINGS.vi['pricing.buyNote'], /sau buổi Đánh giá Nói trực tiếp\.$/);
  assert.match(STRINGS['zh-CN']['pricing.buyNote'], /口语基线测评后/);
});

test('no promise that the Baseline fee is credited against lessons', () => {
  const CREDIT = /credited|credit[- ]back|credit (it )?against|hoàn trừ|được trừ|抵扣|抵用/i;
  for (const [name, text] of Object.entries({ EN_HTML, VI_HTML, ...DICT_TEXT })) {
    assert.doesNotMatch(text, CREDIT, name);
  }
  for (const f of SPA_SOURCES) assert.doesNotMatch(read(f), CREDIT, f);
});

test('/book-evaluation (printed on flyers) redirects to the Baseline booking page', () => {
  const { redirects } = JSON.parse(read('vercel.json')) as {
    redirects: { source: string; destination: string; permanent?: boolean }[];
  };
  const r = redirects.filter((x) => x.source === '/book-evaluation');
  assert.equal(r.length, 1);
  assert.equal(r[0].destination, '/ai-speaking/baseline');
  assert.equal(r[0].permanent, false);
  assert.doesNotMatch(read('vercel.json'), /script\.google\.com/);
});
