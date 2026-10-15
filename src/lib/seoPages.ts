/** Full SEO pages, including the article `html`. Only the SEO page component (lazy) and build scripts import this. */
import pages from '../content/seoPages.json';

export type SeoPage = (typeof pages)[number];
export const seoPages: SeoPage[] = pages;
export const getSeoPage = (path: string): SeoPage | undefined => seoPages.find(page => page.path === path);
export { isInternationalMarketPath, seoPagePaths, seoEnglishPaths, seoVietnamesePaths, seoPathPairs, getInternationalAlternates } from './seoPageMeta';
