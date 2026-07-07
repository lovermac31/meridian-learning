import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { getHomeContent } from '../i18n/content/home';
import { getCurrentLocale } from '../i18n/routing';
import { getUiString } from '../i18n/ui';
import { AudienceFork } from './AudienceFork';

type HeroProps = {
  onNavigate: (path: string) => void;
};

/**
 * Hero — P0 condensed front door (screen 1).
 *
 * Concrete headline + one audience-neutral line + the two-door AudienceFork.
 * The old dense institutional CTA cluster + parent link rows were removed:
 * audience routing is now the AudienceFork's job (Schools → /school-framework,
 * Parents → /student-academy). Clarity-to-action is intended to be <2s, so the
 * heavy staggered fade was dropped in favour of a single short entrance.
 */
export const Hero = ({ onNavigate }: HeroProps) => {
  const [heroImageAvailable, setHeroImageAvailable] = useState(true);
  const locale = getCurrentLocale();
  const homeContent = getHomeContent(locale) ?? getHomeContent('en');

  if (!homeContent) {
    return null;
  }

  const { hero } = homeContent;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-jurassic-dark pt-28 pb-12 sm:pt-24">
      {/* Hero Background — Compass Image */}
      <div className="absolute inset-0 z-0">
        {heroImageAvailable ? (
          <picture className="block w-full h-full">
            <source
              type="image/webp"
              srcSet="/images/hero-compass-640.webp 640w, /images/hero-compass-960.webp 960w"
              sizes="100vw"
            />
            <img
              src="/images/hero-compass-960.webp"
              alt={getUiString(locale, 'hero.imageAlt')}
              width="960"
              height="640"
              className="w-full h-full object-cover object-[65%_center] md:object-[60%_center] lg:object-[55%_center]"
              loading="eager"
              decoding="async"
              fetchPriority="high"
              onError={() => setHeroImageAvailable(false)}
            />
          </picture>
        ) : null}

        {/* Left-to-right gradient overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-jurassic-dark via-jurassic-dark/95 via-[55%] to-jurassic-dark/40 sm:via-jurassic-dark/90 sm:via-[45%] sm:to-jurassic-dark/20 lg:to-transparent" />
        {/* Top/bottom vignette for nav and footer bleed */}
        <div className="absolute inset-0 bg-gradient-to-b from-jurassic-dark/60 via-transparent to-jurassic-dark/80" />
        {/* Subtle warm accent glow top-left */}
        <div className="absolute inset-0 bg-overlay-accent-hero" />
        {!heroImageAvailable && <div className="absolute inset-0 bg-jurassic-dark" />}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="max-w-3xl"
        >
          <span className="text-jurassic-accent font-semibold tracking-widest uppercase text-xs mb-4 block">
            {hero.eyebrow}
          </span>

          <h1 className="font-display max-w-full break-words text-[2rem] min-[420px]:text-[2.4rem] sm:text-[3rem] md:text-[3.4rem] lg:text-[3.8rem] text-white leading-[1.05] mb-5 tracking-tight">
            {hero.titleLineOne}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-jurassic-accent to-jurassic-gold">
              {hero.titleHighlight}
            </span>
            {hero.titleLineThree ? <> {hero.titleLineThree}</> : null}
          </h1>

          <p className="text-base sm:text-xl text-white/70 max-w-xl leading-relaxed font-light">
            {hero.body}
          </p>

          {/* Two-door audience fork — the front door. */}
          <AudienceFork onNavigate={onNavigate} />

          {/* Compact B2B discovery strip — secondary to the fork, links to /companies.
              Deliberately NOT a fourth fork door and NOT in the top nav. */}
          <button
            type="button"
            onClick={() => onNavigate('/companies')}
            className="group mt-4 flex w-full max-w-3xl flex-col items-start gap-3 rounded-2xl border border-white/12 bg-white/[0.03] px-6 py-4 text-left transition hover:border-jurassic-accent/40 hover:bg-white/[0.06] sm:flex-row sm:items-center sm:justify-between sm:gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-jurassic-dark"
          >
            <span className="min-w-0">
              <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-jurassic-accent">
                {hero.companiesStrip.eyebrow}
              </span>
              <span className="mt-1 block text-base font-bold text-white">{hero.companiesStrip.title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-white/60">{hero.companiesStrip.body}</span>
            </span>
            <span className="inline-flex flex-none items-center gap-1.5 text-sm font-bold text-jurassic-accent">
              {hero.companiesStrip.cta}
              <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </button>

          <div className="mt-10 pt-6 border-t border-white/5 flex gap-6 items-center">
            <div className="text-white/55 text-xs uppercase tracking-widest font-semibold">{hero.publishedBy}</div>
            <div className="text-white/80 font-serif text-lg italic tracking-wide">{hero.publisher}</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
