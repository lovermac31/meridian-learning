/**
 * insightsContent.ts — the data contract for the /insights publication layer.
 *
 * This is the single source of truth for editorial articles, mirroring how the
 * rest of the site is data-driven (seriesContent.ts, syllabusContent.ts, …).
 *
 * SHIPS DARK: `insightArticles` is intentionally EMPTY. No fabricated content is
 * published. The /insights route family (see docs/insights-editorial-roadmap.md)
 * derives its indexable routes from `getPublishedInsightArticles()`, so with an
 * empty list NOTHING is added to the sitemap, the prerender set, or the router —
 * the section is inert until a real, authored article is added here with
 * `status: 'published'`. That keeps the build honest to the command's rule:
 * "Do not create empty taxonomy pages / Do not publish fabricated articles."
 */
import type { Locale } from '../i18n/locales';

export type InsightArticleStatus = 'draft' | 'published';

export type InsightArticle = {
  /** URL slug under /insights (no slashes). */
  slug: string;
  /** H1 / og:title. */
  title: string;
  /** Short deck/summary shown under the H1 and used as the description. */
  deck: string;
  /** Meta description (defaults to `deck` if omitted at render time). */
  description?: string;
  /** ISO 8601 publication date. */
  datePublished: string;
  /** ISO 8601 last-modified date; defaults to datePublished. */
  dateModified?: string;
  /** Real author name — never fabricated. */
  authorName: string;
  /** Optional author profile slug (→ /insights/author/<slug>). */
  authorSlug?: string;
  /** Site-relative hero/social image path. */
  heroImage: string;
  /** Accessible alt text for the hero image. */
  heroAlt: string;
  /** Topic cluster, e.g. "Academic English", "CEIW", "IELTS". */
  section: string;
  /** schema.org subtype; defaults to BlogPosting. */
  articleType?: 'Article' | 'BlogPosting';
  locale?: Locale;
  /** Only `published` articles are routed, indexed, and sitemapped. */
  status: InsightArticleStatus;
};

/**
 * INTENTIONALLY EMPTY. Add real, authored articles here (status: 'published')
 * to activate the /insights section. See docs/insights-editorial-roadmap.md.
 */
export const insightArticles: InsightArticle[] = [];

/** Base path for the publication layer. */
export const INSIGHTS_BASE_PATH = '/insights';

/** Published articles only — the set that is routed, indexed, and sitemapped. */
export function getPublishedInsightArticles(): InsightArticle[] {
  return insightArticles.filter((article) => article.status === 'published');
}

/** Resolve a published article by slug (undefined if missing or unpublished). */
export function getInsightArticleBySlug(slug: string): InsightArticle | undefined {
  return getPublishedInsightArticles().find((article) => article.slug === slug);
}

/** Canonical route paths contributed to the indexable set (empty until content). */
export function getInsightRoutePaths(): string[] {
  const published = getPublishedInsightArticles();
  if (published.length === 0) return [];
  return [INSIGHTS_BASE_PATH, ...published.map((a) => `${INSIGHTS_BASE_PATH}/${a.slug}`)];
}
