import { motion, type Variants } from 'motion/react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileText,
  GraduationCap,
  RefreshCw,
  Shield,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { getTeacherStandardsPageContent } from '../i18n/content/teacherStandards';

type TeacherStandardsPageProps = {
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

const PROBLEM_ICONS = [Users, BookOpen, Eye];

const QUAL_TAGS: Record<string, string> = {
  'Required Baseline': 'text-jurassic-green bg-jurassic-green/10 border-jurassic-green/20',
  'UK Professional Standard': 'text-jurassic-teal bg-jurassic-teal/10 border-jurassic-teal/20',
  'Critical Distinction': 'text-jurassic-gold bg-jurassic-gold/10 border-jurassic-gold/20',
};

const CONSISTENCY_ICONS = [Shield, RefreshCw, Users, ClipboardList];
const INSTITUTION_ICONS = [Award, ShieldCheck, FileText];

export const TeacherStandardsPage = ({ onBack, onGetStarted, onNavigate }: TeacherStandardsPageProps) => {
  const content = getTeacherStandardsPageContent();

  return (
    <main className="bg-white">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#14100c] via-[#130f1a] to-jurassic-dark" />
        <div className="absolute inset-0 bg-overlay-green-gold" />

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
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-jurassic-green bg-jurassic-green/10 border border-jurassic-green/20 rounded-full px-3 py-1">
                <GraduationCap className="w-3 h-3" />
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
                onClick={() => onNavigate('/audit-sprint')}
                className="backdrop-blur-md bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-all"
              >
                {content.hero.secondaryCta}
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── The Delivery Quality Problem ─────────────────────────── */}
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

      {/* ── Professional Qualification Standards ─────────────────── */}
      <section className="bg-jurassic-dark py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={staggerContainer}
            className="max-w-3xl mb-14"
          >
            <motion.span variants={fadeUp} className="text-jurassic-green font-bold uppercase tracking-widest text-xs mb-3 block">
              {content.qualification.eyebrow}
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight text-white leading-tight mb-5">
              {content.qualification.title}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-white/65 leading-relaxed">
              {content.qualification.body}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {content.qualification.items.map((item) => {
              const tagClass = QUAL_TAGS[item.tag] ?? 'text-white/50 bg-white/5 border-white/10';
              return (
                <motion.div
                  key={item.label}
                  variants={fadeUp}
                  className="rounded-2xl border border-white/10 bg-white/5 p-7 flex flex-col"
                >
                  <div className="flex items-start justify-between mb-5">
                    <span className={[
                      'inline-flex items-center text-[10px] font-bold uppercase tracking-widest rounded-full px-2.5 py-1 border',
                      tagClass,
                    ].join(' ')}>
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{item.label}</h3>
                  <p className="text-xs text-white/40 font-medium mb-4 leading-relaxed italic">
                    {item.fullName}
                  </p>
                  <p className="text-sm text-white/70 leading-relaxed flex-1">{item.body}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── Methodology Preparation ──────────────────────────────── */}
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
              {content.preparation.eyebrow}
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight text-jurassic-dark leading-tight mb-5">
              {content.preparation.title}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-jurassic-dark/65 leading-relaxed">
              {content.preparation.body}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-6"
          >
            {content.preparation.stages.map((stage) => (
              <motion.div
                key={stage.number}
                variants={fadeUp}
                className="rounded-2xl border border-jurassic-dark/10 bg-jurassic-ivory p-7 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-3xl font-bold text-jurassic-accent/18 leading-none">
                    {stage.number}
                  </span>
                  <div className="w-6 h-px bg-jurassic-accent/30" />
                </div>
                <h3 className="text-lg font-bold text-jurassic-dark mb-3">{stage.title}</h3>
                <p className="text-sm text-jurassic-dark/65 leading-relaxed flex-1">{stage.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Consistency Across Classrooms ────────────────────────── */}
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
              {content.consistency.eyebrow}
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight text-jurassic-dark leading-tight mb-5">
              {content.consistency.title}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-jurassic-dark/65 leading-relaxed">
              {content.consistency.body}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-6"
          >
            {content.consistency.items.map((item, i) => {
              const Icon = CONSISTENCY_ICONS[i];
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

      {/* ── For Institutions ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0e1a1f] py-20 px-6">
        <div className="absolute inset-0 bg-overlay-green-gold-sm" />

        <div className="relative z-10 max-w-7xl mx-auto">
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
                onClick={() => onNavigate('/audit-sprint')}
                className="text-sm font-semibold text-jurassic-dark/55 hover:text-jurassic-dark transition-colors underline underline-offset-4 decoration-jurassic-dark/20 hover:decoration-jurassic-dark/50"
              >
                {content.cta.auditCta}
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
