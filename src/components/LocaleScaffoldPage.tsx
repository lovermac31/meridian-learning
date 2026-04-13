import { Globe2 } from 'lucide-react';
import type { Locale } from '../i18n/locales';
import { getUiString } from '../i18n/ui';

type LocaleScaffoldPageProps = {
  locale: Locale;
  onViewEnglish: () => void;
  onNavigateHome: () => void;
};

export function LocaleScaffoldPage({
  locale,
  onViewEnglish,
  onNavigateHome,
}: LocaleScaffoldPageProps) {
  return (
    <main className="min-h-screen bg-jurassic-soft/40 pt-32 pb-20">
      <section className="mx-auto max-w-4xl px-6">
        <div className="overflow-hidden rounded-[2rem] border border-jurassic-accent/15 bg-white shadow-premium">
          <div className="bg-jurassic-dark px-8 py-8 text-white">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-jurassic-accent">
              <Globe2 className="h-3.5 w-3.5" />
              {getUiString(locale, 'localeScaffold.badge')}
            </div>
            <h1 className="mt-5 max-w-2xl text-4xl font-bold tracking-tight">
              {getUiString(locale, 'localeScaffold.title')}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/72">
              {getUiString(locale, 'localeScaffold.body')}
            </p>
          </div>

          <div className="flex flex-col gap-4 px-8 py-8 sm:flex-row">
            <button
              type="button"
              onClick={onViewEnglish}
              className="rounded-full bg-jurassic-accent px-6 py-3 text-sm font-bold text-white shadow-premium transition hover:brightness-110"
            >
              {getUiString(locale, 'localeScaffold.primaryAction')}
            </button>
            <button
              type="button"
              onClick={onNavigateHome}
              className="rounded-full border border-jurassic-dark/10 bg-white px-6 py-3 text-sm font-semibold text-jurassic-dark transition hover:border-jurassic-accent/30 hover:text-jurassic-accent"
            >
              {getUiString(locale, 'localeScaffold.secondaryAction')}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
