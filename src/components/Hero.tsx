import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { getHomeContent } from '../i18n/content/home';
import { getCurrentLocale } from '../i18n/routing';
import { getUiString } from '../i18n/ui';
import { trackCtaClick } from '../lib/analytics';

type HeroProps = {
  onGetStarted: () => void;
  onExploreFramework: () => void;
  onOverviewRequest?: () => void;
  onNavigate?: (path: string) => void;
};

export const Hero = ({ onGetStarted, onExploreFramework, onOverviewRequest, onNavigate }: HeroProps) => {
  const [heroImageAvailable, setHeroImageAvailable] = useState(true);
  const locale = getCurrentLocale();
  const homeContent = getHomeContent(locale) ?? getHomeContent('en');

  if (!homeContent) {
    return null;
  }

  return (
    <section className="relative min-h-screen flex items-end sm:items-center overflow-hidden bg-jurassic-dark pt-28 pb-10 sm:pt-24 sm:pb-0">
      {/* Hero Background */}
      <div className="absolute inset-0 z-0">
        {heroImageAvailable ? (
          <img
            src="/images/hero-bg.jpg"
            alt={getUiString(locale, 'hero.imageAlt')}
            className="w-full h-full object-cover object-[65%_center] md:object-[60%_center] lg:object-[55%_center]"
            fetchPriority="high"
            onError={() => setHeroImageAvailable(false)}
          />
        ) : null}

        {/* Left-to-right gradient overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-jurassic-dark via-jurassic-dark/95 via-[55%] to-jurassic-dark/40 sm:via-jurassic-dark/90 sm:via-[45%] sm:to-jurassic-dark/20 lg:to-transparent" />

        {/* Top/bottom vignette for nav and footer bleed */}
        <div className="absolute inset-0 bg-gradient-to-b from-jurassic-dark/60 via-transparent to-jurassic-dark/80" />

        {/* Subtle warm accent glow top-left */}
        <div className="absolute inset-0 bg-overlay-accent-hero" />

        {/* Fallback dark fill when image fails */}
        {!heroImageAvailable && (
          <div className="absolute inset-0 bg-jurassic-dark" />
        )}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, x: -50 },
            visible: { 
              opacity: 1, 
              x: 0,
              transition: { staggerChildren: 0.15, duration: 0.8, ease: "easeOut" }
            }
          }}
          className="max-w-3xl"
        >
          <motion.span 
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            className="text-jurassic-accent font-semibold tracking-widest uppercase text-xs mb-4 block"
          >
            {homeContent.hero.eyebrow}
          </motion.span>
          
          <motion.h1 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="font-display text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.0] mb-6 tracking-tight"
          >
            {homeContent.hero.titleLineOne} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-jurassic-accent to-jurassic-gold">
              {homeContent.hero.titleHighlight}
            </span> <br />
            {homeContent.hero.titleLineThree}
          </motion.h1>

          <motion.p
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="text-sm sm:text-base text-jurassic-gold/80 mb-3 max-w-lg leading-relaxed font-medium"
          >
            {homeContent.hero.institutionalTagline}
          </motion.p>

          <motion.p
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="text-base sm:text-xl text-white/70 mb-6 sm:mb-10 max-w-lg leading-relaxed font-light"
          >
            {homeContent.hero.body}
          </motion.p>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="flex flex-col gap-3"
          >
            {/* Institutional CTAs — primary audience */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => {
                  trackCtaClick({ label: homeContent.hero.primaryCta, type: 'primary', segment: 'institutional' });
                  onGetStarted();
                }}
                className="bg-jurassic-accent text-white px-8 py-4 rounded-full font-bold glow-hover flex items-center gap-2 group shadow-premium"
              >
                {homeContent.hero.primaryCta} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => {
                  trackCtaClick({ label: homeContent.hero.secondaryCta, type: 'secondary', segment: 'institutional' });
                  onExploreFramework();
                }}
                className="backdrop-blur-md bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-all"
              >
                {homeContent.hero.secondaryCta}
              </button>
            </div>

            {/* Low-friction institutional offer */}
            {onOverviewRequest && homeContent.hero.overviewCta && (
              <div>
                <button
                  onClick={() => {
                    trackCtaClick({ label: homeContent.hero.overviewCta ?? '', type: 'low_friction', segment: 'institutional' });
                    onOverviewRequest();
                  }}
                  className="text-white/55 text-sm hover:text-white/80 underline underline-offset-2 transition-colors"
                >
                  {homeContent.hero.overviewCta}
                </button>
                <span className="text-white/25 text-xs ml-2">— no call required</span>
              </div>
            )}

            {/* Parent / student pathway — secondary audience */}
            {onNavigate && homeContent.hero.audienceRowLabel && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                <span className="text-white/40 text-xs uppercase tracking-widest font-semibold">{homeContent.hero.audienceRowLabel}</span>
                <button
                  onClick={() => {
                    trackCtaClick({ label: homeContent.hero.audienceCurriculumCta ?? '', type: 'secondary', segment: 'parent_student' });
                    onNavigate('/framework');
                  }}
                  className="text-white/60 text-sm hover:text-white/85 underline underline-offset-2 transition-colors"
                >
                  {homeContent.hero.audienceCurriculumCta}
                </button>
                <span className="text-white/25 text-xs">·</span>
                <button
                  onClick={() => {
                    trackCtaClick({ label: homeContent.hero.audienceCompareCta ?? '', type: 'secondary', segment: 'parent_student' });
                    onNavigate('/series/compare');
                  }}
                  className="text-white/60 text-sm hover:text-white/85 underline underline-offset-2 transition-colors"
                >
                  {homeContent.hero.audienceCompareCta}
                </button>
              </div>
            )}
          </motion.div>
          
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="mt-8 sm:mt-16 pt-6 sm:pt-8 border-t border-white/5 flex gap-8 items-center"
          >
            <div className="text-white/55 text-xs uppercase tracking-widest font-semibold">{homeContent.hero.publishedBy}</div>
            <div className="text-white/80 font-serif text-lg italic tracking-wide">{homeContent.hero.publisher}</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
