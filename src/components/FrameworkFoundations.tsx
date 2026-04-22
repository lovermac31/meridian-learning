import { motion } from 'motion/react';
import {
  ArrowRight,
  BookText,
  ClipboardCheck,
  Construction,
  Scale,
} from 'lucide-react';
import { getHomeContent } from '../i18n/content/home';
import { getCurrentLocale } from '../i18n/routing';

type FrameworkFoundationsProps = {
  onExploreFramework?: () => void;
  onExploreMethodology?: () => void;
  onExploreWorldWise?: () => void;
};

export const FrameworkFoundations = ({
  onExploreFramework,
  onExploreMethodology,
  onExploreWorldWise,
}: FrameworkFoundationsProps) => {
  const locale = getCurrentLocale();
  const homeContent = getHomeContent(locale) ?? getHomeContent('en');

  if (!homeContent) {
    return null;
  }

  const pillars = [
    { ...homeContent.frameworkFoundations.pillars[0], icon: <BookText className="w-5 h-5" /> },
    { ...homeContent.frameworkFoundations.pillars[1], icon: <ClipboardCheck className="w-5 h-5" /> },
    { ...homeContent.frameworkFoundations.pillars[2], icon: <Construction className="w-5 h-5" /> },
  ] as const;
  const coreCompetencies = homeContent.frameworkFoundations.coreCompetencies;

  return (
    <section className="relative overflow-hidden bg-jurassic-soft/35 py-14 md:py-16 xl:py-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start"
        >
          <div>
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
              {homeContent.frameworkFoundations.eyebrow}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-jurassic-dark mb-5 leading-tight">
              {homeContent.frameworkFoundations.title}
            </h2>
            <p className="text-base md:text-lg text-gray-600 leading-8 font-light">
              {homeContent.frameworkFoundations.intro[0]}
            </p>
          </div>

          <div className="rounded-3xl bg-white border border-jurassic-soft/60 shadow-premium p-5 md:p-6">
            <p className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4">
              {homeContent.frameworkFoundations.coreCompetenciesTitle}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {coreCompetencies.map((item) => (
                <div key={item} className="rounded-2xl border border-jurassic-soft/60 bg-jurassic-soft/20 p-4">
                  <p className="text-sm font-semibold leading-6 text-jurassic-dark">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ delay: 0.08 }}
          className="mt-9"
        >
          <div className="flex items-end justify-between gap-6 mb-6 flex-wrap">
            <div>
              <p className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-3">
                {homeContent.frameworkFoundations.pillarsEyebrow}
              </p>
              <h3 className="text-3xl md:text-4xl font-bold text-jurassic-dark tracking-tight">
                {homeContent.frameworkFoundations.pillarsTitle}
              </h3>
            </div>
            <p className="max-w-xl text-gray-500 leading-relaxed">
              {homeContent.frameworkFoundations.pillarsBody}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="rounded-3xl bg-white border border-jurassic-soft/60 p-6 shadow-premium h-full"
              >
                <div className="w-11 h-11 rounded-2xl bg-jurassic-soft/50 text-jurassic-accent flex items-center justify-center mb-5">
                  {pillar.icon}
                </div>
                <h4 className="text-lg font-bold text-jurassic-dark leading-snug mb-3">
                  {pillar.title}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">{pillar.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ delay: 0.16 }}
          className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-jurassic-dark p-4 md:p-5 shadow-premium"
        >
          <div className="flex flex-wrap gap-3">
            {onExploreFramework ? (
              <button
                onClick={onExploreFramework}
                className="inline-flex items-center gap-2 rounded-full bg-jurassic-accent px-5 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
              >
                {homeContent.frameworkFoundations.exploreCta}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : null}
            {onExploreMethodology ? (
              <button
                onClick={onExploreMethodology}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
              >
                {homeContent.frameworkFoundations.methodologyCta}
              </button>
            ) : null}
          </div>
          {onExploreWorldWise ? (
            <button
              onClick={onExploreWorldWise}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white/65 underline underline-offset-4 transition-colors hover:text-white"
            >
              {homeContent.frameworkFoundations.worldwiseCta}
              <Scale className="w-4 h-4" />
            </button>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
};
