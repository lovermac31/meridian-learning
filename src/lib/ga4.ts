/** GA4: production only, explicit opt-in only, respecting GPC and DNT. */
import { analyticsAllowed } from './analyticsConsent';
export const GA4_MEASUREMENT_ID = 'G-H334PZMDYW';
const PRODUCTION_HOSTS = new Set(['jurassicenglish.com', 'www.jurassicenglish.com']);
type Gtag = (...args: unknown[]) => void;
declare global {
  interface Window { dataLayer?: unknown[]; gtag?: Gtag; }
}
export function optedOut(nav: Partial<Navigator> & { globalPrivacyControl?: boolean } = navigator): boolean {
  return nav.globalPrivacyControl === true || nav.doNotTrack === '1';
}
export function shouldLoadGa4(host: string, nav?: Partial<Navigator> & { globalPrivacyControl?: boolean }, consent = false): boolean {
  return consent && PRODUCTION_HOSTS.has(host) && !optedOut(nav);
}
let loaded = false;
let generation = 0;
const disable = (value: boolean) => { (window as unknown as Record<string, unknown>)[`ga-disable-${GA4_MEASUREMENT_ID}`] = value; };
export function loadGa4(): void {
  if (loaded || typeof window === 'undefined' || typeof document === 'undefined') return;
  if (!shouldLoadGa4(window.location.hostname, navigator, analyticsAllowed())) return;
  loaded = true;
  disable(false);
  const scheduledGeneration = ++generation;
  const inject = () => {
    // Withdrawal can occur while waiting for load/idle. Never inject a stale job.
    if (scheduledGeneration !== generation || !analyticsAllowed()) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() { window.dataLayer!.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA4_MEASUREMENT_ID);
    const s = document.createElement('script');
    s.id = 'je-ga4';
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
    document.head.appendChild(s);
  };
  const whenIdle = () => {
    if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(inject, { timeout: 3000 });
    else setTimeout(inject, 1500);
  };
  if (document.readyState === 'complete') whenIdle();
  else window.addEventListener('load', whenIdle, { once: true });
}
/** Stop future collection; already transmitted requests cannot be recalled. */
export function stopGa4(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  ++generation;
  loaded = false;
  disable(true);
  document.getElementById('je-ga4')?.remove();
  window.dataLayer = [];
  // Best-effort removal of first-party GA cookies, including parent-domain scope.
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.trim().split('=')[0];
    if (!/^_ga(?:_|$)/.test(name)) continue;
    const domains = ['', window.location.hostname, `.${window.location.hostname}`, '.jurassicenglish.com'];
    for (const domain of domains) document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax${domain ? `; domain=${domain}` : ''}`;
  }
}
export function ga4Event(name: string, params: Record<string, string | number | boolean | undefined>): void {
  if (!analyticsAllowed() || typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', name, params);
}
