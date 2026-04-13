import { motion } from 'motion/react';
import { TriceratopsIcon } from './Icons';
import { ChevronRight, FileText } from 'lucide-react';
import { getCurrentLocale, localizeRouteTarget } from '../i18n/routing';
import { getHomeContent } from '../i18n/content/home';
import { getLocalizedSeriesLevels } from '../i18n/content/series';

type SeriesSectionProps = {
  onSelectLevel: (path: string) => void;
  onCompareLevels: () => void;
};

export const SeriesSection = ({ onSelectLevel, onCompareLevels }: SeriesSectionProps) => {
  const locale = getCurrentLocale();
  const homeContent = getHomeContent(locale) ?? getHomeContent('en');

  if (!homeContent) {
    return null;
  }

  const levels = getLocalizedSeriesLevels(locale).map((level) => ({
    name: level.title,
    age: level.ageBand,
    cefr: level.cefrRange,
    lessons: level.lessonsPerYear,
    texts: level.coreTexts,
    focus: level.textComplexity,
    color: level.color,
    path: level.path,
    demoMaterialPath: level.demoMaterialPath,
    demoMaterialFileName: level.demoMaterialFileName,
  }));
  const resolveDemoHref = (href: string) =>
    href.startsWith('/available-soon') ? localizeRouteTarget(href, locale) : href;

  return (
    <section id="series" className="py-28 bg-white relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-1/2 left-0 w-80 h-80 text-jurassic-dark/[0.01] pointer-events-none -translate-x-1/2">
        <TriceratopsIcon className="w-full h-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
              {homeContent.series.eyebrow}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-jurassic-dark">{homeContent.series.title}</h2>
            <p className="text-gray-600 font-light leading-relaxed">
              {homeContent.series.body}
            </p>
            <button
              onClick={onCompareLevels}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-jurassic-soft bg-white px-5 py-3 text-sm font-semibold text-jurassic-dark transition hover:border-jurassic-accent hover:text-jurassic-accent"
            >
              {homeContent.series.compareAllCta}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-4">
            <div className="bg-jurassic-soft/30 backdrop-blur-sm border border-jurassic-soft px-5 py-3 rounded-2xl text-center">
              <div className="text-3xl font-bold text-jurassic-dark">{homeContent.series.stats.lessonsValue}</div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{homeContent.series.stats.lessonsLabel}</div>
            </div>
            <div className="bg-jurassic-soft/30 backdrop-blur-sm border border-jurassic-soft px-5 py-3 rounded-2xl text-center">
              <div className="text-3xl font-bold text-jurassic-dark">{homeContent.series.stats.textsValue}</div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400">{homeContent.series.stats.textsLabel}</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {levels.map((level, i) => (
            <motion.div
              key={level.name}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`group rounded-2xl border border-gray-100 border-l-4 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-premium ${level.color} flex flex-col justify-between gap-4 md:flex-row md:items-center`}
            >
              <button
                type="button"
                onClick={() => onSelectLevel(level.path)}
                className="flex items-center gap-6 text-left flex-1 min-w-0"
              >
                <div className="text-2xl font-black text-gray-100 font-sans group-hover:text-jurassic-soft transition-colors text-right w-12 shrink-0">
                  {i + 1}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-jurassic-dark">{level.name}</h3>
                  <p className="text-sm text-gray-400 font-medium">{homeContent.series.labels.age} {level.age} <span className="mx-1.5 text-jurassic-accent">•</span> CEFR {level.cefr}</p>
                  <p className="mt-1 text-xs text-gray-400 font-medium">
                    {level.lessons} <span className="mx-1.5 text-jurassic-accent">•</span> {level.texts}
                  </p>
                </div>
              </button>

              <div className="md:w-1/3 shrink-0">
                <p className="text-gray-700 text-sm font-medium leading-relaxed">
                  {level.focus}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => onSelectLevel(level.path)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-jurassic-soft bg-white px-4 py-2 text-xs font-bold text-jurassic-dark transition hover:border-jurassic-accent hover:text-jurassic-accent"
                >
                  {homeContent.series.labels.viewLevelDetails}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <a
                  href={resolveDemoHref(level.demoMaterialPath)}
                  download={
                    level.demoMaterialPath.startsWith('/available-soon')
                      ? undefined
                      : level.demoMaterialFileName
                  }
                  className="inline-flex items-center gap-1.5 rounded-full border border-jurassic-accent/30 bg-jurassic-accent/8 px-4 py-2 text-xs font-bold text-jurassic-accent transition hover:bg-jurassic-accent/15"
                  onClick={(e) => e.stopPropagation()}
                >
                  <FileText className="w-3.5 h-3.5" />
                  {homeContent.series.labels.demoMaterial}
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
