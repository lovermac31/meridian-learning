import { Mail, Globe, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { getCurrentLocale } from '../i18n/routing';
import { getHomeContent } from '../i18n/content/home';

export const Contact = () => {
  const locale = getCurrentLocale();
  const homeContent = getHomeContent(locale) ?? getHomeContent('en');

  if (!homeContent) {
    return null;
  }

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
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{homeContent.contact.emailLabel}</div>
                  <a href="mailto:info@jurassicenglish.com" className="text-base font-semibold text-jurassic-dark hover:text-jurassic-accent transition-colors">info@jurassicenglish.com</a>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-jurassic-soft/20 p-4 rounded-xl border border-transparent hover:border-jurassic-soft transition-all">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-jurassic-accent shadow-sm">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{homeContent.contact.websiteLabel}</div>
                  <a href="https://jurassicenglish.com" className="text-base font-semibold text-jurassic-dark hover:text-jurassic-accent transition-colors">jurassicenglish.com</a>
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
                <div key={i} className="group cursor-pointer border-b border-white/5 pb-4 last:border-b-0 last:pb-0 hover:bg-white/5 p-3 rounded-xl transition-all duration-300">
                  <h4 className="font-bold text-jurassic-accent mb-1 flex items-center gap-1 group-hover:text-jurassic-gold transition-colors text-sm">
                    {item.title} <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </h4>
                  <p className="text-white/55 text-xs font-light">{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
