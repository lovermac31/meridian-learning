import { lazy, Suspense, useEffect, useState } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProofStrip } from './components/ProofStrip';
// `/knowledge` is eager (not lazy): the hash deep-link scroll needs the
// accordion DOM present on mount with a stable full-height layout. Lazy-
// loading introduced a Suspense-swap race that reset the deep-anchor scroll.
import { KnowledgeHubPage } from './components/KnowledgeHubPage';
import { InstitutionalDecisionSnapshot } from './components/InstitutionalDecisionSnapshot';
import { Services } from './components/Services';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { getSeriesLevelByPath } from './lib/seriesContent';
import { getSyllabusByRoutePath } from './lib/syllabusContent';
import { getThinkingCycleStageByPath } from './lib/thinkingCycleContent';
import { applyHeadMetadata } from './lib/headManager';
import { isRewriteServedRoute, resolveRouteMetadata } from './lib/routeMetadata';
import { isBotUIRouteAllowed } from './lib/botUiRoutes';
import { normalizeSpeedInsightsRoute } from './lib/speedInsightsRoute';
import { localizeRouteTarget, resolveLocalizedRoute, switchLocaleRoute } from './i18n/routing';
import { isPublicContentReleased } from './i18n/content';
import { getLocalizedSyllabusByRoutePath } from './i18n/content/syllabus';

/* ── Lazy-loaded subpages (code-split) ──────────────────────────── */
const GetStartedPortal = lazy(() =>
  import('./components/GetStartedPortal').then(m => ({ default: m.GetStartedPortal }))
);
const WorldWisePage = lazy(() =>
  import('./components/WorldWisePage').then(m => ({ default: m.WorldWisePage }))
);
const AuditSprintPage = lazy(() =>
  import('./components/AuditSprintPage').then(m => ({ default: m.AuditSprintPage }))
);
const PilotProgrammePage = lazy(() =>
  import('./components/PilotProgrammePage').then(m => ({ default: m.PilotProgrammePage }))
);
const DiscoveryPage = lazy(() =>
  import('./components/DiscoveryPage').then(m => ({ default: m.DiscoveryPage }))
);
const MethodologyPage = lazy(() =>
  import('./components/MethodologyPage').then(m => ({ default: m.MethodologyPage }))
);
const CefrAlignmentPage = lazy(() =>
  import('./components/CefrAlignmentPage').then(m => ({ default: m.CefrAlignmentPage }))
);
const TeacherStandardsPage = lazy(() =>
  import('./components/TeacherStandardsPage').then(m => ({ default: m.TeacherStandardsPage }))
);
const FrameworkExperience = lazy(() =>
  import('./components/FrameworkExperience').then(m => ({ default: m.FrameworkExperience }))
);
const LegalPage = lazy(() =>
  import('./components/LegalPage').then(m => ({ default: m.LegalPage }))
);
const PlansPricingAccessPage = lazy(() =>
  import('./components/PlansPricingAccessPage').then(m => ({ default: m.PlansPricingAccessPage }))
);
const ExternalPilotPortalPage = lazy(() =>
  import('./components/ExternalPilotPortalPage').then(m => ({ default: m.ExternalPilotPortalPage }))
);
const InternalPilotRequestsPage = lazy(() =>
  import('./components/InternalPilotRequestsPage').then(m => ({ default: m.InternalPilotRequestsPage }))
);
// `/pilot/:id` — public-safe pending-approval holding page (NOT the
// token-authenticated portal at /external/pilot). Renders no record data.
const PilotHoldingPage = lazy(() =>
  import('./components/PilotHoldingPage').then(m => ({ default: m.PilotHoldingPage }))
);
const ThinkingCycleExperience = lazy(() =>
  import('./components/ThinkingCycleExperience').then(m => ({ default: m.ThinkingCycleExperience }))
);
const ThinkingCycleComparisonExperience = lazy(() =>
  import('./components/ThinkingCycleComparisonExperience').then(m => ({ default: m.ThinkingCycleComparisonExperience }))
);
const SeriesExperience = lazy(() =>
  import('./components/SeriesExperience').then(m => ({ default: m.SeriesExperience }))
);
const SeriesComparisonExperience = lazy(() =>
  import('./components/SeriesComparisonExperience').then(m => ({ default: m.SeriesComparisonExperience }))
);
const SyllabusExperience = lazy(() =>
  import('./components/SyllabusExperience').then(m => ({ default: m.SyllabusExperience }))
);
const AvailableSoonPage = lazy(() =>
  import('./components/AvailableSoonPage').then(m => ({ default: m.AvailableSoonPage }))
);
const NotFoundPage = lazy(() =>
  import('./components/NotFoundPage').then(m => ({ default: m.NotFoundPage }))
);
const BotUIChat = lazy(() =>
  import('./components/BotUIChat').then(m => ({ default: m.BotUIChat }))
);
const PricingModal = lazy(() =>
  import('./components/PricingModal').then(m => ({ default: m.PricingModal }))
);
const ComingSoonModal = lazy(() =>
  import('./components/ComingSoonModal').then(m => ({ default: m.ComingSoonModal }))
);

/* ── Lazy-loaded homepage sections (staged after initial render) ───────── */
const SeriesSection = lazy(() =>
  import('./components/SeriesSection').then(m => ({ default: m.SeriesSection }))
);
const Contact = lazy(() =>
  import('./components/Contact').then(m => ({ default: m.Contact }))
);
const AboutSection = lazy(() =>
  import('./components/AboutSection').then(m => ({ default: m.AboutSection }))
);
const FrameworkFoundations = lazy(() =>
  import('./components/FrameworkFoundations').then(m => ({ default: m.FrameworkFoundations }))
);
const ThinkingCycle = lazy(() =>
  import('./components/ThinkingCycle').then(m => ({ default: m.ThinkingCycle }))
);
const StudentAcademyMural = lazy(() =>
  import('./components/StudentAcademyMural').then(m => ({ default: m.StudentAcademyMural }))
);
const NeuroinclusiveLayer = lazy(() =>
  import('./components/NeuroinclusiveLayer').then(m => ({ default: m.NeuroinclusiveLayer }))
);

/** Lightweight legal-path check — avoids importing legalContent.ts into the main bundle */
const isLegalPath = (pathname: string): boolean =>
  pathname.startsWith('/legal/');

const getCurrentRoute = () => `${window.location.pathname}${window.location.search}${window.location.hash}`;
const normalizeNavigationTarget = (target: string) => (target.startsWith('#') ? `/${target}` : target);
const DEFERRED_HOME_STAGE_DELAY_MS = 180;

type HomeSectionStage = 0 | 1 | 2 | 3;

const DeferredHomeSectionPlaceholder = ({ className = 'min-h-40' }: { className?: string }) => (
  <div className={className} aria-hidden="true" />
);

function App() {
  const [route, setRoute] = useState(getCurrentRoute());
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
  const [homeSectionStage, setHomeSectionStage] = useState<HomeSectionStage>(0);
  const pathname = window.location.pathname;
  const speedInsightsRoute = normalizeSpeedInsightsRoute(route);
  const localizedRoute = resolveLocalizedRoute(pathname);
  const locale = localizedRoute.locale;
  const routePathname = localizedRoute.isLocalizable ? localizedRoute.pathname : pathname;
  const isGetStartedView = routePathname === '/get-started';
  const isAvailableSoonView = routePathname === '/available-soon';
  const isWorldWiseView = routePathname === '/worldwise';
  const isAuditSprintView = routePathname === '/audit-sprint';
  const isPilotProgrammeView = routePathname === '/pilot-programme';
  const isDiscoveryView = routePathname === '/discovery';
  const isMethodologyView = routePathname === '/methodology';
  const isCefrAlignmentView = routePathname === '/cefr-alignment';
  const isTeacherStandardsView = routePathname === '/teacher-standards';
  const isFrameworkView = routePathname === '/framework';
  const isKnowledgeView = routePathname === '/knowledge';
  const isPlansPricingAccessView = routePathname === '/plans-pricing-access';
  const isExternalPilotPortalView = routePathname === '/external/pilot';
  const isInternalPilotRequestsView = routePathname === '/internal/pilot-requests';
  // `/pilot/<id>` — a single non-empty segment after /pilot/. Matches the
  // automation-email holding URLs (e.g. /pilot/pilot-2026-05-30-b9b4492c)
  // and renders a public-safe pending-approval page. Excludes bare /pilot
  // and any deeper nesting (/pilot/a/b).
  const isPilotHoldingView = /^\/pilot\/[^/]+$/.test(routePathname);
  const isSeriesComparisonView = routePathname === '/series/compare';
  const isThinkingCycleComparisonView = routePathname === '/thinking-cycle/compare';
  const isLegalView = isLegalPath(routePathname);
  const currentSeriesLevel = getSeriesLevelByPath(routePathname);
  const currentThinkingCycleStage = getThinkingCycleStageByPath(routePathname);
  const currentSyllabusData = getSyllabusByRoutePath(routePathname);
  const localizedSyllabusData = getLocalizedSyllabusByRoutePath(routePathname, locale);
  const isThinkingCycleView = currentThinkingCycleStage !== null;
  const isSeriesView = currentSeriesLevel !== null;
  const isSyllabusView = currentSyllabusData !== null;
  const syllabusLevelPath = isSyllabusView ? routePathname.replace('/syllabus', '') : null;
  const currentSyllabusLevel = syllabusLevelPath ? getSeriesLevelByPath(syllabusLevelPath) : null;
  const isUnreleasedLocalizedPublicView =
    localizedRoute.isLocalizable &&
    locale !== 'en' &&
    !localizedRoute.isPrivateOrNonLocalized &&
    !isPublicContentReleased(routePathname, locale);
  const shouldForceSolidNavbar =
    isAvailableSoonView ||
    isUnreleasedLocalizedPublicView ||
    isGetStartedView ||
    // /knowledge has a light (ivory) background from the top, so the
    // transparent navbar's white wordmark + links would be invisible.
    // Force the solid dark navbar like the other light-background pages.
    isKnowledgeView;
  const isBotUIPilotVisible = isBotUIRouteAllowed(pathname) && !isPricingModalOpen && !isComingSoonOpen;
  const isSubpageView =
    isGetStartedView ||
    isAvailableSoonView ||
    isWorldWiseView ||
    isAuditSprintView ||
    isPilotProgrammeView ||
    isDiscoveryView ||
    isMethodologyView ||
    isCefrAlignmentView ||
    isTeacherStandardsView ||
    isPlansPricingAccessView ||
    isExternalPilotPortalView ||
    isInternalPilotRequestsView ||
    isPilotHoldingView ||
    isFrameworkView ||
    isKnowledgeView ||
    isSeriesView ||
    isSyllabusView ||
    isSeriesComparisonView ||
    isThinkingCycleView ||
    isThinkingCycleComparisonView ||
    isLegalView;
  const isUnknownRouteView = !isSubpageView && routePathname !== '/';
  const isHomeView = !isSubpageView && !isUnknownRouteView;

  // Phase 0 — Redirect malformed paths containing the Unicode replacement character (U+FFFD)
  // These appear in server logs from mangled links (e.g. /%EF%BF%BDContact) and should
  // resolve to the home page rather than rendering an unmapped route silently.
  useEffect(() => {
    if (pathname.includes('\uFFFD')) {
      window.history.replaceState({}, '', '/');
      setRoute('/');
    }
  }, [pathname]);

  useEffect(() => {
    const handlePopState = () => setRoute(getCurrentRoute());
    const handleHashChange = () => setRoute(getCurrentRoute());
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    applyHeadMetadata(resolveRouteMetadata(pathname));
  }, [pathname]);

  useEffect(() => {
    if (!localizedRoute.isPrivateOrNonLocalized) {
      return;
    }

    if (pathname === routePathname) {
      return;
    }

    const normalizedPrivateRoute = `${routePathname}${window.location.search}${window.location.hash}`;
    window.history.replaceState({}, '', normalizedPrivateRoute);
    setRoute(normalizedPrivateRoute);
  }, [
    localizedRoute.isPrivateOrNonLocalized,
    pathname,
    routePathname,
  ]);

  useEffect(() => {
    if (!isHomeView) {
      setHomeSectionStage(0);
      return;
    }

    if (routePathname === '/' && window.location.hash) {
      setHomeSectionStage(3);
      return;
    }

    setHomeSectionStage(0);

    const stageTimers = [
      window.setTimeout(() => setHomeSectionStage(1), 0),
      window.setTimeout(() => setHomeSectionStage(2), DEFERRED_HOME_STAGE_DELAY_MS),
      window.setTimeout(() => setHomeSectionStage(3), DEFERRED_HOME_STAGE_DELAY_MS * 2),
    ];

    return () => {
      stageTimers.forEach((timerId) => window.clearTimeout(timerId));
    };
  }, [isHomeView, route, routePathname]);

  useEffect(() => {
    if (routePathname !== '/' || !window.location.hash) {
      return;
    }

    const targetId = window.location.hash.slice(1);
    let frameId = 0;
    let attempt = 0;

    const scrollToTarget = () => {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      if (attempt < 120) {
        attempt += 1;
        frameId = window.requestAnimationFrame(scrollToTarget);
      }
    };

    frameId = window.requestAnimationFrame(scrollToTarget);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [route, routePathname]);

  const pushRoute = (normalizedTarget: string) => {
    const nextUrl = new URL(normalizedTarget, window.location.origin);
    const nextRoute = `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;

    if (route !== nextRoute) {
      window.history.pushState({}, '', nextRoute);
      if (!nextUrl.hash) {
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
      setRoute(nextRoute);
      return;
    }

    if (nextUrl.hash) {
      const element = document.getElementById(nextUrl.hash.slice(1));
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateTo = (nextPath: string) => {
    const normalizedTarget = localizeRouteTarget(normalizeNavigationTarget(nextPath), locale);
    // Phase 20 — ecosystem routes (/student-academy, /interactive-demo,
    // /book-diagnostic, /digital-reasoning-engine, /evidence,
    // /school-framework) are served by Vercel rewrites to a separate
    // Next.js app, not by this Vite SPA. Use a full document navigation
    // so the rewrite fires; pushState would only update the URL and leave
    // React Router rendering the NotFoundPage fallback for the unknown
    // route. Strip query/hash before the membership check so paths like
    // `/interactive-demo#try-one-thinking-move` and
    // `/student-academy?utm=foo` still match.
    const targetPathname = normalizedTarget.split('?')[0].split('#')[0];
    if (isRewriteServedRoute(targetPathname)) {
      window.location.assign(normalizedTarget);
      return;
    }
    pushRoute(normalizedTarget);
  };

  const navigateBackOrHome = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    pushRoute(localizeRouteTarget('/', locale));
  };

  return (
    <div className="min-h-screen bg-white">
      {/*
        Phase 9 — Skip-to-main-content link (WCAG 2.4.1 Bypass Blocks).
        Must be the first focusable element in the page so a keyboard user
        pressing Tab once can jump straight to <main id="main-content">,
        bypassing the 11-item header. Visually hidden via `sr-only` until
        focused; on focus it lifts to a fixed-position high-contrast pill
        in the top-left corner. Mirrors the same pattern shipped in
        ecosystem-landing/src/app/layout.tsx in Phase 8.
      */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-jurassic-accent focus:text-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2"
      >
        Skip to main content
      </a>
      {!isInternalPilotRequestsView ? (
        <Navbar
          onGetStarted={() => navigateTo('/get-started')}
          onNavigateHome={() => navigateTo('/')}
          onNavigate={navigateTo}
          onPricingClick={() => setIsPricingModalOpen(true)}
          onEducationAffiliateClick={() => setIsComingSoonOpen(true)}
          isPortalView={isSubpageView}
          forceSolidBackground={shouldForceSolidNavbar}
          languageSwitcher={<LanguageSwitcher currentRoute={route} onNavigate={pushRoute} />}
        />
      ) : null}
      <Suspense fallback={<div className="min-h-screen bg-jurassic-dark" />}>
      {isUnknownRouteView ? (
        <NotFoundPage
          onBack={() => navigateTo('/')}
          onGetStarted={() => navigateTo('/get-started')}
        />
      ) : isAvailableSoonView ? (
        <AvailableSoonPage
          onBack={navigateBackOrHome}
          onGetStarted={() => navigateTo('/get-started')}
          onContactUs={() => navigateTo('/#contact')}
        />
      ) : isUnreleasedLocalizedPublicView ? (
        <AvailableSoonPage
          onBack={navigateBackOrHome}
          onGetStarted={() => navigateTo('/get-started')}
          onContactUs={() => navigateTo('/#contact')}
        />
      ) : isGetStartedView ? (
        <GetStartedPortal onBack={() => navigateTo('/')} />
      ) : isWorldWiseView ? (
        <WorldWisePage
          locale={locale}
          onBack={() => navigateTo('/')}
          onGetStarted={() => navigateTo('/get-started?interest=audit_sprint')}
          onNavigate={navigateTo}
        />
      ) : isAuditSprintView ? (
        <AuditSprintPage
          locale={locale}
          onBack={() => navigateTo('/')}
          onGetStarted={() => navigateTo('/get-started?interest=audit_sprint')}
          onNavigate={navigateTo}
        />
      ) : isPilotProgrammeView ? (
        <PilotProgrammePage
          locale={locale}
          onBack={() => navigateTo('/')}
          onGetStarted={() => navigateTo('/get-started?interest=curriculum_review&source=pilot-programme&access=consultation')}
          onNavigate={navigateTo}
        />
      ) : isDiscoveryView ? (
        <DiscoveryPage
          onBack={() => navigateTo('/')}
          onGetStarted={() => navigateTo('/get-started?interest=discovery_call')}
          onNavigate={navigateTo}
        />
      ) : isMethodologyView ? (
        <MethodologyPage
          onBack={() => navigateTo('/')}
          onGetStarted={() => navigateTo('/get-started?interest=audit_sprint')}
          onNavigate={navigateTo}
        />
      ) : isCefrAlignmentView ? (
        <CefrAlignmentPage
          locale={locale}
          onBack={() => navigateTo('/')}
          onGetStarted={() => navigateTo('/get-started?interest=audit_sprint')}
          onNavigate={navigateTo}
        />
      ) : isTeacherStandardsView ? (
        <TeacherStandardsPage
          onBack={() => navigateTo('/')}
          onGetStarted={() => navigateTo('/get-started?interest=discovery_call')}
          onNavigate={navigateTo}
        />
      ) : isPlansPricingAccessView ? (
        <PlansPricingAccessPage onBack={() => navigateTo('/')} />
      ) : isExternalPilotPortalView ? (
        <ExternalPilotPortalPage
          onBack={() => navigateTo('/')}
          onRequestAccess={() => navigateTo('/get-started?interest=curriculum_review&source=pilot-programme&access=pilot_pack')}
        />
      ) : isInternalPilotRequestsView ? (
        <InternalPilotRequestsPage />
      ) : isPilotHoldingView ? (
        <PilotHoldingPage onBack={() => navigateTo('/')} />
      ) : isFrameworkView ? (
        <FrameworkExperience
          onBack={() => navigateTo('/')}
          onGetStarted={() => navigateTo('/get-started')}
        />
      ) : isKnowledgeView ? (
        <KnowledgeHubPage
          onBack={() => navigateTo('/')}
          onNavigate={navigateTo}
        />
      ) : isThinkingCycleView && currentThinkingCycleStage ? (
        <ThinkingCycleExperience
          stage={currentThinkingCycleStage}
          onBack={() => navigateTo('/')}
          onSelectStage={(path) => navigateTo(path)}
          onCompareStages={() => navigateTo('/thinking-cycle/compare')}
        />
      ) : isThinkingCycleComparisonView ? (
        <ThinkingCycleComparisonExperience
          onBack={() => navigateTo('/')}
          onSelectStage={(path) => navigateTo(path)}
        />
      ) : isSeriesComparisonView ? (
        <SeriesComparisonExperience
          onBack={() => navigateTo('/')}
          onSelectLevel={(path) => navigateTo(path)}
          onViewSyllabus={(path) => navigateTo(path)}
        />
      ) : isSyllabusView && currentSyllabusData && currentSyllabusLevel && localizedSyllabusData ? (
        <SyllabusExperience
          level={currentSyllabusLevel}
          syllabus={localizedSyllabusData}
          onBack={() => navigateTo(syllabusLevelPath ?? '/')}
          onViewLevel={() => navigateTo(syllabusLevelPath ?? '/')}
        />
      ) : isLegalView ? (
        <LegalPage onBack={() => navigateTo('/')} />
      ) : isSeriesView && currentSeriesLevel ? (
        <SeriesExperience
          level={currentSeriesLevel}
          onBack={() => navigateTo('/')}
          onSelectLevel={(path) => navigateTo(path)}
          onCompareLevels={() => navigateTo('/series/compare')}
          onViewSyllabus={() => navigateTo(currentSeriesLevel.syllabusRoutePath)}
        />
      ) : (
        // Phase 9 — `tabIndex={-1}` lets the skip link above move focus
        // into <main> on activation. Without it the URL hash changes but
        // focus stays on <body>, leaving keyboard users with the scroll
        // jump only. -1 keeps <main> out of the natural Tab sequence.
        // P0 — condensed two-door homepage. The old ten-section staged
        // homepage (InstitutionalDecisionSnapshot, Services, SeriesSection,
        // Contact, AboutSection, FrameworkFoundations, ThinkingCycle,
        // StudentAcademyMural, NeuroinclusiveLayer) was replaced by the
        // Hero fork + ProofStrip. Those components remain in the repo,
        // unreferenced, for trivial rollback (see docs/p0-*build-plan).
        <main id="main-content" tabIndex={-1} className="focus:outline-none">
          <Hero onNavigate={navigateTo} />
          <ProofStrip onNavigate={navigateTo} />
        </main>
      )}
      </Suspense>
      {!isInternalPilotRequestsView ? (
        <Footer
          onNavigate={navigateTo}
          onPricingClick={() => setIsPricingModalOpen(true)}
          onEducationAffiliateClick={() => setIsComingSoonOpen(true)}
        />
      ) : null}
      {isBotUIPilotVisible ? (
        <Suspense fallback={null}>
          <BotUIChat currentPathname={pathname} onNavigate={navigateTo} />
        </Suspense>
      ) : null}
      <Suspense fallback={null}>
        <PricingModal
          isOpen={isPricingModalOpen}
          onClose={() => setIsPricingModalOpen(false)}
        />
      </Suspense>
      <Suspense fallback={null}>
        <ComingSoonModal
          isOpen={isComingSoonOpen}
          onClose={() => setIsComingSoonOpen(false)}
          onNavigate={navigateTo}
        />
      </Suspense>
      <SpeedInsights route={speedInsightsRoute} />
    </div>
  );
}

export default App;
