import { legalDocuments } from './legalContent';
import { getSeriesLevelByPath, seriesLevels } from './seriesContent';
import { getSyllabusByRoutePath, syllabusData } from './syllabusContent';
import { getThinkingCycleStageByPath, thinkingCycleStages } from './thinkingCycleContent';
import {
  type Locale,
  getLocaleDefinition,
} from '../i18n/locales';
import { getPublicContentGroup, isPublicContentReleased } from '../i18n/content';
import { getLocalizedPathname, getLocalizablePublicPaths, resolveLocalizedRoute } from '../i18n/routing';
import { getLocalizedSeriesLevelByPath } from '../i18n/content/series';
import { getLocalizedSyllabusByRoutePath } from '../i18n/content/syllabus';
import { getLocalizedThinkingCycleStageByPath } from '../i18n/content/thinkingCycle';
import { getLocalizedLegalDocument } from '../i18n/content/legal';
import {
  createBreadcrumbJsonLd,
  createCourseJsonLd,
  createOrganizationJsonLd,
  createWebsiteJsonLd,
  type JsonLd,
} from './structuredData';

const SITE_URL = 'https://jurassicenglish.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/hero-compass-960.webp`;
const SITE_NAME = 'Jurassic English™';

type BaseMetadata = {
  title: string;
  description: string;
  canonical?: string;
  robots?: string;
  alternates?: Array<{ hrefLang: string; href: string }>;
  jsonLd?: JsonLd[];
};

export type RouteMetadata = BaseMetadata & {
  htmlLang: string;
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
  localized?: Partial<Record<Locale, Pick<StaticRouteDefinition, 'title' | 'description' | 'breadcrumbs'>>>;
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
    localized: {
      vi: {
        title: 'Tư duy phản biện qua văn học cho nhà trường | Jurassic English™',
        description:
          'Jurassic English™ là chương trình tiếng Anh học thuật dựa trên văn học dành cho nhà trường. Năm cấp độ có cấu trúc từ Pre-A1 đến C1, phục vụ độ tuổi 4–14+, cùng đào tạo giáo viên, cấp phép cho trường và rà soát chương trình.',
      },
    },
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
    localized: {
      vi: {
        title: 'Khung tư duy phản biện dựa trên văn học | Jurassic English™',
        description:
          'Khung Jurassic English™ tích hợp Jurassic Thinking Cycle, tiến trình CEFR và định hướng sư phạm sinh thái vào một chương trình học đường có cấu trúc từ Pre-A1 đến C1.',
        breadcrumbs: [
          { name: 'Trang chủ', path: '/' },
          { name: 'Khung chương trình', path: '/framework' },
        ],
      },
    },
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
    localized: {
      vi: {
        title: 'Liên hệ về đào tạo giáo viên và cấp phép cho trường | Jurassic English™',
        description:
          'Liên hệ Jurassic English™ để trao đổi về đào tạo giáo viên, cấp phép cho trường, rà soát chương trình hoặc tư vấn học thuật phù hợp với bối cảnh của bạn.',
        breadcrumbs: [
          { name: 'Trang chủ', path: '/' },
          { name: 'Bắt đầu', path: '/get-started' },
        ],
      },
    },
  },
  '/available-soon': {
    title: 'Available soon | Jurassic English™',
    description: 'This section is being prepared and will be available shortly.',
    canonicalPath: '/available-soon',
    shouldIndex: false,
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
    localized: {
      vi: {
        title: 'So sánh các cấp độ chương trình Jurassic English™ | Jurassic English™',
        description:
          'So sánh toàn bộ năm cấp độ chương trình Jurassic English™ theo độ tuổi, dải CEFR, độ phức tạp văn bản và kỳ vọng về tư duy học thuật.',
        breadcrumbs: [
          { name: 'Trang chủ', path: '/' },
          { name: 'So sánh chuỗi cấp độ', path: '/series/compare' },
        ],
      },
    },
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
    localized: {
      vi: {
        title: 'Jurassic Thinking Cycle™ — So sánh cả bốn giai đoạn | Jurassic English™',
        description:
          'So sánh bốn giai đoạn Analyze, Evaluate, Justify và Reflect của Jurassic Thinking Cycle™ để thấy cách lập luận có cấu trúc phát triển qua từng bài học.',
        breadcrumbs: [
          { name: 'Trang chủ', path: '/' },
          { name: 'So sánh Thinking Cycle', path: '/thinking-cycle/compare' },
        ],
      },
    },
  },
  '/teacher-standards': {
    title: 'Teacher Quality, iPGCE Standards and Methodology Fidelity | Jurassic English™',
    description:
      'Why teacher quality must be structural, not personality-dependent. iPGCE and PGCE qualification standards, Jurassic Thinking Cycle™ methodology preparation, and the delivery governance architecture that makes classroom consistency possible at scale.',
    canonicalPath: '/teacher-standards',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'WorldWise Learning', path: '/worldwise' },
      { name: 'Teacher Standards', path: '/teacher-standards' },
    ],
  },
  '/cefr-alignment': {
    title: 'CEFR Alignment, CEFR-V and MOET 2030 — Curriculum Standards Architecture | Jurassic English™',
    description:
      'How Jurassic English™ and WorldWise Learning map to CEFR, CEFR-V, and MOET 2030 national standards. A standards-facing companion to the methodology page — for institutional procurement, accreditation, and compliance review.',
    canonicalPath: '/cefr-alignment',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'WorldWise Learning', path: '/worldwise' },
      { name: 'CEFR Alignment', path: '/cefr-alignment' },
    ],
  },
  '/methodology': {
    title: 'The Jurassic Thinking Cycle™ — Methodology Architecture | Jurassic English™',
    description:
      'The Jurassic Thinking Cycle™ is the instructional architecture behind every Jurassic English™ lesson — four structured stages moving students from text comprehension to moral evaluation to evidence-based argument. A deep-dive for institutional leaders and academic directors.',
    canonicalPath: '/methodology',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Framework', path: '/framework' },
      { name: 'Methodology', path: '/methodology' },
    ],
  },
  '/discovery': {
    title: 'Book a Discovery Call — WorldWise Learning Institutional Consultation | Jurassic English™',
    description:
      'A structured 45-minute Discovery Call with the WorldWise Learning team. Designed for SME centre owners, school leaders, and academic directors ready to understand how curriculum alignment and methodology governance can transform their English programme.',
    canonicalPath: '/discovery',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'WorldWise Learning', path: '/worldwise' },
      { name: 'Discovery Call', path: '/discovery' },
    ],
  },
  '/audit-sprint': {
    title: 'Curriculum Coherence Audit Sprint — 10-Day Institutional Programme Review | Jurassic English™',
    description:
      'A structured 10-business-day diagnostic of your English programme — curriculum alignment, teacher practice, materials review, and progression logic — delivered as a formal gap analysis with implementation roadmap.',
    canonicalPath: '/audit-sprint',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'WorldWise Learning', path: '/worldwise' },
      { name: 'Audit Sprint', path: '/audit-sprint' },
    ],
  },
  '/pilot-programme': {
    title: 'Jurassic English™ Pilot Programme — 6-8 Week Institutional Evaluation',
    description:
      'A structured 6-8 week Jurassic English™ pilot pathway for schools, academies, and training centres. Measure student reasoning evidence, teacher fidelity, progression fit, and implementation readiness before wider rollout.',
    canonicalPath: '/pilot-programme',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'WorldWise Learning', path: '/worldwise' },
      { name: 'Pilot Programme', path: '/pilot-programme' },
    ],
  },
  '/worldwise': {
    title: 'WorldWise Learning — Institutional Curriculum Architecture | Jurassic English™',
    description:
      'WorldWise Learning provides the structural foundation for high-quality English instruction — standards alignment, methodology governance, and implementation architecture for schools, training centres, and institutional partners.',
    canonicalPath: '/worldwise',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'WorldWise Learning', path: '/worldwise' },
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

function getCanonicalPath(pathname: string, locale: Locale) {
  return getLocalizedPathname(pathname, locale);
}

function createAlternates(pathname: string, locale: Locale) {
  const releasedLocales = (['en', 'vi'] as Locale[]).filter((candidateLocale) =>
    isPublicContentReleased(pathname, candidateLocale),
  );

  if (!releasedLocales.includes(locale)) {
    return undefined;
  }

  return [
    ...releasedLocales.map((releasedLocale) => ({
      hrefLang: releasedLocale,
      href: toAbsoluteUrl(getCanonicalPath(pathname, releasedLocale)),
    })),
    { hrefLang: 'x-default', href: toAbsoluteUrl(pathname) },
  ];
}

function createBreadcrumbs(
  items: Array<{ name: string; path: string }> | undefined,
  locale: Locale,
) {
  if (!items || items.length === 0) {
    return undefined;
  }

  return [
    createBreadcrumbJsonLd(
      items.map((item) => ({
        ...item,
        path: getCanonicalPath(item.path, locale),
      })),
    ),
  ];
}

function normalizeDescription(text: string) {
  return text.replace(/\s+/g, ' ').trim();
}

function localizeAgeBand(ageBand: string, locale: Locale) {
  if (locale !== 'vi') {
    return ageBand;
  }

  return ageBand.replace(/\s*years?$/i, ' tuổi');
}

function createMetadata({
  title,
  description,
  canonical,
  robots,
  alternates,
  jsonLd,
  ogTitle,
  ogDescription,
  ogUrl,
  locale = 'en',
}: BaseMetadata & {
  ogTitle?: string;
  ogDescription?: string;
  ogUrl?: string;
  locale?: Locale;
}): RouteMetadata {
  const normalizedDescription = normalizeDescription(description);
  const socialTitle = ogTitle ?? title;
  const socialDescription = normalizeDescription(ogDescription ?? normalizedDescription);
  const socialUrl = ogUrl ?? canonical ?? SITE_URL;

  return {
    htmlLang: getLocaleDefinition(locale).htmlLang,
    title,
    description: normalizedDescription,
    canonical,
    robots,
    alternates,
    jsonLd,
    og: {
      title: socialTitle,
      description: socialDescription,
      url: socialUrl,
      image: DEFAULT_OG_IMAGE,
      type: 'website',
      siteName: SITE_NAME,
      locale: getLocaleDefinition(locale).ogLocale,
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description: socialDescription,
      image: DEFAULT_OG_IMAGE,
    },
  };
}

function createUnreleasedLocaleMetadata(pathname: string, locale: Locale): RouteMetadata {
  const localizedPath = getCanonicalPath(pathname, locale);
  const title = 'Available soon | Jurassic English™';
  const description = 'This section is being prepared and will be available shortly.';

  return createMetadata({
    title,
    description,
    robots: 'noindex, nofollow',
    ogUrl: toAbsoluteUrl(localizedPath),
    locale,
  });
}

function resolveStaticRoute(pathname: string, locale: Locale): RouteMetadata | null {
  const route = staticRoutes[pathname];

  if (!route) {
    return null;
  }

  const localizedRoute = route.localized?.[locale];
  const isReleasedLocale = isPublicContentReleased(pathname, locale);
  const shouldIndex = (route.shouldIndex ?? true) && isReleasedLocale;
  const canonical = shouldIndex
    ? toAbsoluteUrl(getCanonicalPath(route.canonicalPath, locale))
    : undefined;
  const robots = shouldIndex ? 'index, follow' : 'noindex, nofollow';
  const jsonLd = shouldIndex
    ? route.jsonLd ?? createBreadcrumbs(localizedRoute?.breadcrumbs ?? route.breadcrumbs, locale)
    : undefined;

  return createMetadata({
    title: localizedRoute?.title ?? route.title,
    description: localizedRoute?.description ?? route.description,
    canonical,
    robots,
    alternates: route.shouldIndex === false ? undefined : createAlternates(route.canonicalPath, locale),
    jsonLd,
    ogUrl: shouldIndex ? canonical : toAbsoluteUrl(getCanonicalPath(route.canonicalPath, locale)),
    locale,
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

const viSeriesLevelSeoDescriptions: Record<string, string> = {
  'level-1-foundation':
    'Jurassic English™ Cấp độ 1 phát triển tư duy phản biện cho độ tuổi 4–8 thông qua sách tranh, lập luận có hướng dẫn và những bài viết học thuật đầu tiên. Hỗ trợ tiến trình CEFR từ Pre-A1 đến A1.',
  'level-2-development':
    'Jurassic English™ Cấp độ 2 xây dựng lập luận có cấu trúc cho độ tuổi 8–10 thông qua truyện chương hồi đầu cấp, viết dựa trên bằng chứng và đối thoại Socratic. Hỗ trợ tiến trình CEFR từ A1 đến A2.',
  'level-3-expansion':
    'Jurassic English™ Cấp độ 3 phát triển Literacy Pivot cho độ tuổi 10–12, dùng văn bản phức hợp để xây dựng lập luận học thuật và viết CEIW. Hỗ trợ tiến trình CEFR từ A2 đến B1.',
  'level-4-mastery':
    'Jurassic English™ Cấp độ 4 phát triển phân tích tiểu thuyết và lập luận học thuật cho độ tuổi 12–14 thông qua văn bản đa nghĩa và bài luận nhiều đoạn. Hỗ trợ tiến trình CEFR từ B1 đến B2.',
  'level-5-advanced':
    'Jurassic English™ Cấp độ 5 phát triển năng lực ngôn ngữ học thuật đầy đủ cho độ tuổi 14+ thông qua phân tích liên văn bản và bài luận nghiên cứu. Hỗ trợ CEFR từ B2 đến C1 và chuẩn bị cho IB/Cambridge.',
};

function resolveSeriesRoute(pathname: string, locale: Locale): RouteMetadata | null {
  const level = getSeriesLevelByPath(pathname);
  const localizedLevel = getLocalizedSeriesLevelByPath(pathname, locale);

  if (!level || !localizedLevel) {
    return null;
  }

  const title =
    locale === 'vi'
      ? `${localizedLevel.title} — Độ tuổi ${localizeAgeBand(localizedLevel.ageBand, locale)} | Jurassic English™`
      : `${localizedLevel.title} — Ages ${localizedLevel.ageBand} | Jurassic English™`;
  const description =
    locale === 'vi'
      ? viSeriesLevelSeoDescriptions[level.slug] ??
        `${localizedLevel.title} là chương trình văn học Jurassic English™ cho độ tuổi ${localizeAgeBand(localizedLevel.ageBand, locale)}, hỗ trợ người học ${localizedLevel.cefrRange} thông qua lập luận có cấu trúc và diễn đạt học thuật.`
      : seriesLevelSeoDescriptions[level.slug] ??
        `${localizedLevel.title} is the Jurassic English™ literature curriculum for ages ${localizedLevel.ageBand}, supporting ${localizedLevel.cefrRange} learners through structured reasoning and academic expression.`;

  const isReleasedLocale = isPublicContentReleased(pathname, locale);
  const canonicalUrl = isReleasedLocale
    ? toAbsoluteUrl(getCanonicalPath(level.path, locale))
    : undefined;

  const breadcrumb = createBreadcrumbs([
    { name: locale === 'vi' ? 'Trang chủ' : 'Home', path: '/' },
    { name: locale === 'vi' ? 'So sánh chuỗi cấp độ' : 'Series Comparison', path: '/series/compare' },
    { name: localizedLevel.title, path: level.path },
  ], locale);

  const course = createCourseJsonLd({
    name: localizedLevel.title,
    description,
    educationalLevel: localizedLevel.cefrRange,
    typicalAgeRange: localizedLevel.ageBand,
    url: canonicalUrl,
    locale,
  });

  return createMetadata({
    title,
    description,
    canonical: canonicalUrl,
    robots: isReleasedLocale ? 'index, follow' : 'noindex, nofollow',
    alternates: createAlternates(level.path, locale),
    jsonLd: isReleasedLocale ? [...(breadcrumb ?? []), course] : undefined,
    ogUrl: toAbsoluteUrl(getCanonicalPath(level.path, locale)),
    locale,
  });
}

function resolveThinkingCycleRoute(pathname: string, locale: Locale): RouteMetadata | null {
  const stage = getLocalizedThinkingCycleStageByPath(pathname, locale);

  if (!stage) {
    return null;
  }

  const title =
    locale === 'vi'
      ? `${stage.title} — Hướng dẫn giai đoạn của Jurassic Thinking Cycle™ | Jurassic English™`
      : `${stage.title} — Jurassic Thinking Cycle™ Stage Guide | Jurassic English™`;
  const description =
    locale === 'vi'
      ? `Giai đoạn ${stage.title} của Jurassic Thinking Cycle™: ${stage.line} Một khung lập luận có cấu trúc để định hướng giáo viên và học sinh làm việc với văn học ở mọi cấp độ.`
      : `The ${stage.title} stage of the Jurassic Thinking Cycle™: ${stage.line} A structured reasoning framework to guide teachers and students through literature at every level.`;

  const isReleasedLocale = isPublicContentReleased(pathname, locale);

  return createMetadata({
    title,
    description,
    canonical: isReleasedLocale ? toAbsoluteUrl(getCanonicalPath(stage.path, locale)) : undefined,
    robots: isReleasedLocale ? 'index, follow' : 'noindex, nofollow',
    alternates: createAlternates(stage.path, locale),
    jsonLd: isReleasedLocale ? createBreadcrumbs([
      { name: locale === 'vi' ? 'Trang chủ' : 'Home', path: '/' },
      { name: locale === 'vi' ? 'So sánh Thinking Cycle' : 'Thinking Cycle Comparison', path: '/thinking-cycle/compare' },
      { name: stage.title, path: stage.path },
    ], locale) : undefined,
    ogUrl: toAbsoluteUrl(getCanonicalPath(stage.path, locale)),
    locale,
  });
}

function resolveSyllabusRoute(pathname: string, locale: Locale): RouteMetadata | null {
  const syllabus = getLocalizedSyllabusByRoutePath(pathname, locale);

  if (!syllabus) {
    return null;
  }

  const levelPath = pathname.replace('/syllabus', '');
  const level = getSeriesLevelByPath(levelPath);
  const localizedLevel = getLocalizedSeriesLevelByPath(levelPath, locale);

  if (!level || !localizedLevel) {
    return null;
  }

  const title =
    locale === 'vi'
      ? `Đề cương ${localizedLevel.title} — Độ tuổi ${localizeAgeBand(localizedLevel.ageBand, locale)} | Jurassic English™`
      : `${localizedLevel.title} Syllabus — Ages ${localizedLevel.ageBand} | Jurassic English™`;
  const description =
    locale === 'vi'
      ? `Đề cương đầy đủ của ${localizedLevel.title} trong chương trình Jurassic English™ cho độ tuổi ${localizeAgeBand(localizedLevel.ageBand, locale)}. Bao gồm văn bản cốt lõi, phân bổ học kỳ, phương pháp đánh giá, mạch tư duy sinh thái và tiến trình CEFR (${localizedLevel.cefrRange}).`
      : `The full Jurassic English™ ${localizedLevel.title} curriculum syllabus for ages ${localizedLevel.ageBand}. Core texts, term breakdown, assessment methods, eco-reasoning strand, and CEFR progression (${localizedLevel.cefrRange}).`;
  const isReleasedLocale = isPublicContentReleased(pathname, locale);
  const canonicalUrl = isReleasedLocale
    ? toAbsoluteUrl(getCanonicalPath(pathname, locale))
    : undefined;

  return createMetadata({
    title,
    description,
    canonical: canonicalUrl,
    robots: isReleasedLocale ? 'index, follow' : 'noindex, nofollow',
    alternates: createAlternates(pathname, locale),
    jsonLd: isReleasedLocale ? createBreadcrumbs([
      { name: locale === 'vi' ? 'Trang chủ' : 'Home', path: '/' },
      { name: locale === 'vi' ? 'So sánh chuỗi cấp độ' : 'Series Comparison', path: '/series/compare' },
      { name: localizedLevel.title, path: levelPath },
      { name: locale === 'vi' ? 'Đề cương' : 'Syllabus', path: pathname },
    ], locale) : undefined,
    ogUrl: toAbsoluteUrl(getCanonicalPath(pathname, locale)),
    locale,
  });
}

function resolveLegalRoute(pathname: string, locale: Locale): RouteMetadata | null {
  const document = getLocalizedLegalDocument(pathname, locale);

  if (!document) {
    return null;
  }

  const description =
    locale === 'vi'
      ? `${document.title} của Jurassic English™, bao gồm thông báo trọng tâm và các nội dung chính sách hiện hành dành cho người truy cập website, trường học và đối tác.`
      : `${document.title} for Jurassic English™, including ${document.callout.label.toLowerCase()} and current policy details for site visitors, schools, and partners.`;

  const isReleasedLocale = isPublicContentReleased(pathname, locale);

  return createMetadata({
    title: `${document.title} | Jurassic English™`,
    description,
    canonical: isReleasedLocale ? toAbsoluteUrl(getCanonicalPath(pathname, locale)) : undefined,
    robots: isReleasedLocale ? 'index, follow' : 'noindex, nofollow',
    alternates: createAlternates(pathname, locale),
    jsonLd: isReleasedLocale ? createBreadcrumbs([
      { name: locale === 'vi' ? 'Trang chủ' : 'Home', path: '/' },
      { name: document.title, path: pathname },
    ], locale) : undefined,
    ogUrl: toAbsoluteUrl(getCanonicalPath(pathname, locale)),
    locale,
  });
}

function resolveFallbackRoute(locale: Locale): RouteMetadata {
  return createMetadata({
    title: 'Page not found | Jurassic English™',
    description: 'This Jurassic English™ page could not be found.',
    canonical: undefined,
    robots: 'noindex, nofollow',
    alternates: undefined,
    jsonLd: undefined,
    ogUrl: locale === 'en' ? SITE_URL : toAbsoluteUrl('/vi'),
    locale,
  });
}

export function resolveRouteMetadata(pathname: string): RouteMetadata {
  const localizedRoute = resolveLocalizedRoute(pathname);
  const resolvedLocale = localizedRoute.locale;
  const resolvedPathname =
    localizedRoute.isLocalizable || localizedRoute.isPrivateOrNonLocalized
      ? localizedRoute.pathname
      : pathname;

  if (
    localizedRoute.isLocalizable &&
    getPublicContentGroup(resolvedPathname) &&
    !isPublicContentReleased(resolvedPathname, resolvedLocale)
  ) {
    return createUnreleasedLocaleMetadata(resolvedPathname, resolvedLocale);
  }

  return (
    resolveStaticRoute(resolvedPathname, resolvedLocale) ??
    resolveSeriesRoute(resolvedPathname, resolvedLocale) ??
    resolveSyllabusRoute(resolvedPathname, resolvedLocale) ??
    resolveThinkingCycleRoute(resolvedPathname, resolvedLocale) ??
    resolveLegalRoute(resolvedPathname, resolvedLocale) ??
    resolveFallbackRoute(resolvedLocale)
  );
}

export function getPrerenderRoutes(): string[] {
  return [
    ...getExpectedPublicIndexableRoutes(),
    ...getScaffoldedLocalizedRoutes(),
    ...getPrivateOrNonIndexableRoutes(),
  ];
}

export function getScaffoldedLocalizedRoutes(): string[] {
  return getLocalizablePublicPaths()
    .flatMap((pathname) =>
      (['vi'] as Locale[])
        .filter((locale) => !isPublicContentReleased(pathname, locale))
        .map((locale) => getLocalizedPathname(pathname, locale)),
    );
}

export function getExpectedPublicIndexableRoutes(): string[] {
  return [
    ...Array.from(
      new Set([
        '/',
        '/framework',
        '/get-started',
        '/worldwise',
        '/audit-sprint',
        '/pilot-programme',
        '/discovery',
        '/methodology',
        '/cefr-alignment',
        '/teacher-standards',
        '/series/compare',
        '/thinking-cycle/compare',
        ...seriesLevels.map((level) => level.path),
        ...syllabusData.map((s) => s.syllabusRoutePath),
        ...thinkingCycleStages.map((stage) => stage.path),
        ...Object.keys(legalDocuments),
      ].flatMap((pathname) =>
        (['en', 'vi'] as Locale[])
          .filter((locale) => isPublicContentReleased(pathname, locale))
          .map((locale) => getLocalizedPathname(pathname, locale)),
      )),
    ),
  ];
}

export function getPrivateOrNonIndexableRoutes(): string[] {
  return Object.entries(staticRoutes).flatMap(([pathname, route]) => {
    if (route.shouldIndex !== false) {
      return [];
    }

    const routes = [pathname];

    if (isPublicContentReleased(pathname, 'vi')) {
      routes.push(getLocalizedPathname(pathname, 'vi'));
    }

    return routes;
  });
}
