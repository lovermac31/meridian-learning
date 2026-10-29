import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser', testMatch: 'pay-everywhere.spec.ts', fullyParallel: true,
  workers: 4, reporter: 'list', timeout: 30000,
  use: { baseURL: 'http://127.0.0.1:4176', browserName: 'chromium', headless: true, launchOptions: { args: ['--mute-audio'] }, screenshot: 'only-on-failure' },
  webServer: { command: 'npm run preview -- --host 127.0.0.1 --port 4176 --strictPort', url: 'http://127.0.0.1:4176', reuseExistingServer: false, timeout: 60000 },
});
