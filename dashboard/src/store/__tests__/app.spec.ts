import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useVlinderStore } from '../app';

// Mock Station data
const mockStations = [
  { id: 's1', name: 'station1', city: 'City1' },
  { id: 's2', name: 'station2', city: 'City2' },
  { id: 'zZ6ZeSg11dJ5zp5GrNwNck9A', name: 'default1', city: 'Default City 1' },
  { id: 'Do5lLMfezIdmUCzzsE0IwIbE', name: 'default2', city: 'Default City 2' },
  { id: 'XeIIA97QzN5xxk6AvdzAPquY', name: 'default3', city: 'Default City 3' }
];

describe('Vlinder Store', () => {
  let getItemSpy: any;

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
    const ids = store.selectedStations.map((s: any) => s.id);
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
});
