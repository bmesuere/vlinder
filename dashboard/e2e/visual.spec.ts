import { test, expect } from '@playwright/test';
import type { Page, Route } from '@playwright/test';
import path from 'node:path';

import {
  stationsFixture,
  liveMeasurementsFixture,
  historicMeasurementsFixtureFor,
} from '../src/tests/fixtures';

/**
 * Visual regression capture harness.
 *
 * This spec is NOT part of the normal `yarn test:e2e` run (the main
 * playwright.config.ts ignores it); it is only picked up by
 * playwright.visual.config.ts, which is run manually via
 * `yarn test:visual`. Its job is to produce a deterministic set of
 * full-page/viewport screenshots of every distinct screen state of the
 * dashboard, so a "before" set (Vuetify 3) and an "after" set (Vuetify 4)
 * can be compared side by side.
 *
 * Determinism:
 *  - the same API fixtures as the smoke tests are served via page.route,
 *    and the fixtures are pinned to a fixed NOW timestamp, so the charts
 *    always draw identical data;
 *  - localStorage is cleared so the store always falls back to its three
 *    hardcoded default stations;
 *  - CSS transitions/animations are disabled (plus Playwright's
 *    reducedMotion) so nothing is captured mid-flight;
 *  - captures wait for the d3 SVGs (map dots + all six graph line charts)
 *    and for web fonts before shooting.
 *
 * Output goes to $VISUAL_OUT_DIR (default e2e/__visual__).
 */

const OUT_DIR = process.env.VISUAL_OUT_DIR
  ? path.resolve(process.env.VISUAL_OUT_DIR)
  : path.resolve(__dirname, '__visual__');

const VIEWPORTS = [
  { name: '375', width: 375, height: 812 },
  { name: '768', width: 768, height: 1024 },
  { name: '1440', width: 1440, height: 900 },
];

function fulfillJson(route: Route, body: unknown) {
  return route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

async function installRoutes(page: Page) {
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url());

    if (url.pathname.endsWith('/stations')) {
      return fulfillJson(route, stationsFixture);
    }

    const historicMatch = url.pathname.match(/\/measurements\/([^/]+)$/);
    if (historicMatch) {
      return fulfillJson(route, historicMeasurementsFixtureFor(historicMatch[1]));
    }

    if (url.pathname.endsWith('/measurements')) {
      return fulfillJson(route, liveMeasurementsFixture);
    }

    return route.continue();
  });

  await page.route('https://www.googletagmanager.com/gtag/js**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: 'window.dataLayer = window.dataLayer || []; function gtag(){ dataLayer.push(arguments); } window.gtag = gtag;',
    })
  );

  // Kill every transition/animation before the app boots. Vuetify's own
  // transitions (dialog, fade, carousel) and d3's .transition() calls both
  // resolve instantly at 0s, so screenshots are never captured mid-flight.
  await page.addInitScript(() => {
    const css = `*, *::before, *::after {
      transition-duration: 0s !important;
      transition-delay: 0s !important;
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      animation-iteration-count: 1 !important;
      caret-color: transparent !important;
    }`;
    const apply = () => {
      const style = document.createElement('style');
      style.id = 'visual-test-reset';
      style.textContent = css;
      document.head.appendChild(style);
    };
    if (document.head) apply();
    else document.addEventListener('DOMContentLoaded', apply);
  });
}

/** Waits until the dashboard is fully drawn: Vuetify chrome, all six d3 line
 * charts, the d3 stations map, the station card images and web fonts. */
async function waitForDashboard(page: Page) {
  await expect(page.getByText('VLINDER', { exact: true }).first()).toBeVisible();

  const graphIds = [
    'weather_graph_temp',
    'weather_graph_rainVolume',
    'weather_graph_pressure',
    'weather_graph_windSpeed',
    'weather_graph_humidity',
  ];
  for (const id of graphIds) {
    await expect(page.locator(`#${id} svg`)).not.toHaveCount(0);
    await expect(page.locator(`#${id} path`)).not.toHaveCount(0);
  }

  await expect(page.locator('#stationsMap svg')).not.toHaveCount(0);
  await expect(page.locator('#stationsMap circle.station')).not.toHaveCount(0);

  // NOTE: the land-use donut lives in the *second* carousel item of each
  // station card and is only mounted once that slide is shown, so it is
  // deliberately not awaited here.

  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    await Promise.all(
      Array.from(document.images)
        .filter((img) => !img.complete)
        .map((img) => new Promise((res) => {
          img.addEventListener('load', res);
          img.addEventListener('error', res);
        }))
    );
  });

  // Let any in-flight d3 transition / ResizeObserver relayout settle.
  await page.waitForTimeout(1200);
}

async function shoot(page: Page, name: string, fullPage = false) {
  await page.screenshot({ path: path.join(OUT_DIR, `${name}.png`), fullPage, animations: 'disabled' });
}

test.use({ reducedMotion: 'reduce' });

for (const vp of VIEWPORTS) {
  test.describe(`viewport ${vp.width}x${vp.height}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await installRoutes(page);
    });

    test(`captures every dashboard state at ${vp.name}`, async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => window.localStorage.clear());
      await page.reload();
      await waitForDashboard(page);

      // (a) the whole dashboard: map, station cards, chips, all six graphs,
      // footer - the single most important layout/responsive reference.
      await shoot(page, `dashboard-${vp.name}`, true);

      // (b) top of the page: app bar + property toolbar + d3 stations map.
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(200);
      await shoot(page, `map-${vp.name}`);

      // (c) the station card grid (wrapping behaviour at each breakpoint).
      await page.locator('.v-card').first().scrollIntoViewIfNeeded();
      await page.evaluate(() => {
        const el = document.querySelector('#stationsMap');
        if (el) window.scrollTo(0, el.getBoundingClientRect().bottom + window.scrollY - 80);
      });
      await page.waitForTimeout(300);
      await shoot(page, `stationcards-${vp.name}`);

      // (d) the graphs section (sticky chip banner + graph card grid).
      await page.evaluate(() => {
        const el = document.querySelector('#weather_graph_temp');
        if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 140);
      });
      await page.waitForTimeout(300);
      await shoot(page, `graphs-${vp.name}`);

      // (e) bottom of the page: last graph row + footer.
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(300);
      await shoot(page, `footer-${vp.name}`);
    });

    test(`captures map property switch at ${vp.name}`, async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => window.localStorage.clear());
      await page.reload();
      await waitForDashboard(page);

      // The v-btn-toggle in the map toolbar: index 1 is rainVolume.
      await page.locator('.v-btn-toggle .v-btn').nth(1).click();
      await page.waitForTimeout(800);
      await page.evaluate(() => window.scrollTo(0, 0));
      await shoot(page, `map-rain-${vp.name}`);
    });

    test(`captures the map station tooltip at ${vp.name}`, async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => window.localStorage.clear());
      await page.reload();
      await waitForDashboard(page);

      await page.evaluate(() => window.scrollTo(0, 0));
      await page.locator('#stationsMap circle.station').first().hover({ force: true });
      await page.waitForTimeout(600);
      await shoot(page, `map-tooltip-${vp.name}`);
    });

    test(`captures the station selector dialog at ${vp.name}`, async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => window.localStorage.clear());
      await page.reload();
      await waitForDashboard(page);

      await page.getByRole('button', { name: 'Selecteer stations' }).click();
      await expect(page.locator('.v-dialog .v-card').first()).toBeVisible();
      await page.waitForTimeout(600);
      await shoot(page, `selector-${vp.name}`);

      // Filtered list (exercises the text field + a shorter list).
      await page.locator('.v-dialog input[type="text"]').fill('Gent');
      await page.waitForTimeout(400);
      await shoot(page, `selector-filtered-${vp.name}`);

      // Empty-result state.
      await page.locator('.v-dialog input[type="text"]').fill('zzzzz');
      await page.waitForTimeout(400);
      await shoot(page, `selector-empty-${vp.name}`);
    });

    test(`captures the empty (no stations selected) state at ${vp.name}`, async ({ page }) => {
      await page.goto('/');
      await page.evaluate(() => window.localStorage.clear());
      await page.reload();
      await waitForDashboard(page);

      await page.getByRole('button', { name: 'Selecteer stations' }).click();
      await expect(page.locator('.v-dialog .v-card').first()).toBeVisible();
      await page.getByRole('button', { name: 'Wis selectie' }).click();
      // Escape rather than the "Sluiten" button: the dialog has a hardcoded
      // min-width of 500px, so at the 375px viewport that button sits outside
      // the visible area and cannot be clicked.
      await page.keyboard.press('Escape');
      await page.waitForTimeout(800);
      await page.evaluate(() => window.scrollTo(0, 0));
      await shoot(page, `empty-${vp.name}`, true);
    });
  });
}
