import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { getHomeContent } from '../i18n/content/home';
import { getCurrentLocale } from '../i18n/routing';
import { trackCtaClick } from '../lib/analytics';

/** Homepage merchandising only. Product flows live in the separate AI Speaking app. */
export function AiSpeakingLaunch() {
  const locale = getCurrentLocale();
  const content = (getHomeContent(locale) ?? getHomeContent('en'))?.hero.aiSpeakingLaunch;
  if (!content) return null;

  return (
    <section id="ai-speaking-launch" aria-labelledby="ai-speaking-launch-title" className="relative overflow-hidden bg-jurassic-soft py-16 sm:py-24 scroll-mt-20">
      <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" style={{ backgroundImage: 'radial-gradient(#a59a87 0.65px, transparent 0.65px)', backgroundSize: '22px 22px' }} />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-16">
          <div className="max-w-xl">
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-jurassic-accent/30 bg-white px-3 py-1.5 text-[11px] font-bold tracking-[0.14em] text-jurassic-dark shadow-sm">
              <span className="h-2 w-2 rounded-full bg-jurassic-accent" aria-hidden="true" />{content.eyebrow}
            </p>
            <h2 id="ai-speaking-launch-title" className="font-display text-[2.45rem] leading-[1.07] tracking-tight text-jurassic-dark sm:text-5xl lg:text-[3.7rem]">
              {content.headline}
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-jurassic-dark/75 sm:text-lg">{content.body}</p>
            <p className="mt-6 border-l-2 border-jurassic-accent pl-4 text-base font-bold text-jurassic-dark">{content.price}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href="/ai-speaking" onClick={() => trackCtaClick({ label: 'homepage_ai_speaking_primary_click', type: 'primary', segment: 'parent_student' })} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-jurassic-accent px-7 py-3 font-bold text-jurassic-dark shadow-[0_12px_28px_-13px_rgba(147,52,2,0.7)] transition hover:bg-[#f97b38] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-dark focus-visible:ring-offset-2">
                {content.primaryCta}<ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </a>
              <a href="/ai-speaking/samples" onClick={() => trackCtaClick({ label: 'homepage_ai_speaking_sample_click', type: 'secondary', segment: 'parent_student' })} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-jurassic-dark/25 bg-white px-6 py-3 font-semibold text-jurassic-dark transition hover:border-jurassic-dark/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-dark focus-visible:ring-offset-2">
                {content.sampleCta}<ArrowRight aria-hidden="true" className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="min-w-0 rounded-[1.75rem] border border-jurassic-dark/10 bg-jurassic-dark p-3 shadow-[0_28px_75px_-35px_rgba(16,24,32,0.55)] sm:p-5" aria-label={content.visualTitle}>
            <div className="flex items-center justify-between gap-3 rounded-t-[1rem] border-b border-white/10 bg-[#1d2930] px-4 py-3 text-white/50">
              <span className="flex gap-1.5" aria-hidden="true"><span className="h-2 w-2 rounded-full bg-jurassic-accent" /><span className="h-2 w-2 rounded-full bg-jurassic-gold" /><span className="h-2 w-2 rounded-full bg-white/25" /></span>
              <span className="min-w-0 truncate text-[10px] font-semibold uppercase tracking-[0.16em]">Jurassic AI Speaking / Report</span>
            </div>
            <div className="rounded-b-[1rem] bg-[#18242b] p-4 sm:p-7">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-jurassic-gold">{content.visualEyebrow}</p>
              <h3 className="mt-2 max-w-md font-serif text-2xl leading-tight text-white sm:text-[1.8rem]">{content.visualTitle}</h3>
              <div className="mt-6 grid gap-2 sm:gap-3">
                {[
                  [content.visualStepOne, content.visualAnswer],
                  [content.visualStepTwo, content.visualEvidence],
                  [content.visualStepThree, content.visualPriority],
                ].map(([step, description], index) => (
                  <div key={step} className="flex min-w-0 items-start gap-3 rounded-xl border border-white/10 bg-white/[0.045] p-3.5 sm:p-4">
                    <span className={`mt-0.5 h-7 w-1 flex-none rounded-full ${index === 2 ? 'bg-jurassic-accent' : 'bg-jurassic-gold/65'}`} aria-hidden="true" />
                    <div className="min-w-0"><p className="text-[10px] font-bold tracking-[0.15em] text-jurassic-gold">{step}</p><p className="mt-1 text-sm leading-snug text-white sm:text-base">{description}</p></div>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-xs leading-relaxed text-white/65">{content.visualNote}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
