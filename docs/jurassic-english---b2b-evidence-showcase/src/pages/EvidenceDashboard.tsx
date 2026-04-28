import { motion } from 'motion/react';
import { KPIS } from '../constants';
import { LayoutDashboard, ShieldCheck, CheckCircle2, ArrowRight, Download, Zap, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EvidenceDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
            <Zap size={12} /> B2B Proof of Model
          </div>
          <h1 className="text-4xl md:text-5xl font-sans font-extrabold tracking-tight text-slate-900 leading-tight">
            Pilot Evidence <span className="text-slate-400">Dashboard.</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg italic">
            Anonymised Sample Illustration: Final Executive Summary Data.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold text-sm border border-emerald-500 flex items-center gap-2 shadow-xl shadow-emerald-200">
            <ShieldCheck size={18} />
            Rollout Status: RECOMMENDED
          </div>
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest italic">Pilot ID: JE-2026-ALPHA</div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Dimensions Grid */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8 relative overflow-hidden">
          <div className="flex items-center gap-2 font-black text-slate-400 uppercase text-[10px] tracking-[0.3em] mb-4">
            <LayoutDashboard size={16} /> 6 Key Dimensions
          </div>
          <div className="space-y-8">
            {KPIS.map((kpi, i) => (
              <div key={i} className="group cursor-default">
                <div className="flex justify-between items-end mb-2">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 text-sm">{kpi.label}</span>
                    <p className="text-[10px] text-slate-400 font-medium tracking-tight group-hover:text-slate-600 transition-colors">
                      {kpi.desc}
                    </p>
                  </div>
                  <span className="font-mono text-lg font-black text-emerald-600">{kpi.score}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${kpi.score}%` }}
                    transition={{ duration: 1.5, delay: i * 0.1, ease: 'circOut' }}
                    className={`h-full ${kpi.color} group-hover:brightness-110 transition-all`} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Headline Intelligence */}
        <div className="space-y-8 flex flex-col">
          <div className="bg-slate-900 text-white p-10 rounded-3xl shadow-2xl flex-1 flex flex-col justify-between border border-slate-800 relative overflow-hidden">
             {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
               <TrendingUp size={300} />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-4 py-1 rounded-full text-[10px] font-black uppercase mb-8 tracking-[0.2em] border border-emerald-500/30 backdrop-blur-sm">
                Board-Ready Intelligence
              </div>
              
              <h3 className="text-3xl font-bold mb-6 tracking-tight">Headline Finding</h3>
              
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-8 backdrop-blur-sm">
                <p className="text-emerald-100 leading-relaxed italic text-lg border-l-4 border-emerald-500 pl-6">
                  "The pilot produced strong reasoning evidence and high teacher fidelity. 
                  The gap between volume and reasoning was reduced by 34% over 7 weeks. 
                  Proceed to full Year Group rollout recommended for Academic Year 2026."
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 text-sm font-medium">
                  <div className="size-6 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="text-emerald-500" size={14} />
                  </div>
                  <p className="text-slate-300">Reduced teacher planning load by 4.5 hours/week through automated ritualization.</p>
                </div>
                <div className="flex items-start gap-4 text-sm font-medium">
                  <div className="size-6 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="text-emerald-500" size={14} />
                  </div>
                  <p className="text-slate-300">100% Parent survey satisfaction on 'visible reasoning' benchmarks during open days.</p>
                </div>
              </div>
            </div>
            
            <div className="relative z-10 mt-12 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link 
                to="/pilot-journey"
                className="w-full bg-emerald-600 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20"
              >
                The 4-Phase Journey <ArrowRight size={18} />
              </Link>
              <button 
                className="w-full bg-slate-800 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-700 transition-all flex items-center justify-center gap-2 border border-slate-700"
              >
                Download PDF <Download size={18} />
              </button>
            </div>
          </div>
          
          <div className="bg-white border border-slate-100 p-6 rounded-3xl flex items-center gap-4">
            <div className="size-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
               <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-slate-900 font-bold text-sm">Verified Audit Signature</h4>
              <p className="text-slate-400 text-[10px] font-mono leading-tight uppercase tracking-widest">Signed at 2026-04-24T11:19:42Z by JE Advisory Engine</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
