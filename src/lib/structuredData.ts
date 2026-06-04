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
