import { getOverhaulContent } from '../i18n/content/overhaul';
import { getLocalizedHref } from '../i18n/localizedHref';
import { getCurrentLocale } from '../i18n/routing';
import { getUiString } from '../i18n/ui';
import { handleRouteClick, routeHref } from './RouteLink';
import { LinkifyWorldWise, WorldWiseLink } from './WorldWiseLink';

type FooterProps = {
  onNavigate?: (path: string) => void;
  // Kept for call-site compatibility; the clean footer no longer opens modals.
  onPricingClick?: () => void;
  onEducationAffiliateClick?: () => void;
};

// SPA routes navigate in place; everything else (static YL page, the AI
// Speaking app, the Student Academy rewrite) is a real document navigation.
const SPA_PREFIXES = ['/framework', '/legal/', '/get-started', '/story-club', '/en/story-club'];

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
          <a className="text-sm font-semibold underline" href={locale === 'vi' ? '/vi/so-do-trang' : '/site-map'}>{locale === 'vi' ? 'Sơ đồ trang' : 'Site map'}</a>
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

        {/* "For schools" — crawlable links into the school & curriculum pages.
            SPA routes navigate in place; /school-framework and
            /digital-reasoning-engine are rewrite-served, so handleRouteClick
            leaves them as native document navigations. */}
        <nav aria-label={footer.schools.label} className="mt-6 flex flex-wrap items-baseline gap-x-5 gap-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-sb-slate">{footer.schools.label}</span>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {footer.schools.links.map((link) => (
              <li key={link.href}>
                <a
                  href={routeHref(link.href)}
                  onClick={(event) => {
                    if (onNavigate) handleRouteClick(event, link.href, onNavigate);
                  }}
                  className="rounded text-sm font-semibold text-sb-forest underline-offset-4 hover:text-sb-amber-deep hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-amber"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={locale === 'vi' ? 'Luyện tập và bài học' : 'Practice and lessons'} className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-sb-forest">
          <a href={locale === 'vi' ? '/ai-speaking/vi/lessons' : '/ai-speaking/lessons'}>{locale === 'vi' ? 'Bài học 1 kèm 1' : 'One-to-one lessons'}</a>
          <a href={locale === 'vi' ? '/ai-speaking/vi/writing' : '/ai-speaking/writing'}>{locale === 'vi' ? 'Luyện viết IELTS' : 'IELTS Writing practice'}</a>
          <a href={locale === 'vi' ? '/vi/student-academy/stories' : '/student-academy/stories'}>{locale === 'vi' ? 'Truyện theo cấp độ' : 'Level stories'}</a>
        </nav>

        <details className="mt-6 text-sm text-sb-forest">
          <summary className="cursor-pointer font-semibold">{locale === 'vi' ? 'Thêm tài liệu học tập' : 'More learning resources'}</summary>
          <nav aria-label={locale === 'vi' ? 'Tài liệu bổ sung' : 'Further resources'} className="mt-3">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {[
                ['/cefr-alignment', 'CEFR alignment', 'Đối chiếu CEFR'],
                ['/teacher-standards', 'Teacher standards', 'Tiêu chuẩn giáo viên'],
                ['/worldwise', 'WorldWise Learning', 'WorldWise Learning'],
                ['/challenges/one-change', 'One Change speaking challenge', 'Thử thách luyện nói One Change (EN)'],
                ['/ielts-speaking-online/india', 'IELTS Speaking in India', 'Luyện IELTS Speaking tại Ấn Độ (EN)'],
                ['/ielts-speaking-online/nigeria', 'IELTS Speaking in Nigeria', 'Luyện IELTS Speaking tại Nigeria (EN)'],
                ['/ielts-speaking-online/philippines', 'IELTS Speaking in the Philippines', 'Luyện IELTS Speaking tại Philippines (EN)'],
                ['/ielts-speaking-online/singapore', 'IELTS Speaking in Singapore', 'Luyện IELTS Speaking tại Singapore (EN)'],
                ['/insights/ielts-speaking-forecast-september-december-2026', 'IELTS Speaking: September–December 2026', 'Dự báo chủ đề IELTS Speaking'],
                ['/tools/ielts-band-score-calculator', 'IELTS band calculator', 'Tính điểm IELTS'],
                ['/tools/ielts-speaking-part-2-timer', 'IELTS Speaking Part 2 timer', 'Đồng hồ IELTS Speaking Part 2'],
                ['/about/nathaniel-jay-adams', 'About Mr. Jay Adams', 'Về thầy Jay Adams'],
              ].map(([href, en, vi]) => <li key={href}><a href={getLocalizedHref(href, locale)} className="underline underline-offset-4">{locale === 'vi' ? vi : en}</a></li>)}
            </ul>
          </nav>
        </details>

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
          <a href="mailto:info@jurassicenglish.com" className="font-semibold text-sb-forest underline underline-offset-4">
            info@jurassicenglish.com
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
