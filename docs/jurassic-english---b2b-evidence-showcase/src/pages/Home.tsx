import { motion } from 'motion/react';
import { 
  ArrowRight, 
  BarChart3, 
  ShieldCheck, 
  Target, 
  AlertCircle,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center"
            >
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-8 border border-emerald-100">
                <AlertCircle size={14} /> Not a Software Trial
              </div>
              
              <h1 className="text-5xl md:text-7xl font-sans font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-8">
                Evidence-Led <span className="text-emerald-600 underline decoration-emerald-200 decoration-8 underline-offset-8">Adoption Readiness</span> <br />
                <span className="text-slate-400">for Institutional Leaders.</span>
              </h1>
              
              <p className="text-xl text-slate-600 font-medium leading-relaxed mb-12 max-w-2xl mx-auto">
                Jurassic English is not an "app" to be explored, but a governed 8-week institutional framework. We help you move from open-ended experiments to board-ready adoption evidence.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/audit-sprint"
                  className="px-10 py-5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2 text-lg transform hover:-translate-y-1"
                >
                  Run Institutional Audit Sprint
                  <ArrowRight size={20} />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Institutional Pillars */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 group hover:border-emerald-200 transition-colors">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6 text-emerald-600 group-hover:scale-110 transition-transform">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-xl font-bold font-sans tracking-tight text-slate-900 mb-4">Evidence-First</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                Judged by structured reasoning data and Thinking Cycle™ fidelity, not just classroom enthusiasm or general usage logs.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-colors">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold font-sans tracking-tight text-slate-900 mb-4">Risk Managed</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                Pre-implementation audits ensure operational load is sustainable and your institutional infrastructure is aligned for success.
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 group hover:border-purple-200 transition-colors">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6 text-purple-600 group-hover:scale-110 transition-transform">
                <Target size={24} />
              </div>
              <h3 className="text-xl font-bold font-sans tracking-tight text-slate-900 mb-4">Strategic Goal</h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                Every pilot delivers a clear 'Rollout Recommendation' designed specifically for center owners, principals, and regional boards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="relative z-10 bg-slate-900 p-8 rounded-3xl shadow-2xl overflow-hidden border border-slate-800">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <TrendingUp size={200} className="text-emerald-500" />
                </div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <Sparkles className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em] mb-0.5">Pilot Outcome</div>
                    <div className="text-lg font-bold text-white tracking-tight">Institutional MVP Report</div>
                  </div>
                </div>
                <div className="space-y-4 mb-8">
                  {[45, 82, 68].map((w, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-slate-400">
                        <span>{['Reasoning Fidelity', 'Teacher Adoption', 'Commercial Fit'][i]}</span>
                        <span className="text-emerald-400">{w}%</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${w}%` }}
                          transition={{ duration: 1, delay: i * 0.2 }}
                          className="h-full bg-emerald-500" 
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <p className="text-xs text-emerald-200 italic leading-relaxed">
                    "The pilot produced strong reasoning evidence and high teacher fidelity. Proceed to full Year Group rollout recommended for Academic Year 2026."
                  </p>
                </div>
              </div>
              {/* Backglow */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/20 blur-[80px] rounded-full" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-500/20 blur-[80px] rounded-full" />
            </div>

            <div className="order-1 lg:order-2 space-y-8">
              <h2 className="text-4xl font-sans font-bold tracking-tight text-slate-900 leading-tight">
                Move from "Trial" to <br />
                <span className="text-emerald-600 italic">Governed Adoption.</span>
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="size-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 mt-1">
                    <ShieldCheck size={14} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Board-Ready Intelligence</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">We deliver the data your CFO and Academic Director need to sign off on a long-term commercial commitment.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="size-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0 mt-1">
                    <TrendingUp size={14} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Thinking Cycle™ Integration</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">Our focus is on the classroom ritual. We track how often students are pushed to justify their thinking in English.</p>
                  </div>
                </div>
              </div>
              <Link
                to="/evidence-dashboard"
                className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 hover:gap-4 transition-all"
              >
                Explore Evidence Dashboard <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final Promo */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-sans font-bold tracking-tight mb-8">
            Ready for an Institutional <span className="text-emerald-400">Evaluation?</span>
          </h2>
          <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">
            Run a diagnostic audit of your center's current English volume and reasoning gap before requesting a pilot.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/audit-sprint"
              className="px-10 py-5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all text-lg shadow-xl shadow-emerald-900/20"
            >
              Start Audit Sprint
            </Link>
            <Link
              to="/readiness-qualifier"
              className="px-10 py-5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all text-lg"
            >
              Check Pilot Readiness
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
