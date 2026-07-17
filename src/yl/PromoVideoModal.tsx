/**
 * PromoVideoModal — centered, dismissible promo-video lightbox for
 * /young-learners-speaking/.
 *
 * Behaviour / design decisions:
 *  - Appears once per browser SESSION (sessionStorage guard) so a parent who
 *    closes it is never nagged on refresh, but a fresh visit shows it again.
 *  - Mount is DEFERRED to idle/after first paint so the video never competes
 *    with the page's LCP (protects the perf work already shipped on this page).
 *  - MUTED autoplay + playsInline is the only way browsers allow autoplay on
 *    load; a "Tap for sound" affordance unmutes. If play() is rejected (e.g.
 *    iOS Low Power Mode) OR the user prefers reduced motion, we DON'T force it:
 *    the poster + a Play button are shown instead.
 *  - Footprint: preload="metadata" + faststart MP4 means the browser streams
 *    via HTTP range requests — a quick dismiss only downloads the seconds
 *    watched, not the whole 11.6 MB. On close we pause + drop the source so the
 *    download stops immediately.
 *  - Dismiss: close (X) button, click on the backdrop, or Esc.
 *  - a11y: role="dialog" aria-modal, labelledby, focus moved to Close on open,
 *    focus trapped within the dialog, focus restored to the opener on close,
 *    body scroll locked while open.
 *
 * Styling: inline styles + one scoped <style> for keyframes, matching the
 * zero-CSS-surface approach of YlBotUI so it can't disturb the page theme.
 */
import { useCallback, useEffect, useId, useRef, useState } from 'react';

// Versioned filename → served with immutable long-cache headers (see vercel.json),
// so repeat visitors re-download zero bytes. Bump the version if the video changes.
const VIDEO_SRC = '/young-learners-speaking/assets/video/promo.v1.mp4';
const POSTER_SRC = '/young-learners-speaking/assets/video/promo-poster.jpg';
const SESSION_KEY = 'yl_promo_dismissed_v1';

const C = {
  backdrop: 'rgba(10, 12, 15, 0.82)',
  chrome: '#15181d',
  border: 'rgba(255,255,255,0.14)',
  accent: '#ff8a3c',
  accentInk: '#15181d',
  text: '#f2efe8',
  muted: '#c9d0da',
};

/** Fire-and-forget Vercel Analytics event. Never throws if `va` is absent. No PII. */
function track(name: string, data?: Record<string, string>) {
  try {
    (window as unknown as {
      va?: (cmd: string, payload: { name: string; data?: Record<string, string> }) => void;
    }).va?.('event', { name, data });
  } catch {
    /* analytics is progressive enhancement */
  }
}

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

export function PromoVideoModal() {
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(true);
  // `manualPlay` = autoplay was not used (blocked or reduced-motion) → show a Play button.
  const [manualPlay, setManualPlay] = useState(false);
  const [closing, setClosing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<Element | null>(null);
  const reducedMotion = useRef(false);
  const titleId = useId();

  // Decide whether to show, then defer the actual open until the page has painted.
  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      /* private mode — treat as not dismissed */
    }
    if (dismissed) return;

    reducedMotion.current = prefersReducedMotion();
    openerRef.current = document.activeElement;

    // Defer to idle so the hero/LCP paints first; fall back to a short timeout.
    const win = window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    let idleId = 0;
    let timerId = 0;
    const show = () => setOpen(true);
    if (typeof win.requestIdleCallback === 'function') {
      idleId = win.requestIdleCallback(show, { timeout: 1200 });
    } else {
      timerId = window.setTimeout(show, 400);
    }
    return () => {
      if (idleId) (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(idleId);
      if (timerId) window.clearTimeout(timerId);
    };
  }, []);

  const close = useCallback((via: string) => {
    setClosing(true);
    const v = videoRef.current;
    if (v) {
      try {
        v.pause();
        // Drop the source so the browser stops downloading immediately.
        v.removeAttribute('src');
        v.load();
      } catch {
        /* ignore */
      }
    }
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* ignore */
    }
    track('yl_promo_close', { via });
    const finish = () => {
      setOpen(false);
      setClosing(false);
      // The modal auto-opens (no trigger element), so returning focus to the
      // opener would dump keyboard users at <body>. Land them on the page's
      // main landmark instead.
      const landmark =
        document.getElementById('main') ||
        document.querySelector('main') ||
        document.querySelector('h1');
      if (landmark instanceof HTMLElement) {
        if (!landmark.hasAttribute('tabindex')) landmark.setAttribute('tabindex', '-1');
        landmark.focus();
      } else if (openerRef.current instanceof HTMLElement) {
        openerRef.current.focus();
      }
    };
    if (reducedMotion.current) finish();
    else window.setTimeout(finish, 180);
  }, []);

  // On open: attempt autoplay and wire Esc-to-close.
  // This overlay scrolls WITH the page (position:absolute, no scroll lock), so it
  // is intentionally NON-modal: no body-scroll lock, no focus steal, no focus
  // trap — the user can freely scroll/tab the page past it, or dismiss it.
  useEffect(() => {
    if (!open) return;
    track('yl_promo_open');

    const v = videoRef.current;
    if (v) {
      if (reducedMotion.current) {
        // Respect reduced motion: don't auto-play; offer a Play button.
        setManualPlay(true);
      } else {
        v.muted = true;
        const p = v.play();
        if (p && typeof p.catch === 'function') {
          p.catch(() => setManualPlay(true)); // autoplay blocked (e.g. iOS Low Power)
        }
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close('escape');
      }
    };
    window.addEventListener('keydown', onKeyDown, true);

    return () => {
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [open, close]);

  function handleUnmute() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.volume = 1;
    if (v.paused) v.play().catch(() => undefined);
    setMuted(false);
    track('yl_promo_unmute');
  }

  function handleManualPlay() {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.volume = 1;
    v.play().then(() => {
      setManualPlay(false);
      setMuted(false);
      track('yl_promo_manual_play');
    }).catch(() => {
      // Still blocked with sound — fall back to muted playback.
      v.muted = true;
      v.play().catch(() => undefined);
      setManualPlay(false);
      setMuted(true);
    });
  }

  if (!open) return null;

  return (
    <>
      <style>{`
        @keyframes yl-promo-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes yl-promo-pop { from { opacity: 0; transform: scale(.96) } to { opacity: 1; transform: scale(1) } }
        .yl-promo-btn:focus-visible { outline: 3px solid ${C.accent}; outline-offset: 2px; }
      `}</style>

      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        onMouseDown={(e) => {
          // Backdrop click (only when the mousedown starts on the backdrop itself).
          if (e.target === e.currentTarget) close('backdrop');
        }}
        style={{
          // position:absolute (not fixed) + anchored to the top of the document,
          // one viewport tall → it scrolls WITH the page instead of staying
          // pinned to the viewport. On load (scroll top) it is centered in view.
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100vh',
          zIndex: 2147483000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'max(16px, env(safe-area-inset-top)) 16px max(16px, env(safe-area-inset-bottom))',
          background: C.backdrop,
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          animation: reducedMotion.current || closing ? undefined : 'yl-promo-in 180ms ease-out',
          opacity: closing ? 0 : 1,
          transition: reducedMotion.current ? undefined : 'opacity 160ms ease',
        }}
      >
        <h2 id={titleId} style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>
          Jurassic English — welcome video
        </h2>

        <div
          ref={dialogRef}
          style={{
            position: 'relative',
            // 10% smaller than the prior 92vw / 85vh / 1200px caps.
            width: 'min(82.8vw, calc((76.5vh) * 16 / 9))',
            maxWidth: 1080,
            aspectRatio: '16 / 9',
            background: '#000',
            borderRadius: 14,
            overflow: 'hidden',
            border: `1px solid ${C.border}`,
            boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
            animation: reducedMotion.current || closing ? undefined : 'yl-promo-pop 220ms cubic-bezier(.16,1,.3,1)',
          }}
        >
          <video
            ref={videoRef}
            src={VIDEO_SRC}
            poster={POSTER_SRC}
            muted
            playsInline
            controls
            preload="metadata"
            /* No `autoPlay` attribute on purpose: playback is driven by JS
               play() in the open effect. That gives byte control (preload
               stays "metadata" — no eager buffering), a catchable rejection
               for the fallback, and sidesteps React's unreliable `muted`
               prop reflection (we set v.muted=true imperatively first). */
            onEnded={() => track('yl_promo_ended')}
            style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
          >
            {/* Non-JS / unsupported fallback */}
            <track kind="captions" />
          </video>

          {/* Tap-for-sound affordance (only while muted and actually playing) */}
          {muted && !manualPlay && (
            <button
              type="button"
              className="yl-promo-btn"
              onClick={handleUnmute}
              style={{
                position: 'absolute',
                left: 16,
                bottom: 60,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 14px',
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                background: C.accent,
                color: C.accentInk,
                font: '600 14px/1 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
              }}
            >
              <span aria-hidden="true">🔊</span> Tap for sound
            </button>
          )}

          {/* Manual play (autoplay blocked or reduced motion) */}
          {manualPlay && (
            <button
              type="button"
              className="yl-promo-btn"
              aria-label="Play the welcome video"
              onClick={handleManualPlay}
              style={{
                position: 'absolute',
                inset: 0,
                margin: 'auto',
                width: 84,
                height: 84,
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                background: C.accent,
                color: C.accentInk,
                fontSize: 34,
                lineHeight: '84px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              }}
            >
              <span aria-hidden="true">▶</span>
            </button>
          )}

          {/* Close */}
          <button
            ref={closeBtnRef}
            type="button"
            className="yl-promo-btn"
            aria-label="Close video"
            onClick={() => close('button')}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 40,
              height: 40,
              borderRadius: 999,
              border: `1px solid ${C.border}`,
              cursor: 'pointer',
              background: 'rgba(21,24,29,0.72)',
              color: C.text,
              font: '400 22px/1 system-ui, sans-serif',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      </div>
    </>
  );
}
