/**
 * Shared fixture data for UI smoke tests.
 *
 * Shapes mirror the real backend responses (see api/app.rb `read_stations`
 * and `process`) rather than the simplified fixtures used in the narrower
 * per-component unit tests. Imported by both the vitest smoke test
 * (src/__tests__/app-smoke.spec.ts) and the Playwright e2e smoke test
 * (e2e/smoke.spec.ts) so both layers exercise the same data.
 */
import type { Station, Measurement } from '../app/types';

// The three station ids hardcoded as defaults in src/store/app.ts. These are
// real, live station ids (vlinder02, and two others) so reusing them here
// means the app's default-selection logic actually finds a match, exactly
// like it would against the real API.
export const DEFAULT_STATION_IDS = [
  'zZ6ZeSg11dJ5zp5GrNwNck9A',
  'Do5lLMfezIdmUCzzsE0IwIbE',
  'XeIIA97QzN5xxk6AvdzAPquY',
] as const;

// A station whose name does not start with "vlinder" (mirrors the real
// MOCCA stations returned by the API), to exercise the filter in
// D3StationsMap.ts that only plots "vlinder*" stations on the map.
const MOCCA_STATION_ID = 'bas0provinciehuis000000';

function landUse(waterBias: number) {
  return [20, 50, 100, 250, 500].map((distance, i) => {
    const water = Math.max(0, waterBias - i * 0.02);
    const paved = 0.55 - i * 0.03;
    const green = 1 - water - paved;
    return { distance, usage: { water, paved, green } };
  });
}

export const stationsFixture: Station[] = [
  {
    id: DEFAULT_STATION_IDS[0],
    name: 'vlinder02',
    city: 'Gent',
    given_name: 'Sterre',
    school: 'UGent',
    coordinates: { latitude: 51.0335, longitude: 3.7115 },
    measurements: `https://mooncake.ugent.be/api/measurements/${DEFAULT_STATION_IDS[0]}`,
    landUse: landUse(0.05),
  },
  {
    id: DEFAULT_STATION_IDS[1],
    name: 'vlinder07',
    city: 'Brussel',
    given_name: 'Grote Markt',
    school: 'VUB',
    coordinates: { latitude: 50.8467, longitude: 4.3525 },
    measurements: `https://mooncake.ugent.be/api/measurements/${DEFAULT_STATION_IDS[1]}`,
    landUse: landUse(0.02),
  },
  {
    id: DEFAULT_STATION_IDS[2],
    name: 'vlinder13',
    city: 'Antwerpen',
    given_name: 'Groenplaats',
    school: 'UAntwerpen',
    coordinates: { latitude: 51.2194, longitude: 4.4025 },
    measurements: `https://mooncake.ugent.be/api/measurements/${DEFAULT_STATION_IDS[2]}`,
    landUse: landUse(0.15),
  },
  {
    id: MOCCA_STATION_ID,
    name: 'bas/provinciehuis',
    city: 'Gent',
    given_name: 'MOCCA Provinciehuis',
    school: 'UGent',
    coordinates: { latitude: 51.0538, longitude: 3.7278 },
    measurements: `https://mooncake.ugent.be/api/measurements/${MOCCA_STATION_ID}`,
    landUse: landUse(0.01),
  },
];

// Stations for which the API reports a real WBGT sensor reading, per
// GraphCard.vue's hardcoded allowlist.
const WBGT_STATION_NAMES = ['vlinder02', 'vlinder73', 'vlinder74', 'vlinder75', 'vlinder76'];

function formatApiTime(date: Date): string {
  // Mirrors the backend's strftime('%a, %d %b %Y %H:%M:%S %Z') format, e.g.
  // "Wed, 12 Aug 2026 18:50:00 UTC" (RFC-2822-ish, not ISO8601).
  return date.toUTCString().replace('GMT', 'UTC');
}

function buildMeasurement(station: Station, time: Date, seed: number): Measurement {
  const hasWbgt = WBGT_STATION_NAMES.includes(station.name);
  return {
    id: station.id,
    time: formatApiTime(time),
    temp: Math.round((18 + seed * 3 + Math.sin(seed / 3) * 2) * 100) / 100,
    humidity: Math.round((55 + seed * 2) * 100) / 100,
    pressure: 1013 + seed,
    rainIntensity: 0,
    rainVolume: 0,
    windDirection: 180,
    windGust: Math.round((4 + seed * 0.5) * 100) / 100,
    windSpeed: Math.round((2 + seed * 0.3) * 100) / 100,
    wbgt: hasWbgt ? Math.round((17 + seed * 2) * 100) / 100 : null,
    status: 'Ok',
    station: `https://mooncake.ugent.be/api/stations/${station.id}`,
    measurements: `https://mooncake.ugent.be/api/measurements/${station.id}`,
  };
}

const NOW = new Date('2026-08-13T12:00:00.000Z');

// One live reading per station, as returned by GET /measurements.
export const liveMeasurementsFixture: Measurement[] = stationsFixture.map((s, i) =>
  buildMeasurement(s, NOW, i)
);

// A short (24-point) historic series per station, as returned by
// GET /measurements/:stationId.
export function historicMeasurementsFixtureFor(stationId: string): Measurement[] {
  const station = stationsFixture.find(s => s.id === stationId) ?? stationsFixture[0];
  const index = stationsFixture.indexOf(station);
  return Array.from({ length: 24 }, (_, hoursAgo) => {
    const time = new Date(NOW.getTime() - (23 - hoursAgo) * 60 * 60 * 1000);
    return buildMeasurement(station, time, index + hoursAgo / 24);
  });
}

// Minimal-but-valid topology fixture matching the shape D3StationsMap expects
// from public/belgium.topo.json (topojson with municipalities + provinces
// object collections). Empty geometry collections are enough to exercise the
// fetch/parse path without needing the full (large) real file.
export const topologyFixture = {
  type: 'Topology',
  objects: {
    municipalities: { type: 'GeometryCollection', geometries: [] },
    provinces: { type: 'GeometryCollection', geometries: [] },
  },
  arcs: [],
};
