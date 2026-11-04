import links from '@/lib/assetLinks.json';

/** Small contextual card inside existing page content; SSR and hydration share it. */
export function AssetNextStep({ pathname }: { pathname: string }) {
  const card = links.find((entry) => entry.path === pathname);
  if (!card) return null;
  return <aside data-seo-asset-links={pathname} lang={card.locale} className="mx-auto my-8 max-w-5xl rounded-lg border border-emerald-900/15 bg-white p-5 text-emerald-950" dir={['ar', 'ur'].includes(card.locale) ? 'rtl' : undefined}>
    <h2 className="text-xl font-bold">{card.heading}</h2>
    <p className="mt-3"><a className="inline-flex min-h-11 items-center rounded-full bg-emerald-900 px-5 py-2 font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4" href={card.links[0].href}>{card.links[0].text}</a></p>
    <p className="mt-3"><a className="underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4" href={card.links[1].href}>{card.links[1].text}</a></p>
  </aside>;
}
