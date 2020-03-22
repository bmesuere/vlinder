import Vue from 'vue'
import Vuex from 'vuex'
import vlinderService from '../services/vlinderService'

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        stations: [],
        vlinderData: [],
        focusedVlinderData: []
    },
    mutations: {
        setStations(state, stations) {
            state.stations = stations
        },
        setVlinderData(state, vlinderData) {
            state.vlinderData = vlinderData;
            state.focusedVlinderData = vlinderData
        },
        setFocusedVlinderData(state, focusedVlinderData) {
            state.focusedVlinderData = focusedVlinderData
        }
    },
    actions: {
        loadStations({commit}) {
            vlinderService.getStations(response => {
                commit('setStations', response.data)
            })
        },
        loadVlinderData({commit}, id, start, end) {
            vlinderService.getVlinderData(id, start, end, response => {
                commit('setVlinderData', response.data)
            })
        },
        updateFocusedVlinderdata({commit}, data) {
            commit('setFocusedVlinderData', data)
        }
    },
    getters: {
        stations: state => {
            return state.stations
        },
        vlinderData: state => {
            return state.vlinderData
        },
        focusedVlinderData: state => {
            return state.focusedVlinderData
        }
    }
})