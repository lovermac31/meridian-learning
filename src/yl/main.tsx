/**
 * YL BotUI island entry — mounts a small, purpose-built parent-admissions
 * guide into the static /young-learners-speaking/ page.
 *
 * SCOPE: This module exists for the YL static page ONLY. The main SPA mounts
 * its own BotUIChat from src/components/BotUIChat.tsx via src/App.tsx — that
 * is unchanged by this work.
 *
 * SAFETY:
 * - Mount is guarded: if #yl-botui-root is absent, the script no-ops cleanly.
 * - All rendering is scoped under the mount node; no globals are mutated.
 * - No PII is collected by the bot — it is a navigation/CTA guide only.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { inject as injectAnalytics } from '@vercel/analytics';
import { loadGa4 } from '../lib/ga4';
import { YlBotUI } from './YlBotUI';
import { PromoVideoModal } from './PromoVideoModal';
import { initPageI18n } from './pageI18n';
import { trackCtaClick } from '../lib/analytics';
import { GlobalContactPanel } from '../components/GlobalContactPanel';
import './contact-panel.css';

const YL_SPEED_INSIGHTS_ROUTE = '/young-learners-speaking';

// Keep telemetry on the static YL page without asking Vite to resolve
// Vercel's runtime-only /_vercel/* URLs during a multi-page build.
try {
  injectSpeedInsights({
    framework: 'react',
    route: YL_SPEED_INSIGHTS_ROUTE,
  });
  injectAnalytics();
  loadGa4();
} catch {
  // Telemetry is progressive enhancement and must never block the page.
}

// Localize the static page (content + metadata + selector) for the resolved
// language BEFORE mounting the island, so the page and the BotUI share one
// language from first paint. Guarded so a DOM/i18n error can never block the
// island mount.
try {
  initPageI18n();
} catch {
  /* page i18n is progressive enhancement — never block the island */
}

// PayPal (second payment option, outside Vietnam): one delegated listener so
// every PayPal link and jump link on the static page reports a unique label.
document.addEventListener('click', (event) => {
  const link = (event.target as Element | null)?.closest?.('a[data-paypal-item], a[data-paypal-jump]');
  if (!link) return;
  const item = link.getAttribute('data-paypal-item');
  try {
    trackCtaClick({
      label: item ? `yl_paypal_${item}` : `yl_paypal_jump_${link.getAttribute('data-paypal-jump')}`,
      type: item ? 'secondary' : 'low_friction',
      segment: 'parent_student',
    });
  } catch {
    /* analytics must never block the payment link */
  }
});

// Header menu (<details>): Escape closes it and returns focus to the toggle; a click or tap outside closes it.
document.addEventListener('keydown', (event) => {
  const menu = document.querySelector<HTMLDetailsElement>('details.yl2-hdr-menu[open]');
  if (event.key !== 'Escape' || !menu) return;
  menu.open = false;
  menu.querySelector('summary')?.focus();
});
document.addEventListener('pointerdown', (event) => {
  const menu = document.querySelector<HTMLDetailsElement>('details.yl2-hdr-menu[open]');
  if (menu && !menu.contains(event.target as Node)) menu.open = false;
});

const mount = document.getElementById('yl-botui-root');
if (mount) {
  createRoot(mount).render(
    <StrictMode>
      <YlBotUI />
      <PromoVideoModal />
    </StrictMode>,
  );
}

// Contact button (Zalo, WhatsApp, WeChat, Facebook, Email): the same component as the main site,
// in its own mount node so it is independent of the BotUI island above.
try {
  let contactMount = document.getElementById('yl-contact-root');
  if (!contactMount) {
    contactMount = document.createElement('div');
    contactMount.id = 'yl-contact-root';
    document.body.appendChild(contactMount);
  }
  createRoot(contactMount).render(
    <StrictMode>
      <GlobalContactPanel />
    </StrictMode>,
  );
} catch {
  /* contact button is progressive enhancement — never block the page */
}
