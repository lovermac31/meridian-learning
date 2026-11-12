/**
 * Story Club: the first paid session, the weekly time and the dated launch offer, in ONE place.
 *
 * Pure data and pure functions (no import.meta.env, no React): the pages, the reserve QR, the server that mints the
 * payment (api/sample-pack.ts) and the SePay webhook (api/sepay-webhook.ts) all read this file, so the amount a parent is
 * shown, the amount the QR asks for and the minimum the webhook accepts cannot drift apart.
 *
 * Decided by Jay (master chat, 12 Nov 2026): first paid session Saturday 14 Nov 2026, 13:00 Vietnam time, every Saturday
 * at 13:00; 50% off until Sat 14 Nov 13:00, then a second offer until Sat 21 Nov 13:00, then the list price.
 * The second price is 440.000₫ (25% off would be 442.500₫; 440.000₫ is the master's round figure, Jay can change it HERE).
 * 440.000₫ is 25.4% off, so the pages state amounts and end dates, never a percentage. No countdown timers.
 * After the last end date, delete the tiers and the pages return to the list price on their own.
 */
export const STORY_CLUB_LIST_PRICE_VND = 590_000;
export const STORY_CLUB_SESSIONS = 4;

export const STORY_CLUB_FIRST_SESSION = { isoDate: '2026-11-14', time: '13:00', label: { en: 'Saturday 14 November 2026', vi: 'Thứ Bảy 14/11/2026' } } as const;
export const STORY_CLUB_WEEKLY_TIME = '13:00';
export const STORY_CLUB_TIME_ZONE_LABEL = { en: 'Vietnam time (GMT+7)', vi: 'giờ Việt Nam (GMT+7)' } as const;

export type StoryClubOfferTier = {
  id: 'launch-first' | 'launch-second';
  /** The offer is valid for money received up to and including this instant (Vietnam time, UTC+7). */
  until: string;
  untilLabel: { en: string; vi: string };
  priceVnd: number;
};

export const STORY_CLUB_OFFER_TIERS: readonly StoryClubOfferTier[] = [
  { id: 'launch-first', until: '2026-11-14T13:00:00+07:00', untilLabel: { en: 'Saturday 14 November, 13:00', vi: 'Thứ Bảy 14/11, 13:00' }, priceVnd: 295_000 },
  { id: 'launch-second', until: '2026-11-21T13:00:00+07:00', untilLabel: { en: 'Saturday 21 November, 13:00', vi: 'Thứ Bảy 21/11, 13:00' }, priceVnd: 440_000 },
];

export type StoryClubQuote = { priceVnd: number; tier: StoryClubOfferTier | null; listPriceVnd: number };

/** The price for money that arrives at `at`: the first tier whose end has not passed, else the list price. */
export function storyClubPriceAt(at: Date): StoryClubQuote {
  const time = at.getTime();
  const tier = Number.isFinite(time) ? STORY_CLUB_OFFER_TIERS.find((candidate) => time <= Date.parse(candidate.until)) ?? null : null;
  return { priceVnd: tier ? tier.priceVnd : STORY_CLUB_LIST_PRICE_VND, tier, listPriceVnd: STORY_CLUB_LIST_PRICE_VND };
}

/** SePay sends `transactionDate` as "YYYY-MM-DD HH:mm:ss" in Vietnam time. Unreadable input falls back to `fallback`. */
export function sepayTransactionTime(value: unknown, fallback: Date): Date {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/.test(value.trim())) return fallback;
  const parsed = new Date(`${value.trim().replace(' ', 'T')}+07:00`);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed;
}

const money = (amount: number, locale: 'en' | 'vi') => `${new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US').format(amount)}₫`;

export function storyClubScheduleLine(locale: 'en' | 'vi'): string {
  const first = STORY_CLUB_FIRST_SESSION;
  return locale === 'vi'
    ? `Buổi đầu tiên: ${first.label.vi}, ${first.time} ${STORY_CLUB_TIME_ZONE_LABEL.vi}. Mỗi thứ Bảy lúc ${STORY_CLUB_WEEKLY_TIME}.`
    : `First session: ${first.label.en}, ${first.time} ${STORY_CLUB_TIME_ZONE_LABEL.en}. Every Saturday at ${STORY_CLUB_WEEKLY_TIME}.`;
}

/** The dated price ladder in words. It states end dates, never "today's price", so it is true whenever it is read. */
export function storyClubOfferLine(locale: 'en' | 'vi'): string {
  const list = money(STORY_CLUB_LIST_PRICE_VND, locale);
  const [first, second] = STORY_CLUB_OFFER_TIERS;
  return locale === 'vi'
    ? `Giá niêm yết ${list} cho ${STORY_CLUB_SESSIONS} buổi. Ưu đãi ra mắt: ${money(first.priceVnd, 'vi')} nếu tiền về trước ${first.untilLabel.vi}; ${money(second.priceVnd, 'vi')} nếu tiền về trước ${second.untilLabel.vi} (giờ Việt Nam). Sau đó: ${list}.`
    : `List price ${list} for ${STORY_CLUB_SESSIONS} sessions. Launch offer: ${money(first.priceVnd, 'en')} if your payment arrives by ${first.untilLabel.en}; ${money(second.priceVnd, 'en')} if it arrives by ${second.untilLabel.en} (Vietnam time). After that: ${list}.`;
}
