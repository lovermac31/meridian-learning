/**
 * The IELTS Speaking app (https://ielts.jurassicenglish.com), featured on the home page and /products (Jay + CEO,
 * 2 Nov 2026). One entrance link per placement, tagged utm_source=site & utm_medium=entrance & utm_content=<placement>.
 */
export const IELTS_APP_ORIGIN = 'https://ielts.jurassicenglish.com';

export function ieltsAppHref(placement: 'home' | 'products') {
  return `${IELTS_APP_ORIGIN}/?utm_source=site&utm_medium=entrance&utm_content=${placement}`;
}
