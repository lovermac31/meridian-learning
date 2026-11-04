/**
 * Lemon Squeezy (LS): card (Visa, Mastercard, Amex, UnionPay), Alipay and WeChat Pay in US$, as a third option beside
 * VietQR (Vietnam) and PayPal (international) for DIGITAL products only (Jay + CEO, 2 Nov 2026). LS is merchant of
 * record and delivers the files itself, so phase 1 is a link to its hosted checkout with our order reference in the
 * checkout's custom data. LS prohibits services, so Story Club, the Baseline, 1-to-1 lessons, the Writing Baseline and
 * the Live Check never get this option: a product is eligible only when its PRODUCTS entry has `paypal: true`.
 *
 * Config by env var NAME only, no secrets in git: VITE_LEMONSQUEEZY_CHECKOUTS is a JSON map of product id to that
 * product's LS checkout URL (test-mode URLs first; Jay creates the products in LS and pastes the URLs into Vercel).
 * A product with no URL shows no button. The URL must be https on a lemonsqueezy.com host.
 */
import { PRODUCTS } from '../i18n/content/products';
import { orderCode } from '../lib/productsSource';
import type { FirstTouch } from '../lib/utmFirstTouch';

export type LemonSqueezyCheckouts = Record<string, string>;

const LS_HOST = /^(?:[a-z0-9-]+\.)+lemonsqueezy\.com$/i;

/** The JSON map from the env var: only well-formed https lemonsqueezy.com URLs for digital (PayPal-eligible) products survive. */
export function parseLemonSqueezyCheckouts(raw: string | undefined | null): LemonSqueezyCheckouts {
  if (!raw?.trim()) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
  const out: LemonSqueezyCheckouts = {};
  for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof value !== 'string') continue;
    const product = PRODUCTS.find((p) => p.id === id);
    if (!product?.paypal) continue; // digital goods only; services are never sold through LS
    try {
      const url = new URL(value);
      if (url.protocol === 'https:' && LS_HOST.test(url.hostname)) out[id] = url.toString();
    } catch {
      /* not a URL: ignored */
    }
  }
  return out;
}

const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};
let checkouts: LemonSqueezyCheckouts = parseLemonSqueezyCheckouts(env.VITE_LEMONSQUEEZY_CHECKOUTS);

/** Tests only: replace the configured map. */
export function _setLemonSqueezyCheckouts(next: LemonSqueezyCheckouts) { checkouts = next; }

export const lemonSqueezyCheckout = (id: string): string | undefined => checkouts[id];
export const isLemonSqueezyEnabled = (id: string) => Boolean(checkouts[id]);
export const anyLemonSqueezy = () => Object.keys(checkouts).length > 0;

/**
 * The hosted checkout link for one product: LS reads `checkout[custom][...]` into the order's custom data (returned
 * in the webhook) and `checkout[email]` as a prefilled buyer email. order_ref = "<product id>|<order code>", the same
 * reference the PayPal option carries, so Jay matches an LS order to its product and channel by eye.
 */
export function lemonSqueezyHref(id: string, base: string, options: { source?: string | null; touch?: FirstTouch | null; email?: string | null } = {}): string {
  const url = new URL(base);
  const code = orderCode(options.source ?? null, id);
  url.searchParams.set('checkout[custom][order_ref]', `${id}|${code}`);
  url.searchParams.set('checkout[custom][product_id]', id);
  const touch = options.touch ?? {};
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const) {
    const value = touch[key] ?? (key === 'utm_source' ? options.source ?? undefined : undefined);
    if (value) url.searchParams.set(`checkout[custom][${key}]`, value);
  }
  if (options.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(options.email)) url.searchParams.set('checkout[email]', options.email);
  return url.toString();
}

export const LEMONSQUEEZY_COPY = {
  en: {
    button: (usd: number) => `Pay US$${usd} by card, Alipay or WeChat`,
    note: 'Processed by Lemon Squeezy, which emails your download link.',
    footer: 'Card payments processed by Lemon Squeezy.',
  },
  vi: {
    button: (usd: number) => `Thanh toán US$${usd} bằng thẻ, Alipay hoặc WeChat`,
    note: 'Do Lemon Squeezy xử lý; link tải gửi qua email.',
    footer: 'Thanh toán thẻ do Lemon Squeezy xử lý.',
  },
} as const;
