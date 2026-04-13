import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, ChevronRight, ClipboardList, FileText, GraduationCap, Layers3, LibraryBig } from 'lucide-react';
import type { SeriesLevelDetail } from '../lib/seriesContent';
import {
  getLocalizedSeriesLevelByPath,
  getLocalizedSeriesLevels,
  getSeriesDetailPageContent,
} from '../i18n/content/series';
import { getCurrentLocale, localizeRouteTarget } from '../i18n/routing';

type SeriesExperienceProps = {
  level: SeriesLevelDetail;
  onBack: () => void;
  onSelectLevel: (path: string) => void;
  onCompareLevels: () => void;
  onViewSyllabus: () => void;
};

export const SeriesExperience = ({ level, onBack, onSelectLevel, onCompareLevels, onViewSyllabus }: SeriesExperienceProps) => {
  const locale = getCurrentLocale();
  const localizedLevel = getLocalizedSeriesLevelByPath(level.path, locale) ?? level;
  const localizedSeriesLevels = getLocalizedSeriesLevels(locale);
  const pageContent = getSeriesDetailPageContent(locale);
  const demoHref = level.demoMaterialPath.startsWith('/available-soon')
    ? localizeRouteTarget(level.demoMaterialPath, locale)
    : level.demoMaterialPath;

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
            {pageContent.hero.backCta}
          </button>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 max-w-4xl"
          >
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
              {pageContent.hero.eyebrow}
            </span>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
              {localizedLevel.title}
            </h1>
            <p className="mt-4 text-jurassic-gold text-lg font-semibold">{localizedLevel.tagline}</p>
            <div className="mt-6 space-y-4 text-lg text-white/72 leading-relaxed max-w-3xl">
              {localizedLevel.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </motion.div>

          <div className="mt-12 flex flex-wrap gap-3">
            {localizedSeriesLevels.map((item) => (
              <button
                key={item.slug}
                onClick={() => onSelectLevel(item.path)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  item.slug === localizedLevel.slug
                    ? 'border-jurassic-accent bg-jurassic-accent text-white'
                    : 'border-white/15 bg-white/5 text-white/75 hover:bg-white/10'
                }`}
              >
                {item.levelName}
              </button>
            ))}
            <a
              href={demoHref}
              download={
                level.demoMaterialPath.startsWith('/available-soon')
                  ? undefined
                  : level.demoMaterialFileName
              }
              className="inline-flex items-center gap-2 rounded-full border border-jurassic-accent/40 bg-jurassic-accent/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-jurassic-accent/25"
            >
              <FileText className="w-4 h-4" />
              {pageContent.hero.demoMaterial}
            </a>
            <button
              onClick={onViewSyllabus}
              className="inline-flex items-center gap-2 rounded-full border border-jurassic-gold/30 bg-jurassic-gold/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-jurassic-gold/20"
            >
              <BookOpen className="w-4 h-4" />
              {pageContent.hero.viewSyllabus}
            </button>
            <button
              onClick={onCompareLevels}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {pageContent.hero.compareLevels}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-24 bg-jurassic-soft/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-10">
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
              {pageContent.sections.glance.eyebrow}
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-jurassic-dark mb-4">
              {pageContent.sections.glance.title}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
            {[
              { label: pageContent.sections.glance.labels.ageBand, value: localizedLevel.ageBand },
              { label: pageContent.sections.glance.labels.cefrRange, value: localizedLevel.cefrRange },
              { label: pageContent.sections.glance.labels.lessonsPerYear, value: localizedLevel.lessonsPerYear },
              { label: pageContent.sections.glance.labels.coreTexts, value: localizedLevel.coreTexts },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-3xl bg-white border border-jurassic-soft/60 p-6 shadow-premium"
              >
                <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-3">
                  {item.label}
                </p>
                <p className="text-lg font-semibold text-jurassic-dark leading-relaxed">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8 items-start">
            <div className="rounded-3xl bg-jurassic-dark text-white p-8 shadow-premium">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-jurassic-accent flex items-center justify-center mb-6">
                <GraduationCap className="w-5 h-5" />
              </div>
              <p className="text-xs uppercase tracking-widest text-white/55 font-bold mb-4">
                {pageContent.sections.cognitiveFocus.label}
              </p>
              <h2 className="text-3xl font-bold leading-tight mb-5">{localizedLevel.cognitiveFocus}</h2>
              <p className="text-white/68 leading-relaxed">{localizedLevel.cefrProgression}</p>
            </div>

            <div className="rounded-3xl border border-jurassic-soft/60 bg-jurassic-soft/20 p-8 shadow-premium">
              <div className="w-12 h-12 rounded-2xl bg-jurassic-accent/10 text-jurassic-accent flex items-center justify-center mb-6">
                <LibraryBig className="w-5 h-5" />
              </div>
              <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-4">
                {pageContent.sections.textComplexity.label}
              </p>
              <h2 className="text-3xl font-bold tracking-tight text-jurassic-dark mb-5">
                {localizedLevel.textComplexity}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {pageContent.sections.textComplexity.body.replace('{{title}}', localizedLevel.title)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-jurassic-soft/25">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mb-12">
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
              {pageContent.sections.competencies.eyebrow}
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-jurassic-dark mb-4">
              {pageContent.sections.competencies.title}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {localizedLevel.competencies.map((competency) => (
              <div
                key={competency.title}
                className="rounded-3xl bg-white border border-jurassic-soft/60 p-7 shadow-premium"
              >
                <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-3">
                  {competency.title}
                </p>
                <p className="text-gray-700 leading-relaxed">{competency.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mb-12">
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
              {pageContent.sections.assessment.eyebrow}
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-jurassic-dark mb-4">
              {pageContent.sections.assessment.title}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed font-light max-w-3xl">
              {localizedLevel.assessmentNote}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {localizedLevel.assessmentSnapshot.map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-jurassic-soft/60 bg-jurassic-soft/15 p-6 shadow-premium"
              >
                <div className="w-11 h-11 rounded-2xl bg-jurassic-accent/10 text-jurassic-accent flex items-center justify-center mb-5">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <p className="text-gray-700 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-jurassic-dark text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mb-12">
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
              {pageContent.sections.progression.eyebrow}
            </span>
            <h2 className="text-4xl font-bold tracking-tight mb-4">
              {pageContent.sections.progression.title}
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-premium">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-jurassic-accent flex items-center justify-center mb-6">
                <Layers3 className="w-5 h-5" />
              </div>
              <p className="text-xs uppercase tracking-widest text-white/55 font-bold mb-3">
                {pageContent.sections.progression.thisLevel}
              </p>
              <p className="text-lg text-white/80 leading-relaxed">{localizedLevel.progression.thisLevel}</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-premium">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-jurassic-accent flex items-center justify-center mb-6">
                <ChevronRight className="w-5 h-5" />
              </div>
              <p className="text-xs uppercase tracking-widest text-white/55 font-bold mb-3">
                {pageContent.sections.progression.nextStage}
              </p>
              <h3 className="text-2xl font-bold mb-4">{localizedLevel.progression.nextStageTitle}</h3>
              <p className="text-white/80 leading-relaxed">{localizedLevel.progression.nextStageSummary}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
