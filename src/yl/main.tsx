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
import { YlBotUI } from './YlBotUI';
import { initPageI18n } from './pageI18n';

// Localize the static page (content + metadata + selector) for the resolved
// language BEFORE mounting the island, so the page and the BotUI share one
// language from first paint. Guarded so a DOM/i18n error can never block the
// island mount.
try {
  initPageI18n();
} catch {
  /* page i18n is progressive enhancement — never block the island */
}

const mount = document.getElementById('yl-botui-root');
if (mount) {
  createRoot(mount).render(
    <StrictMode>
      <YlBotUI />
    </StrictMode>,
  );
}
