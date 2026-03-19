import { Brain } from 'lucide-react';
import { EcologyIcon } from './Icons';
import { motion } from 'motion/react';

export const NeuroinclusiveLayer = () => {
  return (
    <section className="py-28 bg-jurassic-dark text-white overflow-hidden relative border-t border-white/5">
      <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none">
        <Brain className="w-full h-full" />
      </div>
      
      {/* Decorative Background */}
      <div className="absolute bottom-0 left-0 w-96 h-96 text-white/[0.02] pointer-events-none -translate-x-1/4 translate-y-1/4">
        <EcologyIcon className="w-full h-full" />
      </div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-3xl">
          <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
            Accessibility & Inclusion
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">Built for Every Learner</h2>
          <p className="text-xl text-white/70 mb-12 font-light leading-relaxed">
            Jurassic English™ Version 2.1 introduces the most comprehensive neuroinclusive layer in any literature-based English framework.
          </p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-dark p-8 rounded-2xl border border-white/10 mb-12 glow-hover"
          >
            <h3 className="text-jurassic-accent font-bold uppercase tracking-widest text-sm mb-4">The Regulation-Before-Reasoning Principle</h3>
            <p className="text-xl italic leading-relaxed font-light text-white/90">
              "Cognitive performance is state-dependent. A learner who is physiologically dysregulated does not have access to higher-order reasoning. We address the state before demanding the task."
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "For ADHD Learners",
                items: ["Movement & sensory supports", "Visual countdown timers", "Oral rehearsal before writing", "Writing-sprint protocol"]
              },
              {
                title: "For Anxiety-Sensitive",
                items: ["Private reflection options", "No cold-calling protocols", "Predictable task architecture", "Inclusive choice boards"]
              },
              {
                title: "For All Learners",
                items: ["30–90s regulation resets", "Visual visual agendas", "Accommodated reasoning", "Sensory-load adjustments"]
              }
            ].map((box, i) => (
              <motion.div 
                key={box.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors duration-300"
              >
                <h4 className="font-bold text-lg mb-4 text-jurassic-accent border-b border-white/5 pb-2 font-sans">{box.title}</h4>
                <ul className="space-y-2.5 text-sm text-white/50 font-light">
                  {box.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-jurassic-accent mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
