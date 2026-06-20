import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { getCurrentLocale } from '../i18n/routing';
import { getUiString } from '../i18n/ui';

type ComingSoonModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
};

/**
 * Lightweight Coming Soon modal — pattern mirrors PricingModal.tsx for
 * accessibility (escape close, overlay close, focus trap, body scroll lock,
 * motion entry/exit) but renders a simple message + Close + Contact Us
 * buttons. Used by the Education Affiliate Program nav entry until the
 * partner pathway is published.
 */
export function ComingSoonModal({
  isOpen,
  onClose,
  onNavigate,
}: ComingSoonModalProps) {
  const locale = getCurrentLocale();
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Body scroll lock while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Escape closes
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Focus trap + initial focus on first focusable
  useEffect(() => {
    if (!isOpen || !panelRef.current) return;
    const panel = panelRef.current;
    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusable.length > 0) focusable[0].focus();

    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === overlayRef.current) onClose();
  };

  const handleContactUs = () => {
    onClose();
    onNavigate('/get-started');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleOverlayClick}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-label={getUiString(locale, 'comingSoonModal.dialogLabel')}
        >
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[460px] rounded-3xl border border-white/10 bg-gradient-to-b from-[#0f1a26] to-[#131f2e] shadow-[0_32px_64px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)]"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 rounded-full bg-white/5 p-2 text-white/50 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent"
              aria-label={getUiString(locale, 'comingSoonModal.closeModal')}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-7 pb-8">
              <div className="mb-5">
                <span className="block text-jurassic-accent font-bold uppercase tracking-[0.2em] text-[10px] mb-2">
                  Coming Soon
                </span>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {getUiString(locale, 'comingSoonModal.title')}
                </h2>
                <p className="mt-3 text-sm text-white/65 leading-relaxed">
                  {getUiString(locale, 'comingSoonModal.body')}
                </p>
                <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                  <p className="text-xs text-white/50 leading-relaxed">
                    {getUiString(locale, 'comingSoonModal.support')}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 inline-flex items-center justify-center rounded-2xl bg-jurassic-accent px-6 py-3 text-sm font-bold text-white shadow-[0_4px_16px_rgba(242,100,25,0.25)] transition hover:shadow-[0_4px_24px_rgba(242,100,25,0.35)] hover:brightness-110"
                >
                  {getUiString(locale, 'comingSoonModal.close')}
                </button>
                <button
                  type="button"
                  onClick={handleContactUs}
                  className="flex-1 inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
                >
                  {getUiString(locale, 'comingSoonModal.contactUs')}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
