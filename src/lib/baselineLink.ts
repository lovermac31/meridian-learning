/**
 * Live Speaking Baseline (690.000₫) — the paid entry offer, booked in the AI
 * Speaking app (rewrite-served at /ai-speaking). Its booking page speaks EN and
 * VI; every other language falls back to the English page.
 *
 * Shared by the SPA (home fork, proof strip, testimonials empty state) and the
 * static YL page runtime (src/yl/pageI18n.ts). scripts/prerender-yl-vi.mjs
 * hard-codes the same VI URL because it runs as plain Node without TS.
 */
export const BASELINE_PATH = '/ai-speaking/baseline';

export function baselineHref(lang: string): string {
  return lang === 'vi' ? `${BASELINE_PATH}?lang=vi` : BASELINE_PATH;
}
