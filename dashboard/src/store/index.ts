import Vue from 'vue';
import Vuex from 'vuex';

import { Station, Measurement } from '../app/types';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    stationsLoaded: false,
    stations: Array<Station>(),
    selectedStations: Array<Station>(),
    liveMeasurements: Array<Measurement>()
  },
  mutations: {
    setStations (state, stations: Station[]) {
      state.stations = stations;
    },
    setLiveMeasurements (state, measurements: Measurement[]) {
      state.liveMeasurements = measurements;
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
      return fetch('https://mooncake.ugent.be/api/stations')
        .then(r => r.json())
        .then((s: Station[]) => {
          commit('setStations', s);
          commit('stationsLoaded');
          return s;
        });
    },
    fetchMeasurements ({ commit }): Promise<Measurement[]> {
      return fetch('https://mooncake.ugent.be/api/measurements')
        .then(r => r.json())
        .then((m: Measurement[]) => {
          commit('setLiveMeasurements', m);
          return m;
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
    toggleStationById ({ commit, state }, stationId: string) {
      const station = state.stations.find(s => s.id === stationId);
      if (station) {
        if (state.selectedStations.includes(station)) {
          commit('removeSelectedStation', station);
        } else {
          commit('addSelectedStation', station);
        }
      }
    }
  },
  modules: {
  }
});
