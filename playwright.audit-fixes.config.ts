import { defineConfig } from '@playwright/test';

// Browser checks against the production build (run `npm run build` first). The server answers prerendered routes at
// their exact URL, as Vercel does, so hydration runs against the real prerendered markup.
export default defineConfig({
  testDir: './tests/browser',
  testMatch: 'audit-fixes-2026-11-05.spec.ts',
  fullyParallel: false,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:4177', browserName: 'chromium', launchOptions: { args: ['--mute-audio'] } },
  webServer: {
    command: 'node tests/browser/support/serve-dist.mjs 4177',
    url: 'http://127.0.0.1:4177/products',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
