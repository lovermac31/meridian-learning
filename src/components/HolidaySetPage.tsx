import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Locale } from '../i18n/locales';
import { getLocalizedHref } from '../i18n/localizedHref';
import { PRODUCTS_PATH, productImageSources, productsPage, type ProductCard } from '../i18n/content/products';
import { productPath } from '../i18n/content/productSeo';
import { HOLIDAY_PAGE_COPY, holidayMoney, holidaySetComponents, holidaySetText } from '../i18n/content/holidaySets';
import { HOLIDAY_SETS, HOLIDAY_WINDOW, holidaySetPath, holidaySetSaving, holidayWindowStatus, type HolidaySet } from '../config/holidaySets';
import { buyCta, paymentHref } from '../config/payment';
import { PAYPAL_CARD_COPY, ORDER_CODE_COPY, orderCode, zaloHref } from '../lib/productsSource';
import { holidaySetPaypalHref } from '../lib/holidaySetLinks';
import { createHolidaySetJsonLd } from '../lib/structuredData';
import { recordClientEvent } from '../lib/tracker';
import { useFirstTouch, withFirstTouch } from '../lib/utmFirstTouch';
import { ToolHero } from './IeltsToolsPage';
import { Sample, SampleViewer, coverAlt, productHref, useVisitorSource } from './ProductsPage';
import { StoryClubReservePage } from './StoryClubReservePage';
import { toCard } from './ProductPage';

/**
 * `null` on the server and on the first client render (so the prerender and hydration match), then the real time, refreshed
 * every 15 s: a page left open moves to "ended" (price, buy and PayPal links gone) or to "open" without a reload.
 */
function useTickingNow(intervalMs = 15_000): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

/**
 * One holiday set's own page (28 Nov to 6 Dec 2026). Same blocks as a product page, in the same order: the three items with
 * their real sample pages, THEN the price and the buy buttons (Jay's samples-before-price rule).
 *
 * The window is a date check after load (`useTickingNow`: null on the server and on the first client render, the real time after
 * mount), so no deploy is needed when it passes. Prerendered, the page shows the contents and samples but no price and no buy
 * button; the price block appears only while the window is open, and `api/sample-pack.ts` refuses a code or an order outside
 * it on the server. The page is noindex (routeMetadata.ts, vercel.json): it is dated and temporary, so it never enters the
 * sitemap, the llms catalogue or search.
 */
export function HolidaySetPage({ set, locale }: { set: HolidaySet; locale: Locale }) {
  const c = productsPage(locale);
  const t = HOLIDAY_PAGE_COPY[locale];
  const text = holidaySetText(set.id, locale);
  const items = holidaySetComponents(set);
  const now = useTickingNow();
  const status = now ? holidayWindowStatus(now) : null;
  const source = useVisitorSource();
  const touch = useFirstTouch();
  const [viewer, setViewer] = useState<ProductCard | null>(null);
  const [checkout, setCheckout] = useState(false);
  useEffect(() => { setCheckout(new URLSearchParams(window.location.search).get('checkout') === '1'); }, [set.id]);
  // /products/<set>#<item>-sample opens that item's sample viewer, as a product page does for its own sample.
  useEffect(() => {
    const hit = items.find((item) => window.location.hash === `#${item.id}-sample`);
    if (hit) setViewer(toCard(hit, locale));
  }, [locale, set.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const closeViewer = () => {
    setViewer(null);
    if (window.location.hash.endsWith('-sample')) window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  };
  // No checkout can START outside the window, even from an old ?checkout=1 link (the server refuses a code too). One already open
  // stays open past the end, so a buyer who has a code and a QR on screen at 23:59 does not lose them at midnight.
  const [checkoutOpened, setCheckoutOpened] = useState(false);
  useEffect(() => { if (checkout && status === 'open') setCheckoutOpened(true); }, [checkout, status]);
  if (checkout && (status === 'open' || checkoutOpened)) return <StoryClubReservePage locale={locale} productId={set.id} />;

  const path = holidaySetPath(set.id);
  const code = ORDER_CODE_COPY[locale];
  const sale = holidayMoney(set.saleVnd, locale);
  const startedEvent = () => recordClientEvent({ event: 'checkout_start', product_id: set.id, utm_source: source ?? undefined });
  const separate = (
    <ul className="mt-3 space-y-2" data-holiday-separate={set.id}>
      {items.map((item) => (
        <li key={item.id}>
          <a className="font-bold underline underline-offset-4" href={getLocalizedHref(productPath(item.id), locale)}>{item[locale].title}</a>
          <span className="text-sm"> · {item.price}</span>
        </li>
      ))}
    </ul>
  );
  return (
    <main id="main-content" tabIndex={-1} className="insights-page ielts-tools-page story-club-page products-page min-h-screen" lang={locale} data-holiday-set-page={set.id}>
      <style>{'@media print { body { display: none !important; } }'}</style>
      <ToolHero locale={locale} title={text.title} lead={text.problem} eyebrow={text.label} counterpart={getLocalizedHref(path, locale === 'vi' ? 'en' : 'vi')}>
        <p className="mt-3 text-sm font-semibold" data-holiday-dates>{t.window}: {HOLIDAY_WINDOW.label[locale]}</p>
      </ToolHero>
      <div className="ielts-tool-content mx-auto max-w-3xl space-y-10 px-5 py-14">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-sm">
            <li><a href={getLocalizedHref('/', locale)} className="underline underline-offset-4">{t.home}</a></li>
            <li aria-hidden="true">›</li>
            <li><a href={getLocalizedHref(PRODUCTS_PATH, locale)} className="underline underline-offset-4">{t.products}</a></li>
            <li aria-hidden="true">›</li>
            <li aria-current="page" className="font-bold">{text.title}</li>
          </ol>
        </nav>
        <section className="ielts-tool-card rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="holiday-inside-h" data-product={set.id}>
          <h2 id="holiday-inside-h" className="text-2xl font-bold">{t.includedHeading}</h2>
          <p className="mt-2">{text.inside}</p>
          <p className="mt-2 text-sm">{text.forWho}</p>
          <p className="mt-2">{t.includedLead}</p>
          <ul className="mt-4 space-y-6">
            {items.map((item) => {
              const card = toCard(item, locale);
              return (
                <li key={item.id} className="rounded-xl border border-sb-border p-4" data-holiday-item={item.id}>
                  <div className="flex flex-wrap items-start gap-4">
                    {card.image ? (
                      <img {...productImageSources(card.image)} sizes="112px" alt={coverAlt(c.sample, card.title)} width={112} height={112} loading="lazy" decoding="async" className="aspect-square w-28 rounded-lg object-cover" />
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold">{card.title}</h3>
                      <p className="mt-1 text-sm">{card.inside}</p>
                    </div>
                  </div>
                  <Sample card={card} copy={c.sample} onOpen={() => setViewer(card)} />
                </li>
              );
            })}
          </ul>
        </section>

        <section className="ielts-tool-card rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="holiday-price-h" data-holiday-price-block={set.id} aria-live="polite">
          <h2 id="holiday-price-h" className="text-2xl font-bold">{t.priceHeading}</h2>
          {status === null ? <p className="mt-3" data-holiday-checking>{t.checking}</p> : null}
          {status === 'before' ? <><p className="mt-3 font-semibold" data-holiday-before>{t.beforeNote(HOLIDAY_WINDOW.opens[locale])}</p>{separate}</> : null}
          {status === 'ended' ? <>
            <p className="mt-3 text-lg font-bold" data-holiday-ended>{t.endedHeading}</p>
            <p className="mt-2">{t.endedBody}</p>
            <p className="mt-3 text-sm font-bold">{t.separate}</p>
            {separate}
          </> : null}
          {status === 'open' ? <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(createHolidaySetJsonLd(set, locale)) }} />
            <p className="mt-3 text-3xl font-extrabold" data-price={set.id}>{sale} <span className="text-base font-semibold">{text.unit}</span></p>
            <p className="mt-1 text-sm" data-holiday-list-price>{t.usually(holidayMoney(set.listVnd, locale))} · {t.save(holidayMoney(holidaySetSaving(set), locale))}</p>
            <p className="mt-1 text-sm" data-holiday-closes>{t.ends}: {HOLIDAY_WINDOW.closes[locale]}</p>
            <div className="story-cta mt-4 flex flex-wrap items-center gap-3">
              <a className="insights-button-primary" href={paymentHref(set.id, locale)} data-buy-now={set.id}>{buyCta(set.id, locale)}</a>
              <a
                className="insights-button-secondary"
                href={withFirstTouch(zaloHref(source, set.id), touch)}
                data-cta={`holiday-set-${set.id}`}
                target="_blank"
                rel="noopener noreferrer nofollow"
                onClick={startedEvent}
              >{t.zaloCta}</a>
            </div>
            <p className="mt-3 text-sm" data-order-code={set.id}>{code.before} <strong>{orderCode(source, set.id)}</strong>{code.after}</p>
            <p className="mt-2 text-sm" data-delivery={set.id}>{t.payNote}</p>
            <div className="mt-3 rounded-xl border border-sb-border p-3" data-paypal={set.id}>
              <p className="text-sm font-bold">{PAYPAL_CARD_COPY[locale].lead}</p>
              <a className="insights-button-secondary mt-2" href={holidaySetPaypalHref(set, source, locale)} target="_blank" rel="noopener noreferrer" data-paypal-link={set.id} onClick={startedEvent}>{PAYPAL_CARD_COPY[locale].pay(set.usd)}</a>
              <p className="mt-2 text-sm">{PAYPAL_CARD_COPY[locale].note}</p>
            </div>
            <p className="mt-3 text-sm" data-holiday-honest>{t.honest}</p>
          </> : null}
        </section>
        <a href={getLocalizedHref(PRODUCTS_PATH, locale)} className="inline-flex items-center gap-2 text-sm font-bold underline underline-offset-4">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> {t.all}
        </a>
      </div>
      {viewer && viewer.sample ? <SampleViewer card={viewer} locale={locale} source={source} copy={c.viewer} onClose={closeViewer} touch={touch} /> : null}
    </main>
  );
}

/**
 * The /products listing for the two sets: only while the window is open and only after load (so the static page and the
 * first render are the catalogue as it always was). No price here: the price lives on each set's page, with the samples.
 */
export function HolidaySetsBand({ locale }: { locale: Locale }) {
  const now = useTickingNow();
  const t = HOLIDAY_PAGE_COPY[locale];
  if (!now || holidayWindowStatus(now) !== 'open') return null;
  return (
    <section className="mx-auto max-w-5xl px-5 py-8" aria-labelledby="holiday-band-h" data-holiday-sets-band>
      <h2 id="holiday-band-h" className="text-2xl font-bold">{t.bandHeading}</h2>
      <p className="mt-2">{t.bandLead}</p>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {HOLIDAY_SETS.map((set) => {
          const text = holidaySetText(set.id, locale);
          return (
            <li key={set.id} className="rounded-2xl bg-white p-5 shadow-sm" data-holiday-card={set.id}>
              <p className="text-sm font-semibold">{text.label}</p>
              <h3 className="mt-1 text-xl font-bold">{text.title}</h3>
              <p className="mt-2 text-sm"><strong>{t.includes}:</strong> {holidaySetComponents(set).map((item) => item[locale].title).join(' · ')}</p>
              <p className="mt-2 text-sm">{t.soldOneByOne}</p>
              <a className="insights-button-primary mt-3" href={productHref(holidaySetPath(set.id), locale)} data-holiday-link={set.id}>{t.bandCta}</a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
