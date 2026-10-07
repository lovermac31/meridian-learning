/**
 * ssrLocation — SSR-safe access to the current URL.
 *
 * In the browser this is just `window.location`. During the build-time
 * prerender (scripts/prerender-route-metadata.mjs → src/entry-server.tsx)
 * there is no `window`, so the prerenderer sets the route being rendered
 * here before calling React. Rendering is sequential, so a module-level
 * value is sufficient.
 *
 * Only render-time reads go through this helper. Event handlers and effects
 * run in the browser only and may keep using `window.location` directly.
 */

export type SsrLocation = {
  pathname: string;
  search: string;
  hash: string;
};

const DEFAULT_SERVER_LOCATION: SsrLocation = { pathname: '/', search: '', hash: '' };

let serverLocation: SsrLocation = DEFAULT_SERVER_LOCATION;

export function isServerRender(): boolean {
  return typeof window === 'undefined';
}

/** Build-time only: set the route the server entry is about to render. */
export function setServerLocation(pathname: string): void {
  serverLocation = { pathname, search: '', hash: '' };
}

export function getCurrentLocation(): SsrLocation {
  if (typeof window === 'undefined') {
    return serverLocation;
  }

  const { pathname, search, hash } = window.location;
  return { pathname, search, hash };
}

export function getCurrentPathname(): string {
  return getCurrentLocation().pathname;
}
