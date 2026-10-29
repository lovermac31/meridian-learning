import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import type { Locale } from '../i18n/locales';
import { getLocalizedHref } from '../i18n/localizedHref';
import { PRODUCTS_PATH, cardLink, productImageSources, productsPage, type Product, type ProductCard } from '../i18n/content/products';
import { PRODUCT_SEO, productFaq, productPath, relatedProducts } from '../i18n/content/productSeo';
import { ToolHero } from './IeltsToolsPage';
import { ProductVideo } from './ProductVideo';
import { PRODUCT_VIDEO_ANCHOR } from '../i18n/content/productVideos';
import { CardLink, IeltsHomeLink, PayPalOption, Sample, SampleViewer, productHref, useVisitorSource } from './ProductsPage';
import { ORDER_CODE_COPY, orderCode, zaloHref } from '../lib/productsSource';
import { recordClientEvent } from '../lib/tracker';
import { isPortalBuyEnabled, getPortalBuyUrl } from '../config/portalBuy';

const COPY: Record<Locale, { home: string; products: string; faq: string; related: string; all: string }> = {
  en: { home: 'Home', products: 'Products', faq: 'Questions', related: 'You may also need', all: 'All products and prices' },
  vi: { home: 'Trang chủ', products: 'Sản phẩm', faq: 'Câu hỏi thường gặp', related: 'Có thể bạn cũng cần', all: 'Tất cả sản phẩm và học phí' },
};

const toCard = (product: Product, locale: Locale): ProductCard => {
  const { id, price, href, delivery, image, sample, paypal, video, group } = product;
  return { id, price, href, delivery, image, sample, paypal, video, group, link: cardLink(product, locale), ...product[locale] };
};

// One product's own page (Jay, 27 Oct 2026: every product findable on Google and Bing). Same copy, sample viewer,
// price and order buttons as its card on /products, plus breadcrumbs, a FAQ answered from the approved page copy and
// three related products. The hub card stays; this page is what search engines index for the product.
export function ProductPage({ product, locale }: { product: Product; locale: Locale }) {
  const c = productsPage(locale);
  const t = COPY[locale];
  const card = toCard(product, locale);
  const source = useVisitorSource();
  const [viewer, setViewer] = useState(false);
  const external = card.href === 'zalo';
  const href = external ? zaloHref(source, product.id) : productHref(card.href, locale);
  const code = ORDER_CODE_COPY[locale];
  const faq = productFaq(product, locale);
  const path = productPath(product.id);
  // /products/<id>#<id>-sample opens the viewer, as the hub does for its cards.
  useEffect(() => {
    if (card.sample && window.location.hash === `#${card.id}-sample`) setViewer(true);
  }, [card.id, card.sample]);
  const closeViewer = () => {
    setViewer(false);
    if (window.location.hash === `#${card.id}-sample`) window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
  };
  const isStoryClub = product.id === 'story-club';
  const shortLead = locale === 'vi'
    ? 'Nhóm học trực tuyến qua truyện cho bé 5–8 tuổi.'
    : 'Online story groups for children aged 5–8.';
  const schedule = locale === 'vi'
    ? 'Sáng thứ Bảy 9:00 · Google Meet · Tối đa 6 bé'
    : 'Saturdays 9:00 · Google Meet · Up to 6 children';
  // One existing purchase block, promoted only for Story Club. Other product DOM order stays unchanged.
  const purchase = <>
          <p className="mt-4 text-2xl font-bold" data-price={card.id}>
            {card.price} <span className="text-base font-semibold">{card.unit}</span>
          </p>
          <div className="story-cta mt-3 flex flex-wrap items-center gap-3">
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
            <a
              className={isPortalBuyEnabled(card.id) ? "insights-button-secondary" : "insights-button-primary"}
              href={href}
              data-cta={`product-page-${card.id}`}
              onClick={() => {
                if (external) {
                  recordClientEvent({ event: 'checkout_start', product_id: card.id, utm_source: source ?? undefined });
                }
              }}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {card.cta}
            </a>
            {external ? (
              <p className="mt-2 text-sm" data-order-code={card.id}>
                {code.before} <strong>{orderCode(source, card.id)}</strong>{code.after}
              </p>
            ) : null}
            {card.delivery ? <p className="mt-2 text-sm" data-delivery={card.id}>{c.delivery}</p> : null}
            {card.paypal ? <PayPalOption card={card} locale={locale} source={source} /> : null}
            {card.group ? <IeltsHomeLink group={card.group} locale={locale} label={c.ielts.home[card.group]} id={card.id} /> : null}
          </div>
  </>;
  return (
    <main id="main-content" tabIndex={-1} className="insights-page ielts-tools-page story-club-page products-page min-h-screen" lang={locale} data-product-page-main={product.id}>
      {/* Deterrent: printing a product page gives a blank page, as on /products (Jay, 27 Oct 2026). */}
      <style>{'@media print { body { display: none !important; } }'}</style>
      <ToolHero
        locale={locale}
        title={PRODUCT_SEO[product.id][locale].title.split(' | ')[0]}
        lead={isStoryClub ? shortLead : card.problem}
        eyebrow={card.label}
        counterpart={getLocalizedHref(path, locale === 'vi' ? 'en' : 'vi')}
      >
        {isStoryClub ? <div data-story-club-first-screen>
          <p className="mt-3 text-sm" data-story-club-schedule>{schedule}</p>
          {purchase}
        </div> : null}
      </ToolHero>
      <div className="ielts-tool-content mx-auto max-w-3xl space-y-10 px-5 py-14">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-sm">
            <li><a href={getLocalizedHref('/', locale)} className="underline underline-offset-4">{t.home}</a></li>
            <li aria-hidden="true">›</li>
            <li><a href={getLocalizedHref(PRODUCTS_PATH, locale)} className="underline underline-offset-4">{t.products}</a></li>
            <li aria-hidden="true">›</li>
            {product.group ? (
              <>
                <li><a href={`${getLocalizedHref(PRODUCTS_PATH, locale)}#ielts`} className="underline underline-offset-4">{c.ielts.crumb}</a></li>
                <li aria-hidden="true">›</li>
              </>
            ) : null}
            <li aria-current="page" className="font-bold">{card.title}</li>
          </ol>
        </nav>
        <section className="ielts-tool-card rounded-2xl bg-white p-6 shadow-sm" aria-label={card.title} data-product={card.id}>
          {card.image ? (
            <img
              {...productImageSources(card.image)}
              sizes="(min-width: 480px) 384px, calc(100vw - 88px)"
              alt=""
              width={480}
              height={480}
              loading="lazy"
              decoding="async"
              className="mb-4 aspect-square w-full max-w-sm rounded-xl object-cover"
            />
          ) : null}
          <dl className="space-y-3">
            {(['problem', 'inside', 'forWho'] as const).map((key) => (
              <div key={key}>
                <dt className="text-sm font-bold">{c.leadIns[key]}</dt>
                <dd>{card[key]}</dd>
              </div>
            ))}
          </dl>
          <CardLink card={card} locale={locale} />
          {card.video ? <ProductVideo slug={card.video} locale={locale} id={PRODUCT_VIDEO_ANCHOR} fallbackTitle={card.title} /> : null}
          <Sample card={card} copy={c.sample} onOpen={() => setViewer(true)} />
          {!isStoryClub ? purchase : null}
        </section>
        <section aria-labelledby="product-faq-h">
          <h2 id="product-faq-h" className="text-2xl font-bold">{t.faq}</h2>
          <dl className="mt-4 space-y-4" data-product-faq={card.id}>
            {faq.map(({ question, answer }) => (
              <div key={question}>
                <dt className="font-bold">{question}</dt>
                <dd className="mt-1">{answer}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section aria-labelledby="product-related-h">
          <h2 id="product-related-h" className="text-2xl font-bold">{t.related}</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            {relatedProducts(product.id).map((related) => (
              <li key={related.id} className="rounded-2xl bg-white p-4 shadow-sm" data-related={related.id}>
                <a href={getLocalizedHref(productPath(related.id), locale)} className="font-bold underline underline-offset-4">
                  {related[locale].title}
                </a>
                <p className="mt-1 text-sm">{related.price} · {related[locale].unit}</p>
              </li>
            ))}
          </ul>
        </section>
        <a href={getLocalizedHref(PRODUCTS_PATH, locale)} className="inline-flex items-center gap-2 text-sm font-bold underline underline-offset-4">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> {t.all}
        </a>
      </div>
      {viewer && card.sample ? <SampleViewer card={card} locale={locale} source={source} copy={c.viewer} onClose={closeViewer} /> : null}
    </main>
  );
}
