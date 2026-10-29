import { getCurrentLocale } from '../i18n/routing';
import groups from '../content/crawlResources.json';
export function CrawlResources({ context }: { context: 'home' | 'products' | 'framework' }) {
  if (getCurrentLocale() === 'vi') return null;
  const intros = {
    home: 'Find a starting point: explore a sample, use a practice tool, or read how the teaching approach works before choosing your next step.',
    products: 'Compare the learning routes with the resources behind them. Speaking samples show the practice format; writing examples and guides help you decide what to work on next.',
    framework: 'See how the teaching approach connects with practice. Use the guides to examine feedback, the tools to rehearse an answer, and the samples to explore the learning format.',
  };
  return <section data-crawl-resources={context} className="mx-auto max-w-7xl px-6 py-12 text-sb-forest">
    <h2 className="text-2xl font-bold">Explore lessons and learning resources</h2>
    <p className="my-4 max-w-3xl">{intros[context]}</p>
    {Object.entries(groups).map(([title, links]) => <details key={title} className="my-4 rounded border p-4">
      <summary className="cursor-pointer font-bold">{title}</summary>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">{links.map(({ href, label }) => <li key={href}><a className="underline underline-offset-4" href={context === 'products' ? `${href}?utm_source=products` : href}>{label}</a></li>)}</ul>
    </details>)}
  </section>;
}
