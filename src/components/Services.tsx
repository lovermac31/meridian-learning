import { Users, ShieldCheck, BookOpen, Globe } from 'lucide-react';
import { motion } from 'motion/react';

export const Services = () => {
  const services = [
    { 
      title: "Certified Teacher Training", 
      desc: "Comprehensive training in the Jurassic Thinking Cycle™, lesson architecture, and rubric application.",
      icon: <Users className="w-6 h-6" />
    },
    { 
      title: "Ongoing Site Support", 
      desc: "Academic consultants work directly with schools to ensure fidelity and address implementation challenges.",
      icon: <ShieldCheck className="w-6 h-6" />
    },
    { 
      title: "Digital Resource Hub", 
      desc: "Complete library of lesson plans, vocabulary cards, graphic organizers, and assessment rubrics.",
      icon: <BookOpen className="w-6 h-6" />
    },
    { 
      title: "Teacher Community", 
      desc: "Connect with a global network of educators sharing innovations and student work exemplars.",
      icon: <Globe className="w-6 h-6" />
    },
  ];

  return (
    <section id="training" className="py-28 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-jurassic-accent font-bold uppercase tracking-widest text-xs mb-4 block">
            Professional Development
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-jurassic-dark">Grow With Us</h2>
          <p className="text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
            Jurassic English™ is not just a curriculum. It is a professional community — and we support every teacher, coordinator, and school leader who joins it.
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
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {services.map((service, i) => (
            <motion.div 
              key={i} 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="p-8 rounded-2xl bg-jurassic-soft/20 border border-transparent hover:border-jurassic-accent/20 hover:bg-white hover:shadow-premium transition-all duration-300 group cursor-pointer"
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-jurassic-accent group-hover:text-white group-hover:rotate-3 transition-all duration-300 border border-gray-100">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-jurassic-dark tracking-tight">{service.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-light">
                {service.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
        
        <div className="mt-20 text-center">
          <p className="text-2xl font-serif italic text-gray-400 max-w-xl mx-auto leading-relaxed">
            "We are not a product you purchase. We are a partnership you build."
          </p>
        </div>
      </div>
    </section>
  );
};
