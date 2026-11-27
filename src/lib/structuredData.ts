import type { Locale } from '../i18n/locales';
import { IELTS_MOVED_SECTION, PRODUCT_IMAGE_DIR, PRODUCTS, PRODUCTS_PATH } from '../i18n/content/products';
import { STARTERS_IDS, STARTERS_VI_PUBLIC } from '../i18n/content/startersFlags';
import { HOLIDAY_WINDOW, holidaySetPath, type HolidaySet } from '../config/holidaySets';
import { holidaySetComponents, holidaySetText } from '../i18n/content/holidaySets';
import { WORLDWISE_SITE_URL } from './contactConfig';
import { usdFromVnd } from './paypal';
import { hasRegionalPrice, regionalUsd } from './regionalPrice';
import type { Product } from '../i18n/content/products';
import sameAsSource from '../../docs/SAMEAS.json';

const SITE_URL = 'https://jurassicenglish.com';
/** Sister brand of World Wise Learning (IELTS migration P10). */
const JURASSICIELTS_URL = 'https://jurassicielts.com';

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
    alternateName: 'Jurassic English',
    ...(sameAsSource.sameAs.length ? { sameAs: sameAsSource.sameAs } : {}),
    description:
      'Jurassic English™ is a literature-based critical thinking curriculum for schools, providing teacher training, school licensing, curriculum review, and academic consulting.',
    url: SITE_URL,
    inLanguage: locale,
    brand: {
      '@type': 'Brand',
      name: 'Jurassic English™',
    },
    // IELTS migration P10: JurassicIELTS (jurassicielts.com) is the sister brand where all IELTS products, practice and guides
    // live; it is listed here as a brand of the same parent. No IELTS Product, Offer or Course node stays on this site.
    parentOrganization: {
      '@type': 'Organization',
      name: 'World Wise Learning',
      url: WORLDWISE_SITE_URL,
      brand: [
        { '@type': 'Brand', name: 'Jurassic English™', url: SITE_URL },
        { '@type': 'Brand', name: 'JurassicIELTS', url: JURASSICIELTS_URL },
      ],
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

export type WebPageParams = {
  name: string;
  description: string;
  /** Absolute canonical URL of the page. */
  url: string;
  /** Absolute URL of the share image. */
  image: string;
  locale?: string;
};

// Plain WebPage schema for indexable pages that have no richer type (tools, samples, utility pages).
// Claims nothing beyond the page's own title, description and share image; isPartOf/publisher point at the
// canonical WebSite and EducationalOrganization nodes.
export function createWebPageJsonLd(params: WebPageParams): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${params.url}#webpage`,
    url: params.url,
    name: params.name,
    description: params.description,
    inLanguage: params.locale ?? 'en',
    isPartOf: { '@id': websiteId },
    publisher: { '@id': organizationId },
    primaryImageOfPage: { '@type': 'ImageObject', url: params.image },
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
  // IELTS migration P6: IELTS products are sold on jurassicielts.com and are no longer on /products.
  // The Vietnamese Starters copy is held until a native read (startersFlags.ts): not listed in the /vi/products structured data.
  const live = PRODUCTS.filter((product) => product.live && product.section !== IELTS_MOVED_SECTION && (locale === 'en' || STARTERS_VI_PUBLIC || !STARTERS_IDS.includes(product.id)));
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
          availability: product.paused ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
          url: `${pageUrl}#${product.id}`,
          seller: { '@id': organizationId },
        },
      },
    })),
  };
}

// One product page (/products/<id>, Jay 27 Oct 2026): a Product with its VND Offer and, when the card takes PayPal,
// the US$ Offer (ceil(VND ÷ 25,897), the price the PayPal button charges). Cards without PayPal get no USD offer.
/**
 * Product + Offer for one holiday set (28 Nov to 6 Dec 2026). The offer carries its own dates (validFrom, priceValidUntil), the
 * sale price as `price` and the usual total as a ListPrice specification, so a reader of the markup sees the same dated deal as
 * the page. Emitted by the set page only while the window is open (src/components/HolidaySetPage.tsx); the pages are noindex.
 */
export function createHolidaySetJsonLd(set: HolidaySet, locale: Locale): JsonLd {
  const text = holidaySetText(set.id, locale);
  const pageUrl = `${SITE_URL}${locale === 'vi' ? '/vi' : ''}${holidaySetPath(set.id)}`;
  const parts = holidaySetComponents(set).map((product) => product[locale].title);
  const offer = (price: number, priceCurrency: string, listPrice?: number) => ({
    '@type': 'Offer',
    price: String(price),
    priceCurrency,
    availability: 'https://schema.org/InStock',
    url: pageUrl,
    validFrom: HOLIDAY_WINDOW.firstDay,
    priceValidUntil: HOLIDAY_WINDOW.lastDay,
    seller: { '@id': organizationId },
    ...(listPrice ? { priceSpecification: { '@type': 'UnitPriceSpecification', priceType: 'https://schema.org/ListPrice', price: String(listPrice), priceCurrency } } : {}),
  });
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${pageUrl}#product`,
    name: text.title,
    description: `${text.problem} ${text.inside}`,
    url: pageUrl,
    sku: set.id,
    image: `${SITE_URL}${PRODUCT_IMAGE_DIR}/${set.image}.webp`,
    brand: { '@type': 'Brand', name: 'Jurassic English' },
    category: parts.join(' + '),
    offers: [offer(set.saleVnd, 'VND', set.listVnd), offer(set.usd, 'USD')],
  };
}

export function createProductJsonLd(product: Product, locale: Locale, videoId?: string): JsonLd {
  const pageUrl = `${SITE_URL}${locale === 'vi' ? '/vi' : ''}${PRODUCTS_PATH}/${product.id}`;
  const vnd = vndPriceValue(product.price);
  const offer = (price: string, priceCurrency: string) => ({
    '@type': 'Offer',
    price,
    priceCurrency,
    // Paused products (audit fix 4, 11 Nov 2026) keep their page but cannot be bought.
    availability: product.paused ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
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
    // A regional-price product lists its default (highest) tier in US$; the page's picker shows the buyer's own.
    // A fixed US$ price (Phonics, US$7.99) is listed as it is charged.
    offers: [offer(vnd, 'VND'), ...(product.paypal ? [offer(String(product.usd ?? (hasRegionalPrice(product.id) ? regionalUsd(product.id) : usdFromVnd(Number(vnd)))), 'USD')] : [])],
    // The product's film on the same page (video SEO, 27 Oct 2026).
    ...(videoId ? { subjectOf: { '@id': videoId } } : {}),
  };
}
