import type { Locale } from '../i18n/locales';
import { PRODUCTS } from '../i18n/content/products';
import { paypalHref, paypalItemName, usdFromVnd } from './paypal';

// Where a /products buyer came from (master, 27 Oct 2026): the Order on Zalo buttons used to say
// utm_source=products for everyone. The page now reads utm_source on arrival, keeps it for the visit, passes it in
// the Zalo link, and shows an order code to mention in the message, so a paid order can be tied to its channel.
// Codes: Sale Team/products-marketing/03_UTM_Link_Table.md.
export const ORDER_CODES: Record<string, string> = {
  'fb-teachers': 'FBT',
  'zalo-teachers': 'ZT',
  'zalo-centre': 'ZC',
  'email-centre': 'EC',
  'zalo-parent': 'ZP',
  storybook: 'SB',
  academy: 'AC',
  video1: 'VD1',
  video2: 'VD2',
  video3: 'VD3',
  // Market pages (S2): utm_source=market-<country>.
  'market-uae': 'MAE',
  'market-saudi-arabia': 'MSA',
  'market-egypt': 'MEG',
  'market-india': 'MIN',
  'market-pakistan': 'MPK',
  'market-bangladesh': 'MBD',
  'market-philippines': 'MPH',
  'market-indonesia': 'MID',
  'market-malaysia': 'MMY',
  'market-thailand': 'MTH',
  'market-singapore': 'MSG',
};

export const ZALO_CHAT = 'https://zalo.me/84396085076';
export const DEFAULT_SOURCE = 'products';
const STORAGE_KEY = 'je_products_utm_source';

type SourceStorage = Pick<Storage, 'getItem' | 'setItem'>;

/** A utm_source we can put in a link and show as a code: lower-case letters, digits and dashes, at most 40. */
export function cleanSource(value: string | null | undefined): string | null {
  const source = (value ?? '').trim().toLowerCase();
  return /^[a-z0-9-]{1,40}$/.test(source) ? source : null;
}

/** The visit's source: utm_source in the URL (kept for the visit), else the one kept earlier, else none. */
export function readVisitorSource(search: string, storage: SourceStorage | null): string | null {
  const fromUrl = cleanSource(new URLSearchParams(search).get('utm_source'));
  if (fromUrl) {
    try {
      storage?.setItem(STORAGE_KEY, fromUrl);
    } catch {
      /* Storage can be blocked (private mode, settings); the URL value still applies to this page. */
    }
    return fromUrl;
  }
  try {
    return cleanSource(storage?.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

/** The code to mention: the channel's code, else the source itself, else (no source) the card id. */
export function orderCode(source: string | null, cardId: string): string {
  if (source && ORDER_CODES[source]) return ORDER_CODES[source];
  // The home page's own links (home-hero, home-tiles) are the site itself: the code stays the card id, so Jay sees the
  // product; the utm still reaches analytics and the Zalo link.
  if (source && source !== DEFAULT_SOURCE && !source.startsWith('home-')) return source.toUpperCase();
  return cardId.toUpperCase();
}

/** The Zalo chat link, tagged with the visit's real source. */
export function zaloHref(source: string | null): string {
  return `${ZALO_CHAT}?utm_source=${source ?? DEFAULT_SOURCE}`;
}

export const ORDER_CODE_COPY: Record<Locale, { before: string; after: string }> = {
  en: { before: 'When you message, mention code', after: '.' },
  vi: { before: 'Khi nhắn tin, hãy nhắc mã', after: '.' },
};

// S1 (master, 27 Oct 2026): international buyers pay a digital card's US$ price by PayPal. The item name and the
// custom field carry the card id and the order code, so Jay matches each payment by hand and sends the files by
// Google Drive within 24 hours (until the portal automates it, ADR-008).
export const productUsd = (price: string) => usdFromVnd(Number(price.replace(/\D/g, '')));

export function productPaypalHref(id: string, source: string | null, locale: Locale = 'en'): string {
  const product = PRODUCTS.find((entry) => entry.id === id);
  if (!product?.paypal) throw new Error(`No PayPal option for ${id}`);
  const code = orderCode(source, id);
  const href = new URL(paypalHref(paypalItemName(product.en.title, `/products ${id} code ${code}`), productUsd(product.price), `${id}|${code}`));
  // Navigation only: returning does not confirm a payment or unlock an edition.
  const back = `https://jurassicenglish.com/${locale === 'vi' ? 'vi/' : ''}products#${id}`;
  href.searchParams.set('return', back);
  href.searchParams.set('cancel_return', back);
  href.searchParams.set('rm', '1'); // GET without payment variables in the return URL.
  return href.toString();
}

export const PAYPAL_CARD_COPY: Record<Locale, { lead: string; pay: (usd: number) => string; note: string }> = {
  en: {
    lead: 'Outside Vietnam?',
    pay: (usd) => `Pay US$${usd} with PayPal`,
    note: 'You pay on paypal.com to Jurassic English (WorldWiseLearning). Your files arrive by Google Drive within 24 hours, at your PayPal email.',
  },
  vi: {
    lead: 'Ở ngoài Việt Nam?',
    pay: (usd) => `Thanh toán US$${usd} qua PayPal`,
    note: 'Bạn thanh toán trên paypal.com cho Jurassic English (WorldWiseLearning). Tài liệu được gửi qua Google Drive trong vòng 24 giờ, tới email PayPal của bạn.',
  },
};
