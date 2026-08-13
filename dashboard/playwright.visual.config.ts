import { defineConfig, devices } from '@playwright/test';

/**
 * Separate Playwright config for the visual regression capture harness
 * (e2e/visual.spec.ts). It is deliberately kept out of the default
 * `playwright test` run (playwright.config.ts has a testIgnore for it) so CI
 * only ever runs the functional smoke test.
 *
 * Run with `yarn test:visual`, optionally pointing the output somewhere:
 *   VISUAL_OUT_DIR=/tmp/before yarn test:visual
 */
const base = process.env.CI ? '/vlinder/' : '/dashboard/';
const port = 4174;
const baseURL = `http://localhost:${port}${base}`;

export default defineConfig({
  testDir: './e2e',
  testMatch: /visual\.spec\.ts/,
  // Screenshots of a d3-heavy page are sensitive to CPU contention; run them
  // one at a time so every capture gets the same settling budget.
  workers: 1,
  fullyParallel: false,
  retries: 0,
  reporter: 'list',
  timeout: 120_000,

  use: {
    baseURL,
    trace: 'off',
    reducedMotion: 'reduce',
    deviceScaleFactor: 1,
    // Pin locale/timezone so axis labels and dates never drift between the
    // before and after runs.
    locale: 'nl-BE',
    timezoneId: 'Europe/Brussels',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], deviceScaleFactor: 1 },
    },
  ],

  webServer: {
    command: `yarn build && yarn preview --port ${port} --strictPort`,
    url: baseURL,
    // Always rebuild: reusing a preview server left over from an earlier run
    // would silently screenshot the *previous* build.
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
