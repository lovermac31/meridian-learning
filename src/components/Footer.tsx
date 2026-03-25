import { ArrowRight, Mail } from 'lucide-react';

type FooterProps = {
  onNavigate?: (path: string) => void;
};

const footerNav = {
  explore: [
    { label: 'About', href: '#about' },
    { label: 'Framework', href: '/framework' },
    { label: 'Series', href: '#series' },
    { label: 'Thinking Cycle', href: '/thinking-cycle/compare' },
    { label: 'Services', href: '#training' },
    { label: 'Creative Studio', href: '#studio' },
    { label: 'Get Started', href: '/get-started' },
    { label: 'Contact', href: '#contact' },
  ],
  pathways: [
    { label: 'Teacher Training', href: '/get-started?interest=teacher_training' },
    { label: 'School Licensing', href: '/get-started?interest=school_licensing' },
    { label: 'Curriculum Review', href: '/get-started?interest=curriculum_review' },
    { label: 'Academic Consulting', href: '/get-started?interest=consulting' },
    { label: 'Institutional Partnerships', href: '/get-started?interest=partnership' },
  ],
  resources: [
    { label: 'Level Details', href: '#series' },
    { label: 'Compare All Levels', href: '/series/compare' },
    { label: 'Syllabi & Downloads', href: '/series/compare' },
    { label: 'Compare All Stages', href: '/thinking-cycle/compare' },
    { label: 'Student Manual Access', href: '/thinking-cycle/compare' },
    { label: 'Teacher Manual Access', href: '/thinking-cycle/compare' },
  ],
  legal: [
    { label: 'Terms & Conditions', href: '/legal/terms' },
    { label: 'Privacy Policy', href: '/legal/privacy' },
    { label: 'Cookie Policy', href: '/legal/cookies' },
    { label: 'Accessibility Statement', href: '/legal/accessibility' },
    { label: 'Disclaimer', href: '/legal/disclaimer' },
  ],
};

const bottomLegalLinks = [
  { label: 'Terms', href: '/legal/terms' },
  { label: 'Privacy', href: '/legal/privacy' },
  { label: 'Cookies', href: '/legal/cookies' },
];

export const Footer = ({ onNavigate }: FooterProps) => {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('mailto:')) return;

    e.preventDefault();

    if (href.startsWith('#')) {
      // Hash navigation — scroll to section on homepage
      if (window.location.pathname !== '/') {
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
        setTimeout(() => {
          const el = document.getElementById(href.slice(1));
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const el = document.getElementById(href.slice(1));
        el?.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    // Route navigation
    if (onNavigate) {
      onNavigate(href);
    } else {
      window.history.pushState({}, '', href);
      window.scrollTo({ top: 0, behavior: 'auto' });
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const FooterLink = ({ label, href }: { label: string; href: string }) => (
    <a
      href={href}
      onClick={(e) => handleLinkClick(e, href)}
      className="block py-1 text-sm text-white/65 transition-colors duration-200 hover:text-jurassic-accent"
    >
      {label}
    </a>
  );

  const ColumnHeading = ({ children }: { children: React.ReactNode }) => (
    <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-white/55">
      {children}
    </h4>
  );

  return (
    <footer className="bg-jurassic-dark border-t border-white/5">
      {/* ═══════ TIER 1 — Brand / Positioning Strip ═══════ */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-10 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl">
              <span className="text-2xl font-display text-white tracking-wide">
                Jurassic English<span className="text-xs align-top text-jurassic-accent">™</span>
              </span>
              <p className="mt-2 text-sm leading-relaxed font-light text-white/55">
                Literature-centered English education for critical thinking, moral reasoning, and institutional scale.
              </p>
            </div>
            <a
              href="/get-started"
              onClick={(e) => handleLinkClick(e, '/get-started')}
              className="bg-jurassic-accent text-white px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 group shadow-premium hover:brightness-110 transition-all w-fit shrink-0"
            >
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </div>

      {/* ═══════ TIER 2 — Main Footer Body ═══════ */}
      <div className="max-w-7xl mx-auto px-6 py-10 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6 lg:gap-10">
          {/* Column 1 — Explore */}
          <div>
            <ColumnHeading>Explore</ColumnHeading>
            <nav className="space-y-0.5">
              {footerNav.explore.map((link) => (
                <FooterLink key={link.label} {...link} />
              ))}
            </nav>
          </div>

          {/* Column 2 — Institutional Pathways */}
          <div>
            <ColumnHeading>Institutional Pathways</ColumnHeading>
            <nav className="space-y-0.5">
              {footerNav.pathways.map((link) => (
                <FooterLink key={link.label} {...link} />
              ))}
            </nav>
          </div>

          {/* Column 3 — Resources */}
          <div>
            <ColumnHeading>Resources</ColumnHeading>
            <nav className="space-y-0.5">
              {footerNav.resources.map((link) => (
                <FooterLink key={link.label} {...link} />
              ))}
            </nav>
          </div>

          {/* Column 4 — Legal & Contact */}
          <div>
            <ColumnHeading>Legal &amp; Contact</ColumnHeading>
            <nav className="space-y-0.5">
              {footerNav.legal.map((link) => (
                <FooterLink key={link.label} {...link} />
              ))}
            </nav>
            <div className="mt-5 pt-4 border-t border-white/5 space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50 mb-1">General Enquiries</p>
                <a
                  href="mailto:info@jurassicenglish.com"
                  className="flex items-center gap-2 text-sm text-jurassic-accent transition-colors duration-200 hover:text-jurassic-gold break-all"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  info@jurassicenglish.com
                </a>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50 mb-1">Legal &amp; Privacy</p>
                <a
                  href="mailto:legal@worldwiselearning.com"
                  className="flex items-center gap-2 text-sm text-jurassic-accent transition-colors duration-200 hover:text-jurassic-gold break-all"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  legal@worldwiselearning.com
                </a>
              </div>
              <p className="text-xs leading-relaxed text-white/55">
                We typically respond within 2 business days.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ TIER 3 — Bottom Legal Strip ═══════ */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs text-white/55">
                © 2026 World Wise Learning. All rights reserved.
              </p>
              <p className="text-xs text-white/50">
                Jurassic English™ is a trademark of World Wise Learning.
              </p>
            </div>
            <div className="flex gap-4">
              {bottomLegalLinks.map((link, i) => (
                <span key={link.label} className="flex items-center gap-4">
                  <a
                    href={link.href}
                    onClick={(e) => handleLinkClick(e, link.href)}
                    className="text-xs text-white/50 transition-colors hover:text-white/75"
                  >
                    {link.label}
                  </a>
                  {i < bottomLegalLinks.length - 1 && (
                    <span className="text-xs text-white/20">·</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
