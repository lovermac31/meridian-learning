/**
 * Holiday sets, 28 Nov to 6 Dec 2026: the dates, the two sets, their prices and their payment prefixes, in ONE place.
 *
 * Pure data and pure functions (no import.meta.env, no React, no imports): the set pages, the /products band, the payment
 * config (src/config/payment.ts), the server that mints the payment code (api/sample-pack.ts) and the tests all read this
 * file, so the price a buyer is shown, the amount the QR asks for and the window the server enforces cannot drift apart.
 *
 * Decided by Jay (master chat, 25 Nov 2026: "Yes, go ahead with the holiday sets."), plan from the social session's Notion
 * entry "holiday sale prices": change NO existing price; add two dated sets for Saturday 28 Nov to Sunday 6 Dec 2026
 * (Hanoi time), then they end on their own. Test: 3 or more paid set orders by 6 Dec; 0 by 9 Dec = remove the sets.
 *
 * The window is a date check on BOTH the page (after load, so no deploy is needed when it passes) and the server (it
 * refuses a payment code or an order outside the window). To remove the sets for good, delete this file's HOLIDAY_SETS
 * entries (see docs/holiday-sets-2026.md); nothing else needs a date edit.
 */

/** The window is [start, end): open from 00:00 Saturday 28 Nov to the last millisecond of Sunday 6 Dec, Vietnam time (UTC+7). */
export const HOLIDAY_WINDOW = {
  start: '2026-11-28T00:00:00+07:00',
  /** Exclusive: the first instant after 23:59:59.999 on Sunday 6 Dec. */
  end: '2026-12-07T00:00:00+07:00',
  /** For schema.org `priceValidUntil` / `availabilityStarts`. */
  lastDay: '2026-12-06',
  firstDay: '2026-11-28',
  label: {
    en: 'Saturday 28 November to Sunday 6 December 2026 (Vietnam time)',
    vi: 'Thứ Bảy 28/11 đến Chủ nhật 6/12/2026 (giờ Việt Nam)',
  },
  opens: { en: 'Saturday 28 November 2026', vi: 'Thứ Bảy 28/11/2026' },
  closes: { en: 'Sunday 6 December 2026, 23:59 Vietnam time', vi: 'Chủ nhật 6/12/2026, 23:59 giờ Việt Nam' },
} as const;

export type HolidayWindowStatus = 'before' | 'open' | 'ended';

/** Where `at` falls against the window. An invalid date is 'ended': the check fails closed. */
export function holidayWindowStatus(at: Date): HolidayWindowStatus {
  const time = at.getTime();
  if (!Number.isFinite(time)) return 'ended';
  if (time < Date.parse(HOLIDAY_WINDOW.start)) return 'before';
  if (time >= Date.parse(HOLIDAY_WINDOW.end)) return 'ended';
  return 'open';
}

export type HolidaySet = {
  id: 'holiday-reading-set-l1' | 'teacher-starter-set';
  /** The payment memo prefix: PR + 2 characters, after the last product (PR1D). The server's PRODUCT_MAP must carry the same pair. */
  prefix: string;
  /** The three products inside, by PRODUCTS id. Their usual prices add up to `listVnd` (a test checks it). */
  components: readonly [string, string, string];
  /** The sum of the three usual prices. */
  listVnd: number;
  /** The sale price: what the QR asks for and the server mints. */
  saleVnd: number;
  /** The PayPal price in whole US dollars, approved by Jay with the set (25 Nov 2026). */
  usd: number;
  section: 'families' | 'teachers';
  /** The card image of the component that stands for the set. */
  image: string;
};

export const HOLIDAY_SETS: readonly HolidaySet[] = [
  {
    id: 'holiday-reading-set-l1',
    prefix: 'PR1E',
    components: ['parent-pack-l1', 'holiday-reading-challenge', 'word-fossil-flashcards-l1'],
    listVnd: 588_000,
    saleVnd: 399_000,
    usd: 16,
    section: 'families',
    image: 'holiday-reading-challenge',
  },
  {
    id: 'teacher-starter-set',
    prefix: 'PR1F',
    components: ['teacher-pack-l1', 'thinking-cycle-set', 'reasoning-assessment-kit'],
    listVnd: 1_570_000,
    saleVnd: 1_190_000,
    usd: 47,
    section: 'teachers',
    image: 'teacher-pack-l1',
  },
];

export const HOLIDAY_SET_IDS: readonly string[] = HOLIDAY_SETS.map((set) => set.id);
export const holidaySetPath = (id: string) => `/products/${id}`;
/** English paths of the set pages (the /vi twin comes from the locale routing). */
export const HOLIDAY_SET_PATHS: readonly string[] = HOLIDAY_SETS.map((set) => holidaySetPath(set.id));

export function holidaySetById(id: string | null | undefined): HolidaySet | null {
  return HOLIDAY_SETS.find((set) => set.id === id) ?? null;
}
export const isHolidaySetId = (id: string | null | undefined): boolean => holidaySetById(id) !== null;

/** The set a /products/<id> path names, or null. */
export function getHolidaySetByPath(pathname: string): HolidaySet | null {
  const id = pathname.match(/^\/products\/([^/]+)$/)?.[1];
  return holidaySetById(id);
}

/**
 * Whether the server must refuse a payment code or an order for `productId` at `at`: true for a holiday set outside the
 * window, false for every other product (their sale never depends on a date).
 */
export function holidaySetClosedAt(productId: string | null | undefined, at: Date): boolean {
  return isHolidaySetId(productId) && holidayWindowStatus(at) !== 'open';
}

/** True for a canonical set memo (PR1E-ABC123 / PR1F-ABC123), so a late transfer is still recognised as a set payment. */
export const isHolidaySetMemo = (memo: string): boolean => HOLIDAY_SETS.some((set) => memo.startsWith(`${set.prefix}-`));

/** Whole VND saved against buying the three one by one. */
export const holidaySetSaving = (set: HolidaySet): number => set.listVnd - set.saleVnd;
