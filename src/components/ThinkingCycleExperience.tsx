import { motion } from 'motion/react';
import { ArrowLeft, ChevronRight, ClipboardList, Download, Leaf, LibraryBig, MessagesSquare } from 'lucide-react';
import { type ThinkingCycleStageDetail } from '../lib/thinkingCycleContent';
import { getCurrentLocale } from '../i18n/routing';
import {
  getLocalizedThinkingCycleStageByPath,
  getLocalizedThinkingCycleStages,
  getThinkingCycleDetailPageContent,
} from '../i18n/content/thinkingCycle';

type ThinkingCycleExperienceProps = {
  stage: ThinkingCycleStageDetail;
  onBack: () => void;
  onSelectStage: (path: string) => void;
  onCompareStages: () => void;
};

export const ThinkingCycleExperience = ({
  stage,
  onBack,
  onSelectStage,
  onCompareStages,
}: ThinkingCycleExperienceProps) => {
  const locale = getCurrentLocale();
  const localizedStage = getLocalizedThinkingCycleStageByPath(stage.path, locale) ?? stage;
  const localizedStages = getLocalizedThinkingCycleStages(locale);
  const pageContent = getThinkingCycleDetailPageContent(locale);
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
              {localizedStage.title}
            </h1>
            <p className={`mt-4 text-lg font-semibold ${stage.accent}`}>{localizedStage.line}</p>
            <div className="mt-6 space-y-4 text-lg text-white/72 leading-relaxed max-w-3xl">
              {localizedStage.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </motion.div>

          <div className="mt-12 flex flex-wrap gap-3">
            {localizedStages.map((item) => (
              <button
                key={item.slug}
                onClick={() => onSelectStage(item.path)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  item.slug === stage.slug
                    ? 'border-jurassic-accent bg-jurassic-accent text-white'
                    : 'border-white/15 bg-white/5 text-white/75 hover:bg-white/10'
                }`}
              >
                {item.title}
              </button>
            ))}
            <a
              href={stage.studentManualPath}
              download={stage.studentManualFileName}
              className="inline-flex items-center gap-2 rounded-full border border-jurassic-gold/30 bg-jurassic-gold/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-jurassic-gold/20"
            >
              <Download className="w-4 h-4" />
              {pageContent.hero.studentManual}
            </a>
            <a
              href={stage.teacherManualPath}
              download={stage.teacherManualFileName}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Download className="w-4 h-4" />
              {pageContent.hero.teacherManual}
            </a>
            <button
              onClick={onCompareStages}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {pageContent.hero.compareAllStages}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-24 bg-jurassic-soft/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-10">
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">{pageContent.glance.eyebrow}</span>
            <h2 className="text-4xl font-bold tracking-tight text-jurassic-dark mb-4">{pageContent.glance.title}</h2>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
            {[
              { label: pageContent.glance.labels.cognitiveOperation, value: localizedStage.cognitiveOperation },
              { label: pageContent.glance.labels.bloomLevel, value: localizedStage.bloomLevel },
              { label: pageContent.glance.labels.primaryTarget, value: localizedStage.primaryTarget },
              { label: pageContent.glance.labels.lessonSlot, value: localizedStage.lessonSlot },
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
          <div className="max-w-4xl mb-12">
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">{pageContent.studentExpectations.eyebrow}</span>
            <h2 className="text-4xl font-bold tracking-tight text-jurassic-dark mb-4">{pageContent.studentExpectations.title}</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {localizedStage.studentExpectations.map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-jurassic-soft/60 bg-jurassic-soft/15 p-6 shadow-premium"
              >
                <p className="text-gray-700 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-jurassic-soft/25">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div>
              <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">{pageContent.promptBank.eyebrow}</span>
              <h2 className="text-4xl font-bold tracking-tight text-jurassic-dark mb-6">{pageContent.promptBank.title}</h2>
              <div className="space-y-4">
                {localizedStage.promptBank.map((item) => (
                  <div key={item.type} className="rounded-3xl bg-white border border-jurassic-soft/60 p-6 shadow-premium">
                    <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">{item.type}</p>
                    <p className="text-gray-700 leading-relaxed">{item.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">{pageContent.languageBank.eyebrow}</span>
              <h2 className="text-4xl font-bold tracking-tight text-jurassic-dark mb-6">{pageContent.languageBank.title}</h2>
              <div className="space-y-4">
                {localizedStage.languageBank.map((item) => (
                  <div key={item.function} className="rounded-3xl bg-white border border-jurassic-soft/60 p-6 shadow-premium">
                    <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">{item.function}</p>
                    <p className="text-gray-700 leading-relaxed">{item.frame}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mb-12">
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">{pageContent.practicePrompts.eyebrow}</span>
            <h2 className="text-4xl font-bold tracking-tight text-jurassic-dark mb-4">{pageContent.practicePrompts.title}</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {localizedStage.practicePrompts.map((item) => (
              <div key={item.levelBand} className="rounded-3xl border border-jurassic-soft/60 bg-jurassic-soft/15 p-6 shadow-premium">
                <div className="flex items-center gap-3 mb-4">
                  <MessagesSquare className="w-4 h-4 text-jurassic-accent" />
                  <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">{item.levelBand}</p>
                </div>
                <p className="text-gray-700 leading-relaxed">{item.prompt}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-jurassic-dark text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div>
              <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">{pageContent.assessment.eyebrow}</span>
              <h2 className="text-4xl font-bold tracking-tight mb-6">{pageContent.assessment.title}</h2>
              <div className="space-y-4">
                {localizedStage.assessmentSnapshot.map((item) => (
                  <div key={item} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-premium">
                    <div className="flex items-center gap-3 mb-3">
                      <ClipboardList className="w-4 h-4 text-jurassic-accent" />
                      <p className="text-xs uppercase tracking-widest text-white/55 font-bold">{pageContent.assessment.label}</p>
                    </div>
                    <p className="text-white/80 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-premium">
                <div className="flex items-center gap-3 mb-4">
                  <LibraryBig className="w-5 h-5 text-jurassic-accent" />
                  <p className="text-xs uppercase tracking-widest text-white/55 font-bold">{pageContent.architecture.eyebrow}</p>
                </div>
                <p className="text-white/80 leading-relaxed"><span className="text-white font-semibold">{pageContent.architecture.primaryActivity}:</span> {localizedStage.primaryActivity}</p>
                <p className="mt-4 text-white/80 leading-relaxed"><span className="text-white font-semibold">{pageContent.architecture.teacherAction}:</span> {localizedStage.teacherAction}</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-premium">
                <div className="flex items-center gap-3 mb-4">
                  <Leaf className="w-5 h-5 text-jurassic-accent" />
                  <p className="text-xs uppercase tracking-widest text-white/55 font-bold">{pageContent.eco.eyebrow}</p>
                </div>
                <p className="text-white/80 leading-relaxed">{localizedStage.ecoExtension}</p>
                <p className="mt-4 text-white/65 leading-relaxed">{localizedStage.crossStageConnection}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
