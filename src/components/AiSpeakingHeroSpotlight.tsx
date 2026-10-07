import { useLayoutEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Minus, Plus } from 'lucide-react';
import { getHomeContent } from '../i18n/content/home';
import { getCurrentLocale } from '../i18n/routing';
import { trackCtaClick } from '../lib/analytics';

/** Compact first-screen product invitation; the section below carries the full explanation. */
export function AiSpeakingHeroSpotlight() {
  const locale = getCurrentLocale();
  const content = (getHomeContent(locale) ?? getHomeContent('en'))?.hero.aiSpeakingLaunch;
  const restoreRef = useRef<HTMLButtonElement>(null);
  const minimizeRef = useRef<HTMLButtonElement>(null);
  // Hydration-safe: the prerendered HTML is always the expanded card, so the
  // first client render must match it. The per-session minimized preference
  // is applied in a layout effect, which runs before the browser paints the
  // hydrated tree.
  const [isMinimized, setIsMinimized] = useState(false);
  useLayoutEffect(() => {
    try {
      if (window.sessionStorage.getItem('je-ai-speaking-hero-minimized-v1') === 'true') {
        setIsMinimized(true);
      }
    } catch {
      // Session storage unavailable — keep the expanded default.
    }
  }, []);
  if (!content) return null;

  const setMinimized = (value: boolean) => {
    setIsMinimized(value);
    try {
      window.sessionStorage.setItem('je-ai-speaking-hero-minimized-v1', String(value));
    } catch {
      // The control still works if session storage is unavailable.
    }
    window.requestAnimationFrame(() => {
      (value ? restoreRef : minimizeRef).current?.focus();
    });
  };

  if (isMinimized) {
    return (
      <aside aria-label="Jurassic AI Speaking" className="min-w-0 rounded-2xl border border-jurassic-gold/45 bg-jurassic-soft text-jurassic-dark shadow-[0_14px_35px_-22px_rgba(0,0,0,0.8)]">
        <button ref={restoreRef} type="button" aria-expanded="false" onClick={() => setMinimized(false)} className="flex min-h-14 w-full items-center gap-2.5 rounded-2xl px-3.5 py-2 text-left transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-jurassic-dark sm:px-5">
          <span className="h-2 w-2 flex-none rounded-full bg-jurassic-accent" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate text-sm font-extrabold">Jurassic AI Speaking</span>
          <span className="hidden flex-none text-xs font-semibold text-jurassic-dark/70 min-[370px]:inline">{content.price}</span>
          <span className="sr-only">{content.heroRestore}</span>
          <Plus aria-hidden="true" className="h-5 w-5 flex-none text-jurassic-dark" />
        </button>
      </aside>
    );
  }

  return (
    <aside aria-label="Jurassic AI Speaking" className="relative min-w-0 overflow-hidden rounded-[1.75rem] border border-jurassic-gold/40 bg-jurassic-soft text-jurassic-dark shadow-[0_28px_85px_-30px_rgba(0,0,0,0.8)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-jurassic-accent via-jurassic-gold to-jurassic-accent" aria-hidden="true" />
      <div className="flex flex-col p-4 sm:p-7 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.15em] text-jurassic-dark">
            <span className="h-2 w-2 rounded-full bg-jurassic-accent" aria-hidden="true" />{content.heroBadge}
          </span>
          <span className="hidden rounded-full border border-jurassic-dark/15 px-3 py-1 text-xs font-bold sm:inline-flex">{content.price}</span>
          <button ref={minimizeRef} type="button" aria-expanded="true" onClick={() => setMinimized(true)} className="inline-flex min-h-8 items-center gap-1 rounded-full border border-jurassic-dark/15 px-2.5 py-1 text-[11px] font-bold text-jurassic-dark transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-dark focus-visible:ring-offset-2">
            <Minus aria-hidden="true" className="h-3.5 w-3.5" />{content.heroMinimize}
          </button>
        </div>

        <h2 id="ai-speaking-hero-title" className="mt-4 font-display text-[1.8rem] leading-[1.06] sm:mt-5 sm:text-[2.5rem] lg:text-[2.8rem]">
          Jurassic <span className="text-jurassic-accent">AI Speaking</span>
        </h2>
        <p className="mt-2 border-l-2 border-jurassic-accent pl-2 text-xs font-bold sm:hidden">{content.price}</p>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-jurassic-dark/75 sm:text-base">{content.heroBody}</p>

        <div className="order-2 mt-4 rounded-xl bg-jurassic-dark px-3 py-2.5 text-white sm:hidden">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-jurassic-gold">{content.heroPreviewLabel}</p>
          <p className="mt-1 text-xs font-semibold leading-snug">{content.heroStepOne} <span className="text-jurassic-gold" aria-hidden="true">→</span> {content.heroStepTwo} <span className="text-jurassic-gold" aria-hidden="true">→</span> {content.heroStepThree}</p>
        </div>
        <div className="mt-5 hidden rounded-2xl bg-jurassic-dark p-4 text-white sm:block sm:p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-jurassic-gold">{content.heroPreviewLabel}</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[content.heroStepOne, content.heroStepTwo, content.heroStepThree].map((step, index) => (
              <div key={step} className="min-w-0 rounded-lg border border-white/10 bg-white/[0.055] px-1.5 py-3">
                <span className="block text-xs font-bold text-jurassic-gold">0{index + 1}</span>
                <span className="mt-1 block text-[11px] font-semibold leading-tight text-white sm:text-xs">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <a href="/ai-speaking" onClick={() => trackCtaClick({ label: 'homepage_ai_speaking_hero_click', type: 'primary', segment: 'parent_student' })} className="order-1 mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-jurassic-accent px-5 py-3 text-sm font-extrabold text-jurassic-dark transition hover:bg-[#f97b38] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-dark focus-visible:ring-offset-2 sm:order-none sm:mt-5">
          {content.primaryCta}<ArrowUpRight aria-hidden="true" className="h-4 w-4" />
        </a>
        <a href="#ai-speaking-launch" className="order-3 mt-1 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-jurassic-dark underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-dark sm:order-none sm:mt-3">
          {content.heroLearnMore}<ArrowRight aria-hidden="true" className="h-4 w-4" />
        </a>
      </div>
    </aside>
  );
}
