/**
 * PayPal — the second payment option for customers outside Vietnam.
 *
 * Owner decision (Jay Adams, 14 Oct 2026): payments go to the Jurassic English
 * PayPal account (info@jurassicenglish.com) through PayPal's standard _xclick
 * checkout. Confirmation is manual: the customer puts their booking reference
 * or email in the PayPal note and Jay confirms by hand. VietQR stays the
 * primary option inside Vietnam.
 *
 * Link shape, logo and item-name pattern match the market-page panel shipped in
 * PR #128 (src/components/SearchInsightsPage.tsx), so every PayPal payment Jay
 * receives reads the same way: "<offer> - <where> (Jurassic English)".
 *
 * Amounts: market pages use the approved USD tier prices in
 * src/content/marketPricing.json. Everything priced in VND converts with
 * usdFromVnd(): ceil(VND / 25,897), the FX recorded in that same file.
 */

export const PAYPAL_ACCOUNT = 'info@jurassicenglish.com';
export const PAYPAL_LOGO = 'https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-color.svg';
export const PAYPAL_CHECKOUT = 'https://www.paypal.com/cgi-bin/webscr';

/** VND per USD at the 14 Oct 2026 pricing decision (marketPricing.json `_approved`). */
export const VND_PER_USD = 25_897;

/** Whole US dollars for a VND price, always rounded up. */
export function usdFromVnd(vnd: number): number {
  return Math.ceil(vnd / VND_PER_USD);
}

/** "<offer> - <where> (Jurassic English)", the item name Jay matches payments against. */
export function paypalItemName(offer: string, where: string): string {
  return `${offer} - ${where} (Jurassic English)`;
}

/** PayPal _xclick checkout for one item at a fixed USD amount. */
export function paypalHref(itemName: string, amountUsd: number): string {
  const params = new URLSearchParams({
    cmd: '_xclick',
    business: PAYPAL_ACCOUNT,
    item_name: itemName,
    amount: amountUsd.toFixed(2),
    currency_code: 'USD',
    no_shipping: '1',
  });
  return `${PAYPAL_CHECKOUT}?${params.toString()}`;
}
