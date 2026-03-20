export const Footer = () => {
  const footerLinks = [
    { label: 'Framework', href: '/framework' },
    { label: 'Get Started', href: '/get-started' },
    { label: 'Contact', href: 'mailto:info@jurassicenglish.com' },
  ];

  return (
    <footer className="bg-white py-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <span className="text-xl font-display text-jurassic-dark">
              Jurassic English<span className="text-xs align-top">™</span>
            </span>
            <p className="text-xs text-gray-400 mt-2">
              © 2026 Jurassic English™. All rights reserved.
            </p>
          </div>
          
          <div className="flex gap-8 flex-wrap justify-center">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-jurassic-dark"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-50 text-[10px] text-gray-400 text-center max-w-4xl mx-auto leading-relaxed">
          Jurassic English™ is published by World Wise Learning. Jurassic English™ is not affiliated with, licensed by, or endorsed by any book author, illustrator, or publisher whose works are featured in the curriculum series.
        </div>
      </div>
    </footer>
  );
};
