import { StrictMode, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import App from './App';
import { loadGa4 } from './lib/ga4';

/**
 * The single React tree shared by the browser entry (src/main.tsx) and the
 * build-time server entry (src/entry-server.tsx). Hydration requires both to
 * render exactly the same tree — change it here, never in one entry only.
 */
export function AppRoot() {
  // Passive effects run after the hydration commit, when every handler is
  // attached. On server-rendered routes the inline bootstrap (scripts/prerender-
  // route-metadata.mjs) waits for this to replay button taps made before hydration.
  useEffect(() => {
    window.dispatchEvent(new Event('je:hydrated'));
    loadGa4(); // after hydration, so the server and browser trees stay identical
  }, []);

  return (
    <StrictMode>
      <App />
      <Analytics />
    </StrictMode>
  );
}
