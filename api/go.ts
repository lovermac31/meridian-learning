import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GO_CAMPAIGNS, GO_DESTINATIONS, GO_REF_HOSTS, GO_UTM } from './_lib/goConfig.js';

export function trackedUrl(destination: string, campaign: string): string {
  const url = new URL(destination);
  url.searchParams.set('utm_source', GO_UTM.source);
  url.searchParams.set('utm_medium', GO_UTM.medium);
  url.searchParams.set('utm_campaign', campaign);
  return url.toString();
}

function refHost(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 2048) return null;
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol)
      && (GO_REF_HOSTS as readonly string[]).includes(url.hostname)
      ? url.hostname : null;
  } catch {
    return null;
  }
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }

  // Prefer the public path over any caller-supplied campaign query parameter.
  let campaign: unknown = req.query?.campaign;
  if (req.url?.startsWith('/go/')) {
    campaign = req.url.split('?')[0].slice('/go/'.length);
  }
  const dest = req.query?.dest === undefined ? 'kofi' : req.query.dest;
  if (typeof campaign !== 'string' || !(GO_CAMPAIGNS as readonly string[]).includes(campaign)
    || typeof dest !== 'string' || !Object.hasOwn(GO_DESTINATIONS, dest)) {
    return res.status(404).end();
  }

  const location = trackedUrl(GO_DESTINATIONS[dest as keyof typeof GO_DESTINATIONS], campaign);
  console.log(JSON.stringify({
    evt: 'go_click', campaign, dest,
    ref_host: refHost(req.headers.referer), ts: new Date().toISOString(),
  }));
  res.setHeader('Location', location);
  return res.status(302).end();
}
