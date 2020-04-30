import Vue from 'vue'
import Vuex from 'vuex'
import vlinderService from '../services/vlinderService'

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        stations: [],
        selectedStations: [],
        vlinderData: [],
        focusedVlinderData: [],
        latestVlinderData: []
    },
    mutations: {
        setStations(state, stations) {
            state.stations = stations
        },
        setSelectedStations(state, selectedStations) {
            state.selectedStations = selectedStations
        },
        setVlinderData(state, vlinderData) {
            state.vlinderData = vlinderData;
            state.focusedVlinderData = vlinderData
        },
        addVlinderData(state, vlinderData) {
            // state.vlinderData.push(...vlinderData);
            state.focusedVlinderData.push(...[vlinderData]);
        },
        setFocusedVlinderData(state, focusedVlinderData) {
            state.focusedVlinderData = focusedVlinderData
        },
        setLatestVlinderData(state, latestVlinderData) {
            state.latestVlinderData = latestVlinderData
        }
    },
    actions: {
        loadStations({commit}) {
            vlinderService.getStations().then(response => {
                commit('setStations', response.data)
            })
        },
        loadVlinderData({commit}, object) {
            commit('setVlinderData', []);
            object.ids.forEach(id => {
                vlinderService.getVlinderData(id, object.start, object.end).then(response => {
                    commit('addVlinderData', response.data)
                })
            })
        },
        updateFocusedVlinderdata({commit}, data) {
            commit('setFocusedVlinderData', data)
        },
        updateSelectedStations({commit}, data) {
            commit('setSelectedStations', data)
        },
        fetchLatestVlinderData({commit}) {
            vlinderService.getLatestVlinderData().then(response => {
                commit('setLatestVlinderData', response.data)
            })
        }
    },
    getters: {
        stations: state => {
            return state.stations
        },
        selectedStations: state => {
            return state.selectedStations
        },
        vlinderData: state => {
            return state.vlinderData
        },
        focusedVlinderData: state => {
            return state.focusedVlinderData
        },
        latestVlinderData: state => {
            return state.latestVlinderData
        }
    }
})