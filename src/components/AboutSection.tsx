import { motion } from 'motion/react';
import { BookOpen, RefreshCw, Users, Globe } from 'lucide-react';
import { EcologyIcon } from './Icons';
import { getHomeContent } from '../i18n/content/home';
import { getCurrentLocale } from '../i18n/routing';

export const AboutSection = () => {
  const locale = getCurrentLocale();
  const homeContent = getHomeContent(locale) ?? getHomeContent('en');

  if (!homeContent) {
    return null;
  }

  const proofSignals = [
    { icon: <BookOpen className="text-jurassic-accent w-5 h-5" />, text: homeContent.about.proofSignals[0] },
    { icon: <RefreshCw className="text-jurassic-accent w-5 h-5" />, text: homeContent.about.proofSignals[1] },
    { icon: <Users className="text-jurassic-accent w-5 h-5" />, text: homeContent.about.proofSignals[2] },
    { icon: <Globe className="text-jurassic-accent w-5 h-5" />, text: homeContent.about.proofSignals[3] },
  ];

  return (
    <section id="about" className="relative overflow-hidden bg-white py-12 md:py-16 xl:py-20">
      <div className="absolute -left-24 -top-24 h-80 w-80 text-jurassic-dark/[0.02] pointer-events-none">
        <EcologyIcon className="h-full w-full" />
      </div>

      <div className="relative z-10 mx-auto max-w-[88rem] px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.55 }}
          className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start"
        >
          <div className="max-w-2xl">
            <span className="mb-3 block text-xs font-bold uppercase tracking-[0.22em] text-jurassic-accent">
              {homeContent.about.eyebrow}
            </span>
            <h2 className="mb-4 text-[1.85rem] font-bold leading-[1.05] tracking-tight text-jurassic-dark sm:text-4xl md:text-5xl">
              {homeContent.about.title}
            </h2>
            <p className="text-base font-light leading-8 text-gray-700 md:text-lg">
              {homeContent.about.paragraphs[0]}
            </p>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {proofSignals.map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="rounded-[1.15rem] border border-jurassic-soft/70 bg-jurassic-soft/15 p-3.5 shadow-premium"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                      {item.icon}
                    </div>
                    <span className="text-sm font-semibold leading-6 text-jurassic-dark">{item.text}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
              <div className="rounded-[1.25rem] border border-jurassic-dark/80 bg-jurassic-dark p-4 text-white shadow-premium">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/55">
                  {homeContent.about.buyerFitTitle}
                </p>
                <p className="text-sm font-medium leading-7 text-white/85">
                  {homeContent.about.buyerFitBody}
                </p>
              </div>

              <blockquote className="rounded-[1.25rem] border border-[#d8c3a3] bg-[#f7f0e3] p-4 shadow-premium">
                <p className="text-base font-medium italic leading-7 text-jurassic-dark">
                  {homeContent.about.positioningQuote}
                </p>
              </blockquote>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
