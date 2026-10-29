import { ArrowDown, ArrowRight, ArrowUpRight, Check, Mail, MessageCircle, ShieldCheck } from 'lucide-react';
import { CONTACT_EMAIL, getOverhaulContent, IMG, ZALO_URL } from '../i18n/content/overhaul';
import { recordClientEvent } from '../lib/tracker';
import { getLocalizedHref } from '../i18n/localizedHref';
import { getCurrentLocale } from '../i18n/routing';
import { trackCtaClick } from '../lib/analytics';
import { FounderFilmLink } from './FounderFilmLink';
import { SamplePackForm } from './SamplePackForm';

/**
 * Homepage (human-centered overhaul, revised spec §3 Page A): six sections —
 * promise, three need-first paths, one illustrative lesson demonstration,
 * Meet Mr. Jay (real photo), starting options with full commitment totals,
 * and a short FAQ. The global Footer follows.
 *
 * Contrast: white text sits only on forest #1E4D3B (9.4:1) or amber-deep
 * #B45309 (5.0:1); #D97706 is decorative only.
 */

type Link = { label: string; href: string; kind: string };

export const PRIMARY_BTN =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-sb-amber-deep px-5 py-2.5 text-center text-sm font-extrabold text-white shadow-warm transition hover:bg-sb-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-forest focus-visible:ring-offset-2 focus-visible:ring-offset-sb-cream';
export const SECONDARY_BTN =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-sb-forest/30 bg-white px-5 py-2.5 text-center text-sm font-bold text-sb-forest transition hover:border-sb-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-forest focus-visible:ring-offset-2 focus-visible:ring-offset-sb-cream';

function CtaLink({ link, className, onNavigate, track }: { link: Link; className: string; onNavigate: (path: string) => void; track: string }) {
  const locale = getCurrentLocale();
  const external = link.kind === 'external';
  const anchor = link.kind === 'anchor';
  return (
    <a
      href={external || anchor ? link.href : getLocalizedHref(link.href, locale)}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      onClick={(event) => {
        try {
          trackCtaClick({ label: track, type: 'primary', segment: 'parent_student' });
        } catch {
          /* Measurement must not block navigation. */
        }
        if (link.kind === 'route') {
          event.preventDefault();
          onNavigate(link.href);
        }
      }}
      className={className}
    >
      {link.label}
      {external ? <ArrowUpRight aria-hidden="true" className="h-4 w-4 flex-none" /> : anchor ? <ArrowDown aria-hidden="true" className="h-4 w-4 flex-none" /> : <ArrowRight aria-hidden="true" className="h-4 w-4 flex-none" />}
    </a>
  );
}

const STEP_STYLES = ['bg-sb-sage text-sb-sage-ink', 'bg-amber-100 text-sb-amber-deep', 'bg-teal-50 text-sb-teal'];

export function HomeOverhaul({ onNavigate }: { onNavigate: (path: string) => void }) {
  const locale = getCurrentLocale();
  const { home } = getOverhaulContent(locale);
  const { hero, find, paths, lesson, jay, pricing, faq } = home;

  return (
    <div className="bg-sb-cream text-sb-ink">
      {/* 1 · Promise + illustration */}
      <section className="px-4 pb-14 pt-24 sm:px-6 sm:pt-28">
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-sb-forest">{hero.eyebrow}</p>
            <h1 className="mt-4 font-display text-[2.1rem] leading-[1.06] tracking-tight text-sb-forest sm:text-[2.8rem] lg:text-[3.2rem]">{hero.title}</h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-sb-slate sm:text-lg">{hero.body}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <CtaLink link={{ label: hero.primary, href: '#learning-paths', kind: 'anchor' }} className={PRIMARY_BTN} onNavigate={onNavigate} track="home_hero_paths" />
              <CtaLink link={{ label: hero.secondary, href: '/products?utm_source=home-hero', kind: 'page' }} className={SECONDARY_BTN} onNavigate={onNavigate} track="home_hero_products" />
            </div>
          </div>
          <figure className="relative">
            <img
              src={`${IMG}/hero-story-expedition.webp`}
              srcSet={`${IMG}/w/hero-story-expedition-480.webp 480w, ${IMG}/w/hero-story-expedition-672.webp 672w, ${IMG}/w/hero-story-expedition-800.webp 800w, ${IMG}/w/hero-story-expedition-1200.webp 1200w, ${IMG}/hero-story-expedition.webp 1400w`}
              sizes="(min-width: 1280px) 592px, (min-width: 1024px) calc(50vw - 48px), (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)"
              alt={hero.imageAlt}
              width={1400}
              height={788}
              fetchPriority="high"
              loading="eager"
              decoding="async"
              className="aspect-[16/9] w-full rounded-[1.75rem] border border-sb-border object-cover shadow-warm"
            />
            <figcaption className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-sb-forest">{hero.artLabel}</figcaption>
            {/* Professor Rex medallion (owner, Oct 2026): an illustration, low priority so the hero image stays the LCP. */}
            <img
              src={`${IMG}/w/professor-rex-mascot-160.webp`}
              srcSet={`${IMG}/w/professor-rex-mascot-160.webp 160w, ${IMG}/w/professor-rex-mascot-320.webp 320w`}
              sizes="(min-width: 640px) 96px, 72px"
              alt={hero.rexAlt}
              width={160}
              height={160}
              fetchPriority="low"
              loading="lazy"
              decoding="async"
              className="absolute bottom-3 right-3 h-[72px] w-[72px] rounded-full border-4 border-white bg-sb-cream object-cover shadow-warm sm:h-24 sm:w-24"
            />
          </figure>
        </div>
      </section>

      {/* 1b · Find what you need (master, 27 Oct 2026): one compact strip, a tile per /products section (2 clicks from
          home to any product: tile → section → the card's order button). Plain links, so #anchor lands on the heading. */}
      <section className="border-t border-sb-border bg-white px-4 py-8 sm:px-6" aria-labelledby="find-heading">
        <div className="mx-auto max-w-7xl">
          <h2 id="find-heading" className="text-xl font-extrabold text-sb-forest">{find.heading}</h2>
          <ul className="mt-4 grid gap-3 md:grid-cols-3">
            {find.tiles.map((tile) => (
              <li key={tile.anchor}>
                <a
                  href={`${getLocalizedHref('/products', locale)}?utm_source=home-tiles#${tile.anchor}`}
                  onClick={() => {
                    try {
                      trackCtaClick({ label: `home_tile_${tile.anchor}`, type: 'primary', segment: 'parent_student' });
                    } catch {
                      /* Measurement must not block navigation. */
                    }
                  }}
                  className="flex h-full items-center gap-3 rounded-2xl border border-sb-border bg-sb-cream p-3 transition hover:border-sb-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-amber"
                  data-home-tile={tile.anchor}
                >
                  <img src={`/images/products/${tile.image}.webp`} alt="" width={480} height={480} loading="lazy" decoding="async" className="h-16 w-16 flex-none rounded-xl object-cover" />
                  <span className="min-w-0">
                    <span className="block font-extrabold text-sb-forest">{tile.title}</span>
                    <span className="block text-sm text-sb-slate">{tile.promise}</span>
                    <span className="mt-0.5 block text-sm font-bold text-sb-amber-deep">{tile.from}</span>
                  </span>
                  <ArrowRight aria-hidden="true" className="ml-auto h-4 w-4 flex-none text-sb-forest" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 2 · Three need-first paths */}
      <section id="learning-paths" className="scroll-mt-24 border-y border-sb-border bg-white px-4 py-16 sm:px-6" aria-labelledby="paths-heading">
        <div className="mx-auto max-w-7xl">
          <h2 id="paths-heading" className="text-3xl font-extrabold leading-tight text-sb-forest sm:text-4xl">{paths.heading}</h2>
          <p className="mt-4 max-w-4xl rounded-2xl border border-sb-border bg-sb-cream p-4 text-sm leading-relaxed text-sb-ink">{paths.helper}</p>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {paths.cards.map((card) => (
              <article key={card.key} className="flex flex-col rounded-[1.5rem] border border-sb-border bg-sb-cream p-5 shadow-warm">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-sb-amber-deep">{card.label}</p>
                <h3 className="mt-1 text-xl font-extrabold text-sb-forest">{card.title}</h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div>
                    <dt className="font-bold text-sb-forest">{paths.bestFor}</dt>
                    <dd className="text-sb-slate">{card.bestFor}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-sb-forest">{paths.purpose}</dt>
                    <dd className="text-sb-slate">{card.purpose}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex-1 rounded-xl border border-sb-border bg-white p-3 text-sm">
                  <p className="flex items-center gap-2 font-bold text-sb-forest">
                    {card.key === 'reading' ? (
                      <img src={`${IMG}/w/professor-rex-mascot-160.webp`} alt="" width={40} height={40} loading="lazy" decoding="async" className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <ShieldCheck aria-hidden="true" className="h-4 w-4 flex-none text-sb-sage-ink" />
                    )}
                    {card.noteTitle}
                  </p>
                  <p className="mt-1 leading-relaxed text-sb-slate">{card.note}</p>
                  {card.worlds.length ? (
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {card.worlds.map((world) => (
                        <li key={world} className="rounded-full bg-sb-sage px-2.5 py-0.5 text-xs font-bold text-sb-sage-ink">{world}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <CtaLink link={card.primary} className={PRIMARY_BTN} onNavigate={onNavigate} track={`home_path_${card.key}_primary`} />
                  <CtaLink link={card.secondary} className={SECONDARY_BTN} onNavigate={onNavigate} track={`home_path_${card.key}_secondary`} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* The one lead capture: the free sample pack, right after the paths (website assessment, 27 Oct 2026). */}
      <SamplePackForm placement="home" />

      {/* 3 · Illustrative lesson demonstration (HTML/CSS, badged) */}
      <section className="px-4 py-16 sm:px-6" aria-labelledby="lesson-heading">
        <div className="mx-auto max-w-5xl">
          <p className="inline-flex rounded-full border border-sb-amber bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-[0.1em] text-sb-amber-deep">{lesson.badge}</p>
          <h2 id="lesson-heading" className="mt-4 text-3xl font-extrabold leading-tight text-sb-forest sm:text-4xl">{lesson.heading}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <blockquote className="rounded-2xl border-l-4 border-sb-forest bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-sb-slate">{lesson.excerptLabel}</p>
              <p className="mt-2 italic leading-relaxed">{lesson.excerpt}</p>
            </blockquote>
            <div className="rounded-2xl border-l-4 border-sb-amber bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-sb-slate">{lesson.questionLabel}</p>
              <p className="mt-2 italic leading-relaxed">{lesson.question}</p>
            </div>
          </div>
          <div className="mt-5 grid overflow-hidden rounded-[1.25rem] border border-sb-border bg-white md:grid-cols-2">
            <div className="p-5">
              <p className="font-extrabold text-sb-forest">{lesson.colBefore}</p>
              <p className="mt-2 italic text-sb-slate">{lesson.before}</p>
              <p className="mt-4 text-sm font-bold text-sb-forest">{lesson.stallTitle}</p>
              <p className="text-sm text-sb-slate">{lesson.stall}</p>
            </div>
            <div className="border-t border-sb-border p-5 md:border-l md:border-t-0">
              <p className="font-extrabold text-sb-forest">{lesson.colAfter}</p>
              <ol className="mt-2 space-y-2">
                {lesson.steps.map((step, i) => (
                  <li key={step.tag}>
                    <span className={`mr-2 inline-block rounded px-1.5 py-0.5 text-xs font-extrabold ${STEP_STYLES[i]}`}>{step.tag}</span>
                    <span className="text-xs font-semibold text-sb-slate">{step.hint}</span>
                    <p className="italic">{step.text}</p>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-sm font-bold text-sb-forest">{lesson.progressTitle}</p>
              <p className="text-sm text-sb-slate">{lesson.progress}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 · Meet Mr. Jay (real portrait photo) */}
      <section id="meet-mr-jay" className="scroll-mt-24 border-y border-sb-border bg-white px-4 py-16 sm:px-6" aria-labelledby="jay-heading">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[auto_minmax(0,1fr)] md:items-start">
          <img
            src="/images/mr-jay-portrait.webp"
            alt={jay.portraitAlt}
            width={960}
            height={960}
            loading="lazy"
            decoding="async"
            className="h-40 w-40 rounded-[1.5rem] object-cover ring-2 ring-sb-border"
          />
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-sb-amber-deep">{jay.eyebrow}</p>
            <h2 id="jay-heading" className="mt-2 text-3xl font-extrabold leading-tight text-sb-forest">{jay.title}</h2>
            <p className="mt-1 text-sm text-sb-slate">{jay.credentials}</p>
            <p className="mt-4 leading-relaxed">{jay.intro}</p>
            <FounderFilmLink locale={locale} variant="inline" />
            <p className="mt-4 font-bold text-sb-forest">{jay.expectTitle}</p>
            <ul className="mt-2 space-y-2">
              {jay.expect.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <Check aria-hidden="true" className="mt-1 h-4 w-4 flex-none text-sb-sage-ink" />
                  <span>
                    <strong className="text-sb-forest">{item.title}</strong> <span className="text-sb-slate">{item.body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 5 · Starting options & full commitment pricing */}
      <section id="pricing-options" className="scroll-mt-24 px-4 py-16 sm:px-6" aria-labelledby="pricing-heading">
        <div className="mx-auto max-w-7xl">
          <h2 id="pricing-heading" className="text-3xl font-extrabold leading-tight text-sb-forest sm:text-4xl">{pricing.heading}</h2>
          <p className="mt-4 max-w-4xl text-sm leading-relaxed text-sb-slate">{pricing.disclosure}</p>
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {pricing.rows.map((row) => (
              <article key={row.key} className="flex flex-col rounded-[1.5rem] border border-sb-border bg-white p-5 shadow-warm">
                <h3 className="text-lg font-extrabold text-sb-forest">{row.title}</h3>
                <p className="text-sm font-semibold text-sb-slate">{row.ages}</p>
                <p className="mt-4 text-xs font-extrabold uppercase tracking-wider text-sb-amber-deep">{pricing.entryLabel}</p>
                <ul className="mt-1 divide-y divide-sb-border">
                  {row.entry.map((item) => (
                    <li key={item.name} className="py-2">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                        <span className="font-bold">{item.name}</span>
                        {item.price ? <span className="font-extrabold text-sb-forest">{item.price}</span> : null}
                      </div>
                      {item.note ? <p className="mt-0.5 text-sm text-sb-slate">{item.note}</p> : null}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs font-extrabold uppercase tracking-wider text-sb-amber-deep">{pricing.ongoingLabel}</p>
                <ul className="mt-1 flex-1 divide-y divide-sb-border">
                  {row.ongoing.map((item) => (
                    <li key={item.name} className="py-2 text-sm">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                        <span>{item.name}</span>
                        {item.price ? <span className="font-extrabold text-sb-forest">{item.price}</span> : null}
                      </div>
                      {item.note ? <p className="mt-0.5 text-sb-slate">{item.note}</p> : null}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-col gap-2">
                  <CtaLink link={{ ...row.cta, kind: 'native' }} className={PRIMARY_BTN} onNavigate={onNavigate} track={`home_pricing_${row.key}`} />
                  {row.key === 'reading' ? (
                    <div className="flex gap-2">
                      <a href={`mailto:${CONTACT_EMAIL}?subject=Reading%20placement%20consultation`} className={`${SECONDARY_BTN} flex-1`}>
                        <Mail aria-hidden="true" className="h-4 w-4" /> Email
                      </a>
                      <a
                        href={ZALO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${SECONDARY_BTN} flex-1`}
                        onClick={() => recordClientEvent({ event: 'checkout_start' })}
                      >
                        <MessageCircle aria-hidden="true" className="h-4 w-4" /> Zalo
                      </a>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 6 · Short FAQ (the global Footer follows) */}
      <section className="border-t border-sb-border bg-white px-4 py-16 sm:px-6" aria-labelledby="faq-heading">
        <div className="mx-auto max-w-4xl">
          <h2 id="faq-heading" className="text-3xl font-extrabold text-sb-forest">{faq.heading}</h2>
          <div className="mt-6 divide-y divide-sb-border rounded-[1.25rem] border border-sb-border">
            {faq.items.map((item, index) => (
              <details key={item.q} className="group p-5" open={index === 0}>
                <summary className="cursor-pointer list-none font-bold text-sb-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-amber [&::-webkit-details-marker]:hidden">
                  {item.q}
                </summary>
                <p className="mt-2 leading-relaxed text-sb-slate">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
