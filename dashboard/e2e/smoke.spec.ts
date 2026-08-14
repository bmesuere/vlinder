import { test, expect } from '@playwright/test';
import type { Route } from '@playwright/test';

import {
  stationsFixture,
  liveMeasurementsFixture,
  historicMeasurementsFixtureFor,
} from '../src/tests/fixtures';

/**
 * Smoke test against the real production build in Chromium: real Vuetify
 * CSS/components and real d3 rendering, with API calls served from fixtures.
 */

function fulfillJson(route: Route, body: unknown) {
  return route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

test.beforeEach(async ({ page }) => {
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

  // stub gtag so the run stays offline and deterministic
  await page.route('https://www.googletagmanager.com/gtag/js**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: 'window.dataLayer = window.dataLayer || []; function gtag(){ dataLayer.push(arguments); } window.gtag = gtag;',
    })
  );
});

test('dashboard loads, renders station data and charts, with no console/page errors', async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    pageErrors.push(err.message);
  });

  await page.goto('/');

  await expect(page.getByText('VLINDER', { exact: true }).first()).toBeVisible();

  // station data from the fixtures is visible
  await expect(page.getByText(stationsFixture[0].city, { exact: false }).first()).toBeVisible();
  await expect(page.getByText(stationsFixture[0].given_name, { exact: false }).first()).toBeVisible();

  // wait for the graphs to draw data, not just the shell
  await expect(page.locator('#weather_graph_temp path')).not.toHaveCount(0);

  const svgCount = await page.locator('svg').count();
  expect(svgCount).toBeGreaterThan(1);

  expect(await page.locator('#stationsMap svg').count()).toBeGreaterThan(0);
  expect(await page.locator('#weather_graph_temp svg').count()).toBeGreaterThan(0);

  // station markers were actually drawn on the map
  await expect(page.locator('#stationsMap circle.station')).not.toHaveCount(0);

  expect(consoleErrors, `Unexpected console errors:\n${consoleErrors.join('\n')}`).toEqual([]);
  expect(pageErrors, `Unexpected page errors:\n${pageErrors.join('\n')}`).toEqual([]);
});
