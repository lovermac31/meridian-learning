import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

type HeroProps = {
  onGetStarted: () => void;
  onExploreFramework: () => void;
};

export const Hero = ({ onGetStarted, onExploreFramework }: HeroProps) => {
  const [heroImageAvailable, setHeroImageAvailable] = useState(true);

  return (
    <section className="relative min-h-screen flex items-end sm:items-center overflow-hidden bg-jurassic-dark pt-28 pb-10 sm:pt-24 sm:pb-0">
      {/* Hero Background — Compass Image */}
      <div className="absolute inset-0 z-0">
        {heroImageAvailable ? (
          <picture>
            <source srcSet="/images/hero-compass.webp" type="image/webp" />
            <img
              src="/images/hero-compass.jpg"
              alt="Jurassic English compass and curated book collection"
              className="w-full h-full object-cover object-[65%_center] md:object-[60%_center] lg:object-[55%_center]"
              fetchPriority="high"
              onError={() => setHeroImageAvailable(false)}
            />
          </picture>
        ) : null}

        {/* Left-to-right gradient overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-jurassic-dark via-jurassic-dark/95 via-[55%] to-jurassic-dark/40 sm:via-jurassic-dark/90 sm:via-[45%] sm:to-jurassic-dark/20 lg:to-transparent" />

        {/* Top/bottom vignette for nav and footer bleed */}
        <div className="absolute inset-0 bg-gradient-to-b from-jurassic-dark/60 via-transparent to-jurassic-dark/80" />

        {/* Subtle warm accent glow top-left */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_30%,rgba(242,100,25,0.08),transparent_50%)]" />

        {/* Fallback dark fill when image fails */}
        {!heroImageAvailable && (
          <div className="absolute inset-0 bg-jurassic-dark" />
        )}
      </div>

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
          className="max-w-3xl"
        >
          <motion.span 
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            className="text-jurassic-accent font-semibold tracking-widest uppercase text-xs mb-4 block"
          >
            World-Class Literature-Based Education
          </motion.span>
          
          <motion.h1 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="font-display text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl text-white leading-[1.0] mb-6 tracking-tight"
          >
            Critical Thinking <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-jurassic-accent to-jurassic-gold">
              Moral Reasoning
            </span> <br />
            Through Literature
          </motion.h1>

          <motion.p 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="text-base sm:text-xl text-white/70 mb-6 sm:mb-10 max-w-lg leading-relaxed font-light"
          >
            Excavate. Analyze. Justify. Reflect. <br />
            Literature-centered English education with pathways for teacher training, school licensing, curriculum review, consulting, and institutional partnerships.
          </motion.p>

          <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="flex flex-wrap gap-4"
          >
            <button
              onClick={onGetStarted}
              className="bg-jurassic-accent text-white px-8 py-4 rounded-full font-bold glow-hover flex items-center gap-2 group shadow-premium"
            >
              Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onExploreFramework}
              className="backdrop-blur-md bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-all"
            >
              Explore the Framework
            </button>
          </motion.div>
          
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            className="mt-8 sm:mt-16 pt-6 sm:pt-8 border-t border-white/5 flex gap-8 items-center"
          >
            <div className="text-white/55 text-xs uppercase tracking-widest font-semibold">Published by</div>
            <div className="text-white/80 font-serif text-lg italic tracking-wide">World Wise Learning</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
