import { defineConfig } from '@playwright/test';

// Floating Zalo button acceptance against the built site (npm run build first). Muted browser, no sound ever.
export default defineConfig({
  testDir: './tests/browser',
  testMatch: 'zalo-float.spec.ts',
  fullyParallel: false,
  reporter: 'list',
  timeout: 45_000,
  use: {
    // Every request from a test run carries this header: api/go/zalo.ts (PR #252) then redirects but never counts it.
    extraHTTPHeaders: { 'x-je-automation': 'playwright' },
    baseURL: 'http://127.0.0.1:4177',
    browserName: 'chromium',
    headless: true,
    launchOptions: { args: ['--mute-audio'] },
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4177 --strictPort',
    url: 'http://127.0.0.1:4177',
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
