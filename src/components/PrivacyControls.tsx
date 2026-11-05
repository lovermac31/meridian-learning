import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { analyticsAllowed, countingAllowed, CONSENT_EVENT, CONSENT_KEY, consentBeforeSend } from '../lib/analyticsConsent';
import { loadGa4, stopGa4 } from '../lib/ga4';

/**
 * Visitor counting without a banner (5 Nov 2026, Jay's decision). Vercel Analytics and Speed Insights are cookie-free and anonymous,
 * so they run for everyone except Do Not Track, Global Privacy Control and anyone who rejected analytics in the earlier banner.
 * Google Analytics sets cookies, so it still loads only for a visitor who explicitly accepted earlier; there is no longer a way to
 * give that consent, so it is effectively off.
 */
export function OptionalAnalytics({ route }: { route: string }) {
  // The first client render matches SSR; storage and the browser signals are read only after hydration.
  const [counting, setCounting] = useState(false);
  useEffect(() => {
    const sync = () => {
      setCounting(countingAllowed());
      if (analyticsAllowed()) loadGa4(); else stopGa4();
    };
    const storage = (event: StorageEvent) => { if (event.key === CONSENT_KEY || event.key === null) sync(); };
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    window.addEventListener('storage', storage);
    return () => { window.removeEventListener(CONSENT_EVENT, sync); window.removeEventListener('storage', storage); };
  }, []);
  return counting ? <><Analytics beforeSend={consentBeforeSend} /><SpeedInsights route={route} beforeSend={consentBeforeSend} /></> : null;
}
