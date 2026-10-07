import { StrictMode } from 'react';
import { Analytics } from '@vercel/analytics/react';
import App from './App';

/**
 * The single React tree shared by the browser entry (src/main.tsx) and the
 * build-time server entry (src/entry-server.tsx). Hydration requires both to
 * render exactly the same tree — change it here, never in one entry only.
 */
export function AppRoot() {
  return (
    <StrictMode>
      <App />
      <Analytics />
    </StrictMode>
  );
}
