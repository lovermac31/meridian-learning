import { ArrowRight, Mail } from 'lucide-react';
import { getCurrentLocale } from '../i18n/routing';
import { getUiString } from '../i18n/ui';

type FooterProps = {
  onNavigate?: (path: string) => void;
};

export const Footer = ({ onNavigate }: FooterProps) => {
  const locale = getCurrentLocale();
  const footerNav = {
    explore: [
      { label: getUiString(locale, 'footer.links.about'), href: '#about' },
      { label: getUiString(locale, 'footer.links.framework'), href: '/framework' },
      { label: getUiString(locale, 'footer.links.series'), href: '#series' },
      { label: getUiString(locale, 'footer.links.thinkingCycle'), href: '/thinking-cycle/compare' },
      { label: getUiString(locale, 'footer.links.services'), href: '#training' },
      { label: getUiString(locale, 'footer.links.creativeStudio'), href: '#studio' },
      { label: getUiString(locale, 'footer.getStarted'), href: '/get-started' },
      { label: getUiString(locale, 'footer.links.contact'), href: '#contact' },
    ],
    pathways: [
      { label: getUiString(locale, 'footer.links.teacherTraining'), href: '/get-started?interest=teacher_training' },
      { label: getUiString(locale, 'footer.links.schoolLicensing'), href: '/get-started?interest=school_licensing' },
      { label: getUiString(locale, 'footer.links.curriculumReview'), href: '/get-started?interest=curriculum_review' },
      { label: getUiString(locale, 'footer.links.academicConsulting'), href: '/get-started?interest=consulting' },
      { label: getUiString(locale, 'footer.links.institutionalPartnerships'), href: '/get-started?interest=partnership' },
    ],
    resources: [
      { label: getUiString(locale, 'footer.links.levelDetails'), href: '#series' },
      { label: getUiString(locale, 'footer.links.compareAllLevels'), href: '/series/compare' },
      { label: getUiString(locale, 'footer.links.syllabiDownloads'), href: '/series/compare' },
      { label: getUiString(locale, 'footer.links.compareAllStages'), href: '/thinking-cycle/compare' },
      { label: getUiString(locale, 'footer.links.studentManualAccess'), href: '/thinking-cycle/compare' },
      { label: getUiString(locale, 'footer.links.teacherManualAccess'), href: '/thinking-cycle/compare' },
    ],
    legal: [
      { label: getUiString(locale, 'footer.links.termsConditions'), href: '/legal/terms' },
      { label: getUiString(locale, 'footer.links.privacyPolicy'), href: '/legal/privacy' },
      { label: getUiString(locale, 'footer.links.cookiePolicy'), href: '/legal/cookies' },
      { label: getUiString(locale, 'footer.links.accessibilityStatement'), href: '/legal/accessibility' },
      { label: getUiString(locale, 'footer.links.disclaimer'), href: '/legal/disclaimer' },
    ],
  };
  const bottomLegalLinks = [
    { label: getUiString(locale, 'footer.links.terms'), href: '/legal/terms' },
    { label: getUiString(locale, 'footer.links.privacy'), href: '/legal/privacy' },
    { label: getUiString(locale, 'footer.links.cookies'), href: '/legal/cookies' },
  ];

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
                {getUiString(locale, 'footer.brandBlurb')}
              </p>
            </div>
            <a
              href="/get-started"
              onClick={(e) => handleLinkClick(e, '/get-started')}
            className="bg-jurassic-accent text-white px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 group shadow-premium hover:brightness-110 transition-all w-fit shrink-0"
          >
            {getUiString(locale, 'footer.getStarted')}
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
            <ColumnHeading>{getUiString(locale, 'footer.columns.explore')}</ColumnHeading>
            <nav className="space-y-0.5">
              {footerNav.explore.map((link) => (
                <FooterLink key={link.label} {...link} />
              ))}
            </nav>
          </div>

          {/* Column 2 — Institutional Pathways */}
          <div>
            <ColumnHeading>{getUiString(locale, 'footer.columns.pathways')}</ColumnHeading>
            <nav className="space-y-0.5">
              {footerNav.pathways.map((link) => (
                <FooterLink key={link.label} {...link} />
              ))}
            </nav>
          </div>

          {/* Column 3 — Resources */}
          <div>
            <ColumnHeading>{getUiString(locale, 'footer.columns.resources')}</ColumnHeading>
            <nav className="space-y-0.5">
              {footerNav.resources.map((link) => (
                <FooterLink key={link.label} {...link} />
              ))}
            </nav>
          </div>

          {/* Column 4 — Legal & Contact */}
          <div>
            <ColumnHeading>{getUiString(locale, 'footer.columns.legalContact')}</ColumnHeading>
            <nav className="space-y-0.5">
              {footerNav.legal.map((link) => (
                <FooterLink key={link.label} {...link} />
              ))}
            </nav>
            <div className="mt-5 pt-4 border-t border-white/5 space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50 mb-1">{getUiString(locale, 'footer.generalEnquiries')}</p>
                <a
                  href="mailto:info@jurassicenglish.com"
                  className="flex items-center gap-2 text-sm text-jurassic-accent transition-colors duration-200 hover:text-jurassic-gold break-all"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  info@jurassicenglish.com
                </a>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50 mb-1">{getUiString(locale, 'footer.legalPrivacy')}</p>
                <a
                  href="mailto:legal@worldwiselearning.com"
                  className="flex items-center gap-2 text-sm text-jurassic-accent transition-colors duration-200 hover:text-jurassic-gold break-all"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  legal@worldwiselearning.com
                </a>
              </div>
              <p className="text-xs leading-relaxed text-white/55">
                {getUiString(locale, 'footer.responseTime')}
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
                {getUiString(locale, 'footer.copyright')}
              </p>
              <p className="text-xs text-white/50">
                {getUiString(locale, 'footer.trademark')}
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
