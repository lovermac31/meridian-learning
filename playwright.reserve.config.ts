import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  testMatch: 'story-club-reserve.spec.ts',
  fullyParallel: false,
  reporter: 'list',
  use: {
    // Every request from a test run carries this header: api/go/zalo.ts then redirects but never counts it as a click.
    extraHTTPHeaders: { 'x-je-automation': 'playwright' },
    baseURL: 'http://127.0.0.1:4174',
    browserName: 'chromium',
    launchOptions: { args: ['--mute-audio'] },
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4174 --strictPort',
    url: 'http://127.0.0.1:4174',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
