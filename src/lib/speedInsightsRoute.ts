const STATIC_ROUTE_PATTERNS = new Set([
  '/',
  '/available-soon',
  '/worldwise',
  '/audit-sprint',
  '/pilot-programme',
  '/discovery',
  '/methodology',
  '/cefr-alignment',
  '/teacher-standards',
  '/framework',
  '/get-started',
  '/external/pilot',
  '/internal/pilot-requests',
  '/internal/approval-action',
  '/series/compare',
  '/thinking-cycle/compare',
]);

function parsePathname(route: string) {
  const target =
    route.trim().length === 0
      ? '/'
      : route.startsWith('?') || route.startsWith('#')
        ? `/${route}`
        : route;

  try {
    return new URL(target, 'https://jurassicenglish.com').pathname;
  } catch {
    return '/unknown';
  }
}

function normalizeTrailingSlash(pathname: string) {
  if (!pathname || pathname === '/') return '/';
  if (pathname === '/vi') return '/vi';
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

function splitLocalePrefix(pathname: string) {
  const normalizedPathname = normalizeTrailingSlash(pathname);
  const hasVietnamesePrefix =
    normalizedPathname === '/vi' || normalizedPathname.startsWith('/vi/');
  const basePathname = hasVietnamesePrefix
    ? normalizeTrailingSlash(normalizedPathname.slice('/vi'.length) || '/')
    : normalizedPathname;

  return {
    localePrefix: hasVietnamesePrefix &&
      basePathname !== '/plans-pricing-access' &&
      basePathname !== '/external/pilot' &&
      basePathname !== '/internal/pilot-requests' &&
      basePathname !== '/internal/approval-action' ? '/vi' : '',
    basePathname,
  };
}

function withLocalePrefix(localePrefix: string, pattern: string) {
  if (
    !localePrefix ||
    pattern === '/plans-pricing-access' ||
    pattern === '/external/pilot' ||
    pattern === '/internal/pilot-requests' ||
    pattern === '/internal/approval-action'
  ) return pattern;
  return pattern === '/' ? localePrefix : `${localePrefix}${pattern}`;
}

/**
 * Converts concrete SPA URLs into stable Vercel Speed Insights route buckets.
 *
 * Query strings, hashes, and token-bearing values are intentionally ignored so
 * observability data cannot fragment by campaign/form state or private tokens.
 */
export function normalizeSpeedInsightsRoute(route: string) {
  const { localePrefix, basePathname } = splitLocalePrefix(parsePathname(route));

  if (STATIC_ROUTE_PATTERNS.has(basePathname)) {
    return withLocalePrefix(localePrefix, basePathname);
  }

  if (
    basePathname === '/plans-pricing-access' ||
    basePathname === '/external/pilot' ||
    basePathname === '/internal/pilot-requests' ||
    basePathname === '/internal/approval-action'
  ) {
    return basePathname;
  }

  if (/^\/series\/[^/]+\/syllabus$/.test(basePathname)) {
    return withLocalePrefix(localePrefix, '/series/[level]/syllabus');
  }

  if (/^\/series\/[^/]+$/.test(basePathname)) {
    return withLocalePrefix(localePrefix, '/series/[level]');
  }

  if (/^\/thinking-cycle\/[^/]+$/.test(basePathname)) {
    return withLocalePrefix(localePrefix, '/thinking-cycle/[stage]');
  }

  if (/^\/legal\/[^/]+$/.test(basePathname)) {
    return withLocalePrefix(localePrefix, '/legal/[policy]');
  }

  return withLocalePrefix(localePrefix, '/unknown');
}
