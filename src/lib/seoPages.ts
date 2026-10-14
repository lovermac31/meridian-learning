import pages from '../content/seoPages.json';

export type SeoPage = (typeof pages)[number];
export const seoPages: SeoPage[] = pages;
export const getSeoPage = (path: string): SeoPage | undefined => seoPages.find(page => page.path === path);
export const isInternationalMarketPath = (path: string) => /^\/(?:es\/|pt\/|id\/|ms\/|th\/|ar\/|ur\/|bn\/)?ielts-speaking-online(?:\/|$)/.test(path);
export const seoPagePaths = seoPages.map(page => page.path);
export const seoEnglishPaths = seoPages.filter(page => page.locale === 'en' && page.alternatePath !== page.path && !isInternationalMarketPath(page.path)).map(page => page.path);
export const seoVietnamesePaths = seoPages.filter(page => page.locale === 'vi').map(page => page.path);
export const seoPathPairs = seoPages.filter(page => page.locale === 'en' && page.alternatePath !== page.path && !isInternationalMarketPath(page.path)).map(page => [page.path, page.alternatePath] as const);
export function getInternationalAlternates(path: string) {
  const page = getSeoPage(path);
  if (!page || !isInternationalMarketPath(path)) return undefined;
  const counterpart = getSeoPage(page.alternatePath);
  if (!counterpart || counterpart.path === page.path || counterpart.alternatePath !== page.path) return undefined;
  const english = page.locale === 'en' ? page : counterpart.locale === 'en' ? counterpart : undefined;
  if (!english) return undefined;
  return [
    { hrefLang: english.locale, href: `https://jurassicenglish.com${english.path}` },
    { hrefLang: page.locale === 'en' ? counterpart.locale : page.locale, href: `https://jurassicenglish.com${page.locale === 'en' ? counterpart.path : page.path}` },
    { hrefLang: 'x-default', href: `https://jurassicenglish.com${english.path}` },
  ];
}
