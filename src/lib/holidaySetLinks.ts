import type { Locale } from '../i18n/locales';
import { holidaySetPath, type HolidaySet } from '../config/holidaySets';
import { holidaySetText } from '../i18n/content/holidaySets';
import { orderCode } from './productsSource';
import { paypalHref, paypalItemName } from './paypal';

/**
 * PayPal link for a holiday set (outside Vietnam), same shape as productPaypalHref: the item name and the custom field carry
 * the set id and the order code, so Jay matches each payment by hand. The amount is the set's fixed US$ price.
 * A PayPal link is a static URL and cannot carry the window: the page shows it only while the window is open, and Jay
 * checks every PayPal payment by hand (a payment after 6 Dec is a refund, not an automatic sale).
 */
export function holidaySetPaypalHref(set: HolidaySet, source: string | null, locale: Locale = 'en'): string {
  const code = orderCode(source, set.id);
  const title = holidaySetText(set.id, 'en').title;
  const href = new URL(paypalHref(paypalItemName(title, `/products ${set.id} code ${code}`), set.usd, `${set.id}|${code}`));
  const back = `https://jurassicenglish.com${locale === 'vi' ? '/vi' : ''}${holidaySetPath(set.id)}`;
  href.searchParams.set('return', back);
  href.searchParams.set('cancel_return', back);
  href.searchParams.set('rm', '1');
  return href.toString();
}
