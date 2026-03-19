import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { ThinkingCycle } from './components/ThinkingCycle';
import { SeriesSection } from './components/SeriesSection';
import { CreativeStudio } from './components/CreativeStudio';
import { NeuroinclusiveLayer } from './components/NeuroinclusiveLayer';
import { Services } from './components/Services';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <AboutSection />
      <ThinkingCycle />
      <SeriesSection />
      <ErrorBoundary sectionName="Creative Studio">
        <CreativeStudio />
      </ErrorBoundary>
      <NeuroinclusiveLayer />
      <Services />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;
