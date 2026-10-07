import { createRoot, hydrateRoot } from 'react-dom/client';
import { AppRoot } from './AppRoot';
import './index.css';
// Scoped under .je-testimonials — safe to load globally; only the testimonials
// section consumes it. Imported here (not in the component) so the component
// stays unit-testable under node:test.
import './styles/testimonials.css';

const container = document.getElementById('root')!;

// Prerendered routes carry the server-rendered page body inside #root and are
// marked with data-ssr-route (scripts/prerender-route-metadata.mjs). Hydrate
// only when that markup was rendered for THIS pathname: a rewrite can serve
// one route's HTML for another URL (e.g. /pilot/:id → /index.html), and
// non-prerendered/private routes ship a static fallback that React must
// replace, not adopt.
if (container.dataset.ssrRoute === window.location.pathname) {
  hydrateRoot(container, <AppRoot />);
} else {
  createRoot(container).render(<AppRoot />);
}
