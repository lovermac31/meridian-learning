"use client";

/**
 * Trigger for announced-but-not-ready items. Shows the site-wide small, temporary "Coming soon" toast (same look
 * as the main site's ComingSoonToast): non-blocking, role=status, auto-dismiss 6 s, paused on hover/focus,
 * closes on × or Escape.
 */
import { useCallback, useEffect, useRef, useState } from "react";

export const CONTACT_EMAIL = "info@jurassicenglish.com";
const DISMISS_MS = 6000;

export function ComingSoonButton({ label, className, children }: { label: string; className?: string; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const paused = useRef(false);
  const close = useCallback(() => { window.clearTimeout(timer.current); setOpen(false); }, []);
  const arm = useCallback(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => { if (!paused.current) setOpen(false); }, DISMISS_MS);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <>
      <button type="button" className={className} onClick={() => { paused.current = false; setOpen(true); arm(); }}>
        {children ?? label}
      </button>
      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-[70] flex justify-center px-4">
        {open ? (
          <div
            onMouseEnter={() => { paused.current = true; window.clearTimeout(timer.current); }}
            onMouseLeave={() => { paused.current = false; arm(); }}
            className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border border-white/10 bg-[#101820]/95 px-4 py-3.5 text-left text-white shadow-[0_18px_50px_rgba(0,0,0,0.4)] backdrop-blur-md"
          >
            <span className="mt-0.5 shrink-0 rounded-full bg-[#F26419] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">Coming soon</span>
            <p className="flex-1 text-sm leading-snug text-white/85">
              <strong className="font-semibold text-white">{label} · </strong>Coming very soon. For more information, email{" "}
              <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(label)}`} className="font-semibold text-[#F26419] underline-offset-4 hover:underline">{CONTACT_EMAIL}</a>
            </p>
            <button type="button" onClick={close} aria-label="Dismiss" className="-mr-1 shrink-0 rounded-md px-1 text-white/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26419]">×</button>
          </div>
        ) : null}
      </div>
    </>
  );
}
