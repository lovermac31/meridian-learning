/**
 * SEO page metadata without the article bodies (src/content/seoPagesMeta.json, generated
 * from seoPages.json by scripts/generate-seo-pages-meta.mjs). Everything the app shell,
 * router and head metadata need; the full pages (with `html`) live in ./seoPages.
 */
import pages from '../content/seoPagesMeta.json';

export type SeoPageMeta = (typeof pages)[number];
export const seoPageMetas: SeoPageMeta[] = pages;
export const getSeoPageMeta = (path: string): SeoPageMeta | undefined => seoPageMetas.find(page => page.path === path);
export const isInternationalMarketPath = (path: string) => /^\/(?:es\/|pt\/|id\/|ms\/|th\/|ar\/|ur\/|bn\/)?ielts-speaking-online(?:\/|$)/.test(path);
export const seoPagePaths = seoPageMetas.map(page => page.path);
export const seoEnglishPaths = seoPageMetas.filter(page => page.locale === 'en' && page.alternatePath !== page.path && !isInternationalMarketPath(page.path)).map(page => page.path);
export const seoVietnamesePaths = seoPageMetas.filter(page => page.locale === 'vi').map(page => page.path);
export const seoPathPairs = seoPageMetas.filter(page => page.locale === 'en' && page.alternatePath !== page.path && !isInternationalMarketPath(page.path)).map(page => [page.path, page.alternatePath] as const);
export function getInternationalAlternates(path: string) {
  const page = getSeoPageMeta(path);
  if (!page || !isInternationalMarketPath(path)) return undefined;
  const counterpart = getSeoPageMeta(page.alternatePath);
  if (!counterpart || counterpart.path === page.path || counterpart.alternatePath !== page.path) return undefined;
  const english = page.locale === 'en' ? page : counterpart.locale === 'en' ? counterpart : undefined;
  if (!english) return undefined;
  return [
    { hrefLang: english.locale, href: `https://jurassicenglish.com${english.path}` },
    { hrefLang: page.locale === 'en' ? counterpart.locale : page.locale, href: `https://jurassicenglish.com${page.locale === 'en' ? counterpart.path : page.path}` },
    { hrefLang: 'x-default', href: `https://jurassicenglish.com${english.path}` },
  ];
}
