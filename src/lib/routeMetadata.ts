import { legalDocuments } from './legalContent';
import { getSeriesLevelByPath, seriesLevels } from './seriesContent';
import { getSyllabusByRoutePath, syllabusData } from './syllabusContent';
import { getThinkingCycleStageByPath, thinkingCycleStages } from './thinkingCycleContent';
import {
  createBreadcrumbJsonLd,
  createCourseJsonLd,
  createOrganizationJsonLd,
  createWebsiteJsonLd,
  type JsonLd,
} from './structuredData';

const SITE_URL = 'https://jurassicenglish.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-image.png`;
const SITE_NAME = 'Jurassic English™';

type BaseMetadata = {
  title: string;
  description: string;
  canonical?: string;
  robots?: string;
  jsonLd?: JsonLd[];
};

export type RouteMetadata = BaseMetadata & {
  og: {
    title: string;
    description: string;
    url: string;
    image: string;
    type: string;
    siteName: string;
    locale: string;
  };
  twitter: {
    card: string;
    title: string;
    description: string;
    image: string;
  };
};

type StaticRouteDefinition = {
  title: string;
  description: string;
  canonicalPath: string;
  shouldIndex?: boolean;
  breadcrumbs?: Array<{ name: string; path: string }>;
  jsonLd?: JsonLd[];
};

const homeTitle = 'Critical Thinking Through Literature for Schools | Jurassic English™';
const homeDescription =
  'Jurassic English™ is a literature-based critical thinking curriculum for schools. Five structured levels from Pre-A1 to C1, covering ages 4–14+. Teacher training, school licensing, and curriculum review.';

const staticRoutes: Record<string, StaticRouteDefinition> = {
  '/': {
    title: homeTitle,
    description: homeDescription,
    canonicalPath: '/',
    jsonLd: [createOrganizationJsonLd(), createWebsiteJsonLd()],
  },
  '/framework': {
    title: 'Literature-Based Critical Thinking Framework | Jurassic English™',
    description:
      'The Jurassic English™ framework integrates the Jurassic Thinking Cycle, CEFR progression, and ecocentric pedagogy into a structured school curriculum from Pre-A1 to C1.',
    canonicalPath: '/framework',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Framework', path: '/framework' },
    ],
  },
  '/get-started': {
    title: 'Enquire About Teacher Training and School Licensing | Jurassic English™',
    description:
      'Contact Jurassic English™ to enquire about teacher training, school licensing, curriculum review, or academic consulting. Tailored to your school setting.',
    canonicalPath: '/get-started',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Get Started', path: '/get-started' },
    ],
  },
  '/series/compare': {
    title: 'Compare Jurassic English™ Curriculum Levels | Jurassic English™',
    description:
      'Compare all five Jurassic English™ curriculum levels — ages 4–14+, Pre-A1 to C1 — by age band, CEFR range, text complexity, and reasoning expectations.',
    canonicalPath: '/series/compare',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Series Comparison', path: '/series/compare' },
    ],
  },
  '/thinking-cycle/compare': {
    title: 'The Jurassic Thinking Cycle™ — All Four Stages | Jurassic English™',
    description:
      'Compare the Analyze, Evaluate, Justify, and Reflect stages of the Jurassic Thinking Cycle™ and see how structured reasoning develops across every lesson.',
    canonicalPath: '/thinking-cycle/compare',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Thinking Cycle Comparison', path: '/thinking-cycle/compare' },
    ],
  },
  '/plans-pricing-access': {
    title: 'Private Plans and Pricing Access | Jurassic English™',
    description:
      'Private access route for approved Jurassic English™ plans and pricing review. This page is not intended for search indexing.',
    canonicalPath: '/plans-pricing-access',
    shouldIndex: false,
  },
};

function toAbsoluteUrl(pathname: string) {
  return pathname === '/' ? SITE_URL : `${SITE_URL}${pathname}`;
}

function createBreadcrumbs(items?: Array<{ name: string; path: string }>) {
  if (!items || items.length === 0) {
    return undefined;
  }

  return [createBreadcrumbJsonLd(items)];
}

function normalizeDescription(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

function createMetadata({
  title,
  description,
  canonical,
  robots,
  jsonLd,
  ogTitle,
  ogDescription,
  ogUrl,
}: BaseMetadata & {
  ogTitle?: string;
  ogDescription?: string;
  ogUrl?: string;
}): RouteMetadata {
  const normalizedDescription = normalizeDescription(description);
  const socialTitle = ogTitle ?? title;
  const socialDescription = normalizeDescription(ogDescription ?? normalizedDescription);
  const socialUrl = ogUrl ?? canonical ?? SITE_URL;

  return {
    title,
    description: normalizedDescription,
    canonical,
    robots,
    jsonLd,
    og: {
      title: socialTitle,
      description: socialDescription,
      url: socialUrl,
      image: DEFAULT_OG_IMAGE,
      type: 'website',
      siteName: SITE_NAME,
      locale: 'en_GB',
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description: socialDescription,
      image: DEFAULT_OG_IMAGE,
    },
  };
}

function resolveStaticRoute(pathname: string): RouteMetadata | null {
  const route = staticRoutes[pathname];

  if (!route) {
    return null;
  }

  const shouldIndex = route.shouldIndex ?? true;
  const canonical = shouldIndex ? toAbsoluteUrl(route.canonicalPath) : undefined;
  const robots = shouldIndex ? 'index, follow' : 'noindex, nofollow';
  const jsonLd = shouldIndex
    ? route.jsonLd ?? createBreadcrumbs(route.breadcrumbs)
    : undefined;

  return createMetadata({
    title: route.title,
    description: route.description,
    canonical,
    robots,
    jsonLd,
    ogUrl: shouldIndex ? canonical : toAbsoluteUrl(route.canonicalPath),
  });
}

const seriesLevelSeoDescriptions: Record<string, string> = {
  'level-1-foundation':
    'Jurassic English™ Level 1 develops critical thinking for ages 4–8 through picture books, guided reasoning, and first academic writing. Supports Pre-A1 to A1 CEFR progression.',
  'level-2-development':
    'Jurassic English™ Level 2 builds structured reasoning for ages 8–10 through early chapter books, evidence-based writing, and Socratic discussion. Supports A1 to A2 CEFR progression.',
  'level-3-expansion':
    'Jurassic English™ Level 3 develops the Literacy Pivot for ages 10–12, using complex chapter books to build academic reasoning and CEIW writing. Supports A2 to B1 CEFR progression.',
  'level-4-mastery':
    'Jurassic English™ Level 4 develops novel analysis and academic argumentation for ages 12–14 through contested texts and multi-paragraph essays. Supports B1 to B2 CEFR progression.',
  'level-5-advanced':
    'Jurassic English™ Level 5 builds full academic language proficiency for ages 14+ through intertextual analysis and research essays. Supports B2 to C1 CEFR and IB/Cambridge preparation.',
};

function resolveSeriesRoute(pathname: string): RouteMetadata | null {
  const level = getSeriesLevelByPath(pathname);

  if (!level) {
    return null;
  }

  const title = `${level.title} — Ages ${level.ageBand} | Jurassic English™`;
  const description =
    seriesLevelSeoDescriptions[level.slug] ??
    `${level.title} is the Jurassic English™ literature curriculum for ages ${level.ageBand}, supporting ${level.cefrRange} learners through structured reasoning and academic expression.`;

  const canonicalUrl = toAbsoluteUrl(level.path);

  const breadcrumb = createBreadcrumbs([
    { name: 'Home', path: '/' },
    { name: 'Series Comparison', path: '/series/compare' },
    { name: level.title, path: level.path },
  ]);

  const course = createCourseJsonLd({
    name: level.title,
    description,
    educationalLevel: level.cefrRange,
    typicalAgeRange: level.ageBand,
    url: canonicalUrl,
  });

  return createMetadata({
    title,
    description,
    canonical: canonicalUrl,
    robots: 'index, follow',
    jsonLd: [...(breadcrumb ?? []), course],
  });
}

function resolveThinkingCycleRoute(pathname: string): RouteMetadata | null {
  const stage = getThinkingCycleStageByPath(pathname);

  if (!stage) {
    return null;
  }

  const title = `${stage.title} — Jurassic Thinking Cycle™ Stage Guide | Jurassic English™`;
  const description = `The ${stage.title} stage of the Jurassic Thinking Cycle™: ${stage.line} A structured reasoning framework to guide teachers and students through literature at every level.`;

  return createMetadata({
    title,
    description,
    canonical: toAbsoluteUrl(stage.path),
    robots: 'index, follow',
    jsonLd: createBreadcrumbs([
      { name: 'Home', path: '/' },
      { name: 'Thinking Cycle Comparison', path: '/thinking-cycle/compare' },
      { name: stage.title, path: stage.path },
    ]),
  });
}

function resolveSyllabusRoute(pathname: string): RouteMetadata | null {
  const syllabus = getSyllabusByRoutePath(pathname);

  if (!syllabus) {
    return null;
  }

  const levelPath = pathname.replace('/syllabus', '');
  const level = getSeriesLevelByPath(levelPath);

  if (!level) {
    return null;
  }

  const title = `${level.title} Syllabus — Ages ${level.ageBand} | Jurassic English™`;
  const description = `The full Jurassic English™ ${level.title} curriculum syllabus for ages ${level.ageBand}. Core texts, term breakdown, assessment methods, eco-reasoning strand, and CEFR progression (${level.cefrRange}).`;
  const canonicalUrl = toAbsoluteUrl(pathname);

  return createMetadata({
    title,
    description,
    canonical: canonicalUrl,
    robots: 'index, follow',
    jsonLd: createBreadcrumbs([
      { name: 'Home', path: '/' },
      { name: 'Series Comparison', path: '/series/compare' },
      { name: level.title, path: levelPath },
      { name: 'Syllabus', path: pathname },
    ]),
  });
}

function resolveLegalRoute(pathname: string): RouteMetadata | null {
  const document = legalDocuments[pathname];

  if (!document) {
    return null;
  }

  const description = `${document.title} for Jurassic English™, including ${document.callout.label.toLowerCase()} and current policy details for site visitors, schools, and partners.`;

  return createMetadata({
    title: `${document.title} | Jurassic English™`,
    description,
    canonical: toAbsoluteUrl(pathname),
    robots: 'index, follow',
    jsonLd: createBreadcrumbs([
      { name: 'Home', path: '/' },
      { name: document.title, path: pathname },
    ]),
  });
}

function resolveFallbackRoute(): RouteMetadata {
  return createMetadata({
    title: homeTitle,
    description: homeDescription,
    canonical: SITE_URL,
    robots: 'index, follow',
    jsonLd: [createOrganizationJsonLd(), createWebsiteJsonLd()],
  });
}

export function resolveRouteMetadata(pathname: string): RouteMetadata {
  return (
    resolveStaticRoute(pathname) ??
    resolveSeriesRoute(pathname) ??
    resolveSyllabusRoute(pathname) ??
    resolveThinkingCycleRoute(pathname) ??
    resolveLegalRoute(pathname) ??
    resolveFallbackRoute()
  );
}

export function getPrerenderRoutes(): string[] {
  return [
    ...getExpectedPublicIndexableRoutes(),
    ...getPrivateOrNonIndexableRoutes(),
  ];
}

export function getExpectedPublicIndexableRoutes(): string[] {
  return [
    '/',
    '/framework',
    '/get-started',
    '/series/compare',
    '/thinking-cycle/compare',
    ...seriesLevels.map((level) => level.path),
    ...syllabusData.map((s) => s.syllabusRoutePath),
    ...thinkingCycleStages.map((stage) => stage.path),
    ...Object.keys(legalDocuments),
  ];
}

export function getPrivateOrNonIndexableRoutes(): string[] {
  return Object.entries(staticRoutes)
    .filter(([, route]) => route.shouldIndex === false)
    .map(([pathname]) => pathname);
}
