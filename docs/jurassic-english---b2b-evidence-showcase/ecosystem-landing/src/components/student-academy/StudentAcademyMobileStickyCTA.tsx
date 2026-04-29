"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { track } from "@vercel/analytics";

// Phase 5 Sprint B — Mobile-only sticky conversion bar for /student-academy.
//
// Two thumb-reachable actions for parents on long-scroll mobile views:
//   1. "Try Demo"        → /interactive-demo#try-one-thinking-move
//   2. "Book Diagnostic" → /book-diagnostic
//
// Visibility:
//   - Visible below the lg breakpoint (`lg:hidden`).
//   - Hidden at lg and above (desktop has the inline JE_CTA pairs in
//     hero / Quick Start / Demo CTA section / final CTA — no need for a
//     persistent sticky element on wider screens).
//
// Layout choice: 2-row stack on mobile.
//   - Row 1: small centred tagline ("See the thinking first.")
//   - Row 2: 50/50 grid with the orange primary CTA on the left and
//     the parchment-outlined secondary CTA on the right.
//   This avoids cramming 4 elements into a single row at 360px and
//   keeps a calm, premium rhythm. Total bar height ~88px (without
//   safe-area inset).
//
// Coexistence with BotUIChat:
//   - BotUIChat is the only other persistent fixed element on
//     /student-academy. Its mobile launcher sits at the bottom-right
//     corner. To prevent overlap, BotUIChat.tsx was updated in the
//     same commit so the launcher's mobile/tablet bottom offset is
//     `bottom-28` (112px), restoring `bottom-6` only at the lg
//     breakpoint where this sticky bar is hidden.
//
// Hard rules honoured:
//   - No API calls, no Supabase, no localStorage, no PII in analytics.
//   - No fake urgency, no guarantees, no forbidden AI-framing copy.
//     (See claims-policy.md / studentAcademyData.ts for the canonical
//     prohibited-phrase list.)
//   - Tap targets ≥ 44px (`min-h-[44px]`).
//   - Safe-area inset bottom respected via env(safe-area-inset-bottom).

export function StudentAcademyMobileStickyCTA() {
  return (
    <div
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-primary text-primary-foreground border-t border-white/10 shadow-[0_-12px_32px_-12px_rgba(0,0,0,0.45)]"
      role="region"
      aria-label="Quick actions: Try Demo or Book a Student Thinking Diagnostic"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="px-4 pt-3 pb-3">
        <p className="mb-2 text-center text-[12px] font-semibold tracking-tight text-primary-foreground/85">
          See the thinking first.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/interactive-demo#try-one-thinking-move"
            onClick={() => {
              // Sprint 3C convention — fire before navigation so the
              // beacon flushes. No PII; only a discriminator for which
              // CTA was tapped on this single bar.
              track("student_academy_mobile_sticky_clicked", {
                cta: "try_demo",
              });
            }}
            className="inline-flex min-h-[44px] items-center justify-center gap-1 rounded-full bg-accent px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_8px_20px_-8px_rgba(242,100,25,0.6)] transition-colors hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            Try Demo
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
          <Link
            href="/book-diagnostic"
            onClick={() => {
              track("student_academy_mobile_sticky_clicked", {
                cta: "book_diagnostic",
              });
            }}
            className="inline-flex min-h-[44px] items-center justify-center gap-1 rounded-full border border-[#C9A86A]/55 bg-white/5 px-4 py-2.5 text-[13px] font-bold text-primary-foreground transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A86A] focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            Book Diagnostic
          </Link>
        </div>
      </div>
    </div>
  );
}

export default StudentAcademyMobileStickyCTA;
