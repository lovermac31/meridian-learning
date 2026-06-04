import { Mail, Globe, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { getCurrentLocale } from '../i18n/routing';
import { getHomeContent } from '../i18n/content/home';

// Phase 11 — pathway destinations mirror the Footer's Phase 9 mapping so
// the same label routes to the same place across the homepage. Order
// matches `homeContent.contact.pathways[]` exactly (5 entries):
//   0 Teacher Training
//   1 School Licensing
//   2 Curriculum Review
//   3 Academic Consulting
//   4 Institutional Partnerships
// All five route through /get-started with an `interest` query so the
// downstream GetStartedPortal can prefill the correct intake form.
const PATHWAY_HREFS = [
  '/get-started?interest=teacher_training',
  '/get-started?interest=school_licensing',
  '/get-started?interest=curriculum_review',
  '/get-started?interest=consulting',
  '/get-started?interest=partnership',
] as const;

export const Contact = () => {
  const locale = getCurrentLocale();
  const homeContent = getHomeContent(locale) ?? getHomeContent('en');

  if (!homeContent) {
    return null;
  }

  // Phase 11 — soft SPA navigation without adding an onNavigate prop
  // (which would force a touch on App.tsx). Mirrors the click-handler
  // pattern in Footer.tsx: preventDefault, pushState, dispatch popstate
  // so App.tsx's existing `popstate` listener picks up the new route
  // and re-renders. Falls back to a normal href follow if pushState
  // somehow throws (e.g. cross-origin).
  const handlePathwayClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    event.preventDefault();
    try {
      window.history.pushState({}, '', href);
      window.scrollTo({ top: 0, behavior: 'auto' });
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch {
      window.location.href = href;
    }
  };

  return (
    <section id="contact" className="py-28 bg-jurassic-soft/30 backdrop-blur-sm relative overflow-hidden border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="bg-white rounded-3xl shadow-premium overflow-hidden flex flex-col md:flex-row border border-gray-100">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:w-1/2 p-12 md:p-16 flex flex-col justify-center"
          >
            <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
              {homeContent.contact.eyebrow}
            </span>
            <h2 className="text-4xl font-bold mb-6 tracking-tight text-jurassic-dark">{homeContent.contact.title}</h2>
            <p className="text-gray-600 mb-10 leading-relaxed font-light">
              {homeContent.contact.body}
            </p>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 bg-jurassic-soft/20 p-4 rounded-xl border border-transparent hover:border-jurassic-soft transition-all">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-jurassic-accent shadow-sm">
                  <Mail aria-hidden="true" className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{homeContent.contact.emailLabel}</div>
                  <a href="mailto:info@jurassicenglish.com" className="rounded-md text-base font-semibold text-jurassic-dark hover:text-jurassic-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2">info@jurassicenglish.com</a>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-jurassic-soft/20 p-4 rounded-xl border border-transparent hover:border-jurassic-soft transition-all">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-jurassic-accent shadow-sm">
                  <Globe aria-hidden="true" className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{homeContent.contact.websiteLabel}</div>
                  <a href="https://www.jurassicenglish.com" className="rounded-md text-base font-semibold text-jurassic-dark hover:text-jurassic-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2">www.jurassicenglish.com</a>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="md:w-1/2 bg-jurassic-dark p-12 md:p-16 text-white flex flex-col justify-center bg-gradient-to-br from-jurassic-dark via-jurassic-dark to-black"
          >
            <h3 className="text-2xl font-bold mb-8 tracking-tight border-b border-white/10 pb-4">{homeContent.contact.pathwaysTitle}</h3>
            <div className="space-y-6">
              {homeContent.contact.pathways.map((item, i) => (
                <a
                  key={i}
                  href={PATHWAY_HREFS[i]}
                  onClick={(e) => handlePathwayClick(e, PATHWAY_HREFS[i])}
                  className="group block border-b border-white/5 pb-4 last:border-b-0 last:pb-0 hover:bg-white/5 p-3 rounded-xl transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-jurassic-dark"
                >
                  <h4 className="font-bold text-jurassic-accent mb-1 flex items-center gap-1 group-hover:text-jurassic-gold transition-colors text-sm">
                    {item.title} <ChevronRight aria-hidden="true" className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </h4>
                  <p className="text-white/55 text-xs font-light">{item.desc}</p>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
