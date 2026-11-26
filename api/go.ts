import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  GO_CAMPAIGNS, GO_DESTINATIONS, GO_MEDIUM, GO_PRODUCT_IDS, GO_REF_HOSTS, GO_SOURCES,
} from './_lib/goConfig.js';
import { recordServerEvent } from './_lib/eventWriter.js';
import { classifyRequest } from './_lib/automation.js';

type Dest = keyof typeof GO_DESTINATIONS;

export function trackedUrl(destination: string, campaign: string, source = 'direct'): string {
  const url = new URL(destination);
  url.searchParams.set('utm_source', source);
  url.searchParams.set('utm_medium', GO_MEDIUM);
  url.searchParams.set('utm_campaign', campaign);
  return url.toString();
}

function first(value: unknown): unknown {
  return Array.isArray(value) ? value[0] : value;
}

export function sourceOf(value: unknown): string {
  const v = first(value);
  return typeof v === 'string' && (GO_SOURCES as readonly string[]).includes(v) ? v : 'direct';
}

function refHost(value: unknown): string | null {
  const v = first(value);
  if (typeof v !== 'string' || v.length > 2048) return null;
  try {
    const url = new URL(v);
    return ['https:', 'http:'].includes(url.protocol)
      && (GO_REF_HOSTS as readonly string[]).includes(url.hostname)
      ? url.hostname : null;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }

  // Prefer the public path over any caller-supplied campaign query parameter.
  let campaign: unknown = first(req.query?.campaign);
  if (req.url?.startsWith('/go/')) {
    campaign = req.url.split('?')[0].slice('/go/'.length);
  }
  const rawDest = first(req.query?.dest);
  const dest = rawDest === undefined ? 'kofi' : rawDest;
  if (typeof campaign !== 'string' || !(GO_CAMPAIGNS as readonly string[]).includes(campaign)
    || typeof dest !== 'string' || !Object.hasOwn(GO_DESTINATIONS, dest)) {
    return res.status(404).end();
  }

  const d = dest as Dest;
  const source = sourceOf(req.query?.src);
  const ref = refHost(req.headers?.referer);
  const location = trackedUrl(GO_DESTINATIONS[d], campaign, source);

  // Bots, link previews, HEAD probes and our own browser tests are redirected but never counted.
  const verdict = classifyRequest(req.headers as Record<string, string | string[] | undefined>, req.method);
  if (verdict.automated) {
    res.setHeader('X-JE-Click', `skipped:${verdict.reason}`);
  } else {
    res.setHeader('X-JE-Click', 'recorded');
    console.log(JSON.stringify({
      evt: 'go_click', campaign, dest: d, src: source, ref_host: ref, ts: new Date().toISOString(),
    }));
    // Durable count in je_events (checkout_start = the visitor was sent to a payment page).
    // Fail-open: a database error never blocks the redirect.
    try {
      await recordServerEvent({
        event: 'checkout_start',
        path: `/go/${campaign}`,
        product_id: GO_PRODUCT_IDS[d],
        utm_source: source,
        utm_medium: GO_MEDIUM,
        utm_campaign: campaign,
        referrer_host: ref ?? undefined,
      });
    } catch (err) {
      console.warn('[go] event recording threw (fail-open)', err);
    }
  }

  res.setHeader('Location', location);
  return res.status(302).end();
}
