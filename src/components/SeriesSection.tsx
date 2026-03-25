import { motion } from 'motion/react';
import { TriceratopsIcon } from './Icons';
import { ChevronRight } from 'lucide-react';
import { seriesLevels } from '../lib/seriesContent';

type SeriesSectionProps = {
  onSelectLevel: (path: string) => void;
  onCompareLevels: () => void;
};

export const SeriesSection = ({ onSelectLevel, onCompareLevels }: SeriesSectionProps) => {
  const levels = seriesLevels.map((level) => ({
    name: level.title,
    age: level.ageBand,
    cefr: level.cefrRange,
    lessons: level.lessonsPerYear,
    texts: level.coreTexts,
    focus: level.textComplexity,
    color: level.color,
    path: level.path,
  }));

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
              A complete, vertically aligned curriculum — from first stories to full novels. Each syllabus includes 40 structured lessons per academic year and 10 core texts (4 lessons each).
            </p>
            <button
              onClick={onCompareLevels}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-jurassic-soft bg-white px-5 py-3 text-sm font-semibold text-jurassic-dark transition hover:border-jurassic-accent hover:text-jurassic-accent"
            >
              Compare All Levels
              <ChevronRight className="w-4 h-4" />
            </button>
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
            <motion.button 
              key={level.name} 
              type="button"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              onClick={() => onSelectLevel(level.path)}
              className={`group w-full appearance-none rounded-2xl border border-gray-100 border-l-4 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-premium ${level.color} flex flex-col justify-between gap-4 md:flex-row md:items-center`}
            >
              <div className="flex items-center gap-6">
                <div className="text-2xl font-black text-gray-100 font-sans group-hover:text-jurassic-soft transition-colors text-right w-12">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-jurassic-dark">{level.name}</h3>
                  <p className="text-sm text-gray-400 font-medium">Age {level.age} <span className="mx-1.5 text-jurassic-accent">•</span> CEFR {level.cefr}</p>
                  <p className="mt-1 text-xs text-gray-400 font-medium">
                    {level.lessons} <span className="mx-1.5 text-jurassic-accent">•</span> {level.texts}
                  </p>
                </div>
              </div>
              
              <div className="md:w-1/2">
                <p className="text-gray-700 text-sm font-medium leading-relaxed">
                  {level.focus}
                </p>
              </div>

              <div className="flex items-center justify-end text-jurassic-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-xs font-bold mr-1">View Level Details</span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};
