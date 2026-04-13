import { type Locale } from '../i18n/locales';
import { isPublicContentReleased } from '../i18n/content';
import { resolveLocalizedRoute, switchLocaleRoute } from '../i18n/routing';
import { getUiString } from '../i18n/ui';

type LanguageSwitcherProps = {
  currentRoute: string;
  onNavigate: (path: string) => void;
};

export function LanguageSwitcher({ currentRoute, onNavigate }: LanguageSwitcherProps) {
  const route = resolveLocalizedRoute(currentRoute);

  if (!route.isLocalizable || route.isPrivateOrNonLocalized) {
    return null;
  }

  const currentLocale = route.locale;
  const isCurrentRouteReleased = isPublicContentReleased(route.pathname, currentLocale);

  return (
    <div className="flex w-full flex-col items-start gap-2 md:w-auto">
      <div
        className="inline-flex w-full rounded-full border border-white/10 bg-white/5 p-1 md:w-auto"
        role="group"
        aria-label={getUiString(currentLocale, 'languageSwitcher.ariaLabel')}
      >
        {(['en', 'vi'] as Locale[]).map((locale) => {
          const isActive = locale === currentLocale;
          const nextRoute = switchLocaleRoute(currentRoute, locale);

          return (
            <button
              key={locale}
              type="button"
              onClick={() => onNavigate(nextRoute)}
              disabled={isActive}
              aria-pressed={isActive}
              className={`min-h-10 flex-1 rounded-full px-4 py-2 text-sm font-semibold transition md:min-h-0 md:flex-none md:px-3 md:py-1.5 md:text-xs ${
                isActive
                  ? 'bg-jurassic-accent text-white shadow-premium'
                  : 'text-white/72 hover:text-white'
              }`}
            >
              {getUiString(currentLocale, `languageSwitcher.options.${locale}`)}
            </button>
          );
        })}
      </div>
      {!isCurrentRouteReleased ? (
        <p className="max-w-full text-[11px] leading-relaxed text-white/45 md:max-w-[14rem]">
          {getUiString(currentLocale, 'languageSwitcher.scaffoldNotice')}
        </p>
      ) : null}
    </div>
  );
}
