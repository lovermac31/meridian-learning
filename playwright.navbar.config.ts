import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  testMatch: 'navbar-layout.spec.ts',
  fullyParallel: false,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:4176', browserName: 'chromium', launchOptions: { args: ['--mute-audio'] } },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4176 --strictPort',
    url: 'http://127.0.0.1:4176',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
