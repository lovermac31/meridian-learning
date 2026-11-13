/**
 * Story Club: the first paid session, the weekly time and the dated launch offer, in ONE place.
 *
 * Pure data and pure functions (no import.meta.env, no React): the pages, the reserve QR, the server that mints the
 * payment (api/sample-pack.ts) and the SePay webhook (api/sepay-webhook.ts) all read this file, so the amount a parent is
 * shown, the amount the QR asks for and the minimum the webhook accepts cannot drift apart.
 *
 * Decided by Jay (master chat, 12 Nov 2026): every Saturday at 13:00 Vietnam time; 50% off until the first session, then
 * a second offer for one more week, then the list price.
 * Moved one week on 13 Nov 2026 (Jay: "Fix the Story Club page date to 21 Nov"; no child had registered for 14 Nov):
 * first paid session Saturday 21 Nov 2026; 50% off until Sat 21 Nov 13:00; second offer until Sat 28 Nov 13:00.
 * The second price is 440.000₫ (25% off would be 442.500₫; 440.000₫ is the master's round figure, Jay can change it HERE).
 * 440.000₫ is 25.4% off, so the pages state amounts and end dates, never a percentage. No countdown timers.
 * After the last end date, delete the tiers and the pages return to the list price on their own.
 */
export const STORY_CLUB_LIST_PRICE_VND = 590_000;
export const STORY_CLUB_SESSIONS = 4;

export const STORY_CLUB_FIRST_SESSION = { isoDate: '2026-11-21', time: '13:00', label: { en: 'Saturday 21 November 2026', vi: 'Thứ Bảy 21/11/2026' } } as const;
export const STORY_CLUB_WEEKLY_TIME = '13:00';
/** A transfer that reaches the bank up to this long after a cut-off is still accepted at the price the QR carried (review fix 2, 12 Nov 2026). */
export const STORY_CLUB_GRACE_MINUTES = 30;
export const STORY_CLUB_TIME_ZONE_LABEL = { en: 'Vietnam time (GMT+7)', vi: 'giờ Việt Nam (GMT+7)' } as const;

export type StoryClubOfferTier = {
  id: 'launch-first' | 'launch-second';
  /** The offer is valid for money received up to and including this instant (Vietnam time, UTC+7). */
  until: string;
  untilLabel: { en: string; vi: string };
  priceVnd: number;
};

export const STORY_CLUB_OFFER_TIERS: readonly StoryClubOfferTier[] = [
  { id: 'launch-first', until: '2026-11-21T13:00:00+07:00', untilLabel: { en: 'Saturday 21 November, 13:00', vi: 'Thứ Bảy 21/11, 13:00' }, priceVnd: 295_000 },
  { id: 'launch-second', until: '2026-11-28T13:00:00+07:00', untilLabel: { en: 'Saturday 28 November, 13:00', vi: 'Thứ Bảy 28/11, 13:00' }, priceVnd: 440_000 },
];

export type StoryClubQuote = { priceVnd: number; tier: StoryClubOfferTier | null; listPriceVnd: number };

/** The price for money that arrives at `at`: the first tier whose end has not passed, else the list price. */
export function storyClubPriceAt(at: Date): StoryClubQuote {
  const time = at.getTime();
  const tier = Number.isFinite(time) ? STORY_CLUB_OFFER_TIERS.find((candidate) => time <= Date.parse(candidate.until)) ?? null : null;
  return { priceVnd: tier ? tier.priceVnd : STORY_CLUB_LIST_PRICE_VND, tier, listPriceVnd: STORY_CLUB_LIST_PRICE_VND };
}

/** The lowest amount the webhook auto-confirms for a transfer at `at`: the price valid `STORY_CLUB_GRACE_MINUTES` earlier. */
export function storyClubMinimumAmountAt(at: Date): number {
  return storyClubPriceAt(new Date(at.getTime() - STORY_CLUB_GRACE_MINUTES * 60_000)).priceVnd;
}

/** The tier a quoted amount belongs to (for "valid until"), or null for the list price. */
export function storyClubTierForAmount(priceVnd: number): StoryClubOfferTier | null {
  return STORY_CLUB_OFFER_TIERS.find((tier) => tier.priceVnd === priceVnd) ?? null;
}

/**
 * The transfer time for the tier lookup. SePay sends `transactionDate` as "YYYY-MM-DD HH:mm:ss", read here as Vietnam time.
 * If it is later than the receipt time, or more than 60 minutes before it (a time-zone or clock mistake), the server
 * receipt time is used instead, so a wrongly-zoned stamp can never buy a cheaper tier.
 */
export function sepayTransactionTime(value: unknown, receivedAt: Date): Date {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}$/.test(value.trim())) return receivedAt;
  const parsed = new Date(`${value.trim().replace(' ', 'T')}+07:00`);
  const age = receivedAt.getTime() - parsed.getTime();
  return Number.isNaN(parsed.getTime()) || age < 0 || age > 60 * 60_000 ? receivedAt : parsed;
}

const money = (amount: number, locale: 'en' | 'vi') => `${new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US').format(amount)}₫`;
const firstSessionEnd = () => Date.parse(`${STORY_CLUB_FIRST_SESSION.isoDate}T${STORY_CLUB_FIRST_SESSION.time}:00+07:00`) + 30 * 60_000;

/**
 * Both lines take an optional `now`. Without it they state the whole plan (always true when read, safe to prerender).
 * With it (the browser, after load) they drop what has passed: no deploy is needed when a date goes by.
 */
export function storyClubScheduleLine(locale: 'en' | 'vi', now?: Date): string {
  const first = STORY_CLUB_FIRST_SESSION;
  const showFirst = !now || now.getTime() <= firstSessionEnd();
  if (locale === 'vi') return `${showFirst ? `Buổi đầu tiên: ${first.label.vi}, ${first.time} ${STORY_CLUB_TIME_ZONE_LABEL.vi}. ` : ''}Mỗi thứ Bảy lúc ${STORY_CLUB_WEEKLY_TIME} ${showFirst ? '' : STORY_CLUB_TIME_ZONE_LABEL.vi}`.trim().replace(/\s+$/, '') + (showFirst ? '.' : '.');
  return `${showFirst ? `First session: ${first.label.en}, ${first.time} ${STORY_CLUB_TIME_ZONE_LABEL.en}. ` : ''}Every Saturday at ${STORY_CLUB_WEEKLY_TIME}${showFirst ? '' : ` ${STORY_CLUB_TIME_ZONE_LABEL.en}`}.`;
}

/** The dated price ladder in words; with `now`, only the offers still open (none: just the list price). */
export function storyClubOfferLine(locale: 'en' | 'vi', now?: Date): string {
  const list = money(STORY_CLUB_LIST_PRICE_VND, locale);
  const open = STORY_CLUB_OFFER_TIERS.filter((tier) => !now || now.getTime() <= Date.parse(tier.until));
  const vi = locale === 'vi';
  const base = vi ? `Giá niêm yết ${list} cho ${STORY_CLUB_SESSIONS} buổi.` : `List price ${list} for ${STORY_CLUB_SESSIONS} sessions.`;
  if (!open.length) return base;
  const parts = open.map((tier) => vi
    ? `${money(tier.priceVnd, 'vi')} nếu tiền về trước ${tier.untilLabel.vi}`
    : `${money(tier.priceVnd, 'en')} if your payment arrives by ${tier.untilLabel.en}`);
  return vi
    ? `${base} Ưu đãi ra mắt: ${parts.join('; ')} (giờ Việt Nam). Sau đó: ${list}.`
    : `${base} Launch offer: ${parts.join('; ')} (Vietnam time). After that: ${list}.`;
}
