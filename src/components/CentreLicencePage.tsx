import { Check } from 'lucide-react';
import type { Locale } from '../i18n/locales';
import { getLocalizedHref } from '../i18n/localizedHref';
import {
  CENTRE_LICENCE_PATH,
  CENTRE_LICENCE_VI_PATH,
  CENTRE_LICENCE_ZALO,
  FOUNDING_PRICE,
  centreLicenceContent,
} from '../i18n/content/centreLicence';
import { ToolHero } from './IeltsToolsPage';

// Unlisted page shared in Zalo: App renders it without the site header, footer and contact launcher, so the
// Zalo button is the only call to action. This slim bar and footer keep the brand and the legal links.
function ZaloButton({ label }: { label: string }) {
  return (
    <a className="insights-button-primary" href={CENTRE_LICENCE_ZALO} target="_blank" rel="noopener noreferrer" data-cta="centre-licence-zalo">
      {label}
    </a>
  );
}

export function CentreLicencePage({ locale }: { locale: Locale }) {
  const c = centreLicenceContent[locale];

  return (
    <>
      <div className="centre-licence-bar border-b border-sb-border bg-sb-cream">
        <div className="mx-auto flex h-14 max-w-4xl items-center px-5">
          <a href={getLocalizedHref('/', locale)} className="font-wordmark text-[1.05rem] text-sb-forest" dir="ltr">
            Jurassic English<sup className="text-sb-amber-deep">™</sup>
          </a>
        </div>
      </div>
      <main id="main-content" tabIndex={-1} className="insights-page ielts-tools-page story-club-page centre-licence-page min-h-screen" lang={locale}>
        <ToolHero
          locale={locale}
          title={c.title}
          lead={c.lead}
          eyebrow={c.eyebrow}
          counterpart={locale === 'vi' ? CENTRE_LICENCE_PATH : CENTRE_LICENCE_VI_PATH}
        >
          <div className="centre-hero-cta mt-6 max-w-sm">
            <ZaloButton label={c.cta} />
            <p className="mt-2 text-sm">{c.ctaNote}</p>
          </div>
        </ToolHero>
        <div className="ielts-tool-content mx-auto max-w-4xl space-y-12 px-5 py-14">
          <section aria-labelledby="centre-why">
            <h2 id="centre-why" className="text-3xl font-bold">{c.why.heading}</h2>
            <ol className="mt-6 grid gap-4 md:grid-cols-3">
              {c.why.items.map((item) => (
                <li key={item.title} className="ielts-tool-card rounded-2xl bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="mt-2">{item.body}</p>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="centre-inside">
            <h2 id="centre-inside" className="text-3xl font-bold">{c.inside.heading}</h2>
            <ul className="mt-5 space-y-3">
              {c.inside.items.map((item) => (
                <li key={item} className="flex items-start gap-3 text-lg">
                  <Check aria-hidden="true" className="story-check mt-1 h-5 w-5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4">{c.inside.note}</p>
          </section>

          <section aria-labelledby="centre-lesson">
            <h2 id="centre-lesson" className="text-3xl font-bold">{c.lesson.heading}</h2>
            <p className="mt-3 text-lg">{c.lesson.intro}</p>
            <figure className="centre-lesson-sheet mt-6 rounded-2xl bg-white p-6 shadow-sm">
              <figcaption className="text-sm font-semibold uppercase tracking-wide">{c.lesson.meta}</figcaption>
              <ol className="mt-4 space-y-5">
                {c.lesson.phases.map((phase) => (
                  <li key={phase.time} className="centre-lesson-phase">
                    <p className="font-bold">
                      <span className="centre-lesson-time">{phase.time}</span> {phase.name}
                    </p>
                    <p className="mt-1">{phase.detail}</p>
                    {phase.script ? (
                      <blockquote className="centre-lesson-script mt-2" lang="en">
                        <span className="block text-sm font-semibold" lang={locale}>{c.lesson.scriptLabel}</span>
                        {phase.script}
                      </blockquote>
                    ) : null}
                  </li>
                ))}
              </ol>
              <h3 className="mt-6 text-lg font-bold">{c.lesson.tiersHeading}</h3>
              <ul className="mt-3 grid gap-3 md:grid-cols-3">
                {c.lesson.tiers.map((tier) => (
                  <li key={tier.title} className="centre-lesson-tier rounded-xl p-4">
                    <p className="font-bold">{tier.title}</p>
                    <p className="mt-1">{tier.body}</p>
                  </li>
                ))}
              </ul>
              <ul className="mt-5 space-y-2">
                {c.lesson.notes.map((note) => (
                  <li key={note} className="flex items-start gap-3">
                    <Check aria-hidden="true" className="story-check mt-1 h-5 w-5 shrink-0" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </figure>
          </section>

          <section aria-labelledby="centre-books">
            <h2 id="centre-books" className="text-3xl font-bold">{c.books.heading}</h2>
            <p className="mt-3 text-lg">{c.books.intro}</p>
            <ul className="mt-6 grid gap-4 md:grid-cols-3">
              {c.books.items.map((book) => (
                <li key={book.id} className="ielts-tool-card overflow-hidden rounded-2xl bg-white shadow-sm">
                  <img
                    src={`/images/centres/${book.id}.webp`}
                    width="720"
                    height="480"
                    alt={book.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-auto w-full"
                  />
                  <div className="p-5">
                    <h3 className="text-lg font-bold" lang="en">{book.title}</h3>
                    <p className="mt-1">{book.theme}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="centre-terms" className="grid gap-6 md:grid-cols-2">
            <div>
              <h2 id="centre-terms" className="text-3xl font-bold">{c.terms.heading}</h2>
              <ul className="mt-5 space-y-3">
                {c.terms.items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check aria-hidden="true" className="story-check mt-1 h-5 w-5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="story-price ielts-tool-card self-start rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="centre-price">
              <h2 id="centre-price" className="text-2xl font-bold">{c.price.heading}</h2>
              <p className="mt-3 text-3xl font-bold" data-price-slot="founding">{FOUNDING_PRICE ?? c.price.onRequest}</p>
              <p className="mt-1 font-semibold">{c.price.unit}</p>
              <p className="mt-3">{c.price.note}</p>
            </div>
          </section>

          <section aria-labelledby="centre-steps">
            <h2 id="centre-steps" className="text-3xl font-bold">{c.steps.heading}</h2>
            <ol className="mt-6 grid gap-4 md:grid-cols-2">
              {c.steps.items.map((step) => (
                <li key={step.title} className="ielts-tool-card rounded-2xl bg-white p-6 shadow-sm">
                  <h3 className="text-lg font-bold">{step.title}</h3>
                  <p className="mt-2">{step.body}</p>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="centre-faq">
            <h2 id="centre-faq" className="text-3xl font-bold">{c.faq.heading}</h2>
            <div className="mt-5 space-y-3">
              {c.faq.items.map((item) => (
                <details key={item.q} className="ielts-tool-card rounded-2xl bg-white p-5 shadow-sm">
                  <summary className="cursor-pointer text-lg font-bold">{item.q}</summary>
                  <p className="mt-2">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        </div>

        <div className="insights-closing">
          <div>
            <p>{c.closing.heading}</p>
            <p className="insights-cta-note">{c.closing.body}</p>
            <div className="insights-closing-actions mt-5">
              <ZaloButton label={c.cta} />
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t border-sb-border bg-white">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-5 gap-y-2 px-5 py-6 text-sm text-sb-slate">
          <span>{c.footer.rights}</span>
          <a className="font-semibold text-sb-forest underline underline-offset-4" href={getLocalizedHref('/legal/privacy', locale)}>{c.footer.privacy}</a>
          <a className="font-semibold text-sb-forest underline underline-offset-4" href={getLocalizedHref('/legal/terms', locale)}>{c.footer.terms}</a>
        </div>
      </footer>
    </>
  );
}
