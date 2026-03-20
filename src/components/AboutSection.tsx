import { motion } from 'motion/react';
import { BookOpen, RefreshCw, Users, Globe } from 'lucide-react';
import { EcologyIcon } from './Icons';

export const AboutSection = () => {
  return (
    <section id="about" className="py-28 bg-white relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute -top-24 -left-24 w-96 h-96 text-jurassic-dark/[0.02] pointer-events-none">
        <EcologyIcon className="w-full h-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, x: -20 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="aspect-square rounded-3xl overflow-hidden shadow-premium group">
              <img 
                src="https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=800&q=80" 
                alt="Literature Study" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 bg-jurassic-dark p-8 rounded-2xl shadow-premium max-w-xs hidden lg:block border border-white/5">
              <p className="text-white font-serif italic text-xl leading-relaxed">
                "Language is the fossil record of thought."
              </p>
              <div className="mt-4 text-jurassic-accent text-sm font-semibold tracking-wide">— World Wise Learning</div>
            </div>
          </motion.div>

          <div>
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
              Our Philosophy
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight text-jurassic-dark">What is Jurassic English<span className="text-xl align-top text-jurassic-accent">™</span>?</h2>
            
            <div className="space-y-6 text-lg text-gray-600 leading-relaxed font-light">
              <p>
                Jurassic English™ is an innovative, literature-centered English language and reasoning framework designed to deliver world-class critical thinking education to learners at every stage of development.
              </p>
              <p>
                Like the ancient fossil record, language carries the layered history of human thought, values, and imagination. We teach students to <span className="text-jurassic-dark font-semibold border-b-2 border-jurassic-accent">excavate meaning</span> from text, reason with evidence, and express their thinking with precision and confidence.
              </p>
            </div>
            
            <div className="mt-12 grid grid-cols-2 gap-6">
              {[
                { icon: <BookOpen className="text-jurassic-accent w-5 h-5" />, text: "Literature-centered curriculum" },
                { icon: <RefreshCw className="text-jurassic-accent w-5 h-5" />, text: "Four-stage reasoning framework" },
                { icon: <Users className="text-jurassic-accent w-5 h-5" />, text: "Suitable for ages 6 to adult" },
                { icon: <Globe className="text-jurassic-accent w-5 h-5" />, text: "Globally standards-aligned" },
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="flex gap-3 items-center bg-jurassic-soft/30 p-4 rounded-xl border border-transparent hover:border-jurassic-soft transition-all"
                >
                  <div>{item.icon}</div>
                  <span className="text-sm font-medium text-gray-800">{item.text}</span>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-12 p-6 bg-jurassic-soft/50 rounded-2xl border-l-4 border-jurassic-accent backdrop-blur-sm">
              <p className="text-jurassic-dark font-medium italic">
                "This is not traditional English instruction. This is English as an intellectual discipline."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
