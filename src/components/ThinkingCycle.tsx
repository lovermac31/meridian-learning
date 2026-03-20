import { motion } from 'motion/react';
import { Search, Scale, ShieldCheck, RefreshCw } from 'lucide-react';
import { TriceratopsIcon } from './Icons';

type ThinkingCycleProps = {
  onSelectStage: (path: string) => void;
  onCompareStages: () => void;
};

export const ThinkingCycle = ({ onSelectStage, onCompareStages }: ThinkingCycleProps) => {
  const stages = [
    { 
      title: "ANALYZE", 
      path: "/thinking-cycle/analyze",
      icon: <Search className="w-10 h-10" />, 
      line: "Break the text apart. Find the evidence. Establish what is really there.",
      operation: "Deconstruction of textual elements to establish objective understanding.",
      bloom: "3 (Analysis)",
      target: "Deconstruct",
      slot: "5–15 min",
      glow: "group-hover:text-jurassic-accent"
    },
    { 
      title: "EVALUATE", 
      path: "/thinking-cycle/evaluate",
      icon: <Scale className="w-10 h-10" />, 
      line: "Make a judgment. Apply a standard. Defend it with reason.",
      operation: "Assessment of quality, effectiveness, or morality based on established criteria.",
      bloom: "4 (Evaluation)",
      target: "Judge",
      slot: "15–25 min",
      glow: "group-hover:text-amber-500"
    },
    { 
      title: "JUSTIFY", 
      path: "/thinking-cycle/justify",
      icon: <ShieldCheck className="w-10 h-10" />, 
      line: "Make your claim. Cite your evidence. Explain the connection. Show the impact.",
      operation: "Support claims using textual evidence and rigorous logical reasoning.",
      bloom: "5 (Synthesis / Justification)",
      target: "Construct",
      slot: "25–35 min",
      glow: "group-hover:text-jurassic-gold"
    },
    { 
      title: "REFLECT", 
      path: "/thinking-cycle/reflect",
      icon: <RefreshCw className="w-10 h-10" />, 
      line: "Connect. Transform. Take your thinking beyond the text.",
      operation: "Connection of textual themes to personal experience, broader contexts, ethical principles, and the living world.",
      bloom: "6 (Creation / Metacognition)",
      target: "Transfer",
      slot: "35–40 min",
      glow: "group-hover:text-emerald-500"
    },
  ];

  return (
    <section id="framework" className="py-28 bg-jurassic-dark relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] text-white/[0.02] pointer-events-none translate-x-1/4 translate-y-1/4">
        <TriceratopsIcon className="w-full h-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
        <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
          Operational Framework
        </span>
        <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white tracking-tight">
          The Jurassic Thinking Cycle<span className="text-xl align-top text-jurassic-accent">™</span>
        </h2>
        <p className="text-white/60 max-w-2xl mx-auto mb-20 font-light leading-relaxed">
          The Jurassic Thinking Cycle™ is the operational engine of every lesson. It is a recursive
          cognitive architecture, not a linear checklist. No stage may be skipped, and no lesson is
          complete without all four.
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
            <motion.div 
              key={stage.title}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
              }}
              onClick={() => onSelectStage(stage.path)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelectStage(stage.path);
                }
              }}
              role="button"
              tabIndex={0}
              className="group relative h-full flex"
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
                  <p><span className="text-white/70 font-semibold">Cognitive Operation:</span> {stage.operation}</p>
                  <p><span className="text-white/70 font-semibold">Bloom Level:</span> {stage.bloom}</p>
                  <p><span className="text-white/70 font-semibold">Primary Target:</span> {stage.target}</p>
                  <p><span className="text-white/70 font-semibold">Lesson Slot:</span> {stage.slot}</p>
                </div>
                <p className="mt-5 text-white/45 text-xs leading-relaxed font-light">
                  Four stages. Every lesson. No stage may be skipped.
                </p>
                <div className="mt-auto pt-6 flex items-center gap-2 text-xs font-bold text-jurassic-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Explore Stage</span>
                  <Search className="w-3 h-3" />
                </div>
              </div>
            </motion.div>
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
              <span className="text-jurassic-accent mr-2">●</span> Analyze. Evaluate. Justify. Reflect. Every lesson. No stage may be skipped.
            </p>
          </div>
          <button
            onClick={onCompareStages}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Compare All Stages
            <Search className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};
