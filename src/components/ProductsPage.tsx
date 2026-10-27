import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
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
import { PRODUCT_FORMER_IDS } from '../i18n/content/products';
import { ORDER_CODE_COPY, orderCode, readVisitorSource, zaloHref } from '../lib/productsSource';

/** The visit's utm_source, read after hydration so the prerendered page and the first client render match. */
function useVisitorSource(): string | null {
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

type LeadIns = { problem: string; inside: string; forWho: string };
type SampleCopy = { heading: string; note: string; open: string };

// "See a sample" (Jay, 27 Oct 2026): real pages from the product, shown above the price and the order button.
// Renders only for a card whose sample files are in public/samples (the entry's `sample` stem), so nothing is broken.
// One link per card: three page thumbnails (decorative) and the visible "Open the sample (PDF)" text.
function Sample({ card, copy }: { card: ProductCard; copy: SampleCopy }) {
  if (!card.sample) return null;
  const files = productSampleFiles(card.sample);
  return (
    <div id={productSampleAnchor(card.id)} className="mt-4 scroll-mt-24 rounded-xl border border-sb-border bg-sb-cream p-3" data-sample={card.id}>
      <p className="text-sm font-bold">{copy.heading}</p>
      <p className="text-sm">{copy.note}</p>
      <a
        href={files.pdf}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${copy.open}: ${card.title}`}
        className="group mt-2 block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-amber"
        data-sample-link={card.id}
      >
        <span className="grid grid-cols-3 gap-2">
          {files.pages.map((src) => (
            <img
              key={src}
              src={src}
              alt=""
              width={600}
              height={849}
              loading="lazy"
              decoding="async"
              className="aspect-[210/297] w-full rounded border border-sb-border bg-white object-cover object-top"
              data-sample-page={card.id}
            />
          ))}
        </span>
        <span className="mt-2 inline-block text-sm font-bold underline underline-offset-4 group-hover:text-sb-amber-deep">{copy.open}</span>
      </a>
    </div>
  );
}

function Card({ card, locale, delivery, leadIns, sample, source }: {
  card: ProductCard; locale: Locale; delivery: string; leadIns: LeadIns; sample: SampleCopy; source: string | null;
}) {
  const external = card.href === 'zalo';
  const href = external ? zaloHref(source) : productHref(card.href, locale);
  const code = ORDER_CODE_COPY[locale];
  return (
    <li className="ielts-tool-card flex scroll-mt-24 flex-col rounded-2xl bg-white p-6 shadow-sm" id={card.id}>
      {(PRODUCT_FORMER_IDS[card.id] ?? []).map((former) => (
        <span key={former} id={former} className="block scroll-mt-24" aria-hidden="true" />
      ))}
      {card.image ? (
        // Decorative: the card title follows as a heading, so the image has empty alt text.
        <img
          src={`${PRODUCT_IMAGE_DIR}/${card.image}.webp`}
          alt=""
          width={480}
          height={480}
          loading="lazy"
          decoding="async"
          className="mb-4 aspect-square w-full rounded-xl object-cover"
          data-product-image={card.id}
        />
      ) : null}
      <p className="text-xs font-bold uppercase tracking-wider text-[#8a5a00]">{card.label}</p>
      <h3 className="mt-2 text-xl font-bold">{card.title}</h3>
      <dl className="mt-2 flex-1 space-y-2">
        {(['problem', 'inside', 'forWho'] as const).map((key) => (
          <div key={key}>
            <dt className="text-sm font-bold">{leadIns[key]}</dt>
            <dd>{card[key]}</dd>
          </div>
        ))}
      </dl>
      <Sample card={card} copy={sample} />
      <p className="mt-4 text-2xl font-bold" data-price={card.id}>
        {card.price} <span className="text-base font-semibold">{card.unit}</span>
      </p>
      <div className="story-cta mt-3">
        <a
          className="insights-button-primary"
          href={href}
          data-cta={`product-${card.id}`}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {card.cta}
        </a>
        {external ? (
          <p className="mt-2 text-sm" data-order-code={card.id}>
            {code.before} <strong>{orderCode(source, card.id)}</strong>{code.after}
          </p>
        ) : null}
        {card.delivery ? <p className="mt-2 text-sm" data-delivery={card.id}>{delivery}</p> : null}
      </div>
    </li>
  );
}

export function ProductsPage({ locale }: { locale: Locale }) {
  const c = productsPage(locale);
  const source = useVisitorSource();
  return (
    <main id="main-content" tabIndex={-1} className="insights-page ielts-tools-page story-club-page products-page min-h-screen" lang={locale}>
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
                <Card key={card.id} card={card} locale={locale} delivery={c.delivery} leadIns={c.leadIns} sample={c.sample} source={source} />
              ))}
            </ul>
          </section>
        ))}
      </div>
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
    </main>
  );
}
