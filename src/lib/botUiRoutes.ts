import { legalDocuments } from './legalContent';
import { seriesLevels } from './seriesContent';
import { syllabusData } from './syllabusContent';
import { thinkingCycleStages } from './thinkingCycleContent';

function normalizePathname(pathname: string) {
  if (!pathname) return '/';
  if (pathname === '/vi') return '/vi';
  return pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

export const BOTUI_DENIED_EXACT_PATHS = new Set([
  '/plans-pricing-access',
]);

export const BOTUI_DENIED_PATH_PREFIXES = [
  '/vi',
  '/api',
  '/internal',
  '/demo',
  '/thinking-cycle/JE-',
] as const;

const STATIC_ALLOWED_ENGLISH_PUBLIC_ROUTES = [
  '/',
  '/framework',
  '/get-started',
  '/worldwise',
  '/audit-sprint',
  '/discovery',
  '/methodology',
  '/cefr-alignment',
  '/teacher-standards',
  '/series/compare',
  '/thinking-cycle/compare',
] as const;

export const BOTUI_ALLOWED_ENGLISH_PUBLIC_ROUTES = new Set([
  ...STATIC_ALLOWED_ENGLISH_PUBLIC_ROUTES,
  ...seriesLevels.map((level) => level.path),
  ...syllabusData.map((syllabus) => syllabus.syllabusRoutePath),
  ...thinkingCycleStages.map((stage) => stage.path),
  ...Object.keys(legalDocuments),
]);

export type BotUIPublicDestinationKey =
  | 'homeAbout'
  | 'framework'
  | 'worldwise'
  | 'auditSprint'
  | 'discovery'
  | 'methodology'
  | 'cefrAlignment'
  | 'teacherStandards'
  | 'seriesCompare'
  | 'seriesLevel3'
  | 'thinkingCycleCompare'
  | 'thinkingCycleAnalyze'
  | 'trainingOverview'
  | 'trainingGetStarted'
  | 'institutionalGetStarted'
  | 'curriculumOverview'
  | 'getStarted'
  | 'contact'
  | 'contactGetStarted';

export type BotUIPublicDestination = {
  key: BotUIPublicDestinationKey;
  label: string;
  path: string;
};

const BOTUI_PUBLIC_DESTINATIONS: Record<BotUIPublicDestinationKey, BotUIPublicDestination> = {
  homeAbout: { key: 'homeAbout', label: 'About Jurassic English™', path: '/#about' },
  framework: { key: 'framework', label: 'View the full framework', path: '/framework' },
  worldwise: { key: 'worldwise', label: 'WorldWise Learning — institutional curriculum', path: '/worldwise' },
  auditSprint: { key: 'auditSprint', label: 'Curriculum Coherence Audit Sprint (10-day review)', path: '/audit-sprint' },
  discovery: { key: 'discovery', label: 'Book a Discovery Call (45-min structured session)', path: '/discovery' },
  methodology: { key: 'methodology', label: 'Deep-dive: the Jurassic Thinking Cycle™ methodology', path: '/methodology' },
  cefrAlignment: { key: 'cefrAlignment', label: 'CEFR, CEFR-V and MOET 2030 standards alignment', path: '/cefr-alignment' },
  teacherStandards: { key: 'teacherStandards', label: 'Teacher quality, iPGCE standards and methodology fidelity', path: '/teacher-standards' },
  seriesCompare: { key: 'seriesCompare', label: 'Compare all curriculum levels', path: '/series/compare' },
  seriesLevel3: { key: 'seriesLevel3', label: 'Level 3: Expansion (representative level)', path: '/series/level-3-expansion' },
  thinkingCycleCompare: { key: 'thinkingCycleCompare', label: 'View the Thinking Cycle stages', path: '/thinking-cycle/compare' },
  thinkingCycleAnalyze: { key: 'thinkingCycleAnalyze', label: 'See a lesson in action (Analyze stage)', path: '/thinking-cycle/analyze' },
  trainingOverview: { key: 'trainingOverview', label: 'Training and services overview', path: '/#training' },
  trainingGetStarted: {
    key: 'trainingGetStarted',
    label: 'Start a teacher training enquiry',
    path: '/get-started?interest=teacher_training',
  },
  institutionalGetStarted: {
    key: 'institutionalGetStarted',
    label: 'Book a Discovery Call',
    path: '/get-started?interest=partnership',
  },
  getStarted: { key: 'getStarted', label: 'Get Started portal', path: '/get-started' },
  contact: { key: 'contact', label: 'Contact section', path: '/#contact' },
  contactGetStarted: {
    key: 'contactGetStarted',
    label: 'Send a general enquiry',
    path: '/get-started',
  },
  curriculumOverview: {
    key: 'curriculumOverview',
    label: 'Request a Curriculum Overview — no call required',
    path: '/get-started?interest=curriculum_overview&source=botui',
  },
};

export function isBotUIRouteAllowed(pathname: string) {
  const normalizedPathname = normalizePathname(pathname);

  if (BOTUI_DENIED_EXACT_PATHS.has(normalizedPathname)) {
    return false;
  }

  if (BOTUI_DENIED_PATH_PREFIXES.some((prefix) => normalizedPathname === prefix || normalizedPathname.startsWith(`${prefix}/`))) {
    return false;
  }

  return BOTUI_ALLOWED_ENGLISH_PUBLIC_ROUTES.has(normalizedPathname);
}

export function getBotUIPublicDestination(key: BotUIPublicDestinationKey) {
  return BOTUI_PUBLIC_DESTINATIONS[key];
}
