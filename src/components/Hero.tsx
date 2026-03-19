import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { KeyIcon } from './Icons';

export const Hero = () => {
  const [heroImageAvailable, setHeroImageAvailable] = useState(true);

  return (
    <section className="relative h-screen flex items-center overflow-hidden bg-jurassic-dark">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(242,100,25,0.12),transparent_35%),linear-gradient(180deg,rgba(16,24,32,0.72)_0%,rgba(16,24,32,0.94)_55%,rgba(16,24,32,1)_100%)]" />
        {/* TODO: Replace /images/hero-bg.jpg with final branded asset (1920x1080 recommended) */}
        {heroImageAvailable ? (
          <img
            src="/images/hero-bg.jpg"
            alt="Jurassic Landscape"
            className="w-full h-full object-cover opacity-20 scale-105"
            onError={() => setHeroImageAvailable(false)}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-jurassic-dark/70 via-jurassic-dark/95 to-jurassic-dark" />
      </div>

      {/* Decorative Background Living Icon */}
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [12, 10, 12] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
        className="absolute top-1/4 -right-24 w-96 h-96 text-white/[0.03] pointer-events-none transform"
      >
        <KeyIcon className="w-full h-full filter drop-shadow-[0_0_80px_rgba(242,100,25,0.2)]" />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0, x: -50 },
            visible: { 
              opacity: 1, 
              x: 0,
              transition: { staggerChildren: 0.15, duration: 0.8, ease: "easeOut" }
            }
          }}
          className="max-w-2xl"
        >
          <motion.span 
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            className="text-jurassic-accent font-semibold tracking-widest uppercase text-xs mb-4 block"
          >
            World-Class Literature-Based Education
          </motion.span>
          
          <motion.h1 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="text-6xl md:text-8xl text-white font-bold leading-[1.1] mb-6 tracking-tight"
          >
            Critical Thinking <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-jurassic-accent to-jurassic-gold italic">
              Moral Reasoning
            </span> <br />
            Through Text
          </motion.h1>

          <motion.p 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="text-xl text-white/70 mb-10 max-w-lg leading-relaxed font-light"
          >
            Excavate. Analyze. Justify. Reflect. <br />
            A framework for learners who believe language is not just a skill—it is a tool for thought.
          </motion.p>

          <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="flex flex-wrap gap-4"
          >
            <button className="bg-jurassic-accent text-white px-8 py-4 rounded-full font-bold glow-hover flex items-center gap-2 group shadow-premium">
              Begin the Excavation <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="backdrop-blur-md bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-all">
              Watch the Framework
            </button>
          </motion.div>
          
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="mt-16 pt-8 border-t border-white/5 flex gap-8 items-center"
          >
            <div className="text-white/40 text-xs uppercase tracking-widest font-semibold">Published by</div>
            <div className="text-white/80 font-serif text-lg italic tracking-wide">The Jurassic English™ Academic Board</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
