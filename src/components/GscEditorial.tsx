import entries from '../content/gscEditorial.json';
import { getCurrentPathname } from '../lib/ssrLocation';
export function GscEditorial() {
  const pathname = getCurrentPathname();
  const entry = (entries as Record<string, { title: string; paragraphs: string[] }>)[pathname];
  if (!entry) return null;
  return <section data-gsc-editorial className="mx-auto max-w-3xl px-6 py-12 text-sb-forest">
    {(/thinking-cycle\//.test(pathname)) ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
      '@context': 'https://schema.org', '@type': 'Article', headline: entry.title,
      articleBody: entry.paragraphs.join('\n\n'), inLanguage: pathname.startsWith('/vi/') ? 'vi' : 'en',
      mainEntityOfPage: `https://jurassicenglish.com${pathname}`,
      author: { '@type': 'Organization', name: 'Jurassic English' },
    }).replace(/</g, '\\u003c') }} /> : null}
    <h2 className="mb-5 text-2xl font-bold">{entry.title}</h2>
    {entry.paragraphs.map(paragraph => <p key={paragraph} className="my-4 leading-relaxed">{paragraph}</p>)}
  </section>;
}
