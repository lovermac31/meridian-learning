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
import {
  frameworkConceptualModel,
  frameworkEcocentricExtension,
  frameworkEvidenceBase,
  frameworkGovernance,
  frameworkInstructionalStandards,
  frameworkResearchDomains,
  frameworkScalability,
} from '../lib/frameworkContent';

type FrameworkExperienceProps = {
  onBack: () => void;
  onGetStarted: () => void;
};

export const FrameworkExperience = ({
  onBack,
  onGetStarted,
}: FrameworkExperienceProps) => {
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
            className="mt-10 max-w-4xl"
          >
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
              Framework Deep Dive
            </span>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
              The deeper architecture behind Jurassic English<span className="text-xl align-top text-jurassic-accent">™</span>
            </h1>
            <p className="mt-6 text-lg text-white/70 leading-relaxed max-w-3xl">
              This is the detailed view for curriculum leaders, academic reviewers, and institutional
              decision-makers who need to understand the framework’s research base, instructional
              standards, ecological extension, governance, and implementation logic.
            </p>
          </motion.div>

          <div className="mt-14 grid md:grid-cols-3 gap-5">
            {[
              'Research-informed and literature-centered',
              'Instructionally disciplined and standards-aware',
              'Governed for fidelity, scalability, and long-term implementation',
            ].map((item) => (
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
              Core Model
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-jurassic-dark mb-4">
              Three levels hold the framework together.
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed font-light">
              The guidebook frames Jurassic English™ at three linked levels: what counts as sound
              judgment, how reasoning is taught, and what teachers and students actually do in the lesson.
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
              Research Base
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-jurassic-dark mb-4">
              The framework stands on a clear research spine.
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed font-light">
              The v3.0 guidebook grounds the framework in critical thinking, moral development,
              disciplinary literacy, cognitive apprenticeship, culturally sustaining pedagogy,
              language progression, ecocentric education, and Education for Sustainable Development.
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
                <h3 className="text-2xl font-bold">Evidence in Practice</h3>
                <p className="text-white/60 text-sm">
                  The guidebook’s empirical base translated into classroom relevance
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
              Instructional Design Standards
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-jurassic-dark mb-4">
              Access varies. Cognitive challenge does not.
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed font-light">
              The framework combines UDL, differentiation, and self-regulation principles so students
              can reach the same reasoning architecture through different access pathways.
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
                Ecocentric Reasoning Extension
              </span>
              <h2 className="text-4xl font-bold tracking-tight text-jurassic-dark mb-5">
                Version 3.0 expands the framework without replacing it.
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
              <h3 className="text-2xl font-bold mb-4">What changes in practice</h3>
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
              Ecocentric Text Selection Criteria
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
              Governance and Fidelity
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-jurassic-dark mb-4">
              The framework is governed, audited, and versioned.
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed font-light">
              The guidebook positions quality assurance as a formal part of implementation, not an
              optional add-on. Review, moderation, and renewal are built into the model.
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
              Scalability and Implementation
            </span>
            <h2 className="text-4xl font-bold tracking-tight text-jurassic-dark mb-4">
              Growth is only valid when fidelity stays intact.
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed font-light">
              The v3.0 guidebook frames expansion as a tiered implementation pathway supported by
              shared protocols, certification, and quality assurance.
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
              Next Step
            </span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
              Explore implementation with the full framework in view.
            </h2>
            <p className="text-white/70 text-lg leading-relaxed max-w-3xl">
              If you are reviewing Jurassic English™ for school adoption, training, licensing, or
              curriculum design, the next conversation should begin from both pedagogy and implementation.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center justify-center gap-2 bg-jurassic-accent text-white px-6 py-3 rounded-full font-bold shadow-premium"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onBack}
                className="inline-flex items-center justify-center gap-2 border border-white/15 text-white/80 px-6 py-3 rounded-full font-semibold hover:text-white hover:border-white/30 transition"
              >
                Return to homepage
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
