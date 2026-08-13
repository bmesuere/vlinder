import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useVlinderStore } from '../app';
import type { Station } from '../../app/types';

// Mock Station data
const mockStations = [
  { id: 's1', name: 'station1', city: 'City1' },
  { id: 's2', name: 'station2', city: 'City2' },
  { id: 'zZ6ZeSg11dJ5zp5GrNwNck9A', name: 'default1', city: 'Default City 1' },
  { id: 'Do5lLMfezIdmUCzzsE0IwIbE', name: 'default2', city: 'Default City 2' },
  { id: 'XeIIA97QzN5xxk6AvdzAPquY', name: 'default3', city: 'Default City 3' }
];

describe('Vlinder Store', () => {
  let getItemSpy: MockInstance;

  beforeEach(() => {
    setActivePinia(createPinia());
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockStations,
    });
    // Mock local storage using Storage.prototype
    getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initialize fetches stations', async () => {
    const store = useVlinderStore();
    await store.initialize([]);
    expect(store.stations).toEqual(mockStations);
    expect(store.stationsLoaded).toBe(true);
  });

  it('initialize selects stations from URL', async () => {
    const store = useVlinderStore();
    await store.initialize(['station1']);

    expect(store.selectedStations).toHaveLength(1);
    expect(store.selectedStations[0].id).toBe('s1');
  });

  it('initialize selects stations from LocalStorage if no URL args', async () => {
    getItemSpy.mockReturnValue(JSON.stringify(['s2']));
    const store = useVlinderStore();

    await store.initialize([]);

    expect(getItemSpy).toHaveBeenCalledWith('selectedStations');
    expect(store.selectedStations).toHaveLength(1);
    expect(store.selectedStations[0].id).toBe('s2');
  });

  it('initialize selects default stations if no URL and no LocalStorage', async () => {
    const store = useVlinderStore();

    await store.initialize([]);

    expect(store.selectedStations).toHaveLength(3);
    const ids = store.selectedStations.map((s) => s.id);
    expect(ids).toContain('zZ6ZeSg11dJ5zp5GrNwNck9A');
    expect(ids).toContain('Do5lLMfezIdmUCzzsE0IwIbE');
    expect(ids).toContain('XeIIA97QzN5xxk6AvdzAPquY');
  });

  it('initialize combines URL stations (priority) over LocalStorage', async () => {
    getItemSpy.mockReturnValue(JSON.stringify(['s2']));
    const store = useVlinderStore();

    await store.initialize(['station1']);

    expect(store.selectedStations).toHaveLength(1);
    expect(store.selectedStations[0].id).toBe('s1');
  });

  it('initialize propagates error when fetchStations fails', async () => {
    const error = new Error('Network error');
    global.fetch = vi.fn().mockRejectedValue(error);
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const store = useVlinderStore();

    await expect(store.initialize([])).rejects.toThrow(error);
    expect(store.isStationsError).toBe(true);

    consoleErrorSpy.mockRestore();
  });

  describe('fetchHistoricMeasurements', () => {
    const station1: Station = {
      id: 's1',
      name: 'station1',
      city: 'City1',
      coordinates: { latitude: 0, longitude: 0 },
      given_name: 'Station 1',
      measurements: '',
      school: '',
      landUse: []
    };

    it('fetches and stores historic measurements on success', async () => {
      const measurements = [{ id: 's1', time: '2024-01-01T00:00:00Z', temp: 12 }];
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => measurements,
      });
      const store = useVlinderStore();
      store.selectedStations = [station1];

      const result = await store.fetchHistoricMeasurements();

      expect(result).toEqual([measurements]);
      expect(store.historicMeasurements).toEqual([measurements]);
      expect(store.loadingHistoricMeasurements).toBe(false);
      expect(store.isHistoricMeasurementsError).toBe(false);
    });

    it('sets the error flag and resets loading when the fetch fails, without throwing', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      global.fetch = vi.fn().mockResolvedValue({ ok: false });
      const store = useVlinderStore();
      store.selectedStations = [station1];

      await expect(store.fetchHistoricMeasurements()).resolves.not.toThrow();

      expect(store.isHistoricMeasurementsError).toBe(true);
      expect(store.loadingHistoricMeasurements).toBe(false);

      consoleErrorSpy.mockRestore();
    });

    it('resets the error flag on a subsequent successful fetch', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const store = useVlinderStore();
      store.selectedStations = [station1];

      global.fetch = vi.fn().mockResolvedValue({ ok: false });
      await store.fetchHistoricMeasurements();
      expect(store.isHistoricMeasurementsError).toBe(true);

      const measurements = [{ id: 's1', time: '2024-01-01T00:00:00Z', temp: 12 }];
      global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => measurements });
      await store.fetchHistoricMeasurements();

      expect(store.isHistoricMeasurementsError).toBe(false);
      expect(store.historicMeasurements).toEqual([measurements]);

      consoleErrorSpy.mockRestore();
    });

    it('ignores a stale response overtaken by a newer call', async () => {
      const store = useVlinderStore();
      store.selectedStations = [station1];

      let resolveStale: (value: unknown) => void = () => {};
      let resolveFresh: (value: unknown) => void = () => {};
      const staleResponse = new Promise((resolve) => { resolveStale = resolve; });
      const freshResponse = new Promise((resolve) => { resolveFresh = resolve; });

      global.fetch = vi.fn()
        .mockImplementationOnce(() => staleResponse)
        .mockImplementationOnce(() => freshResponse);

      // Kick off two overlapping calls (eg. a station toggle firing while a poll is in flight).
      const staleCall = store.fetchHistoricMeasurements();
      const freshCall = store.fetchHistoricMeasurements();

      const staleData = [{ id: 's1', time: '2024-01-01T00:00:00Z', temp: 1 }];
      const freshData = [{ id: 's1', time: '2024-01-01T00:01:00Z', temp: 2 }];

      // The newer call's response arrives first...
      resolveFresh({ ok: true, json: async () => freshData });
      await freshCall;
      expect(store.historicMeasurements).toEqual([freshData]);

      // ...and the older call's response arrives later, but must not overwrite the fresher data.
      resolveStale({ ok: true, json: async () => staleData });
      await staleCall;
      expect(store.historicMeasurements).toEqual([freshData]);
    });
  });
});
