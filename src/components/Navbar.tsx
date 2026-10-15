import { useState, useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { getOverhaulContent } from '../i18n/content/overhaul';
import { getLocalizedHref } from '../i18n/localizedHref';
import { getCurrentLocale } from '../i18n/routing';
import { getUiString } from '../i18n/ui';
import { trackCtaClick } from '../lib/analytics';

const ROOT_MOBILE_NAV_ID = 'root-mobile-nav';

// Light storybook header (10/10 overhaul). Two-line door links: age + what it is.
const NAV_LINK =
  'whitespace-nowrap rounded-xl px-1 py-1.5 text-[0.95rem] font-semibold text-sb-forest transition hover:text-sb-amber-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-amber focus-visible:ring-offset-2 focus-visible:ring-offset-sb-cream';
// White text only on #B45309 (5.0:1) or forest #1E4D3B (9.4:1), never on #D97706.
const NAV_CTA =
  'inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full bg-sb-amber-deep px-4 py-2 text-[13px] font-bold text-white shadow-warm transition hover:bg-sb-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-forest focus-visible:ring-offset-2 focus-visible:ring-offset-sb-cream';

type NavbarProps = {
  onGetStarted: () => void;
  onNavigateHome: () => void;
  onNavigate: (path: string) => void;
  onPricingClick: () => void;
  onEducationAffiliateClick: () => void;
  isPortalView?: boolean;
  forceSolidBackground?: boolean;
  languageSwitcher?: ReactNode;
};

export const Navbar = ({
  onGetStarted,
  onNavigateHome,
  onNavigate,
  onPricingClick,
  onEducationAffiliateClick,
  isPortalView = false,
  forceSolidBackground = false,
  languageSwitcher,
}: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const locale = getCurrentLocale();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Phase 9 — drawer body-scroll lock + Escape close + click-outside +
  // initial focus into drawer + Tab focus-trap + restore focus on close.
  // Mirrors the working pattern in ecosystem-landing/src/components/MobileNav.tsx
  // shipped in Phase 8.
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const triggerAtOpen = triggerRef.current;

    const getFocusables = () =>
      Array.from(
        drawerRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])',
        ) || [],
      );

    // Move focus into the drawer on next frame so the rendered DOM is
    // ready and the focus ring becomes visible to the user.
    const rafId = window.requestAnimationFrame(() => {
      getFocusables()[0]?.focus();
    });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsMobileMenuOpen(false);
        return;
      }
      if (e.key === 'Tab') {
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

    const onClickOutside = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (!t) return;
      if (drawerRef.current?.contains(t)) return;
      if (triggerRef.current?.contains(t)) return;
      setIsMobileMenuOpen(false);
    };

    // Defer the mousedown listener to the next macrotask so the same
    // click that opened the drawer is not interpreted as a click outside.
    const mousedownTimerId = window.setTimeout(
      () => document.addEventListener('mousedown', onClickOutside),
      0,
    );
    document.addEventListener('keydown', onKey);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(mousedownTimerId);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickOutside);
      document.body.style.overflow = previousOverflow;
      // Restore focus to the hamburger trigger after drawer close.
      triggerAtOpen?.focus();
    };
  }, [isMobileMenuOpen]);

  // Header IA (10/10 overhaul, Oct 2026): four age-based doors, then one
  // primary "Book a Speaking Baseline" CTA that stays visible (sticky header).
  // `route` items go through onNavigate (App.navigateTo); `native` items are
  // pages served outside the SPA (static YL page, AI Speaking app rewrite) or
  // homepage anchors, so they must be real document navigations.
  const overhaul = getOverhaulContent(locale);
  const navItems = overhaul.nav.items;
  // "Book Baseline · 690k₫" → the Live Speaking Baseline booking page (AI Speaking app, native navigation).
  const bookHref = getLocalizedHref(overhaul.nav.ctaHref, locale);
  const bookLabel = overhaul.nav.cta;
  // "New" / "Mới" badge on the IELTS Writing link; the accessible name starts with the visible text (WCAG 2.5.3).
  const badgeFor = (key: string) => (key === 'writing' ? overhaul.nav.newBadge : null);
  const NEW_BADGE = 'ml-1.5 inline-block rounded-full bg-sb-amber-deep px-1.5 align-[1px] text-[11px] font-bold leading-4 text-white';

  const handleNavItemClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    item: (typeof navItems)[number],
  ) => {
    setIsMobileMenuOpen(false);
    if (item.kind === 'native') return;
    event.preventDefault();
    onNavigate(item.href);
  };

  const handleBookClick = (placement: 'desktop' | 'mobile') => {
    setIsMobileMenuOpen(false);
    try {
      trackCtaClick({
        label: placement === 'desktop' ? 'header_book_baseline_click' : 'header_book_baseline_mobile_click',
        type: 'primary',
        segment: 'parent_student',
      });
    } catch {
      /* Measurement must not block navigation. */
    }
  };

  const isSolidNav = forceSolidBackground || isScrolled;

  return (
    <nav className={`fixed top-0 w-full z-50 border-b transition-shadow duration-300 bg-sb-cream/95 backdrop-blur-md ${isSolidNav ? 'border-sb-border shadow-warm' : 'border-transparent'}`}>
      {/* Two balanced clusters on one 72px row, never wrapping: [logo + doors] … [EN | Tiếng Việt + Baseline CTA]. */}
      <div className="max-w-7xl mx-auto h-[72px] px-3 min-[360px]:px-4 sm:px-6 flex flex-nowrap justify-between items-center gap-1.5 min-[360px]:gap-3">
        <div className="flex min-w-0 flex-nowrap items-center gap-6">
        {/* Below 430px the wordmark wraps to two lines (min-content width) so the Baseline CTA never covers it; the row stays one 72px line. */}
        <button
          type="button"
          onClick={() => {
            setIsMobileMenuOpen(false);
            onNavigateHome();
          }}
          className="shrink-0 whitespace-nowrap max-[429px]:w-min max-[429px]:whitespace-normal rounded-md px-1 py-0.5 text-left leading-tight font-wordmark text-[0.875rem] min-[360px]:text-[1.05rem] sm:text-[1.2rem] text-sb-forest transition hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-amber focus-visible:ring-offset-2 focus-visible:ring-offset-sb-cream"
          dir="ltr"
          aria-label={getUiString(locale, 'navbar.brandAriaLabel')}
        >
          Jurassic English<sup className="text-sb-amber-deep">™</sup>
        </button>

        {/* Desktop (>= xl): the four age doors sit beside the logo. */}
        <div className="hidden xl:flex flex-nowrap items-center gap-6">
          {navItems.map((item) => (
            <a
              key={item.key}
              href={getLocalizedHref(item.href, locale)}
              onClick={(event) => handleNavItemClick(event, item)}
              className={NAV_LINK}
              aria-label={`${badgeFor(item.key) ? `${item.label} ${badgeFor(item.key)}` : item.label} · ${item.desc}`}
              title={item.desc}
            >
              {item.label}
              {badgeFor(item.key) ? <>{' '}<span className={NEW_BADGE}>{badgeFor(item.key)}</span></> : null}
            </a>
          ))}
        </div>
        </div>
        <div className="flex shrink-0 flex-nowrap items-center gap-1.5 min-[360px]:gap-2 sm:gap-3">
          <div className="hidden xl:block">{languageSwitcher}</div>
          <a
            href={bookHref}
            onClick={() => handleBookClick('desktop')}
            className={`${NAV_CTA} px-2.5 min-[360px]:px-3 sm:px-5`}
          >
            <span className="hidden sm:inline">{bookLabel}</span>
            <span className="sm:hidden">{overhaul.nav.ctaMobile}</span>
            <ArrowRight aria-hidden="true" className="hidden h-4 w-4 min-[360px]:block" />
          </a>
          <button
            ref={triggerRef}
            type="button"
            className="xl:hidden shrink-0 text-sb-forest inline-flex h-11 w-11 items-center justify-center rounded-full border border-sb-border bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-amber focus-visible:ring-offset-2 focus-visible:ring-offset-sb-cream"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={
              isMobileMenuOpen
                ? getUiString(locale, 'navbar.closeMenu')
                : getUiString(locale, 'navbar.openMenu')
            }
            aria-expanded={isMobileMenuOpen}
            aria-controls={ROOT_MOBILE_NAV_ID}
          >
            {isMobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer: id, role="dialog", aria-modal; the effect above wires
          Escape, click-outside, scroll lock, focus trap and focus restore. */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={drawerRef}
            id={ROOT_MOBILE_NAV_ID}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="absolute top-full left-0 w-full max-h-[calc(100vh-4.5rem)] overflow-y-auto overscroll-contain bg-sb-cream border-b border-sb-border py-5 px-5 flex flex-col gap-3 xl:hidden shadow-warm"
          >
            <a
              href={bookHref}
              onClick={() => handleBookClick('mobile')}
              className={`${NAV_CTA} w-full justify-center py-3 text-base`}
            >
              {bookLabel}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </a>
            {navItems.map((item) => (
              <a
                key={item.key}
                href={getLocalizedHref(item.href, locale)}
                onClick={(event) => handleNavItemClick(event, item)}
                className="rounded-xl border border-sb-border bg-white px-4 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-amber"
              >
                <span className="block text-base font-bold text-sb-forest">
                  {item.label}
                  {badgeFor(item.key) ? <>{' '}<span className={NEW_BADGE}>{badgeFor(item.key)}</span></> : null}
                </span>
                <span className="block text-sm text-sb-ink">{item.desc}</span>
              </a>
            ))}
            {languageSwitcher ? (
              <div className="border-t border-sb-border pt-4">
                {languageSwitcher}
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
