import pages from '../content/seoPages.json';

export type SeoPage = (typeof pages)[number];
export const seoPages: SeoPage[] = pages;
export const getSeoPage = (path: string): SeoPage | undefined => seoPages.find(page => page.path === path);
export const seoPagePaths = seoPages.map(page => page.path);
export const seoEnglishPaths = seoPages.filter(page => page.locale === 'en').map(page => page.path);
export const seoVietnamesePaths = seoPages.filter(page => page.locale === 'vi').map(page => page.path);
export const seoPathPairs = seoPages.filter(page => page.locale === 'en').map(page => [page.path, page.alternatePath] as const);
