import { motion } from 'motion/react';
import { BookOpen, RefreshCw, Users, Globe } from 'lucide-react';
import { EcologyIcon } from './Icons';

export const AboutSection = () => {
  const proofSignals = [
    { icon: <BookOpen className="text-jurassic-accent w-5 h-5" />, text: 'Literature-centered reasoning framework' },
    { icon: <RefreshCw className="text-jurassic-accent w-5 h-5" />, text: 'Four-stage instructional architecture' },
    { icon: <Users className="text-jurassic-accent w-5 h-5" />, text: 'Governed for fidelity, review, and scale' },
    { icon: <Globe className="text-jurassic-accent w-5 h-5" />, text: 'CEFR / IB / Cambridge / UNESCO ESD aware' },
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
                <source srcSet="/images/about-institutional.webp" type="image/webp" />
                <img
                  src="/images/about-institutional.jpg"
                  alt="Jurassic English — curated book collection with paleontology field notes and amber fossil"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </picture>
            </div>
            <div className="absolute -bottom-4 right-4 lg:-bottom-5 lg:right-5 xl:-bottom-6 xl:right-6 bg-jurassic-dark/95 p-5 rounded-[1.2rem] shadow-premium max-w-[16rem] hidden lg:block border border-[#8e7448]/40">
              <p className="text-white font-serif italic text-base xl:text-lg leading-relaxed">
                "Language is the fossil record of thought."
              </p>
              <div className="mt-3 text-jurassic-accent text-[11px] font-semibold tracking-[0.18em] uppercase">World Wise Learning</div>
            </div>
          </motion.div>

          <div className="xl:pl-2 order-1 xl:order-2">
            <div className="max-w-4xl">
              <span className="text-jurassic-accent font-bold uppercase tracking-[0.22em] text-xs mb-3 md:mb-4 block">
                Institutional Positioning
              </span>
              <h2 className="text-[1.85rem] sm:text-4xl md:text-5xl xl:text-[3.6rem] font-bold mb-4 md:mb-5 tracking-tight text-jurassic-dark leading-[1.05]">
                What is Jurassic English<span className="text-xl align-top text-jurassic-accent">™</span>?
              </h2>

              <div className="space-y-3 md:space-y-4 text-base md:text-lg text-gray-700 leading-relaxed font-light max-w-3xl">
                <p>
                  Jurassic English™ is a literature-centered framework for English, reasoning, and structured intellectual development. It is designed for implementation in real school contexts, and for review, alignment, and scale across programmes, teams, and institutional settings.
                </p>
                <p>
                  Like the fossil record, language preserves layers of human thought, values, and imagination. Jurassic English™ uses literary study to help students examine evidence, develop reasoned judgment, and express their thinking with disciplined clarity and confidence.
                </p>
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
                    Buyer Fit
                  </p>
                  <p className="text-sm md:text-[15px] font-medium leading-7 text-white/85">
                    Built for schools, curriculum leaders, academic reviewers, and institutional partners.
                  </p>
                </div>

                <div className="rounded-xl md:rounded-[1.45rem] bg-[#f7f0e3] border border-[#d8c3a3] p-3.5 md:p-5 shadow-premium">
                  <p className="text-jurassic-dark text-base md:text-lg lg:text-xl font-medium italic leading-relaxed">
                    "This is not traditional English instruction. This is English as an intellectual discipline."
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
