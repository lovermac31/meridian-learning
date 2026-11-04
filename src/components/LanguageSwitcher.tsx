import { type Locale } from '../i18n/locales';
import { isPublicContentReleased } from '../i18n/content';
import { resolveLocalizedRoute, switchLocaleRoute } from '../i18n/routing';
import { getUiString } from '../i18n/ui';

type LanguageSwitcherProps = {
  currentRoute: string;
  onNavigate: (path: string) => void;
};

export function LanguageSwitcher({ currentRoute, onNavigate }: LanguageSwitcherProps) {
  // Resolve visibility/locale from the pathname only. `currentRoute` may carry
  // a query string or hash (UTM links, deep links); the build-time prerender
  // cannot know those, so including them here made the server and client
  // render different markup (and hid the switcher on any ?query/#hash URL).
  // switchLocaleRoute below still receives the full route so a language switch
  // preserves the query and hash.
  const route = resolveLocalizedRoute(new URL(currentRoute, 'https://jurassicenglish.com').pathname);

  if (!route.isLocalizable || route.isPrivateOrNonLocalized) {
    return null;
  }

  const currentLocale = route.locale;
  const isCurrentRouteReleased = isPublicContentReleased(route.pathname, currentLocale);

  return (
    <div className="flex w-full flex-col items-start gap-2 md:w-auto">
      <div
        className="inline-flex w-full rounded-full border border-sb-border bg-white p-1 md:w-auto"
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
              aria-label={getUiString(currentLocale, `languageSwitcher.optionAriaLabels.${locale}`)}
              className={`min-h-10 flex-1 rounded-full px-4 py-2 text-sm font-semibold transition md:min-h-0 md:flex-none md:px-3 md:py-1.5 md:text-xs ${
                isActive
                  ? 'bg-sb-forest text-white'
                  : 'text-sb-slate hover:text-sb-forest'
              }`}
            >
              {/* The switcher uses full names in the drawer and compact labels
                  only when the full desktop navigation is visible (>= 2xl). */}
              <span className="2xl:hidden">{getUiString(currentLocale, `languageSwitcher.options.${locale}`)}</span>
              {/* Desktop header reads "EN | Tiếng Việt". */}
              <span className="hidden 2xl:inline">{locale === 'en' ? 'EN' : getUiString(currentLocale, `languageSwitcher.options.${locale}`)}</span>
            </button>
          );
        })}
      </div>
      {!isCurrentRouteReleased ? (
        <p className="max-w-full text-[11px] leading-relaxed text-sb-slate md:max-w-[14rem]">
          {getUiString(currentLocale, 'languageSwitcher.scaffoldNotice')}
        </p>
      ) : null}
    </div>
  );
}
