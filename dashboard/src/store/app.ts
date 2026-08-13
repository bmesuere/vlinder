import { Station, Measurement, MeasurementSeries, WeatherPropertyName } from '../app/types';
import { defineStore } from 'pinia';

const API_URL = import.meta.env.VITE_API_URL ?? 'https://mooncake.ugent.be/api';
const STATIONS_PATH = '/stations';
const MEASUREMENTS_PATH = '/measurements';

// Incrementing token used to guard against overlapping fetchHistoricMeasurements calls
// (eg. a station toggle firing while a poll is still in flight) overwriting fresher data
// with a stale response.
let historicMeasurementsRequestId = 0;

export const useVlinderStore = defineStore('vlinder', {
  state: () => ({
    stationsLoaded: false,
    stations: Array<Station>(),
    selectedStations: Array<Station>(),
    liveMeasurements: Array<Measurement>(),
    loadingHistoricMeasurements: true,
    isStationsError: false,
    isMeasurementsError: false,
    isHistoricMeasurementsError: false,
    legendColors: Object(),
    historicMeasurements: Array<Array<Measurement>>()
  }),
  getters: {
    historicData: (state) => (prop: WeatherPropertyName) => {
      const data: MeasurementSeries = { property: prop, series: [], timestamps: [] };
      if (state.historicMeasurements.length > 0) {
        data.timestamps = state.historicMeasurements[0].map(m => m.time);
        state.historicMeasurements.forEach(ms => {
          data.series.push({
            stationId: ms[0].id,
            values: ms.map(m => m[prop])
          });
        });
      }
      return data;
    }
  },
  actions: {
    fetchStations(): Promise<Station[]> {
      return fetch(API_URL + STATIONS_PATH)
        .then(r => {
          if (!r.ok) return Promise.reject(new Error('station fetch failed'));
          return r.json();
        })
        .then((s: Station[]) => {
          this.isStationsError = false;
          this.stations = s;
          this.stationsLoaded = true;
          return s;
        })
        .catch(r => {
          this.isStationsError = true;
          return Promise.reject(r);
        });
    },
    fetchMeasurements(): Promise<Measurement[]> {
      return fetch(API_URL + MEASUREMENTS_PATH)
        .then(r => {
          if (!r.ok) return Promise.reject(new Error('measurement fetch failed'));
          return r.json();
        })
        .then((m: Measurement[]) => {
          this.isMeasurementsError = false;
          this.liveMeasurements = m;
          return m;
        })
        .catch(r => {
          this.isMeasurementsError = true;
          return Promise.reject(r);
        });
    },
    async initialize(urlStations: string[]) {
      let stationsFromStorage: string[] = [];
      try {
        stationsFromStorage = JSON.parse(window.localStorage.getItem('selectedStations') || '[]') as string[];
      } catch (e) {
        console.warn('Failed to access localStorage', e);
      }

      try {
        await this.fetchStations();

        let stationsSelected = false;
        if (urlStations.length > 0) {
          urlStations.forEach(s => {
            const wasAdded = this.selectStationByName(s);
            stationsSelected ||= wasAdded;
          });
        }

        if (!stationsSelected && stationsFromStorage.length > 0) {
          stationsFromStorage.forEach(s => {
            const wasAdded = this.selectStationById(s);
            stationsSelected ||= wasAdded;
          });
        }

        if (!stationsSelected) {
          this.selectStationById('zZ6ZeSg11dJ5zp5GrNwNck9A');
          this.selectStationById('Do5lLMfezIdmUCzzsE0IwIbE');
          this.selectStationById('XeIIA97QzN5xxk6AvdzAPquY');
        }
      } catch (error) {
        console.error('Failed to initialize stations', error);
        throw error;
      }
    },
    async fetchHistoricMeasurements(): Promise<Measurement[][]> {
      const requestId = ++historicMeasurementsRequestId;
      this.loadingHistoricMeasurements = true;
      try {
        const ms = await Promise.all(
          this.selectedStations.map(async (s): Promise<Measurement[]> => {
            const r = await fetch(API_URL + MEASUREMENTS_PATH + '/' + s.id);
            if (!r.ok) throw new Error('historic measurement fetch failed');
            return r.json();
          })
        );

        // Ignore this result if a newer fetchHistoricMeasurements call has started since.
        if (requestId === historicMeasurementsRequestId) {
          this.historicMeasurements = ms;
          this.isHistoricMeasurementsError = false;
        }
        return ms;
      } catch (error) {
        if (requestId === historicMeasurementsRequestId) {
          this.isHistoricMeasurementsError = true;
        }
        console.error('Failed to fetch historic measurements', error);
        return this.historicMeasurements;
      } finally {
        if (requestId === historicMeasurementsRequestId) {
          this.loadingHistoricMeasurements = false;
        }
      }
    },
    selectStationById(stationId: string) {
      const station = this.stations.find(s => s.id === stationId);
      if (station) {
        this.addSelectedStation(station);
        return true;
      }
      return false;
    },
    deselectStationById(stationId: string) {
      const station = this.stations.find(s => s.id === stationId);
      if (station) {
        this.removeSelectedStation(station);
      }
    },
    selectStationByName(stationName: string) {
      const station = this.stations.find(s => s.name === stationName);
      if (station) {
        this.addSelectedStation(station);
        return true;
      }
      return false;
    },
    toggleStationById(stationId: string) {
      const station = this.stations.find(s => s.id === stationId);
      if (station) {
        if (this.selectedStations.includes(station)) {
          this.removeSelectedStation(station);
        } else {
          this.addSelectedStation(station);
        }
      }
    },
    setLegendColors(legendColors: Record<string, unknown>) {
      this.legendColors = legendColors;
    },
    addSelectedStation(station: Station) {
      if (!this.selectedStations.includes(station)) {
        this.selectedStations.push(station);
      }
    },
    removeSelectedStation(station: Station) {
      this.selectedStations.splice(this.selectedStations.indexOf(station), 1);
    }
  }
}
);
