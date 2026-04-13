import { DEFAULT_LOCALE, type Locale, isDevelopmentEnvironment } from '../locales';
import { enUi } from './en';
import { viUi } from './vi';

const dictionaries = {
  en: enUi,
  vi: viUi,
} as const;

type Dictionary = typeof enUi;

function lookupValue(source: unknown, segments: string[]) {
  let current = source;

  for (const segment of segments) {
    if (!current || typeof current !== 'object' || !(segment in current)) {
      return undefined;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return current;
}

export function getUiString(locale: Locale, key: string) {
  const segments = key.split('.');
  const dictionary = dictionaries[locale] as Dictionary;
  const localizedValue = lookupValue(dictionary, segments);

  if (typeof localizedValue === 'string') {
    return localizedValue;
  }

  const fallbackValue = lookupValue(dictionaries[DEFAULT_LOCALE], segments);

  if (typeof fallbackValue === 'string') {
    if (locale !== DEFAULT_LOCALE && isDevelopmentEnvironment()) {
      console.warn(`[i18n] Missing "${key}" for locale "${locale}". Falling back to English.`);
    }

    return fallbackValue;
  }

  if (isDevelopmentEnvironment()) {
    console.warn(`[i18n] Missing dictionary key "${key}" in default locale.`);
  }

  return key;
}

