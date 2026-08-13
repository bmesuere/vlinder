/**
 * Warning-strict Vuetify smoke test.
 *
 * Unlike the per-component unit tests (which build a minimal local Vuetify
 * instance with an explicit component/directive list), this test mounts the
 * real App using the *real* Vuetify plugin instance from
 * src/plugins/vuetify.ts and the *real* router config from src/router, and
 * escalates every Vue runtime warning to a thrown error.
 *
 * That escalation is the whole point: an unknown-component warning (eg. a
 * renamed/removed Vuetify component after a major version bump) or an
 * invalid-prop-type warning would otherwise just print to the console and
 * the test would still pass. Here it fails the test instead, which is
 * exactly the kind of breakage a Vuetify 3->4 upgrade can introduce that
 * store/composable/d3-mocked component tests and vue-tsc cannot catch
 * (vue-tsc doesn't type-check template tag resolution against installed
 * Vuetify components, and it can't see runtime prop-shape mismatches).
 *
 * D3 rendering itself is intentionally still mocked out (as in the other
 * component tests) - the goal here is Vuetify component resolution, not
 * exercising d3-in-jsdom.
 */
import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { createPinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';

import App from '../App.vue';
import vuetify from '../plugins/vuetify';
import DefaultLayout from '../layouts/default/Default.vue';
import Dashboard from '../views/Dashboard.vue';

import {
  stationsFixture,
  liveMeasurementsFixture,
  historicMeasurementsFixtureFor,
  topologyFixture,
} from '../tests/fixtures';

// Mock vue-gtag-next: main.ts installs it as a real plugin via app.use(),
// but we mount App directly without going through main.ts, so useGtag()
// would otherwise throw for lack of the injected gtag instance.
vi.mock('vue-gtag-next', () => ({
  useGtag: () => ({ event: vi.fn() }),
}));

// Mock the D3 wrapper classes, same as the existing per-component specs.
// These touch the DOM directly with d3 selections in ways jsdom doesn't
// need to fully support for a Vuetify-resolution smoke test.
vi.mock('../app/d3/D3StationsMap', () => ({
  D3StationsMap: class {
    init = vi.fn();
    updateProperty = vi.fn();
    updateSelectedStations = vi.fn();
    updateMeasurements = vi.fn();
  },
}));

vi.mock('../app/d3/D3Graph', () => ({
  D3Graph: class {
    init = vi.fn();
    updateData = vi.fn();
    updateTooltip = vi.fn();
    getLegendColors = vi.fn().mockReturnValue({});
  },
}));

vi.mock('../app/d3/D3LandUse', () => ({
  D3LandUse: class {
    init = vi.fn();
  },
}));

function jsonResponse(body: unknown, ok = true) {
  return Promise.resolve({
    ok,
    json: () => Promise.resolve(body),
  } as Response);
}

// Realistic network mock: routes on the same URL shapes fetched by
// src/store/app.ts and StationsMap.vue, matching the real API/static asset.
function installFetchMock() {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.includes('belgium.topo.json')) {
        return jsonResponse(topologyFixture);
      }

      const historicMatch = url.match(/\/measurements\/([^/]+)$/);
      if (historicMatch && !url.endsWith('/measurements')) {
        return jsonResponse(historicMeasurementsFixtureFor(historicMatch[1]));
      }

      if (url.endsWith('/measurements')) {
        return jsonResponse(liveMeasurementsFixture);
      }

      if (url.endsWith('/stations')) {
        return jsonResponse(stationsFixture);
      }

      return jsonResponse({}, false);
    })
  );
}

describe('App smoke test (real Vuetify + real router + warning-strict)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('renders the dashboard with real Vuetify components and no Vue warnings', async () => {
    installFetchMock();

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/',
          component: DefaultLayout,
          children: [
            {
              path: '',
              name: 'Home',
              component: Dashboard,
              props: () => ({ urlStations: [] }),
            },
          ],
        },
      ],
    });

    const pinia = createPinia();

    const warnings: string[] = [];

    const wrapper = mount(App, {
      global: {
        plugins: [vuetify, pinia, router],
        config: {
          // Escalate Vue runtime warnings (unknown components, invalid prop
          // types/values, missing required props, ...) to thrown errors so
          // this test fails loudly instead of just printing to console.
          warnHandler: (msg, _instance, trace) => {
            warnings.push(msg);
            throw new Error(`Vue warning escalated to failure: ${msg}\n${trace}`);
          },
        },
      },
    });

    await router.isReady();
    // Allow the lazily-imported layout/view chain and the store's async
    // initialize()/fetchMeasurements()/fetchHistoricMeasurements() chain
    // (which depends on watch(selectedStations) firing after initialize
    // resolves) to settle.
    await flushPromises();
    await flushPromises();
    await flushPromises();

    expect(warnings).toEqual([]);

    // Something meaningful actually rendered, not just "didn't crash":
    // station data from the fixtures should be visible on the page.
    const text = wrapper.text();
    expect(text).toContain(stationsFixture[0].city);
    expect(text).toContain(stationsFixture[0].given_name);
    expect(text).toContain(stationsFixture[1].city);

    // No error banner shown - fetches succeeded.
    expect(wrapper.find('.v-alert').exists()).toBe(false);

    // Real Vuetify chrome rendered (app bar, toolbar title).
    expect(text).toContain('VLINDER');
    expect(wrapper.find('.v-app-bar').exists()).toBe(true);

    // Station cards rendered for the default-selected stations.
    expect(wrapper.findAll('.v-card').length).toBeGreaterThan(0);

    wrapper.unmount();
  });
});
