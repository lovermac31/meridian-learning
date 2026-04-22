import { legalDocuments } from '../lib/legalContent';
import { seriesLevels } from '../lib/seriesContent';
import { syllabusData } from '../lib/syllabusContent';
import { thinkingCycleStages } from '../lib/thinkingCycleContent';
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
  '/series/compare',
  '/thinking-cycle/compare',
] as const;

const NON_LOCALIZED_PATHS = new Set(['/plans-pricing-access']);

const LOCALIZABLE_PUBLIC_PATHS = new Set([
  ...STATIC_PUBLIC_PATHS,
  ...seriesLevels.map((level) => level.path),
  ...syllabusData.map((syllabus) => syllabus.syllabusRoutePath),
  ...thinkingCycleStages.map((stage) => stage.path),
  ...Object.keys(legalDocuments),
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
  const basePathname = isVietnameseRoute
    ? normalizePathname(normalizedPathname.slice(SECONDARY_LOCALE.length + 1) || '/')
    : normalizedPathname;
  const isPrivateOrNonLocalized = isPrivateOrNonLocalizedPath(basePathname);
  const isLocalizable = isLocalizablePublicPath(basePathname);
  const locale =
    isVietnameseRoute && !isPrivateOrNonLocalized ? SECONDARY_LOCALE : DEFAULT_LOCALE;
  const localizedPathname =
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
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  return getLocaleForPathname(window.location.pathname);
}
