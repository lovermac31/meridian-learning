import type { Locale } from '../i18n/locales';
import { FREE_STORIES, FREE_STORIES_PATH, FREE_STORIES_VI_PATH, PENDING_PDF, freeStoriesContent, freeStoryHref } from '../i18n/content/freeStories';
import { ToolHero } from './IeltsToolsPage';

// Free stories (draft preview). Reuses the tool-page hero and shell; cards are plain links to existing pages, no buy buttons.
export function FreeStoriesPage({ locale }: { locale: Locale }) {
  const c = freeStoriesContent[locale];
  return (
    <main id="main-content" tabIndex={-1} className="insights-page ielts-tools-page free-stories-page min-h-screen" lang={locale}>
      <ToolHero locale={locale} title={c.title} lead={c.lead} eyebrow={c.eyebrow} counterpart={locale === 'vi' ? FREE_STORIES_PATH : FREE_STORIES_VI_PATH} />
      <div className="ielts-tool-content mx-auto max-w-5xl px-5 py-12">
        <ul className="free-stories-grid" aria-label={c.cardsLabel} data-free-stories="">
          {FREE_STORIES.map((s) => (
            <li key={s.id} id={s.id} className="free-story-card" data-free-story={s.id}>
              <div className="free-story-cover" role="img" aria-label={c.cover(s.title)}><span lang="en">{s.title}</span></div>
              <p className="free-story-eyebrow">{c.level} {s.level} · {c.ages(s.ages)}</p>
              {s.teenOnly ? <p className="free-story-teen" data-free-story-teen="">{c.teen}</p> : null}
              <h2 lang="en">{s.title}</h2>
              <p>{s[locale].synopsis}</p>
              <p className="free-story-free"><strong>{c.freeLine}</strong></p>
              <p className="free-story-note">{c.activities}</p>
              {s.pdfHref === PENDING_PDF
                ? <p className="free-story-pending" data-pending-pdf={s.id}>{c.pending}</p>
                : <a className="free-story-link" href={s.pdfHref} data-free-story-pdf={s.id}>{c.download}</a>}
              <a className="free-story-link" href={freeStoryHref(s.fullBookPath, locale)} data-free-story-whole={s.id}>{c.whole}: {c.wholeIn(s.level)}</a>
              {s.storyClub ? <a className="free-story-link" href={freeStoryHref('/story-club', locale)} data-free-story-club={s.id}>{c.club}</a> : null}
            </li>
          ))}
        </ul>
        <p className="free-stories-note">{c.note}</p>
      </div>
    </main>
  );
}
