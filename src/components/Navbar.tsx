import { useState, useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';
import { getOverhaulContent, PRODUCTS_NEW_HIGHLIGHT, PRODUCTS_NEW_HREF } from '../i18n/content/overhaul';
import { getLocalizedHref } from '../i18n/localizedHref';
import { getCurrentLocale } from '../i18n/routing';
import { headerCta } from '../lib/headerCta';
import { getCurrentPathname } from '../lib/ssrLocation';
import { getUiString } from '../i18n/ui';
import { trackCtaClick } from '../lib/analytics';

const ROOT_MOBILE_NAV_ID = 'root-mobile-nav';
const IELTS_MENU_ID = 'header-ielts-menu';

// A header door. Option A (15 Nov 2026): IELTS has `children`, the two links of its short list.
type NavLink = { key: string; label: string; desc: string; href: string; kind: 'route' | 'native'; short?: string; children?: NavLink[] };

// Light storybook header (10/10 overhaul). Two-line door links: age + what it is.
const NAV_LINK =
  'whitespace-nowrap rounded-xl px-0.5 py-1.5 text-[0.95rem] font-semibold text-sb-forest transition hover:text-sb-amber-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-amber focus-visible:ring-offset-2 focus-visible:ring-offset-sb-cream';
// White text only on #B45309 (5.0:1) or forest #1E4D3B (9.4:1), never on #D97706.
const NAV_CTA =
  'inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full bg-sb-amber-deep px-4 py-2 text-[13px] font-bold text-white shadow-warm transition hover:bg-sb-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-forest focus-visible:ring-offset-2 focus-visible:ring-offset-sb-cream';

// The desktop row drops a bracketed suffix (e.g. "Products & prices" shows "Products"): the header
// is width-capped, and the full label pushes Pricing under the language switch at every width
// (measured 1280 and 1440, EN and VI). The mobile menu, aria-label and title keep the full label.
function DesktopNavLabel({ label, short }: { label: string; short?: string }) {
  // "Products & prices" shows "Products" in the desktop row (website assessment, 27 Oct 2026: six links must fit).
  if (short && label.startsWith(short)) return <>{short}<span className="sr-only">{label.slice(short.length)}</span></>;
  const match = label.match(/^(.*?)\s(\(.+\))$/);
  if (!match) return <>{label}</>;
  return (
    <>
      {match[1]}
      <span className="sr-only"> {match[2]}</span>
    </>
  );
}

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
  // The desktop IELTS list (Option A): a button that opens two links; Escape, a click outside or leaving it closes it.
  const [isIeltsOpen, setIsIeltsOpen] = useState(false);
  const ieltsRef = useRef<HTMLDivElement>(null);
  const ieltsButtonRef = useRef<HTMLButtonElement>(null);
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

  useEffect(() => {
    if (!isIeltsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      setIsIeltsOpen(false);
      ieltsButtonRef.current?.focus();
    };
    const onDown = (e: MouseEvent) => {
      if (ieltsRef.current && !ieltsRef.current.contains(e.target as Node)) setIsIeltsOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [isIeltsOpen]);

  // Header IA (10/10 overhaul, Oct 2026): four age-based doors, then one
  // primary "Book a Speaking Baseline" CTA that stays visible (sticky header).
  // `route` items go through onNavigate (App.navigateTo); `native` items are
  // pages served outside the SPA (static YL page, AI Speaking app rewrite) or
  // homepage anchors, so they must be real document navigations.
  const overhaul = getOverhaulContent(locale);
  // Phonics launch (Jay, 15 Nov 2026, D3/D4): for four weeks Products carries the "New" badge and links straight to the
  // Phonics tile, as a full page load so the #phonics anchor opens the tile. PRODUCTS_NEW_HIGHLIGHT = false undoes it all.
  const navItems: NavLink[] = (overhaul.nav.items as readonly NavLink[]).map((item) =>
    PRODUCTS_NEW_HIGHLIGHT && item.key === 'products' ? { ...item, href: PRODUCTS_NEW_HREF, kind: 'native' as const } : item);
  const productsItem = navItems.find((item) => item.key === 'products');
  // The header button is the page's own next step (website assessment, 27 Oct 2026): the free sample pack on parent
  // pages, the Live Speaking Baseline booking page on IELTS pages (US$ on country pages). See lib/headerCta.
  const cta = headerCta(getCurrentPathname(), locale, overhaul.nav);
  const bookHref = cta.href;
  const bookLabel = cta.label;
  // "New" / "Mới" badge: on Books & Prices during the Phonics launch, otherwise on IELTS (Option A: one badge at a time,
  // never on a removed door). The accessible name starts with the visible text (WCAG 2.5.3).
  const badgeFor = (key: string) => (key === (PRODUCTS_NEW_HIGHLIGHT ? 'products' : 'ielts') ? overhaul.nav.newBadge : null);
  const newInProducts = `${overhaul.nav.newBadge}: ${productsItem?.label ?? ''}`;
  const trackProductsNew = () => {
    if (!PRODUCTS_NEW_HIGHLIGHT) return;
    try {
      trackCtaClick({ label: 'header_products_new_click', type: 'secondary', segment: 'parent_student' });
    } catch {
      /* Measurement must not block navigation. */
    }
  };
  const NEW_BADGE = 'ml-1.5 inline-block rounded-full bg-sb-amber-deep px-1.5 align-[1px] text-[11px] font-bold leading-4 text-white';

  const handleNavItemClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    item: NavLink,
  ) => {
    setIsMobileMenuOpen(false);
    setIsIeltsOpen(false);
    if (item.key === 'products') trackProductsNew();
    if (item.kind === 'native') return;
    event.preventDefault();
    onNavigate(item.href);
  };

  const handleBookClick = (placement: 'desktop' | 'mobile') => {
    setIsMobileMenuOpen(false);
    try {
      trackCtaClick({
        label: `header_${cta.kind === 'sample' ? 'sample_pack' : 'book_baseline'}${placement === 'desktop' ? '' : '_mobile'}_click`,
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
      {/* Two balanced clusters on one 72px row: [logo + doors] … [language + CTA]. */}
      <div className="max-w-[1600px] mx-auto h-[72px] px-3 min-[360px]:px-4 sm:px-6 flex flex-nowrap justify-between items-center gap-1.5 sm:gap-3">
        <div className="flex min-w-0 flex-nowrap items-center gap-4 2xl:gap-4">
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

        {/* Show the full link row only when the logo, links, language control and CTA fit. */}
        <div className="hidden 2xl:flex flex-nowrap items-center gap-2 2xl:gap-3">
          {navItems.map((item) => item.children ? (
            // IELTS (Option A): a disclosure button and a short list of its two links, reachable by keyboard.
            <div
              key={item.key}
              ref={ieltsRef}
              className="relative"
              onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsIeltsOpen(false); }}
            >
              <button
                ref={ieltsButtonRef}
                type="button"
                className={`${NAV_LINK} inline-flex items-center gap-1`}
                aria-expanded={isIeltsOpen}
                aria-controls={IELTS_MENU_ID}
                onClick={() => setIsIeltsOpen((open) => !open)}
                data-testid="header-ielts-button"
              >
                {item.label}
                {badgeFor(item.key) ? <span className={NEW_BADGE}>{badgeFor(item.key)}</span> : null}
                <ChevronDown aria-hidden="true" className={`h-4 w-4 transition-transform ${isIeltsOpen ? 'rotate-180' : ''}`} />
              </button>
              <ul
                id={IELTS_MENU_ID}
                hidden={!isIeltsOpen}
                className="absolute left-0 top-full z-10 mt-2 min-w-[17rem] rounded-2xl border border-sb-border bg-sb-cream p-2 shadow-warm"
              >
                {item.children.map((child) => (
                  <li key={child.key}>
                    <a
                      href={getLocalizedHref(child.href, locale)}
                      onClick={(event) => handleNavItemClick(event, child)}
                      className="block rounded-xl px-3 py-2 text-[0.95rem] font-semibold text-sb-forest hover:bg-white hover:text-sb-amber-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-amber"
                      aria-label={[child.label, child.desc].filter(Boolean).join(' · ')}
                    >
                      {child.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <a
              key={item.key}
              href={getLocalizedHref(item.href, locale)}
              onClick={(event) => handleNavItemClick(event, item)}
              className={NAV_LINK}
              aria-label={[badgeFor(item.key) ? `${item.label} ${badgeFor(item.key)}` : item.label, item.desc].filter(Boolean).join(' · ')}
              title={[item.label, item.desc].filter(Boolean).join(' · ')}
            >
              <DesktopNavLabel label={item.label} short={item.short} />
              {badgeFor(item.key) ? <>{' '}<span className={NEW_BADGE}>{badgeFor(item.key)}</span></> : null}
            </a>
          ))}
        </div>
        </div>
        <div className="flex shrink-0 flex-nowrap items-center gap-1 sm:gap-3">
          <div className="hidden 2xl:block">{languageSwitcher}</div>
          {productsItem ? (
            // Products stays one tap away at every width (4 Nov 2026, owner: "click, click, sales"): beside the
            // CTA on phones, tablets and laptops; the full link row takes over from 2xl.
            <a
              href={getLocalizedHref(productsItem.href, locale)}
              onClick={(event) => handleNavItemClick(event, productsItem)}
              className={`${NAV_LINK} inline-flex min-h-11 min-w-11 items-center justify-center px-1 max-[639px]:text-sm sm:px-2 2xl:hidden`}
              data-testid="header-products-link"
            >
              {productsItem.short ?? productsItem.label}
            </a>
          ) : null}
          <a
            href={bookHref}
            onClick={() => handleBookClick('desktop')}
            className={`${NAV_CTA} px-2.5 min-[360px]:px-3 sm:px-5 max-[639px]:max-w-[6.5rem] max-[639px]:whitespace-normal max-[639px]:text-center max-[639px]:text-xs max-[639px]:leading-[1.15]`}
          >
            {/* Below 640px the label may wrap to two lines so the Products link keeps its place in the bar. */}
            <span className="hidden sm:inline">{bookLabel}</span>
            <span className="sm:hidden">{cta.mobileLabel}</span>
            <ArrowRight aria-hidden="true" className="hidden h-4 w-4 sm:block" />
          </a>
          <button
            ref={triggerRef}
            type="button"
            className="relative 2xl:hidden shrink-0 text-sb-forest inline-flex h-11 w-11 items-center justify-center rounded-full border border-sb-border bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-amber focus-visible:ring-offset-2 focus-visible:ring-offset-sb-cream"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={
              isMobileMenuOpen
                ? getUiString(locale, 'navbar.closeMenu')
                : PRODUCTS_NEW_HIGHLIGHT
                  ? `${getUiString(locale, 'navbar.openMenu')} · ${newInProducts}`
                  : getUiString(locale, 'navbar.openMenu')
            }
            aria-expanded={isMobileMenuOpen}
            aria-controls={ROOT_MOBILE_NAV_ID}
          >
            {isMobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            {/* Below 2xl the menu row is hidden, so an 8 px amber dot says there is something new inside (Phonics launch). */}
            {PRODUCTS_NEW_HIGHLIGHT && !isMobileMenuOpen ? <span className="pointer-events-none absolute right-1 top-1 h-2 w-2 rounded-full bg-sb-amber-deep ring-2 ring-white" aria-hidden="true" data-testid="menu-new-dot" /> : null}
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
            className="absolute top-full left-0 w-full max-h-[calc(100vh-4.5rem)] overflow-y-auto overscroll-contain bg-sb-cream border-b border-sb-border py-5 px-5 flex flex-col gap-3 2xl:hidden shadow-warm"
          >
            <a
              href={bookHref}
              onClick={() => handleBookClick('mobile')}
              className={`${NAV_CTA} w-full justify-center py-3 text-base`}
            >
              {bookLabel}
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </a>
            {navItems.map((item) => item.children ? (
              // IELTS in the drawer (Option A): the heading, then its two links listed under it.
              <div key={item.key} className="rounded-xl border border-sb-border bg-white px-4 py-3" role="group" aria-labelledby="drawer-ielts-heading">
                <span id="drawer-ielts-heading" className="block text-base font-bold text-sb-forest">
                  {item.label}
                  {badgeFor(item.key) ? <>{' '}<span className={NEW_BADGE}>{badgeFor(item.key)}</span></> : null}
                </span>
                <ul className="mt-2 flex flex-col gap-1 border-l-2 border-sb-border pl-3">
                  {item.children.map((child) => (
                    <li key={child.key}>
                      <a
                        href={getLocalizedHref(child.href, locale)}
                        onClick={(event) => handleNavItemClick(event, child)}
                        className="block rounded-lg py-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-amber"
                      >
                        <span className="block text-base font-semibold text-sb-forest">{child.label}</span>
                        {child.desc ? <span className="block text-sm text-sb-ink">{child.desc}</span> : null}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
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
                {item.desc ? <span className="block text-sm text-sb-ink">{item.desc}</span> : null}
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
