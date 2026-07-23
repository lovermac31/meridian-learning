/**
 * Explicit promo-video lightbox for /young-learners-speaking/.
 *
 * The video is intentionally visitor-initiated. Nothing opens or downloads on
 * page load, which keeps the hero readable and avoids competing with its LCP.
 */
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Play, Volume2, X } from 'lucide-react';
import { getLang, subscribeLang, t, type Lang } from './i18n';

const VIDEO_SRC = '/young-learners-speaking/assets/video/promo.v1.mp4';
const POSTER_SRC = '/young-learners-speaking/assets/video/promo-poster.jpg';

const C = {
  backdrop: 'rgba(10, 12, 15, 0.78)',
  chrome: '#15181d',
  border: 'rgba(255,255,255,0.18)',
  accent: '#ff8a3c',
  accentInk: '#15181d',
  text: '#f2efe8',
};

function track(name: string, data?: Record<string, string>) {
  try {
    (
      window as unknown as {
        va?: (cmd: string, payload: { name: string; data?: Record<string, string> }) => void;
      }
    ).va?.('event', { name, data });
  } catch {
    /* Analytics is progressive enhancement. */
  }
}

function useLang(): Lang {
  const [lang, setLang] = useState<Lang>(() => getLang());

  useEffect(() => subscribeLang(setLang), []);
  return lang;
}

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

export function PromoVideoModal() {
  const lang = useLang();
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  const close = useCallback((via: string) => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
    }
    setOpen(false);
    track('yl_promo_close', { via });
    window.setTimeout(() => triggerRef.current?.focus(), 0);
  }, []);

  const show = () => {
    setMuted(true);
    setOpen(true);
    track('yl_promo_open', { via: 'hero_button' });
  };

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const video = videoRef.current;
    if (video && !prefersReducedMotion()) {
      video.muted = true;
      video.play().catch(() => undefined);
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close('escape');
        return;
      }

      if (event.key !== 'Tab' || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), video[controls], [href], [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [close, open]);

  const triggerTarget =
    typeof document === 'undefined' ? null : document.getElementById('yl-promo-root');

  const trigger = (
    <button
      ref={triggerRef}
      type="button"
      className="btn ghost yl-promo-trigger"
      onClick={show}
    >
      <Play aria-hidden="true" size={17} strokeWidth={2.5} />
      {t('promo.watch', lang)}
    </button>
  );

  const dialog =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) close('backdrop');
            }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 2147483000,
              display: 'grid',
              placeItems: 'center',
              padding:
                'max(16px, env(safe-area-inset-top)) 16px max(16px, env(safe-area-inset-bottom))',
              background: C.backdrop,
              backdropFilter: 'blur(5px)',
              WebkitBackdropFilter: 'blur(5px)',
            }}
          >
            <style>{`
              .yl-promo-control:focus-visible {
                outline: 3px solid ${C.accent};
                outline-offset: 3px;
              }
            `}</style>
            <div
              ref={dialogRef}
              style={{
                position: 'relative',
                width: 'min(1080px, 94vw, calc(82vh * 16 / 9))',
                aspectRatio: '16 / 9',
                overflow: 'hidden',
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                background: C.chrome,
                boxShadow: '0 30px 80px rgba(0,0,0,0.62)',
              }}
            >
              <h2
                id={titleId}
                style={{
                  position: 'absolute',
                  width: 1,
                  height: 1,
                  overflow: 'hidden',
                  clip: 'rect(0 0 0 0)',
                  whiteSpace: 'nowrap',
                }}
              >
                {t('promo.title', lang)}
              </h2>

              <video
                ref={videoRef}
                src={VIDEO_SRC}
                poster={POSTER_SRC}
                muted
                playsInline
                controls
                preload="none"
                aria-label={t('promo.play', lang)}
                onEnded={() => track('yl_promo_ended')}
                style={{
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  background: C.chrome,
                }}
              >
                <track kind="captions" />
              </video>

              {muted && (
                <button
                  type="button"
                  className="yl-promo-control"
                  onClick={() => {
                    const video = videoRef.current;
                    if (!video) return;
                    video.muted = false;
                    video.volume = 1;
                    video.play().catch(() => undefined);
                    setMuted(false);
                    track('yl_promo_unmute');
                  }}
                  style={{
                    position: 'absolute',
                    left: 14,
                    bottom: 58,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '9px 12px',
                    border: 0,
                    borderRadius: 7,
                    background: C.accent,
                    color: C.accentInk,
                    font: '700 13px/1 system-ui, sans-serif',
                    cursor: 'pointer',
                  }}
                >
                  <Volume2 aria-hidden="true" size={17} />
                  {t('promo.sound', lang)}
                </button>
              )}

              <button
                ref={closeRef}
                type="button"
                className="yl-promo-control"
                aria-label={t('promo.close', lang)}
                onClick={() => close('button')}
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  width: 42,
                  height: 42,
                  display: 'grid',
                  placeItems: 'center',
                  border: `1px solid ${C.border}`,
                  borderRadius: 7,
                  background: 'rgba(21,24,29,0.84)',
                  color: C.text,
                  cursor: 'pointer',
                }}
              >
                <X aria-hidden="true" size={22} />
              </button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      {triggerTarget ? createPortal(trigger, triggerTarget) : null}
      {dialog}
    </>
  );
}
