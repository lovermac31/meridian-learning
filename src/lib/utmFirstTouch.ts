/**
 * First-touch UTM (funnel audit, 2 Nov 2026, fix 2). A Facebook-group visitor lands with
 * ?utm_source=facebook&utm_medium=group&utm_campaign=vn-groups-2026-11&utm_content=mon-g1, then clicks a reserve
 * or Zalo link that used to carry only a placement tag (utm_source=story-club, =float, =reserve). The campaign, the
 * medium and the post id were lost. Now the first utm_* set of the visit is kept in sessionStorage and put on
 * every /go/zalo link and on the reserve link. First touch wins: a later tagged page view does not replace it.
 * Pure functions here so node:test can cover them; the React hook reads them after hydration (SSR never sees them).
 */
import { useEffect, useState } from 'react';

export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
export type UtmKey = (typeof UTM_KEYS)[number];
export type FirstTouch = Partial<Record<UtmKey, string>>;

export const FIRST_TOUCH_STORAGE_KEY = 'je_utm_first_touch';
type TouchStorage = Pick<Storage, 'getItem' | 'setItem'>;

/** A value safe in a link and in the events table: printable, no spaces beyond trimming, at most 64 characters. */
export function cleanUtmValue(value: string | null | undefined): string | undefined {
  const v = (value ?? '').trim().slice(0, 64);
  return v && /^[\w.\-:%|+]+$/.test(v) ? v : undefined;
}

/** The utm_* set in a URL's query string; empty when there is no utm_source. */
export function utmFromSearch(search: string): FirstTouch {
  const params = new URLSearchParams(search);
  const touch: FirstTouch = {};
  for (const key of UTM_KEYS) {
    const value = cleanUtmValue(params.get(key));
    if (value) touch[key] = value;
  }
  return touch.utm_source ? touch : {};
}

/** Keep the visit's first utm_* set (first touch wins); return whatever is kept after this call. */
export function captureFirstTouch(search: string, storage: TouchStorage | null): FirstTouch {
  const kept = readFirstTouch(storage);
  if (kept.utm_source) return kept;
  const fresh = utmFromSearch(search);
  if (!fresh.utm_source) return {};
  try {
    storage?.setItem(FIRST_TOUCH_STORAGE_KEY, JSON.stringify(fresh));
  } catch {
    /* Storage can be blocked (private mode, settings); the URL's values still apply to this page. */
  }
  return fresh;
}

export function readFirstTouch(storage: TouchStorage | null): FirstTouch {
  try {
    const raw = storage?.getItem(FIRST_TOUCH_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const touch: FirstTouch = {};
    for (const key of UTM_KEYS) {
      const value = cleanUtmValue(typeof parsed[key] === 'string' ? (parsed[key] as string) : undefined);
      if (value) touch[key] = value;
    }
    return touch.utm_source ? touch : {};
  } catch {
    return {};
  }
}

/**
 * The link with the first touch applied: utm_source, utm_medium, utm_campaign and utm_term come from the first
 * landing; utm_content keeps the post id when the landing had one, else the link's own placement tag. A link with
 * no first touch is returned unchanged (the prerendered markup and the first client render stay identical).
 */
export function withFirstTouch(href: string, touch: FirstTouch | null | undefined): string {
  if (!touch?.utm_source) return href;
  const [pathAndQuery, hash] = href.split('#');
  const [path, query = ''] = pathAndQuery.split('?');
  const params = new URLSearchParams(query);
  for (const key of UTM_KEYS) {
    if (key === 'utm_content') { if (touch.utm_content) params.set(key, touch.utm_content); continue; }
    if (touch[key]) params.set(key, touch[key]!);
    else params.delete(key);
  }
  const next = params.toString();
  return `${path}${next ? `?${next}` : ''}${hash ? `#${hash}` : ''}`;
}

function sessionStore(): TouchStorage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

/** Capture on landing (App mounts once per page load). Safe to call more than once: first touch wins. */
export function captureFirstTouchFromLocation(): FirstTouch {
  if (typeof window === 'undefined') return {};
  return captureFirstTouch(window.location.search, sessionStore());
}

/** The first touch after hydration; null during SSR and the first client render, so markup matches. */
export function useFirstTouch(): FirstTouch | null {
  const [touch, setTouch] = useState<FirstTouch | null>(null);
  useEffect(() => {
    setTouch(captureFirstTouchFromLocation());
  }, []);
  return touch;
}
