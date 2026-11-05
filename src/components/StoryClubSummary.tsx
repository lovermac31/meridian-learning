import type { ReactNode } from 'react';
import type { Locale } from '../i18n/locales';
import { storyClubTryItContent } from '../i18n/content/storyClubTryIt';

type Heading = 'h2' | 'h3';

/** A short list of labelled facts (what, when, who, rules). Plain text, readable without JavaScript. */
function Facts({ facts }: { facts: ReadonlyArray<{ label: string; value: string }> }) {
  return (
    <dl className="mt-3 space-y-2">
      {facts.map((fact) => (
        <div key={fact.label} className="sm:grid sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-3">
          <dt className="font-bold">{fact.label}</dt>
          <dd>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** The free 30-minute Story Time for new families. `children` carries the registration action (a Zalo link). */
export function StoryClubTryIt({ locale, as: H = 'h2', id, children }: { locale: Locale; as?: Heading; id: string; children?: ReactNode }) {
  const c = storyClubTryItContent[locale].tryIt;
  return (
    <section aria-labelledby={id} data-story-club-try-it>
      <H id={id} className={H === 'h2' ? 'text-2xl font-bold' : 'text-xl font-bold'}>{c.heading}</H>
      <Facts facts={c.facts} />
      {children}
    </section>
  );
}

/** The paid 4-week round, stated plainly with the price and the cap. */
export function StoryClubPaidRound({ locale, as: H = 'h2', id }: { locale: Locale; as?: Heading; id: string }) {
  const c = storyClubTryItContent[locale].paid;
  return (
    <section aria-labelledby={id} data-story-club-paid-round>
      <H id={id} className={H === 'h2' ? 'text-2xl font-bold' : 'text-xl font-bold'}>{c.heading}</H>
      <Facts facts={c.facts} />
    </section>
  );
}

/** The refund rule and the make-up rule, in the same words wherever they appear. */
export function StoryClubRefund({ locale, as: H = 'h2', id }: { locale: Locale; as?: Heading; id: string }) {
  const c = storyClubTryItContent[locale].refund;
  return (
    <section aria-labelledby={id} data-story-club-refund>
      <H id={id} className={H === 'h2' ? 'text-2xl font-bold' : 'text-xl font-bold'}>{c.heading}</H>
      <ul className="mt-3 list-disc space-y-2 ps-6">
        {c.points.map((point) => <li key={point}>{point}</li>)}
      </ul>
    </section>
  );
}
