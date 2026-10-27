import { useEffect, useRef, useState, type SyntheticEvent } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { Locale } from '../i18n/locales';
import { getLocalizedHref } from '../i18n/localizedHref';
import {
  PRODUCTS_PATH,
  PRODUCTS_UTM,
  PRODUCTS_VI_PATH,
  PRODUCTS_ZALO,
  PRODUCT_IMAGE_DIR,
  productSampleAnchor,
  productSampleFiles,
  productsPage,
  type ProductCard,
} from '../i18n/content/products';
import { ToolHero } from './IeltsToolsPage';
import { SamplePackForm } from './SamplePackForm';
import { PRODUCT_FORMER_IDS } from '../i18n/content/products';
import { productPath } from '../i18n/content/productSeo';
import { ORDER_CODE_COPY, PAYPAL_CARD_COPY, orderCode, productPaypalHref, productUsd, readVisitorSource, zaloHref } from '../lib/productsSource';

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

export type LeadIns = { problem: string; inside: string; forWho: string };
export type SampleCopy = { heading: string; note: string; open: string };

// "See a sample" (Jay, 27 Oct 2026): real pages from the product, shown above the price and the order button.
// Renders only for a card whose sample files are in public/samples (the entry's `sample` stem), so nothing is broken.
// One button per card: three page thumbnails (decorative) and the visible "See the sample pages" text. It opens the
// view-only sample viewer; no sample PDF is linked or published (Jay, 27 Oct 2026).
export function Sample({ card, copy, onOpen }: { card: ProductCard; copy: SampleCopy; onOpen: () => void }) {
  if (!card.sample) return null;
  const files = productSampleFiles(card.sample);
  return (
    <div
      id={productSampleAnchor(card.id)}
      className="mt-4 scroll-mt-24 select-none rounded-xl border border-sb-border bg-sb-cream p-3"
      onContextMenu={blockSave}
      data-sample={card.id}
    >
      <p className="text-sm font-bold">{copy.heading}</p>
      <p className="text-sm">{copy.note}</p>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${copy.open}: ${card.title}`}
        className="group mt-2 block w-full rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-amber"
        data-sample-link={card.id}
      >
        <span className="grid grid-cols-3 gap-2">
          {files.thumbs.map((src) => (
            <img
              key={src}
              src={src}
              alt=""
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

type ViewerCopy = { title: string; prev: string; next: string; close: string; counter: string; end: string; viewOnly: string };
const VIEWER_BUTTON =
  'inline-flex h-11 w-11 items-center justify-center rounded-full border border-sb-border bg-white text-sb-forest disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-amber';

// The view-only sample viewer (Jay, 27 Oct 2026: "I don't want the option to be able to download them as PDF ... I
// want that feature disabled completely"). One watermarked page image at a time: previous/next, swipe, arrow keys,
// a page counter and the card's order button on the last page. No PDF, no download and no print button. Blocking the
// context menu, dragging and selection only deters casual saving; a screenshot still works.
export function SampleViewer({ card, locale, source, copy, onClose, initialPage = 0 }: {
  card: ProductCard; locale: Locale; source: string | null; copy: ViewerCopy; onClose: () => void; initialPage?: number;
}) {
  const pages = productSampleFiles(card.sample!).pages;
  const last = pages.length - 1;
  const [page, setPage] = useState(Math.min(initialPage, last));
  const dialog = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const go = (to: number) => setPage(Math.max(0, Math.min(last, to)));

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
      else if (event.key === 'ArrowRight') setPage((p) => Math.min(last, p + 1));
      else if (event.key === 'ArrowLeft') setPage((p) => Math.max(0, p - 1));
      else if (event.key === 'Tab' && dialog.current) {
        // Keep focus inside the dialog.
        const items = [...dialog.current.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]')];
        if (!items.length) return;
        const first = items[0];
        const end = items[items.length - 1];
        if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) {
          event.preventDefault();
          end.focus();
        } else if (!event.shiftKey && document.activeElement === end) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [last, onClose]);
  useEffect(() => {
    if (page < last) new Image().src = pages[page + 1];
  }, [page, last, pages]);

  const external = card.href === 'zalo';
  const href = external ? zaloHref(source) : productHref(card.href, locale);
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
        <div
          className="mt-2 min-h-0 flex-1"
          style={{ touchAction: 'pan-y' }}
          onPointerDown={(event) => { swipe.current = { x: event.clientX, y: event.clientY }; }}
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
            width={1200}
            height={1699}
            draggable={false}
            className="pointer-events-none mx-auto max-h-[68vh] w-auto rounded border border-sb-border bg-white object-contain"
            data-viewer-page={page + 1}
          />
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
            <div className="story-cta mt-2">
              <a className="insights-button-primary" href={href} data-viewer-order={card.id} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                {card.cta}
              </a>
            </div>
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
  // On the /products hub the option is one line after the order button; its note folds into the card's Details.
  if (compact) {
    return (
      <p className="mt-2 text-sm" data-paypal={card.id}>
        {copy.lead}{' '}
        <a href={productPaypalHref(card.id, source)} target="_blank" rel="noopener noreferrer" className="font-bold underline underline-offset-4 hover:text-sb-amber-deep" data-paypal-link={card.id}>
          {copy.pay(productUsd(card.price))}
        </a>
      </p>
    );
  }
  return (
    <div className="mt-3 rounded-xl border border-sb-border p-3" data-paypal={card.id}>
      <p className="text-sm font-bold">{copy.lead}</p>
      <a
        href={productPaypalHref(card.id, source)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-block text-sm font-bold underline underline-offset-4 hover:text-sb-amber-deep"
        data-paypal-link={card.id}
      >
        {copy.pay(productUsd(card.price))}
      </a>
      <p className="mt-1 text-xs">{copy.note}</p>
    </div>
  );
}

const DETAILS_LABEL: Record<Locale, string> = { en: 'Details', vi: 'Chi tiết' };

/** The first sentence of a card's "Who it's for" (the collapsed card's one line); "Mr. Jay" and decimals don't end it. */
export function firstSentence(text: string): string {
  const match = text.match(/^.*?(?<!\bMr|\bMs|\bDr)[.!?](?=\s+\S)/);
  return match ? match[0] : text;
}

function Card({ card, locale, delivery, leadIns, sample, source, onOpenSample }: {
  card: ProductCard; locale: Locale; delivery: string; leadIns: LeadIns; sample: SampleCopy; source: string | null;
  onOpenSample: (card: ProductCard) => void;
}) {
  const external = card.href === 'zalo';
  const href = external ? zaloHref(source) : productHref(card.href, locale);
  const code = ORDER_CODE_COPY[locale];
  const detailsLabel = DETAILS_LABEL[locale];
  return (
    <li className="ielts-tool-card flex scroll-mt-24 flex-col rounded-2xl bg-white p-4 shadow-sm sm:p-6" id={card.id}>
      {(PRODUCT_FORMER_IDS[card.id] ?? []).map((former) => (
        <span key={former} id={former} className="block scroll-mt-24" aria-hidden="true" />
      ))}
      {/* Collapsed card (website assessment, 27 Oct 2026, fix 4): name, who it's for, price and two buttons; the problem,
          what's inside and the sample thumbnails fold into "Details" (a <details>, so the prerendered page keeps them). */}
      <div className="flex items-start gap-3">
        {card.image ? (
          // Decorative: the card title follows as a heading, so the image has empty alt text.
          <img
            src={`${PRODUCT_IMAGE_DIR}/${card.image}.webp`}
            alt=""
            width={480}
            height={480}
            loading="lazy"
            decoding="async"
            className="aspect-square w-16 flex-none rounded-xl object-cover sm:w-20"
            data-product-image={card.id}
          />
        ) : null}
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-[#8a5a00]">{card.label}</p>
          <h3 className="mt-1 text-lg font-bold leading-snug">
            {/* Each card has its own indexable page (Jay, 27 Oct 2026); the card stays on the hub. */}
            <a href={getLocalizedHref(productPath(card.id), locale)} className="underline-offset-4 hover:underline" data-product-page={card.id}>
              {card.title}
            </a>
          </h3>
          <p className="mt-1 text-sm" data-for-who={card.id}>{firstSentence(card.forWho)}</p>
        </div>
      </div>
      <details className="group mt-2 flex-1" data-details={card.id}>
        <summary className="cursor-pointer text-sm font-bold underline underline-offset-4">{detailsLabel}</summary>
        <dl className="mt-2 space-y-2">
          {(['problem', 'inside', 'forWho'] as const).map((key) => (
            <div key={key}>
              <dt className="text-sm font-bold">{leadIns[key]}</dt>
              <dd>{card[key]}</dd>
            </div>
          ))}
        </dl>
        <Sample card={card} copy={sample} onOpen={() => onOpenSample(card)} />
        {card.delivery ? <p className="mt-2 text-sm" data-delivery={card.id}>{delivery}</p> : null}
        {card.paypal ? <p className="mt-2 text-sm" data-paypal-note={card.id}>{PAYPAL_CARD_COPY[locale].note}</p> : null}
      </details>
      <p className="mt-3 text-2xl font-bold" data-price={card.id}>
        {card.price} <span className="text-base font-semibold">{card.unit}</span>
      </p>
      <div className="story-cta mt-3">
        <div className="flex flex-wrap gap-2">
          <a
            className="insights-button-primary"
            href={href}
            data-cta={`product-${card.id}`}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {card.cta}
          </a>
          {card.sample ? (
            <button type="button" className="insights-button-secondary" onClick={() => onOpenSample(card)} data-sample-open={card.id}>
              {sample.heading}
            </button>
          ) : null}
        </div>
        {external ? (
          <p className="mt-2 text-xs" data-order-code={card.id}>
            {code.before} <strong>{orderCode(source, card.id)}</strong>{code.after}
          </p>
        ) : null}
        {card.paypal ? <PayPalOption card={card} locale={locale} source={source} compact /> : null}
      </div>
    </li>
  );
}

export function ProductsPage({ locale }: { locale: Locale }) {
  const c = productsPage(locale);
  const source = useVisitorSource();
  const [viewer, setViewer] = useState<ProductCard | null>(null);
  // /products#<card>-sample (the header Baseline button, the country pages) opens the viewer at that card's sample.
  useEffect(() => {
    const openFromHash = () => {
      const id = window.location.hash.match(/^#(.+)-sample$/)?.[1];
      const card = id ? productsPage(locale).sections.flatMap((section) => section.cards).find((entry) => entry.id === id && entry.sample) : undefined;
      if (card) setViewer(card);
    };
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, [locale]);
  const closeViewer = () => {
    const id = viewer?.id;
    setViewer(null);
    // Closing leaves the page on the card, and a reload does not reopen the viewer.
    if (id && window.location.hash === `#${id}-sample`) window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${id}`);
  };
  return (
    <main id="main-content" tabIndex={-1} className="insights-page ielts-tools-page story-club-page products-page min-h-screen" lang={locale}>
      {/* Deterrent: printing /products gives a blank page (Jay, 27 Oct 2026). */}
      <style>{'@media print { body { display: none !important; } }'}</style>
      <ToolHero
        locale={locale}
        title={c.title}
        lead={c.lead}
        eyebrow={c.eyebrow}
        counterpart={locale === 'vi' ? PRODUCTS_PATH : PRODUCTS_VI_PATH}
      />
      <div className="ielts-tool-content mx-auto max-w-5xl space-y-12 px-5 py-14">
        <a href={productHref('/', locale)} className="inline-flex items-center gap-2 text-sm font-bold underline underline-offset-4">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> {c.back}
        </a>
        {c.sections.map((section) => (
          <section key={section.id} id={section.id} aria-labelledby={`${section.id}-h`} className="scroll-mt-24">
            <h2 id={`${section.id}-h`} className="text-3xl font-bold">{section.heading}</h2>
            <p className="mt-2 text-lg">{section.intro}</p>
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {section.cards.map((card) => (
                <Card key={card.id} card={card} locale={locale} delivery={c.delivery} leadIns={c.leadIns} sample={c.sample} source={source} onOpenSample={setViewer} />
              ))}
            </ul>
            {section.also.map((line) => (
              <p key={line.id} className="mt-4 text-sm" data-also={line.id}>
                {line.before}<a href={`#${line.id}`} className="font-bold underline underline-offset-4">{line.title}</a>{line.after}
              </p>
            ))}
          </section>
        ))}
      </div>
      {/* The free sample pack at the end of /products (website assessment, 27 Oct 2026, lead-capture spec). */}
      <SamplePackForm placement="products" />
      <div className="insights-closing">
        <div>
          <p>{c.closing.heading}</p>
          <p className="insights-cta-note">{c.closing.body}</p>
          <div className="insights-closing-actions mt-5">
            <a className="insights-button-primary" href={zaloHref(source)} target="_blank" rel="noopener noreferrer" data-cta="products-closing">
              {c.closing.cta}
            </a>
          </div>
        </div>
      </div>
      {viewer ? <SampleViewer card={viewer} locale={locale} source={source} copy={c.viewer} onClose={closeViewer} /> : null}
    </main>
  );
}
