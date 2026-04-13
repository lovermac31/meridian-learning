import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Map,
  Search,
  Users,
} from 'lucide-react';
import { getAuditSprintPageContent } from '../i18n/content/auditSprint';
import type { Locale } from '../i18n/locales';

type AuditSprintPageProps = {
  locale: Locale;
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

const PROBLEM_ICONS = [AlertTriangle, Users, Search];
const DELIVERABLE_ICONS = [FileText, Map, ArrowRight];

export const AuditSprintPage = ({ locale, onBack, onGetStarted, onNavigate }: AuditSprintPageProps) => {
  const content = getAuditSprintPageContent(locale);

  return (
    <main className="bg-white">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1a0f] via-jurassic-dark to-jurassic-dark" />
        <div className="absolute inset-0 bg-overlay-accent-gold" />

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
                <Clock className="w-3 h-3" />
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

      {/* ── Problem ──────────────────────────────────────────────── */}
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
                  className="rounded-2xl border border-jurassic-dark/10 bg-white p-7"
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

      {/* ── Deliverables ─────────────────────────────────────────── */}
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
              {content.deliverables.eyebrow}
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight text-jurassic-dark leading-tight mb-5">
              {content.deliverables.title}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-jurassic-dark/65 leading-relaxed">
              {content.deliverables.body}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {content.deliverables.items.map((item, i) => {
              const Icon = DELIVERABLE_ICONS[i];
              return (
                <motion.div
                  key={item.number}
                  variants={fadeUp}
                  className="rounded-2xl border border-jurassic-dark/8 bg-jurassic-ivory p-7 flex flex-col"
                >
                  <div className="flex items-start justify-between mb-5">
                    <span className="text-3xl font-bold text-jurassic-accent/20 leading-none">
                      {item.number}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-jurassic-accent bg-jurassic-accent/10 rounded-full px-2.5 py-1">
                      {item.tag}
                    </span>
                  </div>
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-jurassic-dark/8">
                    <Icon className="w-5 h-5 text-jurassic-dark/60" />
                  </div>
                  <h3 className="text-lg font-bold text-jurassic-dark mb-3">{item.title}</h3>
                  <p className="text-sm text-jurassic-dark/65 leading-relaxed flex-1">{item.body}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Process / Timeline ───────────────────────────────────── */}
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
            {content.process.steps.map((step) => (
              <motion.div
                key={step.number}
                variants={fadeUp}
                className="relative rounded-2xl border border-jurassic-dark/10 bg-white p-7"
              >
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-3xl font-bold text-jurassic-accent/20 leading-none">
                    {step.number}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-jurassic-dark/55 bg-jurassic-dark/6 rounded-full px-2.5 py-1">
                    <Clock className="w-3 h-3" />
                    {step.duration}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-jurassic-dark mb-3">{step.title}</h3>
                <p className="text-sm text-jurassic-dark/65 leading-relaxed">{step.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Standards ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0e1a1f] py-16 px-6">
        <div className="absolute inset-0 bg-overlay-gold-center" />
        <div className="relative z-10 max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
          >
            <motion.span variants={fadeUp} className="text-jurassic-gold font-bold uppercase tracking-widest text-xs mb-3 block">
              {content.standards.eyebrow}
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl font-bold tracking-tight text-white mb-4">
              {content.standards.title}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-base text-white/60 leading-relaxed max-w-2xl mb-10">
              {content.standards.body}
            </motion.p>

            <motion.div
              variants={staggerContainer}
              className="flex flex-wrap gap-3"
            >
              {content.standards.items.map((item) => (
                <motion.div
                  key={item.label}
                  variants={fadeUp}
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-3"
                >
                  <div className="text-sm font-bold text-white mb-0.5">{item.label}</div>
                  <div className="text-xs text-white/50">{item.detail}</div>
                </motion.div>
              ))}
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
