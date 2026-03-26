import { lazy, Suspense, useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { FrameworkFoundations } from './components/FrameworkFoundations';
import { ThinkingCycle } from './components/ThinkingCycle';
import { ThinkingCycleExperience } from './components/ThinkingCycleExperience';
import { ThinkingCycleComparisonExperience } from './components/ThinkingCycleComparisonExperience';
import { SeriesSection } from './components/SeriesSection';
import { SeriesExperience } from './components/SeriesExperience';
import { SeriesComparisonExperience } from './components/SeriesComparisonExperience';
import { CreativeStudio } from './components/CreativeStudio';
import { NeuroinclusiveLayer } from './components/NeuroinclusiveLayer';
import { Services } from './components/Services';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PricingModal } from './components/PricingModal';
import { getSeriesLevelByPath } from './lib/seriesContent';
import { getThinkingCycleStageByPath } from './lib/thinkingCycleContent';

/* ── Lazy-loaded subpages (code-split) ──────────────────────────── */
const GetStartedPortal = lazy(() =>
  import('./components/GetStartedPortal').then(m => ({ default: m.GetStartedPortal }))
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

/** Lightweight legal-path check — avoids importing legalContent.ts into the main bundle */
const isLegalPath = (pathname: string): boolean =>
  pathname.startsWith('/legal/');

const getCurrentRoute = () => `${window.location.pathname}${window.location.search}${window.location.hash}`;
const normalizeNavigationTarget = (target: string) => (target.startsWith('#') ? `/${target}` : target);

const defaultTitle = 'Jurassic English™ — Critical Thinking & Moral Reasoning Through Literature';

const legalTitleByPath: Record<string, string> = {
  '/legal/terms': 'Terms & Conditions | Jurassic English™',
  '/legal/privacy': 'Privacy Policy | Jurassic English™',
  '/legal/cookies': 'Cookie Policy | Jurassic English™',
  '/legal/accessibility': 'Accessibility Statement | Jurassic English™',
  '/legal/disclaimer': 'Disclaimer | Jurassic English™',
};

const getPageTitle = (pathname: string): string => {
  if (pathname === '/') return defaultTitle;
  if (pathname === '/framework') return 'Framework | Jurassic English™';
  if (pathname === '/get-started') return 'Get Started | Jurassic English™';
  if (pathname === '/plans-pricing-access') return 'Plans & Pricing Access | Jurassic English™';
  if (pathname === '/series/compare') return 'Compare Series Levels | Jurassic English™';
  if (pathname === '/thinking-cycle/compare') return 'Compare Thinking Cycle Stages | Jurassic English™';

  const seriesLevel = getSeriesLevelByPath(pathname);
  if (seriesLevel) {
    return `${seriesLevel.title} | Jurassic English™`;
  }

  const stage = getThinkingCycleStageByPath(pathname);
  if (stage) {
    return `${stage.title} Stage | Jurassic English™`;
  }

  return legalTitleByPath[pathname] ?? defaultTitle;
};

function App() {
  const [route, setRoute] = useState(getCurrentRoute());
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const pathname = window.location.pathname;
  const isGetStartedView = pathname === '/get-started';
  const isFrameworkView = pathname === '/framework';
  const isPlansPricingAccessView = pathname === '/plans-pricing-access';
  const isSeriesComparisonView = pathname === '/series/compare';
  const isThinkingCycleComparisonView = pathname === '/thinking-cycle/compare';
  const isLegalView = isLegalPath(pathname);
  const currentSeriesLevel = getSeriesLevelByPath(pathname);
  const currentThinkingCycleStage = getThinkingCycleStageByPath(pathname);
  const isThinkingCycleView = currentThinkingCycleStage !== null;
  const isSeriesView = currentSeriesLevel !== null;
  const isSubpageView =
    isGetStartedView ||
    isPlansPricingAccessView ||
    isFrameworkView ||
    isSeriesView ||
    isSeriesComparisonView ||
    isThinkingCycleView ||
    isThinkingCycleComparisonView ||
    isLegalView;

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
    document.title = getPageTitle(pathname);
  }, [pathname]);

  useEffect(() => {
    if (window.location.pathname !== '/' || !window.location.hash) {
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
  }, [route]);

  const navigateTo = (nextPath: string) => {
    const normalizedTarget = normalizeNavigationTarget(nextPath);
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

  return (
    <div className="min-h-screen bg-white">
      <Analytics />
      <Navbar
        onGetStarted={() => navigateTo('/get-started')}
        onNavigateHome={() => navigateTo('/')}
        onNavigate={navigateTo}
        onPricingClick={() => setIsPricingModalOpen(true)}
        isPortalView={isSubpageView}
      />
      <Suspense fallback={<div className="min-h-screen bg-jurassic-dark" />}>
      {isGetStartedView ? (
        <GetStartedPortal onBack={() => navigateTo('/')} />
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
        />
      ) : isLegalView ? (
        <LegalPage onBack={() => navigateTo('/')} />
      ) : isSeriesView && currentSeriesLevel ? (
        <SeriesExperience
          level={currentSeriesLevel}
          onBack={() => navigateTo('/')}
          onSelectLevel={(path) => navigateTo(path)}
          onCompareLevels={() => navigateTo('/series/compare')}
        />
      ) : (
        <main id="main-content">
          <Hero
            onGetStarted={() => navigateTo('/get-started')}
            onExploreFramework={() => navigateTo('/framework')}
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
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
      />
    </div>
  );
}

export default App;
