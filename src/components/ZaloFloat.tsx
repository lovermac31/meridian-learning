import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react';
import type { Locale } from '../i18n/locales';
import {
  ZALO_DISPLAY_NUMBER,
  ZALO_FLOAT_DIRECT_MAX_WIDTH,
  ZALO_QR_IMAGE,
  opensZaloDirectly,
  zaloFloatCopy,
  zaloFloatHref,
} from '../lib/zaloFloat';

export { zaloFloatCopy };

type ZaloFloatProps = {
  locale: Locale;
  /** True on checkout pay steps and private portals (src/lib/zaloFloat.ts → isZaloFloatHidden). Renders nothing. */
  hidden?: boolean;
};

/** Official Zalo app icon (Wikimedia Commons "Icon of Zalo.svg", CC0), inlined so no third-party request is made. */
function ZaloMark() {
  return (
    <svg viewBox="0 0 50 50" width="44" height="44" fill="none" aria-hidden="true" focusable="false">
      <path fillRule="evenodd" clipRule="evenodd" d="M22.782 0.166016H27.199C33.2653 0.166016 36.8103 1.05701 39.9572 2.74421C43.1041 4.4314 45.5875 6.89585 47.2557 10.0428C48.9429 13.1897 49.8339 16.7347 49.8339 22.801V27.1991C49.8339 33.2654 48.9429 36.8104 47.2557 39.9573C45.5685 43.1042 43.1041 45.5877 39.9572 47.2559C36.8103 48.9431 33.2653 49.8341 27.199 49.8341H22.8009C16.7346 49.8341 13.1896 48.9431 10.0427 47.2559C6.89583 45.5687 4.41243 43.1042 2.7442 39.9573C1.057 36.8104 0.166016 33.2654 0.166016 27.1991V22.801C0.166016 16.7347 1.057 13.1897 2.7442 10.0428C4.43139 6.89585 6.89583 4.41245 10.0427 2.74421C13.1707 1.05701 16.7346 0.166016 22.782 0.166016Z" fill="#0068FF" />
      <path opacity="0.12" fillRule="evenodd" clipRule="evenodd" d="M49.8336 26.4736V27.1994C49.8336 33.2657 48.9427 36.8107 47.2555 39.9576C45.5683 43.1045 43.1038 45.5879 39.9569 47.2562C36.81 48.9434 33.265 49.8344 27.1987 49.8344H22.8007C17.8369 49.8344 14.5612 49.2378 11.8104 48.0966L7.27539 43.4267L49.8336 26.4736Z" fill="#001A33" />
      <path fillRule="evenodd" clipRule="evenodd" d="M7.779 43.5892C10.1019 43.846 13.0061 43.1836 15.0682 42.1825C24.0225 47.1318 38.0197 46.8954 46.4923 41.4732C46.8209 40.9803 47.1279 40.4677 47.4128 39.9363C49.1062 36.7779 50.0004 33.22 50.0004 27.1316V22.7175C50.0004 16.629 49.1062 13.0711 47.4128 9.91273C45.7385 6.75436 43.2461 4.28093 40.0877 2.58758C36.9293 0.894239 33.3714 0 27.283 0H22.8499C17.6644 0 14.2982 0.652754 11.4699 1.89893C11.3153 2.03737 11.1636 2.17818 11.0151 2.32135C2.71734 10.3203 2.08658 27.6593 9.12279 37.0782C9.13064 37.0921 9.13933 37.1061 9.14889 37.1203C10.2334 38.7185 9.18694 41.5154 7.55068 43.1516C7.28431 43.399 7.37944 43.5512 7.779 43.5892Z" fill="white" />
      <path d="M20.5632 17H10.8382V19.0853H17.5869L10.9329 27.3317C10.7244 27.635 10.5728 27.9194 10.5728 28.5639V29.0947H19.748C20.203 29.0947 20.5822 28.7156 20.5822 28.2606V27.1421H13.4922L19.748 19.2938C19.8428 19.1801 20.0134 18.9716 20.0893 18.8768L20.1272 18.8199C20.4874 18.2891 20.5632 17.8341 20.5632 17.2844V17Z" fill="#0068FF" />
      <path d="M32.9416 29.0947H34.3255V17H32.2402V28.3933C32.2402 28.7725 32.5435 29.0947 32.9416 29.0947Z" fill="#0068FF" />
      <path d="M25.814 19.6924C23.1979 19.6924 21.0747 21.8156 21.0747 24.4317C21.0747 27.0478 23.1979 29.171 25.814 29.171C28.4301 29.171 30.5533 27.0478 30.5533 24.4317C30.5723 21.8156 28.4491 19.6924 25.814 19.6924ZM25.814 27.2184C24.2785 27.2184 23.0273 25.9672 23.0273 24.4317C23.0273 22.8962 24.2785 21.645 25.814 21.645C27.3495 21.645 28.6007 22.8962 28.6007 24.4317C28.6007 25.9672 27.3685 27.2184 25.814 27.2184Z" fill="#0068FF" />
      <path d="M40.4867 19.6162C37.8516 19.6162 35.7095 21.7584 35.7095 24.3934C35.7095 27.0285 37.8516 29.1707 40.4867 29.1707C43.1217 29.1707 45.2639 27.0285 45.2639 24.3934C45.2639 21.7584 43.1217 19.6162 40.4867 19.6162ZM40.4867 27.2181C38.9322 27.2181 37.681 25.9669 37.681 24.4124C37.681 22.8579 38.9322 21.6067 40.4867 21.6067C42.0412 21.6067 43.2924 22.8579 43.2924 24.4124C43.2924 25.9669 42.0412 27.2181 40.4867 27.2181Z" fill="#0068FF" />
      <path d="M29.4562 29.0944H30.5747V19.957H28.6221V28.2793C28.6221 28.7153 29.0012 29.0944 29.4562 29.0944Z" fill="#0068FF" />
    </svg>
  );
}

const FOCUSABLE = 'a[href], button:not([disabled])';
/** Fixed bottom controls the float must never cover (see PrivacyControls and BotUIChat). */
const OBSTACLES = '[data-privacy-controls], .je-botui-shell > button';

/**
 * Floating Zalo contact button, bottom-right on every public page (owner brief, 1 Nov 2026, after monkey.edu.vn).
 *
 * - The launcher is always a real link to the tracked redirect, so server and client render the same markup and
 *   a tap before hydration still reaches Zalo. After mount, desktop clicks are intercepted and open the QR card;
 *   phones and touch devices (src/lib/zaloFloat.ts → opensZaloDirectly) follow the link, since they cannot scan
 *   their own screen.
 * - Opening the card logs nothing. Only the launcher tap (mobile) and the card's "Open Zalo" link go through
 *   /go/zalo?utm_source=float&utm_content=zalo-float, which api/go/zalo.ts records as a zalo_click.
 * - The card is a modal dialog: focus moves to its close button, Tab cycles inside it, Escape / the close button /
 *   an outside click close it, and focus returns to the launcher.
 * - It measures the privacy banner (full-width on phones) and the assistant launcher (bottom-right on English
 *   routes) and lifts itself above whichever is there (--zf-lift), so it never covers them; it hides while the
 *   assistant panel is open (html[data-je-assistant-open], set by BotUIChat).
 */
export function ZaloFloat({ locale, hidden = false }: ZaloFloatProps) {
  const t = zaloFloatCopy[locale] ?? zaloFloatCopy.en;
  const href = zaloFloatHref(locale);
  const [open, setOpen] = useState(false);
  // SSR and the first client render use desktop semantics; the effect below corrects it after hydration.
  const [direct, setDirect] = useState(false);
  const [lift, setLift] = useState<number | null>(null); // null until first measured: no slide-in on first paint
  const rootRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLAnchorElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)');
    const narrow = window.matchMedia(`(max-width: ${ZALO_FLOAT_DIRECT_MAX_WIDTH - 1}px)`);
    const sync = () => setDirect(opensZaloDirectly({ viewportWidth: window.innerWidth, coarsePointer: coarse.matches }));
    sync();
    coarse.addEventListener('change', sync);
    narrow.addEventListener('change', sync);
    return () => {
      coarse.removeEventListener('change', sync);
      narrow.removeEventListener('change', sync);
    };
  }, []);

  // Keep clear of the other fixed bottom controls: the privacy banner (full-width on phones until a choice is made)
  // and the assistant launcher (bottom-right on English routes, shown after the first screenful). Measured, not
  // guessed, so the float lifts exactly as high as needed (--zf-lift) and drops back when they go.
  useEffect(() => {
    if (hidden) {
      setOpen(false);
      return;
    }
    const root = rootRef.current;
    if (!root) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const mine = root.getBoundingClientRect();
      let lift = 0;
      for (const obstacle of document.querySelectorAll<HTMLElement>(OBSTACLES)) {
        if (obstacle.hidden) continue;
        const box = obstacle.getBoundingClientRect();
        if (box.height === 0 || box.right <= mine.left || box.left >= mine.right) continue;
        lift = Math.max(lift, Math.ceil(window.innerHeight - box.top) + 8);
      }
      setLift(lift);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };
    measure();
    // The assistant mounts lazily and toggles `hidden` on scroll; the banner shrinks after consent.
    const mutations = new MutationObserver(schedule);
    mutations.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden', 'class'] });
    window.addEventListener('resize', schedule);
    window.addEventListener('scroll', schedule, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      mutations.disconnect();
      window.removeEventListener('resize', schedule);
      window.removeEventListener('scroll', schedule);
    };
  }, [hidden]);

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) launcherRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab' || !cardRef.current) return;
      const focusable = Array.from(cardRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !cardRef.current.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !cardRef.current.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) close(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open, close]);

  const onLauncherClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (direct) return; // phones: follow the tracked link
    event.preventDefault();
    setOpen((value) => !value);
  };

  if (hidden) return null;

  // The bottom offset animates only after the first measurement, so the float never slides across the banner on load.
  const style = { '--zf-lift': `${lift ?? 0}px`, transition: lift === null ? undefined : 'bottom .25s' } as CSSProperties;

  return (
    <div ref={rootRef} data-zalo-float="" className="zf" style={style}>
      {open ? (
        <div
          ref={cardRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          data-zalo-float-card=""
          className="zf-c"
        >
          <p id={titleId} className="zf-t">{t.title}</p>
          <button ref={closeRef} type="button" className="zf-x" aria-label={t.close} onClick={() => close()}>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <img src={ZALO_QR_IMAGE} width={208} height={208} alt={t.qrAlt} className="zf-q" />
          <p id={descriptionId} className="zf-s">
            {t.scan} · <b>{ZALO_DISPLAY_NUMBER}</b>
          </p>
          <a href={href} target="_blank" rel="noopener noreferrer" data-zalo-float-open="" className="zf-o">
            {t.open}
          </a>
        </div>
      ) : null}
      <a
        ref={launcherRef}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        data-zalo-float-launcher=""
        aria-label={t.launcher}
        {...(direct ? {} : { 'aria-haspopup': 'dialog' as const, 'aria-expanded': open })}
        onClick={onLauncherClick}
        className="zf-l"
      >
        <span className="zf-r" aria-hidden="true" />
        <span className="zf-r zf-r2" aria-hidden="true" />
        <span className="zf-d"><ZaloMark /></span>
        <span className="zf-p">{t.pill}</span>
      </a>
    </div>
  );
}
