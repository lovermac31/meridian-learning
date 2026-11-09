/**
 * IELTS Speaking pages moved to jurassicielts.com (Stage 2 of the Speaking move, PR #295, 9 Nov 2026).
 * Single source of truth: the permanent redirects in vercel.json whose destination is jurassicielts.com.
 * Moved paths leave the sitemap and lose their hreflang pairing; the redirect does the rest.
 */
import vercel from '../../vercel.json';

const strip = (p: string) => (p.length > 1 ? p.replace(/\/$/, '') : p);

export const MOVED_TO_JURASSICIELTS: ReadonlySet<string> = new Set(
  ((vercel as { redirects?: { source: string; destination: string }[] }).redirects ?? [])
    .filter((r) => r.destination.startsWith('https://jurassicielts.com/'))
    .map((r) => strip(r.source)),
);

export const isMovedToJurassicielts = (path: string) => MOVED_TO_JURASSICIELTS.has(strip(path));
