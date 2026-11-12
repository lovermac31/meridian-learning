/**
 * SEO page metadata without the article bodies (src/content/seoPagesMeta.json, generated
 * from seoPages.json by scripts/generate-seo-pages-meta.mjs). Everything the app shell,
 * router and head metadata need; the full pages (with `html`) live in ./seoPages.
 */
import pages from '../content/seoPagesMeta.json';
import { isMovedToJurassicielts, movedHref } from '../config/movedToJurassicielts';

export type SeoPageMeta = (typeof pages)[number];
export const seoPageMetas: SeoPageMeta[] = pages;
export const getSeoPageMeta = (path: string): SeoPageMeta | undefined => seoPageMetas.find(page => page.path === path);
export const isInternationalMarketPath = (path: string) => /^\/(?:es\/|pt\/|id\/|ms\/|th\/|ar\/|ur\/|bn\/)?ielts-speaking-online(?:\/|$)/.test(path);
export const seoPagePaths = seoPageMetas.map(page => page.path);
export const seoEnglishPaths = seoPageMetas.filter(page => page.locale === 'en' && page.alternatePath !== page.path && !isInternationalMarketPath(page.path)).map(page => page.path);
export const seoVietnamesePaths = seoPageMetas.filter(page => page.locale === 'vi').map(page => page.path);
export const seoPathPairs = seoPageMetas.filter(page => page.locale === 'en' && page.alternatePath !== page.path && !isInternationalMarketPath(page.path)).map(page => [page.path, page.alternatePath] as const);
// The six local-language sets paired with a jurassicielts.com English page (ar, th, id, ms, ur, bn). The Spanish and Portuguese
// pages are not paired yet: jurassicielts.com does not declare them back, so they keep no alternates.
const CROSS_DOMAIN_LOCALES = new Set(['ar', 'th', 'id', 'ms', 'ur', 'bn']);
export function getInternationalAlternates(path: string) {
  const page = getSeoPageMeta(path);
  if (!page || !isInternationalMarketPath(path)) return undefined;
  const counterpart = getSeoPageMeta(page.alternatePath);
  if (!counterpart || counterpart.path === page.path || counterpart.alternatePath !== page.path) return undefined;
  const english = page.locale === 'en' ? page : counterpart.locale === 'en' ? counterpart : undefined;
  if (!english) return undefined;
  // The English twin moved to jurassicielts.com (9 Nov 2026). A local-language page here and the English and Vietnamese pages
  // there form one cross-domain cluster; jurassicielts.com declares the same four tags back (REGION D2, 12 Nov 2026).
  if (isMovedToJurassicielts(english.path)) {
    const en = movedHref(english.path);
    if (!CROSS_DOMAIN_LOCALES.has(page.locale) || !/^https:\/\/jurassicielts\.com\/speaking\/online\/[a-z-]+\/$/.test(en)) return undefined;
    return [
      { hrefLang: 'en', href: en },
      { hrefLang: 'vi', href: en.replace('https://jurassicielts.com/', 'https://jurassicielts.com/vi/') },
      { hrefLang: page.locale, href: `https://jurassicenglish.com${page.path}` },
      { hrefLang: 'x-default', href: en },
    ];
  }
  return [
    { hrefLang: english.locale, href: `https://jurassicenglish.com${english.path}` },
    { hrefLang: page.locale === 'en' ? counterpart.locale : page.locale, href: `https://jurassicenglish.com${page.locale === 'en' ? counterpart.path : page.path}` },
    { hrefLang: 'x-default', href: `https://jurassicenglish.com${english.path}` },
  ];
}
