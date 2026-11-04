import marketPricing from '../content/marketPricing.json';
import { getLocalizedHref } from '../i18n/localizedHref';
import type { Locale } from '../i18n/locales';
import { isInternationalMarketPath } from './seoPageMeta';

// The header button is the page's own next step (website assessment, 27 Oct 2026, fix 2): parent pages offer the free
// sample pack; IELTS pages go to the Live Speaking Baseline booking page itself; country pages book it in US$ through
// the AI Speaking checkout (?market= makes it show and charge that country's price, as the page's PayPal options do).
export const SAMPLE_PACK_ANCHOR = 'free-sample-pack';

export type HeaderCta = { kind: 'sample' | 'baseline'; label: string; mobileLabel: string; href: string };

type CtaCopy = { cta: string; ctaMobile: string; ctaHref: string; sampleCta: string };

const marketOf = (pathname: string) => {
  const slug = pathname.split('/').filter(Boolean).at(-1);
  const market = slug === 'brasil' ? 'brazil' : slug;
  return market && market in marketPricing.markets ? (market as keyof typeof marketPricing.markets) : undefined;
};

export function marketBaselineUsd(market: keyof typeof marketPricing.markets) {
  return marketPricing.tiers[String(marketPricing.markets[market]) as keyof typeof marketPricing.tiers].baseline_usd;
}

const stripLocale = (pathname: string) => pathname.replace(/^\/vi(?=\/|$)/, '') || '/';

export function isIeltsPath(pathname: string) {
  const path = stripLocale(pathname);
  return isInternationalMarketPath(pathname) || /ielts/.test(path) || /^\/(?:insights|tools|cong-cu)(?:\/|$)/.test(path);
}

// The free sample pack form sits on the home page and at the end of /products: those pages link to it in place.
export function samplePackHref(pathname: string, locale: Locale) {
  const path = stripLocale(pathname);
  return path === '/' || path === '/products' ? `#${SAMPLE_PACK_ANCHOR}` : `${getLocalizedHref('/', locale)}#${SAMPLE_PACK_ANCHOR}`;
}

export function headerCta(pathname: string, locale: Locale, copy: CtaCopy): HeaderCta {
  if (isInternationalMarketPath(pathname)) {
    const market = marketOf(pathname);
    if (market) {
      const usd = `US$${marketBaselineUsd(market)}`;
      return { kind: 'baseline', label: `Book Baseline · ${usd}`, mobileLabel: `Baseline · ${usd}`, href: `${copy.ctaHref}?market=${market}` };
    }
    return { kind: 'baseline', label: 'Book Baseline', mobileLabel: 'Baseline', href: copy.ctaHref };
  }
  if (isIeltsPath(pathname)) {
    return { kind: 'baseline', label: copy.cta, mobileLabel: copy.ctaMobile, href: getLocalizedHref(copy.ctaHref, locale) };
  }
  return { kind: 'sample', label: copy.sampleCta, mobileLabel: copy.sampleCta, href: samplePackHref(pathname, locale) };
}
