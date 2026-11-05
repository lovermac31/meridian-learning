import { useEffect, useMemo, useState } from 'react';
import { getCountries, getCountryCallingCode, type CountryCode } from 'libphonenumber-js';

export type RegionOption = { country: CountryCode; name: string; callingCode: string };

/**
 * Country options for a locale, sorted by their localised name.
 *
 * Why this exists: region names come from `Intl.DisplayNames`, and Node (the build-time prerender) and the visitor's
 * browser ship different ICU/CLDR data ("Hong Kong SAR China" vs "Hong Kong", "Falkland Islands" vs "Falkland Islands
 * (Islas Malvinas)", "Palestinian Territories" vs "Palestine"). Rendering the full list during the prerender and again
 * in the first client render therefore gave different text and React threw hydration error #418 on every page that
 * carries a phone field (/, /vi, /products, /vi/products; 16 of 16 loads in the 5 Nov 2026 audit).
 */
export function buildRegionOptions(locale: string, countries: readonly CountryCode[] = getCountries()): RegionOption[] {
  const names = new Intl.DisplayNames([locale], { type: 'region' });
  return countries
    .map((country) => ({ country, name: names.of(country) ?? country, callingCode: getCountryCallingCode(country) }))
    .sort((a, b) => a.name.localeCompare(b.name, locale));
}

/**
 * The prerender and the first client render both list only the selected country, whose name is the same in every ICU
 * build (checked for en and vi); the full browser-localised list is filled in right after mount, so the markup React
 * hydrates is identical on both sides and nothing is suppressed.
 */
export function useRegionOptions(locale: string, selected: CountryCode): RegionOption[] {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const full = useMemo(() => (mounted ? buildRegionOptions(locale) : null), [locale, mounted]);
  const first = useMemo(() => (full ? null : buildRegionOptions(locale, [selected])), [full, locale, selected]);
  return full ?? first ?? [];
}
