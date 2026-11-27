import { STARTERS_IDS, STARTERS_VI_PUBLIC } from '../../src/i18n/content/startersFlags';

/** True for a Starters product whose Vietnamese twin is held (no native read yet): its /vi card and page do not exist. */
export const startersViHeld = (id: string): boolean => !STARTERS_VI_PUBLIC && STARTERS_IDS.includes(id);
/** Is this product expected on the page of this locale (a held Starters product is English only)? */
export const expectedInLocale = (id: string, locale: 'en' | 'vi'): boolean => locale === 'en' || !startersViHeld(id);
