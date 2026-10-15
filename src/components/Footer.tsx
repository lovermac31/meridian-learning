import { getOverhaulContent } from '../i18n/content/overhaul';
import { getLocalizedHref } from '../i18n/localizedHref';
import { getCurrentLocale } from '../i18n/routing';
import { getUiString } from '../i18n/ui';
import { LinkifyWorldWise, WorldWiseLink } from './WorldWiseLink';

type FooterProps = {
  onNavigate?: (path: string) => void;
  // Kept for call-site compatibility; the clean footer no longer opens modals.
  onPricingClick?: () => void;
  onEducationAffiliateClick?: () => void;
};

// SPA routes navigate in place; everything else (static YL page, the AI
// Speaking app, the Student Academy rewrite) is a real document navigation.
const SPA_PREFIXES = ['/framework', '/legal/', '/get-started'];

/**
 * Clean pan-regional footer (10/10 overhaul, spec §4 Page A). One navigation
 * row, the institutional pointer to WorldWise Learning, and the one-line
 * independence notice. Replaces the 31-link, five-column sitemap.
 */
export const Footer = ({ onNavigate }: FooterProps) => {
  const locale = getCurrentLocale();
  const { footer } = getOverhaulContent(locale);

  return (
    <footer className="border-t border-sb-border bg-white pb-24 min-[1440px]:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <span className="font-wordmark text-[1.2rem] text-sb-forest" dir="ltr">
            Jurassic English<sup className="text-sb-amber-deep">™</sup>
          </span>
          <nav aria-label={footer.navLabel}>
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {footer.links.map((link) => {
                const isSpa = SPA_PREFIXES.some((prefix) => link.href.startsWith(prefix));
                return (
                  <li key={link.href}>
                    <a
                      href={getLocalizedHref(link.href, locale)}
                      onClick={(event) => {
                        if (!isSpa || !onNavigate) return;
                        event.preventDefault();
                        onNavigate(link.href);
                      }}
                      className="rounded text-sm font-semibold text-sb-forest underline-offset-4 hover:text-sb-amber-deep hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-amber"
                    >
                      {link.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-sb-slate">
          {footer.institutionalLead}{' '}
          <WorldWiseLink className="font-bold text-sb-forest underline underline-offset-4 hover:text-sb-amber-deep">
            {footer.institutionalName}
          </WorldWiseLink>
          .
        </p>

        <p className="mt-4 max-w-4xl border-t border-sb-border pt-4 text-xs leading-relaxed text-sb-slate">
          {footer.notice}
        </p>
        <p className="mt-3 text-xs text-sb-slate">
          {footer.legalLabel}{' '}
          <a href="mailto:legal@worldwiselearning.com" className="font-semibold text-sb-forest underline underline-offset-4">
            legal@worldwiselearning.com
          </a>
        </p>
        <p className="mt-3 text-xs text-sb-slate">
          <LinkifyWorldWise text={getUiString(locale, 'footer.copyright')} />{' '}
          <LinkifyWorldWise text={getUiString(locale, 'footer.trademark')} />
        </p>
      </div>
    </footer>
  );
};
