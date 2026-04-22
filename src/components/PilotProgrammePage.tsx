import { motion, type Variants } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  FileText,
  GraduationCap,
  Layers3,
  LineChart,
  Network,
  Presentation,
  Route,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { getPilotProgrammePageContent } from '../i18n/content/pilotProgramme';
import type { Locale } from '../i18n/locales';

type PilotProgrammePageProps = {
  locale: Locale;
  onBack: () => void;
  onGetStarted: () => void;
  onNavigate: (path: string) => void;
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const audienceIcons = [GraduationCap, Users, BriefcaseBusiness];
const measureIcons = [BookOpenCheck, ClipboardCheck, BarChart3, ShieldCheck, FileText];
const pathwayIcons = [Compass, ClipboardCheck, Presentation, Building2];
const timelineIcons = [Compass, Layers3, LineChart, TrendingUp];
const governanceIcons = [ShieldCheck, GraduationCap, Route, Users];
const reportingIcons = [Presentation, BarChart3, ClipboardCheck, Target];
const investorIcons = [TrendingUp, ShieldCheck, FileText, Network];

const pathwayVisual = [
  'Audit Sprint',
  'Pilot Programme',
  'Executive Review',
  'Licensing / Scale',
] as const;

const timelineVisual = [
  'Discovery and Alignment',
  'MVP Design',
  'Execution and Data Collection',
  'Conversion and Scale Preparation',
] as const;

const kpiMatrix = [
  {
    label: 'Teacher outcomes',
    metric: 'Fidelity and readiness',
    detail: 'Delivery confidence, routine consistency, planning load, and support needs.',
  },
  {
    label: 'Student outcomes',
    metric: 'Reasoning evidence',
    detail: 'Comprehension quality, evidence use, discussion, justification, and written response.',
  },
  {
    label: 'Parent outcomes',
    metric: 'Confidence signals',
    detail: 'Clarity of learning value, visible progress artefacts, and communication readiness.',
  },
  {
    label: 'Institutional/system outcomes',
    metric: 'Rollout feasibility',
    detail: 'Timetable fit, staffing demand, admin load, licensing readiness, and scale logic.',
  },
] as const;

const commercialRows = ['Fit', 'Model', 'Decision use'] as const;

export const PilotProgrammePage = ({ locale, onBack, onGetStarted, onNavigate }: PilotProgrammePageProps) => {
  const content = getPilotProgrammePageContent(locale);

  return (
    <main className="bg-white">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-jurassic-dark via-[#111c14] to-[#0e1a1f]" />
        <div className="absolute inset-0 bg-overlay-gold-accent" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 transition hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            {content.hero.backCta}
          </button>

          <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(340px,0.7fr)] lg:items-end">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-jurassic-gold font-bold uppercase tracking-widest text-xs">
                  {content.hero.eyebrow}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-xs font-semibold text-white/75">
                  <ClipboardCheck className="w-3 h-3 text-jurassic-gold" />
                  {content.hero.badge}
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight"
              >
                {content.hero.title}
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-6 text-lg text-white/70 leading-relaxed max-w-3xl"
              >
                {content.hero.body}
              </motion.p>

              <motion.div variants={fadeUp} className="mt-10 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate('/get-started?interest=curriculum_review&source=pilot-programme&access=pilot_pack')}
                  className="inline-flex items-center gap-2 bg-jurassic-accent text-white px-8 py-4 rounded-full font-bold glow-hover shadow-premium group"
                >
                  {content.hero.primaryCta}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={onGetStarted}
                  className="backdrop-blur-md bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-all"
                >
                  {content.hero.consultationCta}
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/discovery')}
                  className="text-white/75 px-4 py-4 font-bold hover:text-white transition-colors"
                >
                  {content.hero.secondaryCta}
                </button>
              </motion.div>
            </motion.div>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="rounded-lg border border-white/10 bg-white/[0.045] p-5 shadow-premium backdrop-blur-md"
              aria-label="Institutional adoption pathway"
            >
              <motion.div variants={fadeUp} className="mb-5 flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-jurassic-gold">Adoption pathway</p>
                  <p className="mt-1 text-sm text-white/60">Evidence before scale commitment</p>
                </div>
                <Route className="h-5 w-5 text-jurassic-teal" />
              </motion.div>
              <div className="space-y-3">
                {pathwayVisual.map((step, index) => {
                  const Icon = pathwayIcons[index];
                  const isCurrentStep = step === 'Pilot Programme';

                  return (
                    <motion.div
                      key={step}
                      variants={fadeUp}
                      className={[
                        'relative flex items-center gap-4 rounded-lg border p-4 transition-transform duration-300',
                        isCurrentStep
                          ? 'border-jurassic-gold/45 bg-jurassic-gold/12'
                          : 'border-white/10 bg-white/[0.035] hover:-translate-y-0.5',
                      ].join(' ')}
                    >
                      <div className={[
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border',
                        isCurrentStep
                          ? 'border-jurassic-gold/35 bg-jurassic-gold/15 text-jurassic-gold'
                          : 'border-jurassic-teal/20 bg-jurassic-teal/10 text-jurassic-teal',
                      ].join(' ')}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/35">
                          Step {index + 1}
                        </p>
                        <p className="text-sm font-bold text-white">{step}</p>
                      </div>
                      {index < pathwayVisual.length - 1 && (
                        <div className="absolute left-9 top-[calc(100%-2px)] h-3 w-px bg-white/15" />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Overview ─────────────────────────────────────────────── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-12 items-start"
          >
            <div>
              <motion.span variants={fadeUp} className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-3 block">
                {content.overview.eyebrow}
              </motion.span>
              <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight text-jurassic-dark leading-tight mb-5">
                {content.overview.title}
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-jurassic-dark/65 leading-relaxed">
                {content.overview.body}
              </motion.p>
            </div>

            <motion.div variants={staggerContainer} className="grid sm:grid-cols-2 gap-4">
              {content.overview.points.map((point) => (
                <motion.div
                  key={point}
                  variants={fadeUp}
                  className="rounded-2xl border border-jurassic-dark/8 bg-jurassic-ivory p-6"
                >
                  <CheckCircle2 className="w-5 h-5 text-jurassic-accent mb-4" />
                  <p className="text-sm text-jurassic-dark/70 leading-relaxed">{point}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Audiences ────────────────────────────────────────────── */}
      <section className="bg-jurassic-dark py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="max-w-3xl mb-14"
          >
            <motion.span variants={fadeUp} className="text-jurassic-gold font-bold uppercase tracking-widest text-xs mb-3 block">
              {content.audiences.eyebrow}
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight text-white leading-tight mb-5">
              {content.audiences.title}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-white/65 leading-relaxed">
              {content.audiences.body}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="grid lg:grid-cols-3 gap-6"
          >
            {content.audiences.cards.map((card, i) => {
              const Icon = audienceIcons[i];
              return (
                <motion.div
                  key={card.role}
                  variants={fadeUp}
                  className="rounded-2xl border border-white/10 bg-white/5 p-7"
                >
                  <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-jurassic-gold/10">
                    <Icon className="w-5 h-5 text-jurassic-gold" />
                  </div>
                  <span className="text-jurassic-gold text-xs font-bold uppercase tracking-widest mb-4 block">
                    {card.role}
                  </span>
                  <h3 className="text-xl font-bold text-white leading-snug mb-4">{card.headline}</h3>
                  <p className="text-sm text-white/65 leading-relaxed">{card.body}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Structure ────────────────────────────────────────────── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="max-w-3xl mb-14"
          >
            <motion.span variants={fadeUp} className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-3 block">
              {content.structure.eyebrow}
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight text-jurassic-dark leading-tight mb-5">
              {content.structure.title}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-jurassic-dark/65 leading-relaxed">
              {content.structure.body}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="mb-10 grid gap-3 md:grid-cols-4"
            aria-label="Four-phase pilot timeline"
          >
            {timelineVisual.map((label, index) => {
              const Icon = timelineIcons[index];

              return (
                <motion.div
                  key={label}
                  variants={fadeUp}
                  className="relative rounded-lg border border-jurassic-dark/10 bg-jurassic-ivory p-5"
                >
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-jurassic-blue text-white">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-2xl font-bold text-jurassic-dark/15">0{index + 1}</span>
                  </div>
                  <p className="text-sm font-bold leading-snug text-jurassic-dark">{label}</p>
                  {index < timelineVisual.length - 1 && (
                    <ArrowRight className="absolute right-[-1.1rem] top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 rounded-full bg-white p-0.5 text-jurassic-accent shadow-sm md:block" />
                  )}
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 xl:grid-cols-4 gap-6"
          >
            {content.structure.steps.map((step) => (
              <motion.div
                key={step.number}
                variants={fadeUp}
                className="rounded-2xl border border-jurassic-dark/8 p-7"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <span className="text-3xl font-bold text-jurassic-accent/25 leading-none font-display">
                    {step.number}
                  </span>
                  <span className="rounded-full bg-jurassic-accent/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-jurassic-accent">
                    {step.duration}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-jurassic-dark mb-3">{step.title}</h3>
                <div className="space-y-5">
                  <div>
                    <h4 className="mb-1 text-[10px] font-bold uppercase tracking-widest text-jurassic-accent">
                      Purpose
                    </h4>
                    <p className="text-sm text-jurassic-dark/65 leading-relaxed">{step.purpose}</p>
                  </div>
                  <div>
                    <h4 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-jurassic-dark/40">
                      Activities
                    </h4>
                    <ul className="space-y-2">
                      {step.activities.map((activity) => (
                        <li key={activity} className="flex items-start gap-2 text-xs text-jurassic-dark/65 leading-relaxed">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-jurassic-accent" />
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-jurassic-dark/40">
                      Outputs
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {step.outputs.map((output) => (
                        <span
                          key={output}
                          className="rounded-full bg-jurassic-dark/5 px-3 py-1 text-[10px] font-semibold text-jurassic-dark/65"
                        >
                          {output}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-jurassic-accent/20 bg-jurassic-accent/5 p-4">
                    <h4 className="mb-1 text-[10px] font-bold uppercase tracking-widest text-jurassic-accent">
                      Decision Gate
                    </h4>
                    <p className="text-xs text-jurassic-dark/70 leading-relaxed">{step.decisionGate}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Governance ──────────────────────────────────────────── */}
      <section className="bg-jurassic-dark py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-12 items-start"
          >
            <div>
              <motion.span variants={fadeUp} className="text-jurassic-gold font-bold uppercase tracking-widest text-xs mb-3 block">
                {content.governance.eyebrow}
              </motion.span>
              <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight text-white leading-tight mb-5">
                {content.governance.title}
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-white/65 leading-relaxed">
                {content.governance.body}
              </motion.p>
            </div>

            <motion.div variants={staggerContainer} className="space-y-5">
              <motion.div
                variants={fadeUp}
                className="rounded-lg border border-white/10 bg-white/[0.045] p-5"
                aria-label="Pilot governance operating model"
              >
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-jurassic-gold">Operating model</p>
                    <p className="mt-1 text-sm text-white/55">Named owners, weekly evidence review, sponsor escalation.</p>
                  </div>
                  <ShieldCheck className="h-5 w-5 text-jurassic-teal" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {content.governance.roles.map((role, index) => {
                    const Icon = governanceIcons[index];

                    return (
                      <div key={role.title} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                        <Icon className="mb-3 h-4 w-4 text-jurassic-gold" />
                        <p className="text-xs font-bold text-white">{role.title}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {content.governance.operations.map((operation) => (
                    <div key={operation.label} className="rounded-lg border border-jurassic-teal/20 bg-jurassic-teal/10 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-jurassic-teal">{operation.label}</p>
                      <p className="mt-2 text-xs leading-relaxed text-white/65">{operation.detail}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <div className="grid sm:grid-cols-2 gap-4">
                {content.governance.roles.map((role) => (
                  <motion.div
                    key={role.title}
                    variants={fadeUp}
                    className="rounded-2xl border border-white/10 bg-white/5 p-6"
                  >
                    <h3 className="text-base font-bold text-white mb-2">{role.title}</h3>
                    <p className="text-sm text-white/65 leading-relaxed">{role.body}</p>
                  </motion.div>
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {content.governance.operations.map((operation) => (
                  <motion.div
                    key={operation.label}
                    variants={fadeUp}
                    className="rounded-2xl border border-jurassic-gold/20 bg-jurassic-gold/8 p-6"
                  >
                    <h3 className="text-sm font-bold uppercase tracking-widest text-jurassic-gold mb-2">
                      {operation.label}
                    </h3>
                    <p className="text-sm text-white/70 leading-relaxed">{operation.detail}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Measures ─────────────────────────────────────────────── */}
      <section className="bg-jurassic-ivory py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="max-w-3xl mb-14"
          >
            <motion.span variants={fadeUp} className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-3 block">
              {content.measures.eyebrow}
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight text-jurassic-dark leading-tight mb-5">
              {content.measures.title}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-jurassic-dark/65 leading-relaxed">
              {content.measures.body}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="mb-10 overflow-hidden rounded-lg border border-jurassic-dark/10 bg-jurassic-dark text-white shadow-premium"
            aria-label="Pilot KPI dashboard matrix"
          >
            <div className="grid gap-px bg-white/10 md:grid-cols-4">
              {kpiMatrix.map((item, index) => (
                <motion.div key={item.label} variants={fadeUp} className="bg-jurassic-dark p-6">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <span className="rounded-full border border-jurassic-gold/25 bg-jurassic-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-jurassic-gold">
                      0{index + 1}
                    </span>
                    <BarChart3 className="h-4 w-4 text-jurassic-teal" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white/90">{item.label}</h3>
                  <p className="mt-3 text-lg font-bold leading-snug text-jurassic-gold">{item.metric}</p>
                  <p className="mt-3 text-sm leading-relaxed text-white/62">{item.detail}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 xl:grid-cols-5 gap-5"
          >
            {content.measures.items.map((item, i) => {
              const Icon = measureIcons[i];
              return (
                <motion.div
                  key={item.label}
                  variants={fadeUp}
                  className="rounded-2xl border border-jurassic-dark/8 bg-white p-6"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-jurassic-accent/10">
                    <Icon className="w-5 h-5 text-jurassic-accent" />
                  </div>
                  <h3 className="text-base font-bold text-jurassic-dark mb-3">{item.label}</h3>
                  <p className="text-sm text-jurassic-dark/65 leading-relaxed">{item.detail}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Support and Commercial Model ─────────────────────────── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="rounded-2xl border border-jurassic-dark/8 p-8"
          >
            <motion.span variants={fadeUp} className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-3 block">
              {content.support.eyebrow}
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl font-bold tracking-tight text-jurassic-dark leading-tight mb-4">
              {content.support.title}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-base text-jurassic-dark/65 leading-relaxed mb-7">
              {content.support.body}
            </motion.p>
            <motion.ul variants={staggerContainer} className="space-y-3">
              {content.support.items.map((item) => (
                <motion.li key={item} variants={fadeUp} className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-jurassic-accent shrink-0 mt-0.5" />
                  <span className="text-sm text-jurassic-dark/75 leading-relaxed">{item}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="rounded-2xl bg-jurassic-dark p-8 text-white"
          >
            <motion.span variants={fadeUp} className="text-jurassic-gold font-bold uppercase tracking-widest text-xs mb-3 block">
              {content.commercial.eyebrow}
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl font-bold tracking-tight leading-tight mb-4">
              {content.commercial.title}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-base text-white/65 leading-relaxed mb-7">
              {content.commercial.body}
            </motion.p>
            <motion.div variants={staggerContainer} className="grid lg:grid-cols-3 gap-5" aria-label="Commercial pathway comparison">
              {content.commercial.pathways.map((pathway, index) => (
                <motion.div
                  key={pathway.title}
                  variants={fadeUp}
                  className="rounded-lg border border-white/10 bg-white/5 p-6 transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="mb-6 flex items-start justify-between gap-4 border-b border-white/10 pb-5">
                    <h3 className="text-lg font-bold text-white">{pathway.title}</h3>
                    <span className="rounded-full bg-jurassic-gold/10 px-3 py-1 text-[10px] font-bold text-jurassic-gold">
                      Path {index + 1}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {commercialRows.map((row) => (
                      <div key={row} className="rounded-lg border border-white/8 bg-white/[0.035] p-4">
                        <h4 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-jurassic-gold">
                          {row}
                        </h4>
                        <p className="text-sm text-white/65 leading-relaxed">
                          {row === 'Fit'
                            ? pathway.fit
                            : row === 'Model'
                              ? pathway.model
                              : 'Use this pathway to decide whether the institution should continue advisory work, launch an MVP, or prepare for scaled licensing.'}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Deliverables ────────────────────────────────────────── */}
      <section className="bg-white py-20 px-6 border-t border-jurassic-dark/8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-12 items-start"
          >
            <div>
              <motion.span variants={fadeUp} className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-3 block">
                {content.deliverables.eyebrow}
              </motion.span>
              <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight text-jurassic-dark leading-tight mb-5">
                {content.deliverables.title}
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-jurassic-dark/65 leading-relaxed">
                {content.deliverables.body}
              </motion.p>
            </div>

            <motion.div variants={staggerContainer} className="grid sm:grid-cols-2 gap-4">
              {content.deliverables.items.map((item) => (
                <motion.div
                  key={item}
                  variants={fadeUp}
                  className="flex items-start gap-3 rounded-2xl border border-jurassic-dark/8 bg-jurassic-ivory p-5"
                >
                  <FileText className="w-4 h-4 text-jurassic-accent shrink-0 mt-0.5" />
                  <span className="text-sm text-jurassic-dark/75 leading-relaxed">{item}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Proof Assets ────────────────────────────────────────── */}
      <section className="bg-jurassic-ivory py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="max-w-3xl mb-14"
          >
            <motion.span variants={fadeUp} className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-3 block">
              {content.proof.eyebrow}
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight text-jurassic-dark leading-tight mb-5">
              {content.proof.title}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-jurassic-dark/65 leading-relaxed">
              {content.proof.body}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {content.proof.assets.map((asset) => (
              <motion.div
                key={asset.title}
                variants={fadeUp}
                className="rounded-2xl border border-jurassic-dark/8 bg-white p-7"
              >
                <FileText className="w-5 h-5 text-jurassic-accent mb-5" />
                <h3 className="text-lg font-bold text-jurassic-dark mb-3">{asset.title}</h3>
                <p className="text-sm text-jurassic-dark/65 leading-relaxed">{asset.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Future Reporting Structure ───────────────────────────── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-12 items-start"
          >
            <div>
              <motion.span variants={fadeUp} className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-3 block">
                {content.reporting.eyebrow}
              </motion.span>
              <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight text-jurassic-dark leading-tight mb-5">
                {content.reporting.title}
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-jurassic-dark/65 leading-relaxed">
                {content.reporting.body}
              </motion.p>
            </div>

            <motion.div variants={staggerContainer} className="space-y-4" aria-label="Reporting architecture visual">
              {content.reporting.sections.map((section, index) => {
                const Icon = reportingIcons[index];

                return (
                <motion.div
                  key={section.title}
                  variants={fadeUp}
                  className="relative rounded-lg border border-jurassic-dark/8 bg-white p-6 shadow-sm"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-jurassic-blue text-white">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-jurassic-accent">
                      Report layer 0{index + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-jurassic-dark mb-2">{section.title}</h3>
                  <p className="text-sm text-jurassic-dark/65 leading-relaxed">{section.body}</p>
                  {index < content.reporting.sections.length - 1 && (
                    <div className="absolute -bottom-3 left-10 hidden h-6 w-px bg-jurassic-dark/15 lg:block" />
                  )}
                </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Investor Logic ───────────────────────────────────────── */}
      <section className="bg-jurassic-ivory py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="max-w-3xl mb-14"
          >
            <motion.span variants={fadeUp} className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-3 block">
              {content.investor.eyebrow}
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight text-jurassic-dark leading-tight mb-5">
              {content.investor.title}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-jurassic-dark/65 leading-relaxed">
              {content.investor.body}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 xl:grid-cols-4 gap-5"
            aria-label="Investor-facing scale logic"
          >
            {content.investor.points.map((point, index) => {
              const Icon = investorIcons[index];

              return (
              <motion.div
                key={point.title}
                variants={fadeUp}
                className="rounded-lg border border-jurassic-dark/8 bg-white p-6 shadow-sm"
              >
                <div className="mb-5 flex items-center justify-between gap-4">
                  <Icon className="w-5 h-5 text-jurassic-accent" />
                  <span className="h-px flex-1 bg-jurassic-dark/10" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-jurassic-dark/35">
                    Scale 0{index + 1}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-jurassic-dark mb-3">{point.title}</h3>
                <p className="text-sm text-jurassic-dark/65 leading-relaxed">{point.body}</p>
              </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="bg-jurassic-dark py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="max-w-2xl"
          >
            <motion.span variants={fadeUp} className="text-jurassic-gold font-bold uppercase tracking-widest text-xs mb-3 block">
              {content.cta.eyebrow}
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight text-white leading-tight mb-5">
              {content.cta.title}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-white/65 leading-relaxed mb-10">
              {content.cta.body}
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 mb-6">
              <button
                type="button"
                onClick={() => onNavigate('/get-started?interest=curriculum_review&source=pilot-programme&access=pilot_pack')}
                className="inline-flex items-center gap-2 bg-jurassic-accent text-white px-8 py-4 rounded-full font-bold glow-hover shadow-premium group"
              >
                {content.cta.primaryCta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                type="button"
                onClick={onGetStarted}
                className="border border-white/15 text-white px-8 py-4 rounded-full font-bold hover:bg-white/8 transition-all"
              >
                {content.cta.consultationCta}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/discovery')}
                className="text-white/75 px-4 py-4 font-bold hover:text-white transition-colors"
              >
                {content.cta.secondaryCta}
              </button>
            </motion.div>
            <motion.p variants={fadeUp} className="text-xs text-white/45 leading-relaxed">
              {content.cta.note}
            </motion.p>
          </motion.div>
        </div>
      </section>

    </main>
  );
};
