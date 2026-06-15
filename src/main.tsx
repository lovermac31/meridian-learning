import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import App from './App.tsx';
import './index.css';
// Scoped under .je-testimonials — safe to load globally; only the testimonials
// section consumes it. Imported here (not in the component) so the component
// stays unit-testable under node:test.
import './styles/testimonials.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
);
