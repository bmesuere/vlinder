import { Station, Measurement, MeasurementSeries, WeatherPropertyName } from '../app/types';
import { defineStore } from 'pinia';

const API_URL = 'https://mooncake.ugent.be/api';
const STATIONS_PATH = '/stations';
const MEASUREMENTS_PATH = '/measurements';

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
    fetchStations (): Promise<Station[]> {
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
    fetchMeasurements (): Promise<Measurement[]> {
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
    fetchHistoricMeasurements (): Promise<Measurement[][]> {
      this.loadingHistoricMeasurements = true;
      return Promise.all(
        this.selectedStations.map(s => {
          return fetch(API_URL + MEASUREMENTS_PATH + '/' + s.id)
            .then((r): Promise<Measurement[]> => r.json());
        })
      ).then(ms => {
        this.historicMeasurements = ms;
        this.loadingHistoricMeasurements = false;
        return ms;
      });
    },
    selectStationById (stationId: string) {
      const station = this.stations.find(s => s.id === stationId);
      if (station) {
        this.addSelectedStation(station);
      }
    },
    deselectStationById (stationId: string) {
      const station = this.stations.find(s => s.id === stationId);
      if (station) {
        this.removeSelectedStation(station);
      }
    },
    selectStationByName (stationName: string) {
      const station = this.stations.find(s => s.name === stationName);
      if (station) {
        this.addSelectedStation(station);
      }
    },
    toggleStationById (stationId: string) {
      const station = this.stations.find(s => s.id === stationId);
      if (station) {
        if (this.selectedStations.includes(station)) {
          this.removeSelectedStation(station);
        } else {
          this.addSelectedStation(station);
        }
      }
    },
    setLegendColors (legendColors: {}) {
      this.legendColors = legendColors;
    },
    addSelectedStation (station: Station) {
      if (!this.selectedStations.includes(station)) {
        this.selectedStations.push(station);
      }
    },
    removeSelectedStation (station: Station) {
      this.selectedStations.splice(this.selectedStations.indexOf(station), 1);
    }
  }
}
);
