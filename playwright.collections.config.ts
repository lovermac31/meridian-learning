import { defineConfig } from '@playwright/test';
// Level 1-5 collections (13 Nov 2026): every product page shows its sample pages above the price, EN and VI, phone and desktop.
export default defineConfig({
  testDir: './tests/browser', testMatch: 'collections-samples.spec.ts', fullyParallel: true,
  workers: 4, maxFailures: 8, reporter: 'list', timeout: 45000,
  use: { extraHTTPHeaders: { 'x-je-automation': 'playwright' }, baseURL: 'http://127.0.0.1:4177', browserName: 'chromium', headless: true, launchOptions: { args: ['--mute-audio'] }, screenshot: 'only-on-failure' },
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4177 --strictPort', url: 'http://127.0.0.1:4177', reuseExistingServer: false, timeout: 60000 },
});
