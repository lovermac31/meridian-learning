const SOCIAL_SOURCE_VALUES = new Set([
  'facebook',
  'fb',
  'instagram',
  'ig',
  'meta',
  'social',
]);

const SOCIAL_REFERRER_HOSTS = [
  'facebook.com',
  'instagram.com',
  'threads.net',
] as const;

type TrafficIntentInput = {
  search: string;
  referrer: string;
};

function normalizedHost(referrer: string): string {
  if (!referrer) return '';

  try {
    return new URL(referrer).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Identifies high-confidence social traffic without storing visitor data.
 * Used only to reorder existing homepage pathways, never to hide content.
 */
export function hasSocialTrafficIntent({ search, referrer }: TrafficIntentInput): boolean {
  const params = new URLSearchParams(search);
  const source = (params.get('utm_source') ?? '').trim().toLowerCase();
  const medium = (params.get('utm_medium') ?? '').trim().toLowerCase();

  if (SOCIAL_SOURCE_VALUES.has(source) || medium === 'social' || medium === 'paid_social') {
    return true;
  }

  const host = normalizedHost(referrer);
  return SOCIAL_REFERRER_HOSTS.some(
    (candidate) => host === candidate || host.endsWith(`.${candidate}`),
  );
}

export function detectSocialTrafficIntent(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false;
  }

  return hasSocialTrafficIntent({
    search: window.location.search,
    referrer: document.referrer,
  });
}
