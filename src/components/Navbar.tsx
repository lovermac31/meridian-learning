import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';

type NavbarProps = {
  onGetStarted: () => void;
  onNavigateHome: () => void;
  onNavigate: (path: string) => void;
  onPricingClick: () => void;
  isPortalView?: boolean;
};

export const Navbar = ({
  onGetStarted,
  onNavigateHome,
  onNavigate,
  onPricingClick,
  isPortalView = false,
}: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About', href: isPortalView ? '/#about' : '#about' },
    { name: 'Framework', href: isPortalView ? '/#framework' : '#framework' },
    { name: 'Series', href: isPortalView ? '/#series' : '#series' },
    { name: 'Creative Studio', href: isPortalView ? '/#studio' : '#studio' },
    { name: 'Services', href: isPortalView ? '/#training' : '#training' },
    { name: 'Contact', href: isPortalView ? '/#contact' : '#contact' },
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

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-jurassic-dark/85 backdrop-blur-md shadow-premium py-4 border-b border-white/5' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              onNavigateHome();
            }}
            className="rounded-md px-1 py-0.5 text-2xl font-display tracking-tight text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent/90 focus-visible:ring-offset-2 focus-visible:ring-offset-jurassic-dark"
            aria-label="Jurassic English home"
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
          <button
            type="button"
            onClick={handlePricingClick}
            className="text-sm font-medium text-white/80 hover:text-white hover:underline underline-offset-4 decoration-jurassic-accent transition-all duration-300"
          >
            Plans & Pricing
          </button>
          <button
            type="button"
            onClick={onGetStarted}
            className="bg-jurassic-accent text-white px-5 py-2 rounded-full text-sm font-bold glow-hover shadow-premium"
          >
            Get Started
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
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
            className="absolute top-full left-0 w-full bg-jurassic-dark/95 backdrop-blur-lg border-b border-white/5 py-6 px-6 flex flex-col gap-4 md:hidden shadow-xl"
          >
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
            <button
              type="button"
              onClick={handlePricingClick}
              className="text-left text-lg font-medium text-white/90 hover:text-jurassic-accent"
            >
              Plans & Pricing
            </button>
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onGetStarted();
              }}
              className="bg-jurassic-accent text-white px-5 py-3 rounded-xl text-center font-bold"
            >
              Get Started
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
