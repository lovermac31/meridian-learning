import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  BookOpen,
  Brain,
  CheckCircle2,
  Compass,
  ExternalLink,
  PenLine,
  Scale,
  Search,
  Shield,
  Users,
} from 'lucide-react';
import { getMethodologyPageContent } from '../i18n/content/methodology';

type MethodologyPageProps = {
  onBack: () => void;
  onGetStarted: () => void;
  onNavigate: (path: string) => void;
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const PROBLEM_ICONS = [AlertTriangle, Users, BookOpen];

const STAGE_ICONS = {
  search: Search,
  scale: Scale,
  pen: PenLine,
  compass: Compass,
} as const;

const STAGE_ACCENT_COLOURS = [
  'text-jurassic-accent',  // Analyze — accent
  'text-jurassic-gold',    // Evaluate — gold
  'text-[#7eafc9]',        // Justify — cool blue
  'text-[#9bcca4]',        // Reflect — sage green
] as const;

const STAGE_BG_COLOURS = [
  'bg-jurassic-accent/10',
  'bg-jurassic-gold/10',
  'bg-[#7eafc9]/10',
  'bg-[#9bcca4]/10',
] as const;

const STAGE_BORDER_COLOURS = [
  'border-jurassic-accent/20',
  'border-jurassic-gold/20',
  'border-[#7eafc9]/20',
  'border-[#9bcca4]/20',
] as const;

const REGULATION_ICONS = [Brain, Shield, Users];
const FIDELITY_ICONS = [CheckCircle2, Users, Shield];

export const MethodologyPage = ({ onBack, onGetStarted, onNavigate }: MethodologyPageProps) => {
  const content = getMethodologyPageContent();

  return (
    <main className="bg-white">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c1220] via-jurassic-dark to-jurassic-dark" />
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

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mt-10 max-w-4xl"
          >
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
              <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs">
                {content.hero.eyebrow}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-jurassic-gold bg-jurassic-gold/10 border border-jurassic-gold/20 rounded-full px-3 py-1">
                {content.hero.badge}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight"
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
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 bg-jurassic-accent text-white px-8 py-4 rounded-full font-bold glow-hover shadow-premium group"
              >
                {content.hero.primaryCta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/discovery')}
                className="backdrop-blur-md bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-all"
              >
                {content.hero.secondaryCta}
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Problem with Generic ELT ─────────────────────────────── */}
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
              {content.problem.eyebrow}
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold tracking-tight text-jurassic-dark leading-tight mb-5">
              {content.problem.title}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-jurassic-dark/65 leading-relaxed">
              {content.problem.body}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {content.problem.modes.map((mode, i) => {
              const Icon = PROBLEM_ICONS[i];
              return (
                <motion.div
                  key={mode.title}
                  variants={fadeUp}
                  className="rounded-2xl border border-jurassic-dark/10 bg-jurassic-ivory p-7"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-jurassic-accent/8">
                    <Icon className="w-5 h-5 text-jurassic-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-jurassic-dark mb-3">{mode.title}</h3>
                  <p className="text-sm text-jurassic-dark/65 leading-relaxed">{mode.body}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── The Thinking Cycle ───────────────────────────────────── */}
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
              {content.cycle.eyebrow}
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight text-white leading-tight mb-5">
              {content.cycle.title}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-white/65 leading-relaxed">
              {content.cycle.body}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-6"
          >
            {content.cycle.stages.map((stage, i) => {
              const Icon = STAGE_ICONS[stage.icon as keyof typeof STAGE_ICONS] ?? Search;
              return (
                <motion.div
                  key={stage.id}
                  variants={fadeUp}
                  className={[
                    'rounded-2xl border bg-white/5 p-7 flex flex-col',
                    STAGE_BORDER_COLOURS[i],
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between mb-5">
                    <div className={[
                      'h-10 w-10 rounded-xl flex items-center justify-center',
                      STAGE_BG_COLOURS[i],
                    ].join(' ')}>
                      <Icon className={['w-5 h-5', STAGE_ACCENT_COLOURS[i]].join(' ')} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-white/30">
                      {stage.label}
                    </span>
                  </div>

                  <h3 className={['text-2xl font-bold mb-2', STAGE_ACCENT_COLOURS[i]].join(' ')}>
                    {stage.title}
                  </h3>

                  <p className="text-sm font-semibold text-white/50 italic mb-4 leading-relaxed">
                    {stage.line}
                  </p>

                  <p className="text-sm text-white/70 leading-relaxed flex-1">
                    {stage.body}
                  </p>

                  <button
                    type="button"
                    onClick={() => onNavigate(stage.path)}
                    className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-white/40 hover:text-white/80 transition-colors group"
                  >
                    See the {stage.title} stage in full
                    <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Authentic Literature ─────────────────────────────────── */}
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
              {content.literature.eyebrow}
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight text-jurassic-dark leading-tight mb-5">
              {content.literature.title}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-jurassic-dark/65 leading-relaxed">
              {content.literature.body}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {content.literature.principles.map((principle, i) => (
              <motion.div
                key={principle.title}
                variants={fadeUp}
                className="rounded-2xl border border-jurassic-dark/10 bg-jurassic-ivory p-7"
              >
                <div className="mb-4 w-8 h-px bg-jurassic-accent" />
                <h3 className="text-lg font-bold text-jurassic-dark mb-3">{principle.title}</h3>
                <p className="text-sm text-jurassic-dark/65 leading-relaxed">{principle.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Regulation Before Reasoning ──────────────────────────── */}
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
              {content.regulation.eyebrow}
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight text-jurassic-dark leading-tight mb-5">
              {content.regulation.title}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-jurassic-dark/65 leading-relaxed">
              {content.regulation.body}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {content.regulation.items.map((item, i) => {
              const Icon = REGULATION_ICONS[i];
              return (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  className="rounded-2xl border border-jurassic-dark/10 bg-white p-7"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-jurassic-dark/6">
                    <Icon className="w-5 h-5 text-jurassic-dark/55" />
                  </div>
                  <h3 className="text-lg font-bold text-jurassic-dark mb-3">{item.title}</h3>
                  <p className="text-sm text-jurassic-dark/65 leading-relaxed">{item.body}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Methodology Fidelity ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0e1a1f] py-20 px-6">
        <div className="absolute inset-0 bg-overlay-gold-accent-sm" />

        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="max-w-3xl mb-14"
          >
            <motion.span variants={fadeUp} className="text-jurassic-gold font-bold uppercase tracking-widest text-xs mb-3 block">
              {content.fidelity.eyebrow}
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight text-white leading-tight mb-5">
              {content.fidelity.title}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-white/65 leading-relaxed">
              {content.fidelity.body}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {content.fidelity.requirements.map((req, i) => {
              const Icon = FIDELITY_ICONS[i];
              return (
                <motion.div
                  key={req.number}
                  variants={fadeUp}
                  className="rounded-2xl border border-white/10 bg-white/5 p-7 flex flex-col"
                >
                  <div className="flex items-start justify-between mb-6">
                    <span className="text-3xl font-bold text-jurassic-gold/20 leading-none">
                      {req.number}
                    </span>
                    <div className="h-9 w-9 rounded-xl bg-jurassic-gold/10 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-jurassic-gold/60" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{req.title}</h3>
                  <p className="text-sm text-white/65 leading-relaxed flex-1">{req.body}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="bg-white py-20 px-6 border-t border-jurassic-dark/8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="max-w-2xl"
          >
            <motion.span variants={fadeUp} className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-3 block">
              {content.cta.eyebrow}
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight text-jurassic-dark leading-tight mb-5">
              {content.cta.title}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-jurassic-dark/65 leading-relaxed mb-10">
              {content.cta.body}
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 mb-4">
              <button
                type="button"
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 bg-jurassic-accent text-white px-8 py-4 rounded-full font-bold glow-hover shadow-premium group"
              >
                {content.cta.primaryCta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mb-6">
              <button
                type="button"
                onClick={() => onNavigate('/discovery')}
                className="text-sm font-semibold text-jurassic-dark/55 hover:text-jurassic-dark transition-colors underline underline-offset-4 decoration-jurassic-dark/20 hover:decoration-jurassic-dark/50"
              >
                {content.cta.discoveryCta}
              </button>
              <span className="text-jurassic-dark/20 select-none">·</span>
              <button
                type="button"
                onClick={() => onNavigate('/series/compare')}
                className="text-sm font-semibold text-jurassic-dark/55 hover:text-jurassic-dark transition-colors underline underline-offset-4 decoration-jurassic-dark/20 hover:decoration-jurassic-dark/50"
              >
                {content.cta.seriesCta}
              </button>
            </motion.div>

            <motion.p variants={fadeUp} className="text-xs text-jurassic-dark/45 leading-relaxed">
              {content.cta.note}
            </motion.p>
          </motion.div>
        </div>
      </section>

    </main>
  );
};
