import type { Locale } from '../i18n/locales';
import { PRODUCT_IMAGE_DIR, PRODUCTS, PRODUCTS_PATH } from '../i18n/content/products';
import { WORLDWISE_SITE_URL } from './contactConfig';
import { usdFromVnd } from './paypal';
import type { Product } from '../i18n/content/products';

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
      url: WORLDWISE_SITE_URL,
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
  areaServed?: string | JsonLd;
  audienceRole?: string;
  offers?: JsonLd[];
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

  if (params.offers?.length) {
    block.offers = params.offers;
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
  /** Use Organization for brand-authored material; Person remains the default for compatibility. */
  authorType?: 'Person' | 'Organization';
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
  const author: JsonLd = { '@type': params.authorType ?? 'Person', name: params.authorName };
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

/** '4.900.000₫' → '4900000' (prices on /products are whole VND with dot grouping). */
export const vndPriceValue = (price: string) => price.replace(/\D/g, '');

// /products (master, 27 Oct 2026): one Product with a VND Offer for every live card, in the page language. The
// offer URL is the card itself; the description is the card's "What's inside" line.
export function createProductListJsonLd(locale: Locale): JsonLd {
  const pageUrl = `${SITE_URL}${locale === 'vi' ? '/vi' : ''}${PRODUCTS_PATH}`;
  const live = PRODUCTS.filter((product) => product.live);
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: locale === 'vi' ? 'Sản phẩm Jurassic English' : 'Jurassic English products',
    url: pageUrl,
    numberOfItems: live.length,
    itemListElement: live.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product[locale].title,
        description: product[locale].inside,
        url: `${pageUrl}#${product.id}`,
        ...(product.image ? { image: `${SITE_URL}${PRODUCT_IMAGE_DIR}/${product.image}.webp` } : {}),
        brand: { '@type': 'Brand', name: 'Jurassic English' },
        offers: {
          '@type': 'Offer',
          price: vndPriceValue(product.price),
          priceCurrency: 'VND',
          availability: 'https://schema.org/InStock',
          url: `${pageUrl}#${product.id}`,
          seller: { '@id': organizationId },
        },
      },
    })),
  };
}

// One product page (/products/<id>, Jay 27 Oct 2026): a Product with its VND Offer and, when the card takes PayPal,
// the US$ Offer (ceil(VND ÷ 25,897), the price the PayPal button charges). Cards without PayPal get no USD offer.
export function createProductJsonLd(product: Product, locale: Locale, videoId?: string): JsonLd {
  const pageUrl = `${SITE_URL}${locale === 'vi' ? '/vi' : ''}${PRODUCTS_PATH}/${product.id}`;
  const vnd = vndPriceValue(product.price);
  const offer = (price: string, priceCurrency: string) => ({
    '@type': 'Offer',
    price,
    priceCurrency,
    availability: 'https://schema.org/InStock',
    url: pageUrl,
    seller: { '@id': organizationId },
  });
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${pageUrl}#product`,
    name: product[locale].title,
    description: `${product[locale].problem} ${product[locale].inside}`,
    url: pageUrl,
    sku: product.id,
    ...(product.image ? { image: `${SITE_URL}${PRODUCT_IMAGE_DIR}/${product.image}.webp` } : {}),
    brand: { '@type': 'Brand', name: 'Jurassic English' },
    offers: [offer(vnd, 'VND'), ...(product.paypal ? [offer(String(usdFromVnd(Number(vnd))), 'USD')] : [])],
    // The product's film on the same page (video SEO, 27 Oct 2026).
    ...(videoId ? { subjectOf: { '@id': videoId } } : {}),
  };
}
