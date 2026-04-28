import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QUALIFIER_CRITERIA } from '../constants';
import { 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ShieldCheck, 
  Users, 
  MessageSquare,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ReadinessQualifier() {
  const [checks, setChecks] = useState<Record<string, boolean>>({
    sponsor: false,
    learners: false,
    timeline: false,
    champion: false,
    intent: false
  });

  const allChecked = Object.values(checks).every(v => v === true);
  const checkedCount = Object.values(checks).filter(v => v === true).length;
  
  const toggle = (key: string) => setChecks({...checks, [key]: !checks[key]});

  return (
    <div className="max-w-4xl mx-auto px-4 py-20 space-y-16 animate-in fade-in duration-700">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-emerald-100">
          <Zap size={12} /> Institutional Protocol
        </div>
        <h2 className="text-4xl md:text-6xl font-sans font-extrabold text-slate-900 tracking-tighter leading-[0.9]">
          Qualification <br />
          <span className="text-slate-400 font-medium">Protocol.</span>
        </h2>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Verify your institutional readiness anchors to unlock a formal high-fidelity pilot pathway.
        </p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
        <div className="p-8 md:p-12 space-y-8">
          {QUALIFIER_CRITERIA.map((c) => (
            <motion.div 
              key={c.key} 
              onClick={() => toggle(c.key)}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-start gap-6 p-6 rounded-2xl cursor-pointer transition-all border-2 ${
                checks[c.key] 
                  ? 'border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-100/50' 
                  : 'border-slate-50 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200'
              }`}
            >
              <div className={`mt-1 shrink-0 size-8 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                checks[c.key] ? 'bg-emerald-500 border-emerald-500 rotate-0' : 'border-slate-200 rotate-45'
              }`}>
                {checks[c.key] && <CheckCircle2 className="text-white size-5" strokeWidth={3} />}
              </div>
              <div className="flex-1">
                <h4 className={`font-bold text-lg mb-1 transition-colors ${
                  checks[c.key] ? 'text-emerald-900' : 'text-slate-700'
                }`}>
                  {c.label}
                </h4>
                <p className="text-sm text-slate-500 leading-relaxed max-w-xl">{c.desc}</p>
              </div>
              <div className="hidden sm:block">
                <ChevronRight className={`transition-all ${
                  checks[c.key] ? 'text-emerald-500 translate-x-1' : 'text-slate-200'
                }`} />
              </div>
            </motion.div>
          ))}
        </div>

        <div className={`p-10 border-t transition-all duration-500 ${allChecked ? 'bg-emerald-600' : 'bg-slate-50'}`}>
          <AnimatePresence mode="wait">
            {allChecked ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-white space-y-6"
              >
                <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-sm border border-white/30">
                  Profile Verified
                </div>
                <h3 className="text-3xl font-bold tracking-tight">Institutional MVP Status Confirmed</h3>
                <p className="text-emerald-100 text-lg max-w-md mx-auto leading-relaxed">
                  Your profile meets the high-intent criteria for a 6-8 week Institutional MVP Pilot.
                </p>
                <div className="pt-4">
                  <button className="bg-white text-emerald-700 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-emerald-50 transition-all shadow-xl shadow-emerald-900/40">
                    Request Pilot Consultation
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="pending"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col md:flex-row justify-between items-center gap-8"
              >
                <div className="flex items-center gap-3 text-slate-500 italic text-sm font-medium">
                  <div className="size-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <span className="block font-bold text-slate-700 not-italic">Infrastructure Gaps Detected</span>
                    Missing {5 - checkedCount} criteria? We recommend a Discovery Call first.
                  </div>
                </div>
                <button className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2">
                  Book Consultative Discovery <ArrowRight size={18} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-center sm:text-left">
          <div className="p-8 border border-slate-100 rounded-[2rem] bg-white flex flex-col sm:flex-row items-center gap-6">
             <div className="size-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
               <ShieldCheck size={28} />
             </div>
             <div>
               <h4 className="font-bold text-slate-900 mb-1">Data Sovereignty</h4>
               <p className="text-xs text-slate-400 leading-relaxed">Your readiness audit is held under our B2B Institutional Privacy Framework. Minimal PII required.</p>
             </div>
          </div>
          <div className="p-8 border border-slate-100 rounded-[2rem] bg-white flex flex-col sm:flex-row items-center gap-6">
             <div className="size-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
               <Users size={28} />
             </div>
             <div>
               <h4 className="font-bold text-slate-900 mb-1">Advisory Matching</h4>
               <p className="text-xs text-slate-400 leading-relaxed">Our qualifying logic matches your school type to the correct Advisory Lead (Vietnam or Regional).</p>
             </div>
          </div>
      </div>
    </div>
  );
}
