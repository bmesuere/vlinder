import Vue from 'vue';
import Vuex from 'vuex';

import { Station, Measurement, MeasurementSeries, WeatherPropertyName } from '../app/types';

Vue.use(Vuex);

const API_URL = 'https://mooncake.ugent.be/api';
const STATIONS_PATH = '/stations';
const MEASUREMENTS_PATH = '/measurements';

export default new Vuex.Store({
  state: {
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
  },
  mutations: {
    setStations (state, stations: Station[]) {
      state.stations = stations;
    },
    setLiveMeasurements (state, measurements: Measurement[]) {
      state.liveMeasurements = measurements;
    },
    setHistoricMeasurements (state, measurements: Measurement[][]) {
      state.historicMeasurements = measurements;
    },
    setLoadingHistoricMeasurements (state, loading: boolean) {
      state.loadingHistoricMeasurements = loading;
    },
    setLegendColors (state, legendColors: {}) {
      state.legendColors = legendColors;
    },
    setStationsError (state, error: boolean) {
      state.isStationsError = error;
    },
    setMeasurementsError (state, error: boolean) {
      state.isMeasurementsError = error;
    },
    setHistoricMeasurementsError (state, error: boolean) {
      state.isHistoricMeasurementsError = error;
    },
    stationsLoaded (state) {
      state.stationsLoaded = true;
    },
    addSelectedStation (state, station: Station) {
      if (!state.selectedStations.includes(station)) {
        state.selectedStations.push(station);
      }
    },
    removeSelectedStation (state, station: Station) {
      state.selectedStations.splice(state.selectedStations.indexOf(station), 1);
    }
  },
  actions: {
    fetchStations ({ commit }): Promise<Station[]> {
      return fetch(API_URL + STATIONS_PATH)
        .then(r => {
          if (!r.ok) return Promise.reject(new Error('station fetch failed'));
          return r.json();
        })
        .then((s: Station[]) => {
          commit('setStationsError', false);
          commit('setStations', s);
          commit('stationsLoaded');
          return s;
        })
        .catch(r => {
          commit('setStationsError', true);
          return Promise.reject(r);
        });
    },
    fetchMeasurements ({ commit }): Promise<Measurement[]> {
      return fetch(API_URL + MEASUREMENTS_PATH)
        .then(r => {
          if (!r.ok) return Promise.reject(new Error('measurement fetch failed'));
          return r.json();
        })
        .then((m: Measurement[]) => {
          commit('setMeasurementsError', false);
          commit('setLiveMeasurements', m);
          return m;
        })
        .catch(r => {
          commit('setMeasurementsError', true);
          return Promise.reject(r);
        });
    },
    fetchHistoricMeasurements ({ commit, state }): Promise<Measurement[][]> {
      commit('setLoadingHistoricMeasurements', true);
      return Promise.all(
        state.selectedStations.map(s => {
          return fetch(API_URL + MEASUREMENTS_PATH + '/' + s.id)
            .then((r): Promise<Measurement[]> => r.json());
        })
      ).then(ms => {
        commit('setHistoricMeasurements', ms);
        commit('setLoadingHistoricMeasurements', false);
        return ms;
      });
    },
    selectStationById ({ commit, state }, stationId: string) {
      const station = state.stations.find(s => s.id === stationId);
      if (station) {
        commit('addSelectedStation', station);
      }
    },
    deselectStationById ({ commit, state }, stationId: string) {
      const station = state.stations.find(s => s.id === stationId);
      if (station) {
        commit('removeSelectedStation', station);
      }
    },
    selectStationByName ({ commit, state }, stationName: string) {
      const station = state.stations.find(s => s.name === stationName);
      if (station) {
        commit('addSelectedStation', station);
      }
    },
    toggleStationById ({ commit, state }, stationId: string) {
      const station = state.stations.find(s => s.id === stationId);
      if (station) {
        if (state.selectedStations.includes(station)) {
          commit('removeSelectedStation', station);
        } else {
          commit('addSelectedStation', station);
        }
      }
    },
    setLegendColors ({ commit }, legendColors: {}) {
      commit('setLegendColors', legendColors);
    }
  },
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
  modules: {
  }
});
