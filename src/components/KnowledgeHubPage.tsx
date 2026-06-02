import { useEffect, useLayoutEffect, useState } from 'react';
import { ArrowLeft, ChevronDown, MessageCircle } from 'lucide-react';
import { getKnowledgeContent, type KnowledgeEntry, type KnowledgeGroup } from '../i18n/content/knowledge';
import { getCurrentLocale } from '../i18n/routing';

type KnowledgeHubPageProps = {
  onBack: () => void;
  onNavigate: (path: string) => void;
};

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2';

/**
 * KnowledgeHubPage — P0 shell for /knowledge ("Ask / Knowledge Hub").
 *
 * Audience-grouped accordions, collapsed by default (progressive disclosure:
 * the page reads short, opens deep only on demand). Anchor ids are stable
 * (#framework, #methodology, #cefr-alignment, #teacher-standards,
 * #thinking-cycle) — they are the eventual 301 targets, so a deep link like
 * /knowledge#cefr-alignment auto-expands and scrolls to that entry.
 *
 * P0 = summaries + "read the full page" links to the still-live legacy routes.
 * Full content migration + chatbot wiring are later phases.
 */
export function KnowledgeHubPage({ onBack, onNavigate }: KnowledgeHubPageProps) {
  const locale = getCurrentLocale();
  const content = getKnowledgeContent(locale);
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());
  const [pendingScroll, setPendingScroll] = useState<string | null>(null);

  // Deep-link support: /knowledge#<id> opens + scrolls to that accordion.
  // Two-phase, intentionally NOT requestAnimationFrame-based: rAF is paused in
  // background tabs, so an rAF scroll loop silently never runs when the page is
  // opened in a background tab (e.g. middle-click) — and never runs under
  // headless/automation either. React commit effects fire regardless of tab
  // focus, so we drive the scroll off them instead.
  //
  // Phase 1 (effect): read the hash, EXPAND the target, and mark it pending.
  // Runs on mount (direct load / 301 target / shared link), 'hashchange'
  // (anchor links, manual hash edits), and 'popstate' (back/forward).
  // We also scope history.scrollRestoration to 'manual' so the browser's
  // auto scroll-restoration can't clobber our positioning on load.
  useEffect(() => {
    const prevRestoration =
      'scrollRestoration' in window.history ? window.history.scrollRestoration : undefined;
    if (prevRestoration !== undefined) {
      window.history.scrollRestoration = 'manual';
    }
    const apply = () => {
      const id = window.location.hash.slice(1);
      if (!id) return;
      setOpenIds((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      setPendingScroll(id);
    };
    apply();
    window.addEventListener('hashchange', apply);
    window.addEventListener('popstate', apply);
    return () => {
      window.removeEventListener('hashchange', apply);
      window.removeEventListener('popstate', apply);
      if (prevRestoration !== undefined) {
        window.history.scrollRestoration = prevRestoration;
      }
    };
  }, []);

  // Phase 2 (layout effect): once the pending target's panel has actually
  // expanded in the committed DOM, scroll to it. useLayoutEffect runs
  // synchronously after the DOM mutation (so getBoundingClientRect is exact)
  // and fires in background tabs. `behavior:'auto'` = instant + deterministic.
  useLayoutEffect(() => {
    if (!pendingScroll) return;
    const el = document.getElementById(`kh-${pendingScroll}`);
    const panel = document.getElementById(`kh-panel-${pendingScroll}`);
    if (!el || panel?.hidden) return; // wait until the expand has committed
    const NAV_OFFSET = 100;
    const top = Math.max(0, Math.round(window.scrollY + el.getBoundingClientRect().top - NAV_OFFSET));
    window.scrollTo({ top, behavior: 'auto' });
    setPendingScroll(null);
  }, [pendingScroll, openIds]);

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const renderEntry = (entry: KnowledgeEntry) => {
    const isOpen = openIds.has(entry.id);
    return (
      <div
        key={entry.id}
        id={`kh-${entry.id}`}
        className="scroll-mt-28 border-b border-jurassic-dark/10"
      >
        <h3>
          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls={`kh-panel-${entry.id}`}
            onClick={() => toggle(entry.id)}
            className={`flex w-full items-center justify-between gap-4 py-5 text-left ${FOCUS_RING} rounded-md`}
          >
            <span className="text-lg font-semibold text-jurassic-dark">{entry.question}</span>
            <ChevronDown
              aria-hidden="true"
              className={`h-5 w-5 shrink-0 text-jurassic-accent transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </h3>
        <div
          id={`kh-panel-${entry.id}`}
          hidden={!isOpen}
          className="pb-6 pr-8"
        >
          <p className="text-base leading-relaxed text-jurassic-dark/70">{entry.summary}</p>
          {entry.readMorePath ? (
            <button
              type="button"
              onClick={() => onNavigate(entry.readMorePath as string)}
              className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-jurassic-accent underline underline-offset-2 hover:opacity-80 ${FOCUS_RING} rounded-md`}
            >
              {content.readMoreLabel}
            </button>
          ) : null}
        </div>
      </div>
    );
  };

  const renderGroup = (group: KnowledgeGroup) => (
    <section className="mb-14">
      <p className="mb-4 text-xs font-bold uppercase tracking-widest text-jurassic-accent">
        {group.eyebrow}
      </p>
      <div className="rounded-2xl border border-jurassic-dark/10 bg-white px-6 shadow-sm">
        {group.entries.map(renderEntry)}
      </div>
    </section>
  );

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-jurassic-ivory pt-32 pb-24 focus:outline-none">
      <div className="mx-auto max-w-3xl px-6">
        <button
          type="button"
          onClick={onBack}
          className={`mb-10 inline-flex items-center gap-2 text-sm font-semibold text-jurassic-dark/55 transition hover:text-jurassic-dark ${FOCUS_RING} rounded-md`}
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to homepage
        </button>

        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-jurassic-accent">
          {content.eyebrow}
        </p>
        <h1 className="font-display text-4xl font-bold tracking-tight text-jurassic-dark sm:text-5xl">
          {content.title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-jurassic-dark/70">
          {content.intro}
        </p>

        <div className="mb-12 mt-6 inline-flex items-center gap-2 rounded-full border border-jurassic-accent/25 bg-jurassic-accent/5 px-4 py-2 text-sm font-medium text-jurassic-dark/75">
          <MessageCircle aria-hidden="true" className="h-4 w-4 text-jurassic-accent" />
          {content.askPrompt} — use the chat assistant in the corner.
        </div>

        {renderGroup(content.groups.schools)}
        {renderGroup(content.groups.parents)}
      </div>
    </main>
  );
}
