/**
 * Regional US$ prices for digital products (Jay, 3 Nov 2026: "every country has a pricing range").
 * Built on the four market tiers Jay approved on 14 Oct 2026 (src/content/marketPricing.json `markets`); the product
 * prices are in src/content/digitalPricing.json (separate: marketPricing.json is pinned to the AI Speaking checkout's copy). Vietnam is not here: it keeps the VND price and VietQR. A country not
 * listed pays the default (highest) tier. The buyer picks their country; nothing is detected or stored. PayPal charges
 * the amount we put in the link, so the server never needs a country. No coupon codes: the price itself changes.
 */
import marketPricing from '../content/marketPricing.json';
import digitalPricing from '../content/digitalPricing.json';
import type { Locale } from '../i18n/locales';

type Tier = '1' | '2' | '3' | '4';
const DIGITAL = digitalPricing;
const PRODUCT_TIERS = DIGITAL.products as Record<string, Record<Tier, number>>;
const MARKET_TIERS = marketPricing.markets as Record<string, number>;

export const OTHER_MARKET = 'other';

/** Country names for the picker (the markets of marketPricing.json). */
export const MARKET_LABELS: Record<string, Record<Locale, string>> = {
  india: { en: 'India', vi: 'Ấn Độ' }, pakistan: { en: 'Pakistan', vi: 'Pakistan' }, bangladesh: { en: 'Bangladesh', vi: 'Bangladesh' },
  nigeria: { en: 'Nigeria', vi: 'Nigeria' }, egypt: { en: 'Egypt', vi: 'Ai Cập' }, philippines: { en: 'Philippines', vi: 'Philippines' },
  indonesia: { en: 'Indonesia', vi: 'Indonesia' }, thailand: { en: 'Thailand', vi: 'Thái Lan' }, colombia: { en: 'Colombia', vi: 'Colombia' },
  peru: { en: 'Peru', vi: 'Peru' }, brazil: { en: 'Brazil', vi: 'Brazil' }, malaysia: { en: 'Malaysia', vi: 'Malaysia' },
  chile: { en: 'Chile', vi: 'Chile' }, argentina: { en: 'Argentina', vi: 'Argentina' }, singapore: { en: 'Singapore', vi: 'Singapore' },
  uae: { en: 'United Arab Emirates', vi: 'Các Tiểu vương quốc Ả Rập Thống nhất' }, 'saudi-arabia': { en: 'Saudi Arabia', vi: 'Ả Rập Xê Út' },
};
export const MARKET_IDS = Object.keys(MARKET_LABELS).filter((id) => id in MARKET_TIERS).sort((a, b) => MARKET_LABELS[a].en.localeCompare(MARKET_LABELS[b].en));

export const hasRegionalPrice = (id: string) => id in PRODUCT_TIERS;

/** US$ for a product in a market; an unknown or missing market pays the default tier. */
export function regionalUsd(id: string, market?: string | null): number {
  const tiers = PRODUCT_TIERS[id];
  if (!tiers) throw new Error(`No regional price for ${id}`);
  const tier = String(market && market in MARKET_TIERS ? MARKET_TIERS[market] : DIGITAL.default) as Tier;
  return tiers[tier];
}

/** The lowest and highest regional US$ prices of a product, for "from" lines and structured data. */
export function regionalUsdRange(id: string): { low: number; high: number } {
  const values = Object.values(PRODUCT_TIERS[id]);
  return { low: Math.min(...values), high: Math.max(...values) };
}
