import { useState } from 'react';
import { EcologyIcon } from './Icons';
import { motion } from 'motion/react';
import { getCurrentLocale } from '../i18n/routing';
import { getHomeContent } from '../i18n/content/home';

export const NeuroinclusiveLayer = () => {
  const locale = getCurrentLocale();
  const homeContent = getHomeContent(locale) ?? getHomeContent('en');
  const [imageAvailable, setImageAvailable] = useState(true);

  if (!homeContent) {
    return null;
  }

  return (
    <section className="py-28 bg-jurassic-dark text-white overflow-hidden relative border-t border-white/5">
      {/* Right-side atmospheric image with right-to-left fade */}
      {imageAvailable && (
        <div className="absolute inset-0 pointer-events-none hidden lg:block">
          <div className="absolute top-0 right-0 w-[55%] h-full">
            <picture>
              <source srcSet="/images/about-institutional-1400.webp" type="image/webp" />
              <img
                src="/images/about-institutional-800.jpg"
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover object-center opacity-30"
                onError={() => setImageAvailable(false)}
              />
            </picture>
            {/* Right-to-left fade: image dissolves into the dark background */}
            <div className="absolute inset-0 bg-gradient-to-r from-jurassic-dark via-jurassic-dark/90 via-[35%] to-transparent" />
            {/* Top/bottom vignette for seamless blending */}
            <div className="absolute inset-0 bg-gradient-to-b from-jurassic-dark/60 via-transparent to-jurassic-dark/70" />
          </div>
        </div>
      )}

      {/* Tablet: subtler version */}
      {imageAvailable && (
        <div className="absolute inset-0 pointer-events-none hidden md:block lg:hidden">
          <div className="absolute top-0 right-0 w-[45%] h-full">
            <img
              src="/images/about-institutional-800.jpg"
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover object-center opacity-15"
              onError={() => setImageAvailable(false)}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-jurassic-dark via-jurassic-dark/95 via-[30%] to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-jurassic-dark/70 via-transparent to-jurassic-dark/80" />
          </div>
        </div>
      )}

      {/* Decorative Background */}
      <div className="absolute bottom-0 left-0 w-96 h-96 text-white/[0.02] pointer-events-none -translate-x-1/4 translate-y-1/4">
        <EcologyIcon className="w-full h-full" />
      </div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-3xl">
          <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
            {homeContent.neuroinclusive.eyebrow}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">{homeContent.neuroinclusive.title}</h2>
          <p className="text-xl text-white/70 mb-12 font-light leading-relaxed">
            {homeContent.neuroinclusive.body}
          </p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-dark p-8 rounded-2xl border border-white/10 mb-12 glow-hover"
          >
            <h3 className="text-jurassic-accent font-bold uppercase tracking-widest text-sm mb-4">{homeContent.neuroinclusive.principleTitle}</h3>
            <p className="text-xl italic leading-relaxed font-light text-white/90">
              {homeContent.neuroinclusive.principleQuote}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {homeContent.neuroinclusive.cards.map((box, i) => (
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
