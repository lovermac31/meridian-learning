import { useState } from 'react';
import type { Locale } from '../i18n/locales';
import { productsPage, type Product } from '../i18n/content/products';
import { Sample, SampleViewer } from './ProductsPage';
import { toCard } from './ProductPage';
import { SAMPLE_PAGE_COUNTS } from '../i18n/content/samplePages';

const COUNT_WORDS: Record<number, string> = { 7: 'seven', 9: 'nine' };

/** Fail closed if an unfinished preview is accidentally switched live. */
export function assertStartersDraft(product: Product) {
  if (product.live && product.draftPreview) throw new Error('Draft product decisions must be resolved before release');
}

export function StartersDraftPage({ product, locale }: { product: Product; locale: Locale }) {
  assertStartersDraft(product);
  const [viewer, setViewer] = useState(false);
  const copy = productsPage(locale);
  const text = product[locale];
  const draft = product.draftPreview!;
  const card = toCard(product, locale);
  const pages = SAMPLE_PAGE_COUNTS[product.sample!];
  const isPack = product.id === 'starters-practice-tests-pack';
  return <main id="main-content" tabIndex={-1} lang={locale} className="insights-page products-page min-h-screen" data-product-page-main={product.id}>
    <style>{'@media print { body { display: none !important; } }'}</style>
    <div className="mx-auto max-w-3xl space-y-6 px-5 py-14">
      <p className="text-sm font-bold">{text.label}</p>
      <h1 className="text-3xl font-bold sm:text-4xl">{text.title}</h1>
      <p className="text-lg">{text.problem}</p>
      <section className="rounded-2xl bg-white p-6 shadow-sm" aria-label="Real sample" data-starters-sample={product.id}>
        <h2 className="text-2xl font-bold">{locale === 'vi' ? '[VI DRAFT: native read needed] Xem trang mẫu' : `Explore ${COUNT_WORDS[pages]} real sample pages`}</h2>
        <p className="my-3 text-sm">{isPack ? 'The cover, a Reading and Writing picture task and the Listening Parts 1 and 2 page from each of the three tests.' : 'Cover, abstract, contents, Reading and Writing picture task, Listening Parts 1 and 2, colouring task, and Speaking picture.'}</p>
        <Sample card={card} copy={copy.sample} onOpen={() => setViewer(true)} />
        <div className="mt-6" data-starters-audio={product.id}>
          <h3 className="font-bold">Listening Part 1: example clip</h3>
          <p className="mb-2 text-sm">Synthetic voices · {product.clip!.seconds.toFixed(1)} seconds · press play to listen. Muted initially; use the audio controls to unmute.</p>
          <audio controls muted preload="none" src={product.clip!.src} aria-label={`${text.title}: Listening Part 1 example`} className="w-full" />
        </div>
      </section>
      <p data-licence={product.id}>{draft.licence}</p>
      <p className="text-2xl font-bold" data-price={product.id}>{draft.price}</p>
      <div data-draft-buy={product.id}>
        <button type="button" disabled className="insights-button-primary opacity-60">{text.cta}</button>
        <p className="mt-2 text-sm">Draft preview. Orders and payment codes are unavailable.</p>
      </div>
      <p>{text.inside}</p>
      <p>{text.forWho}</p>
      <p data-credit={product.id}>{draft.credit}</p>
      <p data-delivery={product.id}>{draft.delivery}</p>
      <p data-independence={product.id}>{draft.independence}</p>
    </div>
    {viewer ? <SampleViewer card={card} locale={locale} source={null} copy={copy.viewer} onClose={() => setViewer(false)} /> : null}
  </main>;
}
