import { defineConfig, devices } from '@playwright/test';

/**
 * E2E config for the money paths (Paystack checkout/verify, B2B reseller
 * ordering, PIN redemption).
 *
 * IMPORTANT: these specs are structural. They assert that routes resolve, that
 * the expected controls render, and that unauthenticated access to protected
 * routes redirects. They deliberately do NOT assert successful payment, order
 * or redemption outcomes — those require an active Supabase project with the
 * edge functions deployed (paystack-* / b2b-*), which was not available when
 * this suite was written.
 *
 * See e2e/README.md for how to run these against a live backend.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 30_000,
  expect: { timeout: 7_000 },
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
