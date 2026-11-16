/**
 * Live Speaking Baseline (690.000₫) — the paid entry offer, booked in the AI
 * Speaking app (rewrite-served at /ai-speaking). Its booking page speaks EN and
 * VI; every other language falls back to the English page.
 *
 * Shared by the SPA (home fork, proof strip, testimonials empty state) and the
 * static YL page runtime (src/yl/pageI18n.ts). scripts/prerender-yl-vi.mjs
 * hard-codes the same VI URL because it runs as plain Node without TS.
 */
import { movedHref } from '../config/movedToJurassicielts';

export const BASELINE_PATH = '/ai-speaking/baseline';

/**
 * IELTS migration P7: the booking page is served at jurassicielts.com/ai-speaking, so the link goes straight there
 * (movedHref reads the vercel.json redirect and keeps the query), in the SPA bundle, the static YL runtime and JSON-LD alike.
 */
export function baselineHref(lang: string): string {
  return movedHref(lang === 'vi' ? `${BASELINE_PATH}?lang=vi` : BASELINE_PATH);
}
