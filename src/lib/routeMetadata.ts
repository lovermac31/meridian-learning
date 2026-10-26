import { ieltsCalculatorFaqs } from './ieltsToolsFaq';
import { legalDocuments } from './legalContent';
import { getSeriesLevelByPath, seriesLevels } from './seriesContent';
import { getSyllabusByRoutePath, syllabusData } from './syllabusContent';
import { getThinkingCycleStageByPath, thinkingCycleStages } from './thinkingCycleContent';
import {
  type Locale,
  getLocaleDefinition,
} from '../i18n/locales';
import { getPublicContentGroup, isPublicContentReleased } from '../i18n/content';
import { getOverhaulContent } from '../i18n/content/overhaul';
import { getLocalizedPathname, getLocalizablePublicPaths, resolveLocalizedRoute } from '../i18n/routing';
import { getLocalizedSeriesLevelByPath } from '../i18n/content/series';
import { getLocalizedSyllabusByRoutePath } from '../i18n/content/syllabus';
import { getLocalizedThinkingCycleStageByPath } from '../i18n/content/thinkingCycle';
import { getLocalizedLegalDocument } from '../i18n/content/legal';
import { getPublishedInsightArticles, INSIGHTS_BASE_PATH } from './insightsContent';
import marketPricing from '../content/marketPricing.json';
import { getSeoPageMeta as getSeoPage, seoPagePaths, seoEnglishPaths, isInternationalMarketPath, getInternationalAlternates } from './seoPageMeta';
import {
  createBreadcrumbJsonLd,
  createCourseJsonLd,
  createFaqJsonLd,
  createOrganizationJsonLd,
  createServiceJsonLd,
  createWebsiteJsonLd,
  createArticleJsonLd,
  type JsonLd,
} from './structuredData';

const SITE_URL = 'https://jurassicenglish.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/hero-compass-960.webp`;
const DEFAULT_OG_IMAGE_WIDTH = 960;
const DEFAULT_OG_IMAGE_HEIGHT = 640;
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
    imageWidth: number;
    imageHeight: number;
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
  localized?: Partial<Record<Locale, Pick<StaticRouteDefinition, 'title' | 'description' | 'breadcrumbs'> & { faqJsonLd?: JsonLd }>>;
};

// P1 — widened homepage positioning. The previous title scoped the brand
// to "Schools" only, but the live site already serves three audiences
// (parents arriving from social, schools, and IELTS-Speaking families).
// The widened title + description and the FAQ/Service JSON-LD below give
// search engines and the FB crawler clearer audience signals.
const homeTitle = 'Jurassic English™ | Critical Thinking, Academic English & IELTS Speaking';
const homeDescription =
  'Jurassic English™ helps students, parents, schools, and learning centers build academic English, critical thinking, literature-based reasoning, and IELTS-aligned speaking confidence.';

// FAQPage must mirror the FAQ visible on the page (human-centered overhaul,
// Oct 2026): the homepage's six-section layout ends with three questions in
// src/i18n/content/overhaul.ts, published here per locale.
const homeFaqEntries = (locale: Locale) =>
  getOverhaulContent(locale).home.faq.items.map(({ q, a }) => ({ question: q, answer: a }));

const staticRoutes: Record<string, StaticRouteDefinition> = {
  '/tools/ielts-band-score-calculator': {
    title: 'IELTS Band Score Calculator: Overall Band & Rounding Rules',
    description: 'Calculate your IELTS overall band, see exactly how .25 and .75 averages round, and find the lowest band you need in one skill to reach your target.',
    canonicalPath: '/tools/ielts-band-score-calculator',
    localized: { vi: { title: 'Cách tính điểm IELTS Overall và làm tròn | Công cụ tính điểm', description: 'Tính điểm IELTS Overall từ 4 kỹ năng, xem bảng làm tròn ,25 và ,75, và tìm điểm tối thiểu cần ở một kỹ năng để đạt overall mục tiêu.' } },
  },
  '/tools/ielts-speaking-part-2-timer': {
    title: 'IELTS Speaking Part 2 Timer | Jurassic English™',
    description: 'Practice with one minute to prepare, two minutes to speak, original cue cards and optional private, on-device recording.',
    canonicalPath: '/tools/ielts-speaking-part-2-timer',
    localized: { vi: { title: 'Đồng hồ IELTS Speaking Part 2 | Jurassic English™', description: 'Luyện nói với một phút chuẩn bị, hai phút trình bày và ghi âm tùy chọn chỉ trên thiết bị.' } },
  },
  '/insights': {
    title: 'IELTS Speaking and English Learning Resources | Jurassic English™',
    description: 'Evidence-led guidance on IELTS Speaking practice, typed feedback and one-to-one learning from Jurassic English™.',
    canonicalPath: '/insights',
    breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Learning resources', path: '/insights' }],
    localized: { vi: { title: 'Tài liệu luyện IELTS Speaking | Jurassic English™', description: 'Hướng dẫn luyện IELTS Speaking, hiểu phản hồi và chọn bước tiếp theo từ Jurassic English™.', breadcrumbs: [{ name: 'Trang chủ', path: '/' }, { name: 'Tài liệu học tập', path: '/insights' }] } },
  },
  '/about/nathaniel-jay-adams': {
    title: 'Nathaniel Jay Adams | Jurassic English & WorldWise Learning',
    description: 'Meet Nathaniel Jay Adams, publicly known as Mr. Jay Adams, and understand the separate learner-facing and university-focused work of Jurassic English and WorldWise Learning.',
    canonicalPath: '/about/nathaniel-jay-adams',
    jsonLd: [{
      '@context': 'https://schema.org', '@type': 'Person',
      '@id': `${SITE_URL}/about/nathaniel-jay-adams#person`,
      name: 'Nathaniel Jay Adams', alternateName: 'Mr. Jay Adams',
      url: `${SITE_URL}/about/nathaniel-jay-adams`,
      description: 'Nathaniel Jay Adams leads the education work presented by Jurassic English and WorldWise Learning.',
      worksFor: [
        { '@id': 'https://jurassicenglish.com/#organization' },
        { '@type': 'Organization', name: 'WorldWise Learning', url: 'https://www.worldwiselearning.app/' },
      ],
    }],
  },
  ...Object.fromEntries(getPublishedInsightArticles().map((article) => [`${INSIGHTS_BASE_PATH}/${article.slug}`, {
    title: `${article.title} | Jurassic English™`,
    description: article.description ?? article.deck,
    canonicalPath: `${INSIGHTS_BASE_PATH}/${article.slug}`,
    jsonLd: [createArticleJsonLd({ headline: article.title, description: article.description ?? article.deck, slug: article.slug, datePublished: article.datePublished, dateModified: article.dateModified, image: article.heroImage, authorName: article.authorName, authorType: 'Organization', section: article.section })],
    breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Learning resources', path: '/insights' }, { name: article.section, path: `${INSIGHTS_BASE_PATH}/${article.slug}` }],
  } as StaticRouteDefinition])),
  '/': {
    title: homeTitle,
    description: homeDescription,
    canonicalPath: '/',
    jsonLd: [
      createOrganizationJsonLd(),
      createWebsiteJsonLd(),
      // Surface the B2C IELTS Speaking service from the homepage as well,
      // not only from the static /young-learners-speaking/ landing page.
      // This gives the entity-graph a Service block linked to the
      // EducationalOrganization @id when the home URL is crawled.
      createServiceJsonLd({
        name: 'IELTS Speaking Coaching for Ages 9-18',
        description:
          'IELTS-aligned 1-to-1 and small-group speaking coaching for young learners ages 9-18, built around the public IELTS Speaking criteria, starting with a Live Speaking Baseline (690.000₫) for new families.',
        url: `${SITE_URL}/young-learners-speaking/`,
        serviceType: 'IELTS Speaking coaching, English speaking evaluation, young-learner speaking coaching',
        areaServed: 'Vietnam, Asia, Online',
        audienceRole: 'student',
      }),
      createFaqJsonLd(homeFaqEntries('en')),
    ],
    localized: {
      vi: {
        title:
          'Jurassic English™ | Tư duy phản biện, tiếng Anh học thuật & luyện nói IELTS',
        description:
          'Jurassic English™ giúp học sinh, phụ huynh, nhà trường và trung tâm đào tạo phát triển tiếng Anh học thuật, tư duy phản biện, lập luận dựa trên văn học và sự tự tin khi nói theo chuẩn IELTS.',
        faqJsonLd: createFaqJsonLd(homeFaqEntries('vi')),
      },
    },
  },
  '/story-club': {
    title: 'Story Club with Mr. Jay — Weekly English Stories for Ages 5–8 | Jurassic English™',
    description:
      'A small online story group for children aged 5–8: a 30-minute live story time each week, one small task at home and a personal reply from Mr. Jay. Up to 6 children per group.',
    canonicalPath: '/story-club',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Story Club', path: '/story-club' },
    ],
    localized: {
      vi: {
        title: 'Câu lạc bộ Truyện cùng thầy Jay — tiếng Anh qua truyện cho bé 5–8 tuổi | Jurassic English™',
        description:
          'Nhóm nhỏ trực tuyến cho bé 5–8 tuổi: mỗi tuần 30 phút kể chuyện trực tiếp, một bài nhỏ ở nhà và phản hồi riêng từ thầy Jay. Tối đa 6 bạn mỗi nhóm.',
        breadcrumbs: [
          { name: 'Trang chủ', path: '/' },
          { name: 'Câu lạc bộ Truyện', path: '/story-club' },
        ],
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
    title: 'Get Started — Teacher Training, School Licensing & Family Enquiries | Jurassic English™',
    description:
      'Get started with Jurassic English™: teacher training, school licensing, curriculum review, academic consulting, and family enquiries about academic English and IELTS-aligned speaking coaching for ages 9-18.',
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
  '/knowledge': {
    title: 'Ask / Knowledge Hub — Framework, Methodology, CEFR & IELTS Speaking | Jurassic English™',
    description:
      'One place for the depth on demand: the Jurassic English™ framework, methodology, CEFR alignment, teacher standards, the Jurassic Thinking Cycle™, and parent answers on reading, diagnostics, progress, and IELTS-aligned speaking for ages 9-18.',
    canonicalPath: '/knowledge',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Knowledge Hub', path: '/knowledge' },
    ],
    localized: {
      vi: {
        title: 'Hỏi / Trung tâm Kiến thức — Khung, Phương pháp, CEFR & hơn thế | Jurassic English™',
        description:
          'Một nơi cho chiều sâu khi cần: khung Jurassic English™, phương pháp, căn chỉnh CEFR, chuẩn giáo viên và Jurassic Thinking Cycle™ — cùng giải đáp cho phụ huynh về đọc, đánh giá và tiến bộ.',
        breadcrumbs: [
          { name: 'Trang chủ', path: '/' },
          { name: 'Trung tâm Kiến thức', path: '/knowledge' },
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
    title: 'Jurassic Thinking Cycle™ Methodology | Jurassic English™',
    description:
      'Explore the four-stage reasoning architecture behind Jurassic English™ lessons: analyze, evaluate, justify, and reflect.',
    canonicalPath: '/methodology',
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Framework', path: '/framework' },
      { name: 'Methodology', path: '/methodology' },
    ],
  },
  '/discovery': {
    title: 'Discovery Call for Schools | Jurassic English™',
    description:
      'Book a structured consultation for curriculum alignment, teacher training, school licensing, or academic English implementation.',
    canonicalPath: '/discovery',
    jsonLd: [
      createServiceJsonLd({
        name: 'Discovery Call for Schools',
        description:
          'A structured consultation for curriculum alignment, teacher training, school licensing, or academic English implementation, scoped to your school or learning centre.',
        url: `${SITE_URL}/discovery`,
        serviceType: 'Educational consulting',
        areaServed: 'International schools and English learning centers',
        audienceRole: 'school',
      }),
    ],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'WorldWise Learning', path: '/worldwise' },
      { name: 'Discovery Call', path: '/discovery' },
    ],
  },
  '/audit-sprint': {
    title: 'Curriculum Coherence Audit Sprint | Jurassic English™',
    description:
      'A focused curriculum review for schools and centers: alignment, materials, teacher practice, progression logic, and an implementation roadmap.',
    canonicalPath: '/audit-sprint',
    jsonLd: [
      createServiceJsonLd({
        name: 'Curriculum Coherence Audit Sprint',
        description:
          'A focused curriculum review for schools and centers covering alignment, materials, teacher practice, and progression logic, delivered as a formal gap analysis with an implementation roadmap.',
        url: `${SITE_URL}/audit-sprint`,
        serviceType: 'Curriculum audit',
        areaServed: 'International schools and English learning centers',
        audienceRole: 'school',
      }),
    ],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'WorldWise Learning', path: '/worldwise' },
      { name: 'Audit Sprint', path: '/audit-sprint' },
    ],
  },
  '/companies': {
    title: 'Business & Technical English for Tech Teams | Jurassic English™',
    description:
      "AI-assisted business and technical English for Vietnam's tech and export teams (Ho Chi Minh City & Hanoi). Client-ready communication for engineers, measured in CEFR/IELTS gains and built on the public assessment criteria. Book a scoping call.",
    canonicalPath: '/companies',
    jsonLd: [
      createServiceJsonLd({
        name: 'Business & Technical English for Tech Teams',
        description:
          'AI-assisted business and technical English training for tech and export employers in Vietnam, delivered as coached cohorts with CEFR/IELTS-aligned placement and measured readiness outcomes.',
        url: `${SITE_URL}/companies`,
        serviceType: 'Corporate English training',
        areaServed: 'Ho Chi Minh City, Hanoi, and online',
        audienceRole: 'business',
      }),
    ],
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'For Companies', path: '/companies' },
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
  // Unlisted sales page for centre owners, shared only in Zalo: noindex, no canonical or alternates, out of the
  // sitemap. The description carries no price (the number lives in the written order summary only).
  '/centres/level-1': {
    title: 'Level 1 Centre Licence for Ages 4–8 | Jurassic English™',
    description:
      'A full school year of thinking-English for ages 4–8: 40 lessons scripted minute by minute, teacher training and three original Jurassic English storybooks, licensed per campus.',
    canonicalPath: '/centres/level-1',
    shouldIndex: false,
    localized: {
      vi: {
        title: 'Giấy phép Trung tâm Level 1 cho bé 4–8 tuổi | Jurassic English™',
        description:
          'Trọn một năm “tiếng Anh tư duy” cho bé 4–8 tuổi: 40 giáo án soạn sẵn từng phút, đào tạo giáo viên và ba truyện tranh gốc của Jurassic English, cấp phép theo từng cơ sở.',
      },
    },
  },
  '/plans-pricing-access': {
    title: 'Private Plans and Pricing Access | Jurassic English™',
    description:
      'Private access route for approved Jurassic English™ plans and pricing review. This page is not intended for search indexing.',
    canonicalPath: '/plans-pricing-access',
    shouldIndex: false,
  },
  '/external/pilot': {
    title: 'External Pilot Resource Portal | Jurassic English™',
    description:
      'Token-protected external pilot resource portal for approved institutional review. This page is not intended for search indexing.',
    canonicalPath: '/external/pilot',
    shouldIndex: false,
  },
  '/internal/pilot-requests': {
    title: 'Internal Pilot Requests | Jurassic English™',
    description:
      'Internal operator portal for reviewing pilot access requests. This page is not intended for search indexing.',
    canonicalPath: '/internal/pilot-requests',
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
  locale?: Locale | 'es' | 'pt-BR' | 'id' | 'ms' | 'th' | 'ar' | 'ur' | 'bn';
}): RouteMetadata {
  const normalizedDescription = normalizeDescription(description);
  const socialTitle = ogTitle ?? title;
  const socialDescription = normalizeDescription(ogDescription ?? normalizedDescription);
  const socialUrl = ogUrl ?? canonical ?? SITE_URL;

  return {
    htmlLang: locale in { en: 1, vi: 1 } ? getLocaleDefinition(locale as Locale).htmlLang : locale,
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
      imageWidth: DEFAULT_OG_IMAGE_WIDTH,
      imageHeight: DEFAULT_OG_IMAGE_HEIGHT,
      type: 'website',
      siteName: SITE_NAME,
      locale: ({ es: 'es_ES', 'pt-BR': 'pt_BR', id: 'id_ID', ms: 'ms_MY', th: 'th_TH', ar: 'ar_AR', ur: 'ur_PK', bn: 'bn_BD' } as Record<string, string>)[locale] ?? getLocaleDefinition(locale as Locale).ogLocale,
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
  // A localized FAQPage replaces the default one so the markup matches the visible FAQ.
  const localizedFaq = localizedRoute?.faqJsonLd;
  const routeJsonLd = route.jsonLd && localizedFaq
    ? route.jsonLd.map((block) => ((block as { '@type'?: string })['@type'] === 'FAQPage' ? localizedFaq : block))
    : route.jsonLd;
  const isReleasedLocale = isPublicContentReleased(pathname, locale);
  const shouldIndex = (route.shouldIndex ?? true) && isReleasedLocale;
  const canonical = shouldIndex
    ? toAbsoluteUrl(getCanonicalPath(route.canonicalPath, locale))
    : undefined;
  const robots = shouldIndex ? 'index, follow' : 'noindex, nofollow';
  // Phase 14 — when a route declares its own `jsonLd` (e.g. Service
  // schema for /audit-sprint, /discovery), merge with the auto-generated
  // BreadcrumbList rather than replacing it. The home route ('/') passes
  // an explicit Org+WebSite jsonLd and has no breadcrumbs, so this merge
  // is a no-op for it.
  const breadcrumbsLd = createBreadcrumbs(localizedRoute?.breadcrumbs ?? route.breadcrumbs, locale);
  const toolName = pathname.includes('band-score')
    ? locale === 'vi' ? 'Tính điểm IELTS overall' : 'IELTS Band Score Calculator'
    : locale === 'vi' ? 'Đồng hồ IELTS Speaking Part 2' : 'IELTS Speaking Part 2 Timer';
  const toolFaqs = ieltsCalculatorFaqs[locale];
  const toolJsonLd: JsonLd[] = pathname.startsWith('/tools/') ? [{
    '@context': 'https://schema.org', '@type': 'WebApplication',
    name: toolName, url: canonical, applicationCategory: 'EducationalApplication',
    operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }, ...(pathname.includes('band-score') ? [{
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: toolFaqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })),
  }] : [])] as JsonLd[] : [];
  const jsonLd = shouldIndex
    ? toolJsonLd.length ? [...toolJsonLd, ...(breadcrumbsLd ?? [])] : routeJsonLd
      ? [...routeJsonLd, ...(breadcrumbsLd ?? [])]
      : breadcrumbsLd
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

// Phase 16 — explicit per-document legal descriptions. The previous
// formula "for Jurassic English™, including ${callout.label.toLowerCase()} and
// current policy details…" produced awkward strings such as "including
// please read carefully and current policy details" because callout.label
// is short copy-deck UI text, not a meta description fragment. Hand-tuned
// descriptions read cleanly in SERPs and stay under 160 chars.
const legalDescriptionsEn: Record<string, string> = {
  '/legal/terms':
    'Terms and conditions for using Jurassic English™ website content, resources, enquiries, and educational service information.',
  '/legal/privacy':
    'Privacy information for Jurassic English™ website visitors, enquiries, forms, communications, and educational service interactions.',
  '/legal/cookies':
    'Cookie policy for the Jurassic English™ website, including the categories of cookies we use and how to manage your preferences.',
  '/legal/accessibility':
    'Accessibility statement for the Jurassic English™ website, outlining standards we follow and how to request accessibility support.',
  '/legal/disclaimer':
    'Disclaimer for Jurassic English™ website content and educational service information, including limits on warranty and liability.',
};

const legalDescriptionsVi: Record<string, string> = {
  '/legal/terms':
    'Điều khoản và điều kiện sử dụng nội dung, tài nguyên, yêu cầu liên hệ và thông tin dịch vụ giáo dục của Jurassic English™.',
  '/legal/privacy':
    'Thông tin về quyền riêng tư cho người truy cập website, yêu cầu liên hệ, biểu mẫu, trao đổi và tương tác dịch vụ giáo dục Jurassic English™.',
  '/legal/cookies':
    'Chính sách cookie của website Jurassic English™, các loại cookie được sử dụng và cách bạn có thể quản lý tùy chọn.',
  '/legal/accessibility':
    'Tuyên bố về khả năng tiếp cận của website Jurassic English™, các tiêu chuẩn được áp dụng và cách yêu cầu hỗ trợ tiếp cận.',
  '/legal/disclaimer':
    'Tuyên bố miễn trừ trách nhiệm liên quan đến nội dung website và thông tin dịch vụ giáo dục Jurassic English™, gồm giới hạn về bảo đảm và trách nhiệm.',
};

function resolveLegalRoute(pathname: string, locale: Locale): RouteMetadata | null {
  const document = getLocalizedLegalDocument(pathname, locale);

  if (!document) {
    return null;
  }

  const enDescription = legalDescriptionsEn[pathname];
  const viDescription = legalDescriptionsVi[pathname];
  const description =
    locale === 'vi'
      ? viDescription ??
        `${document.title} của Jurassic English™, bao gồm thông báo trọng tâm và các nội dung chính sách hiện hành dành cho người truy cập website, trường học và đối tác.`
      : enDescription ??
        `${document.title} for Jurassic English™, including ${document.callout.label.toLowerCase()} and current policy details for site visitors, schools, and partners.`;

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

/**
 * `/pilot/:id` — public-safe pending-approval holding route (served by the
 * SPA via PilotHoldingPage). The id segment is dynamic and unbounded, so it
 * cannot live in `staticRoutes` (that map is also the prerender source list,
 * and we must never prerender a literal `/pilot/:id`). We resolve metadata
 * here instead and force noindex so the <head> agrees with the matching
 * `X-Robots-Tag: noindex, nofollow` header in vercel.json. No record data is
 * referenced — the id is intentionally not read into title/description.
 */
function resolvePilotHoldingRoute(pathname: string, locale: Locale): RouteMetadata | null {
  if (!/^\/pilot\/[^/]+$/.test(pathname)) {
    return null;
  }

  return createMetadata({
    title: 'Pilot Portal | Jurassic English™',
    description:
      'This Jurassic English™ pilot portal link is awaiting internal review and is not intended for search indexing.',
    canonical: undefined,
    robots: 'noindex, nofollow',
    alternates: undefined,
    jsonLd: undefined,
    ogUrl: SITE_URL,
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
  if (pathname.startsWith('/vi/') && seoEnglishPaths.some(path => `/vi${path}` === pathname) && !getSeoPage(pathname)) {
    return resolveFallbackRoute('vi');
  }
  const seoPage = getSeoPage(pathname);
  if (seoPage) {
    const canonical = toAbsoluteUrl(seoPage.path);
    if (isInternationalMarketPath(seoPage.path)) {
      const isHub = ['/ielts-speaking-online', '/es/ielts-speaking-online', '/pt/ielts-speaking-online'].includes(seoPage.path);
      // Country named the same way on every language version (the h1 is translated, so it cannot be used here).
      const marketNames: Record<string, string> = {
        india: 'India', philippines: 'Philippines', indonesia: 'Indonesia', malaysia: 'Malaysia', singapore: 'Singapore', thailand: 'Thailand',
        uae: 'United Arab Emirates', 'saudi-arabia': 'Saudi Arabia', pakistan: 'Pakistan', bangladesh: 'Bangladesh', nigeria: 'Nigeria', egypt: 'Egypt',
        colombia: 'Colombia', peru: 'Peru', chile: 'Chile', argentina: 'Argentina', brazil: 'Brazil', brasil: 'Brazil',
      };
      const marketSlug = seoPage.path.split('/').at(-1) ?? '';
      const marketKey = marketSlug === 'brasil' ? 'brazil' : marketSlug;
      const areaServed = isHub ? 'Online, outside Vietnam' : { '@type': 'Country', name: marketNames[marketSlug] ?? marketSlug };
      // The approved USD tier for this country (src/content/marketPricing.json): the same prices the page shows and PayPal charges.
      const tier = isHub ? undefined : marketPricing.markets[marketKey as keyof typeof marketPricing.markets];
      const prices = tier ? marketPricing.tiers[String(tier) as keyof typeof marketPricing.tiers] : undefined;
      const offers = prices ? [
        { '@type': 'Offer', name: 'One-to-one IELTS Speaking lesson (60 minutes, online)', price: prices.lesson_usd.toFixed(2), priceCurrency: 'USD', url: canonical },
        { '@type': 'Offer', name: 'Pack of 8 one-to-one lessons (60 minutes each)', price: prices.pack8_usd.toFixed(2), priceCurrency: 'USD', url: canonical },
        { '@type': 'Offer', name: 'Live Speaking Baseline (15-20 minutes, online)', price: prices.baseline_usd.toFixed(2), priceCurrency: 'USD', url: canonical },
      ] : undefined;
      const hubPath = seoPage.locale === 'es' ? '/es/ielts-speaking-online' : seoPage.locale === 'pt-BR' ? '/pt/ielts-speaking-online' : '/ielts-speaking-online';
      const jsonLd: JsonLd[] = [
        createServiceJsonLd({ name: seoPage.h1, description: seoPage.description, url: canonical, serviceType: 'Online IELTS Speaking coaching', areaServed, offers }),
        createFaqJsonLd(seoPage.faq.map(item => ({ question: item.question, answer: item.answer }))),
        createBreadcrumbJsonLd(isHub ? [{ name: 'Home', path: '/' }, { name: seoPage.h1, path: seoPage.path }] : [{ name: 'Home', path: '/' }, { name: 'IELTS Speaking online', path: hubPath }, { name: seoPage.h1, path: seoPage.path }]),
      ];
      const alternates = getInternationalAlternates(seoPage.path);
      return createMetadata({ title: seoPage.title, description: seoPage.description, canonical, robots: 'index, follow', locale: seoPage.locale as Locale | 'es' | 'pt-BR' | 'id' | 'ms' | 'th' | 'ar' | 'ur' | 'bn', alternates, jsonLd, ogUrl: canonical });
    }
    const enPath = seoPage.locale === 'en' ? seoPage.path : seoPage.alternatePath;
    const viPath = seoPage.locale === 'vi' ? seoPage.path : seoPage.alternatePath;
    const jsonLd: JsonLd[] = seoPage.path.includes('/insights/') ? [{
      '@context': 'https://schema.org', '@type': 'Article', headline: seoPage.h1,
      inLanguage: seoPage.locale, datePublished: seoPage.datePublished, dateModified: seoPage.dateModified,
      mainEntityOfPage: canonical, author: { '@id': `${SITE_URL}/#jay-adams` },
      publisher: { '@id': `${SITE_URL}/#organization` },
    }] : [{
      '@context': 'https://schema.org', '@type': 'Person', '@id': `${SITE_URL}/#jay-adams`,
      name: 'Nathaniel Jay Adams', alternateName: ['Mr. Jay Adams', 'Jay Adams', 'thầy Jay'],
      nationality: { '@type': 'Country', name: 'United States' },
      workLocation: { '@type': 'Place', name: 'Hanoi, Vietnam' },
      homeLocation: { '@type': 'Place', name: 'Hanoi, Vietnam' },
      jobTitle: ['Founder and Lead Coach', 'Founder and AI Systems Architect'],
      worksFor: [{ '@id': `${SITE_URL}/#organization` }, { '@type': 'Organization', name: 'WorldWise Learning', url: 'https://www.worldwiselearning.app/' }],
      hasCredential: [
        { '@type': 'EducationalOccupationalCredential', name: 'CELTA', credentialCategory: 'certificate', recognizedBy: { '@type': 'Organization', name: 'Cambridge' } },
        { '@type': 'EducationalOccupationalCredential', name: 'Advanced TEFL Certificate (120 hours)', credentialCategory: 'certificate', recognizedBy: { '@type': 'Organization', name: 'International TESOL TEFL Academy' } },
      ],
      knowsAbout: ['IELTS Speaking', 'English language teaching', 'AI in education'],
    }, {
      '@context': 'https://schema.org', '@type': 'ProfilePage', url: canonical,
      inLanguage: seoPage.locale, mainEntity: { '@id': `${SITE_URL}/#jay-adams` },
      dateModified: seoPage.dateModified, isPartOf: { '@id': `${SITE_URL}/#website` },
    }];
    jsonLd.push(createFaqJsonLd(seoPage.faq.map(item => ({ question: item.question, answer: item.answer }))));
    jsonLd.push(createBreadcrumbJsonLd(seoPage.path.includes('/insights/') ? [
      { name: seoPage.locale === 'vi' ? 'Trang chủ' : 'Home', path: seoPage.locale === 'vi' ? '/vi' : '/' },
      { name: 'Insights', path: seoPage.locale === 'vi' ? '/vi/insights' : '/insights' },
      { name: seoPage.h1, path: seoPage.path },
    ] : [
      { name: seoPage.locale === 'vi' ? 'Trang chủ' : 'Home', path: seoPage.locale === 'vi' ? '/vi' : '/' },
      { name: seoPage.h1, path: seoPage.path },
    ]));
    return createMetadata({ title: seoPage.title, description: seoPage.description, canonical,
      robots: 'index, follow', locale: seoPage.locale as Locale, jsonLd, ogUrl: canonical,
      alternates: [
        { hrefLang: 'vi', href: toAbsoluteUrl(viPath) },
        { hrefLang: 'en', href: toAbsoluteUrl(enPath) },
        { hrefLang: 'x-default', href: toAbsoluteUrl(enPath) },
      ],
    });
  }
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
    resolvePilotHoldingRoute(resolvedPathname, resolvedLocale) ??
    resolveFallbackRoute(resolvedLocale)
  );
}

/**
 * Routes that are public, indexable on the production domain, but are
 * served by external Vercel rewrites — not by the local Vite SPA.
 *
 * These routes:
 *   • appear in dist/sitemap.xml (so search engines see them on the apex
 *     production domain), and
 *   • are excluded from getPrerenderRoutes() (so the prerender pipeline
 *     does not try to generate dist/<route>/index.html for routes the
 *     SPA has no view for), and
 *   • are exempted from validate-prerender-routes.mjs's coverage check.
 *
 * English-only at present. If a localized variant is later added, route
 * its locale fanout through the standard release-gate path the same way
 * native routes are handled.
 *
 * The corresponding rewrite rules in `vercel.json` (production root)
 * point each path at the ecosystem-landing stable alias
 * `je-ecosystem-landing-preview.vercel.app`. Both lists must stay in
 * sync — adding a route here without adding the rewrite (or vice versa)
 * will produce a 404 on production.
 */
const REWRITE_SERVED_ROUTES = [
  '/student-academy',
  // Family Rewards (ecosystem app, FAMILY_REWARDS_ENABLED=1 in production).
  '/student-academy/referrals',
  '/school-framework',
  '/digital-reasoning-engine',
  '/interactive-demo',
  '/evidence',
  '/book-diagnostic',
] as const;

export function getRewriteServedRoutes(): string[] {
  return [...REWRITE_SERVED_ROUTES];
}

export function isRewriteServedRoute(pathname: string): boolean {
  return (REWRITE_SERVED_ROUTES as readonly string[]).includes(pathname);
}

export function getPrerenderRoutes(): string[] {
  const rewriteServed = new Set(getRewriteServedRoutes());
  return [
    ...getExpectedPublicIndexableRoutes().filter((route) => !rewriteServed.has(route)),
    ...getScaffoldedLocalizedRoutes(),
    ...getPrivateOrNonIndexableRoutes(),
  ];
}

/**
 * Private, noindex routes whose first render reads request-time state (URL
 * tokens, sessionStorage). The build cannot know that state, so these routes
 * are NOT server-rendered: scripts/prerender-route-metadata.mjs ships them a
 * small static fallback that src/main.tsx replaces client-side (createRoot).
 * Every other prerendered route carries its full server-rendered body.
 *
 * Must stay a subset of getPrivateOrNonIndexableRoutes() — a public, indexable
 * route must never be client-only (tests/prerender-ssr.test.ts enforces this).
 */
const CLIENT_ONLY_ROUTES = [
  '/plans-pricing-access',
  '/external/pilot',
  '/internal/pilot-requests',
] as const;

export function getClientOnlyRoutes(): string[] {
  return [...CLIENT_ONLY_ROUTES];
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
        '/knowledge',
        '/get-started',
        '/worldwise',
        '/audit-sprint',
        '/companies',
        '/pilot-programme',
        '/discovery',
        '/methodology',
        '/cefr-alignment',
        '/teacher-standards',
        '/story-club',
        '/series/compare',
        '/thinking-cycle/compare',
        '/tools/ielts-band-score-calculator',
        '/tools/ielts-speaking-part-2-timer',
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
    // English-only resources until translated copy receives its own review.
    ...[INSIGHTS_BASE_PATH, '/vi/insights', ...getPublishedInsightArticles().map((article) => `${INSIGHTS_BASE_PATH}/${article.slug}`)],
    ...seoPagePaths,
    // Rewrite-served routes are listed AFTER the locale fanout because
    // they are not part of the standard EN/VI mirror system. They are
    // public + indexable on the production domain via Vercel rewrites.
    ...getRewriteServedRoutes(),
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
