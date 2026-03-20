import { motion } from 'motion/react';
import {
  ArrowRight,
  BookText,
  ClipboardCheck,
  Construction,
  MessagesSquare,
  Scale,
  ShieldAlert,
} from 'lucide-react';

const pillars = [
  {
    title: 'Literature as the Intellectual Anchor',
    description:
      'Each unit is anchored to authentic, complete literature selected for moral depth, narrative clarity, cultural richness, language development potential, and ecological richness.',
    icon: <BookText className="w-5 h-5" />,
  },
  {
    title: 'Standards-Native Planning',
    description:
      'Planning begins from standards and reasoning outcomes, so alignment shapes instruction from the outset rather than being added after the fact.',
    icon: <ClipboardCheck className="w-5 h-5" />,
  },
  {
    title: 'Backward Design Discipline',
    description:
      'Teachers begin with the reasoning outcome, define evidence of mastery, and then build the instructional pathway that develops that capability.',
    icon: <Construction className="w-5 h-5" />,
  },
  {
    title: 'Structured Output',
    description:
      'Student thinking is made visible through planned oral, written, visual, and ecological outputs rather than informal discussion alone.',
    icon: <MessagesSquare className="w-5 h-5" />,
  },
  {
    title: 'Governance and Scalability',
    description:
      'The framework uses fixed lesson architecture to preserve institutional integrity across classrooms, campuses, and wider implementation.',
    icon: <Scale className="w-5 h-5" />,
  },
] as const;

const contrasts = [
  {
    legacy: 'Language as skill',
    current: 'Language as a reasoning tool',
  },
  {
    legacy: 'Text as linguistic input',
    current: 'Text as an intellectual fossil record',
  },
  {
    legacy: 'Comprehension as the goal',
    current: 'Justification as the goal',
  },
  {
    legacy: 'Teacher as facilitator',
    current: 'Teacher as intellectual excavator',
  },
] as const;

const prohibitedPractices = [
  {
    title: 'Skill-drill worksheets without reasoning context',
    replacement: 'Embedded skill instruction within literature analysis',
  },
  {
    title: 'Unstructured sharing without evidence requirements',
    replacement: 'Accountable talk supported by sentence frames',
  },
  {
    title: 'Simplified retellings in place of original texts',
    replacement: 'Scaffolded access to complete texts',
  },
  {
    title: 'Single-correct-answer comprehension questioning',
    replacement: 'Open-ended evaluative prompts',
  },
  {
    title: 'Accepting “I don’t know” without pressing or revoicing',
    replacement: 'Pressing for one possible reason, backed by text',
  },
] as const;

type FrameworkFoundationsProps = {
  onExploreFramework?: () => void;
};

export const FrameworkFoundations = ({
  onExploreFramework,
}: FrameworkFoundationsProps) => {
  return (
    <section className="py-28 bg-jurassic-soft/35 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          className="max-w-4xl"
        >
          <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
            Framework Foundations
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-jurassic-dark mb-6">
            Mission, structure, and non-negotiables.
          </h2>
          <div className="space-y-5 text-lg text-gray-600 leading-relaxed font-light">
            <p>
              Jurassic English™ is a structured instructional system designed to cultivate four
              interconnected competencies through literature-based English education: critical
              thinking, moral reasoning, structured reflection, and academic expression.
            </p>
            <p>
              The framework treats literature as primary evidence to be excavated, examined, and
              understood in depth. English functions as the medium of reasoning development, not
              merely the object of study.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ delay: 0.05 }}
          className="mt-16 grid lg:grid-cols-[1.05fr_0.95fr] gap-8"
        >
          <div className="rounded-3xl bg-white border border-jurassic-soft/60 shadow-premium p-8 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-jurassic-accent/10 flex items-center justify-center text-jurassic-accent">
                <BookText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-jurassic-dark">Pedagogical Positioning</p>
                <p className="text-sm text-gray-500">How the framework differs from conventional ELT</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {contrasts.map((item) => (
                <div
                  key={item.legacy}
                  className="rounded-2xl border border-jurassic-soft/70 bg-jurassic-soft/20 p-5"
                >
                  <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">
                    Traditional ELT
                  </p>
                  <p className="text-gray-500 text-sm mb-4">{item.legacy}</p>
                  <p className="text-sm font-semibold text-jurassic-dark">{item.current}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-jurassic-dark text-white shadow-premium p-8 md:p-10">
            <p className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4">
              Core Competencies
            </p>
            <div className="space-y-5">
              {[
                'Critical Thinking: systematic analysis that leads to reasoned judgment',
                'Moral Reasoning: ethical decision-making supported by justification',
                'Structured Reflection: metacognitive connection across personal, social, and ecological contexts',
                'Academic Expression: disciplined evidence-based oral and written argument',
              ].map((item) => (
                <div key={item} className="border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
                  <p className="text-white/80 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ delay: 0.08 }}
          className="mt-16"
        >
          <div className="flex items-end justify-between gap-6 mb-8 flex-wrap">
            <div>
              <p className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-3">
                Five Structural Pillars
              </p>
              <h3 className="text-3xl md:text-4xl font-bold text-jurassic-dark tracking-tight">
                The framework is rigorous by design.
              </h3>
            </div>
            <p className="max-w-xl text-gray-500 leading-relaxed">
              These pillars define how Jurassic English™ is planned, taught, and protected at scale.
            </p>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-5">
            {pillars.map((pillar, index) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="rounded-3xl bg-white border border-jurassic-soft/60 p-6 shadow-premium h-full"
              >
                <div className="w-11 h-11 rounded-2xl bg-jurassic-soft/50 text-jurassic-accent flex items-center justify-center mb-5">
                  {pillar.icon}
                </div>
                <h4 className="text-lg font-bold text-jurassic-dark leading-snug mb-3">
                  {pillar.title}
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">{pillar.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ delay: 0.12 }}
          className="mt-16 rounded-3xl bg-white border border-jurassic-soft/60 shadow-premium p-8 md:p-10"
        >
          <div className="flex items-start gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-2">
                Prohibited Practices
              </p>
              <h3 className="text-3xl font-bold text-jurassic-dark tracking-tight mb-3">
                What the framework does not allow
              </h3>
              <p className="text-gray-500 leading-relaxed max-w-3xl">
                These practices are excluded because they reduce reasoning demand, weaken evidence use,
                or lower the intellectual expectations of the lesson.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {prohibitedPractices.map((item) => (
              <div
                key={item.title}
                className="grid lg:grid-cols-[1fr_auto_1fr] gap-4 items-start rounded-2xl bg-jurassic-soft/20 border border-jurassic-soft/50 p-5"
              >
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">
                    Avoid
                  </p>
                  <p className="text-sm font-medium text-gray-700 leading-relaxed">{item.title}</p>
                </div>
                <div className="text-jurassic-accent font-bold pt-6">→</div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">
                    Replace with
                  </p>
                  <p className="text-sm font-semibold text-jurassic-dark leading-relaxed">
                    {item.replacement}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {onExploreFramework ? (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: 0.16 }}
            className="mt-10 flex justify-end"
          >
            <button
              onClick={onExploreFramework}
              className="inline-flex items-center gap-2 text-sm font-semibold text-jurassic-dark hover:text-jurassic-accent transition"
            >
              Explore the full framework
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        ) : null}
      </div>
    </section>
  );
};
