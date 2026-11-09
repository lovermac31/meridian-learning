/**
 * IELTS Speaking pages moved to jurassicielts.com (Stage 2 of the Speaking move, PR #295, 9 Nov 2026).
 * Single source of truth: the permanent redirects in vercel.json whose destination is jurassicielts.com.
 * Moved paths leave the sitemap and lose their hreflang pairing; the redirect does the rest.
 */
import vercel from '../../vercel.json';

const strip = (p: string) => (p.length > 1 ? p.replace(/\/$/, '') : p);

const MOVED_MAP: ReadonlyMap<string, string> = new Map(
  ((vercel as { redirects?: { source: string; destination: string }[] }).redirects ?? [])
    .filter((r) => r.destination.startsWith('https://jurassicielts.com/'))
    .map((r) => [strip(r.source), r.destination] as const),
);

export const MOVED_TO_JURASSICIELTS: ReadonlySet<string> = new Set(MOVED_MAP.keys());

export const isMovedToJurassicielts = (path: string) => MOVED_TO_JURASSICIELTS.has(strip(path));

/** A link to a moved page goes straight to its jurassicielts.com address (no redirect hop); any other href is unchanged. */
export function movedHref(href: string): string {
  const m = /^(?:https:\/\/(?:www\.)?jurassicenglish\.com)?(\/[^?#]*)/.exec(href);
  if (!m) return href;
  const dest = MOVED_MAP.get(strip(m[1]));
  return dest ?? href;
}

/** Rewrite every href="..." in an HTML string that points at a moved page. */
export const rewriteMovedLinks = (html: string) =>
  html.replace(/href="([^"]+)"/g, (whole, href: string) => {
    const next = movedHref(href);
    return next === href ? whole : `href="${next}"`;
  });
