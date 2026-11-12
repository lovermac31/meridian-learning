import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STORY_CLUB_LIST_PRICE_VND, STORY_CLUB_OFFER_TIERS, sepayTransactionTime, storyClubOfferLine, storyClubPriceAt, storyClubScheduleLine,
} from '../src/config/storyClubOffer';

const at = (iso: string) => new Date(iso);

test('tiers by transfer time: one second before and after each Vietnam-time cut-off', () => {
  const cases: Array<[string, number]> = [
    ['2026-11-12T00:00:00+07:00', 295000],
    ['2026-11-14T12:59:59+07:00', 295000],
    ['2026-11-14T13:00:00+07:00', 295000], // the cut-off instant itself still counts
    ['2026-11-14T13:00:01+07:00', 440000],
    ['2026-11-21T12:59:59+07:00', 440000],
    ['2026-11-21T13:00:00+07:00', 440000],
    ['2026-11-21T13:00:01+07:00', 590000],
    ['2026-12-31T00:00:00+07:00', 590000],
  ];
  for (const [iso, price] of cases) assert.equal(storyClubPriceAt(at(iso)).priceVnd, price, iso);
  assert.equal(storyClubPriceAt(new Date('not a date')).priceVnd, STORY_CLUB_LIST_PRICE_VND, 'an unreadable time never gets a discount');
});

test('the same instant is the same tier whatever the viewer time zone: cut-offs are fixed instants', () => {
  assert.equal(storyClubPriceAt(at('2026-11-14T05:59:59Z')).priceVnd, 295000); // 12:59:59 in Vietnam
  assert.equal(storyClubPriceAt(at('2026-11-14T06:00:01Z')).priceVnd, 440000); // 13:00:01 in Vietnam
});

test('tier data: list price 590000 stays, half price, then 440000', () => {
  assert.equal(STORY_CLUB_LIST_PRICE_VND, 590000);
  assert.deepEqual(STORY_CLUB_OFFER_TIERS.map((tier) => tier.priceVnd), [295000, 440000]);
  assert.equal(STORY_CLUB_OFFER_TIERS[0].priceVnd * 2, STORY_CLUB_LIST_PRICE_VND);
});

test('SePay transaction time is read as Vietnam time; unreadable values fall back', () => {
  const fallback = at('2026-11-30T00:00:00Z');
  assert.equal(sepayTransactionTime('2026-11-14 12:59:59', fallback).toISOString(), '2026-11-14T05:59:59.000Z');
  assert.equal(sepayTransactionTime('2026-11-14T13:00:01', fallback).toISOString(), '2026-11-14T06:00:01.000Z');
  for (const bad of [undefined, null, 42, '', 'tomorrow', '2026-13-45 99:99:99']) assert.equal(sepayTransactionTime(bad, fallback), fallback);
});

test('copy states end dates and amounts, never a percentage or a countdown, never "Founding price"', () => {
  for (const locale of ['en', 'vi'] as const) {
    const text = `${storyClubOfferLine(locale)} ${storyClubScheduleLine(locale)}`;
    for (const needle of ['590', '295', '440', '13:00', '14', '21']) assert.ok(text.includes(needle), `${locale}: ${needle}`);
    assert.ok(!/%|founding|countdown|giá ưu đãi cho nhóm/i.test(text), locale);
  }
});
