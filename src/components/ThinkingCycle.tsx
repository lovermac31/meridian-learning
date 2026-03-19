import { motion } from 'motion/react';
import { Search, Scale, ShieldCheck, RefreshCw } from 'lucide-react';
import { TriceratopsIcon } from './Icons';

export const ThinkingCycle = () => {
  const stages = [
    { 
      title: "ANALYZE", 
      icon: <Search className="w-10 h-10" />, 
      desc: "Deconstruct text; establish facts, motivations, and prospective alignment.",
      glow: "group-hover:text-jurassic-accent"
    },
    { 
      title: "EVALUATE", 
      icon: <Scale className="w-10 h-10" />, 
      desc: "Assess quality, fairness, or moral value using clear, established standards.",
      glow: "group-hover:text-amber-500"
    },
    { 
      title: "JUSTIFY", 
      icon: <ShieldCheck className="w-10 h-10" />, 
      desc: "Defend claims with specific evidence and rigorous logical reasoning.",
      glow: "group-hover:text-jurassic-gold"
    },
    { 
      title: "REFLECT", 
      icon: <RefreshCw className="w-10 h-10" />, 
      desc: "Connect text to self and world; identify profound shifts in thinking.",
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
          Four stages. Every lesson. No exceptions. Named after the deep-time geological record, the Cycle mirrors how expert thinkers layer understanding.
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
                <p className="text-white/50 text-sm leading-relaxed font-light">
                  {stage.desc}
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
          className="mt-16 inline-block glass-dark px-8 py-4 rounded-full border border-white/10"
        >
          <p className="text-sm font-medium text-white/70">
            <span className="text-jurassic-accent mr-2">●</span> No stage may be skipped. The Cycle is the core operating system of learning.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
