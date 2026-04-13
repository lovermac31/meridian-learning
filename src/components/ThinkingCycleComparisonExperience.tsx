import { motion } from 'motion/react';
import { ArrowLeft, ChevronRight, GitCompareArrows, LibraryBig, Scale, ShieldCheck } from 'lucide-react';
import { getCurrentLocale } from '../i18n/routing';
import { getLocalizedThinkingCycleStages, getThinkingCycleComparisonContent } from '../i18n/content/thinkingCycle';

type ThinkingCycleComparisonExperienceProps = {
  onBack: () => void;
  onSelectStage: (path: string) => void;
};

const getAssessmentType = (assessmentLine: string) =>
  assessmentLine.replace(/^(Assessment type|Loại đánh giá):\s*/i, '').replace(/\.$/, '');

export const ThinkingCycleComparisonExperience = ({
  onBack,
  onSelectStage,
}: ThinkingCycleComparisonExperienceProps) => {
  const locale = getCurrentLocale();
  const pageContent = getThinkingCycleComparisonContent(locale);
  const localizedStages = getLocalizedThinkingCycleStages(locale);

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
            className="mt-10 max-w-5xl"
          >
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">{pageContent.hero.eyebrow}</span>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
              {pageContent.hero.title}
            </h1>
            <p className="mt-6 text-lg text-white/72 leading-relaxed max-w-3xl">
              {pageContent.hero.body}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-jurassic-soft/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-10">
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">{pageContent.overview.eyebrow}</span>
            <h2 className="text-4xl font-bold tracking-tight text-jurassic-dark mb-4">{pageContent.overview.title}</h2>
          </div>

          <div className="grid xl:grid-cols-2 gap-6">
            {localizedStages.map((stage) => (
              <div
                key={stage.slug}
                className="rounded-3xl border border-gray-100 bg-white p-8 shadow-premium"
              >
                <div className="flex flex-col gap-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-3">
                        {pageContent.labels.stage}
                      </p>
                      <h3 className="text-3xl font-bold text-jurassic-dark tracking-tight">
                        {stage.title}
                      </h3>
                      <p className={`mt-2 font-semibold ${stage.accent}`}>{stage.line}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-jurassic-accent/10 text-jurassic-accent flex items-center justify-center shrink-0">
                      <GitCompareArrows className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-jurassic-soft/25 p-5">
                      <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">{pageContent.labels.cognitiveOperation}</p>
                      <p className="text-jurassic-dark font-semibold leading-relaxed">{stage.cognitiveOperation}</p>
                    </div>
                    <div className="rounded-2xl bg-jurassic-soft/25 p-5">
                      <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">{pageContent.labels.bloomLevel}</p>
                      <p className="text-jurassic-dark font-semibold leading-relaxed">{stage.bloomLevel}</p>
                    </div>
                    <div className="rounded-2xl bg-jurassic-soft/25 p-5">
                      <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">{pageContent.labels.primaryTarget}</p>
                      <p className="text-jurassic-dark font-semibold leading-relaxed">{stage.primaryTarget}</p>
                    </div>
                    <div className="rounded-2xl bg-jurassic-soft/25 p-5">
                      <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">{pageContent.labels.lessonSlot}</p>
                      <p className="text-jurassic-dark font-semibold leading-relaxed">{stage.lessonSlot}</p>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="rounded-2xl border border-jurassic-soft/70 p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <LibraryBig className="w-4 h-4 text-jurassic-accent" />
                        <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">{pageContent.labels.primaryActivity}</p>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{stage.primaryActivity}</p>
                    </div>

                    <div className="rounded-2xl border border-jurassic-soft/70 p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <Scale className="w-4 h-4 text-jurassic-accent" />
                        <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">{pageContent.labels.assessmentType}</p>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {getAssessmentType(stage.assessmentSnapshot[0] ?? '')}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-jurassic-soft/70 p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <ShieldCheck className="w-4 h-4 text-jurassic-accent" />
                        <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">{pageContent.labels.crossStageRole}</p>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{stage.crossStageConnection}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => onSelectStage(stage.path)}
                      className="inline-flex items-center gap-2 rounded-full bg-jurassic-dark px-5 py-3 text-sm font-semibold text-white transition hover:bg-jurassic-blue"
                    >
                      {pageContent.actions.viewStageDetails}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <a
                      href={stage.studentManualPath}
                      download={stage.studentManualFileName}
                      className="inline-flex items-center gap-2 rounded-full border border-jurassic-soft bg-white px-5 py-3 text-sm font-semibold text-jurassic-dark transition hover:border-jurassic-accent hover:text-jurassic-accent"
                    >
                      {pageContent.actions.studentManual}
                    </a>
                    <a
                      href={stage.teacherManualPath}
                      download={stage.teacherManualFileName}
                      className="inline-flex items-center gap-2 rounded-full border border-jurassic-soft bg-white px-5 py-3 text-sm font-semibold text-jurassic-dark transition hover:border-jurassic-accent hover:text-jurassic-accent"
                    >
                      {pageContent.actions.teacherManual}
                    </a>
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
