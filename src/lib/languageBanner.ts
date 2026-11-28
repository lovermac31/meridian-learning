/**
 * languageBanner.ts: when to offer the Vietnamese version of an English page.
 *
 * Decided in the browser after hydration, from the visitor's first preferred language, so the prerendered HTML is the same
 * for every visitor and for search engines (a crawler reports English). It never redirects; it only returns the link the
 * banner offers, and only when the matching Vietnamese page is released (isPublicContentReleased).
 */
import { isPublicContentReleased } from '../i18n/content';
import { resolveLocalizedRoute, switchLocaleRoute } from '../i18n/routing';

export const VI_BANNER_DISMISSED_KEY = 'je-vi-banner-dismissed';

/** True when the visitor's first preferred language is Vietnamese (vi, vi-VN, ...). */
export function prefersVietnamese(languages: readonly string[] | undefined, language?: string): boolean {
  const first = (languages && languages.length > 0 ? languages[0] : language) ?? '';
  return /^vi(-|_|$)/i.test(first.trim());
}

/** The Vietnamese link to offer for this English route, or null when no banner should show. */
export function vietnameseBannerTarget(
  route: string,
  languages: readonly string[] | undefined,
  language: string | undefined,
  dismissed: boolean,
): string | null {
  if (dismissed || !prefersVietnamese(languages, language)) return null;
  const localized = resolveLocalizedRoute(new URL(route, 'https://jurassicenglish.com').pathname);
  if (localized.locale !== 'en' || !localized.isLocalizable || localized.isPrivateOrNonLocalized) return null;
  if (!isPublicContentReleased(localized.pathname, 'vi')) return null;
  return switchLocaleRoute(route, 'vi');
}
