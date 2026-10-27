import { useEffect, useRef, useState, type SyntheticEvent } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { Locale } from '../i18n/locales';
import { getLocalizedHref } from '../i18n/localizedHref';
import {
  IELTS_GROUPS,
  IELTS_HOME,
  PRODUCT_SECTIONS,
  PRODUCTS_PATH,
  PRODUCTS_UTM,
  PRODUCTS_VI_PATH,
  PRODUCTS_ZALO,
  productImageSources,
  productSampleAnchor,
  productSampleFiles,
  productsPage,
  type IeltsGroup,
  type ProductCard,
  type ProductSectionId,
} from '../i18n/content/products';
import { ToolHero } from './IeltsToolsPage';
import { SamplePackForm } from './SamplePackForm';
import { PRODUCT_FORMER_IDS } from '../i18n/content/products';
import { productPath } from '../i18n/content/productSeo';
import { PRODUCT_VIDEO_ANCHOR, VIDEO_COPY } from '../i18n/content/productVideos';
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

/** An IELTS card's home page on /ai-speaking (Speaking or Writing), in the page language, tagged utm_source=products. */
export const ieltsHomeHref = (group: IeltsGroup, locale: Locale) => `${IELTS_HOME[group][locale]}?${PRODUCTS_UTM}`;

/** One line under an IELTS card or on its product page: back to its IELTS home page. */
export function IeltsHomeLink({ group, locale, label, id }: { group: IeltsGroup; locale: Locale; label: string; id: string }) {
  return (
    <p className="mt-2 text-sm" data-ielts-home={id}>
      <a href={ieltsHomeHref(group, locale)} className="font-bold underline underline-offset-4 hover:text-sb-amber-deep">{label} →</a>
    </p>
  );
}

export type LeadIns = { problem: string; inside: string; forWho: string };

/** A card's extra link (e.g. the Writing Baseline's sample reports), in the page language and tagged like the hub. */
export function CardLink({ card, locale }: { card: ProductCard; locale: Locale }) {
  if (!card.link) return null;
  return (
    <p className="mt-2 text-sm" data-card-link={card.id}>
      <a href={productHref(card.link.href, locale)} className="font-bold underline underline-offset-4 hover:text-sb-amber-deep">{card.link.label} →</a>
    </p>
  );
}
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
          {files.thumbs.map((src, i) => (
            <img
              key={src}
              src={src}
              srcSet={files.thumbSrcSets[i]}
              sizes="(min-width: 768px) 135px, calc((100vw - 120px) / 3)"
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
        <a href={productPaypalHref(card.id, source, locale)} target="_blank" rel="noopener noreferrer" className="font-bold underline underline-offset-4 hover:text-sb-amber-deep" data-paypal-link={card.id}>
          {copy.pay(productUsd(card.price))}
        </a>
      </p>
    );
  }
  return (
    <div className="mt-3 rounded-xl border border-sb-border p-3" data-paypal={card.id}>
      <p className="text-sm font-bold">{copy.lead}</p>
      <a
        href={productPaypalHref(card.id, source, locale)}
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
const CATEGORY_COPY = {
  en: { label: 'Product sections', names: { families: 'Families', teachers: 'Teachers', centres: 'Centres', ielts: 'IELTS' }, count: 'products', from: 'from' },
  vi: { label: 'Các nhóm sản phẩm', names: { families: 'Gia đình', teachers: 'Giáo viên', centres: 'Trung tâm', ielts: 'IELTS' }, count: 'sản phẩm', from: 'từ' },
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
  const section = sections.find((entry) => entry.id === anchor || (entry.id === 'ielts' && IELTS_GROUPS.some((group) => anchor === `ielts-${group}`)));
  if (section) return { section: section.id, product: null, sample: false, target: anchor };
  const sample = anchor.endsWith('-sample');
  const id = sample ? anchor.slice(0, -7) : anchor;
  for (const entry of sections) {
    const card = entry.cards.find((card) => card.id === id || PRODUCT_FORMER_IDS[card.id]?.includes(id));
    if (card) return { section: entry.id, product: card.id, sample: sample && !!card.sample, target: card.id };
  }
  return null;
}

function Card({ card, locale, delivery, leadIns, sample, source, onOpenSample, ieltsHome, expanded, onToggle }: {
  card: ProductCard; locale: Locale; delivery: string; leadIns: LeadIns; sample: SampleCopy; source: string | null;
  onOpenSample: (card: ProductCard) => void; ieltsHome: Record<IeltsGroup, string>; expanded: boolean; onToggle: () => void;
}) {
  const external = card.href === 'zalo';
  const href = external ? zaloHref(source) : productHref(card.href, locale);
  const code = ORDER_CODE_COPY[locale];
  return (
    <li className="product-row ielts-tool-card scroll-mt-24 max-md:scroll-mt-36" id={card.id}
      onClick={(event) => { if (!(event.target as HTMLElement).closest('a, button, input, select, textarea, [data-product-panel]')) onToggle(); }}>
      {(PRODUCT_FORMER_IDS[card.id] ?? []).map((former) => (
        <span key={former} id={former} className="block scroll-mt-24" aria-hidden="true" />
      ))}
      <div className="product-row-heading">
        {card.image ? <img {...productImageSources(card.image)} sizes="80px" alt="" width={480} height={480} loading="lazy" decoding="async" className="product-row-image aspect-square" data-product-image={card.id} /> : null}
        <div className="product-row-title">
          <h3><a href={getLocalizedHref(productPath(card.id), locale)} data-product-page={card.id}>{card.title}</a></h3>
          <p className="product-row-problem">{card.problem}</p>
        </div>
        <button type="button" className="product-row-toggle" aria-label={`${DETAILS_LABEL[locale]}: ${card.title}`} aria-expanded={expanded} aria-controls={`${card.id}-details`} data-product-toggle={card.id} onClick={onToggle}>
          <span>{DETAILS_LABEL[locale]}</span><span aria-hidden="true">{expanded ? '−' : '+'}</span>
        </button>
      </div>
      <div id={`${card.id}-details`} className="products-fold" data-open={expanded} data-details={card.id} data-product-panel={card.id} inert={!expanded}>
        <div className="products-fold-inner">
          <div className="product-row-description">
            <p className="text-xs font-bold uppercase tracking-wider">{card.label}</p>
            <dl className="mt-2 space-y-2">
              {(['problem', 'inside', 'forWho'] as const).map((key) => <div key={key}><dt className="text-sm font-bold">{leadIns[key]}</dt><dd>{card[key]}</dd></div>)}
            </dl>
            <CardLink card={card} locale={locale} />
            <Sample card={card} copy={sample} onOpen={() => onOpenSample(card)} />
            {card.delivery ? <p className="mt-2 text-sm" data-delivery={card.id}>{delivery}</p> : null}
            {card.paypal ? <p className="mt-2 text-sm" data-paypal-note={card.id}>{PAYPAL_CARD_COPY[locale].note}</p> : null}
            {card.group ? <IeltsHomeLink group={card.group} locale={locale} label={ieltsHome[card.group]} id={card.id} /> : null}
          </div>
        </div>
      </div>
      <p className="product-row-price" data-price={card.id}>{card.price} <span>{card.unit}</span></p>
      <div className="product-row-actions story-cta">
        {card.sample ? <button type="button" className="insights-button-secondary" onClick={() => onOpenSample(card)} data-sample-open={card.id}>{sample.heading}</button> : null}
        <a className="insights-button-primary" href={href} data-cta={`product-${card.id}`} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{card.cta}</a>
        {external ? <p className="mt-2 text-xs" data-order-code={card.id}>{code.before} <strong>{orderCode(source, card.id)}</strong>{code.after}</p> : null}
        {card.video ? <a href={`${getLocalizedHref(productPath(card.id), locale)}#${PRODUCT_VIDEO_ANCHOR}`} className="product-row-watch" data-watch={card.id}><span aria-hidden="true">▶</span> {VIDEO_COPY[locale].watch}</a> : null}
        {card.paypal ? <PayPalOption card={card} locale={locale} source={source} compact /> : null}
      </div>
    </li>
  );
}

export function ProductsPage({ locale }: { locale: Locale }) {
  const c = productsPage(locale);
  const source = useVisitorSource();
  const [viewer, setViewer] = useState<ProductCard | null>(null);
  const [openSections, setOpenSections] = useState<Set<ProductSectionId>>(() => new Set(['families']));
  const [openProducts, setOpenProducts] = useState<Set<string>>(() => new Set());
  const categoryCopy = CATEGORY_COPY[locale];
  const toggleSection = (id: ProductSectionId) => setOpenSections((previous) => { const next = new Set(previous); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const toggleProduct = (id: string) => setOpenProducts((previous) => { const next = new Set(previous); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  useEffect(() => {
    let scrollTimer: ReturnType<typeof setTimeout>;
    const openFromHash = () => {
      const anchor = productAnchor(window.location.hash, locale);
      if (!anchor) return;
      setOpenSections((previous) => new Set(previous).add(anchor.section));
      if (anchor.product) setOpenProducts((previous) => new Set(previous).add(anchor.product!));
      if (anchor.sample) {
        const card = productsPage(locale).sections.flatMap((section) => section.cards).find((card) => card.id === anchor.product);
        if (card) setViewer(card);
      }
      clearTimeout(scrollTimer);
      // Wait for the panel's height to settle before scrolling to a previously hidden target.
      scrollTimer = setTimeout(() => document.getElementById(anchor.target)?.scrollIntoView({ block: 'start', behavior: 'auto' }), window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 260);
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
      <nav aria-label={categoryCopy.label} className="products-overview" data-products-mini-nav="">
        <ul>
          {PRODUCT_SECTIONS.map((id) => {
            const section = c.sections.find((section) => section.id === id);
            if (!section) return null;
            const lowest = Math.min(...section.cards.map((card) => Number(card.price.replace(/[^\d]/g, ''))));
            return <li key={id}>
              <button type="button" aria-expanded={openSections.has(id)} aria-controls={`${id}-products`} data-category-tile={id} onClick={() => toggleSection(id)}>
                <span className="products-overview-name">{categoryCopy.names[id]} <span aria-hidden="true">{openSections.has(id) ? '−' : '+'}</span></span>
                <span>{section.cards.length} {categoryCopy.count} · {categoryCopy.from} {lowest.toLocaleString('de-DE')}₫</span>
                {id === 'ielts' ? <span>{c.ielts.groups.speaking} · {c.ielts.groups.writing}</span> : null}
              </button>
            </li>;
          })}
        </ul>
      </nav>
      <div className="ielts-tool-content products-catalogue mx-auto max-w-5xl px-5">
        <a href={productHref('/', locale)} className="products-home inline-flex items-center gap-2 text-sm font-bold underline underline-offset-4"><ArrowLeft aria-hidden="true" className="h-4 w-4" /> {c.back}</a>
        {c.sections.map((section) => (
          <section key={section.id} id={section.id} aria-labelledby={`${section.id}-h`} className="products-category scroll-mt-24 max-md:scroll-mt-36">
            <h2 id={`${section.id}-h`}><button type="button" aria-expanded={openSections.has(section.id)} aria-controls={`${section.id}-products`} data-category-toggle={section.id} onClick={() => toggleSection(section.id)}>{section.heading}<span aria-hidden="true">{openSections.has(section.id) ? '−' : '+'}</span></button></h2>
            <div id={`${section.id}-products`} className="products-fold" data-category-panel={section.id} data-open={openSections.has(section.id)} inert={!openSections.has(section.id)}>
              <div className="products-fold-inner">
                <p className="products-category-intro">{section.intro}</p>
                {(section.id === 'ielts' ? IELTS_GROUPS.map((group) => ({ group, cards: section.cards.filter((card) => card.group === group) })) : [{ group: null, cards: section.cards }]).filter((list) => list.cards.length > 0).map(({ group, cards }) => (
                  <div key={group ?? 'all'} data-ielts-group={group ?? undefined}>
                    {group ? <h3 id={`ielts-${group}`} className="products-ielts-heading scroll-mt-24">{c.ielts.groups[group]}</h3> : null}
                    <ul className="products-rows">
                      {cards.map((card) => <Card key={card.id} card={card} locale={locale} delivery={c.delivery} leadIns={c.leadIns} sample={c.sample} source={source} onOpenSample={setViewer} ieltsHome={c.ielts.home} expanded={openProducts.has(card.id)} onToggle={() => toggleProduct(card.id)} />)}
                    </ul>
                  </div>
                ))}
                {section.also.map((line) => <p key={line.id} className="mt-4 text-sm" data-also={line.id}>{line.before}<a href={`#${line.id}`} className="font-bold underline underline-offset-4">{line.title}</a>{line.after}</p>)}
              </div>
            </div>
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
