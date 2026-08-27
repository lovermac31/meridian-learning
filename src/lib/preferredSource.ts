/**
 * preferredSource.ts — Google "Preferred Sources" integration.
 *
 * Google lets a site invite its audience to mark it as a "preferred source",
 * which surfaces the site's content (with a "preferred" badge) in Top Stories,
 * AI Mode and AI Overviews *for users who opt in*. It is NOT a general ranking
 * signal — it personalises those surfaces for opted-in users only.
 * Docs: https://developers.google.com/search/docs/appearance/preferred-sources
 *
 * The integration deliberately uses Google's documented no-JS deeplink. This
 * needs no third-party script or Content-Security-Policy change and works with
 * JavaScript disabled.
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
