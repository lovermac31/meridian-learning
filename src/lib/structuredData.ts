import type { Locale } from '../i18n/locales';

const SITE_URL = 'https://jurassicenglish.com';

export type JsonLd = Record<string, unknown>;

type BreadcrumbItem = {
  name: string;
  path: string;
};

export type CourseParams = {
  name: string;
  description: string;
  educationalLevel: string;
  typicalAgeRange: string;
  url: string;
  locale?: Locale;
};

const organizationId = `${SITE_URL}/#organization`;
const websiteId = `${SITE_URL}/#website`;

export function createOrganizationJsonLd(locale: Locale = 'en'): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': organizationId,
    name: 'Jurassic English™',
    description:
      'Jurassic English™ is a literature-based critical thinking curriculum for schools, providing teacher training, school licensing, curriculum review, and academic consulting.',
    url: SITE_URL,
    inLanguage: locale,
    brand: {
      '@type': 'Brand',
      name: 'Jurassic English™',
    },
    parentOrganization: {
      '@type': 'Organization',
      name: 'World Wise Learning',
    },
    logo: `${SITE_URL}/icon-512.png`,
  };
}

export function createWebsiteJsonLd(locale: Locale = 'en'): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': websiteId,
    url: SITE_URL,
    name: 'Jurassic English™',
    publisher: {
      '@id': organizationId,
    },
    inLanguage: locale,
  };
}

export function createCourseJsonLd(params: CourseParams): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: params.name,
    description: params.description,
    url: params.url,
    provider: {
      '@id': organizationId,
    },
    educationalLevel: params.educationalLevel,
    typicalAgeRange: params.typicalAgeRange,
    inLanguage: params.locale ?? 'en',
    courseMode: 'onsite',
  };
}

export function createBreadcrumbJsonLd(items: BreadcrumbItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

export type ServiceParams = {
  name: string;
  description: string;
  url: string;
  serviceType: string;
  areaServed?: string;
  audienceRole?: string;
};

// Phase 14 — Service schema for institutional consultation/audit routes.
// Deliberately conservative: no Offer/price/availability, no
// AggregateRating/Review, no guarantee fields — those would imply
// commercial promises we don't make. Provider points to the canonical
// EducationalOrganization @id so it inherits the brand identity.
export function createServiceJsonLd(params: ServiceParams): JsonLd {
  const block: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: params.name,
    description: params.description,
    url: params.url,
    serviceType: params.serviceType,
    provider: {
      '@id': organizationId,
    },
  };

  if (params.areaServed) {
    block.areaServed = params.areaServed;
  }

  if (params.audienceRole) {
    block.audience = {
      '@type': 'EducationalAudience',
      educationalRole: params.audienceRole,
    };
  }

  return block;
}

export const INSIGHTS_BASE_PATH = '/insights';

export type ArticleParams = {
  headline: string;
  description: string;
  /** Article slug under /insights (no leading/trailing slash). */
  slug: string;
  /** ISO 8601 date. */
  datePublished: string;
  /** ISO 8601 date; defaults to datePublished. */
  dateModified?: string;
  /** Absolute URL or site-relative path to the hero/social image. */
  image: string;
  /** Real author name — never fabricated. */
  authorName: string;
  /** Optional author profile path/URL. */
  authorUrl?: string;
  /** schema.org subtype; defaults to BlogPosting. */
  articleType?: 'Article' | 'BlogPosting' | 'NewsArticle';
  /** Topic cluster, e.g. "Academic English". */
  section?: string;
  locale?: Locale;
};

const toAbsolute = (value: string): string =>
  value.startsWith('http') ? value : `${SITE_URL}${value.startsWith('/') ? '' : '/'}${value}`;

// Article/BlogPosting schema for genuine editorial content under /insights.
// Publisher references the canonical EducationalOrganization @id (whose node,
// carrying the logo, is emitted alongside on indexable routes). Author is a
// real Person supplied by the content module — this builder never invents an
// author, date, or image. Conservative like the Service builder: no rating,
// no fabricated credentials.
export function createArticleJsonLd(params: ArticleParams): JsonLd {
  const url = `${SITE_URL}${INSIGHTS_BASE_PATH}/${params.slug}`;
  const author: JsonLd = { '@type': 'Person', name: params.authorName };
  if (params.authorUrl) {
    author.url = toAbsolute(params.authorUrl);
  }
  const block: JsonLd = {
    '@context': 'https://schema.org',
    '@type': params.articleType ?? 'BlogPosting',
    headline: params.headline,
    description: params.description,
    image: toAbsolute(params.image),
    datePublished: params.datePublished,
    dateModified: params.dateModified ?? params.datePublished,
    author,
    publisher: { '@id': organizationId },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    inLanguage: params.locale ?? 'en',
    url,
  };
  if (params.section) {
    block.articleSection = params.section;
  }
  return block;
}

export type PersonParams = {
  name: string;
  /** Author profile slug under /insights/author. */
  slug: string;
  jobTitle?: string;
  description?: string;
  /** Verified profiles ONLY — never invent social/sameAs URLs. */
  sameAs?: string[];
};

// Person schema for an author profile page (Phase 12 author entity). worksFor
// points at the canonical org @id so the author is tied to the entity graph.
export function createPersonJsonLd(params: PersonParams): JsonLd {
  const url = `${SITE_URL}${INSIGHTS_BASE_PATH}/author/${params.slug}`;
  const block: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${url}#person`,
    name: params.name,
    url,
    worksFor: { '@id': organizationId },
  };
  if (params.jobTitle) block.jobTitle = params.jobTitle;
  if (params.description) block.description = params.description;
  if (params.sameAs && params.sameAs.length > 0) block.sameAs = params.sameAs;
  return block;
}

export type FaqEntry = {
  question: string;
  answer: string;
};

// FAQPage block for high-intent parent questions. Answers are factual and
// IELTS-aligned only — no guaranteed-score language, no endorsement
// claims (no "official partner of Cambridge / IDP / British Council").
export function createFaqJsonLd(entries: FaqEntry[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: entry.answer,
      },
    })),
  };
}
