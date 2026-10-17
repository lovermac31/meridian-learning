/**
 * RouteLink — a crawlable internal link for SPA routes.
 *
 * Renders a real `<a href>` (the localized URL from getLocalizedHref, so the
 * prerendered HTML carries a link crawlers can follow) while a plain left
 * click keeps the in-place SPA navigation: preventDefault, then the existing
 * handler receives the original (English) path, exactly as Navbar does.
 * Modified clicks (cmd/ctrl/shift/alt, middle button) fall through to the
 * browser so "open in new tab" works. Rewrite-served ecosystem routes are left
 * as native document navigations.
 */
import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { getLocalizedHref } from '../i18n/localizedHref';
import { getCurrentLocale } from '../i18n/routing';
import { isRewriteServedRoute } from '../lib/routeMetadata';

/** True for an unmodified primary-button click the SPA should handle in place. */
export function isPlainLeftClick(event: MouseEvent<HTMLElement>): boolean {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

/** The href an internal route link renders for the current page's locale. */
export function routeHref(path: string): string {
  return getLocalizedHref(path, getCurrentLocale());
}

/** onClick for an `<a href={routeHref(path)}>` that navigates in place. */
export function handleRouteClick(
  event: MouseEvent<HTMLAnchorElement>,
  path: string,
  onNavigate: (path: string) => void,
) {
  if (!isPlainLeftClick(event)) return;
  if (isRewriteServedRoute(path.split('?')[0].split('#')[0])) return;
  event.preventDefault();
  onNavigate(path);
}

type RouteLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'onClick'> & {
  /** Route path (English, unlocalized), e.g. '/series/compare'. */
  to: string;
  /** Existing SPA navigation handler; receives `to`. */
  onNavigate: (path: string) => void;
};

export const RouteLink = ({ to, onNavigate, children, ...rest }: RouteLinkProps) => (
  <a {...rest} href={routeHref(to)} onClick={(event) => handleRouteClick(event, to, onNavigate)}>
    {children}
  </a>
);
