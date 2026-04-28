import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight, GraduationCap, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Audit Sprint', path: '/audit-sprint' },
    { name: 'Evidence Dashboard', path: '/evidence-dashboard' },
    { name: 'Pilot Journey', path: '/pilot-journey' },
    { name: 'Readiness Qualifier', path: '/readiness-qualifier' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-emerald-600 p-1.5 rounded-lg">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <div className="flex items-center">
              <span className="font-bold text-lg tracking-tight text-slate-900 group">
                JURASSIC<span className="text-emerald-600 italic">ENGLISH</span>
              </span>
              <span className="hidden sm:block ml-3 text-[10px] font-semibold text-slate-400 uppercase tracking-widest border-l pl-3 border-slate-200">
                B2B Advisory Engine
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === item.path ? 'text-black font-semibold' : 'text-gray-500 hover:text-black'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/get-started"
              className="px-4 py-2 bg-black text-white text-sm font-medium rounded-sm hover:bg-gray-800 transition-colors"
            >
              Get Started
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-500 hover:text-black p-2"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-4 text-base font-medium text-gray-900 border-b border-gray-50 flex items-center justify-between"
                >
                  {item.name}
                  <ChevronRight size={16} className="text-gray-400" />
                </Link>
              ))}
              <Link
                to="/get-started"
                className="mt-4 block px-3 py-4 text-center bg-black text-white font-medium rounded-sm"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
