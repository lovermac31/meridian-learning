/**
 * IELTS Speaking pages moved to jurassicielts.com (Stage 2 of the Speaking move, PR #295, 9 Nov 2026; AI Speaking, P7).
 * Single source of truth: the permanent redirects in vercel.json whose destination is jurassicielts.com.
 * Moved paths leave the sitemap and lose their hreflang pairing; the redirect does the rest.
 *
 * Two kinds of rows are read:
 *  - exact paths (including `{/}?` optional-slash sources): one fixed destination, the query is dropped
 *    (older rows; tests pin that);
 *  - IELTS migration P7 pattern rows: `/ai-speaking/:path(<regex>)` (and its trailing-slash twin) with a destination
 *    `https://jurassicielts.com/ai-speaking/:path`. The regex is compiled to `^/ai-speaking/(<regex>)$`. Pages the
 *    pattern excludes (api, _next, assets, and the 30-day held exam, solutions and ladder pages) stay on JE.
 *    For every /ai-speaking address the query string and fragment are kept (utm, market and pack must survive).
 */
import vercel from '../../vercel.json';

const JI = 'https://jurassicielts.com/';
const PATTERN_PREFIX = '/ai-speaking/';

const strip = (p: string) => (p.length > 1 ? p.replace(/\/$/, '') : p);

type Rule = { source: string; destination: string };
const jiRules = ((vercel as { redirects?: Rule[] }).redirects ?? []).filter((r) => r.destination.startsWith(JI));

const MOVED_MAP: ReadonlyMap<string, string> = new Map(
  jiRules
    .filter((r) => !r.source.includes(':') && !r.source.includes('('))
    .map((r) => [strip(r.source.replace('{/}?', '')), r.destination] as const),
);

type PatternRule = { re: RegExp; destination: string };
const PATTERNS: readonly PatternRule[] = jiRules
  .filter((r) => r.source.startsWith(`${PATTERN_PREFIX}:path(`))
  .map((r) => {
    // `/ai-speaking/:path(<regex>)` or `/ai-speaking/:path(<regex>)/`: take the regex between the outer parentheses.
    const inner = r.source.slice(`${PATTERN_PREFIX}:path(`.length).replace(/\)\/?$/, '');
    return { re: new RegExp(`^/ai-speaking/(${inner})$`), destination: r.destination };
  });

function patternDestination(path: string): string | undefined {
  const p = strip(path);
  for (const { re, destination } of PATTERNS) {
    const hit = re.exec(p);
    if (hit) return destination.replace(':path', hit[1]);
  }
  return undefined;
}

const destinationFor = (path: string) => MOVED_MAP.get(strip(path)) ?? patternDestination(path);

export const MOVED_TO_JURASSICIELTS: ReadonlySet<string> = new Set(MOVED_MAP.keys());

/** True for an exact moved path and for any path a P7 pattern redirect moves (the held pages and /api are false). */
export const isMovedToJurassicielts = (path: string) => destinationFor(path) !== undefined;

/**
 * A link to a moved page goes straight to its jurassicielts.com address (no redirect hop); any other href is unchanged.
 * Older exact rows drop the query; /ai-speaking addresses keep their query string and fragment.
 */
export function movedHref(href: string): string {
  const m = /^(?:https:\/\/(?:www\.)?jurassicenglish\.com)?(\/[^?#]*)/.exec(href);
  if (!m) return href;
  const dest = destinationFor(m[1]);
  if (!dest) return href;
  const isAiSpeaking = m[1] === '/ai-speaking' || m[1].startsWith(PATTERN_PREFIX);
  return isAiSpeaking ? dest + href.slice(m[0].length) : dest;
}

/** Rewrite every href="..." in an HTML string that points at a moved page. */
export const rewriteMovedLinks = (html: string) =>
  html.replace(/href="([^"]+)"/g, (whole, href: string) => {
    const next = movedHref(href);
    return next === href ? whole : `href="${next}"`;
  });
