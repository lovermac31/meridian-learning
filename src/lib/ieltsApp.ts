/**
 * The IELTS Speaking app (https://ielts.jurassicenglish.com), featured on the home page, /products and the adult
 * IELTS pages (Jay + CEO, 2 Nov 2026). One entrance link per placement, tagged
 * utm_source=site & utm_medium=entrance & utm_content=<placement>, with "-vi" on Vietnamese pages (coverage audit,
 * 2 Nov 2026: the EN and VI home pages could not be told apart).
 */
export const IELTS_APP_ORIGIN = 'https://ielts.jurassicenglish.com';

export type IeltsAppPlacement = 'home' | 'products' | 'country' | 'insights' | 'tool';

export function ieltsAppHref(placement: IeltsAppPlacement, locale: string = 'en', content?: string) {
  // `content` (an answer page's slug) replaces the placement as utm_content, so each page's clicks can be told apart.
  return `${IELTS_APP_ORIGIN}/?utm_source=site&utm_medium=entrance&utm_content=${content ?? placement}${locale === 'vi' ? '-vi' : ''}`;
}
