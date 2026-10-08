import { useEffect, useState } from 'react';
import { Mail, X } from 'lucide-react';

const WhatsAppIcon = () => <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0 11.7 11.7 0 0 0 2 17.4L.4 23.6l6.4-1.6A11.8 11.8 0 0 0 12.1 24h.1A11.8 11.8 0 0 0 24 12.2a11.7 11.7 0 0 0-3.5-8.7Z"/><path d="M8.5 6.7c.2-.4.4-.4.8-.4h.6c.2 0 .5.1.6.5l.8 2c.1.3.1.5-.1.8l-.5.7c-.2.2-.2.4 0 .7.3.5 1 1.5 2.1 2.4 1.2 1 2.2 1.3 2.5 1.4.3.1.5 0 .7-.2l.8-.9c.2-.2.4-.3.7-.2l2.1 1c.3.1.4.3.3.6-.1.4-.4 1.4-.9 1.8-.5.5-1.2.7-2 .7-.5 0-1.2-.1-2-.4-1.5-.5-2.9-1.4-4.1-2.6-1.2-1.1-2.2-2.4-2.8-3.7-.5-1-.7-1.8-.7-2.4 0-.8.3-1.5.7-2.2Z"/></svg>;
const WeChatIcon = () => <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><path d="M10.1 4.2c-4.2 0-7.6 2.8-7.6 6.3 0 2 1.1 3.8 3 4.9l-.8 2.9 3.1-1.6c.7.2 1.5.3 2.3.3.3 0 .6 0 .9-.1-.1-.4-.2-.8-.2-1.2 0-3.2 3-5.8 6.8-5.8.3 0 .6 0 .9.1-.9-3.3-4.3-5.8-8.4-5.8Zm-3.2 5.1a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8Zm5.8 0a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8Z"/><path d="M17.6 11.2c-3.3 0-6 2-6 4.6s2.7 4.6 6 4.6c.7 0 1.4-.1 2-.3l2.4 1.2-.6-2.2c1.4-.9 2.2-2 2.2-3.3 0-2.6-2.7-4.6-6-4.6Zm-2.2 4.1a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4Zm4.4 0a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4Z"/></svg>;

type Channel = 'zalo' | 'whatsapp' | 'wechat' | 'facebook' | 'email';
const details: Record<Channel, { label: string; href: string; description: string; qr?: string }> = {
  zalo: { label: 'Zalo', href: 'https://zalo.me/84396085076', description: 'Open Zalo in a new tab to start a conversation.' },
  whatsapp: { label: 'WhatsApp', href: '/images/whatsapp-qr.jpg', description: 'Scan this QR code with WhatsApp on your phone.', qr: '/images/whatsapp-qr.jpg' },
  wechat: { label: 'WeChat', href: '/images/wechat-qr.jpg', description: 'Scan this QR code with WeChat on your phone.', qr: '/images/wechat-qr.jpg' },
  facebook: { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61570824718837', description: 'Open our Facebook page in a new tab.' },
  email: { label: 'Email', href: 'mailto:info@jurassicenglish.com?subject=Jurassic%20English%20enquiry', description: 'Open your email app with a new enquiry addressed to us.' },
};

export const GlobalContactPanel = () => {
  const [active, setActive] = useState<Channel | null>(null);
  const close = () => setActive(null);
  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = previous; };
  }, [active]);
  const launch = (channel: Channel) => setActive(channel);
  return <>
    <nav className="fixed bottom-20 left-5 z-[80] flex flex-col items-center gap-2" aria-label="Contact channels">
      <button type="button" onClick={() => launch('zalo')} className="grid h-[42px] w-[42px] place-items-center rounded-full border border-white/25 bg-[#2f66e8] text-[20px] font-bold leading-none text-white shadow-2xl transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-4 focus-visible:ring-offset-jurassic-dark" aria-label="Contact us on Zalo" title="Zalo">Z</button>
      <button type="button" onClick={() => launch('whatsapp')} className="grid h-[42px] w-[42px] place-items-center rounded-full border border-white/25 bg-[#55c96a] text-white shadow-2xl transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-4 focus-visible:ring-offset-jurassic-dark" aria-label="Open WhatsApp contact QR code" title="WhatsApp"><WhatsAppIcon /></button>
      <button type="button" onClick={() => launch('wechat')} className="grid h-[42px] w-[42px] place-items-center rounded-full border border-white/25 bg-[#07c160] text-white shadow-2xl transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-4 focus-visible:ring-offset-jurassic-dark" aria-label="Open WeChat contact QR code" title="WeChat"><WeChatIcon /></button>
      <button type="button" onClick={() => launch('facebook')} className="grid h-[42px] w-[42px] place-items-center rounded-full border border-white/25 bg-[#1877f2] text-[25px] font-bold leading-none text-white shadow-2xl transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-4 focus-visible:ring-offset-jurassic-dark" aria-label="Visit our Facebook page" title="Facebook">f</button>
      <button type="button" onClick={() => launch('email')} className="grid h-[42px] w-[42px] place-items-center rounded-full border border-white/25 bg-jurassic-dark text-white shadow-2xl transition hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-4 focus-visible:ring-offset-jurassic-dark" aria-label="Email Jurassic English" title="Email"><Mail aria-hidden="true" className="h-4 w-4" /></button>
    </nav>
    {active && <div className="fixed inset-0 z-[200] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <section className="relative max-h-[calc(100vh-2rem)] w-full max-w-md overflow-auto rounded-2xl border border-white/20 bg-jurassic-dark p-6 text-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title">
        <button type="button" onClick={close} className="absolute right-4 top-4 rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent" aria-label="Close contact dialog"><X aria-hidden="true" className="h-5 w-5" /></button>
        <p className="pr-10 text-xs font-semibold uppercase tracking-[0.2em] text-jurassic-accent">Contact Jurassic English</p>
        <h2 id="contact-modal-title" className="mt-2 text-2xl font-semibold">{details[active].label}</h2>
        <p className="mt-2 text-sm leading-6 text-white/70">{details[active].description}</p>
        {details[active].qr && <img className="mx-auto mt-5 w-full max-w-[320px] rounded-xl bg-white p-3" src={details[active].qr} alt={`${details[active].label} contact QR code`} />}
        <a href={details[active].href} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-jurassic-accent px-4 py-3 font-semibold text-jurassic-dark transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">{details[active].qr ? `Open ${details[active].label}` : `Continue to ${details[active].label}`} <span aria-hidden="true" className="ml-2">↗</span></a>
      </section>
    </div>}
  </>;
};
