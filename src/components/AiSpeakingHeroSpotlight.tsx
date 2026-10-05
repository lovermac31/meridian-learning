import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { getHomeContent } from '../i18n/content/home';
import { getCurrentLocale } from '../i18n/routing';
import { trackCtaClick } from '../lib/analytics';

/** Compact first-screen product invitation; the section below carries the full explanation. */
export function AiSpeakingHeroSpotlight() {
  const locale = getCurrentLocale();
  const content = (getHomeContent(locale) ?? getHomeContent('en'))?.hero.aiSpeakingLaunch;
  if (!content) return null;

  return (
    <aside aria-labelledby="ai-speaking-hero-title" className="relative min-w-0 overflow-hidden rounded-[1.75rem] border border-jurassic-gold/40 bg-jurassic-soft text-jurassic-dark shadow-[0_28px_85px_-30px_rgba(0,0,0,0.8)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-jurassic-accent via-jurassic-gold to-jurassic-accent" aria-hidden="true" />
      <div className="flex flex-col p-4 sm:p-7 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.15em] text-jurassic-dark">
            <span className="h-2 w-2 rounded-full bg-jurassic-accent" aria-hidden="true" />{content.heroBadge}
          </span>
          <span className="rounded-full border border-jurassic-dark/15 px-3 py-1 text-xs font-bold">{content.price}</span>
        </div>

        <h2 id="ai-speaking-hero-title" className="mt-4 font-display text-[1.8rem] leading-[1.06] sm:mt-5 sm:text-[2.5rem] lg:text-[2.8rem]">
          Jurassic <span className="text-jurassic-accent">AI Speaking</span>
        </h2>
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
