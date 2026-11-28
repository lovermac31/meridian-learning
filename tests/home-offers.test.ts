/**
 * Homepage layout B (14 Oct 2026): the header "Book & pricing" CTA and the
 * offers band (#book) directly under the hero.
 *
 * Guards: every revenue path is in the server-rendered band in EN and VI
 * (VI only where a live, self-canonical VI page was verified), each band CTA
 * has its own analytics label, the band's in-repo prices match the Young
 * Learners checkout page, and the header keeps the Writing pill at every
 * desktop width and anchors its CTA to the band.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Navbar } from '../src/components/Navbar';
import { OffersBand } from '../src/components/OffersBand';
import { getHomeContent } from '../src/i18n/content/home';
import { setServerLocation } from '../src/lib/ssrLocation';

const ROOT = resolve(import.meta.dirname, '..');
const read = (p: string) => readFileSync(resolve(ROOT, p), 'utf8');
const noop = () => {};
const hrefsIn = (html: string) =>
  [...html.matchAll(/<a\b[^>]*?\shref="([^"]*)"/g)].map((m) => m[1].replace(/&amp;/g, '&'));

const REVENUE_HREFS = {
  en: [
    'https://jurassicielts.com/ai-speaking/baseline',
    '/young-learners-speaking/#pricing',
    '/book-diagnostic',
    'https://jurassicielts.com/ai-speaking',
    'https://jurassicielts.com/ai-speaking/solutions', // moved to JI by G7 (#386)
    'https://jurassicielts.com/ai-speaking/writing/demo',
  ],
  vi: [
    'https://jurassicielts.com/ai-speaking/baseline?lang=vi',
    '/vi/luyen-noi-ielts/#pricing',
    '/book-diagnostic', // no Vietnamese page; the VI copy says the form is in English
    'https://jurassicielts.com/ai-speaking/vi',
    'https://jurassicielts.com/ai-speaking/vi/solutions',
    'https://jurassicielts.com/ai-speaking/vi/writing/demo',
  ],
} as const;

function renderBand(path: string) {
  setServerLocation(path);
  try {
    return renderToStaticMarkup(createElement(OffersBand));
  } finally {
    setServerLocation('/');
  }
}

test('the offers band server-renders all six revenue paths, in the visitor language', () => {
  for (const [path, locale] of [['/', 'en'], ['/vi', 'vi']] as const) {
    const html = renderBand(path);
    assert.match(html, /<section id="book"/, `${path}: #book anchor`);
    assert.deepEqual(hrefsIn(html), [...REVENUE_HREFS[locale]], path);
  }
});

test('the band markup does not depend on the query string or hash (hydration parity)', () => {
  const server = renderBand('/vi');
  const globals = globalThis as unknown as { window?: unknown };
  const saved = globals.window;
  globals.window = { location: { pathname: '/vi', search: '?utm_source=facebook', hash: '#book' } };
  try {
    assert.equal(renderBand('/vi'), server);
  } finally {
    globals.window = saved;
  }
});

test('every band CTA has its own analytics label; the folded social card keeps its label', () => {
  const src = read('src/components/OffersBand.tsx');
  const labels = [...src.matchAll(/label: '([^']+)'/g)].map((m) => m[1]);
  assert.equal(labels.length, 6);
  assert.equal(new Set(labels).size, 6, 'labels are unique');
  assert.ok(labels.includes('IELTS Speaking (social card)'));
  assert.match(src, /trackCtaClick\(\{ label, type: 'primary', segment \}\)/);
});

test('band prices that live in this repo match the Young Learners checkout page', () => {
  const yl = read('young-learners-speaking/index.html');
  for (const locale of ['en', 'vi'] as const) {
    const kids = getHomeContent(locale)?.offers?.kids;
    assert.ok(kids, locale);
    assert.equal(kids.baseline.price, '690.000₫');
    assert.equal(kids.lessons.price, '800.000₫');
  }
  assert.match(yl, /data-i18n="yl2\.card1\.price">690\.000₫/);
  assert.match(yl, /Buy 1 lesson · 800\.000₫/);
});

// Header (owner, Oct 2026): five links incl. IELTS Writing + the Baseline CTA.
// Header wording Option A (Jay, 15 Nov 2026): Kids Academy · Speaking 9–18 · IELTS · Story Club · Books & Prices. IELTS is
// one link to JurassicIELTS.com ("Move IELTS to jurassicielts.com"); Pricing (/#pricing-options) is no longer a door.
test('header: Option A doors (IELTS on JurassicIELTS.com, Story Club) in the visitor language', () => {
  for (const [path, start, speaking, ielts] of [
    ['/', '/story-club', '/young-learners-speaking/', 'https://jurassicielts.com/?utm_source=jurassicenglish&utm_medium=header&utm_campaign=ielts-move'],
    ['/vi', '/vi/story-club', '/vi/luyen-noi-ielts/', 'https://jurassicielts.com/vi/?utm_source=jurassicenglish&utm_medium=header&utm_campaign=ielts-move'],
  ] as const) {
    setServerLocation(path);
    const html = renderToStaticMarkup(createElement(Navbar, {
      onGetStarted: noop, onNavigateHome: noop, onNavigate: noop, onPricingClick: noop, onEducationAffiliateClick: noop,
    }));
    setServerLocation('/');
    const hrefs = hrefsIn(html);
    for (const href of [start, speaking, ielts]) assert.ok(hrefs.includes(href), `${path}: ${href} in ${hrefs.join(' ')}`);
    assert.match(html, /aria-label="IELTS · JurassicIELTS\.com"/, `${path}: IELTS accessible name`);
    assert.doesNotMatch(html, /target="_blank"[^>]*jurassicielts|jurassicielts[^>]*target="_blank"/, `${path}: same tab`);
    assert.ok(hrefs.some((href) => href.endsWith('/student-academy')), `${path}: /student-academy`);
    assert.ok(!hrefs.some((href) => href.includes('#pricing-options')), `${path}: no Pricing door`);
    assert.doesNotMatch(html, /coming soon|sắp ra mắt/i, path);
  }
});

test('AiSpeakingLaunch Writing card links the live demo and promises no launch date', () => {
  const src = read('src/components/AiSpeakingLaunch.tsx');
  assert.match(src, /href=\{getLocalizedHref\('\/ai-speaking\/writing\/demo', locale\)\} onClick=\{\(\) => trackCtaClick\(\{ label: 'homepage_writing_intro_click'/);
  for (const locale of ['en', 'vi'] as const) {
    const launch = getHomeContent(locale)?.hero.aiSpeakingLaunch;
    assert.ok(launch, locale);
    const copy = [launch.writingEyebrow, launch.writingBody, launch.writingCta].join(' ');
    assert.doesNotMatch(copy, /coming soon|not open yet|sắp ra mắt|chưa mở/i, locale);
    assert.match(copy, locale === 'en' ? /invented essays/ : /bài luận giả định/, locale);
  }
});

test('offers band payment note names VietQR and PayPal (owner, 14 Oct 2026)', () => {
  assert.equal(getHomeContent('en')?.offers?.paymentNote, 'Pay by bank transfer (VietQR) or PayPal at checkout');
  assert.equal(getHomeContent('vi')?.offers?.paymentNote, 'Thanh toán bằng chuyển khoản (VietQR) hoặc PayPal khi đặt');
});
