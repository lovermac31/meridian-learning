import { motion } from 'motion/react';
import { JOURNEY_STEPS } from '../constants';
import { ChevronRight, Calendar, Clock, BookOpen, Presentation, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PilotJourney() {
  const icons = [Calendar, Clock, Presentation, BookOpen];

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 animate-in fade-in duration-700">
      <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-slate-200 mb-2">
          Structured Governance
        </div>
        <h2 className="text-4xl md:text-6xl font-sans font-extrabold text-slate-900 tracking-tight leading-[0.9]">
          The 8-Week <br />
          <span className="text-emerald-600 underline">Evaluation Pathway.</span>
        </h2>
        <p className="text-xl text-slate-500 font-medium leading-relaxed">
          Demystifying the institutional pilot from initial scoping through to board-level decision. 
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {/* Horizontal Line (Desktop) */}
        <div className="hidden lg:block absolute top-[52px] left-0 right-0 h-0.5 bg-slate-100 -z-0" />
        
        {JOURNEY_STEPS.map((step, i) => {
          const Icon = icons[i];
          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="relative z-10 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-100/50 transition-all group flex flex-col h-full"
            >
              <div className="size-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-lg mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-slate-200">
                <Icon size={24} />
              </div>
              
              <div className="space-y-4 flex-1">
                <div>
                  <div className="text-emerald-600 text-[10px] font-black uppercase mb-1 tracking-[0.2em]">{step.week}</div>
                  <h4 className="font-bold text-xl text-slate-900 tracking-tight mb-2 group-hover:text-emerald-900 transition-colors">{step.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed italic">{step.desc}</p>
                </div>

                <ul className="space-y-3 border-t border-slate-50 pt-6">
                  {step.items.map((item, idx) => (
                    <li key={idx} className="text-[10px] text-slate-400 font-black uppercase flex items-center gap-3 tracking-wider">
                      <div className="size-2 bg-emerald-500 rounded-full shrink-0 animate-pulse" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-24 max-w-4xl mx-auto">
        <div className="bg-slate-900 rounded-[2.5rem] p-12 overflow-hidden relative border border-slate-800 shadow-2xl">
          {/* Accent Blobs */}
          <div className="absolute top-0 right-0 size-80 bg-emerald-600/10 blur-[100px] rounded-full -mr-40 -mt-40" />
          <div className="absolute bottom-0 left-0 size-80 bg-blue-600/10 blur-[100px] rounded-full -ml-40 -mb-40" />

          <div className="relative z-10 text-center space-y-8">
            <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
              Ready to verify your institutional <span className="text-emerald-400">Readiness Gap?</span>
            </h3>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Our final protocol check verifies the anchors required for a 100% success rate during the 8-week window.
            </p>
            <div className="pt-4">
              <Link 
                to="/readiness-qualifier"
                className="inline-flex items-center gap-3 px-10 py-5 bg-emerald-600 text-white font-black uppercase text-xs tracking-[0.3em] hover:bg-emerald-500 transition-all rounded-2xl shadow-xl shadow-emerald-950/40 group"
              >
                Launch Final Readiness Qualifier
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
