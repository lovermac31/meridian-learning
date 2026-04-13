import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, ChevronRight, FileText, GitCompareArrows, GraduationCap, LibraryBig } from 'lucide-react';
import { getLocalizedSeriesLevels, getSeriesComparisonContent } from '../i18n/content/series';
import { getCurrentLocale, localizeRouteTarget } from '../i18n/routing';

type SeriesComparisonExperienceProps = {
  onBack: () => void;
  onSelectLevel: (path: string) => void;
  onViewSyllabus: (path: string) => void;
};

export const SeriesComparisonExperience = ({
  onBack,
  onSelectLevel,
  onViewSyllabus,
}: SeriesComparisonExperienceProps) => {
  const locale = getCurrentLocale();
  const content = getSeriesComparisonContent(locale);
  const localizedLevels = getLocalizedSeriesLevels(locale);

  return (
    <main className="bg-white pt-32 pb-24">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-jurassic-dark via-jurassic-dark to-[#1c2c18]" />
        <div className="absolute inset-0 bg-overlay-accent-dark" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 py-20">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            {content.hero.backCta}
          </button>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 max-w-5xl"
          >
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
              {content.hero.eyebrow}
            </span>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
              {content.hero.title}
            </h1>
            <p className="mt-6 text-lg text-white/72 leading-relaxed max-w-3xl">
              {content.hero.body}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-jurassic-soft/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-10">
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
              {content.overview.eyebrow}
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-jurassic-dark mb-4">
              {content.overview.title}
            </h2>
          </div>

          <div className="grid xl:grid-cols-2 gap-6">
            {localizedLevels.map((level) => (
              <div
                key={level.slug}
                className={`rounded-3xl border border-gray-100 border-l-4 ${level.color} bg-white p-8 shadow-premium`}
              >
                <div className="flex flex-col gap-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-3">
                        {content.labels.level}
                      </p>
                      <h3 className="text-3xl font-bold text-jurassic-dark tracking-tight">
                        {level.title}
                      </h3>
                      <p className="mt-2 text-jurassic-accent font-semibold">{level.tagline}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-jurassic-accent/10 text-jurassic-accent flex items-center justify-center shrink-0">
                      <GitCompareArrows className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-jurassic-soft/25 p-5">
                      <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">{content.labels.ages}</p>
                      <p className="text-jurassic-dark font-semibold leading-relaxed">{level.ageBand}</p>
                    </div>
                    <div className="rounded-2xl bg-jurassic-soft/25 p-5">
                      <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">{content.labels.cefrRange}</p>
                      <p className="text-jurassic-dark font-semibold leading-relaxed">{level.cefrRange}</p>
                    </div>
                    <div className="rounded-2xl bg-jurassic-soft/25 p-5">
                      <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">{content.labels.lessonsPerYear}</p>
                      <p className="text-jurassic-dark font-semibold leading-relaxed">{level.lessonsPerYear}</p>
                    </div>
                    <div className="rounded-2xl bg-jurassic-soft/25 p-5">
                      <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">{content.labels.coreTexts}</p>
                      <p className="text-jurassic-dark font-semibold leading-relaxed">{level.coreTexts}</p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="rounded-2xl border border-jurassic-soft/70 p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <LibraryBig className="w-4 h-4 text-jurassic-accent" />
                        <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">{content.labels.textComplexity}</p>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{level.textComplexity}</p>
                    </div>

                    <div className="rounded-2xl border border-jurassic-soft/70 p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <GraduationCap className="w-4 h-4 text-jurassic-accent" />
                        <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">{content.labels.cognitiveFocus}</p>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{level.cognitiveFocus}</p>
                    </div>

                    <div className="rounded-2xl border border-jurassic-soft/70 p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <ChevronRight className="w-4 h-4 text-jurassic-accent" />
                        <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">{content.labels.leadsTo}</p>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{level.progression.nextStageTitle}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => onSelectLevel(level.path)}
                      className="inline-flex items-center gap-2 rounded-full bg-jurassic-dark px-5 py-3 text-sm font-semibold text-white transition hover:bg-jurassic-blue"
                    >
                      {content.actions.viewLevelDetails}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <a
                      href={
                        level.demoMaterialPath.startsWith('/available-soon')
                          ? localizeRouteTarget(level.demoMaterialPath, locale)
                          : level.demoMaterialPath
                      }
                      download={
                        level.demoMaterialPath.startsWith('/available-soon')
                          ? undefined
                          : level.demoMaterialFileName
                      }
                      className="inline-flex items-center gap-2 rounded-full bg-jurassic-accent/10 border border-jurassic-accent/30 px-5 py-3 text-sm font-semibold text-jurassic-accent transition hover:bg-jurassic-accent/20"
                    >
                      <FileText className="w-4 h-4" />
                      {content.actions.demoMaterial}
                    </a>
                    <button
                      onClick={() => onViewSyllabus(level.syllabusRoutePath)}
                      className="inline-flex items-center gap-2 rounded-full border border-jurassic-soft bg-white px-5 py-3 text-sm font-semibold text-jurassic-dark transition hover:border-jurassic-accent hover:text-jurassic-accent"
                    >
                      <BookOpen className="w-4 h-4" />
                      {content.actions.viewSyllabus}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};
