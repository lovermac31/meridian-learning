import { useState, useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { getLocalizedHref } from '../i18n/localizedHref';
import { getCurrentLocale } from '../i18n/routing';
import { getUiString } from '../i18n/ui';
import { trackCtaClick } from '../lib/analytics';

const ROOT_MOBILE_NAV_ID = 'root-mobile-nav';

// One pill style for every header link (layout B). Fixed padding and an even
// gap keep the row symmetric; whitespace-nowrap keeps it to one row. 13px
// type and px-2.5 so the longer VI labels fit the 1232px container.
const NAV_PILL =
  'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1.5 text-[13px] font-medium text-white/85 transition hover:border-jurassic-accent/60 hover:bg-white/[0.08] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-jurassic-dark';
const NAV_BADGE =
  'rounded-full bg-jurassic-accent px-1.5 py-px text-[10px] font-bold uppercase tracking-wider text-jurassic-dark';


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

  // Header IA (homepage layout B, 14 Oct 2026): For Parents · Adults & IELTS ·
  // IELTS Writing (NEW) · For Schools · Knowledge Hub, then one primary
  // "Book & pricing" anchor to the homepage offers band (#book). "The
  // Curriculum" lives in the footer. `route` items go through onNavigate
  // (App.navigateTo); `native` items are pages served by the AI Speaking app
  // (vercel.json rewrite), so they must be real document navigations.
  const navItems: Array<{ key: string; name: string; href: string; kind: 'route' | 'native'; badge?: string }> = [
    { key: 'parents', name: getUiString(locale, 'navbar.links.forParents'), href: '/student-academy', kind: 'route' },
    { key: 'adults', name: getUiString(locale, 'navbar.links.adults'), href: '/ai-speaking', kind: 'native' },
    {
      key: 'writing',
      name: getUiString(locale, 'navbar.links.writing'),
      href: '/ai-speaking/writing',
      kind: 'native',
      badge: getUiString(locale, 'navbar.links.writingBadge'),
    },
    { key: 'schools', name: getUiString(locale, 'navbar.links.forSchools'), href: '/school-framework', kind: 'route' },
    { key: 'knowledge', name: getUiString(locale, 'navbar.links.knowledgeHub'), href: '/knowledge', kind: 'route' },
  ];
  // Same-document jump on the homepage (App scrolls to the hash target),
  // a full load of the homepage elsewhere. Pathname-derived only, so the
  // server render and the hydrating client agree.
  const bookHref = getLocalizedHref('/#book', locale);
  const bookLabel = getUiString(locale, 'navbar.bookPricing');

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
        label: placement === 'desktop' ? 'header_book_pricing_click' : 'header_book_pricing_mobile_click',
        type: 'primary',
        segment: 'parent_student',
      });
    } catch {
      /* Measurement must not block navigation. */
    }
  };

  const handlePricingClick = () => {
    setIsMobileMenuOpen(false);
    onPricingClick();
  };

  const handleEducationAffiliateClick = () => {
    setIsMobileMenuOpen(false);
    onEducationAffiliateClick();
  };

  const isSolidNav = forceSolidBackground || isScrolled;

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${forceSolidBackground ? 'bg-jurassic-dark shadow-[0_1px_3px_rgba(0,0,0,0.18)] py-3.5 border-b border-white/5' : isSolidNav ? 'bg-jurassic-dark/85 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.18)] py-3.5 border-b border-white/5' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              onNavigateHome();
            }}
            className="shrink-0 whitespace-nowrap rounded-md px-1 py-0.5 font-wordmark text-[1.15rem] sm:text-[1.28rem] text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent/90 focus-visible:ring-offset-2 focus-visible:ring-offset-jurassic-dark"
            dir="ltr"
            aria-label={getUiString(locale, 'navbar.brandAriaLabel')}
          >
            Jurassic English<sup className="text-jurassic-accent">™</sup>
          </button>
        </div>

        {/* Desktop nav (>= xl, 1280): links | primary CTA | EN/VI, one row in
            EN and VI. Every link uses the same pill (NAV_PILL) with an even
            gap; the IELTS Writing pill carries the NEW badge and is visible
            at every desktop width (owner requirement). Below xl the
            hamburger drawer takes over. */}
        <div className="hidden xl:flex items-center gap-2">
          {navItems.map((item) => (
            <a
              key={item.key}
              href={getLocalizedHref(item.href, locale)}
              onClick={(event) => handleNavItemClick(event, item)}
              className={NAV_PILL}
            >
              {item.badge ? <span className={NAV_BADGE}>{item.badge}</span> : null}
              {item.name}
            </a>
          ))}
        </div>
        <div className="hidden xl:flex items-center gap-3">
          <a
            href={bookHref}
            onClick={() => handleBookClick('desktop')}
            className="whitespace-nowrap rounded-full bg-jurassic-accent px-4 py-2 text-[13px] font-bold text-jurassic-dark shadow-premium transition hover:bg-[#f97b38] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-jurassic-dark"
          >
            {bookLabel}
          </a>
          {languageSwitcher}
        </div>

        {/* Mobile Toggle — visible <xl (<1280px) where the desktop nav cluster
            would otherwise overflow with 11 items + wordmark + container padding.
            Phase 9 — added explicit type="button", aria-controls, focus-visible
            ring, and aria-hidden on the Menu/X icons. */}
        <button
          ref={triggerRef}
          type="button"
          className="xl:hidden text-white inline-flex h-10 w-10 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-jurassic-dark"
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

      {/* Mobile Menu — Phase 9: id, role="dialog", aria-modal, aria-label
          added so screen readers announce it as a modal dialog. The
          useEffect above wires Escape close, click-outside, body scroll
          lock, initial focus into drawer, Tab focus-trap, and focus
          restoration to the trigger on close. */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            ref={drawerRef}
            id={ROOT_MOBILE_NAV_ID}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full max-h-[calc(100vh-5rem)] overflow-y-auto overscroll-contain bg-jurassic-dark/95 backdrop-blur-lg border-b border-white/5 py-6 px-6 flex flex-col gap-4 xl:hidden shadow-xl"
          >
            {/* Same items as the desktop header, primary CTA first. */}
            <a
              href={bookHref}
              onClick={() => handleBookClick('mobile')}
              className="rounded-xl bg-jurassic-accent px-5 py-3 text-center font-bold text-jurassic-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-jurassic-dark"
            >
              {bookLabel}
            </a>
            {navItems.map((item) => (
              <a
                key={item.key}
                href={getLocalizedHref(item.href, locale)}
                onClick={(event) => handleNavItemClick(event, item)}
                className="inline-flex items-center gap-2 rounded-md text-lg font-medium tracking-[0.01em] text-white/90 hover:text-jurassic-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-jurassic-dark"
              >
                {item.badge ? <span className={NAV_BADGE}>{item.badge}</span> : null}
                {item.name}
              </a>
            ))}
            {languageSwitcher ? (
              <div className="border-t border-white/10 pt-4">
                {languageSwitcher}
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
