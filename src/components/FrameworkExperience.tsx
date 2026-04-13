import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  ClipboardList,
  Leaf,
  Microscope,
  Scaling,
  ShieldCheck,
} from 'lucide-react';
import { getFrameworkContent, getFrameworkPageContent } from '../i18n/content/framework';
import { getCurrentLocale } from '../i18n/routing';

type FrameworkExperienceProps = {
  onBack: () => void;
  onGetStarted: () => void;
};

export const FrameworkExperience = ({
  onBack,
  onGetStarted,
}: FrameworkExperienceProps) => {
  const locale = getCurrentLocale();
  const frameworkContent = getFrameworkContent(locale) ?? getFrameworkContent('en');
  const frameworkPageContent = getFrameworkPageContent(locale) ?? getFrameworkPageContent('en');

  if (!frameworkPageContent || !frameworkContent) {
    return null;
  }

  const {
    frameworkConceptualModel,
    frameworkEcocentricExtension,
    frameworkEvidenceBase,
    frameworkGovernance,
    frameworkInstructionalStandards,
    frameworkResearchDomains,
    frameworkScalability,
  } = frameworkContent;

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
            {frameworkPageContent.hero.backCta}
          </button>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 max-w-4xl"
          >
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
              {frameworkPageContent.hero.eyebrow}
            </span>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
              {frameworkPageContent.hero.title}
            </h1>
            <p className="mt-6 text-lg text-white/70 leading-relaxed max-w-3xl">
              {frameworkPageContent.hero.body}
            </p>
          </motion.div>

          <div className="mt-14 grid md:grid-cols-3 gap-5">
            {frameworkPageContent.hero.highlights.map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-5 text-white/80 shadow-premium"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-jurassic-soft/25">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mb-12">
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
              {frameworkPageContent.sections.coreModel.eyebrow}
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-jurassic-dark mb-4">
              {frameworkPageContent.sections.coreModel.title}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed font-light">
              {frameworkPageContent.sections.coreModel.body}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {frameworkConceptualModel.map((item) => (
              <div
                key={item.layer}
                className="rounded-3xl bg-white border border-jurassic-soft/60 p-7 shadow-premium"
              >
                <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-3">
                  {item.layer}
                </p>
                <h3 className="text-2xl font-bold text-jurassic-dark mb-3">{item.question}</h3>
                <p className="text-gray-600 leading-relaxed">{item.locus}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mb-12">
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
              {frameworkPageContent.sections.researchBase.eyebrow}
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-jurassic-dark mb-4">
              {frameworkPageContent.sections.researchBase.title}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed font-light">
              {frameworkPageContent.sections.researchBase.body}
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
            {frameworkResearchDomains.map((domain) => (
              <div
                key={domain.title}
                className="rounded-3xl border border-jurassic-soft/60 bg-jurassic-soft/15 p-6 shadow-premium"
              >
                <div className="w-11 h-11 rounded-2xl bg-jurassic-accent/10 text-jurassic-accent flex items-center justify-center mb-5">
                  <Microscope className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-jurassic-dark mb-3">{domain.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{domain.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-3xl bg-jurassic-dark text-white p-8 md:p-10 shadow-premium">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-jurassic-accent">
                <BookOpenCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{frameworkPageContent.sections.researchBase.practiceTitle}</h3>
                <p className="text-white/60 text-sm">
                  {frameworkPageContent.sections.researchBase.practiceBody}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {frameworkEvidenceBase.map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/75">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-jurassic-soft/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mb-12">
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
              {frameworkPageContent.sections.instructionalStandards.eyebrow}
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-jurassic-dark mb-4">
              {frameworkPageContent.sections.instructionalStandards.title}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed font-light">
              {frameworkPageContent.sections.instructionalStandards.body}
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-5">
            {frameworkInstructionalStandards.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl bg-white border border-jurassic-soft/60 p-6 shadow-premium"
              >
                <div className="w-11 h-11 rounded-2xl bg-jurassic-soft/45 text-jurassic-accent flex items-center justify-center mb-5">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-jurassic-dark mb-3">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
            <div>
              <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
                {frameworkPageContent.sections.ecocentricExtension.eyebrow}
              </span>
              <h2 className="text-4xl font-bold tracking-tight text-jurassic-dark mb-5">
                {frameworkPageContent.sections.ecocentricExtension.title}
              </h2>
              <div className="space-y-5 text-lg text-gray-600 leading-relaxed font-light">
                <p>{frameworkEcocentricExtension.intro}</p>
                <p>{frameworkEcocentricExtension.metaphor}</p>
                <p>{frameworkEcocentricExtension.reflectionRule}</p>
              </div>
            </div>

            <div className="rounded-3xl bg-jurassic-dark text-white p-8 shadow-premium">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-jurassic-accent flex items-center justify-center mb-6">
                <Leaf className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{frameworkPageContent.sections.ecocentricExtension.practiceTitle}</h3>
              <div className="space-y-4">
                {frameworkEcocentricExtension.reflectionTypes.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white/75">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-3xl border border-jurassic-soft/60 bg-jurassic-soft/15 p-8 shadow-premium">
            <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-4">
              {frameworkPageContent.sections.ecocentricExtension.criteriaLabel}
            </p>
            <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-4">
              {frameworkEcocentricExtension.textCriteria.map((item) => (
                <div key={item} className="rounded-2xl bg-white border border-jurassic-soft/50 px-4 py-4 text-sm font-medium text-gray-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-jurassic-soft/25">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mb-12">
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
              {frameworkPageContent.sections.governance.eyebrow}
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-jurassic-dark mb-4">
              {frameworkPageContent.sections.governance.title}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed font-light">
              {frameworkPageContent.sections.governance.body}
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-5">
            {frameworkGovernance.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl bg-white border border-jurassic-soft/60 p-6 shadow-premium"
              >
                <div className="w-11 h-11 rounded-2xl bg-jurassic-accent/10 text-jurassic-accent flex items-center justify-center mb-5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">
                  {item.cadence}
                </p>
                <h3 className="text-lg font-bold text-jurassic-dark mb-3">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mb-12">
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
              {frameworkPageContent.sections.scalability.eyebrow}
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-jurassic-dark mb-4">
              {frameworkPageContent.sections.scalability.title}
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed font-light">
              {frameworkPageContent.sections.scalability.body}
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
            {frameworkScalability.map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-jurassic-soft/60 bg-jurassic-soft/15 p-6 shadow-premium"
              >
                <div className="w-11 h-11 rounded-2xl bg-white text-jurassic-accent flex items-center justify-center mb-5 border border-jurassic-soft/50">
                  <Scaling className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-jurassic-dark mb-3">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="rounded-[2rem] bg-jurassic-dark text-white shadow-premium p-10 md:p-14">
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
              {frameworkPageContent.sections.nextStep.eyebrow}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
              {frameworkPageContent.sections.nextStep.title}
            </h2>
            <p className="text-white/70 text-lg leading-relaxed max-w-3xl">
              {frameworkPageContent.sections.nextStep.body}
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center justify-center gap-2 bg-jurassic-accent text-white px-6 py-3 rounded-full font-bold shadow-premium"
              >
                {frameworkPageContent.sections.nextStep.primaryCta}
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onBack}
                className="inline-flex items-center justify-center gap-2 border border-white/15 text-white/80 px-6 py-3 rounded-full font-semibold hover:text-white hover:border-white/30 transition"
              >
                {frameworkPageContent.sections.nextStep.secondaryCta}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
