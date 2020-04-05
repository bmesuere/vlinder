export default {
    created () {
    },
    computed: {
        stations() {
            return this.$store.getters.stations
        },
        vlinderData() {
            return this.$store.getters.vlinderData
        },
        focusedVlinderData() {
            return this.$store.getters.focusedVlinderData
        },
        latestVlinderData() {
            return this.$store.getters.latestVlinderData
        }
    },
    methods: {
        fetchStationsData() {
            this.$store.dispatch('loadStations')
        },
        fetchVlinderData(id, start, end) {
            this.$store.dispatch('loadVlinderData', id, start, end)
        },
        setFocusedVlinderData(data) {
            this.$store.dispatch('updateFocusedVlinderdata', data)
        }
    }
}