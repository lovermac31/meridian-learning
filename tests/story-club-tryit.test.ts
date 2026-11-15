import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StoryClubReservePage } from '../src/components/StoryClubReservePage';
import { StoryClubPage } from '../src/components/StoryClubPage';
import { PAID_OFFERS, paidOffer, paymentAmount, paymentHref } from '../src/config/payment';
import { STORY_CLUB_PRICE_VND } from '../src/config/storyClubReserve';
import { getExpectedPublicIndexableRoutes } from '../src/lib/routeMetadata';
import { classifyConversionLink } from '../src/lib/conversionEvents';
import {
  STORY_CLUB_MAX_CHILDREN, STORY_CLUB_SESSION_VND, STORY_CLUB_TRY_IT_ZALO_HREF, STORY_CLUB_TRY_IT_ZALO_HREF_RESERVE, storyClubTryItContent,
} from '../src/i18n/content/storyClubTryIt';
import { storyClubContent } from '../src/i18n/content/storyClub';

const MEMO = 'SC-AB12CD';
const LOCALES = ['en', 'vi'] as const;
const clean = (html: string) => html.replaceAll('<!-- -->', '').replaceAll('&#x27;', '’').replaceAll('&amp;', '&');
const reserveHtml = (locale: 'en' | 'vi', initialMemo?: string) => clean(renderToStaticMarkup(createElement(StoryClubReservePage, { locale, initialMemo })));

test('amounts are unchanged: 590000 for the round, 147500 a session, and the QR carries exactly those', () => {
  assert.equal(STORY_CLUB_PRICE_VND, 590000);
  assert.equal(paidOffer('story-club')!.amount, 590000);
  assert.equal(PAID_OFFERS.find((offer) => offer.id === 'story-club')!.prefix, 'SC');
  assert.equal(STORY_CLUB_SESSION_VND, 147500);
  for (const locale of LOCALES) {
    const html = reserveHtml(locale, MEMO);
    assert.ok(html.includes(`data-payment-amount="true">${paymentAmount(590000, locale)}<`), `${locale}: the payment amount shown is 590000`);
    const qr = html.match(/data-payment-qr="true" src="([^"]+)"/)?.[1];
    assert.ok(qr, `${locale}: QR rendered`);
    const url = new URL(qr!);
    assert.equal(url.origin + url.pathname, 'https://qr.sepay.vn/img');
    assert.equal(url.searchParams.get('amount'), '590000');
    assert.equal(url.searchParams.get('des'), MEMO, 'memo format SC-XXXXXX is untouched');
  }
});

test('reserve page: the written summary comes before "Pay now" and any payment instruction, in English and Vietnamese', () => {
  const payNow = { en: 'Pay now', vi: 'Thanh toán ngay' };
  for (const locale of LOCALES) {
    const html = reserveHtml(locale, MEMO);
    const summary = html.indexOf('data-reserve-summary');
    const heading = html.indexOf(`>${payNow[locale]}</h2>`);
    assert.ok(summary > -1, `${locale}: summary present`);
    assert.ok(heading > -1, `${locale}: the Pay now heading is rendered in the payment-ready state`);
    for (const [name, marker] of [['Pay now heading', `>${payNow[locale]}</h2>`], ['payment instructions', 'data-payment-instructions'], ['pay step', 'data-pay-step'], ['QR', 'data-payment-qr'], ['transfer memo', 'data-transfer-memo'], ['Zalo after-submit', 'data-after-submit-zalo']] as const) {
      const at = html.indexOf(marker);
      assert.ok(at > -1, `${locale}: ${name} present`);
      assert.ok(summary < at, `${locale}: the summary precedes the ${name}`);
    }
    // The summary itself must hold the what, when, who, rules and refund before the payment section starts.
    const written = html.slice(summary, html.indexOf('data-payment-instructions'));
    const c = storyClubTryItContent[locale];
    for (const text of [...c.tryIt.facts.map((f) => f.value), ...c.paid.facts.map((f) => f.value), ...c.refund.points, c.summary.readFirst]) {
      assert.ok(written.includes(text), `${locale}: summary states "${text.slice(0, 50)}"`);
    }
    assert.ok(html.includes('data-pay-rules'), `${locale}: the refund rule is repeated next to the payment instructions`);
    assert.ok(html.indexOf('data-pay-rules') > heading, `${locale}: ...right after the Pay now heading`);
  }
});

test('reserve page before payment is prepared: summary visible, no Pay now yet, same order guarantee', () => {
  for (const locale of LOCALES) {
    const html = reserveHtml(locale);
    assert.ok(html.includes('data-reserve-summary'));
    assert.ok(!html.includes('data-payment-instructions'));
    assert.ok(!html.includes('>Pay now</h2>') && !html.includes('>Thanh toán ngay</h2>'));
    assert.ok(html.indexOf('data-reserve-summary') < html.indexOf('data-payment-preparing'));
    // 5 Nov 2026: the payment is prepared only after a click on a button that comes after the summary.
    const button = html.indexOf('data-get-payment-code');
    assert.ok(button > html.indexOf('data-reserve-summary'), `${locale}: the get-payment-code button follows the summary`);
    assert.ok(html.includes(locale === 'vi' ? 'Lấy mã thanh toán của tôi' : 'Get my payment code'));
    assert.ok(!html.includes('data-payment-qr') && !html.includes('data-transfer-memo'));
  }
});

test('the summary states the decided facts: dates, free try-it, 4 weeks, cap 6, refund and make-up rule, no promised results', () => {
  const en = storyClubTryItContent.en;
  const enText = JSON.stringify(en);
  for (const needle of ['Postponed because Mr. Jay is unwell', 'free', '30 minutes', 'Google Meet', 'morning of the session', 'hear the new date first', 'at least 2', 'Saturday 21 November 2026, 13:00', '590,000₫', '295,000₫', '440,000₫', 'within 24 hours of paying', 'We do not promise exam scores or results', 'not recorded']) {
    assert.ok(enText.toLowerCase().includes(needle.toLowerCase()), `EN: ${needle}`);
  }
  assert.match(enText, /up to 6 children/i);
  assert.match(enText, /A parent sits beside the child/);
  assert.match(enText, /we make it up or return a quarter of what you paid/);
  const vi = JSON.stringify(storyClubTryItContent.vi);
  for (const needle of ['Tạm hoãn', '13:00', 'sáng ngày học', 'báo ngày mới', 'ít nhất 2', 'Buổi đầu tiên', '590.000₫', '295.000₫', '440.000₫', 'một phần tư', '24 giờ', 'không hứa trước', 'không được ghi âm', 'ngồi cạnh bé']) {
    assert.ok(vi.includes(needle), `VI: ${needle}`);
  }
  assert.equal(STORY_CLUB_MAX_CHILDREN, 6);
  assert.equal(storyClubTryItContent.en.tryIt.facts.length, storyClubTryItContent.vi.tryIt.facts.length, 'EN/VI parity: try-it');
  assert.equal(storyClubTryItContent.en.paid.facts.length, storyClubTryItContent.vi.paid.facts.length, 'EN/VI parity: paid round');
  assert.equal(storyClubTryItContent.en.refund.points.length, storyClubTryItContent.vi.refund.points.length, 'EN/VI parity: refund');
  assert.equal(storyClubContent.en.faq.items.length, storyClubContent.vi.faq.items.length);
  assert.equal(storyClubContent.en.join.steps.length, storyClubContent.vi.join.steps.length);
  // Honest claims: nothing promises a score or result, and no "official IELTS" wording.
  assert.doesNotMatch(enText + JSON.stringify(storyClubContent.en), /guarantee|official IELTS|band \d/i);
});

test('/story-club leads with the free try-it and Zalo registration; the paid round and refund follow', () => {
  for (const locale of LOCALES) {
    const html = clean(renderToStaticMarkup(createElement(StoryClubPage, { locale })));
    const c = storyClubContent[locale];
    const tryItCard = html.indexOf('data-story-club-try-it-card');
    const heroEnd = html.indexOf('</header>');
    const price = html.indexOf('id="paid-round"');
    const refund = html.indexOf('data-story-club-refund');
    const firstZalo = html.indexOf(STORY_CLUB_TRY_IT_ZALO_HREF);
    assert.ok(firstZalo > -1 && firstZalo < heroEnd, `${locale}: the first action in the hero is the try-it Zalo registration`);
    assert.ok(html.slice(0, heroEnd).includes(storyClubTryItContent[locale].heroLine), `${locale}: hero states the free try-it`);
    assert.ok(heroEnd < tryItCard && tryItCard < price && price < refund, `${locale}: order is hero, try-it, paid round, refund`);
    assert.ok(html.includes(c.price.starts), `${locale}: the paid round states its start`);
    for (const point of storyClubTryItContent[locale].refund.points) assert.ok(html.includes(point), `${locale}: refund point shown`);
    assert.ok(html.includes('data-cta="story-club-reserve"'), `${locale}: reserve link still present`);
    assert.ok(html.includes(`href="${paymentHref('story-club', locale)}"`), `${locale}: reserve link destination unchanged`);
  }
});

test('GA4 events still classify: reserve_click, zalo_click (existing /go/zalo mechanism, no new number) and buy_click', () => {
  assert.equal(classifyConversionLink(STORY_CLUB_TRY_IT_ZALO_HREF, {}, '/story-club')?.name, 'zalo_click');
  assert.equal(classifyConversionLink(STORY_CLUB_TRY_IT_ZALO_HREF_RESERVE, {}, '/story-club/reserve')?.name, 'zalo_click');
  assert.equal(classifyConversionLink(paymentHref('story-club', 'en'), {}, '/story-club')?.name, 'reserve_click');
  assert.equal(classifyConversionLink(paymentHref('story-club', 'vi'), {}, '/vi/story-club')?.name, 'reserve_click');
  assert.equal(classifyConversionLink('/products/story-club', { buyNow: 'story-club' }, '/products')?.name, 'buy_click');
  for (const href of [STORY_CLUB_TRY_IT_ZALO_HREF, STORY_CLUB_TRY_IT_ZALO_HREF_RESERVE]) {
    assert.match(href, /^\/go\/zalo\?utm_source=(story-club|reserve)&utm_content=try-it-register$/);
    assert.doesNotMatch(href, /zalo\.me|\d{9,}/, 'no hard-coded Zalo number');
  }
  for (const locale of LOCALES) {
    const html = reserveHtml(locale, MEMO);
    assert.ok(html.includes(`href="${STORY_CLUB_TRY_IT_ZALO_HREF_RESERVE}"`), `${locale}: reserve summary links the tracked try-it registration`);
    assert.ok(!/zalo\.me|84396085076/.test(html), `${locale}: no hard-coded Zalo number on the reserve page`);
  }
});

test('no /vi/story-club/reserve page is created: the Vietnamese reserve page stays /story-club/reserve', () => {
  const routes = getExpectedPublicIndexableRoutes();
  assert.ok(routes.includes('/story-club/reserve') && routes.includes('/en/story-club/reserve'));
  assert.ok(!routes.includes('/vi/story-club/reserve'));
  assert.equal(paymentHref('story-club', 'vi'), '/story-club/reserve');
  assert.equal(paymentHref('story-club', 'en'), '/en/story-club/reserve');
});
