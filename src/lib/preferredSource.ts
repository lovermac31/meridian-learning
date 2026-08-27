/**
 * preferredSource.ts — Google "Preferred Sources" integration.
 *
 * Google lets a site invite its audience to mark it as a "preferred source",
 * which surfaces the site's content (with a "preferred" badge) in Top Stories,
 * AI Mode and AI Overviews *for users who opt in*. It is NOT a general ranking
 * signal — it personalises those surfaces for opted-in users only.
 * Docs: https://developers.google.com/search/docs/appearance/preferred-sources
 *
 * Design — progressive enhancement, security-preserving by default:
 *  - DEFAULT: <PreferredSourceButton> is a real <a> to Google's documented
 *    no-JS deeplink (below). This needs NO third-party script and NO
 *    Content-Security-Policy change, and works with JS disabled.
 *  - OPTIONAL: when `VITE_PREFERRED_SOURCE_ENHANCED === 'true'` AND the CSP
 *    allows https://news.google.com, we lazily load Google's publisher.js
 *    (manual mode) ONCE and upgrade the click to the richer in-page opt-in
 *    flow (`preferredSource.addPreferredSource()`). If the script is blocked
 *    or fails, the button silently stays in deeplink mode.
 *
 * The eligibility payoff (Top Stories) is a news surface; a non-news site can
 * embed this but should treat it as a low-cost audience-building affordance,
 * not an SEO lever.
 */

/** Canonical publication identity (apex domain, per Preferred Sources eligibility). */
export const PREFERRED_SOURCE_DOMAIN = 'jurassicenglish.com';

/** Google's documented no-JS deeplink — always-available fallback / target. */
export const PREFERRED_SOURCE_DEEPLINK =
  `https://www.google.com/preferences/source?q=${PREFERRED_SOURCE_DOMAIN}`;

const SCRIPT_SRC = 'https://news.google.com/swg/js/v1/publisher.js';
const LOAD_TIMEOUT_MS = 8000;

export type PreferredSourceApi = {
  init: (opts: { theme?: 'light' | 'dark'; lang?: string }) => void;
  addPreferredSource: () => void;
};

declare global {
  interface Window {
    PREFERRED_SOURCE?: Array<(api: PreferredSourceApi) => void>;
  }
}

export type PreferredSourceLoadState = 'idle' | 'disabled' | 'loading' | 'ready' | 'failed';
let state: PreferredSourceLoadState = 'idle';
let apiPromise: Promise<PreferredSourceApi | null> | null = null;

/**
 * Whether the optional in-page (publisher.js) enhancement is enabled at build
 * time. Reads import.meta.env when present (Vite) and falls back to process.env
 * (node/build/test); defaults OFF — matches the repo's VITE flag convention in
 * src/lib/testimonials.ts.
 */
export function isEnhancedFlowEnabled(): boolean {
  try {
    const viteEnv = (import.meta as unknown as { env?: Record<string, string> }).env;
    if (viteEnv && 'VITE_PREFERRED_SOURCE_ENHANCED' in viteEnv) {
      return viteEnv.VITE_PREFERRED_SOURCE_ENHANCED === 'true';
    }
  } catch {
    /* import.meta not available in this context */
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env.VITE_PREFERRED_SOURCE_ENHANCED === 'true';
  }
  return false;
}

/**
 * Lazily inject publisher.js (manual mode) once and resolve with the API when
 * ready. Resolves `null` — meaning "use the deeplink" — when the enhancement is
 * disabled, when running without a DOM (SSR / tests), or when the script is
 * blocked (CSP), offline, or slow. Idempotent: repeated calls share one promise
 * and one <script>.
 */
export function ensurePreferredSource(
  opts: { theme?: 'light' | 'dark'; lang?: string } = {},
): Promise<PreferredSourceApi | null> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.resolve(null);
  }
  if (!isEnhancedFlowEnabled()) {
    state = 'disabled';
    return Promise.resolve(null);
  }
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve) => {
    state = 'loading';
    let settled = false;
    const settle = (api: PreferredSourceApi | null, next: PreferredSourceLoadState) => {
      if (settled) return;
      settled = true;
      state = next;
      resolve(api);
    };

    // Queue our init callback BEFORE the script evaluates (documented pattern).
    window.PREFERRED_SOURCE = window.PREFERRED_SOURCE || [];
    window.PREFERRED_SOURCE.push((preferredSource) => {
      try {
        preferredSource.init({ theme: opts.theme ?? 'dark', lang: opts.lang ?? 'en' });
      } catch {
        /* init failure is non-fatal — the deeplink fallback still works */
      }
      settle(preferredSource, 'ready');
    });

    const script = document.createElement('script');
    script.async = true;
    script.src = SCRIPT_SRC;
    script.setAttribute('preferred-sources-control', 'manual');
    script.addEventListener('error', () => settle(null, 'failed')); // CSP / offline
    document.head.appendChild(script);

    // Safety net: never leave the promise hanging if the queue never drains.
    window.setTimeout(() => settle(null, 'failed'), LOAD_TIMEOUT_MS);
  });

  return apiPromise;
}

/** Current loader state (for diagnostics / tests). */
export function preferredSourceState(): PreferredSourceLoadState {
  return state;
}
