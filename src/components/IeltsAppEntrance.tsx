import { IELTS_HOME } from '../i18n/content/products';
import { getOverhaulContent } from '../i18n/content/overhaul';
import { trackCtaClick } from '../lib/analytics';
import { ieltsAppHref, type IeltsAppPlacement } from '../lib/ieltsApp';

/**
 * The IELTS Speaking app entrance (Jay + CEO, 2 Nov 2026). `strip`: the home page band under the hero. `compact`:
 * one white card near the top of the adult IELTS pages (country pages, insights articles, the two tools), same
 * wording, utm_content=<page type>. English copy on every locale without its own strings (only EN and VI exist).
 * Never on kids pages: the app and the exam are for adults. The card is static markup with fixed image dimensions,
 * so it reserves its space before paint (no layout shift).
 */
const PRIMARY = 'inline-flex min-h-11 items-center justify-center rounded-full bg-jurassic-accent px-5 py-2.5 text-sm font-bold text-jurassic-dark';

export function IeltsAppEntrance({ placement, locale, variant = 'compact' }: { placement: IeltsAppPlacement; locale: string; variant?: 'strip' | 'compact' | 'banner' }) {
  const copyLocale = locale === 'vi' ? 'vi' : 'en';
  const { ieltsApp } = getOverhaulContent(copyLocale).home;
  const packs = `${IELTS_HOME.speaking[copyLocale]}?utm_source=${placement === 'home' ? 'home-ielts-app' : `${placement}-ielts-app`}`;
  const track = () => { try { trackCtaClick({ label: `${placement}_ielts_app`, type: 'primary', segment: 'parent_student' }); } catch { /* measurement never blocks navigation */ } };
  const headingId = `ielts-app-heading-${placement}`;
  const href = ieltsAppHref(placement, copyLocale);
  if (variant === 'banner') {
    // One row on the first screen (home, above the hero; /products, above the segment tiles): no image, one button.
    return (
      <div className="ielts-app-banner" lang={copyLocale} data-ielts-app-banner={placement}>
        <p className="ielts-app-banner-text"><strong>{ieltsApp.banner}</strong><span className="ielts-app-banner-adults">{ieltsApp.adults}</span></p>
        <a href={href} target="_blank" rel="noopener noreferrer" className="ielts-app-banner-cta" data-cta={`ielts-app-${placement}-banner`} onClick={track}>{ieltsApp.primary} →</a>
      </div>
    );
  }
  if (variant === 'strip') {
    return (
      <section className="border-t border-sb-border bg-sb-forest px-4 py-8 text-white sm:px-6" aria-labelledby="ielts-app-heading" data-ielts-app-strip="">
        <div className="mx-auto grid max-w-7xl items-center gap-6 rounded-[1.5rem] border border-sb-border bg-white p-5 text-sb-ink shadow-warm sm:p-7 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <div>
            <p className="flex flex-wrap gap-2"><span className="inline-block rounded-full bg-sb-sage px-3 py-1 text-xs font-extrabold uppercase tracking-[0.1em] text-sb-sage-ink">{ieltsApp.eyebrow}</span><span className="inline-block rounded-full border border-sb-border px-3 py-1 text-xs font-extrabold uppercase tracking-[0.1em] text-sb-slate" data-ielts-app-adults="">{ieltsApp.adults}</span></p>
            <h2 id="ielts-app-heading" className="mt-3 text-2xl font-extrabold leading-tight text-sb-forest sm:text-3xl">{ieltsApp.title}</h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-sb-slate">{ieltsApp.body}</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href={href} target="_blank" rel="noopener noreferrer" className={PRIMARY} data-cta={`ielts-app-${placement}`} onClick={track}>{ieltsApp.primary}</a>
              <a href={packs} className="inline-flex min-h-11 items-center font-bold text-sb-forest underline underline-offset-4" data-link="ielts-app-packs">{ieltsApp.secondary} →</a>
            </div>
          </div>
          <img src="/images/ielts-app-screen.webp" srcSet="/images/w/ielts-app-screen-640.webp 640w, /images/ielts-app-screen.webp 980w" sizes="(min-width: 1024px) 480px, calc(100vw - 72px)" alt={ieltsApp.imageAlt} width={980} height={612} loading="lazy" decoding="async" className="aspect-[16/10] w-full rounded-2xl border border-sb-border object-cover opacity-90 saturate-[.6]" />
        </div>
      </section>
    );
  }
  return (
    <section className="ielts-app-entrance" aria-labelledby={headingId} lang={copyLocale} dir="ltr" data-ielts-app-entrance={placement}>
      <img src="/images/w/ielts-app-screen-640.webp" alt={ieltsApp.imageAlt} width={640} height={400} loading="lazy" decoding="async" className="ielts-app-entrance-image" />
      <div className="ielts-app-entrance-body">
        <p className="ielts-app-entrance-pills"><span className="ielts-app-entrance-pill">{ieltsApp.eyebrow}</span><span className="ielts-app-entrance-pill ielts-app-entrance-adults" data-ielts-app-adults="">{ieltsApp.adults}</span></p>
        <h2 id={headingId} className="ielts-app-entrance-title">{ieltsApp.title}</h2>
        <p className="ielts-app-entrance-text">{ieltsApp.body}</p>
        <div className="ielts-app-entrance-actions">
          <a href={href} target="_blank" rel="noopener noreferrer" className={PRIMARY} data-cta={`ielts-app-${placement}`} onClick={track}>{ieltsApp.primary}</a>
          <a href={packs} className="ielts-app-entrance-link" data-link="ielts-app-packs">{ieltsApp.secondary} →</a>
        </div>
      </div>
    </section>
  );
}
