import { defineConfig, devices } from '@playwright/test';

// The app is built with `base: '/vlinder/'` in CI (process.env.CI is set by
// both GitHub Actions and Playwright's own test runner) and `base:
// '/dashboard/'` locally - see vite.config.ts. `vite preview` serves the
// build under that same base path, so the baseURL used here has to track it
// or every relative navigation/asset request will 404.
const base = process.env.CI ? '/vlinder/' : '/dashboard/';
const port = 4173;
// vite preview (with no --host flag) only binds the IPv6 loopback address
// by default on some setups, so "localhost" is used rather than the
// IPv4-only 127.0.0.1 to make sure requests actually reach it.
const baseURL = `http://localhost:${port}${base}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',

  use: {
    baseURL,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Builds and serves the app the same way it's deployed (vite preview over
  // the production build), rather than the dev server, so the smoke test
  // exercises the real bundle.
  webServer: {
    command: `yarn build && yarn preview --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
