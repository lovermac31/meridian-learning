import { useEffect, useState } from 'react';
import { trackLanguageBanner } from '../lib/analytics';
import { VI_BANNER_DISMISSED_KEY, vietnameseBannerTarget } from '../lib/languageBanner';
import { getUiString } from '../i18n/ui';

type VietnameseBannerProps = {
  route: string;
  onNavigate: (path: string) => void;
};

/**
 * One dismissible line on English pages for visitors whose browser prefers Vietnamese. Rendered only after hydration
 * (state starts empty), so the server-rendered page is identical for everyone. Bottom-left, and narrow enough that it stops
 * short of the Zalo button at the bottom-right (that button is about 104px wide plus its margin).
 */
export function VietnameseBanner({ route, onNavigate }: VietnameseBannerProps) {
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    let dismissed = false;
    try { dismissed = window.localStorage.getItem(VI_BANNER_DISMISSED_KEY) === '1'; } catch { /* Storage unavailable: show the line again next time. */ }
    setTarget(vietnameseBannerTarget(route, navigator.languages, navigator.language, dismissed));
  }, [route]);

  if (!target) return null;

  const dismiss = () => {
    try { window.localStorage.setItem(VI_BANNER_DISMISSED_KEY, '1'); } catch { /* Dismissed for this page view only. */ }
    trackLanguageBanner('dismiss');
    setTarget(null);
  };

  return (
    <div
      role="region"
      aria-label={getUiString('vi', 'languageBanner.ariaLabel')}
      lang="vi"
      className="fixed bottom-4 left-4 z-[80] flex max-w-[calc(100vw-9.5rem)] sm:max-w-sm items-center gap-2 rounded-2xl border border-sb-border bg-white py-1.5 pl-4 pr-1.5 text-sm text-sb-forest shadow-lg sm:left-6 sm:bottom-6"
    >
      <span className="py-1 font-semibold leading-snug">{getUiString('vi', 'languageBanner.message')}</span>
      <a
        href={target}
        onClick={(event) => {
          event.preventDefault();
          trackLanguageBanner('accept');
          onNavigate(target);
          setTarget(null);
        }}
        className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-sb-forest px-4 text-sm font-semibold text-white"
      >
        {getUiString('vi', 'languageBanner.action')}
      </a>
      <button
        type="button"
        onClick={dismiss}
        aria-label={getUiString('vi', 'languageBanner.dismiss')}
        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sb-slate"
      >
        <span aria-hidden="true">×</span>
      </button>
    </div>
  );
}
