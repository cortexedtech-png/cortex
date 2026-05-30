import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration for Lexica
 * Requires the Next.js dev server to be running at http://localhost:3001
 */
export default defineConfig({
  testDir: './__tests__/e2e',
  testMatch: '**/*.spec.ts',

  /* Run tests in sequence (avoids port conflicts with localStorage state) */
  fullyParallel: false,

  /* Fail fast on CI */
  forbidOnly: !!process.env.CI,

  /* Retry once on CI */
  retries: process.env.CI ? 1 : 0,

  /* One worker in CI, auto-detect locally */
  workers: process.env.CI ? 1 : undefined,

  reporter: [['html', { outputFolder: '__tests__/e2e/report' }], ['list']],

  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    /* Clear storage state between tests */
    storageState: undefined,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Start Next.js dev server automatically before running E2E tests */
  webServer: {
    command: 'pnpm dev -- --port 3001',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
