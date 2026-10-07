/**
 * indexnow.mjs — pure helpers for scripts/indexnow-submit.mjs.
 *
 * IndexNow (https://www.indexnow.org) lets a site tell participating search
 * engines (Bing, Yandex, Naver, Seznam.cz, Yep, Amazon — NOT Google) that URLs
 * changed. One POST to api.indexnow.org is shared with every participant.
 *
 * The key is public by design: search engines verify ownership by fetching
 * https://jurassicenglish.com/<key>.txt and comparing its contents to the key.
 */

export const SITE_ORIGIN = 'https://jurassicenglish.com';
export const SITE_HOST = 'jurassicenglish.com';
export const INDEXNOW_KEY = '474778a35f518368eaaf77d2571e95b3';
export const KEY_LOCATION = `${SITE_ORIGIN}/${INDEXNOW_KEY}.txt`;
export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
/** Protocol limit per POST. */
export const MAX_URLS_PER_REQUEST = 10_000;

export const RESPONSE_MEANINGS = {
  200: 'OK — URLs received',
  202: 'Accepted — URLs received, key validation pending',
  400: 'Bad Request — invalid format',
  403: 'Forbidden — key not valid (key file missing or contents do not match)',
  422: 'Unprocessable Entity — URLs do not belong to the host, or key does not match the schema',
  429: 'Too Many Requests — rate limited / potential spam; retry later',
};

/** <loc> values from a sitemap.xml string. */
export function parseSitemapUrls(xml) {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((match) => match[1]);
}

/**
 * Normalise CLI input (full URLs or site paths like "/methodology") to
 * absolute https://jurassicenglish.com URLs, de-duplicated in order.
 * Throws on any URL for another host — IndexNow rejects mixed-host batches.
 */
export function normalizeUrls(inputs) {
  const seen = new Set();
  const urls = [];
  for (const raw of inputs) {
    const value = String(raw).trim();
    if (!value) continue;
    const url = new URL(value.startsWith('/') ? `${SITE_ORIGIN}${value}` : value);
    if (url.protocol !== 'https:' || url.host !== SITE_HOST) {
      throw new Error(`Refusing ${value}: IndexNow submissions must be ${SITE_ORIGIN} URLs`);
    }
    url.hash = '';
    const href = url.pathname === '/' && !url.search ? `${SITE_ORIGIN}/` : url.href;
    if (!seen.has(href)) {
      seen.add(href);
      urls.push(href);
    }
  }
  return urls;
}

export function chunk(items, size = MAX_URLS_PER_REQUEST) {
  const out = [];
  for (let index = 0; index < items.length; index += size) out.push(items.slice(index, index + size));
  return out;
}

export function buildPayload(urlList) {
  return {
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList,
  };
}
