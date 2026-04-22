import { useState } from 'react';
import { motion, type Variants } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  GraduationCap,
  School,
  Users,
} from 'lucide-react';
import { getDiscoveryPageContent } from '../i18n/content/discovery';

type DiscoveryPageProps = {
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

const PATH_ICONS = {
  building: Building2,
  school: School,
  training: Users,
} as const;

export const DiscoveryPage = ({ onBack, onGetStarted, onNavigate }: DiscoveryPageProps) => {
  const content = getDiscoveryPageContent();
  const [activePath, setActivePath] = useState<number | null>(null);

  return (
    <main className="bg-white">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-jurassic-dark via-[#0e1520] to-jurassic-dark" />
        <div className="absolute inset-0 bg-overlay-gold-accent-tl" />

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
                onClick={() => onNavigate('/audit-sprint')}
                className="backdrop-blur-md bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-all"
              >
                {content.hero.secondaryCta}
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Qualify Paths ────────────────────────────────────────── */}
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
              {content.qualify.eyebrow}
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight text-jurassic-dark leading-tight mb-5">
              {content.qualify.title}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-jurassic-dark/65 leading-relaxed">
              {content.qualify.body}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="grid lg:grid-cols-3 gap-5"
          >
            {content.qualify.paths.map((path, i) => {
              const Icon = PATH_ICONS[path.icon as keyof typeof PATH_ICONS] ?? GraduationCap;
              const isActive = activePath === i;

              return (
                <motion.button
                  key={path.role}
                  type="button"
                  variants={fadeUp}
                  onClick={() => setActivePath(isActive ? null : i)}
                  className={[
                    'rounded-2xl border text-left p-7 flex flex-col transition-all duration-300 cursor-pointer group',
                    isActive
                      ? 'border-jurassic-accent bg-jurassic-dark text-white shadow-premium'
                      : 'border-jurassic-dark/10 bg-jurassic-ivory hover:border-jurassic-accent/40 hover:bg-white',
                  ].join(' ')}
                >
                  {/* Role label + icon */}
                  <div className="flex items-center justify-between mb-5">
                    <span className={[
                      'text-xs font-bold uppercase tracking-widest',
                      isActive ? 'text-jurassic-gold' : 'text-jurassic-accent',
                    ].join(' ')}>
                      {path.role}
                    </span>
                    <div className={[
                      'h-9 w-9 rounded-xl flex items-center justify-center transition-colors',
                      isActive ? 'bg-white/10' : 'bg-jurassic-accent/10',
                    ].join(' ')}>
                      <Icon className={[
                        'w-4 h-4',
                        isActive ? 'text-jurassic-gold' : 'text-jurassic-accent',
                      ].join(' ')} />
                    </div>
                  </div>

                  <h3 className={[
                    'text-lg font-bold leading-snug mb-4',
                    isActive ? 'text-white' : 'text-jurassic-dark',
                  ].join(' ')}>
                    {path.headline}
                  </h3>

                  <p className={[
                    'text-sm leading-relaxed mb-6 flex-1',
                    isActive ? 'text-white/70' : 'text-jurassic-dark/60',
                  ].join(' ')}>
                    {path.body}
                  </p>

                  {/* Agenda items — always visible */}
                  <div className="space-y-2">
                    <p className={[
                      'text-[10px] font-bold uppercase tracking-widest mb-2',
                      isActive ? 'text-white/40' : 'text-jurassic-dark/40',
                    ].join(' ')}>
                      Call agenda
                    </p>
                    {path.agenda.map((item) => (
                      <div key={item} className="flex items-start gap-2.5">
                        <CheckCircle2 className={[
                          'w-3.5 h-3.5 shrink-0 mt-0.5',
                          isActive ? 'text-jurassic-gold' : 'text-jurassic-accent',
                        ].join(' ')} />
                        <span className={[
                          'text-xs leading-relaxed',
                          isActive ? 'text-white/75' : 'text-jurassic-dark/65',
                        ].join(' ')}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Select CTA */}
                  <div className={[
                    'mt-6 pt-5 border-t flex items-center justify-between',
                    isActive ? 'border-white/10' : 'border-jurassic-dark/8',
                  ].join(' ')}>
                    <span className={[
                      'text-xs font-semibold',
                      isActive ? 'text-jurassic-gold' : 'text-jurassic-accent',
                    ].join(' ')}>
                      {isActive ? 'Selected' : 'This is my context'}
                    </span>
                    <ArrowRight className={[
                      'w-4 h-4 transition-transform group-hover:translate-x-0.5',
                      isActive ? 'text-jurassic-gold' : 'text-jurassic-accent',
                    ].join(' ')} />
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Anchor CTA after paths */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-10 flex justify-center"
          >
            <button
              type="button"
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 bg-jurassic-accent text-white px-8 py-4 rounded-full font-bold glow-hover shadow-premium group"
            >
              {content.hero.primaryCta}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── What to Expect ───────────────────────────────────────── */}
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
              {content.expect.eyebrow}
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight text-white leading-tight mb-5">
              {content.expect.title}
            </motion.h2>
            <motion.p variants={fadeUp} className="text-lg text-white/65 leading-relaxed">
              {content.expect.body}
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-6"
          >
            {content.expect.items.map((item) => (
              <motion.div
                key={item.step}
                variants={fadeUp}
                className="rounded-2xl border border-white/10 bg-white/5 p-7"
              >
                <span className="text-3xl font-bold text-jurassic-gold/20 leading-none block mb-5">
                  {item.step}
                </span>
                <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                <p className="text-sm text-white/65 leading-relaxed">{item.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Outcomes ─────────────────────────────────────────────── */}
      <section className="bg-jurassic-ivory py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="max-w-2xl"
          >
            <motion.span variants={fadeUp} className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-3 block">
              {content.outcomes.eyebrow}
            </motion.span>
            <motion.h2 variants={fadeUp} className="text-3xl font-bold tracking-tight text-jurassic-dark mb-8">
              {content.outcomes.title}
            </motion.h2>
            <motion.ul variants={staggerContainer} className="space-y-4">
              {content.outcomes.items.map((item) => (
                <motion.li key={item} variants={fadeUp} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-jurassic-accent shrink-0 mt-0.5" />
                  <span className="text-base text-jurassic-dark/80 leading-relaxed">{item}</span>
                </motion.li>
              ))}
            </motion.ul>
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
                onClick={() => onNavigate('/pilot-programme')}
                className="text-sm font-semibold text-jurassic-dark/55 hover:text-jurassic-dark transition-colors underline underline-offset-4 decoration-jurassic-dark/20 hover:decoration-jurassic-dark/50"
              >
                {content.cta.pilotCta}
              </button>
              <span className="text-jurassic-dark/20 select-none">·</span>
              <button
                type="button"
                onClick={() => onNavigate('/worldwise')}
                className="text-sm font-semibold text-jurassic-dark/55 hover:text-jurassic-dark transition-colors underline underline-offset-4 decoration-jurassic-dark/20 hover:decoration-jurassic-dark/50"
              >
                {content.cta.worldwiseCta}
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
