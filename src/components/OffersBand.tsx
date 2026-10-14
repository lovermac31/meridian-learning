import { ArrowRight } from 'lucide-react';
import { getHomeContent } from '../i18n/content/home';
import { getLocalizedHref } from '../i18n/localizedHref';
import { getCurrentLocale } from '../i18n/routing';
import { trackCtaClick, type AudienceSegment } from '../lib/analytics';
import { baselineHref } from '../lib/baselineLink';

type Offer = {
  title: string;
  meta: string;
  price?: string;
  action?: string;
  href: string;
  label: string;
  segment: AudienceSegment;
};

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2';

/**
 * OffersBand — homepage layout B (14 Oct 2026). Every paid path, priced,
 * directly under the hero; the header "Book & pricing" CTA anchors here
 * (#book). Three equal columns (Kids / Adults / Writing) on the shared
 * max-w-7xl container; the cards stretch to one height.
 *
 * Every destination is served outside the SPA router (AI Speaking app, the
 * static Young Learners page, the ecosystem /book-diagnostic page), so each
 * row is a native <a>. Hrefs and copy depend on the pathname locale only
 * (server render = hydrating client). Copy lives in home.ts (`offers`).
 *
 * The Kids → Baseline row is the old ProofStrip "Looking for coaching" card,
 * folded in here; it keeps that card's analytics label.
 */
export function OffersBand() {
  const locale = getCurrentLocale();
  const offers = (getHomeContent(locale) ?? getHomeContent('en'))?.offers;
  if (!offers) return null;

  const { kids, adults, writing } = offers;
  const columns: Array<{ key: string; eyebrow: string; title: string; body?: string; items: Offer[] }> = [
    {
      key: 'kids',
      eyebrow: kids.eyebrow,
      title: kids.title,
      items: [
        { ...kids.baseline, href: baselineHref(locale), label: 'IELTS Speaking (social card)', segment: 'parent_student' },
        {
          ...kids.lessons,
          href: `${getLocalizedHref('/young-learners-speaking/', locale)}#pricing`,
          label: 'homepage_offers_lessons_click',
          segment: 'parent_student',
        },
        {
          ...kids.diagnostic,
          href: getLocalizedHref('/book-diagnostic', locale),
          label: 'homepage_offers_diagnostic_click',
          segment: 'parent_student',
        },
      ],
    },
    {
      key: 'adults',
      eyebrow: adults.eyebrow,
      title: adults.title,
      items: [
        {
          ...adults.aiSpeaking,
          href: getLocalizedHref('/ai-speaking', locale),
          label: 'homepage_offers_ai_speaking_click',
          segment: 'parent_student',
        },
        {
          ...adults.coaching,
          href: getLocalizedHref('/ai-speaking/solutions', locale),
          label: 'homepage_offers_coaching_click',
          segment: 'parent_student',
        },
      ],
    },
    {
      key: 'writing',
      eyebrow: writing.eyebrow,
      title: writing.title,
      body: writing.body,
      items: [
        {
          ...writing.demo,
          href: getLocalizedHref('/ai-speaking/writing/demo', locale),
          label: 'homepage_offers_writing_demo_click',
          segment: 'parent_student',
        },
      ],
    },
  ];

  const track = (label: string, segment: AudienceSegment) => {
    try {
      trackCtaClick({ label, type: 'primary', segment });
    } catch {
      /* Measurement must not block navigation. */
    }
  };

  return (
    <section id="book" aria-labelledby="offers-band-title" className="scroll-mt-20 border-b border-jurassic-dark/10 bg-white py-7 sm:py-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between md:gap-6">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9b3a0d]">{offers.eyebrow}</p>
            <h2 id="offers-band-title" className="mt-1 font-display text-2xl leading-tight text-jurassic-dark sm:text-[1.75rem]">
              {offers.title}
            </h2>
          </div>
          <p className="max-w-md text-sm leading-snug text-jurassic-dark/70 md:text-right">{offers.paymentNote}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {columns.map((column) => (
            <div
              key={column.key}
              className="flex min-w-0 flex-col rounded-2xl border border-jurassic-dark/12 bg-jurassic-ivory/60 p-5"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-jurassic-dark/60">{column.eyebrow}</p>
              <h3 className="mt-1 break-words font-serif text-lg leading-snug text-jurassic-dark">{column.title}</h3>
              {column.body ? (
                <p className="mt-2 text-sm leading-relaxed text-jurassic-dark/70">{column.body}</p>
              ) : null}
              <ul className="mt-3 divide-y divide-jurassic-dark/10 border-t border-jurassic-dark/10">
                {column.items.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      onClick={() => track(item.label, item.segment)}
                      className={`group flex min-w-0 items-start justify-between gap-3 rounded-md py-2.5 ${FOCUS_RING}`}
                    >
                      <span className="min-w-0">
                        <span className="block break-words font-semibold text-jurassic-dark group-hover:text-[#933402]">
                          {item.title}
                        </span>
                        <span className="mt-0.5 block break-words text-xs leading-snug text-jurassic-dark/65">{item.meta}</span>
                      </span>
                      <span className="inline-flex flex-none items-center gap-1 whitespace-nowrap pt-0.5 text-sm font-bold text-jurassic-dark">
                        {item.price ?? item.action}
                        <ArrowRight aria-hidden="true" className="h-4 w-4 text-jurassic-accent transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
