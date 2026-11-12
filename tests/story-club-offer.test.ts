import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STORY_CLUB_LIST_PRICE_VND, STORY_CLUB_OFFER_TIERS, sepayTransactionTime, storyClubMinimumAmountAt, storyClubOfferLine, storyClubPriceAt, storyClubScheduleLine, storyClubTierForAmount,
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

test('webhook minimum: the price valid 30 minutes earlier (grace), literal boundaries', () => {
  const cases: Array<[string, number]> = [
    ['2026-11-14T13:00:01+07:00', 295000],
    ['2026-11-14T13:30:00+07:00', 295000],
    ['2026-11-14T13:30:01+07:00', 440000],
    ['2026-11-21T13:30:00+07:00', 440000],
    ['2026-11-21T13:30:01+07:00', 590000],
  ];
  for (const [iso, minimum] of cases) assert.equal(storyClubMinimumAmountAt(at(iso)), minimum, iso);
});

test('SePay transaction time: Vietnam time, but only if it is not in the future and not more than 60 minutes old', () => {
  const received = at('2026-11-14T13:00:05+07:00');
  assert.equal(sepayTransactionTime('2026-11-14 12:59:59', received).toISOString(), '2026-11-14T05:59:59.000Z');
  assert.equal(sepayTransactionTime('2026-11-14T12:30:00', received).toISOString(), '2026-11-14T05:30:00.000Z');
  assert.equal(sepayTransactionTime('2026-11-14 11:59:00', received), received, 'more than 60 minutes old: receipt time');
  assert.equal(sepayTransactionTime('2026-11-14 06:00:00', received), received, 'a UTC-shaped stamp (7 hours early): receipt time');
  assert.equal(sepayTransactionTime('2026-11-14 13:10:00', received), received, 'later than receipt: receipt time');
  for (const bad of [undefined, null, 42, '', 'tomorrow', '2026-13-45 99:99:99']) assert.equal(sepayTransactionTime(bad, received), received);
});

test('tier for a quoted amount (for the valid-until line)', () => {
  assert.equal(storyClubTierForAmount(295000)?.untilLabel.en, 'Saturday 14 November, 13:00');
  assert.equal(storyClubTierForAmount(440000)?.untilLabel.vi, 'Thứ Bảy 21/11, 13:00');
  assert.equal(storyClubTierForAmount(590000), null);
});

test('lines drop what has passed, with no deploy: schedule after the first session, offers after each cut-off', () => {
  for (const locale of ['en', 'vi'] as const) {
    const whole = `${storyClubScheduleLine(locale)} ${storyClubOfferLine(locale)}`;
    assert.ok(whole.includes('14') && whole.includes('295') && whole.includes('440'), `${locale} prerendered: the whole plan`);
    const afterFirstSession = at('2026-11-14T14:00:00+07:00');
    assert.ok(!storyClubScheduleLine(locale, afterFirstSession).includes('14'), `${locale}: no first-session date after it happened`);
    assert.ok(storyClubScheduleLine(locale, afterFirstSession).includes('13:00'), `${locale}: the weekly time stays`);
    const between = storyClubOfferLine(locale, at('2026-11-15T00:00:00+07:00'));
    assert.ok(!between.includes('295') && between.includes('440') && between.includes('590'), `${locale}: only the second offer is left`);
    const after = storyClubOfferLine(locale, at('2026-11-21T14:00:00+07:00'));
    assert.ok(after.includes('590') && !after.includes('440') && !after.includes('295'), `${locale}: only the list price after the last cut-off`);
    assert.ok(!/launch offer|ưu đãi ra mắt/i.test(after), `${locale}: no offer wording left`);
  }
});

test('copy states end dates and amounts, never a percentage or a countdown, never "Founding price"', () => {
  for (const locale of ['en', 'vi'] as const) {
    const text = `${storyClubOfferLine(locale)} ${storyClubScheduleLine(locale)}`;
    for (const needle of ['590', '295', '440', '13:00', '14', '21']) assert.ok(text.includes(needle), `${locale}: ${needle}`);
    assert.ok(!/%|founding|countdown|giá ưu đãi cho nhóm/i.test(text), locale);
  }
});
