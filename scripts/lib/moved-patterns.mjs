/**
 * IELTS migration P7: plain-Node twin of the pattern part of src/config/movedToJurassicielts.ts, for the check scripts that
 * run without tsx. Both read the same vercel.json rows: a permanent redirect `/ai-speaking/:path(<regex>)` (or its
 * trailing-slash twin) whose destination starts with https://jurassicielts.com/ moves every path matching
 * `^/ai-speaking/(<regex>)$`; bare /ai-speaking and /ai-speaking/ are exact rows.
 */
const JI = 'https://jurassicielts.com/';
const PREFIX = '/ai-speaking/:path(';

export function movedPathMatcher(redirects) {
  const rules = (redirects || []).filter((r) => String(r.destination).startsWith(JI));
  const exact = new Set(rules.filter((r) => !r.source.includes(':') && !r.source.includes('(')).map((r) => r.source.replace('{/}?', '').replace(/\/$/, '') || '/'));
  const patterns = rules.filter((r) => r.source.startsWith(PREFIX)).map((r) => new RegExp(`^/ai-speaking/(${r.source.slice(PREFIX.length).replace(/\)\/?$/, '')})$`));
  return (pathname) => {
    const p = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
    return exact.has(p) || patterns.some((re) => re.test(p));
  };
}

/** The page routes of the AI Speaking app (jurassic-ai-speaking mvp/app, checked 16 Nov 2026); a typo is not one of them. */
export const AIS_PAGE_ROUTE = /^\/ai-speaking(?:\/vi)?(?:|\/(?:baseline|exam|ladder|ladder\/lesson\/[^/]+|lessons|lessons\/manage|one-to-one|pricing|privacy|samples|samples\/(?:basic|intermediate|advanced)|solutions|terms|writing|writing\/(?:buy|demo|history|photo|practice|sample|feedback\/[^/]+|report\/[^/]+|revise\/[^/]+))|\/(?:admin|paypal))$/;
