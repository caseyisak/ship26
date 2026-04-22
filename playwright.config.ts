import { defineConfig, devices } from '@playwright/test';

/**
 * Phase 4 — Regression Guardian config
 *
 * Expects the dev or production server to already be running at BASE_URL.
 * Set PLAYWRIGHT_BASE_URL env var to override (default: http://localhost:3000).
 *
 * Usage:
 *   bun run dev &        # or: bun run build && bun run start
 *   bunx playwright test playwright/smoke.spec.ts
 */

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './playwright',
  timeout: 30_000,
  retries: 1,
  workers: 1, // serial — avoids flaky race conditions on shared dev server
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    // Capture console messages for hydration / GraphQL error checks
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
