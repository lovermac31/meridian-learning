import { ArrowLeft } from 'lucide-react';
import type { Locale } from '../i18n/locales';
import { getLocalizedHref } from '../i18n/localizedHref';
import {
  PRODUCTS_PATH,
  PRODUCTS_UTM,
  PRODUCTS_VI_PATH,
  PRODUCTS_ZALO,
  PRODUCT_IMAGE_DIR,
  productsPage,
  type ProductCard,
} from '../i18n/content/products';
import { ToolHero } from './IeltsToolsPage';

/** The page's own language version of an internal path, tagged utm_source=products (query before any #anchor). */
export function productHref(href: string, locale: Locale): string {
  if (href === 'zalo') return PRODUCTS_ZALO;
  const [base, hash] = getLocalizedHref(href, locale).split('#');
  return `${base}${base.includes('?') ? '&' : '?'}${PRODUCTS_UTM}${hash ? `#${hash}` : ''}`;
}

type LeadIns = { problem: string; inside: string; forWho: string };

function Card({ card, locale, delivery, leadIns }: { card: ProductCard; locale: Locale; delivery: string; leadIns: LeadIns }) {
  const href = productHref(card.href, locale);
  const external = card.href === 'zalo';
  return (
    <li className="ielts-tool-card flex flex-col rounded-2xl bg-white p-6 shadow-sm" id={card.id}>
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
        {card.delivery ? <p className="mt-2 text-sm" data-delivery={card.id}>{delivery}</p> : null}
      </div>
    </li>
  );
}

export function ProductsPage({ locale }: { locale: Locale }) {
  const c = productsPage(locale);
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
                <Card key={card.id} card={card} locale={locale} delivery={c.delivery} leadIns={c.leadIns} />
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
            <a className="insights-button-primary" href={PRODUCTS_ZALO} target="_blank" rel="noopener noreferrer" data-cta="products-closing">
              {c.closing.cta}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
