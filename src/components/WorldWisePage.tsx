import { motion, type Variants } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  GraduationCap,
  LayoutGrid,
  ShieldCheck,
} from 'lucide-react';
import { getWorldWisePageContent } from '../i18n/content/worldwise';
import type { Locale } from '../i18n/locales';

type WorldWisePageProps = {
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

const PILLAR_ICONS = [ShieldCheck, GraduationCap, LayoutGrid];
const PROCESS_ICONS = [FileSearch, ClipboardCheck, BookOpen];

export const WorldWisePage = ({ locale, onBack, onGetStarted, onNavigate }: WorldWisePageProps) => {
  const content = getWorldWisePageContent(locale);

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

          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="mt-10 max-w-4xl"
          >
            <motion.span
              variants={fadeUp}
              className="text-jurassic-gold font-bold uppercase tracking-widest text-xs mb-4 block"
            >
              {content.hero.eyebrow}
            </motion.span>

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

      {/* ── Core Proposition ─────────────────────────────────────── */}
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
              {content.proposition.eyebrow}
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight text-jurassic-dark leading-tight mb-5">
              {content.proposition.title}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-jurassic-dark/65 leading-relaxed">
              {content.proposition.body}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {content.proposition.pillars.map((pillar, i) => {
              const Icon = PILLAR_ICONS[i];
              return (
                <motion.div
                  key={pillar.title}
                  variants={fadeUp}
                  className="rounded-2xl border border-jurassic-dark/8 bg-jurassic-ivory p-7"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-jurassic-accent/10">
                    <Icon className="w-5 h-5 text-jurassic-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-jurassic-dark mb-3">{pillar.title}</h3>
                  <p className="text-sm text-jurassic-dark/65 leading-relaxed">{pillar.body}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Audience Lanes ───────────────────────────────────────── */}
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
            {content.audiences.cards.map((card) => (
              <motion.div
                key={card.role}
                variants={fadeUp}
                className="rounded-2xl border border-white/10 bg-white/5 p-7 flex flex-col"
              >
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
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Process ──────────────────────────────────────────────── */}
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
              {content.process.eyebrow}
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight text-jurassic-dark leading-tight mb-5">
              {content.process.title}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-jurassic-dark/65 leading-relaxed">
              {content.process.body}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {content.process.steps.map((step, i) => {
              const Icon = PROCESS_ICONS[i];
              return (
                <motion.div
                  key={step.number}
                  variants={fadeUp}
                  className="relative rounded-2xl border border-jurassic-dark/8 p-7"
                >
                  <div className="flex items-start gap-4 mb-5">
                    <span className="text-3xl font-bold text-jurassic-accent/25 leading-none font-display">
                      {step.number}
                    </span>
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-jurassic-accent/10">
                      <Icon className="w-5 h-5 text-jurassic-accent" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-jurassic-dark mb-3">{step.title}</h3>
                  <p className="text-sm text-jurassic-dark/65 leading-relaxed">{step.body}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Methodology Connection ───────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0e1a1f] py-20 px-6">
        <div className="absolute inset-0 bg-overlay-gold-center-md" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="max-w-3xl"
          >
            <motion.span variants={fadeUp} className="text-jurassic-gold font-bold uppercase tracking-widest text-xs mb-3 block">
              {content.methodology.eyebrow}
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight text-white leading-tight mb-5">
              {content.methodology.title}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-white/65 leading-relaxed mb-10">
              {content.methodology.body}
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => onNavigate('/framework')}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                <BookOpen className="w-4 h-4" />
                {content.methodology.frameworkCta}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/thinking-cycle/compare')}
                className="inline-flex items-center gap-2 rounded-full border border-jurassic-gold/30 bg-jurassic-gold/8 px-6 py-3 text-sm font-semibold text-jurassic-gold transition hover:bg-jurassic-gold/15"
              >
                {content.methodology.thinkingCycleCta}
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
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
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 mb-6">
              <button
                type="button"
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 bg-jurassic-accent text-white px-8 py-4 rounded-full font-bold glow-hover shadow-premium group"
              >
                {content.cta.primaryCta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/discovery')}
                className="border border-jurassic-dark/15 text-jurassic-dark px-8 py-4 rounded-full font-bold hover:border-jurassic-dark/30 hover:bg-jurassic-dark/4 transition-all"
              >
                {content.cta.secondaryCta}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/pilot-programme')}
                className="border border-jurassic-accent/30 text-jurassic-accent px-8 py-4 rounded-full font-bold hover:border-jurassic-accent/50 hover:bg-jurassic-accent/5 transition-all"
              >
                {content.cta.pilotCta}
              </button>
            </motion.div>
            {content.cta.overviewCta && (
              <motion.div variants={fadeUp} className="mb-4">
                <button
                  type="button"
                  onClick={() => onNavigate('/get-started?interest=curriculum_overview&source=worldwise')}
                  className="text-sm font-semibold text-jurassic-dark/50 hover:text-jurassic-dark transition-colors underline underline-offset-4 decoration-jurassic-dark/20 hover:decoration-jurassic-dark/50"
                >
                  {content.cta.overviewCta}
                </button>
              </motion.div>
            )}
            <motion.p variants={fadeUp} className="text-xs text-jurassic-dark/45 leading-relaxed">
              {content.cta.note}
            </motion.p>
          </motion.div>
        </div>
      </section>

    </main>
  );
};
