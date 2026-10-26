/**
 * ga4.ts — Google Analytics 4 for jurassicenglish.com (property 560798867).
 *
 * Loads gtag.js once, in the browser, on the production hosts only (previews,
 * localhost and the build-time prerender never send data). Visitors whose
 * browser sends Global Privacy Control or Do Not Track are not measured.
 * SPA page changes are recorded by GA4's enhanced measurement (browser
 * history events), so no manual page_view is sent here.
 *
 * Vercel Web Analytics stays as it is; GA4 runs beside it. Atlas reads the
 * GA4 Data API with a read-only service account (Viewer on the property).
 */
export const GA4_MEASUREMENT_ID = 'G-H334PZMDYW';

const PRODUCTION_HOSTS = new Set(['jurassicenglish.com', 'www.jurassicenglish.com']);

type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

/** True when the visitor asked not to be tracked (GPC or DNT). */
export function optedOut(nav: Partial<Navigator> & { globalPrivacyControl?: boolean } = navigator): boolean {
  return nav.globalPrivacyControl === true || nav.doNotTrack === '1';
}

export function shouldLoadGa4(host: string, nav?: Partial<Navigator> & { globalPrivacyControl?: boolean }): boolean {
  return PRODUCTION_HOSTS.has(host) && !optedOut(nav);
}

let loaded = false;

/** Inject gtag.js and configure the property. Safe to call more than once. */
export function loadGa4(): void {
  if (loaded || typeof window === 'undefined' || typeof document === 'undefined') return;
  if (!shouldLoadGa4(window.location.hostname)) return;
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag.js reads the arguments object itself, exactly as Google's snippet does.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA4_MEASUREMENT_ID);
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  document.head.appendChild(s);
}

/** Send a custom event to GA4 when it is loaded; a no-op otherwise. */
export function ga4Event(name: string, params: Record<string, string | number | boolean | undefined>): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}
