import type { Locale } from '../locales';
import { legalDocuments } from './legal';
import { seriesLevels } from './series';
import { syllabusData } from './syllabus';
import { thinkingCycleStages } from './thinkingCycle';
import { seoEnglishPaths } from '../../lib/seoPageMeta';

export type PublicContentGroup =
  | 'home'
  | 'framework'
  | 'knowledge'
  | 'getStarted'
  | 'availableSoon'
  | 'worldwise'
  | 'auditSprint'
  | 'pilotProgramme'
  | 'discovery'
  | 'methodology'
  | 'cefrAlignment'
  | 'teacherStandards'
  | 'companies'
  | 'storyClub'
  | 'products'
  | 'seriesCompare'
  | 'thinkingCycleCompare'
  | 'series'
  | 'syllabus'
  | 'thinkingCycle'
  | 'legal'
  | 'tools'
  | 'seoPages'
  | 'insightsHub';

const publicContentReleaseMap: Record<PublicContentGroup, Record<Locale, boolean>> = {
  home: { en: true, vi: true },
  framework: { en: true, vi: true },
  // P0 — EN-only for now (mirrors the en-only institutional routes it holds,
  // e.g. methodology/cefrAlignment/teacherStandards). VI mirror is a P1
  // follow-up once /knowledge is registered in the localizable-routing layer.
  knowledge: { en: true, vi: false },
  getStarted: { en: true, vi: true },
  availableSoon: { en: true, vi: true },
  worldwise: { en: true, vi: false },
  auditSprint: { en: true, vi: false },
  pilotProgramme: { en: true, vi: false },
  discovery: { en: true, vi: false },
  methodology: { en: true, vi: false },
  cefrAlignment: { en: true, vi: false },
  teacherStandards: { en: true, vi: false },
  // B2B tech-workforce hub — EN-only for now; VI mirror is a follow-up.
  companies: { en: true, vi: false },
  // Story Club with Mr. Jay (Oct 2026): EN + VI written together; price is a proposal until Jay merges.
  storyClub: { en: true, vi: true },
  // Products and prices hub (P-1, Oct 2026): EN + VI written together; VI machine-drafted, native read before merge.
  products: { en: true, vi: true },
  seriesCompare: { en: true, vi: true },
  thinkingCycleCompare: { en: true, vi: true },
  series: { en: true, vi: true },
  syllabus: { en: true, vi: true },
  thinkingCycle: { en: true, vi: true },
  legal: { en: true, vi: true },
  tools: { en: true, vi: true },
  seoPages: { en: true, vi: true },
  insightsHub: { en: true, vi: true },
};

export function getPublicContentGroup(pathname: string): PublicContentGroup | null {
  if (seoEnglishPaths.includes(pathname)) return 'seoPages';
  if (pathname === '/insights') return 'insightsHub';
  if (pathname === '/') return 'home';
  if (pathname === '/about/nathaniel-jay-adams' || pathname === '/insights' || pathname.startsWith('/insights/')) return 'knowledge';
  if (pathname.startsWith('/tools/')) return 'tools';
  if (pathname === '/framework') return 'framework';
  if (pathname === '/knowledge') return 'knowledge';
  if (pathname === '/get-started') return 'getStarted';
  if (pathname === '/available-soon') return 'availableSoon';
  if (pathname === '/worldwise') return 'worldwise';
  if (pathname === '/audit-sprint') return 'auditSprint';
  if (pathname === '/pilot-programme') return 'pilotProgramme';
  if (pathname === '/discovery') return 'discovery';
  if (pathname === '/methodology') return 'methodology';
  if (pathname === '/cefr-alignment') return 'cefrAlignment';
  if (pathname === '/teacher-standards') return 'teacherStandards';
  if (pathname === '/companies') return 'companies';
  if (pathname === '/story-club') return 'storyClub';
  if (pathname === '/products') return 'products';
  if (pathname === '/series/compare') return 'seriesCompare';
  if (pathname === '/thinking-cycle/compare') return 'thinkingCycleCompare';
  if (seriesLevels.some((level) => level.path === pathname)) return 'series';
  if (syllabusData.some((syllabus) => syllabus.syllabusRoutePath === pathname)) return 'syllabus';
  if (thinkingCycleStages.some((stage) => stage.path === pathname)) return 'thinkingCycle';
  if (pathname in legalDocuments) return 'legal';
  return null;
}

export function isPublicContentReleased(pathname: string, locale: Locale) {
  const group = getPublicContentGroup(pathname);

  if (!group) {
    return false;
  }

  return publicContentReleaseMap[group][locale];
}

export function getPublicContentReleaseMap() {
  return publicContentReleaseMap;
}
