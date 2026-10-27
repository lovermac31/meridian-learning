import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { analyticsAllowed, CONSENT_EVENT, CONSENT_KEY, consentBeforeSend, readAnalyticsConsent, saveAnalyticsConsent, type AnalyticsConsent } from '../lib/analyticsConsent';
import { getCurrentLocale } from '../i18n/routing';
import { loadGa4, stopGa4 } from '../lib/ga4';

function useConsent() {
  // The first client render matches SSR; storage is read only after hydration.
  const [choice, setChoice] = useState<AnalyticsConsent>(null);
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    const sync = () => { setChoice(readAnalyticsConsent()); setAllowed(analyticsAllowed()); };
    const storage = (event: StorageEvent) => { if (event.key === CONSENT_KEY || event.key === null) sync(); };
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    window.addEventListener('storage', storage);
    return () => { window.removeEventListener(CONSENT_EVENT, sync); window.removeEventListener('storage', storage); };
  }, []);
  return { choice, allowed };
}
export function OptionalAnalytics({ route }: { route: string }) {
  const { allowed } = useConsent();
  useEffect(() => {
    const sync = () => { if (analyticsAllowed()) loadGa4(); else stopGa4(); };
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => { window.removeEventListener(CONSENT_EVENT, sync); window.removeEventListener('storage', sync); };
  }, []);
  return allowed ? <><Analytics beforeSend={consentBeforeSend} /><SpeedInsights route={route} beforeSend={consentBeforeSend} /></> : null;
}
export function PrivacyControls() {
  const { choice } = useConsent();
  const [open, setOpen] = useState(false);
  const vi = getCurrentLocale() === 'vi';
  const choose = (value: 'accepted' | 'rejected') => {
    saveAnalyticsConsent(value);
    setOpen(false);
  };
  return <aside aria-label={vi ? 'Tùy chọn quyền riêng tư' : 'Privacy choices'} className="fixed bottom-3 left-3 right-3 z-[40] max-w-sm rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-900 shadow-lg">
    {choice === null || open ? <>
      <p className="mb-3">{vi ? 'Chỉ bật Google Analytics và Vercel Analytics/Speed Insights khi bạn đồng ý. Bạn có thể thay đổi lựa chọn bất kỳ lúc nào.' : 'Google Analytics and Vercel Analytics/Speed Insights stay off until you accept. You can change your choice at any time.'}</p>
      <div className="flex flex-wrap gap-3">
        <button type="button" className="rounded border border-gray-600 px-3 py-2 focus-visible:outline-2" onClick={() => choose('rejected')}>{vi ? 'Từ chối phân tích' : 'Reject analytics'}</button>
        <button type="button" className="rounded border border-gray-600 px-3 py-2 focus-visible:outline-2" onClick={() => choose('accepted')}>{vi ? 'Đồng ý phân tích' : 'Accept analytics'}</button>
      </div>
      <a className="mt-2 inline-block underline" href={vi ? '/vi/legal/privacy' : '/legal/privacy'}>{vi ? 'Chính sách quyền riêng tư' : 'Privacy policy'}</a>
    </> : <button type="button" className="rounded px-2 py-1 underline focus-visible:outline-2" onClick={() => setOpen(true)}>{vi ? 'Cài đặt quyền riêng tư' : 'Privacy settings'}</button>}
  </aside>;
}
