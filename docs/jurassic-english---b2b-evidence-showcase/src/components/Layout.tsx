import { ReactNode } from 'react';
import Header from './Header';
import { ShieldCheck } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Header />
      <main>
        {children}
      </main>
      <footer className="bg-white border-t border-slate-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 p-1 rounded-md">
                <ShieldCheck className="text-white w-4 h-4" />
              </div>
              <span className="font-bold text-sm tracking-tight text-slate-900">JURASSIC<span className="text-emerald-600 italic">ENGLISH</span></span>
            </div>
            <div className="flex gap-8 text-xs text-slate-500 font-medium tracking-tight">
              <a href="#" className="hover:text-slate-900">Institutional Privacy</a>
              <a href="#" className="hover:text-slate-900">Evaluation Framework</a>
              <a href="#" className="hover:text-slate-900">Board Briefing</a>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
              © 2026 Jurassic English. Institutional Evaluation Framework. Confidential & Restricted.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
