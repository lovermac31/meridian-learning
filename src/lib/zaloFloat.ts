/**
 * Floating Zalo button — shared constants, copy and the two pure decisions
 * (direct-open breakpoint, hidden routes) so node:test can cover them without a DOM.
 * The component lives in src/components/ZaloFloat.tsx; the styles in src/styles/zalo-float.css.
 */
import type { Locale } from '../i18n/locales';

/** Both taps go through the tracked redirect (api/go/zalo.ts logs a zalo_click row); the master counts this utm_content. */
export const ZALO_FLOAT_UTM = { source: 'float', content: 'zalo-float' } as const;

/** What the QR encodes (owner brief, 1 Nov 2026). Regenerate the SVG with `npm run qr:zalo` after changing it. */
export const ZALO_QR_TARGET = 'https://zalo.me/0396085076';
export const ZALO_QR_IMAGE = '/images/zalo-qr.svg';
export const ZALO_DISPLAY_NUMBER = '0396 085 076';

/** Below this width the tap opens Zalo directly: a phone cannot scan its own screen. */
export const ZALO_FLOAT_DIRECT_MAX_WIDTH = 768;

export function zaloFloatHref(locale: Locale) {
  return `/go/zalo?utm_source=${ZALO_FLOAT_UTM.source}&utm_content=${ZALO_FLOAT_UTM.content}&locale=${locale}`;
}

/** Mobile (< 768 px) or any touch device opens Zalo directly; desktop shows the QR card. */
export function opensZaloDirectly({ viewportWidth, coarsePointer }: { viewportWidth: number; coarsePointer: boolean }) {
  return viewportWidth < ZALO_FLOAT_DIRECT_MAX_WIDTH || coarsePointer;
}

const stripLocale = (pathname: string) => pathname.replace(/^\/(en|vi)(?=\/|$)/, '') || '/';

/**
 * Routes where the float stays off: checkout pay steps, where it would cover the VietQR
 * (/story-club/reserve, and /products/<id>?checkout=1 which renders the same pay step), and the
 * private portals (/internal/*, /external/*). The site has no /admin route.
 */
export function isZaloFloatHidden(pathname: string, search = '') {
  const path = stripLocale(pathname);
  if (path === '/story-club/reserve') return true;
  if (path.startsWith('/products/') && new URLSearchParams(search).get('checkout') === '1') return true;
  if (path === '/internal' || path.startsWith('/internal/')) return true;
  if (path === '/external' || path.startsWith('/external/')) return true;
  return false;
}

export const zaloFloatCopy = {
  en: {
    pill: 'Chat on Zalo',
    launcher: 'Chat on Zalo with Mr. Jay',
    title: 'Zalo · Mr. Jay',
    scan: 'Scan to message Mr. Jay on Zalo',
    open: 'Open Zalo',
    close: 'Close',
    qrAlt: 'Zalo QR code for Mr. Jay, 0396 085 076',
  },
  vi: {
    pill: 'Nhắn Zalo',
    launcher: 'Nhắn Zalo cho Mr. Jay',
    title: 'Zalo · Mr. Jay',
    scan: 'Quét để nhắn Zalo cho Mr. Jay',
    open: 'Mở Zalo',
    close: 'Đóng',
    qrAlt: 'Mã QR Zalo của Mr. Jay, 0396 085 076',
  },
} as const satisfies Record<Locale, Record<string, string>>;
