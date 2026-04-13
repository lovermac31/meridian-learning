import { useState, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { getCurrentLocale } from '../i18n/routing';
import { getUiString } from '../i18n/ui';

type NavbarProps = {
  onGetStarted: () => void;
  onNavigateHome: () => void;
  onNavigate: (path: string) => void;
  onPricingClick: () => void;
  isPortalView?: boolean;
  forceSolidBackground?: boolean;
  languageSwitcher?: ReactNode;
};

export const Navbar = ({
  onGetStarted,
  onNavigateHome,
  onNavigate,
  onPricingClick,
  isPortalView = false,
  forceSolidBackground = false,
  languageSwitcher,
}: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const locale = getCurrentLocale();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: getUiString(locale, 'navbar.links.about'), href: isPortalView ? '/#about' : '#about' },
    { name: getUiString(locale, 'navbar.links.framework'), href: isPortalView ? '/#framework' : '#framework' },
    { name: getUiString(locale, 'navbar.links.series'), href: isPortalView ? '/#series' : '#series' },
    { name: getUiString(locale, 'navbar.links.studio'), href: isPortalView ? '/#studio' : '#studio' },
    { name: getUiString(locale, 'navbar.links.services'), href: isPortalView ? '/#training' : '#training' },
    { name: getUiString(locale, 'navbar.links.contact'), href: isPortalView ? '/#contact' : '#contact' },
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

  const isSolidNav = forceSolidBackground || isScrolled;

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isSolidNav ? 'bg-jurassic-dark/85 backdrop-blur-md shadow-premium py-4 border-b border-white/5' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
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

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(event) => handleNavLinkClick(event, link.href)}
              className="text-sm font-medium text-white/80 hover:text-white hover:underline underline-offset-4 decoration-jurassic-accent transition-all duration-300"
            >
              {link.name}
            </a>
          ))}
          <a
            href="/worldwise"
            onClick={(event) => handleNavLinkClick(event, '/worldwise')}
            className="text-sm font-semibold text-jurassic-gold/80 hover:text-jurassic-gold hover:underline underline-offset-4 decoration-jurassic-gold transition-all duration-300"
          >
            {getUiString(locale, 'navbar.links.worldwise')}
          </a>
          <button
            type="button"
            onClick={handlePricingClick}
            className="text-sm font-medium text-white/80 hover:text-white hover:underline underline-offset-4 decoration-jurassic-accent transition-all duration-300"
          >
            {getUiString(locale, 'navbar.pricing')}
          </button>
          <button
            type="button"
            onClick={onGetStarted}
            className="bg-jurassic-accent text-white px-5 py-2 rounded-full text-sm font-bold glow-hover shadow-premium"
          >
            {getUiString(locale, 'navbar.getStarted')}
          </button>
          {languageSwitcher}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={
            isMobileMenuOpen
              ? getUiString(locale, 'navbar.closeMenu')
              : getUiString(locale, 'navbar.openMenu')
          }
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full max-h-[calc(100vh-5rem)] overflow-y-auto overscroll-contain bg-jurassic-dark/95 backdrop-blur-lg border-b border-white/5 py-6 px-6 flex flex-col gap-4 md:hidden shadow-xl"
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
                className="text-lg font-medium text-white/90 hover:text-jurassic-accent"
                onClick={(event) => handleNavLinkClick(event, link.href)}
              >
                {link.name}
              </a>
            ))}
            <a
              href="/worldwise"
              className="text-lg font-semibold text-jurassic-gold/90 hover:text-jurassic-gold"
              onClick={(event) => handleNavLinkClick(event, '/worldwise')}
            >
              {getUiString(locale, 'navbar.links.worldwise')}
            </a>
            <button
              type="button"
              onClick={handlePricingClick}
              className="text-left text-lg font-medium text-white/90 hover:text-jurassic-accent"
            >
              {getUiString(locale, 'navbar.pricing')}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onGetStarted();
              }}
              className="bg-jurassic-accent text-white px-5 py-3 rounded-xl text-center font-bold"
            >
              {getUiString(locale, 'navbar.getStarted')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
