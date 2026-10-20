import { StrictMode, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import App from './App';

/**
 * The single React tree shared by the browser entry (src/main.tsx) and the
 * build-time server entry (src/entry-server.tsx). Hydration requires both to
 * render exactly the same tree — change it here, never in one entry only.
 */
export function AppRoot() {
  // Passive effects run after the hydration commit, when every handler is
  // attached. On / and /vi the inline bootstrap (scripts/prerender-route-
  // metadata.mjs) waits for this to replay toggle taps made before hydration.
  useEffect(() => {
    window.dispatchEvent(new Event('je:hydrated'));
  }, []);

  return (
    <StrictMode>
      <App />
      <Analytics />
    </StrictMode>
  );
}
