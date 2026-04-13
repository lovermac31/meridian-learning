import { lazy, Suspense, useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { FrameworkFoundations } from './components/FrameworkFoundations';
import { ThinkingCycle } from './components/ThinkingCycle';
import { SeriesSection } from './components/SeriesSection';
import { CreativeStudio } from './components/CreativeStudio';
import { NeuroinclusiveLayer } from './components/NeuroinclusiveLayer';
import { Services } from './components/Services';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { getSeriesLevelByPath } from './lib/seriesContent';
import { getSyllabusByRoutePath } from './lib/syllabusContent';
import { getThinkingCycleStageByPath } from './lib/thinkingCycleContent';
import { applyHeadMetadata } from './lib/headManager';
import { resolveRouteMetadata } from './lib/routeMetadata';
import { isBotUIRouteAllowed } from './lib/botUiRoutes';
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
const BotUIChat = lazy(() =>
  import('./components/BotUIChat').then(m => ({ default: m.BotUIChat }))
);
const PricingModal = lazy(() =>
  import('./components/PricingModal').then(m => ({ default: m.PricingModal }))
);

/** Lightweight legal-path check — avoids importing legalContent.ts into the main bundle */
const isLegalPath = (pathname: string): boolean =>
  pathname.startsWith('/legal/');

const getCurrentRoute = () => `${window.location.pathname}${window.location.search}${window.location.hash}`;
const normalizeNavigationTarget = (target: string) => (target.startsWith('#') ? `/${target}` : target);

function App() {
  const [route, setRoute] = useState(getCurrentRoute());
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const pathname = window.location.pathname;
  const localizedRoute = resolveLocalizedRoute(pathname);
  const locale = localizedRoute.locale;
  const routePathname = localizedRoute.isLocalizable ? localizedRoute.pathname : pathname;
  const isGetStartedView = routePathname === '/get-started';
  const isAvailableSoonView = routePathname === '/available-soon';
  const isWorldWiseView = routePathname === '/worldwise';
  const isAuditSprintView = routePathname === '/audit-sprint';
  const isDiscoveryView = routePathname === '/discovery';
  const isMethodologyView = routePathname === '/methodology';
  const isCefrAlignmentView = routePathname === '/cefr-alignment';
  const isTeacherStandardsView = routePathname === '/teacher-standards';
  const isFrameworkView = routePathname === '/framework';
  const isPlansPricingAccessView = routePathname === '/plans-pricing-access';
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
    isGetStartedView;
  const isBotUIPilotVisible = isBotUIRouteAllowed(pathname) && !isPricingModalOpen;
  const isSubpageView =
    isGetStartedView ||
    isAvailableSoonView ||
    isWorldWiseView ||
    isAuditSprintView ||
    isDiscoveryView ||
    isMethodologyView ||
    isCefrAlignmentView ||
    isTeacherStandardsView ||
    isPlansPricingAccessView ||
    isFrameworkView ||
    isSeriesView ||
    isSyllabusView ||
    isSeriesComparisonView ||
    isThinkingCycleView ||
    isThinkingCycleComparisonView ||
    isLegalView;

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

      if (attempt < 10) {
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
      <Navbar
        onGetStarted={() => navigateTo('/get-started')}
        onNavigateHome={() => navigateTo('/')}
        onNavigate={navigateTo}
        onPricingClick={() => setIsPricingModalOpen(true)}
        isPortalView={isSubpageView}
        forceSolidBackground={shouldForceSolidNavbar}
        languageSwitcher={<LanguageSwitcher currentRoute={route} onNavigate={pushRoute} />}
      />
      <Suspense fallback={<div className="min-h-screen bg-jurassic-dark" />}>
      {isAvailableSoonView ? (
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
      ) : isFrameworkView ? (
        <FrameworkExperience
          onBack={() => navigateTo('/')}
          onGetStarted={() => navigateTo('/get-started')}
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
        <main id="main-content">
          <Hero
            onGetStarted={() => navigateTo('/get-started?interest=audit_sprint')}
            onExploreFramework={() => navigateTo('/discovery')}
            onOverviewRequest={() => navigateTo('/get-started?interest=curriculum_overview&source=hero')}
            onNavigate={navigateTo}
          />
          <AboutSection />
          <FrameworkFoundations onExploreFramework={() => navigateTo('/framework')} />
          <ThinkingCycle
            onSelectStage={(path) => navigateTo(path)}
            onCompareStages={() => navigateTo('/thinking-cycle/compare')}
          />
          <SeriesSection
            onSelectLevel={(path) => navigateTo(path)}
            onCompareLevels={() => navigateTo('/series/compare')}
          />
          <ErrorBoundary sectionName="Creative Studio">
            <CreativeStudio />
          </ErrorBoundary>
          <NeuroinclusiveLayer />
          <Services />
          <Contact />
        </main>
      )}
      </Suspense>
      <Footer onNavigate={navigateTo} />
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
    </div>
  );
}

export default App;
