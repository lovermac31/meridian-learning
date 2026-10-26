import { legalDocuments } from '../lib/legalContent';
import { seriesLevels } from '../lib/seriesContent';
import { syllabusData } from '../lib/syllabusContent';
import { thinkingCycleStages } from '../lib/thinkingCycleContent';
import { getCurrentPathname } from '../lib/ssrLocation';
import { seoEnglishPaths, seoPathPairs } from '../lib/seoPageMeta';
import {
  DEFAULT_LOCALE,
  SECONDARY_LOCALE,
  type Locale,
  getLocaleDefinition,
} from './locales';

const STATIC_PUBLIC_PATHS = [
  '/',
  '/framework',
  '/get-started',
  '/available-soon',
  '/worldwise',
  '/audit-sprint',
  '/pilot-programme',
  '/discovery',
  '/methodology',
  '/cefr-alignment',
  '/teacher-standards',
  '/story-club',
  '/products',
  '/series/compare',
  '/thinking-cycle/compare',
  '/tools/ielts-band-score-calculator',
  '/tools/ielts-speaking-part-2-timer',
] as const;

const TOOL_VI_PATHS: Record<string, string> = {
  '/tools/ielts-band-score-calculator': '/vi/cong-cu/tinh-diem-ielts',
  '/tools/ielts-speaking-part-2-timer': '/vi/cong-cu/dong-ho-ielts-speaking-part-2',
};
const TOOL_EN_PATHS = Object.fromEntries(Object.entries(TOOL_VI_PATHS).map(([en, vi]) => [vi, en]));
const SEO_VI_PATHS = Object.fromEntries(seoPathPairs);
const SEO_EN_PATHS = Object.fromEntries(seoPathPairs.map(([en, vi]) => [vi, en]));

const NON_LOCALIZED_PATHS = new Set([
  '/plans-pricing-access',
  '/external/pilot',
  '/internal/pilot-requests',
]);

const LOCALIZABLE_PUBLIC_PATHS = new Set([
  ...STATIC_PUBLIC_PATHS,
  ...seriesLevels.map((level) => level.path),
  ...syllabusData.map((syllabus) => syllabus.syllabusRoutePath),
  ...thinkingCycleStages.map((stage) => stage.path),
  ...Object.keys(legalDocuments),
  '/insights',
  ...seoEnglishPaths,
]);

type ParsedRouteTarget = {
  pathname: string;
  search: string;
  hash: string;
};

export type LocalizedRoute = {
  locale: Locale;
  pathname: string;
  localizedPathname: string;
  isLocalizedVariant: boolean;
  isLocalizable: boolean;
  isPrivateOrNonLocalized: boolean;
};

function normalizePathname(pathname: string) {
  if (!pathname) return '/';
  if (pathname === '/vi') return '/vi';
  return pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

function parseRouteTarget(target: string): ParsedRouteTarget {
  const normalizedTarget = !target
    ? '/'
    : target.startsWith('#')
      ? `/${target}`
      : target.startsWith('?')
        ? `/${target}`
        : target;
  const url = new URL(normalizedTarget, 'https://jurassicenglish.com');

  return {
    pathname: normalizePathname(url.pathname),
    search: url.search,
    hash: url.hash,
  };
}

function buildRouteTarget({ pathname, search, hash }: ParsedRouteTarget) {
  return `${pathname}${search}${hash}`;
}

export function getLocalizablePublicPaths() {
  return Array.from(LOCALIZABLE_PUBLIC_PATHS);
}

export function getLocalizedPathname(pathname: string, locale: Locale) {
  const normalizedPathname = normalizePathname(pathname);

  if (!isLocalizablePublicPath(normalizedPathname) || isPrivateOrNonLocalizedPath(normalizedPathname)) {
    return normalizedPathname;
  }

  if (locale === DEFAULT_LOCALE) {
    return normalizedPathname;
  }

  if (TOOL_VI_PATHS[normalizedPathname]) return TOOL_VI_PATHS[normalizedPathname];
  if (SEO_VI_PATHS[normalizedPathname]) return SEO_VI_PATHS[normalizedPathname];
  const { routePrefix } = getLocaleDefinition(locale);
  return normalizedPathname === '/' ? routePrefix : `${routePrefix}${normalizedPathname}`;
}

export function isLocalizablePublicPath(pathname: string) {
  return LOCALIZABLE_PUBLIC_PATHS.has(normalizePathname(pathname));
}

export function isPrivateOrNonLocalizedPath(pathname: string) {
  return NON_LOCALIZED_PATHS.has(normalizePathname(pathname));
}

export function resolveLocalizedRoute(pathname: string): LocalizedRoute {
  const normalizedPathname = normalizePathname(pathname);
  const isVietnameseRoute =
    normalizedPathname === `/${SECONDARY_LOCALE}` ||
    normalizedPathname.startsWith(`/${SECONDARY_LOCALE}/`);
  const basePathname = TOOL_EN_PATHS[normalizedPathname] ?? SEO_EN_PATHS[normalizedPathname] ?? (isVietnameseRoute
    ? normalizePathname(normalizedPathname.slice(SECONDARY_LOCALE.length + 1) || '/')
    : normalizedPathname);
  const isPrivateOrNonLocalized = isPrivateOrNonLocalizedPath(basePathname);
  const isLocalizable = isLocalizablePublicPath(basePathname);
  const locale =
    isVietnameseRoute && !isPrivateOrNonLocalized ? SECONDARY_LOCALE : DEFAULT_LOCALE;
  const localizedPathname = TOOL_EN_PATHS[normalizedPathname] || SEO_EN_PATHS[normalizedPathname] ? normalizedPathname :
    locale === DEFAULT_LOCALE
      ? basePathname
      : basePathname === '/'
        ? `/${SECONDARY_LOCALE}`
        : `/${SECONDARY_LOCALE}${basePathname}`;

  return {
    locale,
    pathname: basePathname,
    localizedPathname,
    isLocalizedVariant: isVietnameseRoute && isLocalizable && !isPrivateOrNonLocalized,
    isLocalizable,
    isPrivateOrNonLocalized,
  };
}

export function localizeRouteTarget(target: string, locale: Locale) {
  const parsed = parseRouteTarget(target);

  if (parsed.hash && parsed.pathname === '/') {
    if (locale === DEFAULT_LOCALE) {
      return buildRouteTarget(parsed);
    }

    return buildRouteTarget({
      ...parsed,
      pathname: `/${SECONDARY_LOCALE}`,
    });
  }

  const resolved = resolveLocalizedRoute(parsed.pathname);

  if (!resolved.isLocalizable || resolved.isPrivateOrNonLocalized) {
    return buildRouteTarget({
      ...parsed,
      pathname: resolved.pathname,
    });
  }

  const pathname = getLocalizedPathname(resolved.pathname, locale);

  return buildRouteTarget({
    ...parsed,
    pathname,
  });
}

export function switchLocaleRoute(currentRoute: string, targetLocale: Locale) {
  return localizeRouteTarget(currentRoute, targetLocale);
}

export function getLocaleForPathname(pathname: string): Locale {
  return resolveLocalizedRoute(pathname).locale;
}

export function getCurrentLocale(): Locale {
  // SSR-safe: resolves to the route being prerendered at build time, and to
  // window.location in the browser.
  return getLocaleForPathname(getCurrentPathname());
}
