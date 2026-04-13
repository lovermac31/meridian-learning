import { motion } from 'motion/react';
import {
  ArrowRight,
  BookText,
  ClipboardCheck,
  Construction,
  MessagesSquare,
  Scale,
  ShieldAlert,
} from 'lucide-react';
import { getHomeContent } from '../i18n/content/home';
import { getCurrentLocale } from '../i18n/routing';

type FrameworkFoundationsProps = {
  onExploreFramework?: () => void;
};

export const FrameworkFoundations = ({
  onExploreFramework,
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
    { ...homeContent.frameworkFoundations.pillars[3], icon: <MessagesSquare className="w-5 h-5" /> },
    { ...homeContent.frameworkFoundations.pillars[4], icon: <Scale className="w-5 h-5" /> },
  ] as const;

  const contrasts = homeContent.frameworkFoundations.contrasts;
  const prohibitedPractices = homeContent.frameworkFoundations.prohibitedPractices;

  return (
    <section className="py-28 bg-jurassic-soft/35 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          className="max-w-4xl"
        >
          <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
            {homeContent.frameworkFoundations.eyebrow}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-jurassic-dark mb-6">
            {homeContent.frameworkFoundations.title}
          </h2>
          <div className="space-y-5 text-lg text-gray-600 leading-relaxed font-light">
            {homeContent.frameworkFoundations.intro.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ delay: 0.05 }}
          className="mt-16 grid lg:grid-cols-[1.05fr_0.95fr] gap-8"
        >
          <div className="rounded-3xl bg-white border border-jurassic-soft/60 shadow-premium p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-jurassic-accent/10 flex items-center justify-center text-jurassic-accent">
                <BookText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-jurassic-dark">{homeContent.frameworkFoundations.pedagogicalTitle}</p>
                <p className="text-sm text-gray-500">{homeContent.frameworkFoundations.pedagogicalBody}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {contrasts.map((item) => (
                <div
                  key={item.legacy}
                  className="rounded-2xl border border-jurassic-soft/70 bg-jurassic-soft/20 p-5"
                >
                  <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">
                    {homeContent.frameworkFoundations.traditionalElt}
                  </p>
                  <p className="text-gray-500 text-sm mb-4">{item.legacy}</p>
                  <p className="text-sm font-semibold text-jurassic-dark">{item.current}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-jurassic-dark text-white shadow-premium p-8 md:p-10">
            <p className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4">
              {homeContent.frameworkFoundations.coreCompetenciesTitle}
            </p>
            <div className="space-y-5">
              {homeContent.frameworkFoundations.coreCompetencies.map((item) => (
                <div key={item} className="border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
                  <p className="text-white/80 leading-relaxed">{item}</p>
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
          className="mt-16"
        >
          <div className="flex items-end justify-between gap-6 mb-8 flex-wrap">
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

          <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-5">
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
          transition={{ delay: 0.12 }}
          className="mt-16 rounded-3xl bg-white border border-jurassic-soft/60 shadow-premium p-8 md:p-10"
        >
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-2">
                {homeContent.frameworkFoundations.prohibitedEyebrow}
              </p>
              <h3 className="text-3xl font-bold text-jurassic-dark tracking-tight mb-3">
                {homeContent.frameworkFoundations.prohibitedTitle}
              </h3>
              <p className="text-gray-500 leading-relaxed max-w-3xl">
                {homeContent.frameworkFoundations.prohibitedBody}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {prohibitedPractices.map((item) => (
              <div
                key={item.title}
                className="grid lg:grid-cols-[1fr_auto_1fr] gap-4 items-start rounded-2xl bg-jurassic-soft/20 border border-jurassic-soft/50 p-5"
              >
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">
                    {homeContent.frameworkFoundations.avoidLabel}
                  </p>
                  <p className="text-sm font-medium text-gray-700 leading-relaxed">{item.title}</p>
                </div>
                <div className="text-jurassic-accent font-bold pt-6">→</div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">
                    {homeContent.frameworkFoundations.replaceLabel}
                  </p>
                  <p className="text-sm font-semibold text-jurassic-dark leading-relaxed">
                    {item.replacement}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {onExploreFramework ? (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: 0.16 }}
            className="mt-10 flex justify-end"
          >
            <button
              onClick={onExploreFramework}
              className="inline-flex items-center gap-2 text-sm font-semibold text-jurassic-dark hover:text-jurassic-accent transition"
            >
              {homeContent.frameworkFoundations.exploreCta}
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
};
