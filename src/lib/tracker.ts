/**
 * Client-Side Event Tracker (Phase 1)
 * ─────────────────────────────────────────────────────────────────────────────
 * First-party, anonymous, cookieless event reporter.
 *
 * Privacy rules:
 *   - NEVER sends IP, cookies, session identifiers, or user personal data.
 *   - Fires on visitor interactions and explicitly approved, route-specific funnel views.
 *   - Uses navigator.sendBeacon with a fetch fallback; non-blocking.
 */

import { countingAllowed } from './analyticsConsent';

export type AnonymousEvent =
  | 'pricing_view'
  | 'checkout_start'
  | 'paypal_return'
  | 'sample_open'
  | 'video_play'
  | 'lead_submit'
  | 'reserve_view'
  | 'reserve_submit'
  | 'pay_instructions_shown'
  | 'page_view';

export type ClientEventParams = {
  event: AnonymousEvent;
  path?: string;
  product_id?: string;
  utm_source?: string;
  utm_content?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer_host?: string;
  locale?: string;
};

export function recordClientEvent(params: ClientEventParams): void {
  if (typeof window === 'undefined') return;

  try {
    const searchParams = new URLSearchParams(window.location.search);
    const pathname = window.location.pathname;

    // The visit's first utm_* set (src/lib/utmFirstTouch.ts) fills in what the current URL does not carry.
    let touch: Record<string, string | undefined> = {};
    try {
      touch = JSON.parse(window.sessionStorage.getItem('je_utm_first_touch') ?? '{}') as Record<string, string | undefined>;
    } catch {
      touch = {};
    }
    const utm = (key: 'utm_source' | 'utm_content' | 'utm_medium' | 'utm_campaign') => params[key] ?? (searchParams.get(key) || undefined) ?? touch[key] ?? undefined;
    const payload = {
      event: params.event,
      path: params.path ?? pathname,
      product_id: params.product_id,
      utm_source: utm('utm_source'),
      utm_content: utm('utm_content'),
      utm_medium: utm('utm_medium'),
      utm_campaign: utm('utm_campaign'),
      referrer_host: params.referrer_host,
      locale: params.locale ?? (pathname.startsWith('/vi') ? 'vi' : 'en'),
    };

    const body = JSON.stringify(payload);

    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([body], { type: 'application/json' });
      const queued = navigator.sendBeacon('/api/event', blob);
      if (queued) return;
    }

    // Fallback for browsers without sendBeacon or if beacon queue is full
    fetch('/api/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Fail silently in user browser
  }
}

/**
 * Page views (13 Nov 2026): one `page_view` per route view, so "have people been clicking?" has a denominator.
 * First-party and cookieless like every event here: path (no query string), language, the referrer's host only, and the
 * visit's utm_* set. Nothing is stored on the device beyond the existing first-touch utm key. Not counted: Do Not Track,
 * Global Privacy Control, an earlier "Reject analytics" choice (countingAllowed), automated browsers and prerender.
 * api/event.ts repeats the automated-request check on the server, so a client that lies is still not counted.
 */
const BOT_USER_AGENT = /HeadlessChrome|Playwright|Puppeteer|Lighthouse|Page ?Speed|(?<![a-z])bot(?![a-z])|bot[/;-]|crawler|spider|curl|wget|python-requests|node-fetch|undici|Go-http-client|facebookexternalhit|WhatsApp\/|Slackbot|Discordbot|Twitterbot|Selenium|PhantomJS|HeadlessShell/i;

/** Operator and per-client pages are never counted, so no id in a path reaches the events table. */
const PRIVATE_PATH = /^(\/vi)?\/(internal|pilot|admin|api|go)(\/|$)/i;

export type PageViewEnv = {
  pathname: string;
  referrer: string;
  host: string;
  userAgent: string;
  webdriver: boolean;
  prerendering: boolean;
  counting: boolean;
  firstViewOfLoad: boolean;
};

/** Pure: the event to send for this view, or null when it must not be counted. */
export function pageViewParams(env: PageViewEnv): ClientEventParams | null {
  if (!env.counting || env.webdriver || env.prerendering) return null;
  if (PRIVATE_PATH.test(env.pathname)) return null;
  if (!env.userAgent.trim() || BOT_USER_AGENT.test(env.userAgent)) return null;
  let referrerHost: string | undefined;
  if (env.firstViewOfLoad && env.referrer) {
    try {
      const host = new URL(env.referrer).hostname.toLowerCase().replace(/^www\./, '').slice(0, 64);
      if (host && host !== env.host.toLowerCase().replace(/^www\./, '')) referrerHost = host;
    } catch { /* A malformed referrer is simply not recorded. */ }
  }
  return { event: 'page_view', path: env.pathname.slice(0, 256), referrer_host: referrerHost };
}

let lastViewedPath: string | null = null;

/** Send one page_view for the current route; the same path twice in a row (React strict-mode re-run) counts once. */
export function recordPageView(): void {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return;
  try {
    const pathname = window.location.pathname;
    if (pathname === lastViewedPath) return;
    const firstViewOfLoad = lastViewedPath === null;
    lastViewedPath = pathname;
    const params = pageViewParams({
      pathname,
      referrer: document.referrer,
      host: window.location.hostname,
      userAgent: navigator.userAgent,
      webdriver: navigator.webdriver === true,
      prerendering: Boolean((document as Document & { prerendering?: boolean }).prerendering) || (document.visibilityState as string) === 'prerender',
      counting: countingAllowed(),
      firstViewOfLoad,
    });
    if (params) recordClientEvent(params);
  } catch {
    // Measurement never blocks the page.
  }
}
