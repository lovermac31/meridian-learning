import { ArrowRight } from 'lucide-react';
import type { Locale } from '../i18n/locales';
import { getLocalizedHref } from '../i18n/localizedHref';
import { PRODUCTS, PRODUCTS_PATH, type ProductSectionId } from '../i18n/content/products';

// A small contextual link from a teacher, centre or level page to one card on /products (master, 27 Oct 2026, under
// the JE Page Infrastructure Standard: link the card, never a new page). The text is the card's audience and title,
// "For teachers: Level 2 Teacher Pack", and the link is tagged utm_source=<source page>, query before the #card.
const LEADS: Record<Locale, Record<ProductSectionId, string>> = {
  en: { families: 'For families:', teachers: 'For teachers:', centres: 'For centres:', ielts: 'IELTS:' },
  vi: { families: 'Dành cho gia đình:', teachers: 'Dành cho giáo viên:', centres: 'Dành cho trung tâm:', ielts: 'IELTS:' },
};

/** /products (or /vi/products) tagged with the source page, anchored on the card. */
export function productCardHref(id: string, source: string, locale: Locale): string {
  return `${getLocalizedHref(PRODUCTS_PATH, locale)}?utm_source=${source}#${id}`;
}

type ProductCardLinkProps = {
  id: string;
  source: string;
  locale: Locale;
  tone?: 'light' | 'dark';
  className?: string;
};

/** Renders nothing for a product that is not live, so a hidden product is never linked. */
export function ProductCardLink({ id, source, locale, tone = 'light', className = '' }: ProductCardLinkProps) {
  const product = PRODUCTS.find((entry) => entry.id === id && entry.live);
  if (!product) return null;
  const color = tone === 'dark' ? 'text-white hover:text-jurassic-accent' : 'text-jurassic-dark hover:text-jurassic-accent';
  return (
    <p className={`text-sm ${className}`}>
      <a
        href={productCardHref(id, source, locale)}
        className={`inline-flex items-center gap-1.5 font-bold underline underline-offset-4 transition ${color}`}
        data-link={`product-card-${id}`}
      >
        {LEADS[locale][product.section]} {product[locale].title}
        <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
      </a>
    </p>
  );
}
