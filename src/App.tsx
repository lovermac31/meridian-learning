import { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { FrameworkFoundations } from './components/FrameworkFoundations';
import { FrameworkExperience } from './components/FrameworkExperience';
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
import { GetStartedPortal } from './components/GetStartedPortal';
import { getSeriesLevelByPath } from './lib/seriesContent';
import { getThinkingCycleStageByPath } from './lib/thinkingCycleContent';

function App() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (nextPath: string) => {
    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
      window.scrollTo({ top: 0, behavior: 'auto' });
      setPathname(nextPath);
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isGetStartedView = pathname === '/get-started';
  const isFrameworkView = pathname === '/framework';
  const isSeriesComparisonView = pathname === '/series/compare';
  const isThinkingCycleComparisonView = pathname === '/thinking-cycle/compare';
  const currentSeriesLevel = getSeriesLevelByPath(pathname);
  const currentThinkingCycleStage = getThinkingCycleStageByPath(pathname);
  const isThinkingCycleView = currentThinkingCycleStage !== null;
  const isSeriesView = currentSeriesLevel !== null;
  const isSubpageView =
    isGetStartedView ||
    isFrameworkView ||
    isSeriesView ||
    isSeriesComparisonView ||
    isThinkingCycleView ||
    isThinkingCycleComparisonView;

  return (
    <div className="min-h-screen bg-white">
      <Navbar onGetStarted={() => navigateTo('/get-started')} isPortalView={isSubpageView} />
      {isGetStartedView ? (
        <GetStartedPortal onBack={() => navigateTo('/')} />
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
      ) : isSeriesView && currentSeriesLevel ? (
        <SeriesExperience
          level={currentSeriesLevel}
          onBack={() => navigateTo('/')}
          onSelectLevel={(path) => navigateTo(path)}
          onCompareLevels={() => navigateTo('/series/compare')}
        />
      ) : (
        <>
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
        </>
      )}
      <Footer />
    </div>
  );
}

export default App;
