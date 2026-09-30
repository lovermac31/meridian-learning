"use client";

/**
 * "Coming very soon" trigger + dialog for announced-but-not-ready items (site-wide rule: nothing that is not ready
 * may look like a working link). Native <dialog> gives focus trap + Escape; focus returns to the trigger on close.
 */
import { useRef } from "react";

export const CONTACT_EMAIL = "info@jurassicenglish.com";

export function ComingSoonButton({ label, className, children }: { label: string; className?: string; children?: React.ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const close = () => { dialogRef.current?.close(); triggerRef.current?.focus(); };
  return (
    <>
      <button ref={triggerRef} type="button" className={className} onClick={() => dialogRef.current?.showModal()}>
        {children ?? label}
      </button>
      <dialog
        ref={dialogRef}
        aria-label={`${label} — coming very soon`}
        onClick={(e) => { if (e.target === dialogRef.current) close(); }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-white/10 bg-[#101820] p-0 text-white shadow-[0_30px_70px_rgba(0,0,0,0.45)] backdrop:bg-[#101820]/80 backdrop:backdrop-blur-sm"
      >
        <div className="p-7 text-left">
          <div className="mb-2 inline-flex rounded-full bg-[#F26419] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white">
            Coming very soon
          </div>
          <h2 className="text-xl font-semibold tracking-tight">{label}</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/75">
            This is coming very soon. For more information, email{" "}
            <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(label)}`} className="font-semibold text-[#F26419] underline-offset-4 hover:underline">
              {CONTACT_EMAIL}
            </a>.
          </p>
          <div className="mt-6 flex justify-end">
            <button type="button" autoFocus onClick={close}
              className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26419]">
              Close
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
