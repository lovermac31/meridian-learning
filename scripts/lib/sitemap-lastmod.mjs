/**
 * sitemap-lastmod.mjs — honest per-URL <lastmod> for dist/sitemap.xml.
 *
 * A URL's lastmod is the committer date of the most recent commit touching
 * that page's OWN source/content files (the map below). Shared chrome
 * (Navbar, Footer, App shell, routeMetadata, UI strings) is deliberately not
 * mapped, so a layout change does not re-date every URL.
 *
 * Granularity is per file: content modules hold both locales, and some hold
 * several pages (e.g. src/lib/seriesContent.ts has all five levels), so an
 * edit to one level re-dates its siblings. Page components are mapped too
 * (they carry markup and some copy), so a code-only change to a page
 * component also re-dates it. Both over-report freshness slightly; neither
 * invents a date.
 *
 * When lastmod cannot be known honestly it is OMITTED (allowed by the sitemap
 * protocol), never guessed:
 *   - git is unavailable or this is not a git checkout;
 *   - the checkout is shallow (`git rev-parse --is-shallow-repository` is
 *     true). Vercel clones with --depth=10 by default; in a shallow clone the
 *     oldest fetched commit appears to "add" every file, so per-file dates
 *     would be fabricated. Setting VERCEL_DEEP_CLONE=true on the Vercel project
 *     gives the build full history;
 *   - the URL has no source mapping (pages served by other Vercel projects via
 *     rewrites — their deploy source is not this build's checkout);
 *   - git returns no commit for the mapped files.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const component = (name) => `src/components/${name}.tsx`;
const content = (name) => `src/i18n/content/${name}.ts`;

const SERIES_SOURCES = [component('SeriesExperience'), content('series'), 'src/lib/seriesContent.ts'];
const SYLLABUS_SOURCES = [
  component('SyllabusExperience'),
  content('syllabus'),
  'src/lib/syllabusContent.ts',
  'src/lib/seriesContent.ts',
];
const THINKING_CYCLE_SOURCES = [
  component('ThinkingCycleExperience'),
  content('thinkingCycle'),
  'src/lib/thinkingCycleContent.ts',
];
const LEGAL_SOURCES = [component('LegalPage'), content('legal'), 'src/lib/legalContent.ts'];
const YOUNG_LEARNERS_SOURCES = [
  'young-learners-speaking/index.html',
  'public/young-learners-speaking',
  'src/yl',
];

/** English (canonical) pathname → the files that make up that page's content. */
const STATIC_ROUTE_SOURCES = {
  '/': [
    component('Hero'),
    component('AudienceFork'),
    component('AiSpeakingHeroSpotlight'),
    component('AiSpeakingLaunch'),
    component('CredibilityLogoMarquee'),
    component('ProofStrip'),
    component('TestimonialsSection'),
    component('PreferredSourceButton'),
    content('home'),
  ],
  '/framework': [component('FrameworkExperience'), content('framework'), 'src/lib/frameworkContent.ts'],
  '/knowledge': [component('KnowledgeHubPage'), content('knowledge')],
  '/insights': ['src/components/SearchInsightsPage.tsx', 'src/lib/insightsContent.ts'],
  '/about/nathaniel-jay-adams': ['src/components/SearchInsightsPage.tsx', 'src/lib/insightsContent.ts'],
  '/get-started': [component('GetStartedPortal'), content('getStarted')],
  '/worldwise': [component('WorldWisePage'), content('worldwise')],
  '/audit-sprint': [component('AuditSprintPage'), content('auditSprint')],
  '/companies': [component('CompaniesPage'), content('companies')],
  '/pilot-programme': [component('PilotProgrammePage'), content('pilotProgramme')],
  '/discovery': [component('DiscoveryPage'), content('discovery')],
  '/methodology': [component('MethodologyPage'), content('methodology')],
  '/cefr-alignment': [component('CefrAlignmentPage'), content('cefrAlignment')],
  '/teacher-standards': [component('TeacherStandardsPage'), content('teacherStandards')],
  '/series/compare': [component('SeriesComparisonExperience'), content('series'), 'src/lib/seriesContent.ts'],
  '/thinking-cycle/compare': [
    component('ThinkingCycleComparisonExperience'),
    content('thinkingCycle'),
    'src/lib/thinkingCycleContent.ts',
  ],
  // Static pages outside the SPA (listed in generate-sitemap.mjs STATIC_EXTRA_URLS).
  '/young-learners-speaking/': YOUNG_LEARNERS_SOURCES,
  '/vi/luyen-noi-ielts/': [...YOUNG_LEARNERS_SOURCES, 'scripts/prerender-yl-vi.mjs'],
};

/**
 * URLs that are public and in the sitemap but deliberately have no lastmod:
 * they are served by other Vercel projects through vercel.json rewrites, so
 * this checkout's history does not describe what is deployed there.
 */
const UNMAPPED_URL_PATTERNS = [
  /^\/(student-academy|school-framework|digital-reasoning-engine|interactive-demo|evidence|book-diagnostic)(\/|$)/,
  /^\/ai-speaking(\/|$)/,
];

function toCanonicalPath(pathname) {
  if (pathname === '/vi' || pathname === '/vi/') return '/';
  if (pathname.startsWith('/vi/') && !STATIC_ROUTE_SOURCES[pathname]) return pathname.slice(3);
  return pathname;
}

/** Source files for a sitemap pathname, or null when it has no honest mapping. */
export function getRouteSourceFiles(pathname) {
  if (UNMAPPED_URL_PATTERNS.some((pattern) => pattern.test(pathname))) return null;

  const canonical = toCanonicalPath(pathname);
  if (/^\/insights\/[^/]+$/.test(canonical)) return ['src/components/SearchInsightsPage.tsx', 'src/lib/insightsContent.ts'];
  if (STATIC_ROUTE_SOURCES[canonical]) return [...STATIC_ROUTE_SOURCES[canonical]];
  if (/^\/series\/level-[^/]+\/syllabus$/.test(canonical)) return [...SYLLABUS_SOURCES];
  if (/^\/series\/level-[^/]+$/.test(canonical)) return [...SERIES_SOURCES];
  if (/^\/thinking-cycle\/[^/]+$/.test(canonical)) return [...THINKING_CYCLE_SOURCES];
  if (/^\/legal\/[^/]+$/.test(canonical)) return [...LEGAL_SOURCES];
  return null;
}

/** Every file path the map references (for the existence test). */
export function getAllMappedSourceFiles() {
  return [
    ...new Set([
      ...Object.values(STATIC_ROUTE_SOURCES).flat(),
      ...SERIES_SOURCES,
      ...SYLLABUS_SOURCES,
      ...THINKING_CYCLE_SOURCES,
      ...LEGAL_SOURCES,
    ]),
  ];
}

function defaultRunGit(args, cwd) {
  return execFileSync('git', args, { cwd, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
}

/**
 * Returns { status, reason, lastmodFor(pathname) }. `status` is 'ok' when
 * per-file history is trustworthy, otherwise 'disabled' and lastmodFor()
 * always returns null.
 */
export function createLastmodResolver({ cwd = process.cwd(), runGit = defaultRunGit } = {}) {
  let shallow;
  try {
    shallow = runGit(['rev-parse', '--is-shallow-repository'], cwd);
  } catch {
    return { status: 'disabled', reason: 'git history unavailable', lastmodFor: () => null };
  }

  if (shallow === 'true') {
    return {
      status: 'disabled',
      reason: 'shallow git clone — per-file dates would be wrong (on Vercel set VERCEL_DEEP_CLONE=true)',
      lastmodFor: () => null,
    };
  }
  if (shallow !== 'false') {
    return { status: 'disabled', reason: `unexpected git response "${shallow}"`, lastmodFor: () => null };
  }

  const cache = new Map();
  const lastmodFor = (pathname) => {
    const files = getRouteSourceFiles(pathname);
    if (!files) return null;

    const key = files.join('\0');
    if (cache.has(key)) return cache.get(key);

    let date = null;
    try {
      const out = runGit(['log', '-1', '--format=%cs', '--', ...files], cwd);
      date = /^\d{4}-\d{2}-\d{2}$/.test(out) ? out : null;
    } catch {
      date = null;
    }
    cache.set(key, date);
    return date;
  };

  return { status: 'ok', reason: null, lastmodFor };
}

/** True when every mapped file exists relative to `root`. */
export function findMissingSourceFiles(root) {
  return getAllMappedSourceFiles().filter((file) => !fs.existsSync(path.join(root, file)));
}
