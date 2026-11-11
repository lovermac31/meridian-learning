import { buyCta, paymentHref, paidOffer } from '../config/payment';
import { CrawlResources } from './CrawlResources';
import { useEffect, useId, useRef, useState, type SyntheticEvent } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Eye, QrCode, Users, Video, X } from 'lucide-react';
import type { Locale } from '../i18n/locales';
import { getLocalizedHref } from '../i18n/localizedHref';
import {
  IELTS_GROUPS,
  IELTS_HOME,
  PRODUCT_SEGMENTS,
  PRODUCTS_PATH,
  PRODUCTS_UTM,
  PRODUCTS_VI_PATH,
  PRODUCTS_ZALO,
  productImageSources,
  productSampleAnchor,
  productSampleFiles,
  productsPage,
  WORKBOOKS_SEGMENT,
  WORKBOOK_AGES,
  type IeltsGroup,
  type ProductCard,
  type ProductSectionId,
  type ProductSegmentId,
} from '../i18n/content/products';
import { fetchSampleText, type SampleTextDocument } from '../lib/sampleText';
import { SamplePackForm } from './SamplePackForm';
import { PAUSED_COPY, PRODUCT_FORMER_IDS, pausedWaitlistHref } from '../i18n/content/products';
import { FAQ_QUESTIONS, productPath } from '../i18n/content/productSeo';
import { getOverhaulContent } from '../i18n/content/overhaul';
import { ieltsAppHref } from '../lib/ieltsApp';
import { IeltsAppEntrance } from './IeltsAppEntrance';
import { PRODUCT_VIDEO_ANCHOR, VIDEO_COPY } from '../i18n/content/productVideos';
import { ORDER_CODE_COPY, PAYPAL_CARD_COPY, REGIONAL_COPY, orderCode, productPaypalHref, productUsd, readVisitorSource, zaloHref } from '../lib/productsSource';
import { MARKET_IDS, MARKET_LABELS, OTHER_MARKET, hasRegionalPrice, regionalUsdRange } from '../lib/regionalPrice';
import { recordClientEvent } from '../lib/tracker';
import { isPortalBuyEnabled, getPortalBuyUrl } from '../config/portalBuy';
import { useFirstTouch, withFirstTouch, type FirstTouch } from '../lib/utmFirstTouch';
import { LEMONSQUEEZY_COPY, isLemonSqueezyEnabled, lemonSqueezyCheckout, lemonSqueezyHref } from '../config/lemonSqueezy';

/** The visit's utm_source, read after hydration so the prerendered page and the first client render match. */
export function useVisitorSource(): string | null {
  const [source, setSource] = useState<string | null>(null);
  useEffect(() => {
    let storage: Storage | null = null;
    try {
      storage = window.sessionStorage;
    } catch {
      storage = null;
    }
    setSource(readVisitorSource(window.location.search, storage));
  }, []);
  return source;
}

/** The page's own language version of an internal path, tagged utm_source=products (query before any #anchor). */
export function productHref(href: string, locale: Locale): string {
  if (href === 'zalo') return PRODUCTS_ZALO;
  const [base, hash] = getLocalizedHref(href, locale).split('#');
  return `${base}${base.includes('?') ? '&' : '?'}${PRODUCTS_UTM}${hash ? `#${hash}` : ''}`;
}

/** An IELTS card's home page on /ai-speaking (Speaking or Writing), in the page language, tagged utm_source=products. */
export const ieltsHomeHref = (group: 'speaking' | 'writing', locale: Locale) => `${IELTS_HOME[group][locale]}?${PRODUCTS_UTM}`;

/** One line under an IELTS card or on its product page: back to its IELTS home page. */
export function IeltsHomeLink({ group, locale, label, id }: { group: IeltsGroup; locale: Locale; label?: string; id: string }) {
  const home = IELTS_HOME[group];
  if (!home || !label) return null;
  return (
    <p className="mt-2 text-sm" data-ielts-home={id}>
      <a href={`${home[locale]}?${PRODUCTS_UTM}`} className="font-bold underline underline-offset-4 hover:text-sb-amber-deep">{label} →</a>
    </p>
  );
}

export type LeadIns = { problem: string; inside: string; forWho: string; books: string };

/** A card's extra link (e.g. the Writing Baseline's sample reports), in the page language and tagged like the hub. */
export function CardLink({ card, locale }: { card: ProductCard; locale: Locale }) {
  if (!card.link) return null;
  return (
    <p className="mt-2 text-sm" data-card-link={card.id}>
      <a href={productHref(card.link.href, locale)} className="font-bold underline underline-offset-4 hover:text-sb-amber-deep">{card.link.label} →</a>
    </p>
  );
}
/** Audit fix 7 (11 Nov 2026): how the book was made, above the price (champagne panel, navy text, crimson rule). */
export function CreditLine({ card }: { card: ProductCard }) {
  if (!card.credit) return null;
  return <p className="mt-3 rounded-lg border-l-4 border-[#9B1C31] bg-[#F3E8CF] px-3 py-2 text-sm font-medium text-[#13294B]" data-ai-credit={card.id}>{card.credit}</p>;
}

/** Audit fix 4 (11 Nov 2026): a paused product shows this instead of every buy, VietQR, PayPal and Zalo order button. */
export function PausedNote({ card, locale }: { card: ProductCard; locale: Locale }) {
  const t = PAUSED_COPY[locale];
  return (
    <div className="mt-3 rounded-xl border-l-4 border-[#9B1C31] bg-[#F3E8CF] p-4 text-[#13294B]" data-paused-waitlist={card.id}>
      <p className="font-semibold">{t.note}</p>
      <a className="mt-3 inline-flex min-h-11 items-center rounded-full bg-[#13294B] px-5 py-2 text-sm font-bold underline-offset-4 hover:underline" style={{ color: '#F3E8CF' }} href={pausedWaitlistHref(card.id)} target="_blank" rel="noopener noreferrer nofollow" data-paused-zalo={card.id}>{t.cta}</a>
    </div>
  );
}
export type SampleCopy = { heading: string; note: string; open: string; cover: string; page: string };

/** Short factual alt text for a product cover or a sample page (templates live in the product copy, one per language). */
export const coverAlt = (copy: SampleCopy, title: string) => copy.cover.replace('{title}', title);
export const samplePageAlt = (copy: SampleCopy, title: string, n: number) => copy.page.replace('{title}', title).replace('{n}', String(n));

// "See a sample" (Jay, 27 Oct 2026): real pages from the product, shown above the price and the order button.
// Renders only for a card whose sample files are in public/samples (the entry's `sample` stem), so nothing is broken.
// One button per card: three page thumbnails (decorative) and the visible "See the sample pages" text. It opens the
// view-only sample viewer; no sample PDF is linked or published (Jay, 27 Oct 2026).
export function Sample({ card, copy, onOpen, compact = false }: { card: ProductCard; copy: SampleCopy; onOpen: () => void; compact?: boolean }) {
  if (!card.sample) return null;
  const files = productSampleFiles(card.sample);
  return (
    <div
      id={productSampleAnchor(card.id)}
      className={compact ? 'product-row-sample scroll-mt-24 select-none' : 'mt-4 scroll-mt-24 select-none rounded-xl border border-sb-border bg-sb-cream p-3'}
      onContextMenu={blockSave}
      data-sample={card.id}
    >
      <p className="text-sm font-bold">{copy.heading}</p>
      {compact ? null : <p className="text-sm">{copy.note}</p>}
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${copy.open}: ${card.title}`}
        className="group mt-2 block w-full rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-amber"
        data-sample-link={card.id}
      >
        <span className="grid grid-cols-3 gap-2">
          {files.thumbs.map((src, i) => (
            <img
              key={src}
              src={src}
              srcSet={files.thumbSrcSets[i]}
              sizes={compact ? '(min-width: 768px) 72px, calc((100vw - 120px) / 3)' : '(min-width: 768px) 135px, calc((100vw - 120px) / 3)'}
              alt={samplePageAlt(copy, card.title, i + 1)}
              width={600}
              height={849}
              loading="lazy"
              decoding="async"
              draggable={false}
              className="aspect-[210/297] w-full rounded border border-sb-border bg-white object-cover object-top"
              data-sample-page={card.id}
            />
          ))}
        </span>
        <span className="mt-2 inline-block text-sm font-bold underline underline-offset-4 group-hover:text-sb-amber-deep">{copy.open}</span>
      </button>
    </div>
  );
}

const blockSave = (event: SyntheticEvent) => event.preventDefault();

type ViewerCopy = ReturnType<typeof productsPage>['viewer'];
const VIEWER_BUTTON =
  'inline-flex h-11 w-11 items-center justify-center rounded-full border border-sb-border bg-white text-sb-forest disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-amber';

// The view-only sample viewer (Jay, 27 Oct 2026: "I don't want the option to be able to download them as PDF ... I
// want that feature disabled completely"). One watermarked page image at a time: previous/next, swipe, arrow keys,
// a page counter and the card's order button on the last page. No PDF, no download and no print button. Blocking the
// context menu, dragging and selection only deters casual saving; a screenshot still works.
export function SampleViewer({ card, locale, source, copy, onClose, initialPage = 0, touch = null }: {
  card: ProductCard; locale: Locale; source: string | null; copy: ViewerCopy; onClose: () => void; initialPage?: number; touch?: FirstTouch | null;
}) {
  const pages = productSampleFiles(card.sample!).pages;
  const last = pages.length - 1;
  const [page, setPage] = useState(Math.min(initialPage, last));
  const [text, setText] = useState<SampleTextDocument | null>(null);
  const [textFailed, setTextFailed] = useState(false);
  const [showText, setShowText] = useState(false);
  const textId = useId();
  const dialog = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const go = (to: number) => setPage(Math.max(0, Math.min(last, to)));

  useEffect(() => {
    const controller = new AbortController();
    setText(null);
    setTextFailed(false);
    fetchSampleText(card.id, card.sample!, pages.length, controller.signal)
      .then((document) => { if (!controller.signal.aborted) setText(document); })
      .catch(() => { if (!controller.signal.aborted) setTextFailed(true); });
    return () => controller.abort();
  }, [card.id, card.sample, pages.length]);

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      opener?.focus();
    };
  }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      else if ((event.key === 'ArrowRight' || event.key === 'ArrowLeft') && event.target instanceof Element && event.target.closest('[data-viewer-text-page][tabindex="0"]')) return;
      else if (event.key === 'ArrowRight') setPage((p) => Math.min(last, p + 1));
      else if (event.key === 'ArrowLeft') setPage((p) => Math.max(0, p - 1));
      else if (event.key === 'Tab' && dialog.current) {
        // Handle every Tab explicitly: WebKit can skip buttons in its native Tab order.
        const items = [...dialog.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [data-viewer-text-page][tabindex="0"]')];
        if (!items.length) return;
        const current = items.indexOf(document.activeElement as HTMLElement);
        const next = event.shiftKey
          ? (current <= 0 ? items.length - 1 : current - 1)
          : (current + 1) % items.length;
        event.preventDefault();
        items[next].focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [last, onClose]);
  useEffect(() => {
    if (page < last) new Image().src = pages[page + 1];
  }, [page, last, pages]);

  const external = card.href === 'zalo';
  const href = external ? withFirstTouch(zaloHref(source), touch) : productHref(card.href, locale);
  const counter = copy.counter.replace('{n}', String(page + 1)).replace('{total}', String(pages.length));
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-3"
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-label={`${copy.title}: ${card.title}`}
        tabIndex={-1}
        className="flex max-h-full w-full max-w-xl select-none flex-col rounded-2xl bg-white p-3 focus:outline-none"
        style={{ WebkitTouchCallout: 'none' }}
        onContextMenu={blockSave}
        onDragStart={blockSave}
        data-sample-viewer={card.id}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-bold">{card.title}</p>
          <button type="button" onClick={onClose} aria-label={copy.close} className={VIEWER_BUTTON} data-viewer-close>
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
        <button
          type="button"
          className="mt-2 min-h-11 self-start rounded-lg border border-sb-border bg-white px-3 py-2 text-sm font-bold text-sb-forest underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-amber"
          aria-expanded={showText}
          aria-controls={`${textId}-region`}
          onClick={() => setShowText((value) => !value)}
          data-viewer-text-toggle
        >{showText ? copy.hideText : copy.textVersion}</button>
        <div
          className={`mt-2 min-h-0 flex-1 ${showText ? 'overflow-y-auto' : 'overflow-hidden'}`}
          data-viewer-viewport
          style={{ touchAction: 'pan-y' }}
          onPointerDown={(event) => {
            swipe.current = event.target instanceof Element && event.target.closest('[data-viewer-text-page]')
              ? null : { x: event.clientX, y: event.clientY };
          }}
          onPointerUp={(event) => {
            const from = swipe.current;
            swipe.current = null;
            if (!from) return;
            const dx = event.clientX - from.x;
            if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(event.clientY - from.y)) go(page + (dx < 0 ? 1 : -1));
          }}
        >
          <img
            key={pages[page]}
            src={pages[page]}
            alt={`${card.title}: ${counter}`}
            aria-describedby={textId}
            width={1200}
            height={1699}
            draggable={false}
            style={{ maxHeight: page === last ? 'min(68vh, calc(100dvh - 24rem))' : 'min(68vh, calc(100dvh - 16rem))' }}
            className="pointer-events-none mx-auto max-h-[68vh] w-auto rounded border border-sb-border bg-white object-contain"
            data-viewer-page={page + 1}
          />
          <div
            id={`${textId}-region`}
            role="region"
            aria-label={`${copy.pageText}: ${counter}`}
            aria-live="polite"
            aria-atomic="true"
            tabIndex={showText ? 0 : -1}
            className={showText ? 'mt-3 max-h-[45vh] overflow-y-auto select-text whitespace-pre-wrap rounded-lg border border-sb-border bg-sb-cream p-3 text-sm leading-relaxed text-sb-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-amber' : 'sr-only'}
            data-viewer-text-page={page + 1}
          >
            <div id={textId} data-viewer-description>{text ? text.pages[page].text : textFailed ? copy.textError : copy.textLoading}</div>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between gap-2">
          <button type="button" onClick={() => go(page - 1)} disabled={page === 0} aria-label={copy.prev} className={VIEWER_BUTTON} data-viewer-prev>
            <ChevronLeft aria-hidden="true" className="h-5 w-5" />
          </button>
          <p className="text-sm font-semibold" aria-live="polite" data-viewer-counter>{counter}</p>
          <button type="button" onClick={() => go(page + 1)} disabled={page === last} aria-label={copy.next} className={VIEWER_BUTTON} data-viewer-next>
            <ChevronRight aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
        {page === last ? (
          <div className="mt-3 text-center" data-viewer-end>
            <p className="text-sm font-bold">{copy.end}</p>
            <p className="mt-1 text-lg font-bold">{card.price} <span className="text-sm font-semibold">{card.unit}</span></p>
            {card.paused ? <PausedNote card={card} locale={locale} /> : (
              <div className="story-cta mt-2">
                <a className="insights-button-primary" href={href} data-viewer-order={card.id} {...(external ? { target: '_blank', rel: 'noopener noreferrer nofollow' } : {})}>
                  {card.cta}
                </a>
              </div>
            )}
          </div>
        ) : null}
        <p className="mt-2 text-center text-xs text-sb-slate">{copy.viewOnly}</p>
      </div>
    </div>
  );
}

// S1: the US$ price by PayPal for international buyers, after the VND order button (VND and VietQR stay first).
export function PayPalOption({ card, locale, source, compact = false }: { card: ProductCard; locale: Locale; source: string | null; compact?: boolean }) {
  const copy = PAYPAL_CARD_COPY[locale];
  const regional = hasRegionalPrice(card.id);
  const [market, setMarket] = useState<string>(OTHER_MARKET);
  const chosen = regional && market !== OTHER_MARKET ? market : null;
  // Regional price (Jay, 3 Nov 2026): the hub shows one line that leads to the product page, where the buyer picks a country.
  if (regional && compact) {
    return (
      <p className="mt-2 text-sm" data-paypal={card.id} data-regional-price={card.id}>
        <a href={productHref(`${productPath(card.id)}#regional-price`, locale)} className="font-bold underline underline-offset-4 hover:text-sb-amber-deep" data-paypal-link={card.id}>
          {REGIONAL_COPY[locale].compact(regionalUsdRange(card.id).low)}
        </a>
      </p>
    );
  }
  // On the /products hub the option is one line after the order button; its note folds into the card's Details.
  if (compact) {
    return (
      <p className="mt-2 text-sm" data-paypal={card.id}>
        {copy.lead}{' '}
        <a
          href={productPaypalHref(card.id, source, locale)}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold underline underline-offset-4 hover:text-sb-amber-deep"
          data-paypal-link={card.id}
          onClick={() => recordClientEvent({ event: 'checkout_start', product_id: card.id, utm_source: source ?? undefined })}
        >
          {copy.pay(productUsd(card.price))}
        </a>
      </p>
    );
  }
  const regionalCopy = REGIONAL_COPY[locale];
  const range = regional ? regionalUsdRange(card.id) : null;
  return (
    <div className="mt-3 rounded-xl border border-sb-border p-3" data-paypal={card.id} id={regional ? 'regional-price' : undefined} data-regional-price={regional ? card.id : undefined}>
      <p className="text-sm font-bold">{copy.lead}</p>
      {regional ? (
        <label className="mt-1 block text-sm">
          <span className="block">{regionalCopy.label}</span>
          <select className="mt-1 w-full rounded-lg border border-sb-border bg-white p-2" value={market} onChange={(event) => setMarket(event.target.value)} data-regional-select={card.id}>
            <option value={OTHER_MARKET}>{regionalCopy.other}</option>
            {MARKET_IDS.map((id) => <option key={id} value={id}>{MARKET_LABELS[id][locale]}</option>)}
          </select>
        </label>
      ) : null}
      <a
        href={productPaypalHref(card.id, source, locale, chosen)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-block text-sm font-bold underline underline-offset-4 hover:text-sb-amber-deep"
        data-paypal-link={card.id}
        onClick={() => recordClientEvent({ event: 'checkout_start', product_id: card.id, utm_source: source ?? undefined })}
      >
        {copy.pay(productUsd(card.price, card.id, chosen))}
      </a>
      {range ? <p className="mt-1 text-xs" data-regional-note={card.id}>{regionalCopy.note.replace('%LOW%', String(range.low)).replace('%HIGH%', String(range.high))}</p> : null}
      <p className="mt-1 text-xs">{copy.note}</p>
    </div>
  );
}

/**
 * Card / Alipay / WeChat in US$ through Lemon Squeezy (Jay + CEO, 2 Nov 2026): digital products only, English pages
 * only (VietQR stays the Vietnamese path), and only when the product's checkout URL is configured. Not a data-cta:
 * each card keeps its one order CTA. The first-touch utm_* and the order code ride in the checkout's custom data.
 */
export function LemonSqueezyOption({ card, locale, source, touch, compact = false }: { card: ProductCard; locale: Locale; source: string | null; touch: FirstTouch | null; compact?: boolean }) {
  const base = lemonSqueezyCheckout(card.id);
  if (locale !== 'en' || !card.paypal || !base) return null;
  const copy = LEMONSQUEEZY_COPY[locale];
  const href = lemonSqueezyHref(card.id, base, { source, touch });
  const link = (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-bold underline underline-offset-4 hover:text-sb-amber-deep"
      data-lemonsqueezy-link={card.id}
      onClick={() => recordClientEvent({ event: 'checkout_start', product_id: card.id, utm_source: source ?? undefined })}
    >
      {copy.button(productUsd(card.price))}
    </a>
  );
  if (compact) return <p className="mt-2 text-sm" data-lemonsqueezy={card.id}>{link}</p>;
  return (
    <div className="mt-3 rounded-xl border border-sb-border p-3" data-lemonsqueezy={card.id}>
      {link}
      <p className="mt-1 text-xs">{copy.note}</p>
    </div>
  );
}

const CATEGORY_COPY = {
  en: { label: 'Product sections', names: { families: 'Families', 'story-workbooks': 'Story Workbooks', teachers: 'Teachers', centres: 'Centres', ielts: 'IELTS' }, count: 'products', from: 'from', workbooksSub: 'Levels 1–5 · print-ready A4' },
  vi: { label: 'Các nhóm sản phẩm', names: { families: 'Gia đình', 'story-workbooks': 'Sách truyện bài tập', teachers: 'Giáo viên', centres: 'Trung tâm', ielts: 'IELTS' }, count: 'sản phẩm', from: 'từ', workbooksSub: 'Level 1–5 · in sẵn khổ A4' },
} satisfies Record<Locale, { label: string; names: Record<ProductSegmentId, string>; count: string; from: string; workbooksSub: string }>;

// Hub-only labels for the Stitch layout (Jay's mock, 2 Nov 2026). The layout comes from the mock; every line of copy comes
// from the product data or copy already on the site (Story Club, the Baseline, 1-to-1, the sample and payment lines),
// never from the mock's placeholder text. The announcement bar is omitted: the data holds no dated line to put in it.
type TrustItem = { icon: typeof Users; title: string; body: string };

// The free IELTS Speaking app on top of the IELTS group (Jay + CEO, 2 Nov 2026). Not a PRODUCTS entry: no price, no
// order flow, so it is a plain card (not an <li id>) and the catalogue, JSON-LD and prices stay as they are.
/**
 * One hero per audience (audit fix 9, 11 Nov 2026; SELL-STRATEGY 11 Nov: "families = Level 1 Story Workbooks; teachers =
 * Level 1 Teacher Pack; IELTS stays separate"). A short band right under the page hero, so a phone visitor picks a
 * door before the 47-card catalogue. Approved copy only: section headings, card titles, problem lines and prices.
 * Families also name the Mango single book when it is live. Paused products are never a hero.
 */
export const AUDIENCE_HEROES = [
  { section: 'families', lead: 'story-workbooks-l1', also: 'mango-l2' },
  { section: 'teachers', lead: 'teacher-pack-l1' },
  { section: 'ielts' },
] as const;

function AudienceHeroes({ locale, sections, sampleOpen, categoryNames, countLabel }: {
  locale: Locale;
  sections: ReturnType<typeof productsPage>['sections'];
  sampleOpen: string;
  categoryNames: Record<string, string>;
  countLabel: string;
}) {
  const cards = sections.flatMap((section) => section.cards);
  const live = (id?: string) => (id ? cards.find((card) => card.id === id && !(card as { paused?: boolean }).paused) : undefined);
  return (
    <section className="mx-auto max-w-6xl px-5 pt-8" aria-label={AUDIENCE_HEROES.map((hero) => sections.find((entry) => entry.id === hero.section)?.heading).filter(Boolean).join(' · ')} data-audience-heroes="">
      {/* Rows are shared across the three cards (products.css, .products-audience): heading, title, text, price, extra link and button
          each sit on one line across the row, and the buttons share one baseline whatever the text length (Jay, 11 Nov 2026). */}
      <ul className="products-audience grid gap-4 md:grid-cols-3">
        {AUDIENCE_HEROES.map((hero) => {
          const section = sections.find((entry) => entry.id === hero.section);
          if (!section) return null;
          const lead = 'lead' in hero ? live(hero.lead) : undefined;
          const also = 'also' in hero ? live(hero.also) : undefined;
          return (
            <li key={hero.section} className="products-audience-card flex flex-col rounded-2xl border-t-4 border-[#9B1C31] bg-[#F3E8CF] p-5 text-[#13294B] shadow-sm" data-audience-hero={hero.section}>
              <h2 className="pa-head text-lg font-extrabold">{section.heading}</h2>
              {lead ? (
                <>
                  <p className="pa-title mt-2 font-bold"><a href={getLocalizedHref(productPath(lead.id), locale)} className="underline underline-offset-4" data-audience-lead={lead.id}>{lead.title}</a></p>
                  <p className="pa-text mt-1 text-sm">{lead.problem}</p>
                  <p className="pa-price mt-2 font-extrabold" data-audience-price={lead.id}>{lead.price} <span className="text-sm font-semibold">{lead.unit}</span></p>
                  {also ? <p className="pa-also mt-1 text-sm"><a href={getLocalizedHref(productPath(also.id), locale)} className="font-bold underline underline-offset-4" data-audience-also={also.id}>{also.title} · {also.price}</a></p> : null}
                  <p className="pa-cta mt-auto pt-4"><a href={`#${lead.id}-sample`} className="flex min-h-11 w-full items-center justify-center rounded-full bg-[#13294B] px-5 py-2 text-center text-sm font-bold no-underline" style={{ color: '#F3E8CF' }} data-audience-sample={lead.id}>{sampleOpen}</a></p>
                </>
              ) : (
                <>
                  <p className="pa-intro mt-2 text-sm">{section.intro}</p>
                  <p className="pa-price mt-2 text-sm"><a href={ieltsAppHref('products', locale)} target="_blank" rel="noopener noreferrer" className="font-bold underline underline-offset-4" data-audience-ielts-app="">{IELTS_APP_CARD[locale].title}</a></p>
                  <p className="pa-cta mt-auto pt-4"><a href={`#${section.id}`} className="flex min-h-11 w-full items-center justify-center rounded-full bg-[#13294B] px-5 py-2 text-center text-sm font-bold no-underline" style={{ color: '#F3E8CF' }} data-audience-section={section.id}>{categoryNames[section.id]} · {section.cards.length} {countLabel}</a></p>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const IELTS_APP_CARD: Record<Locale, { label: string; title: string }> = {
  en: { label: 'Free · web app', title: 'Free: IELTS Speaking practice, 2 attempts' },
  vi: { label: 'Miễn phí · ứng dụng web', title: 'Miễn phí: luyện IELTS Speaking, 2 lượt thử' },
};

/**
 * Featured-first (Jay, 2 Nov 2026, "tighten"): the page opens on six full cards; the other 29 sit behind the segment
 * filters and "Show all". The three live services lead; then the Level 1 Printable Storybook Pack (the families tile
 * on the home page), the Level 1 Parent Home Reading Pack (the first parent pack) and the IELTS Speaking Ladder (the
 * first IELTS card). No sales data is in the repo, so the order is the site's own: home tile, then catalogue order.
 */
export const FEATURED_PRODUCTS = ['story-club', 'baseline', 'one-to-one', 'printable-pack', 'parent-pack-l1', 'ielts-speaking-ladder'] as const;
const HUB_COPY: Record<Locale, { trustLabel: string; trust: TrustItem[]; showing: (shown: number, total: number) => string; showAll: (total: number) => string; faq: string }> = {
  en: {
    trustLabel: 'What to expect',
    trust: [
      { icon: Users, title: 'Small groups', body: 'Story Club: up to 6 children a group.' },
      { icon: Video, title: 'Live on Google Meet', body: 'Story Club, the Baseline and 1-to-1 lessons with Mr. Jay.' },
      { icon: Eye, title: 'See a sample', body: 'See exactly what you get before you pay.' },
      { icon: QrCode, title: 'Pay by VietQR', body: 'Nothing is charged until you accept a written order summary.' },
    ],
    showing: (shown, total) => (shown === total ? `Showing all ${total} products` : `Showing ${shown} of ${total} products`),
    showAll: (total) => `Show all ${total} products`,
    faq: 'Questions',
  },
  vi: {
    trustLabel: 'Bạn có thể yên tâm',
    trust: [
      { icon: Users, title: 'Nhóm nhỏ', body: 'Câu lạc bộ Truyện: tối đa 6 bé một nhóm.' },
      { icon: Video, title: 'Học trực tiếp qua Google Meet', body: 'Câu lạc bộ Truyện, buổi Đánh giá và học 1 kèm 1 đều cùng thầy Jay.' },
      { icon: Eye, title: 'Xem mẫu', body: 'Xem đúng những gì bạn nhận được trước khi thanh toán.' },
      { icon: QrCode, title: 'Thanh toán qua VietQR', body: 'Không thu tiền cho đến khi bạn đồng ý bản tóm tắt đơn hàng bằng văn bản.' },
    ],
    showing: (shown, total) => (shown === total ? `Hiển thị tất cả ${total} sản phẩm` : `Hiển thị ${shown}/${total} sản phẩm`),
    showAll: (total) => `Xem tất cả ${total} sản phẩm`,
    faq: 'Câu hỏi thường gặp',
  },
};

/** The first sentence; titles such as Mr. Jay and decimals are not sentence endings. */
export function firstSentence(text: string): string {
  const match = text.match(/^.*?(?<!\bMr|\bMs|\bDr)[.!?](?=\s+\S)/);
  return match ? match[0] : text;
}

/** Resolve public anchors against the same catalogue used for SSR, including former ids and sample links. */
export function productAnchor(hash: string, locale: Locale) {
  let anchor: string;
  try { anchor = decodeURIComponent(hash.replace(/^#/, '')); } catch { return null; }
  const sections = productsPage(locale).sections;
  // #story-workbooks is the Story Workbooks tile and level picker; its five cards (Families data) belong to that segment.
  if (anchor === WORKBOOKS_SEGMENT) return { section: WORKBOOKS_SEGMENT as ProductSegmentId, product: null, sample: false, target: anchor };
  const section = sections.find((entry) => entry.id === anchor || (entry.id === 'ielts' && IELTS_GROUPS.some((group) => anchor === `ielts-${group}`)));
  if (section) return { section: section.id as ProductSegmentId, product: null, sample: false, target: anchor };
  const sample = anchor.endsWith('-sample');
  const id = sample ? anchor.slice(0, -7) : anchor;
  for (const entry of sections) {
    const card = entry.cards.find((card) => card.id === id || PRODUCT_FORMER_IDS[card.id]?.includes(id));
    if (card) return { section: (card.category === 'workbooks' ? WORKBOOKS_SEGMENT : entry.id) as ProductSegmentId, product: card.id, sample: sample && !!card.sample, target: card.id };
  }
  return null;
}

// One wide card per product (the mock's row): icon tile, badge pill and audience line, the title, "The problem" and two
// tick lines from the card's own copy, the sample thumbnails above the price, then the order buttons. DOM order is the
// one the tests and Jay's rule pin: text → sample → price → buttons; the grid places the sample and price on the right.
function Card({ card, locale, delivery, leadIns, sample, source, onOpenSample, ieltsHome, visible, touch }: {
  card: ProductCard; locale: Locale; delivery: string; leadIns: LeadIns; sample: SampleCopy; source: string | null;
  onOpenSample: (card: ProductCard) => void; ieltsHome: Partial<Record<IeltsGroup, string>>; visible: boolean; touch: FirstTouch | null;
}) {
  const external = card.href === 'zalo';
  const href = external ? withFirstTouch(zaloHref(source), touch) : productHref(card.href, locale);
  const code = ORDER_CODE_COPY[locale];
  return (
    <li className="product-row scroll-mt-24 max-md:scroll-mt-36" id={card.id} hidden={!visible}>
      {card.image ? (
        <div className="product-row-icon">
          <img {...productImageSources(card.image)} sizes="72px" alt={coverAlt(sample, card.title)} width={480} height={480} loading="lazy" decoding="async" className="product-row-image aspect-square" data-product-image={card.id} />
        </div>
      ) : null}
      <div className="product-row-head">
        {(PRODUCT_FORMER_IDS[card.id] ?? []).map((former) => (
          <span key={former} id={former} className="block scroll-mt-24" aria-hidden="true" />
        ))}
        <p className="product-row-meta"><span className="product-row-pill">{card.label}</span><span>{firstSentence(card.forWho)}</span></p>
        <h3><a href={getLocalizedHref(productPath(card.id), locale)} data-product-page={card.id}>{card.title}</a></h3>
      </div>
      <dl className="product-row-text">
        <div className="product-row-problem"><dt>{leadIns.problem}</dt><dd>{card.problem}</dd></div>
        <div className="product-row-tick"><dt>{leadIns.inside}</dt><dd>{card.inside}</dd></div>
        <div className="product-row-tick"><dt>{leadIns.forWho}</dt><dd>{card.forWho}</dd></div>
        {card.books ? <div className="product-row-tick" data-workbook-books={card.id}><dt>{leadIns.books}</dt><dd>{card.books.join(' · ')}</dd></div> : null}
      </dl>
      <div className="product-row-notes">
        <CardLink card={card} locale={locale} />
        {card.group ? <IeltsHomeLink group={card.group} locale={locale} label={ieltsHome[card.group]} id={card.id} /> : null}
        {/* Inside the notes area: a direct child of .product-row with no grid-area is auto-placed into the 72px icon column. */}
        <CreditLine card={card} />
      </div>
      <Sample card={card} copy={sample} onOpen={() => onOpenSample(card)} compact />
      <p className="product-row-price" data-price={card.id}>{card.price} <span>{card.unit}</span></p>
      {card.paused ? (
        <div className="product-row-actions story-cta">
          {card.sample ? <button type="button" className="insights-button-secondary" onClick={() => { onOpenSample(card); recordClientEvent({ event: 'sample_open', product_id: card.id }); }} data-sample-open={card.id}>{sample.heading}</button> : null}
          {card.video ? <a href={`${getLocalizedHref(productPath(card.id), locale)}#${PRODUCT_VIDEO_ANCHOR}`} className="product-row-watch" data-watch={card.id}><span aria-hidden="true">▶</span> {VIDEO_COPY[locale].watch}</a> : null}
          <PausedNote card={card} locale={locale} />
        </div>
      ) : <>
      {/* One payment line under the price (the delivery line's own wording); the PayPal link stays in the footer row. */}
      {card.delivery ? <p className="product-row-pay" data-delivery={card.id}>{delivery}</p> : null}
      <div className="product-row-actions story-cta">
        {paidOffer(card.id) ? <a className="insights-button-primary" href={paymentHref(card.id, locale)} data-buy-now={card.id}>{buyCta(card.id, locale)}</a> : null}
        {card.sample ? <button type="button" className="insights-button-secondary" onClick={() => { onOpenSample(card); recordClientEvent({ event: 'sample_open', product_id: card.id }); }} data-sample-open={card.id}>{sample.heading}</button> : null}
        {isPortalBuyEnabled(card.id) ? (
          <a
            className="insights-button-primary portal-buy-btn"
            href={getPortalBuyUrl(card.id, locale)}
            data-portal-buy={card.id}
            data-cta={`portal-buy-${card.id}`}
            onClick={() => recordClientEvent({ event: 'checkout_start', product_id: card.id, utm_source: source ?? undefined })}
          >
            {locale === 'vi' ? 'Mua ngay' : 'Buy'}
          </a>
        ) : null}
        <a className="insights-button-secondary" href={href} data-cta={`product-${card.id}`} onClick={() => { if (external) recordClientEvent({ event: 'checkout_start', product_id: card.id, utm_source: source ?? undefined }); }} {...(external ? { target: '_blank', rel: 'noopener noreferrer nofollow' } : {})}>{card.cta}</a>
        {card.video ? <a href={`${getLocalizedHref(productPath(card.id), locale)}#${PRODUCT_VIDEO_ANCHOR}`} className="product-row-watch" data-watch={card.id}><span aria-hidden="true">▶</span> {VIDEO_COPY[locale].watch}</a> : null}
        {external ? <p className="mt-2 text-xs" data-order-code={card.id}>{code.before} <strong>{orderCode(source, card.id)}</strong>{code.after}</p> : null}
        {card.paypal ? <PayPalOption card={card} locale={locale} source={source} compact /> : null}
        {isLemonSqueezyEnabled(card.id) ? <LemonSqueezyOption card={card} locale={locale} source={source} touch={touch} compact /> : null}
      </div>
      </>}
    </li>
  );
}

export function ProductsPage({ locale }: { locale: Locale }) {
  const c = productsPage(locale);
  const hub = HUB_COPY[locale];
  const { jay: why, ieltsApp } = getOverhaulContent(locale).home;
  const source = useVisitorSource();
  const touch = useFirstTouch();
  const [viewer, setViewer] = useState<ProductCard | null>(null);
  // The segment filter. SSR and the first client render show every section; a segment narrows the page to its cards.
  const [filter, setFilter] = useState<ProductSegmentId | null>(null);
  // Every product shows by default (Jay, 4 Nov 2026: the books must be visible without a click). The segment tiles still
  // narrow the page to one section, and "Show all" brings the full catalogue back after a filter.
  const [showAll, setShowAll] = useState(true);
  const isVisible = (card: { id: string; category?: string }, section: ProductSectionId) =>
    filter === WORKBOOKS_SEGMENT ? card.category === 'workbooks' : filter ? filter === section : showAll || (FEATURED_PRODUCTS as readonly string[]).includes(card.id);
  const categoryCopy = CATEGORY_COPY[locale];
  const total = c.sections.reduce((sum, section) => sum + section.cards.length, 0);
  const shown = c.sections.reduce((sum, section) => sum + section.cards.filter((card) => isVisible(card, section.id)).length, 0);
  const workbookCards = c.sections.flatMap((section) => section.cards).filter((card) => card.category === 'workbooks');
  const workbooksOnly = filter === WORKBOOKS_SEGMENT;
  const faq = [
    { question: FAQ_QUESTIONS[locale].sample, answer: `${c.sample.note} ${c.viewer.viewOnly}` },
    { question: FAQ_QUESTIONS[locale].pay, answer: c.delivery },
    { question: FAQ_QUESTIONS[locale].abroad, answer: PAYPAL_CARD_COPY[locale].note },
    { question: FAQ_QUESTIONS[locale].unsure, answer: c.closing.body },
  ];
  useEffect(() => {
    let scrollTimer: ReturnType<typeof setTimeout>;
    const openFromHash = () => {
      const anchor = productAnchor(window.location.hash, locale);
      if (!anchor) return;
      // A section anchor (#teachers, #ielts-speaking) selects that segment; a card anchor keeps the current segment
      // unless it would hide the card, in which case the whole catalogue shows again.
      setFilter((current) => {
        if (!anchor.product) return anchor.section;
        if (current) return current === anchor.section ? current : anchor.section;
        return showAll || (FEATURED_PRODUCTS as readonly string[]).includes(anchor.product) ? current : anchor.section;
      });
      if (anchor.sample) {
        const card = productsPage(locale).sections.flatMap((section) => section.cards).find((card) => card.id === anchor.product);
        if (card) setViewer(card);
      }
      clearTimeout(scrollTimer);
      // Let a hidden section render before scrolling to a target inside it.
      scrollTimer = setTimeout(() => document.getElementById(anchor.target)?.scrollIntoView({ block: 'start', behavior: 'auto' }), 50);
    };
    const onAnchorClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('.products-page a[href^="#"]');
      if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !productAnchor(link.hash, locale)) return;
      event.preventDefault();
      if (window.location.hash !== link.hash) window.history.pushState(null, '', link.hash);
      openFromHash();
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    window.addEventListener('popstate', openFromHash);
    document.addEventListener('click', onAnchorClick);
    return () => { clearTimeout(scrollTimer); window.removeEventListener('hashchange', openFromHash); window.removeEventListener('popstate', openFromHash); document.removeEventListener('click', onAnchorClick); };
  }, [locale, showAll]);
  const closeViewer = () => {
    const id = viewer?.id;
    setViewer(null);
    // Closing leaves the page on the card, and a reload does not reopen the viewer.
    if (id && window.location.hash === `#${id}-sample`) window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${id}`);
  };
  const counterpart = locale === 'vi' ? PRODUCTS_PATH : PRODUCTS_VI_PATH;
  return (
    <main id="main-content" tabIndex={-1} className="insights-page ielts-tools-page story-club-page products-page min-h-screen" lang={locale}>
      {/* Deterrent: printing /products gives a blank page (Jay, 27 Oct 2026). */}
      <style>{'@media print { body { display: none !important; } }'}</style>
      <header className="products-hero">
        <div className="products-hero-inner">
          <p className="products-eyebrow"><span>{c.eyebrow}</span></p>
          <h1 className={`products-title ${locale === 'vi' ? 'insights-title-native' : 'font-display'}`}>{c.title}</h1>
          <p className="products-lead">{c.lead}</p>
          <div className="insights-language" role="group" aria-label={locale === 'vi' ? 'Ngôn ngữ' : 'Language'}>
            <a className={locale === 'en' ? 'current' : ''} aria-current={locale === 'en' ? 'page' : undefined} href={locale === 'en' ? undefined : counterpart} lang="en">English</a>
            <a className={locale === 'vi' ? 'current' : ''} aria-current={locale === 'vi' ? 'page' : undefined} href={locale === 'vi' ? undefined : counterpart} lang="vi">Tiếng Việt</a>
          </div>
          <ul className="products-trust" aria-label={hub.trustLabel} data-products-trust="">
            {hub.trust.map(({ icon: Icon, title, body }) => (
              <li key={title}><Icon aria-hidden="true" /><span><strong>{title}</strong><small>{body}</small></span></li>
            ))}
          </ul>
        </div>
      </header>
      <AudienceHeroes locale={locale} sections={c.sections} sampleOpen={c.sample.open} categoryNames={categoryCopy.names} countLabel={categoryCopy.count} />
      {/* IELTS app, one row at the top of the catalogue (coverage audit, 2 Nov 2026: the card below sat 31,500 px down). */}
      <IeltsAppEntrance placement="products" locale={locale} variant="banner" />
      <nav aria-label={categoryCopy.label} className="products-overview" data-products-mini-nav="">
        <ul>
          {PRODUCT_SEGMENTS.map((id) => {
            // Story Workbooks is a cross-section tile: its cards are the Families "Workbooks" group (Jay, 3 Nov 2026).
            const cards = id === WORKBOOKS_SEGMENT ? workbookCards : c.sections.find((section) => section.id === id)?.cards;
            if (!cards?.length) return null;
            const lowest = Math.min(...cards.map((card) => Number(card.price.replace(/[^\d]/g, ''))));
            return <li key={id}>
              <button type="button" aria-pressed={filter === id} aria-controls={id} data-category-tile={id} onClick={() => setFilter((current) => (current === id ? null : id))}>
                <span className="products-overview-name">{categoryCopy.names[id]}</span>
                <span className="products-overview-sub">{cards.length} {categoryCopy.count} · {categoryCopy.from} {lowest.toLocaleString('de-DE')}₫</span>
                {id === 'ielts' ? <span className="products-overview-sub">{IELTS_GROUPS.filter((group) => cards.some((card) => card.group === group)).map((group) => c.ielts.groups[group]).join(' · ')}</span> : null}
                {id === WORKBOOKS_SEGMENT ? <span className="products-overview-sub">{categoryCopy.workbooksSub}</span> : null}
              </button>
            </li>;
          })}
        </ul>
      </nav>
      {/* Story Workbooks level picker (Jay, 3 Nov 2026: "I can't find the Story Workbooks"): always visible under the tiles, so the five
          levels are one tap from the first screen. A level link opens that card (and only the five workbook cards). */}
      {workbookCards.length ? (
        <section id={WORKBOOKS_SEGMENT} aria-labelledby={`${WORKBOOKS_SEGMENT}-h`} className="products-workbooks scroll-mt-24 max-md:scroll-mt-36" hidden={filter !== null && !workbooksOnly} data-story-workbooks-band="">
          <div className="products-workbooks-inner">
            <h2 id={`${WORKBOOKS_SEGMENT}-h`}>{c.workbooksBand.heading}</h2>
            <p>{c.workbooksBand.intro}</p>
            <ul aria-label={c.workbooksBand.levels}>
              {workbookCards.map((card) => {
                // A single book (the Mango pilot, 11 Nov 2026) is named, with its level; the bundles stay "Level N".
                const single = card.books?.length === 1;
                const level = single ? card.id.match(/-l(\d)$/)?.[1] : card.title.match(/\d/)?.[0];
                const count = card.unit.match(/\d+/)?.[0];
                const ages = WORKBOOK_AGES[card.id] ?? '';
                return (
                  <li key={card.id}>
                    <a href={`#${card.id}`} data-workbooks-level={card.id}>
                      <strong>{single ? card.title : `Level ${level}`}</strong>
                      <span>{single ? `${c.workbooksBand.singleLevel.replace('{level}', level ?? '')} · ` : ''}{(ages.endsWith('+') ? c.workbooksBand.agesFrom : c.workbooksBand.ages).replace('{ages}', ages.replace('+', ''))}</span>
                      <span>{single ? c.workbooksBand.single : c.workbooksBand.count.replace('{n}', count ?? '')} · <b>{card.price}</b></span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      ) : null}
      <div className="ielts-tool-content products-catalogue">
        <div className="products-toolbar">
          <a href={productHref('/', locale)} className="products-home inline-flex items-center gap-2 font-bold underline underline-offset-4"><ArrowLeft aria-hidden="true" className="h-4 w-4" /> {c.back}</a>
          <p className="products-count" aria-live="polite" data-products-count={shown}>
            <span>{hub.showing(shown, total)}</span>
            {shown < total ? <button type="button" onClick={() => { setFilter(null); setShowAll(true); }} data-products-show-all="">{hub.showAll(total)}</button> : null}
          </p>
        </div>
        {c.sections.map((section) => (
          <section key={section.id} id={section.id} aria-labelledby={`${section.id}-h`} className="products-category scroll-mt-24 max-md:scroll-mt-36" hidden={!section.cards.some((card) => isVisible(card, section.id))} data-category-panel={section.id}>
            <div className="products-category-head" hidden={workbooksOnly}>
              <h2 id={`${section.id}-h`}>{section.heading}</h2>
              <p className="products-category-intro">{section.intro}</p>
            </div>
            {section.id === 'ielts' ? (
              <div className="product-row product-row-free" data-ielts-app-card="">
                <div className="product-row-icon"><img src="/images/w/ielts-app-screen-640.webp" alt={locale === 'vi' ? `Màn hình ứng dụng: ${IELTS_APP_CARD[locale].title}` : `App screen: ${IELTS_APP_CARD[locale].title}`} width={640} height={400} loading="lazy" decoding="async" className="product-row-image" /></div>
                <div className="product-row-head">
                  <p className="product-row-meta"><span className="product-row-pill">{IELTS_APP_CARD[locale].label}</span><span className="product-row-pill" data-ielts-app-adults="">{ieltsApp.adults}</span><span>{ieltsApp.eyebrow}</span></p>
                  <h3><a href={ieltsAppHref('products', locale)} target="_blank" rel="noopener noreferrer" data-cta="ielts-app-products">{IELTS_APP_CARD[locale].title}</a></h3>
                </div>
                <p className="product-row-text">{ieltsApp.body}</p>
                <div className="product-row-actions story-cta">
                  <a className="insights-button-primary" href={ieltsAppHref('products', locale)} target="_blank" rel="noopener noreferrer" data-ielts-app-try="">{ieltsApp.primary}</a>
                  <a className="insights-button-secondary" href={ieltsHomeHref('speaking', locale)}>{ieltsApp.secondary}</a>
                </div>
                <p className="product-row-text" data-live-check-link="">{locale === 'vi' ? 'Muốn có người nghe bạn nói? Bước đầu thấp hơn Đánh giá Nói trực tiếp: ' : 'Want a person to listen? A lower first step than the Baseline: '}<a href={locale === 'vi' ? '/live-speaking-check?lang=vi&utm_source=products' : '/live-speaking-check?utm_source=products'}>{locale === 'vi' ? 'Kiểm tra Nói trực tiếp 30 phút · 250.000₫ (từ 18 tuổi)' : '30-minute Live Speaking Check · 250.000₫ (adults 18+)'}</a></p>
              </div>
            ) : null}
            {(section.id === 'ielts'
              ? IELTS_GROUPS.map((group) => ({ group, workbooks: false, cards: section.cards.filter((card) => card.group === group) }))
              : [{ group: null, workbooks: false, cards: section.cards.filter((card) => card.category !== 'workbooks') }, { group: null, workbooks: true, cards: section.cards.filter((card) => card.category === 'workbooks') }]
            ).filter((list) => list.cards.length > 0).map(({ group, workbooks, cards }) => (
              <div key={group ?? (workbooks ? 'workbooks' : 'all')} data-ielts-group={group ?? undefined} data-workbooks-group={workbooks ? section.id : undefined}>
                {group ? <h3 id={`ielts-${group}`} className="products-ielts-heading scroll-mt-24" hidden={!cards.some((card) => isVisible(card, section.id))}>{c.ielts.groups[group]}</h3> : null}
                {workbooks ? <h3 id={`${section.id}-workbooks`} className="products-ielts-heading scroll-mt-24" hidden={workbooksOnly || !cards.some((card) => isVisible(card, section.id))}>{c.workbooks}</h3> : null}
                <ul className="products-rows">
                  {cards.map((card) => <Card key={card.id} card={card} locale={locale} delivery={c.delivery} leadIns={c.leadIns} sample={c.sample} source={source} onOpenSample={setViewer} ieltsHome={c.ielts.home} visible={isVisible(card, section.id)} touch={touch} />)}
                </ul>
              </div>
            ))}
            {/* Teachers keeps no workbook cards of its own: the "Workbooks" heading leads its pointers to the Story Workbooks (3 Nov 2026). */}
            {!section.cards.some((card) => card.category === 'workbooks') && section.also.some((line) => line.category === 'workbooks')
              ? <h3 id={`${section.id}-workbooks`} className="products-ielts-heading scroll-mt-24" data-workbooks-pointers={section.id} hidden={!showAll && filter !== section.id}>{c.workbooks}</h3>
              : null}
            {section.also.map((line) => <p key={line.id} className="products-also" data-also={line.id} hidden={!showAll && filter !== section.id}>{line.before}<a href={`#${line.id}`} className="font-bold underline underline-offset-4">{line.title}</a>{line.after}</p>)}
          </section>
        ))}
      </div>
      {/* Why Jurassic English: the three "what you can expect" lines from Mr. Jay's section of the home page. */}
      <section className="products-why" aria-labelledby="products-why-h" data-products-why="">
        <div className="products-why-inner">
          <p>{why.eyebrow}</p>
          <h2 id="products-why-h">{why.title}</h2>
          <p className="products-why-lead">{why.expectTitle}</p>
          <ol>
            {why.expect.map((item, index) => (
              <li key={item.title}>
                <span className="products-why-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="products-faq" aria-labelledby="products-faq-h" data-products-faq="">
        <div className="products-faq-inner">
          <h2 id="products-faq-h">{hub.faq}</h2>
          <div className="products-faq-list">
            {faq.map((item, index) => (
              <details key={item.question} open={index === 0}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      {/* The free sample pack at the end of /products (website assessment, 27 Oct 2026, lead-capture spec). */}
      <SamplePackForm placement="products" />
      <div className="insights-closing">
        <div>
          <p>{c.closing.heading}</p>
          <p className="insights-cta-note">{c.closing.body}</p>
          <div className="insights-closing-actions mt-5">
            <a
              className="insights-button-primary"
              href={withFirstTouch(zaloHref(source), touch)}
              target="_blank"
              rel="noopener noreferrer nofollow"
              data-cta="products-closing"
              onClick={() => recordClientEvent({ event: 'checkout_start', utm_source: source ?? undefined })}
            >
              {c.closing.cta}
            </a>
          </div>
        </div>
      </div>
      {viewer ? <SampleViewer card={viewer} locale={locale} source={source} copy={c.viewer} onClose={closeViewer} touch={touch} /> : null}
      <CrawlResources context="products" />
    </main>
  );
}
