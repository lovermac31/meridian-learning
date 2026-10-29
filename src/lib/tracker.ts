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

export type AnonymousEvent =
  | 'pricing_view'
  | 'checkout_start'
  | 'paypal_return'
  | 'sample_open'
  | 'video_play'
  | 'lead_submit'
  | 'reserve_view'
  | 'reserve_submit'
  | 'pay_instructions_shown';

export type ClientEventParams = {
  event: AnonymousEvent;
  path?: string;
  product_id?: string;
  utm_source?: string;
  utm_content?: string;
  locale?: string;
};

export function recordClientEvent(params: ClientEventParams): void {
  if (typeof window === 'undefined') return;

  try {
    const searchParams = new URLSearchParams(window.location.search);
    const pathname = window.location.pathname;

    const payload = {
      event: params.event,
      path: params.path ?? pathname,
      product_id: params.product_id,
      utm_source: params.utm_source ?? (searchParams.get('utm_source') || undefined),
      utm_content: params.utm_content ?? (searchParams.get('utm_content') || undefined),
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
