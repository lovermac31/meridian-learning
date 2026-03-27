import { motion } from 'motion/react';
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  Leaf,
  Mail,
  Milestone,
  Star,
} from 'lucide-react';
import { type SeriesLevelDetail } from '../lib/seriesContent';
import { type SyllabusData } from '../lib/syllabusContent';

type SyllabusExperienceProps = {
  level: SeriesLevelDetail;
  syllabus: SyllabusData;
  onBack: () => void;
  onViewLevel: () => void;
};

export const SyllabusExperience = ({
  level,
  syllabus,
  onBack,
  onViewLevel,
}: SyllabusExperienceProps) => {
  const glanceItems = [
    { label: 'Age Range', value: syllabus.levelAtAGlance.ageRange },
    { label: 'CEFR Range', value: syllabus.levelAtAGlance.cefrRange },
    { label: 'Total Lessons', value: syllabus.levelAtAGlance.totalLessons },
    { label: 'Lesson Duration', value: syllabus.levelAtAGlance.lessonDuration },
    { label: 'CEFR Progression', value: syllabus.levelAtAGlance.cefrProgression },
    { label: 'Cognitive Focus', value: syllabus.levelAtAGlance.cognitiveFocus },
    { label: 'Text Complexity', value: syllabus.levelAtAGlance.textComplexity },
    { label: 'Eco-Reasoning Strand', value: syllabus.levelAtAGlance.ecoStrand },
  ];

  return (
    <main className="bg-white pt-32 pb-24">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-jurassic-dark via-jurassic-dark to-[#1c2c18]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(242,100,25,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_30%)]" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 py-20">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 max-w-4xl"
          >
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-3 block">
              Curriculum Syllabus · Academic Year 2025–26
            </span>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
              {level.title}
            </h1>
            <p className="mt-4 text-jurassic-gold text-lg font-semibold">{level.tagline}</p>
            <div className="mt-6 space-y-4 text-lg text-white/72 leading-relaxed max-w-3xl">
              {syllabus.welcomeText.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </motion.div>

          <div className="mt-10 flex flex-wrap gap-3">
            <button
              onClick={onViewLevel}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              View Level Details
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Level at a Glance ── */}
      <section className="py-24 bg-jurassic-soft/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-10">
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
              Level at a Glance
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-jurassic-dark mb-4">
              Everything you need to know at a glance
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {glanceItems.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl bg-white border border-jurassic-soft/60 p-5 shadow-premium"
              >
                <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">
                  {item.label}
                </p>
                <p className="text-sm font-semibold text-jurassic-dark leading-relaxed">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Core Texts ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-10">
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
              Core Texts
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-jurassic-dark mb-4">
              Literature selected to develop real thinking
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed font-light">
              Every text is chosen because it raises questions that do not have easy answers.
              10 core texts per year; 4 structured lessons per text.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 mb-8">
            {syllabus.coreTexts.map((text) => (
              <div
                key={text.title}
                className="rounded-3xl border border-jurassic-soft/60 bg-white p-7 shadow-premium flex items-start gap-5"
              >
                <div className="w-11 h-11 rounded-2xl bg-jurassic-accent/10 text-jurassic-accent flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <p className="font-bold text-jurassic-dark leading-snug">{text.title}</p>
                    {text.isEco && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        <Leaf className="w-3 h-3" />
                        Eco
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">
                    {text.author}
                  </p>
                  <p className="text-sm text-gray-600 leading-relaxed">{text.theme}</p>
                </div>
              </div>
            ))}
          </div>

          {syllabus.coreTextNote && (
            <div className="rounded-2xl border border-jurassic-soft/60 bg-jurassic-soft/15 px-6 py-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                <span className="font-semibold text-jurassic-dark">Additional texts: </span>
                {syllabus.coreTextNote}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Term by Term ── */}
      <section className="py-24 bg-jurassic-soft/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-10">
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
              Academic Year
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-jurassic-dark mb-4">
              Term-by-term curriculum map
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {syllabus.termBreakdown.map((term, i) => (
              <div
                key={term.term}
                className="rounded-3xl bg-white border border-jurassic-soft/60 p-8 shadow-premium"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-jurassic-accent text-white flex items-center justify-center text-sm font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-bold text-jurassic-dark">{term.term}</p>
                    <p className="text-xs text-gray-400 font-semibold">
                      {term.lessonRange} · {term.units}
                    </p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {term.focusPoints.map((point, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <ChevronRight className="w-4 h-4 text-jurassic-accent shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700 leading-relaxed">{point}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Assessment ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mb-10">
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
              Assessment
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-jurassic-dark mb-4">
              Assessment tracks the quality of reasoning.
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed font-light">
              All written justification tasks are assessed using the WWL Four-Level Reasoning Rubric.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 mb-12">
            {syllabus.assessmentMethods.map((method) => (
              <div
                key={method.method}
                className="rounded-3xl border border-jurassic-soft/60 bg-jurassic-soft/15 p-6 shadow-premium"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-jurassic-accent/10 text-jurassic-accent flex items-center justify-center shrink-0">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-bold text-jurassic-dark">{method.method}</p>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-jurassic-accent bg-jurassic-accent/10 rounded-full px-2 py-0.5">
                        {method.frequency}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{method.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Reasoning Rubric */}
          <div className="rounded-3xl bg-jurassic-dark text-white p-8 shadow-premium">
            <div className="mb-6">
              <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-3 block">
                WWL Four-Level Reasoning Rubric
              </span>
              <h3 className="text-2xl font-bold">The standard applied to all written work</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {syllabus.reasoningRubric.map((row) => (
                <div
                  key={row.level}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-7 h-7 rounded-lg bg-jurassic-accent text-white flex items-center justify-center text-xs font-bold">
                      {row.level}
                    </span>
                    <p className="font-bold text-white">{row.label}</p>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed">{row.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Eco Thread ── */}
      <section className="py-24 bg-jurassic-soft/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-[1fr_1.6fr] gap-8 items-start">
            <div className="rounded-3xl bg-emerald-950 text-white p-8 shadow-premium">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                <Leaf className="w-6 h-6" />
              </div>
              <span className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-4 block">
                Eco-Learning Thread
              </span>
              <h2 className="text-3xl font-bold leading-tight mb-4">
                {syllabus.ecoStrandLabel}
              </h2>
              <p className="text-white/72 leading-relaxed">{syllabus.ecoThreadSummary}</p>
            </div>

            <div className="space-y-5">
              <div className="rounded-3xl bg-white border border-jurassic-soft/60 p-8 shadow-premium">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-jurassic-accent/10 text-jurassic-accent flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5" />
                  </div>
                  <p className="font-bold text-jurassic-dark text-lg">Supporting Learning at Home</p>
                </div>
                <ul className="space-y-3">
                  {syllabus.homeSupportTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <ChevronRight className="w-4 h-4 text-jurassic-accent shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Progression ── */}
      <section className="py-24 bg-jurassic-dark text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mb-12">
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
              Programme Progression
            </span>
            <h2 className="text-4xl font-bold tracking-tight mb-4">Where this level fits</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-12">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-premium">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-jurassic-accent flex items-center justify-center mb-6">
                <Milestone className="w-5 h-5" />
              </div>
              <p className="text-xs uppercase tracking-widest text-white/55 font-bold mb-3">
                Coming from
              </p>
              <p className="text-lg font-semibold text-white/90">{syllabus.progressionFrom}</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-premium">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-jurassic-accent flex items-center justify-center mb-6">
                <ChevronRight className="w-5 h-5" />
              </div>
              <p className="text-xs uppercase tracking-widest text-white/55 font-bold mb-3">
                Leading to
              </p>
              <p className="text-lg font-semibold text-white/90">{syllabus.progressionTo}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-premium max-w-3xl">
            <p className="text-xs uppercase tracking-widest text-white/55 font-bold mb-4">
              Readiness for the next stage
            </p>
            <p className="text-white/80 leading-relaxed">{syllabus.readinessStatement}</p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="rounded-3xl bg-jurassic-soft/30 border border-jurassic-soft/60 p-10 md:p-14 text-center max-w-3xl mx-auto shadow-premium">
            <div className="w-14 h-14 rounded-2xl bg-jurassic-accent/10 text-jurassic-accent flex items-center justify-center mx-auto mb-6">
              <Mail className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-jurassic-dark mb-4">
              Enquire about this level
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8 max-w-xl mx-auto">
              Interested in introducing {level.title} at your school? Contact us to discuss
              teacher training, school licensing, and curriculum review.
            </p>
            <a
              href="mailto:info@jurassicenglish.com"
              className="inline-flex items-center gap-2 rounded-full bg-jurassic-accent px-8 py-4 text-sm font-bold text-white transition hover:bg-jurassic-accent/90"
            >
              <Mail className="w-4 h-4" />
              info@jurassicenglish.com
            </a>
            <p className="mt-6 text-sm text-gray-400">
              Published by World Wise Learning · Jurassic English™ Version 3.0 · Academic Year 2025–2026
            </p>
          </div>

          <div className="mt-10 flex justify-center">
            <button
              onClick={onViewLevel}
              className="inline-flex items-center gap-2 text-sm font-semibold text-jurassic-accent transition hover:text-jurassic-accent/80"
            >
              <ExternalLink className="w-4 h-4" />
              View full Level {level.order} detail page
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};
