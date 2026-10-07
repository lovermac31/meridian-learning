/**
 * Build-time server entry (NOT shipped to the browser).
 *
 * Built with `vite build --ssr src/entry-server.tsx --outDir dist-ssr` and
 * imported by scripts/prerender-route-metadata.mjs, which renders every
 * prerendered route to static markup and injects it into that route's
 * dist/<route>/index.html inside #root. src/main.tsx then hydrates that
 * markup instead of replacing it.
 *
 * The rendered tree is src/AppRoot.tsx — the same tree src/main.tsx
 * hydrates — so server and client output cannot drift apart.
 */
import { renderToPipeableStream } from 'react-dom/server';
import { Writable } from 'node:stream';
import { AppRoot } from './AppRoot';
import { setServerLocation } from './lib/ssrLocation';

/**
 * Render `pathname` to static HTML. `onAllReady` fires only after every
 * Suspense boundary (the lazy-loaded route components) has resolved, so the
 * result contains the full page body rather than the Suspense fallback.
 * Any render error rejects — the prerender fails loudly instead of shipping
 * a client-render fallback.
 */
export function renderRoute(pathname: string): Promise<string> {
  setServerLocation(pathname);

  return new Promise((resolve, reject) => {
    let html = '';
    let failed: unknown = null;
    const sink = new Writable({
      write(chunk, _encoding, callback) {
        html += chunk.toString();
        callback();
      },
      final(callback) {
        if (failed) reject(failed);
        else resolve(html);
        callback();
      },
    });

    const { pipe } = renderToPipeableStream(
      <AppRoot />,
      {
        // React outlines Suspense boundaries larger than progressiveChunkSize
        // (default 12.8 kB) into a hidden <div> + inline $RC script. A static
        // prerender must keep every boundary inline so the page body is plain,
        // visible markup for crawlers that do not run JavaScript.
        progressiveChunkSize: Number.POSITIVE_INFINITY,
        onAllReady() {
          pipe(sink);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          failed = error;
        },
      },
    );
  });
}
