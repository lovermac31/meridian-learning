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
};

const organizationId = `${SITE_URL}#organization`;
const websiteId = `${SITE_URL}#website`;

export function createOrganizationJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': organizationId,
    name: 'Jurassic English™',
    description:
      'Jurassic English™ is a literature-based critical thinking curriculum for schools, providing teacher training, school licensing, curriculum review, and academic consulting.',
    url: SITE_URL,
    brand: {
      '@type': 'Brand',
      name: 'Jurassic English™',
    },
    parentOrganization: {
      '@type': 'Organization',
      name: 'World Wise Learning',
    },
    logo: `${SITE_URL}/icon-512.png`,
    sameAs: [SITE_URL],
  };
}

export function createWebsiteJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': websiteId,
    url: SITE_URL,
    name: 'Jurassic English™',
    publisher: {
      '@id': organizationId,
    },
    inLanguage: 'en',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
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
    inLanguage: 'en',
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
