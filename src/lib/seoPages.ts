/** Full SEO pages, including the article `html`. Only the SEO page component (lazy) and build scripts import this. */
import pages from '../content/seoPages.json';

type SeoPageBase = (typeof pages)[number];
// Hand-checked answer pages (Nov 2026): `hub` puts the page under a country hub in the breadcrumb; `answer` marks the page for
// the closing IELTS-app card and the /insights listing. An English-only page sets alternatePath === path (no hreflang pair).
export type SeoPage = SeoPageBase & { hub?: { name: string; path: string }; answer?: boolean };
export const seoPages: SeoPage[] = pages;
export const getSeoPage = (path: string): SeoPage | undefined => seoPages.find(page => page.path === path);
export { isInternationalMarketPath, seoPagePaths, seoEnglishPaths, seoVietnamesePaths, seoPathPairs, getInternationalAlternates } from './seoPageMeta';
