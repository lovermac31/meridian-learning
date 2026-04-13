export const localeConfig = {
  en: {
    label: 'English',
    routePrefix: '',
    htmlLang: 'en',
    ogLocale: 'en_GB',
    isDefault: true,
    isReleasedPublic: true,
  },
  vi: {
    label: 'Tiếng Việt',
    routePrefix: '/vi',
    htmlLang: 'vi',
    ogLocale: 'vi_VN',
    isDefault: false,
    isReleasedPublic: false,
  },
} as const;

export const locales = Object.keys(localeConfig) as Array<keyof typeof localeConfig>;

export type Locale = (typeof locales)[number];

export type LocaleDefinition = (typeof localeConfig)[Locale];

export const DEFAULT_LOCALE: Locale = 'en';
export const SECONDARY_LOCALE: Locale = 'vi';

export const localeLabels: Record<Locale, string> = Object.fromEntries(
  locales.map((locale) => [locale, localeConfig[locale].label]),
) as Record<Locale, string>;

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getLocaleDefinition(locale: Locale): LocaleDefinition {
  return localeConfig[locale];
}

export function isReleasedPublicLocale(locale: Locale) {
  return getLocaleDefinition(locale).isReleasedPublic;
}

export function getReleasedPublicLocales() {
  return locales.filter((locale) => isReleasedPublicLocale(locale));
}

export function isDevelopmentEnvironment() {
  const meta = import.meta as ImportMeta & {
    env?: {
      DEV?: boolean;
    };
  };

  if (typeof meta.env?.DEV === 'boolean') {
    return meta.env.DEV;
  }

  if (typeof process !== 'undefined') {
    return process.env.NODE_ENV !== 'production';
  }

  return false;
}
