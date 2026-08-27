/**
 * InsightArticlePage — the reusable authority-article template (Phase 33).
 *
 * Presentational shell for a single /insights article: breadcrumb, section
 * eyebrow, H1, deck, author + date byline, hero image, body, related links,
 * and two CTA slots — a "follow" slot (the Preferred Sources CTA from PR-A is
 * dropped in here at activation, so this template has no cross-PR import) and a
 * primary enrollment CTA.
 *
 * JSON-LD (Article/Person/Breadcrumb) is emitted by the route-metadata layer
 * (createArticleJsonLd), not here — matching how the rest of the app attaches
 * structured data via headManager. This component renders visible content only.
 *
 * Not yet wired to a live route — the /insights family activates when
 * insightsContent.ts has a published article. See docs/insights-editorial-roadmap.md.
 */
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { InsightArticle } from '../lib/insightsContent';

type RelatedLink = { label: string; href: string };

type Props = {
  article: InsightArticle;
  /** Rendered article body. */
  children: React.ReactNode;
  related?: RelatedLink[];
  onNavigate?: (path: string) => void;
  /** Slot for the Preferred Sources CTA (PR-A) — decoupled to avoid a cross-PR import. */
  followCta?: React.ReactNode;
};

const formatDate = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const InsightArticlePage = ({ article, children, related, onNavigate, followCta }: Props) => {
  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!onNavigate) return;
    e.preventDefault();
    onNavigate(href);
  };

  const published = formatDate(article.datePublished);
  const modified = article.dateModified ? formatDate(article.dateModified) : null;

  return (
    <main id="main-content" tabIndex={-1} className="bg-jurassic-soft text-jurassic-dark focus:outline-none">
      <article className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 text-sm">
          <ol className="flex flex-wrap items-center gap-2 text-jurassic-dark/55">
            <li><a href="/" onClick={(e) => go(e, '/')} className="rounded hover:text-jurassic-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent">Home</a></li>
            <li aria-hidden="true">/</li>
            <li><a href="/insights" onClick={(e) => go(e, '/insights')} className="rounded hover:text-jurassic-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent">Insights</a></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-jurassic-dark/80">{article.section}</li>
          </ol>
        </nav>

        {/* Header */}
        <header>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-jurassic-accent">{article.section}</p>
          <h1 className="font-sans text-3xl md:text-4xl font-semibold tracking-tight leading-[1.1]">{article.title}</h1>
          <p className="mt-4 text-lg font-light leading-relaxed text-jurassic-dark/70">{article.deck}</p>
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-jurassic-dark/55">
            <span>By <span className="font-medium text-jurassic-dark/80">{article.authorName}</span></span>
            <span aria-hidden="true">·</span>
            <time dateTime={article.datePublished}>{published}</time>
            {modified && modified !== published && (
              <>
                <span aria-hidden="true">·</span>
                <span>Updated <time dateTime={article.dateModified}>{modified}</time></span>
              </>
            )}
          </div>
        </header>

        {/* Hero */}
        <img
          src={article.heroImage}
          alt={article.heroAlt}
          width={960}
          height={540}
          loading="eager"
          className="mt-8 w-full rounded-2xl border border-jurassic-dark/10 object-cover"
        />

        {/* Body */}
        <div className="prose-insights mt-10 space-y-5 text-base md:text-lg leading-relaxed text-jurassic-dark/85">
          {children}
        </div>

        {/* Follow (Preferred Sources) slot */}
        {followCta && <div className="mt-12">{followCta}</div>}

        {/* Related */}
        {related && related.length > 0 && (
          <aside aria-labelledby="related-heading" className="mt-12 border-t border-jurassic-dark/10 pt-8">
            <h2 id="related-heading" className="text-xs font-bold uppercase tracking-[0.2em] text-jurassic-dark/55">Related</h2>
            <ul className="mt-4 space-y-2">
              {related.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(e) => go(e, link.href)}
                    className="inline-flex items-center gap-1.5 rounded text-jurassic-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent"
                  >
                    {link.label}
                    <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        )}

        {/* Primary enrollment CTA — keeps articles tied to the core conversion. */}
        <div className="mt-12 rounded-2xl bg-jurassic-dark px-6 py-8 text-center">
          <p className="text-lg font-semibold text-white">See how a student actually thinks in English.</p>
          <a
            href="/get-started"
            onClick={(e) => go(e, '/get-started')}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-jurassic-accent px-6 py-3 text-sm font-semibold text-white shadow-premium transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2 focus-visible:ring-offset-jurassic-dark"
          >
            Book a Student Thinking Diagnostic
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>

        {/* Back to index */}
        <div className="mt-10">
          <a
            href="/insights"
            onClick={(e) => go(e, '/insights')}
            className="inline-flex items-center gap-1.5 rounded text-sm text-jurassic-dark/60 hover:text-jurassic-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            All insights
          </a>
        </div>
      </article>
    </main>
  );
};
