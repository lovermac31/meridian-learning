import { motion, type Variants } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart2,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  FileText,
  Globe,
  Layers,
  PenLine,
  Scale,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { getCefrAlignmentPageContent } from '../i18n/content/cefrAlignment';
import type { Locale } from '../i18n/locales';

type CefrAlignmentPageProps = {
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

const PROBLEM_ICONS = [Layers, BarChart2, Globe];
const PILLAR_ICONS = [BookOpen, Users, PenLine];
const INSTITUTION_ICONS = [Award, ShieldCheck, FileText];

const LEVEL_ACCENTS = [
  { text: 'text-jurassic-teal',   bg: 'bg-jurassic-teal/12',   border: 'border-jurassic-teal/25',   bar: 'bg-jurassic-teal'   },
  { text: 'text-jurassic-green',  bg: 'bg-jurassic-green/12',  border: 'border-jurassic-green/25',  bar: 'bg-jurassic-green'  },
  { text: 'text-jurassic-gold',   bg: 'bg-jurassic-gold/12',   border: 'border-jurassic-gold/25',   bar: 'bg-jurassic-gold'   },
  { text: 'text-jurassic-accent', bg: 'bg-jurassic-accent/12', border: 'border-jurassic-accent/25', bar: 'bg-jurassic-accent' },
  { text: 'text-[#c97adb]',       bg: 'bg-[#c97adb]/12',       border: 'border-[#c97adb]/25',       bar: 'bg-[#c97adb]'       },
] as const;

export const CefrAlignmentPage = ({ locale, onBack, onGetStarted, onNavigate }: CefrAlignmentPageProps) => {
  const content = getCefrAlignmentPageContent(locale);

  return (
    <main className="bg-white">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c1828] via-[#0f1c22] to-jurassic-dark" />
        <div className="absolute inset-0 bg-overlay-teal-gold" />

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
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-jurassic-teal bg-jurassic-teal/10 border border-jurassic-teal/20 rounded-full px-3 py-1">
                <Scale className="w-3 h-3" />
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
                onClick={() => onNavigate('/get-started?interest=audit_sprint')}
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

      {/* ── The Alignment Gap ────────────────────────────────────── */}
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

      {/* ── What CEFR Actually Requires ──────────────────────────── */}
      <section className="bg-jurassic-dark py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="max-w-3xl mb-14"
          >
            <motion.span variants={fadeUp} className="text-jurassic-teal font-bold uppercase tracking-widest text-xs mb-3 block">
              {content.cefrFramework.eyebrow}
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight text-white leading-tight mb-5">
              {content.cefrFramework.title}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-white/65 leading-relaxed">
              {content.cefrFramework.body}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6 mb-10"
          >
            {content.cefrFramework.pillars.map((pillar, i) => {
              const Icon = PILLAR_ICONS[i];
              return (
                <motion.div
                  key={pillar.domain}
                  variants={fadeUp}
                  className="rounded-2xl border border-jurassic-teal/20 bg-jurassic-teal/5 p-7 flex flex-col"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-jurassic-teal/10">
                    <Icon className="w-5 h-5 text-jurassic-teal" />
                  </div>
                  <h3 className="text-base font-bold text-jurassic-teal mb-1 uppercase tracking-wide text-xs">
                    CEFR Domain
                  </h3>
                  <p className="text-lg font-bold text-white mb-3">{pillar.domain}</p>
                  <p className="text-sm text-white/55 leading-relaxed mb-4 italic flex-1">
                    {pillar.descriptor}
                  </p>
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1.5">
                      How the Thinking Cycle addresses this
                    </p>
                    <p className="text-sm text-white/70 leading-relaxed">{pillar.howAddressed}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="rounded-2xl border border-jurassic-gold/20 bg-jurassic-gold/5 px-7 py-5"
          >
            <p className="text-sm text-jurassic-gold/90 leading-relaxed font-medium">
              {content.cefrFramework.note}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── CEFR-V and MOET 2030 ─────────────────────────────────── */}
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
              {content.vietnam.eyebrow}
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold tracking-tight text-jurassic-dark leading-tight mb-5">
              {content.vietnam.title}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-jurassic-dark/65 leading-relaxed">
              {content.vietnam.body}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-6 mb-8"
          >
            {content.vietnam.frameworks.map((framework) => (
              <motion.div
                key={framework.label}
                variants={fadeUp}
                className="rounded-2xl border border-jurassic-dark/10 bg-white p-7"
              >
                <div className="flex items-start gap-3 mb-4">
                  <span className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-jurassic-dark bg-jurassic-dark/8 rounded-lg px-2.5 py-1 shrink-0">
                    {framework.label}
                  </span>
                </div>
                <h3 className="text-base font-bold text-jurassic-dark mb-3 leading-snug">
                  {framework.fullName}
                </h3>
                <p className="text-sm text-jurassic-dark/65 leading-relaxed mb-5">
                  {framework.detail}
                </p>
                <div className="rounded-xl bg-jurassic-accent/6 border border-jurassic-accent/15 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-jurassic-accent mb-1">
                    Institutional implication
                  </p>
                  <p className="text-sm text-jurassic-dark/75 leading-relaxed">
                    {framework.implication}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="rounded-2xl border border-jurassic-dark/10 bg-jurassic-dark px-7 py-5"
          >
            <p className="text-sm text-white/75 leading-relaxed">
              {content.vietnam.worldwiseNote}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Curriculum Progression Map ───────────────────────────── */}
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
              {content.progressionMap.eyebrow}
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight text-jurassic-dark leading-tight mb-5">
              {content.progressionMap.title}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-jurassic-dark/65 leading-relaxed">
              {content.progressionMap.body}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4"
          >
            {content.progressionMap.levels.map((level, i) => {
              const accent = LEVEL_ACCENTS[i];
              return (
                <motion.div
                  key={level.number}
                  variants={fadeUp}
                  className={[
                    'rounded-2xl border p-5 flex flex-col',
                    accent.bg,
                    accent.border,
                  ].join(' ')}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <span className={['text-[10px] font-bold uppercase tracking-widest', accent.text].join(' ')}>
                      {level.tag}
                    </span>
                    <span className="text-2xl font-bold text-jurassic-dark/10 leading-none">
                      {level.number}
                    </span>
                  </div>

                  {/* Level name */}
                  <h3 className={['text-xl font-bold mb-1', accent.text].join(' ')}>
                    {level.title}
                  </h3>

                  {/* CEFR range — prominent */}
                  <div className="mb-1">
                    <span className="text-sm font-bold text-jurassic-dark">
                      {level.cefrRange}
                    </span>
                  </div>

                  {/* Age band */}
                  <p className="text-xs text-jurassic-dark/50 mb-5">{level.ageBand}</p>

                  {/* Accent divider */}
                  <div className={['w-8 h-0.5 mb-4 rounded-full', accent.bar].join(' ')} />

                  {/* Descriptors */}
                  <ul className="space-y-2.5 flex-1">
                    {level.descriptors.map((descriptor) => (
                      <li key={descriptor} className="flex items-start gap-2">
                        <div className={['w-1 h-1 rounded-full shrink-0 mt-1.5', accent.bar].join(' ')} />
                        <span className="text-xs text-jurassic-dark/65 leading-relaxed">{descriptor}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Link to series level */}
                  <button
                    type="button"
                    onClick={() => onNavigate(level.path)}
                    className={[
                      'mt-5 pt-4 border-t flex items-center gap-1.5 text-xs font-semibold transition-opacity opacity-60 hover:opacity-100',
                      `border-current ${accent.text}`,
                    ].join(' ')}
                    style={{ borderColor: 'currentColor' }}
                  >
                    View full level
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── For Institutions ─────────────────────────────────────── */}
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
              {content.institutions.eyebrow}
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight text-white leading-tight mb-5">
              {content.institutions.title}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-white/65 leading-relaxed">
              {content.institutions.body}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="grid lg:grid-cols-3 gap-6"
          >
            {content.institutions.cards.map((card, i) => {
              const Icon = INSTITUTION_ICONS[i];
              return (
                <motion.div
                  key={card.role}
                  variants={fadeUp}
                  className="rounded-2xl border border-white/10 bg-white/5 p-7 flex flex-col"
                >
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-jurassic-gold/10">
                    <Icon className="w-5 h-5 text-jurassic-gold/70" />
                  </div>
                  <span className="text-jurassic-gold text-xs font-bold uppercase tracking-widest mb-4 block">
                    {card.role}
                  </span>
                  <h3 className="text-xl font-bold text-white leading-snug mb-4">{card.headline}</h3>
                  <p className="text-sm text-white/65 leading-relaxed mb-6 flex-1">{card.body}</p>
                  <ul className="space-y-2">
                    {card.signals.map((signal) => (
                      <li key={signal} className="flex items-start gap-2.5 text-xs text-white/75">
                        <CheckCircle2 className="w-3.5 h-3.5 text-jurassic-gold shrink-0 mt-0.5" />
                        {signal}
                      </li>
                    ))}
                  </ul>
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
                onClick={() => onNavigate('/get-started?interest=audit_sprint')}
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
                onClick={() => onNavigate('/get-started?interest=curriculum_overview')}
                className="text-sm font-semibold text-jurassic-dark/55 hover:text-jurassic-dark transition-colors underline underline-offset-4 decoration-jurassic-dark/20 hover:decoration-jurassic-dark/50"
              >
                {content.cta.overviewCta}
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
