import { useState, useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { getCurrentLocale } from '../i18n/routing';
import { getUiString } from '../i18n/ui';

const ROOT_MOBILE_NAV_ID = 'root-mobile-nav';

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

  // P0 — reduced two-audience nav. Route links (not homepage anchors):
  // For Schools → /school-framework, For Parents → /student-academy,
  // The Curriculum → /series/compare, Ask/Knowledge Hub → /knowledge.
  // /school-framework and /student-academy are rewrite-served; onNavigate
  // (App.navigateTo) does a full-document navigation for those.
  const navLinks = [
    { name: getUiString(locale, 'navbar.links.forSchools'), href: '/school-framework' },
    { name: getUiString(locale, 'navbar.links.forParents'), href: '/student-academy' },
    { name: getUiString(locale, 'navbar.links.curriculum'), href: '/series/compare' },
    { name: getUiString(locale, 'navbar.links.knowledge'), href: '/knowledge' },
  ];

  const handleNavLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    event.preventDefault();
    setIsMobileMenuOpen(false);
    onNavigate(href);
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
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isSolidNav ? 'bg-jurassic-dark/85 backdrop-blur-md shadow-premium py-4 border-b border-white/5' : 'bg-transparent py-6'}`}>
      <div className="max-w-[1480px] mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              onNavigateHome();
            }}
            className="rounded-md px-1 py-0.5 text-2xl font-display tracking-tight text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent/90 focus-visible:ring-offset-2 focus-visible:ring-offset-jurassic-dark"
            aria-label={getUiString(locale, 'navbar.brandAriaLabel')}
          >
            Jurassic English<span className="text-xs align-top text-jurassic-accent">™</span>
          </button>
        </div>

        {/* Desktop Nav — show at >=xl (1280) with tight gap, restore gap-6 at >=2xl (1536).
            Below xl, the hamburger drawer takes over because the 11-item right cluster
            (~917px of items + 10 gaps) overflows when combined with the wordmark
            and container padding. Same breakpoint strategy is mirrored in
            ecosystem-landing/src/components/ProductionStyleHeader.tsx so the homepage
            and the rewritten ecosystem pages always behave identically. */}
        <div className="hidden xl:flex items-center xl:gap-2 2xl:gap-6">
          {/* Phase 9 — focus-visible rings added to every desktop nav link
              and CTA. jurassic-accent / jurassic-gold rings against the
              dark header backdrop. rounded-md for ring corner shape. */}
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(event) => handleNavLinkClick(event, link.href)}
              className="rounded-md text-sm font-medium text-white/80 hover:text-white hover:underline underline-offset-4 decoration-jurassic-accent transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-jurassic-dark"
            >
              {link.name}
            </a>
          ))}
          {/* P0 — Education Affiliate Program + Plans & Pricing moved out of
              primary nav (now surfaced in the Footer). */}
          <button
            type="button"
            onClick={onGetStarted}
            className="bg-jurassic-accent text-white px-5 py-2 rounded-full text-sm font-bold glow-hover shadow-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-jurassic-dark"
          >
            {getUiString(locale, 'navbar.getStarted')}
          </button>
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
            {languageSwitcher ? (
              <div className="border-b border-white/10 pb-4">
                {languageSwitcher}
              </div>
            ) : null}
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="rounded-md text-lg font-medium text-white/90 hover:text-jurassic-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-jurassic-dark"
                onClick={(event) => handleNavLinkClick(event, link.href)}
              >
                {link.name}
              </a>
            ))}
            {/* P0 — Affiliate + Pricing removed from primary nav (now in Footer). */}
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onGetStarted();
              }}
              className="bg-jurassic-accent text-white px-5 py-3 rounded-xl text-center font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-jurassic-dark"
            >
              {getUiString(locale, 'navbar.getStarted')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
