"use client";

/**
 * Production-style header for ecosystem-landing pages
 * ─────────────────────────────────────────────────────────────────────────────
 * Visually + behaviorally mirrors the production Jurassic English™ Navbar
 * (`src/components/Navbar.tsx` in the root Vite app) so that users coming
 * from the homepage to a rewritten ecosystem page (/student-academy,
 * /school-framework, /digital-reasoning-engine, /interactive-demo,
 * /evidence, /book-diagnostic) feel they are still on JurassicEnglish.com.
 *
 * Match contract (from production):
 *   - dark background (`bg-jurassic-dark/85`) when scrolled, transparent on top
 *   - Neuland-Inline wordmark, 24px, white
 *   - ™ in jurassic-accent orange, 12px, vertical-align top
 *   - desktop nav: gap-6, white/80 links, lg breakpoint
 *   - Education Affiliate Program: gold accent (jurassic-gold)
 *   - Get Started: rounded-full, bg-jurassic-accent CTA
 *   - mobile hamburger + drawer, same dark surface
 *   - English / Tiếng Việt toggle right-aligned
 *
 * This component does NOT import anything from the root Vite app — root and
 * ecosystem-landing are separate apps; cross-app component reuse is unsafe.
 * Instead, the visual + behavioral contract is replicated.
 *
 * "Education Affiliate Program" and "Plans & Pricing" route to
 * https://www.jurassicenglish.com so that the production homepage handles
 * their respective modals (the source of truth for those flows).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

const PROD_HOST = "https://www.jurassicenglish.com";

// Internal ecosystem routes (kept as relative paths so they stay clean
// under jurassicenglish.com/<route> via Vercel rewrites).
const STUDENT_ACADEMY_PATH = "/student-academy";

// Production homepage anchors for the shared marketing sections. Absolute so
// they always resolve to the homepage regardless of which rewritten ecosystem
// page the user is on.
const NAV_ANCHORS = [
  { name: "About",            href: `${PROD_HOST}/#about` },
  { name: "Framework",        href: `${PROD_HOST}/#framework` },
  { name: "Series",           href: `${PROD_HOST}/#series` },
  { name: "Student Academy",  href: STUDENT_ACADEMY_PATH },
  { name: "Services",         href: `${PROD_HOST}/#training` },
  { name: "Contact",          href: `${PROD_HOST}/#contact` },
] as const;

const EDU_AFFILIATE_LABEL = "Education Affiliate Program";
const PRICING_HREF = `${PROD_HOST}/#plans-pricing`;
const PRICING_LABEL = "Plans & Pricing";
const GET_STARTED_HREF = `${PROD_HOST}/get-started`;
const GET_STARTED_LABEL = "Get Started";

const EN_HREF = `${PROD_HOST}/`;
const VI_HREF = `${PROD_HOST}/vi`;

// ─── Internal vs. external link decision ─────────────────────────────────────
//
// /student-academy stays relative because it's served via the root rewrite.
// All other top-level marketing sections live on the production homepage.

function isInternal(href: string): boolean {
  return href.startsWith("/") && !href.startsWith("//");
}

// ─── Header component ────────────────────────────────────────────────────────

export function ProductionStyleHeader() {
  const pathname = usePathname() ?? "/";
  const [isSolid, setIsSolid] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const drawerHeadingId = useId();
  const comingSoonHeadingId = useId();

  // Scroll → solid background (matches root: solid after first scroll)
  useEffect(() => {
    const onScroll = () => {
      setIsSolid(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-close mobile drawer on route change
  const lastPathnameRef = useRef(pathname);
  useEffect(() => {
    if (lastPathnameRef.current !== pathname && isMobileOpen) {
      setIsMobileOpen(false);
    }
    lastPathnameRef.current = pathname;
  }, [pathname, isMobileOpen]);

  // Drawer body-scroll lock + Escape + click-outside + focus management.
  // Phase 8 — added initial-focus into drawer on open and Tab focus-trap.
  // The drawer carries `aria-modal="true"`, so per WAI-ARIA Authoring
  // Practices keyboard focus must be confined inside it. Mirrors the
  // working pattern in `MobileNav.tsx`.
  useEffect(() => {
    if (!isMobileOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const triggerAtOpen = triggerRef.current;

    const getFocusables = () =>
      Array.from(
        drawerRef.current?.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        ) || [],
      );

    // Move focus into the drawer on next frame so the rendered DOM is
    // ready and the focus ring becomes visible to the user.
    const rafId = window.requestAnimationFrame(() => {
      getFocusables()[0]?.focus();
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsMobileOpen(false);
        return;
      }
      if (e.key === "Tab") {
        const focusables = getFocusables();
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      if (drawerRef.current?.contains(t)) return;
      if (triggerRef.current?.contains(t)) return;
      setIsMobileOpen(false);
    };
    const t = window.setTimeout(
      () => document.addEventListener("mousedown", onClick),
      0,
    );
    document.addEventListener("keydown", onKey);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
      document.body.style.overflow = previousOverflow;
      triggerAtOpen?.focus();
    };
  }, [isMobileOpen]);

  // Coming Soon modal — Escape + click-outside
  useEffect(() => {
    if (!isComingSoonOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsComingSoonOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isComingSoonOpen]);

  // Render helper for nav anchors (internal Link vs external <a>)
  const renderNavLink = (
    item: { name: string; href: string },
    onClick?: () => void,
    extraClassName = "",
  ) => {
    const className = [
      "rounded-md text-sm font-medium text-white/80 hover:text-white hover:underline underline-offset-4 decoration-jurassic-accent transition-all duration-300",
      // Phase 8 — keyboard focus indicator was missing on every desktop
      // nav link, leaving keyboard users without a visible focus state.
      // jurassic-accent ring matches the wordmark hover-accent and is
      // visible against the dark header backdrop.
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#101820]",
      extraClassName,
    ]
      .filter(Boolean)
      .join(" ");

    if (isInternal(item.href)) {
      return (
        <Link
          key={item.name}
          href={item.href}
          onClick={onClick}
          className={className}
          aria-current={
            pathname === item.href ? "page" : undefined
          }
        >
          {item.name}
        </Link>
      );
    }
    return (
      <a
        key={item.name}
        href={item.href}
        onClick={onClick}
        className={className}
      >
        {item.name}
      </a>
    );
  };

  return (
    <>
      {/*
        Always-solid dark header. Production homepage uses a transparent-
        at-top + solid-on-scroll pattern, but that relies on a dark body
        background everywhere. Several rewritten ecosystem pages
        (/book-diagnostic, /school-framework heroes, etc.) have parchment
        backgrounds — white wordmark/links over parchment are invisible.
        Always-solid keeps the header readable on every ecosystem route
        while still matching the production *scrolled* visual state.
      */}
      <nav
        className={[
          "fixed top-0 w-full z-50 transition-all duration-500",
          "bg-jurassic-dark/95 backdrop-blur-md border-b border-white/5",
          // Vertical padding matches the production homepage exactly:
          // py-6 (24px) at scrollY=0, transitioning to py-4 (16px) on scroll.
          // Production homepage measured 86px → 68px nav height across the
          // same transition; matching those values keeps the perceived
          // header weight aligned with the rest of the brand.
          isSolid
            ? "shadow-[0_8px_30px_rgb(0,0,0,0.12)] py-4"
            : "py-6",
        ].join(" ")}
        aria-label="Site"
      >
        <div className="max-w-[1480px] mx-auto px-6 flex justify-between items-center">
          {/* Wordmark */}
          <div className="flex items-center gap-2">
            <a
              href={PROD_HOST}
              className="rounded-md px-1 py-0.5 text-2xl font-display tracking-tight text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent/90 focus-visible:ring-offset-2 focus-visible:ring-offset-[#101820]"
              aria-label="Jurassic English home"
            >
              Jurassic English<span className="text-xs align-top text-jurassic-accent">™</span>
            </a>
          </div>

          {/* Desktop nav */}
          {/*
            Desktop Nav — show at >=xl (1280) with tight gap, restore gap-6
            at >=2xl (1536). Below xl, the hamburger drawer takes over
            because the 11-item right cluster (~917px of items + 10 gaps)
            overflows when combined with the wordmark + container padding.
            Same breakpoint strategy is mirrored in the root Vite Navbar
            (src/components/Navbar.tsx) so the homepage and the rewritten
            ecosystem pages always behave identically across viewports.
          */}
          <div className="hidden xl:flex items-center xl:gap-2 2xl:gap-6">
            {NAV_ANCHORS.map((item) => renderNavLink(item))}

            <button
              type="button"
              onClick={() => setIsComingSoonOpen(true)}
              className="rounded-md text-sm font-semibold text-jurassic-gold/80 hover:text-jurassic-gold hover:underline underline-offset-4 decoration-jurassic-gold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#101820]"
            >
              {EDU_AFFILIATE_LABEL}
            </button>

            <a
              href={PRICING_HREF}
              className="rounded-md text-sm font-medium text-white/80 hover:text-white hover:underline underline-offset-4 decoration-jurassic-accent transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#101820]"
            >
              {PRICING_LABEL}
            </a>

            <a
              href={GET_STARTED_HREF}
              className="bg-jurassic-accent text-white px-5 py-2 rounded-full text-sm font-bold hover:opacity-95 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#101820]"
            >
              {GET_STARTED_LABEL}
            </a>

            {/*
              Language toggle: rendered as TWO separate flex children of the
              gap-6 right cluster — matches production homepage (no divider,
              no separator dot). "English" gets the orange-pill active-state
              treatment, "Tiếng Việt" sits inactive in the same pill shape.
              See: jurassicenglish.com/ — items #9 and #10 of nav.
            */}
            <a
              href={EN_HREF}
              aria-current="page"
              className="bg-jurassic-accent text-white px-3 py-1.5 rounded-full text-xs font-semibold hover:opacity-95 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#101820]"
            >
              English
            </a>
            <a
              href={VI_HREF}
              className="text-white/70 hover:text-white px-3 py-1.5 rounded-full text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#101820]"
            >
              Tiếng Việt
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setIsMobileOpen((v) => !v)}
            aria-expanded={isMobileOpen}
            aria-controls="ecosystem-mobile-nav"
            aria-label={
              isMobileOpen ? "Close navigation menu" : "Open navigation menu"
            }
            className="xl:hidden text-white inline-flex h-10 w-10 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent"
          >
            {isMobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>

        {/* Mobile drawer */}
        {isMobileOpen ? (
          <div
            ref={drawerRef}
            id="ecosystem-mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-labelledby={drawerHeadingId}
            className="absolute top-full left-0 w-full max-h-[calc(100vh-5rem)] overflow-y-auto overscroll-contain bg-jurassic-dark/95 backdrop-blur-lg border-b border-white/5 py-6 px-6 flex flex-col gap-4 xl:hidden shadow-xl"
          >
            <h2 id={drawerHeadingId} className="sr-only">
              Site navigation
            </h2>

            {/* Phase 8 — focus-visible rings added to every drawer item so
                keyboard users see where focus is while the drawer is open
                (focus-trap effect above keeps Tab inside the drawer). */}
            {NAV_ANCHORS.map((item) =>
              isInternal(item.href) ? (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="rounded-md text-lg font-medium text-white/90 hover:text-jurassic-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#101820]"
                >
                  {item.name}
                </Link>
              ) : (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="rounded-md text-lg font-medium text-white/90 hover:text-jurassic-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#101820]"
                >
                  {item.name}
                </a>
              ),
            )}

            <button
              type="button"
              onClick={() => {
                setIsMobileOpen(false);
                setIsComingSoonOpen(true);
              }}
              className="rounded-md text-left text-lg font-semibold text-jurassic-gold/90 hover:text-jurassic-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#101820]"
            >
              {EDU_AFFILIATE_LABEL}
            </button>

            <a
              href={PRICING_HREF}
              onClick={() => setIsMobileOpen(false)}
              className="rounded-md text-lg font-medium text-white/90 hover:text-jurassic-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#101820]"
            >
              {PRICING_LABEL}
            </a>

            <a
              href={GET_STARTED_HREF}
              onClick={() => setIsMobileOpen(false)}
              className="bg-jurassic-accent text-white px-5 py-3 rounded-xl text-center font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#101820]"
            >
              {GET_STARTED_LABEL}
            </a>

            <div className="pt-4 border-t border-white/10 flex items-center gap-4">
              <a
                href={EN_HREF}
                onClick={() => setIsMobileOpen(false)}
                className="rounded-md text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#101820]"
              >
                English
              </a>
              <a
                href={VI_HREF}
                onClick={() => setIsMobileOpen(false)}
                className="rounded-md text-sm font-semibold text-white/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#101820]"
              >
                Tiếng Việt
              </a>
            </div>
          </div>
        ) : null}
      </nav>

      {/* Spacer so first section content doesn't sit under the fixed nav */}
      <div aria-hidden="true" className="h-[88px] lg:h-[96px]" />

      {/* Coming Soon modal — Education Affiliate Program */}
      {isComingSoonOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={comingSoonHeadingId}
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
        >
          <div
            aria-hidden="true"
            onClick={() => setIsComingSoonOpen(false)}
            className="absolute inset-0 bg-jurassic-dark/80 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-jurassic-dark p-7 text-white shadow-[0_30px_70px_rgba(0,0,0,0.45)]">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-jurassic-gold/40 bg-jurassic-gold/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-jurassic-gold">
              Coming soon
            </div>
            <h2
              id={comingSoonHeadingId}
              className="text-xl font-semibold tracking-tight"
            >
              Education Affiliate Program
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/75">
              The Education Affiliate Program is launching with selected
              partners. Check back soon, or write to{" "}
              <a
                href="mailto:info@jurassicenglish.com"
                className="text-jurassic-accent underline-offset-4 hover:underline"
              >
                info@jurassicenglish.com
              </a>{" "}
              to register interest.
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsComingSoonOpen(false)}
                className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent"
                autoFocus
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

// (Language toggle is rendered inline above as two flex children of the
//  gap-6 right cluster, matching the production homepage exactly. No
//  separate component needed.)

export default ProductionStyleHeader;
