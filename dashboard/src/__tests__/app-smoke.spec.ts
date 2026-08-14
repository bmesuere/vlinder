/**
 * Mounts the real App with the real Vuetify plugin and router, escalating
 * every Vue runtime warning (unknown component, invalid prop, ...) to a
 * thrown error - the failure mode of a Vuetify major bump that vue-tsc and
 * the d3-mocked component tests cannot see.
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

// App is mounted without main.ts, which normally installs vue-gtag
vi.mock('vue-gtag-next', () => ({
  useGtag: () => ({ event: vi.fn() }),
}));

// mock the d3 wrappers, as in the per-component specs
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

// routes on the URL shapes fetched by the store and StationsMap.vue
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
          warnHandler: (msg, _instance, trace) => {
            warnings.push(msg);
            throw new Error(`Vue warning escalated to failure: ${msg}\n${trace}`);
          },
        },
      },
    });

    await router.isReady();
    // let the lazy view chain and the store's async init settle
    await flushPromises();
    await flushPromises();
    await flushPromises();

    expect(warnings).toEqual([]);

    // station data from the fixtures actually rendered
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
