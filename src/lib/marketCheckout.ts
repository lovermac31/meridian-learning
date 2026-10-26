import marketPricing from '../content/marketPricing.json';
import { isInternationalMarketPath } from './seoPageMeta';

// Shared by the country pages (SearchInsightsPage) and the header. Kept free of seoPages.json (~0.5 MB) so the
// navbar can use it without pulling the article HTML into the first load.

// No PayPal for these markets: their pages keep the email booking request.
export const NO_PAYPAL_MARKETS = new Set(['pakistan', 'bangladesh']);

export const marketFromPath = (path: string) => {
  const slug = path.split('/').filter(Boolean).at(-1);
  return slug === 'ielts-speaking-online' ? undefined : slug === 'brasil' ? 'brazil' : slug;
};

// The options open the order-first checkout in the AI Speaking app (automated PayPal, 21 Oct 2026). ?market= makes the
// checkout show and charge this country's listed US$ price (jurassic-ai-speaking lib/market-pricing.ts, a checked copy of
// src/content/marketPricing.json; terms LT-2026-10-24). The server prices from its table, never from this link.
export function checkoutHref(item: 'baseline' | 'lesson' | 'pack', market: string) {
  const m = encodeURIComponent(market);
  return item === 'baseline' ? `/ai-speaking/baseline?market=${m}` : `/ai-speaking/lessons?pack=${item === 'lesson' ? 'lesson_single' : 'lesson_month'}&market=${m}`;
}

// Header button on the hub and country pages: this page's own Baseline price and destination in US$, instead of the
// site-wide "Book Baseline · 690k₫" meant for families in Vietnam. It matches the page's own primary button.
export function marketHeaderCta(pathname: string) {
  if (!isInternationalMarketPath(pathname)) return undefined;
  const market = marketFromPath(pathname);
  const tier = market ? marketPricing.markets[market as keyof typeof marketPricing.markets] : 1;
  if (!tier) return undefined;
  const usd = marketPricing.tiers[String(tier) as keyof typeof marketPricing.tiers].baseline_usd;
  const price = `${market ? '' : 'from '}US$${usd}`;
  if (market && !NO_PAYPAL_MARKETS.has(market)) {
    return { href: checkoutHref('baseline', market), label: `Book Baseline · ${price}`, mobileLabel: `Baseline · ${price}` };
  }
  const where = market ? market[0].toUpperCase() + market.slice(1) : 'International';
  const href = `mailto:info@jurassicenglish.com?subject=${encodeURIComponent(`Speaking Baseline request - ${where} (${price})`)}`;
  return { href, label: `Request Baseline · ${price}`, mobileLabel: `Baseline · ${price}` };
}
