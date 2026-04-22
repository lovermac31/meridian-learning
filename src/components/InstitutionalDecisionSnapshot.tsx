import { ArrowRight, ClipboardCheck, Layers, Map, School } from 'lucide-react';
import { motion } from 'motion/react';
import { getHomeContent } from '../i18n/content/home';
import { getCurrentLocale } from '../i18n/routing';
import { trackCtaClick } from '../lib/analytics';

type InstitutionalDecisionSnapshotProps = {
  onAuditSprint: () => void;
  onDiscoveryCall: () => void;
  onCurriculumOverview: () => void;
};

const snapshotIcons = [
  <ClipboardCheck className="h-5 w-5" aria-hidden="true" />,
  <School className="h-5 w-5" aria-hidden="true" />,
  <Layers className="h-5 w-5" aria-hidden="true" />,
  <Map className="h-5 w-5" aria-hidden="true" />,
] as const;

export const InstitutionalDecisionSnapshot = ({
  onAuditSprint,
  onDiscoveryCall,
  onCurriculumOverview,
}: InstitutionalDecisionSnapshotProps) => {
  const locale = getCurrentLocale();
  const homeContent = getHomeContent(locale) ?? getHomeContent('en');

  if (!homeContent) {
    return null;
  }

  const { decisionSnapshot } = homeContent;

  return (
    <section
      aria-labelledby="institutional-decision-snapshot-title"
      className="relative overflow-hidden bg-[#f8f1e5] py-14 sm:py-16 lg:py-20"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c8ad78]/70 to-transparent" />
      <div className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-jurassic-gold/10 blur-3xl" />
      <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-jurassic-accent/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55 }}
          className="grid gap-8 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-end"
        >
          <div className="max-w-3xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-jurassic-accent">
              {decisionSnapshot.eyebrow}
            </p>
            <h2
              id="institutional-decision-snapshot-title"
              className="text-[2rem] font-bold leading-[1.04] tracking-tight text-jurassic-dark sm:text-4xl lg:text-5xl"
            >
              {decisionSnapshot.headline}
            </h2>
          </div>

          <p className="max-w-2xl text-base leading-8 text-gray-700 sm:text-lg">
            {decisionSnapshot.subheadline}
          </p>
        </motion.div>

        <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {decisionSnapshot.cards.map((card, index) => (
            <motion.article
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: index * 0.05, duration: 0.45 }}
              className="group h-full rounded-[1.4rem] border border-[#dbc6a6] bg-white/80 p-5 shadow-premium backdrop-blur-sm transition-transform hover:-translate-y-1"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-jurassic-dark text-jurassic-gold shadow-sm transition-colors group-hover:bg-jurassic-accent group-hover:text-white">
                {snapshotIcons[index]}
              </div>
              <h3 className="mb-3 text-lg font-bold tracking-tight text-jurassic-dark">
                {card.title}
              </h3>
              <p className="text-sm leading-7 text-gray-600">
                {card.body}
              </p>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ delay: 0.12, duration: 0.5 }}
          className="mt-8 flex flex-col gap-3 rounded-[1.6rem] border border-[#d5bc92] bg-jurassic-dark p-4 shadow-premium sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button
              onClick={() => {
                trackCtaClick({ label: decisionSnapshot.primaryCta, type: 'primary', segment: 'institutional_snapshot' });
                onAuditSprint();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-jurassic-accent px-6 py-3 text-sm font-bold text-white shadow-premium transition-transform hover:-translate-y-0.5"
            >
              {decisionSnapshot.primaryCta}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              onClick={() => {
                trackCtaClick({ label: decisionSnapshot.secondaryCta, type: 'secondary', segment: 'institutional_snapshot' });
                onDiscoveryCall();
              }}
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              {decisionSnapshot.secondaryCta}
            </button>
          </div>

          <button
            onClick={() => {
              trackCtaClick({ label: decisionSnapshot.overviewCta, type: 'low_friction', segment: 'institutional_snapshot' });
              onCurriculumOverview();
            }}
            className="text-left text-sm font-semibold text-white/65 underline underline-offset-4 transition-colors hover:text-white sm:text-right"
          >
            {decisionSnapshot.overviewCta}
          </button>
        </motion.div>
      </div>
    </section>
  );
};
