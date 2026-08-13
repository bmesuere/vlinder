import { test, expect } from '@playwright/test';
import type { Route } from '@playwright/test';

import {
  stationsFixture,
  liveMeasurementsFixture,
  historicMeasurementsFixtureFor,
} from '../src/tests/fixtures';

/**
 * End-to-end smoke test against the real built app (vite preview), running
 * in a real Chromium browser. This is the layer that actually exercises d3
 * rendering (mocked out in the vitest smoke test) and catches anything that
 * only manifests once real Vuetify CSS/components/icons/fonts are loaded
 * from the real production bundle - eg. a Vuetify major version bump that
 * changes a component's DOM/class output enough to break layout, even if it
 * doesn't emit a Vue runtime warning.
 *
 * Network calls to the VLINDER API (see src/store/app.ts) are intercepted
 * and served fixture data matching the real backend response shapes (see
 * src/tests/fixtures.ts). The topology file (public/belgium.topo.json) is
 * NOT intercepted - it's served as-is by vite preview from the real build,
 * so the map draws with the real, valid Belgium topology.
 */

function fulfillJson(route: Route, body: unknown) {
  return route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

test.beforeEach(async ({ page }) => {
  // Intercept every call the store makes against the API (fetchStations,
  // fetchMeasurements, and the per-station fetchHistoricMeasurements calls).
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

  // Stub the Google gtag loader with a harmless no-op script instead of
  // letting it hit the real network (keeps the test deterministic/offline
  // and avoids an unhandled-promise-rejection console error if the real
  // request fails in a sandboxed CI runner).
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

  // The app bar and its title are part of the real Vuetify chrome.
  await expect(page.getByText('VLINDER', { exact: true }).first()).toBeVisible();

  // Station data from the fixtures is visible - the default-selected
  // stations (see src/store/app.ts) match the ids used in the fixtures.
  await expect(page.getByText(stationsFixture[0].city, { exact: false }).first()).toBeVisible();
  await expect(page.getByText(stationsFixture[0].given_name, { exact: false }).first()).toBeVisible();

  // Wait for the historic graphs to actually draw data (D3Graph redraws its
  // line paths once historicMeasurements arrives), not just the shell.
  await expect(page.locator('#weather_graph_temp path')).not.toHaveCount(0);

  // Real d3-rendered SVGs are present: the stations map and at least one
  // weather graph.
  const svgCount = await page.locator('svg').count();
  expect(svgCount).toBeGreaterThan(1);

  expect(await page.locator('#stationsMap svg').count()).toBeGreaterThan(0);
  expect(await page.locator('#weather_graph_temp svg').count()).toBeGreaterThan(0);

  // Station markers were actually drawn on the map (real D3StationsMap,
  // real belgium.topo.json, real fixture coordinates).
  await expect(page.locator('#stationsMap circle.station')).not.toHaveCount(0);

  expect(consoleErrors, `Unexpected console errors:\n${consoleErrors.join('\n')}`).toEqual([]);
  expect(pageErrors, `Unexpected page errors:\n${pageErrors.join('\n')}`).toEqual([]);
});
