import { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { getCurrentLocale } from '../i18n/routing';
import { getUiString } from '../i18n/ui';
import { COMING_SOON_EVENT } from '../lib/comingSoon';

const DISMISS_MS = 6000;

/**
 * Small, temporary, non-blocking "Coming soon" message (role=status, aria-live=polite). Auto-dismisses after 6 s,
 * pauses while hovered or focused so the email link stays usable, closes on × or Escape. Not a modal: no focus
 * trap, the page stays usable underneath.
 */
export function ComingSoonToast() {
  const [label, setLabel] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const paused = useRef(false);
  const locale = getCurrentLocale();

  const close = useCallback(() => { window.clearTimeout(timer.current); setOpen(false); }, []);
  const arm = useCallback(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => { if (!paused.current) setOpen(false); }, DISMISS_MS);
  }, []);

  useEffect(() => {
    const onShow = (e: Event) => {
      const d = (e as CustomEvent<{ label?: string }>).detail;
      setLabel(d?.label ?? null); setOpen(true); paused.current = false; arm();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener(COMING_SOON_EVENT, onShow);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener(COMING_SOON_EVENT, onShow); window.removeEventListener('keydown', onKey); window.clearTimeout(timer.current); };
  }, [arm, close]);

  const pause = () => { paused.current = true; window.clearTimeout(timer.current); };
  const resume = () => { paused.current = false; arm(); };

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-[70] flex justify-center px-4">
      {open ? (
        <div
          onMouseEnter={pause} onMouseLeave={resume} onFocus={pause} onBlur={resume}
          className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border border-white/10 bg-jurassic-dark/95 px-4 py-3.5 text-white shadow-[0_18px_50px_rgba(0,0,0,0.4)] backdrop-blur-md motion-safe:animate-[jeToastIn_.22s_ease-out]"
        >
          <span className="mt-0.5 shrink-0 rounded-full bg-jurassic-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            {getUiString(locale, 'comingSoonToast.badge')}
          </span>
          <p className="flex-1 text-sm leading-snug text-white/85">
            {label ? <strong className="font-semibold text-white">{label} · </strong> : null}
            {getUiString(locale, 'comingSoonToast.message')}{' '}
            <a href="mailto:info@jurassicenglish.com" className="font-semibold text-jurassic-accent underline-offset-4 hover:underline">info@jurassicenglish.com</a>
          </p>
          <button type="button" onClick={close} aria-label={getUiString(locale, 'comingSoonToast.close')}
            className="-mr-1 shrink-0 rounded-md p-1 text-white/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent">
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
