import { Users, ShieldCheck, BookOpenCheck, Compass, Handshake } from 'lucide-react';
import { motion } from 'motion/react';
import { getCurrentLocale } from '../i18n/routing';
import { getHomeContent } from '../i18n/content/home';

export const Services = () => {
  const locale = getCurrentLocale();
  const homeContent = getHomeContent(locale) ?? getHomeContent('en');

  if (!homeContent) {
    return null;
  }

  const icons = [
    <Users className="w-6 h-6" />,
    <ShieldCheck className="w-6 h-6" />,
    <BookOpenCheck className="w-6 h-6" />,
    <Compass className="w-6 h-6" />,
    <Handshake className="w-6 h-6" />,
  ];

  const services = homeContent.services.cards.map((service, index) => ({
    ...service,
    icon: icons[index],
  }));

  return (
    <section id="training" className="py-28 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
            {homeContent.services.eyebrow}
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-jurassic-dark">
            {homeContent.services.title}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
            {homeContent.services.body}
          </p>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="grid md:grid-cols-2 xl:grid-cols-5 gap-6"
        >
          {services.map((service, i) => (
            <motion.div 
              key={i} 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="p-8 rounded-2xl bg-jurassic-soft/20 border border-transparent hover:border-jurassic-accent/20 hover:bg-white hover:shadow-premium transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-jurassic-accent group-hover:text-white group-hover:rotate-3 transition-all duration-300 border border-gray-100">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-jurassic-dark tracking-tight">{service.title}</h3>
              <p className="text-xs font-semibold uppercase tracking-widest text-jurassic-accent/80 mb-3">
                {service.audience}
              </p>
              <p className="text-gray-500 text-sm leading-relaxed font-light">
                {service.desc}
              </p>
              <p className="text-sm text-jurassic-dark/80 leading-relaxed mt-4 pt-4 border-t border-gray-100">
                {service.outcome}
              </p>
            </motion.div>
          ))}
        </motion.div>
        
        <div className="mt-20 text-center">
          <p className="text-2xl font-serif italic text-gray-400 max-w-xl mx-auto leading-relaxed">
            {homeContent.services.quote}
          </p>
        </div>
      </div>
    </section>
  );
};
