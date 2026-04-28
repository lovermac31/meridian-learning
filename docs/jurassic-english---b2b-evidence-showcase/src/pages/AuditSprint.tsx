import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ArrowRight, CheckCircle2, ChevronLeft, BarChart, AlertCircle } from 'lucide-react';
import { AUDIT_STEPS } from '../constants';
import { Link, useNavigate } from 'react-router-dom';

export default function AuditSprint() {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();

  const handleSelect = (idx: number) => {
    const newAnswers = { ...answers, [step]: idx };
    setAnswers(newAnswers);
    if (step < AUDIT_STEPS.length) {
      setStep(step + 1);
    } else {
      setIsComplete(true);
    }
  };

  // Determine recommendation based on answers
  // For the demo, we use a simple heuristic
  const totalScore = (Object.values(answers) as number[]).reduce((a, b) => a + b, 0);
  const isHighReady = totalScore <= 2; // Low values in the new array actually imply higher gap/need

  if (isComplete) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-in fade-in zoom-in duration-500">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-slate-200 p-12 shadow-2xl rounded-3xl"
        >
          <div className="w-16 h-16 bg-emerald-600 text-white flex items-center justify-center rounded-2xl mx-auto mb-8 shadow-lg shadow-emerald-200">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-3xl font-sans font-bold tracking-tight text-slate-900 mb-4">Diagnostic Assessment Complete</h1>
          <p className="text-slate-500 mb-10 text-lg">Your institutional profile has been analyzed. Recommended pathway:</p>
          
          <div className="px-8 py-5 bg-slate-900 border border-slate-800 rounded-2xl mb-12 inline-block">
             <span className="text-2xl font-black uppercase tracking-tight text-white italic">
               {isHighReady ? 'Advisory-First Pilot' : 'Discovery Call'}
             </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left mb-12">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-2">Evidence Profile</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Your data indicates a strong "Reasoning Gap" that fits the Jurassic English advisory parameters.
              </p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <h3 className="font-bold text-slate-900 mb-2">Next Critical Step</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                We need to verify your center's physical and operational setup before final pilot approval.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={isHighReady ? "/readiness-qualifier" : "/get-started"}
              className="px-10 py-5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
            >
              {isHighReady ? 'Qualify for Pilot' : 'Book Discovery Call'}
              <ArrowRight size={18} />
            </Link>
            <button
              onClick={() => {
                setStep(1);
                setAnswers({});
                setIsComplete(false);
              }}
              className="px-10 py-5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:border-slate-900 hover:text-slate-900 transition-all"
            >
              Restart Audit
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentStep = AUDIT_STEPS[step - 1];

  return (
    <div className="max-w-2xl mx-auto px-4 py-20">
      <div className="mb-12">
        <div className="flex justify-between items-end mb-4">
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Diagnostic Phase</div>
            <div className="text-xs font-bold text-slate-900">Step {step} of {AUDIT_STEPS.length}</div>
          </div>
          <div className="text-[10px] font-mono text-slate-400 italic">Audit in Progress</div>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-emerald-600" 
            initial={{ width: 0 }}
            animate={{ width: `${(step / AUDIT_STEPS.length) * 100}%` }}
          />
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div 
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl"
        >
          <div className="flex gap-4 items-start mb-10">
            <div className="size-10 bg-emerald-100 rounded-xl flex items-center justify-center font-black text-emerald-700 flex-shrink-0">
               0{step}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 leading-tight mb-2">{currentStep.q}</h2>
              <p className="text-slate-500 text-sm">{currentStep.desc}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {currentStep.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className="w-full text-left p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-lg hover:shadow-emerald-100/50 transition-all group relative overflow-hidden"
              >
                <div className="flex justify-between items-center relative z-10">
                  <span className="font-bold text-slate-700 group-hover:text-emerald-900">{opt}</span>
                  <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <AlertCircle size={16} className="text-slate-400 shrink-0" />
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 leading-tight">
              Honest data input ensures valid pilot pathway recommendation.
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <BarChart size={14} className="text-emerald-600" />
          Real-time Scoring Active
        </div>
      </div>
    </div>
  );
}
