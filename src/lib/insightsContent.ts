/**
 * insightsContent.ts — the data contract for the /insights publication layer.
 *
 * This is the single source of truth for editorial articles, mirroring how the
 * rest of the site is data-driven (seriesContent.ts, syllabusContent.ts, …).
 *
 * Published answer-led resources. Examples are explicitly illustrative; sources
 * are named in the article bodies and schema authorship is the publishing brand.
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
  /** Publisher/author label shown to readers. */
  authorName: string;
  /** Optional author profile slug (→ /insights/author/<slug>). */
  authorSlug?: string;
  /** Site-relative image path. */
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

export const insightArticles: InsightArticle[] = [
  { slug: 'what-to-fix-first-in-ielts-speaking', title: 'What should I fix first in IELTS Speaking?', deck: 'A useful diagnostic starts with evidence from the answer, chooses one high-impact priority and gives the learner a practical next attempt.', description: 'Learn how to turn an IELTS Speaking practice answer into one evidence-based priority and a focused independent practice task.', datePublished: '2026-10-10', dateModified: '2026-10-10', authorName: 'Jurassic English™', heroImage: '/images/hero-compass-960.webp', heroAlt: 'Jurassic English compass artwork', section: 'IELTS Speaking', status: 'published' },
  { slug: 'what-typed-speaking-practice-can-assess', title: 'What can typed IELTS-style speaking practice assess?', deck: 'Typed practice can reveal wording, grammar, vocabulary and visible organization. It cannot assess pronunciation or the full delivery of spoken answers.', description: 'Understand the evidence and limitations of typed IELTS-style speaking practice, including why pronunciation requires audio.', datePublished: '2026-10-10', dateModified: '2026-10-10', authorName: 'Jurassic English™', heroImage: '/images/hero-compass-960.webp', heroAlt: 'Jurassic English compass artwork', section: 'Practice and assessment', status: 'published' },
  { slug: 'from-speaking-diagnostic-to-one-to-one-lesson', title: 'How does a speaking diagnostic lead to a one-to-one lesson?', deck: 'A diagnostic is most useful when a learner can inspect the evidence, practise a focused strategy, try again independently and use the follow-up to choose the next step.', description: 'See how Jurassic English connects a speaking diagnostic to guided one-to-one practice and a clear follow-up action.', datePublished: '2026-10-10', dateModified: '2026-10-10', authorName: 'Jurassic English™', heroImage: '/images/hero-compass-960.webp', heroAlt: 'Jurassic English compass artwork', section: 'One-to-one learning', status: 'published' },
];

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
