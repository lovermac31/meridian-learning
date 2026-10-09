import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';
import { Mail, MessageCircle, X } from 'lucide-react';
import { getCurrentLocale } from '../i18n/routing';

const WhatsAppIcon = () => <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.9"><path d="M20.5 3.5A11.8 11.8 0 0 0 12.1 0 11.7 11.7 0 0 0 2 17.4L.4 23.6l6.4-1.6A11.8 11.8 0 0 0 12.1 24h.1A11.8 11.8 0 0 0 24 12.2a11.7 11.7 0 0 0-3.5-8.7Z"/><path d="M8.5 6.7c.2-.4.4-.4.8-.4h.6c.2 0 .5.1.6.5l.8 2c.1.3.1.5-.1.8l-.5.7c-.2.2-.2.4 0 .7.3.5 1 1.5 2.1 2.4 1.2 1 2.2 1.3 2.5 1.4.3.1.5 0 .7-.2l.8-.9c.2-.2.4-.3.7-.2l2.1 1c.3.1.4.3.3.6-.1.4-.4 1.4-.9 1.8-.5.5-1.2.7-2 .7-.5 0-1.2-.1-2-.4-1.5-.5-2.9-1.4-4.1-2.6-1.2-1.1-2.2-2.4-2.8-3.7-.5-1-.7-1.8-.7-2.4 0-.8.3-1.5.7-2.2Z"/></svg>;
const WeChatIcon = () => <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><path d="M10.1 4.2c-4.2 0-7.6 2.8-7.6 6.3 0 2 1.1 3.8 3 4.9l-.8 2.9 3.1-1.6c.7.2 1.5.3 2.3.3.3 0 .6 0 .9-.1-.1-.4-.2-.8-.2-1.2 0-3.2 3-5.8 6.8-5.8.3 0 .6 0 .9.1-.9-3.3-4.3-5.8-8.4-5.8Zm-3.2 5.1a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8Zm5.8 0a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8Z"/><path d="M17.6 11.2c-3.3 0-6 2-6 4.6s2.7 4.6 6 4.6c.7 0 1.4-.1 2-.3l2.4 1.2-.6-2.2c1.4-.9 2.2-2 2.2-3.3 0-2.6-2.7-4.6-6-4.6Zm-2.2 4.1a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4Zm4.4 0a.7.7 0 1 1 0-1.4.7.7 0 0 1 0 1.4Z"/></svg>;

type Channel = 'zalo' | 'whatsapp' | 'wechat' | 'facebook' | 'email';
type Action = { label: string; href: string; download?: boolean; external?: boolean };

const WHATSAPP_QR = '/images/whatsapp-qr.jpg';
const WECHAT_QR = '/images/wechat-qr.jpg';

// Platform destinations. wa.me/qr/… is the link encoded in the WhatsApp QR image itself.
// WeChat's QR link (u.wechat.com) only works when scanned inside the WeChat app, so WeChat offers image actions only.
const WHATSAPP_LINK = 'https://wa.me/qr/GGEQLLXJBTWEK1';
const ZALO_LINK = 'https://zalo.me/84396085076';
const FACEBOOK_LINK = 'https://www.facebook.com/profile.php?id=61570824718837';
const EMAIL_LINK = 'mailto:info@jurassicenglish.com?subject=Jurassic%20English%20enquiry';

export const contactCopy = {
  en: {
    launcher: 'Contact',
    openList: 'Show contact channels',
    closeList: 'Hide contact channels',
    nav: 'Contact channels',
    kicker: 'Contact Jurassic English',
    close: 'Close contact dialog',
    qrAlt: (label: string) => `${label} contact QR code`,
    channels: {
      zalo: { label: 'Zalo', button: 'Contact us on Zalo', description: 'Open Zalo in a new tab to start a conversation.', actions: [{ label: 'Continue to Zalo', href: ZALO_LINK, external: true }] },
      whatsapp: { label: 'WhatsApp', button: 'Contact us on WhatsApp', description: 'Scan this QR code with WhatsApp on another device, or use Open WhatsApp. If this page is on your phone, open the QR on a second screen to scan it.', actions: [{ label: 'Open WhatsApp', href: WHATSAPP_LINK, external: true }, { label: 'Download QR', href: WHATSAPP_QR, download: true }] },
      wechat: { label: 'WeChat', button: 'Contact us on WeChat', description: 'Scan this QR code with WeChat (WeChat → + → Scan). If this page is on your phone, open the QR on a second screen to scan it.', actions: [{ label: 'Download QR', href: WECHAT_QR, download: true }, { label: 'View QR image', href: WECHAT_QR, external: true }] },
      facebook: { label: 'Facebook', button: 'Visit our Facebook page', description: 'Open our Facebook page in a new tab.', actions: [{ label: 'Continue to Facebook', href: FACEBOOK_LINK, external: true }] },
      email: { label: 'Email', button: 'Email Jurassic English', description: 'Open your email app with a new enquiry addressed to us.', actions: [{ label: 'Write an email', href: EMAIL_LINK }] },
    },
  },
  vi: {
    launcher: 'Liên hệ',
    openList: 'Hiện các kênh liên hệ',
    closeList: 'Ẩn các kênh liên hệ',
    nav: 'Kênh liên hệ',
    kicker: 'Liên hệ Jurassic English',
    close: 'Đóng hộp thoại liên hệ',
    qrAlt: (label: string) => `Mã QR liên hệ qua ${label}`,
    channels: {
      zalo: { label: 'Zalo', button: 'Liên hệ qua Zalo', description: 'Mở Zalo trong thẻ mới để bắt đầu trò chuyện với chúng tôi.', actions: [{ label: 'Tiếp tục đến Zalo', href: ZALO_LINK, external: true }] },
      whatsapp: { label: 'WhatsApp', button: 'Liên hệ qua WhatsApp', description: 'Quét mã QR này bằng WhatsApp trên thiết bị khác hoặc chọn Mở WhatsApp. Nếu đang xem trang trên điện thoại, hãy mở mã QR trên màn hình thứ hai để quét.', actions: [{ label: 'Mở WhatsApp', href: WHATSAPP_LINK, external: true }, { label: 'Tải mã QR', href: WHATSAPP_QR, download: true }] },
      wechat: { label: 'WeChat', button: 'Liên hệ qua WeChat', description: 'Quét mã QR này bằng WeChat (WeChat → + → Quét). Nếu đang xem trang trên điện thoại, hãy mở mã QR trên màn hình thứ hai để quét.', actions: [{ label: 'Tải mã QR', href: WECHAT_QR, download: true }, { label: 'Xem ảnh mã QR', href: WECHAT_QR, external: true }] },
      facebook: { label: 'Facebook', button: 'Truy cập trang Facebook của chúng tôi', description: 'Mở trang Facebook của chúng tôi trong thẻ mới.', actions: [{ label: 'Tiếp tục đến Facebook', href: FACEBOOK_LINK, external: true }] },
      email: { label: 'Email', button: 'Gửi email cho Jurassic English', description: 'Mở ứng dụng email với một thư mới gửi đến chúng tôi.', actions: [{ label: 'Viết email', href: EMAIL_LINK }] },
    },
  },
} satisfies Record<'en' | 'vi', unknown>;

const qrFor: Partial<Record<Channel, string>> = { whatsapp: WHATSAPP_QR, wechat: WECHAT_QR };
const channelOrder: Channel[] = ['zalo', 'whatsapp', 'wechat', 'facebook', 'email'];
const channelStyle: Record<Channel, string> = {
  zalo: 'bg-[#2f66e8] text-[20px] font-bold leading-none',
  whatsapp: 'bg-[#168a42]',
  wechat: 'bg-[#008f4b]',
  facebook: 'bg-[#1877f2] text-[25px] font-bold leading-none',
  email: 'bg-jurassic-dark',
};
const channelGlyph: Record<Channel, ReactNode> = {
  zalo: 'Z',
  whatsapp: <WhatsAppIcon />,
  wechat: <WeChatIcon />,
  facebook: 'f',
  email: <Mail aria-hidden="true" className="h-4 w-4" />,
};
const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-4 focus-visible:ring-offset-jurassic-dark';

export const GlobalContactPanel = () => {
  const t = contactCopy[getCurrentLocale() === 'vi' ? 'vi' : 'en'];
  const [active, setActive] = useState<Channel | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [navTopPx, setNavTopPx] = useState<number | null>(null);
  const [navLeftPx, setNavLeftPx] = useState<number | null>(null);
  const [navObstructed, setNavObstructed] = useState(false);
  const navTopRef = useRef<number | null>(null);
  const navLeftRef = useRef<number | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  const close = () => {
    setActive(null);
    // Return focus to the control that opened the dialog.
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = previous; };
  }, [active]);

  // Collapse the compact launcher on Escape or an outside click.
  useEffect(() => {
    if (!expanded || active) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { setExpanded(false); toggleRef.current?.focus(); } };
    const onPointer = (event: PointerEvent) => { if (navRef.current && !navRef.current.contains(event.target as Node)) setExpanded(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onPointer); };
  }, [expanded, active]);

  // Keep the fixed contact control clear of page copy and actions as the visitor scrolls.
  // If no clear vertical slot exists (for example a short zoomed viewport), yield until one does.
  useEffect(() => {
    const wideRail = window.matchMedia('(min-width: 1440px)');
    let bounds: { width: number; height: number } | null = null;
    let frame = 0;
    const sync = () => {
      const nav = navRef.current;
      if (!nav) return;
      if (expanded || active || nav.contains(document.activeElement)) {
        setNavObstructed(false);
        return;
      }
      // At compact widths the header has a reserved gap between the brand and menu.
      // Pin the 44px launcher there; scanning during nav transitions can otherwise
      // mistake the changing mobile menu subtree for a collision and hide the control.
      if (window.matchMedia('(max-width: 1100px)').matches) {
        navTopRef.current = null;
        navLeftRef.current = null;
        setNavTopPx(null);
        setNavLeftPx(null);
        setNavObstructed(false);
        return;
      }
      const measured = nav.getBoundingClientRect();
      if (measured.width && measured.height) bounds = { width: measured.width, height: measured.height };
      const width = bounds?.width ?? 44;
      const height = bounds?.height ?? 44;
      const compactHeader = window.matchMedia('(max-width: 1100px)').matches;
      const defaultLeft = compactHeader ? window.innerWidth - width - 76 : wideRail.matches ? 20 : 16;
      const defaultBottom = wideRail.matches ? 80 : Math.max(16, window.visualViewport?.offsetTop ?? 0);
      const defaultTop = compactHeader ? 20 : Math.max(0, window.innerHeight - defaultBottom - height);
      const boxAt = (left: number, top: number) => ({ left, right: left + width, top, bottom: top + height });
      const collisionCandidates = new Set(document.querySelectorAll<HTMLElement>(
        'header a, header button, nav a, nav button, main a[href], main button, main [role="button"], main h1, main h2, main h3, main p, main li, main span, main strong, main small, main label, body [role="dialog"], body aside, body aside a, body aside button, body aside [role="button"], body aside h1, body aside h2, body aside h3, body aside p, body aside li, body aside span, body aside strong, body aside small, body aside label'
      ));
      // Include fixed controls even when they are not semantic headings or contain nested icons.
      document.querySelectorAll<HTMLElement>('body *').forEach((element) => {
        const position = getComputedStyle(element).position;
        const actionable = element.matches('a, button, [role="button"], [role="dialog"]');
        if ((position === 'fixed' || position === 'sticky') && element.textContent?.trim() && (element.children.length === 0 || actionable)) collisionCandidates.add(element);
      });
      const collides = (box: ReturnType<typeof boxAt>) => [...collisionCandidates].some((element) => {
        if (nav.contains(element)) return false;
        if (!element.getClientRects().length || element.closest('[hidden]')) return false;
        const target = element.getBoundingClientRect();
        return box.left < target.right && box.right > target.left && box.top < target.bottom && box.bottom > target.top;
      });
      const currentLeft = navLeftRef.current ?? defaultLeft;
      const currentTop = navTopRef.current ?? defaultTop;
      if (!collides(boxAt(defaultLeft, defaultTop))) {
        navTopRef.current = null;
        navLeftRef.current = null;
        setNavTopPx(null);
        setNavLeftPx(null);
        setNavObstructed(false);
        return;
      }
      if (!collides(boxAt(currentLeft, currentTop))) {
        setNavObstructed(false);
        return;
      }
      const lefts = new Set<number>([defaultLeft, Math.round((window.innerWidth - width) / 2), Math.round(window.innerWidth * 0.55), window.innerWidth - width - 16]);
      for (let left = defaultLeft + 32; left + width <= window.innerWidth - 8; left += 32) lefts.add(left);
      const safe: Array<{ left: number; top: number; score: number }> = [];
      for (const left of lefts) {
        if (left < 0 || left + width > window.innerWidth) continue;
        for (let top = 0; top + height <= window.innerHeight; top += 8) {
          if (!collides(boxAt(left, top))) safe.push({ left, top, score: Math.abs(top - currentTop) + Math.abs(left - currentLeft) * 1.25 });
        }
      }
      if (!safe.length) { setNavObstructed(true); return; }
      const next = safe.reduce((best, candidate) => candidate.score < best.score ? candidate : best);
      navTopRef.current = next.top;
      navLeftRef.current = next.left;
      setNavTopPx(next.top);
      setNavLeftPx(next.left);
      setNavObstructed(false);
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(sync); };
    const observer = new MutationObserver(schedule);
    const layoutObserver = new ResizeObserver(schedule);
    const main = document.querySelector('main');
    if (main) layoutObserver.observe(main);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-expanded', 'hidden', 'class'] });
    window.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);
    wideRail.addEventListener('change', schedule);
    document.fonts?.ready.then(schedule);
    sync();
    return () => {
      observer.disconnect(); layoutObserver.disconnect(); cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule, true); window.removeEventListener('resize', schedule); wideRail.removeEventListener('change', schedule);
    };
  }, [expanded, active]);

  const trapFocus = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab' || !dialogRef.current) return;
    const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  const launch = (channel: Channel, trigger: HTMLElement) => {
    triggerRef.current = trigger;
    setActive(channel);
  };

  const detail = active ? t.channels[active] : null;
  const qr = active ? qrFor[active] : undefined;

  return <>
    {/* Full rail only where the page gutter clears it (content container is 1232px); a compact launcher elsewhere. */}
    <nav ref={navRef} hidden={navObstructed && !expanded && !active} style={navTopPx !== null || navLeftPx !== null ? { ...(navTopPx !== null ? { top: `${navTopPx}px`, bottom: 'auto' } : {}), ...(navLeftPx !== null ? { left: `${navLeftPx}px` } : {}) } : undefined} data-contact-panel="" className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 z-[80] flex flex-col items-start gap-2 max-[1100px]:top-5 max-[1100px]:right-[76px] max-[1100px]:bottom-auto max-[1100px]:left-auto min-[1440px]:bottom-20 min-[1440px]:left-5 min-[1440px]:items-center" aria-label={t.nav}>
      <ul id="contact-channel-list" className={`${expanded ? 'flex' : 'hidden'} flex-col items-center gap-2 min-[1440px]:flex`}>
        {channelOrder.map((channel) => <li key={channel}>
          <button type="button" onClick={(event) => launch(channel, event.currentTarget)} className={`grid h-11 w-11 place-items-center rounded-full border border-white/25 text-white shadow-2xl transition hover:-translate-y-0.5 hover:brightness-110 ${channelStyle[channel]} ${focusRing}`} aria-label={t.channels[channel].button} title={t.channels[channel].label}>{channelGlyph[channel]}</button>
        </li>)}
      </ul>
      <button ref={toggleRef} type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} aria-controls="contact-channel-list" aria-label={expanded ? t.closeList : t.openList} className={`inline-flex h-11 items-center gap-2 rounded-full border border-white/25 bg-jurassic-dark px-4 text-sm font-semibold text-white shadow-2xl transition hover:brightness-125 min-[1440px]:hidden max-[1100px]:w-11 max-[1100px]:justify-center max-[1100px]:gap-0 max-[1100px]:px-0 ${focusRing}`}>
        {expanded ? <X aria-hidden="true" className="h-4 w-4" /> : <MessageCircle aria-hidden="true" className="h-4 w-4" />}
        <span className="max-[1100px]:sr-only">{t.launcher}</span>
      </button>
    </nav>
    {active && detail && <div className="fixed inset-0 z-[200] grid place-items-center bg-black/70 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <section ref={dialogRef} onKeyDown={trapFocus} className="relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-auto overscroll-contain rounded-2xl border border-white/20 bg-jurassic-dark p-6 text-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title" aria-describedby="contact-modal-description">
        <button type="button" data-autofocus="" onClick={close} className="absolute right-4 top-4 grid min-h-11 min-w-11 place-items-center rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent" aria-label={t.close}><X aria-hidden="true" className="h-5 w-5" /></button>
        <p className="pr-10 text-xs font-semibold uppercase tracking-[0.2em] text-jurassic-accent">{t.kicker}</p>
        <h2 id="contact-modal-title" className="mt-2 text-2xl font-semibold">{detail.label}</h2>
        <p id="contact-modal-description" className="mt-2 text-sm leading-6 text-white/70">{detail.description}</p>
        <div className="mt-5 flex flex-col gap-3">
          {(detail.actions as Action[]).map((action, index) => <a key={action.label} href={action.href} {...(action.download ? { download: '' } : {})} {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl px-4 py-3 font-semibold transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${index === 0 ? 'bg-jurassic-accent text-jurassic-dark' : 'border border-white/30 text-white'}`}>
            {action.label}{action.external && <span aria-hidden="true" className="ml-2">↗</span>}
          </a>)}
        </div>
        {qr && <img className="mx-auto mt-5 max-h-[55dvh] w-auto max-w-full rounded-xl bg-white object-contain p-3 sm:max-w-[320px]" src={qr} alt={t.qrAlt(detail.label)} />}
      </section>
    </div>}
  </>;
};
