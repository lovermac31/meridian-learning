/**
 * The `href` attribute an internal link renders on a localized page — the URL
 * that crawlers which do not run JavaScript (Bing, Cốc Cốc, AI crawlers) read
 * in the prerendered HTML.
 *
 * Clicks are not affected: SPA link handlers keep passing the original
 * (English) target to App.navigateTo → localizeRouteTarget(). The href only
 * switches to the localized URL when that URL is in the public indexable set
 * (getExpectedPublicIndexableRoutes()), so it is always either the original
 * href or exactly where a click already goes, and never a noindex "available
 * soon" placeholder.
 *
 * Depends on the pathname-derived locale only, so the build-time server render
 * and the hydrating client produce the same markup.
 */
import { BASELINE_PATH, baselineHref } from '../lib/baselineLink';
import { getExpectedPublicIndexableRoutes } from '../lib/routeMetadata';
import { DEFAULT_LOCALE, type Locale } from './locales';
import { getLocaleForPathname, localizeRouteTarget } from './routing';

// Pages outside the SPA router (static page / vercel.json rewrite) whose
// localized URL is live, self-canonical and indexable. Matched on the exact href.
const LOCALIZED_STATIC_HREFS: Record<string, Partial<Record<Locale, string>>> = {
  // Static page in public/; the VI page is written by scripts/prerender-yl-vi.mjs.
  '/young-learners-speaking/': { vi: '/vi/luyen-noi-ielts/' },
  // AI Speaking app: VI landing page and VI baseline booking page.
  '/ai-speaking': { vi: '/ai-speaking/vi' },
  [BASELINE_PATH]: { vi: baselineHref('vi') },
};

let indexableRoutes: Set<string> | null = null;

function isIndexableRoute(pathname: string) {
  indexableRoutes ??= new Set(getExpectedPublicIndexableRoutes());
  return indexableRoutes.has(pathname);
}

export function getLocalizedHref(href: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return href;

  const staticHref = LOCALIZED_STATIC_HREFS[href]?.[locale];
  if (staticHref) return staticHref;

  // Same-origin paths only: #anchors, mailto:, external and protocol-relative
  // URLs are returned untouched.
  if (!href.startsWith('/') || href.startsWith('//')) return href;

  const localized = localizeRouteTarget(href, locale);
  const { pathname } = new URL(localized, 'https://jurassicenglish.com');

  return getLocaleForPathname(pathname) === locale && isIndexableRoute(pathname)
    ? localized
    : href;
}
