import { motion } from 'motion/react';
import { ArrowLeft, ChevronRight, ClipboardList, Download, Leaf, LibraryBig, MessagesSquare } from 'lucide-react';
import { thinkingCycleStages, type ThinkingCycleStageDetail } from '../lib/thinkingCycleContent';

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
  return (
    <main className="bg-white pt-32 pb-24">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-jurassic-dark via-jurassic-dark to-[#1c2c18]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(242,100,25,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_30%)]" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 py-20">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to homepage
          </button>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 max-w-5xl"
          >
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
              Thinking Cycle Stage Detail
            </span>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
              {stage.title}
            </h1>
            <p className={`mt-4 text-lg font-semibold ${stage.accent}`}>{stage.line}</p>
            <div className="mt-6 space-y-4 text-lg text-white/72 leading-relaxed max-w-3xl">
              {stage.intro.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </motion.div>

          <div className="mt-12 flex flex-wrap gap-3">
            {thinkingCycleStages.map((item) => (
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
              Student Manual
            </a>
            <a
              href={stage.teacherManualPath}
              download={stage.teacherManualFileName}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              <Download className="w-4 h-4" />
              Teacher Manual
            </a>
            <button
              onClick={onCompareStages}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Compare All Stages
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-24 bg-jurassic-soft/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-10">
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
              At A Glance
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-jurassic-dark mb-4">
              Stage architecture
            </h2>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
            {[
              { label: 'Cognitive Operation', value: stage.cognitiveOperation },
              { label: 'Bloom Level', value: stage.bloomLevel },
              { label: 'Primary Target', value: stage.primaryTarget },
              { label: 'Lesson Slot', value: stage.lessonSlot },
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
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
              Student Expectations
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-jurassic-dark mb-4">
              What students are expected to do
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {stage.studentExpectations.map((item) => (
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
              <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
                Prompt Bank Summary
              </span>
              <h2 className="text-4xl font-bold tracking-tight text-jurassic-dark mb-6">
                Prompt types used at this stage
              </h2>
              <div className="space-y-4">
                {stage.promptBank.map((item) => (
                  <div key={item.type} className="rounded-3xl bg-white border border-jurassic-soft/60 p-6 shadow-premium">
                    <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">{item.type}</p>
                    <p className="text-gray-700 leading-relaxed">{item.summary}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
                Academic Language Bank
              </span>
              <h2 className="text-4xl font-bold tracking-tight text-jurassic-dark mb-6">
                Sentence frames used at this stage
              </h2>
              <div className="space-y-4">
                {stage.languageBank.map((item) => (
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
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
              Practice Prompts by Level
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-jurassic-dark mb-4">
              One stage, different level bands
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {stage.practicePrompts.map((item) => (
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
              <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
                Assessment Snapshot
              </span>
              <h2 className="text-4xl font-bold tracking-tight mb-6">
                How this stage is checked in the lesson
              </h2>
              <div className="space-y-4">
                {stage.assessmentSnapshot.map((item) => (
                  <div key={item} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-premium">
                    <div className="flex items-center gap-3 mb-3">
                      <ClipboardList className="w-4 h-4 text-jurassic-accent" />
                      <p className="text-xs uppercase tracking-widest text-white/55 font-bold">Assessment</p>
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
                  <p className="text-xs uppercase tracking-widest text-white/55 font-bold">Instructional Architecture</p>
                </div>
                <p className="text-white/80 leading-relaxed"><span className="text-white font-semibold">Primary Activity:</span> {stage.primaryActivity}</p>
                <p className="mt-4 text-white/80 leading-relaxed"><span className="text-white font-semibold">Teacher Action:</span> {stage.teacherAction}</p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-premium">
                <div className="flex items-center gap-3 mb-4">
                  <Leaf className="w-5 h-5 text-jurassic-accent" />
                  <p className="text-xs uppercase tracking-widest text-white/55 font-bold">Eco Extension / Cross-Stage Connection</p>
                </div>
                <p className="text-white/80 leading-relaxed">{stage.ecoExtension}</p>
                <p className="mt-4 text-white/65 leading-relaxed">{stage.crossStageConnection}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
