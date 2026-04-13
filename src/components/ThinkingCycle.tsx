import { motion } from 'motion/react';
import { Search, Scale, ShieldCheck, RefreshCw } from 'lucide-react';
import { TriceratopsIcon } from './Icons';
import { getCurrentLocale } from '../i18n/routing';
import { getHomeContent } from '../i18n/content/home';
import { getLocalizedThinkingCycleStages } from '../i18n/content/thinkingCycle';

type ThinkingCycleProps = {
  onSelectStage: (path: string) => void;
  onCompareStages: () => void;
};

export const ThinkingCycle = ({ onSelectStage, onCompareStages }: ThinkingCycleProps) => {
  const locale = getCurrentLocale();
  const homeContent = getHomeContent(locale) ?? getHomeContent('en');

  if (!homeContent) {
    return null;
  }

  const iconMap = {
    analyze: <Search className="w-10 h-10" />,
    evaluate: <Scale className="w-10 h-10" />,
    justify: <ShieldCheck className="w-10 h-10" />,
    reflect: <RefreshCw className="w-10 h-10" />,
  } as const;

  const glowMap = {
    analyze: 'group-hover:text-jurassic-accent',
    evaluate: 'group-hover:text-amber-500',
    justify: 'group-hover:text-jurassic-gold',
    reflect: 'group-hover:text-emerald-500',
  } as const;

  const stages = getLocalizedThinkingCycleStages(locale).map((stage) => ({
    title: stage.title,
    path: stage.path,
    icon: iconMap[stage.slug],
    line: stage.line,
    operation: stage.cognitiveOperation,
    bloom: stage.bloomLevel,
    target: stage.primaryTarget,
    slot: stage.lessonSlot,
    glow: glowMap[stage.slug],
  }));

  return (
    <section id="framework" className="py-28 bg-jurassic-dark relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] text-white/[0.02] pointer-events-none translate-x-1/4 translate-y-1/4">
        <TriceratopsIcon className="w-full h-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
        <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
          {homeContent.thinkingCycle.eyebrow}
        </span>
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white tracking-tight">
          {homeContent.thinkingCycle.title}
        </h2>
        <p className="text-white/60 max-w-2xl mx-auto mb-20 font-light leading-relaxed">
          {homeContent.thinkingCycle.body}
        </p>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
          }}
          className="grid md:grid-cols-4 gap-6"
        >
          {stages.map((stage, i) => (
            <motion.button 
              key={stage.title}
              type="button"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
              }}
              onClick={() => onSelectStage(stage.path)}
              className="group relative flex h-full w-full appearance-none bg-transparent p-0 text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl border border-white/5 group-hover:border-white/10 transition-all duration-500 glass-dark" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-jurassic-accent/5 to-transparent rounded-2xl transition-opacity duration-500" />
              
              <div className="relative p-8 flex flex-col items-start text-left w-full h-full z-10 glow-hover">
                <div className={`mb-6 text-white/80 transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3 ${stage.glow}`}>
                  {stage.icon}
                </div>
                <div className="text-white/20 text-4xl font-black absolute top-6 right-8 font-sans">0{i+1}</div>
                <h3 className="text-xl font-bold mb-4 tracking-wider text-white font-sans">{stage.title}</h3>
                <p className="text-white/65 text-sm leading-relaxed font-medium">
                  {stage.line}
                </p>
                <div className="mt-5 space-y-2 text-xs leading-relaxed text-white/50 font-light">
                  <p><span className="text-white/70 font-semibold">{homeContent.thinkingCycle.labels.cognitiveOperation}:</span> {stage.operation}</p>
                  <p><span className="text-white/70 font-semibold">{homeContent.thinkingCycle.labels.bloomLevel}:</span> {stage.bloom}</p>
                  <p><span className="text-white/70 font-semibold">{homeContent.thinkingCycle.labels.primaryTarget}:</span> {stage.target}</p>
                  <p><span className="text-white/70 font-semibold">{homeContent.thinkingCycle.labels.lessonSlot}:</span> {stage.slot}</p>
                </div>
                <p className="mt-5 text-white/55 text-xs leading-relaxed font-light">
                  {homeContent.thinkingCycle.stageNote}
                </p>
                <div className="mt-auto pt-6 flex items-center gap-2 text-xs font-bold text-jurassic-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>{homeContent.thinkingCycle.exploreStageCta}</span>
                  <Search className="w-3 h-3" />
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 flex flex-col items-center gap-4"
        >
          <div className="inline-block glass-dark px-8 py-4 rounded-full border border-white/10">
            <p className="text-sm font-medium text-white/70">
              <span className="text-jurassic-accent mr-2">●</span> {homeContent.thinkingCycle.footerLine}
            </p>
          </div>
          <button
            onClick={onCompareStages}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            {homeContent.thinkingCycle.compareAllCta}
            <Search className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
