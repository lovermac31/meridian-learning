import { motion } from 'motion/react';
import { TriceratopsIcon } from './Icons';
import { ChevronRight } from 'lucide-react';

export const SeriesSection = () => {
  const levels = [
    { name: "Foundation", age: "6–8", cefr: "Pre-A1/A1", focus: "Picture books and predictable narratives", color: "border-l-jurassic-accent" },
    { name: "Development", age: "8–10", cefr: "A1/A2", focus: "Early chapter books with clear moral dilemmas", color: "border-l-amber-500" },
    { name: "Expansion", age: "10–12", cefr: "A2/B1", focus: "Chapter books with ambiguous endings", color: "border-l-jurassic-gold" },
    { name: "Mastery", age: "12–14", cefr: "B1/B2", focus: "Full novels and contested interpretations", color: "border-l-teal-500" },
    { name: "Advanced", age: "14+", cefr: "B2/C1", focus: "Diverse genres — memoir, satire, postcolonial fiction", color: "border-l-jurassic-blue" },
  ];

  return (
    <section id="series" className="py-28 bg-white relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-1/2 left-0 w-80 h-80 text-jurassic-dark/[0.01] pointer-events-none -translate-x-1/2">
        <TriceratopsIcon className="w-full h-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
              Curriculum Map
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-jurassic-dark">The Jurassic English<span className="text-xl align-top text-jurassic-accent">™</span> Series</h2>
            <p className="text-gray-600 font-light leading-relaxed">
              A complete, vertically aligned curriculum — from first stories to full novels. Each level contains 10 literary works, 4 lessons per book, and a full assessment suite.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-jurassic-soft/30 backdrop-blur-sm border border-jurassic-soft px-5 py-3 rounded-2xl text-center">
              <div className="text-3xl font-bold text-jurassic-dark">40</div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Lessons / Year</div>
            </div>
            <div className="bg-jurassic-soft/30 backdrop-blur-sm border border-jurassic-soft px-5 py-3 rounded-2xl text-center">
              <div className="text-3xl font-bold text-jurassic-dark">10</div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Core Texts</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {levels.map((level, i) => (
            <motion.div 
              key={level.name} 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`group bg-white rounded-2xl border border-gray-100 border-l-4 ${level.color} shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-premium hover:scale-[1.01] transition-all duration-300 cursor-pointer`}
            >
              <div className="flex items-center gap-6">
                <div className="text-2xl font-black text-gray-100 font-sans group-hover:text-jurassic-soft transition-colors text-right w-12">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-jurassic-dark">{level.name}</h3>
                  <p className="text-sm text-gray-400 font-medium">Age {level.age} <span className="mx-1.5 text-jurassic-accent">•</span> CEFR {level.cefr}</p>
                </div>
              </div>
              
              <div className="md:w-1/2">
                <p className="text-gray-700 text-sm font-medium leading-relaxed">
                  {level.focus}
                </p>
              </div>

              <div className="flex items-center justify-end text-jurassic-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-xs font-bold mr-1">View Syllabus</span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
