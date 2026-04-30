"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { track } from "@vercel/analytics";

// Phase 12 Task B — Mobile-only sticky conversion bar.
//
// Visibility: hidden on lg and up (`lg:hidden`). The /interactive-demo page
// is the only place this is mounted; the production-style header on
// /student-academy already has its own conversion bar pattern, and BotUI
// is scoped to /student-academy only — so on /interactive-demo this bar
// has no on-screen conflicts.
//
// Behaviour: a single anchor link to /book-diagnostic. Safe-area aware
// (iOS notch). Sprint 3C upgrades this to a client component so the
// click can be tracked via @vercel/analytics — no data capture beyond
// the click event itself, no PII, no localStorage.

export function MobileStickyConvBar() {
  return (
    <div
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-primary text-primary-foreground border-t border-white/10 shadow-[0_-12px_32px_-12px_rgba(0,0,0,0.45)]"
      role="region"
      aria-label="Quick action: Book a Student Thinking Diagnostic"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <p className="text-[13px] font-semibold leading-tight">
          Find the right starting level.
        </p>
        <Link
          href="/book-diagnostic"
          onClick={() => {
            // Sprint 3C — fire before navigation so the beacon flushes.
            // No properties beyond the event name (the source page is
            // implicit — this bar only mounts on /interactive-demo).
            track("interactive_demo_mobile_sticky_clicked");
          }}
          // Phase 8 — added focus-visible ring (was missing, so keyboard
          // users had no visible focus state on the only CTA in this bar).
          // Ring color matches the bar's bg-primary backdrop the same way
          // the StudentAcademyMobileStickyCTA pattern does.
          className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-[13px] font-bold text-white shadow-[0_8px_20px_-8px_rgba(242,100,25,0.6)] hover:bg-accent/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          Book Diagnostic
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

export default MobileStickyConvBar;
