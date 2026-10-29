import { reserveCta, paymentHref } from '../config/payment';
import { AssetNextStep } from './AssetNextStep';
import { Check, Minus } from 'lucide-react';
import type { Locale } from '../i18n/locales';
import { getLocalizedHref } from '../i18n/localizedHref';
import { STORY_CLUB_FREE_STORIES, storyClubContent } from '../i18n/content/storyClub';
import { recordClientEvent } from '../lib/tracker';
import { ToolHero } from './IeltsToolsPage';
import { ProductVideo } from './ProductVideo';
import { STORY_CLUB_VIDEOS, VIDEO_COPY } from '../i18n/content/productVideos';

export const STORY_CLUB_PATH = '/story-club';
const STORY_CLUB_VI_PATH = '/vi/story-club';
const STORY_CLUB_RESERVE_PATH = '/story-club/reserve';

function ZaloButton({ label, className = 'insights-button-primary' }: { label: string; className?: string }) {
  return (
    <a
      className={className}
      href="/go/zalo?utm_source=story-club&utm_content=talk-to-jay"
      target="_blank"
      rel="noopener noreferrer"
      data-cta="story-club-zalo"
      onClick={() => recordClientEvent({ event: 'checkout_start', product_id: 'story-club' })}
    >
      {label}
    </a>
  );
}

export function StoryClubPage({ locale }: { locale: Locale }) {
  const c = storyClubContent[locale];
  // 1-to-1 with Mr. Jay: the live lesson checkout (60 min, adults and young learners).
  const oneToOne = getLocalizedHref('/ai-speaking/lessons', locale);

  return (
    <main id="main-content" tabIndex={-1} className="insights-page ielts-tools-page story-club-page min-h-screen" lang={locale}>
      <ToolHero
        locale={locale}
        title={c.title}
        lead={c.lead}
        eyebrow={c.eyebrow}
        counterpart={locale === 'vi' ? STORY_CLUB_PATH : STORY_CLUB_VI_PATH}
      ><a className="insights-button-primary mt-4" href={paymentHref('story-club', locale)} data-cta="story-club-reserve">{reserveCta(locale)}</a></ToolHero>
      <div className="ielts-tool-content mx-auto max-w-4xl space-y-12 px-5 py-14">
        <section aria-label={c.price.amount} className="story-price ielts-tool-card rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-4xl font-bold">
            {c.price.amount} <span className="text-xl font-semibold">{c.price.unit}</span>
          </p>
          <p className="mt-1 font-semibold">{c.price.seats}</p>
          <p className="mt-3">{c.price.note}</p>
          <div className="story-cta mt-5 max-w-sm">
            <ZaloButton label={c.join.cta} />
            <a className="insights-button-primary mt-3" href={locale === 'vi' ? STORY_CLUB_RESERVE_PATH : `/en${STORY_CLUB_RESERVE_PATH}`} data-cta="story-club-reserve">{reserveCta(locale)}</a>
          </div>
          <p className="mt-3 text-sm">
            <a className="font-semibold underline underline-offset-4" href={STORY_CLUB_FREE_STORIES[locale]} data-link="story-club-free-stories">{c.price.tryFree}</a>
          </p>
        </section>

        <section aria-labelledby="story-videos" data-story-videos>
          <h2 id="story-videos" className="text-3xl font-bold">{VIDEO_COPY[locale].storyClubHeading}</h2>
          <div className="mt-2 grid gap-6 md:grid-cols-2">
            {STORY_CLUB_VIDEOS.map((slug) => <ProductVideo key={slug} slug={slug} locale={locale} />)}
          </div>
        </section>

        <section aria-labelledby="story-week">
          <h2 id="story-week" className="text-3xl font-bold">{c.week.heading}</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {c.week.steps.map((step) => (
              <li key={step.title} className="ielts-tool-card rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold">{step.title}</h3>
                <p className="mt-2">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="story-parents">
          <h2 id="story-parents" className="text-3xl font-bold">{c.parents.heading}</h2>
          <ul className="mt-5 space-y-3">
            {c.parents.items.map((item) => (
              <li key={item} className="flex items-start gap-3 text-lg">
                <Check aria-hidden="true" className="story-check mt-1 h-5 w-5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="story-fit" className="grid gap-6 md:grid-cols-2">
          <h2 id="story-fit" className="text-3xl font-bold md:col-span-2">{c.forWho.heading}</h2>
          <div className="ielts-tool-card rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold">{c.forWho.yesLabel}</h3>
            <ul className="mt-3 space-y-2">
              {c.forWho.yes.map((item) => (
                <li key={item} className="flex items-start gap-3"><Check aria-hidden="true" className="story-check mt-1 h-5 w-5 shrink-0" /><span>{item}</span></li>
              ))}
            </ul>
          </div>
          <div className="ielts-tool-card rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold">{c.forWho.noLabel}</h3>
            <ul className="mt-3 space-y-2">
              {c.forWho.no.map((item) => (
                <li key={item} className="flex items-start gap-3"><Minus aria-hidden="true" className="story-minus mt-1 h-5 w-5 shrink-0" /><span>{item}</span></li>
              ))}
            </ul>
            <a className="mt-4 inline-block font-semibold" href={oneToOne}>{c.forWho.link}</a>
          </div>
        </section>

        <section aria-labelledby="story-older" id="older" className="ielts-tool-card rounded-2xl bg-white p-6 shadow-sm">
          <h2 id="story-older" className="text-2xl font-bold">{c.older.heading}</h2>
          <p className="mt-2 text-lg">{c.older.body}</p>
          <div className="mt-4 flex flex-wrap gap-4">
            <a className="font-semibold" href={oneToOne}>{c.older.oneToOne}</a>
            <a
              className="font-semibold"
              href="/go/zalo?utm_source=story-club&utm_content=talk-to-jay"
              target="_blank"
              rel="noopener noreferrer"
              data-cta="story-club-zalo-older"
              onClick={() => recordClientEvent({ event: 'checkout_start', product_id: 'story-club' })}
            >
              {c.older.ask}
            </a>
          </div>
        </section>

        <section aria-labelledby="story-join">
          <h2 id="story-join" className="text-3xl font-bold">{c.join.heading}</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {c.join.steps.map((step) => (
              <li key={step.title} className="ielts-tool-card rounded-2xl bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold">{step.title}</h3>
                <p className="mt-2">{step.body}</p>
              </li>
            ))}
          </ol>
          <div className="story-cta mt-6 max-w-sm">
            <ZaloButton label={c.join.cta} />
            <a className="insights-button-primary mt-3" href={locale === 'vi' ? STORY_CLUB_RESERVE_PATH : `/en${STORY_CLUB_RESERVE_PATH}`} data-cta="story-club-reserve">{reserveCta(locale)}</a>
            <p className="mt-2 text-sm">{c.join.ctaNote}</p>
          </div>
        </section>

        <section aria-labelledby="story-faq">
          <h2 id="story-faq" className="text-3xl font-bold">{c.faq.heading}</h2>
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
            <ZaloButton label={c.closing.cta} />
          </div>
        </div>
      </div>
    <AssetNextStep pathname={locale === 'vi' ? '/vi/story-club' : '/story-club'} /></main>
  );
}
