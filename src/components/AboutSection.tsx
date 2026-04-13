import { motion } from 'motion/react';
import { BookOpen, RefreshCw, Users, Globe } from 'lucide-react';
import { EcologyIcon } from './Icons';
import { getHomeContent } from '../i18n/content/home';
import { getCurrentLocale } from '../i18n/routing';

export const AboutSection = () => {
  const locale = getCurrentLocale();
  const homeContent = getHomeContent(locale) ?? getHomeContent('en');

  if (!homeContent) {
    return null;
  }

  const proofSignals = [
    { icon: <BookOpen className="text-jurassic-accent w-5 h-5" />, text: homeContent.about.proofSignals[0] },
    { icon: <RefreshCw className="text-jurassic-accent w-5 h-5" />, text: homeContent.about.proofSignals[1] },
    { icon: <Users className="text-jurassic-accent w-5 h-5" />, text: homeContent.about.proofSignals[2] },
    { icon: <Globe className="text-jurassic-accent w-5 h-5" />, text: homeContent.about.proofSignals[3] },
  ];

  return (
    <section id="about" className="py-14 md:py-20 xl:py-28 bg-white relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute -top-24 -left-24 w-96 h-96 text-jurassic-dark/[0.02] pointer-events-none">
        <EcologyIcon className="w-full h-full" />
      </div>

      <div className="max-w-[88rem] mx-auto px-6 relative z-10">
        <div className="grid xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] gap-8 md:gap-10 xl:gap-14 items-start">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: -20 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="relative max-w-2xl xl:max-w-none order-2 xl:order-1"
          >
            <div className="aspect-[1.35] sm:aspect-[1.2] md:aspect-[1.1] lg:aspect-[0.88] rounded-2xl lg:rounded-[2rem] overflow-hidden shadow-premium group border border-jurassic-soft/40 bg-jurassic-soft/20">
              <picture>
                <source
                  srcSet="
                    /images/about-institutional-400.webp   400w,
                    /images/about-institutional-800.webp   800w,
                    /images/about-institutional-1400.webp 1400w,
                    /images/about-institutional.webp      2528w
                  "
                  sizes="(min-width: 1280px) 665px, (min-width: 640px) 50vw, 100vw"
                  type="image/webp"
                />
                {/* JPEG fallback with responsive srcset */}
                <img
                  src="/images/about-institutional.jpg"
                  srcSet="
                    /images/about-institutional-400.jpg   400w,
                    /images/about-institutional-800.jpg   800w,
                    /images/about-institutional-1400.jpg 1400w,
                    /images/about-institutional.jpg      2528w
                  "
                  sizes="(min-width: 1280px) 665px, (min-width: 640px) 50vw, 100vw"
                  alt="Jurassic English — curated book collection with paleontology field notes and amber fossil"
                  width={2528}
                  height={1684}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </picture>
            </div>
            <div className="absolute -bottom-4 right-4 lg:-bottom-5 lg:right-5 xl:-bottom-6 xl:right-6 bg-jurassic-dark/95 p-5 rounded-[1.2rem] shadow-premium max-w-[16rem] hidden lg:block border border-[#8e7448]/40">
              <p className="text-white font-serif italic text-base xl:text-lg leading-relaxed">
                {homeContent.about.quote}
              </p>
              <div className="mt-3 text-jurassic-accent text-[11px] font-semibold tracking-[0.18em] uppercase">{homeContent.about.quoteAttribution}</div>
            </div>
          </motion.div>

          <div className="xl:pl-2 order-1 xl:order-2">
            <div className="max-w-4xl">
              <span className="text-jurassic-accent font-bold uppercase tracking-[0.22em] text-xs mb-3 md:mb-4 block">
                {homeContent.about.eyebrow}
              </span>
              <h2 className="text-[1.85rem] sm:text-4xl md:text-5xl xl:text-[3.6rem] font-bold mb-4 md:mb-5 tracking-tight text-jurassic-dark leading-[1.05]">
                {homeContent.about.title}
              </h2>

              <div className="space-y-3 md:space-y-4 text-base md:text-lg text-gray-700 leading-relaxed font-light max-w-3xl">
                {homeContent.about.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-5 md:mt-6 xl:mt-8 relative">
                <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
                  {proofSignals.map((item, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      viewport={{ once: true }}
                      className="rounded-xl md:rounded-[1.25rem] border border-jurassic-soft/70 bg-jurassic-soft/15 p-3 md:p-3.5 xl:p-4 shadow-premium min-h-0 md:min-h-[4.75rem] flex items-center"
                    >
                      <div className="flex items-start gap-3 xl:gap-4">
                        <div className="mt-0.5 w-9 h-9 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                          {item.icon}
                        </div>
                        <span className="text-sm xl:text-[15px] font-semibold leading-6 text-jurassic-dark">{item.text}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="hidden xl:block pointer-events-none absolute inset-0">
                  <div className="absolute left-1/2 top-[34%] h-[1px] w-8 -translate-x-1/2 bg-[#c7b08a]/60" />
                  <div className="absolute left-1/2 top-[66%] h-[1px] w-8 -translate-x-1/2 bg-[#c7b08a]/60" />
                  <div className="absolute top-1/2 left-[34%] w-[1px] h-8 -translate-y-1/2 bg-[#c7b08a]/60" />
                  <div className="absolute top-1/2 right-[34%] w-[1px] h-8 -translate-y-1/2 bg-[#c7b08a]/60" />
                </div>
              </div>

              <div className="mt-3 md:mt-4 grid lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] gap-3 md:gap-4 items-stretch">
                <div className="rounded-xl md:rounded-[1.4rem] bg-jurassic-dark text-white p-3.5 md:p-4 border border-jurassic-dark/80 shadow-premium">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/55 font-bold mb-2">
                    {homeContent.about.buyerFitTitle}
                  </p>
                  <p className="text-sm md:text-[15px] font-medium leading-7 text-white/85">
                    {homeContent.about.buyerFitBody}
                  </p>
                </div>

                <div className="rounded-xl md:rounded-[1.45rem] bg-[#f7f0e3] border border-[#d8c3a3] p-3.5 md:p-5 shadow-premium">
                  <p className="text-jurassic-dark text-base md:text-lg lg:text-xl font-medium italic leading-relaxed">
                    {homeContent.about.positioningQuote}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
