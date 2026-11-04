/**
 * conversionEvents.ts: GA4 / Vercel events for the money path (4 Nov 2026).
 *
 * The Story Club reserve button, the Zalo links and the product "Buy" buttons fired no analytics event, so GA4 showed 0 key
 * events. One delegated click listener classifies those links and sends `reserve_click`, `zalo_click` or `buy_click`
 * (no personal data: only the page path, the link's utm_content and the product id). Consent still applies (see track()).
 */
import { trackConversion } from './analytics';

export type ConversionEvent = { name: 'reserve_click' | 'zalo_click' | 'buy_click'; params: Record<string, string> };

/** Pure: decide which conversion event (if any) a clicked link represents. */
export function classifyConversionLink(href: string | null, data: { buyNow?: string; cta?: string } = {}, page = ''): ConversionEvent | null {
  if (!href) return null;
  let path = href;
  let content = '';
  try {
    const url = new URL(href, 'https://jurassicenglish.com');
    path = url.pathname;
    content = url.searchParams.get('utm_content') ?? '';
  } catch { /* A malformed href is simply not a conversion link. */ }
  if (/(^|\/)go\/zalo\/?$/.test(path)) return { name: 'zalo_click', params: { page, link_content: content } };
  if (/\/story-club\/reserve\/?$/.test(path)) return { name: 'reserve_click', params: { page, link_content: content } };
  if (data.buyNow) return { name: 'buy_click', params: { page, product_id: data.buyNow } };
  return null;
}

let installed = false;

/** Install once; returns a cleanup function. */
export function installConversionEvents(): () => void {
  if (installed || typeof document === 'undefined') return () => {};
  installed = true;
  const onClick = (event: MouseEvent) => {
    try {
      const link = (event.target as HTMLElement | null)?.closest?.('a');
      if (!link) return;
      const result = classifyConversionLink(link.getAttribute('href'), { buyNow: link.getAttribute('data-buy-now') ?? undefined, cta: link.getAttribute('data-cta') ?? undefined }, window.location.pathname);
      if (result) trackConversion(result.name, result.params);
    } catch { /* Measurement must never block navigation. */ }
  };
  document.addEventListener('click', onClick, true);
  return () => { document.removeEventListener('click', onClick, true); installed = false; };
}
