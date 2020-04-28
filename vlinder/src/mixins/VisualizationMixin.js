export default {
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
        fetchVlinderData(id, start, end) {
            this.$store.dispatch('loadVlinderData', id, start, end)
        },
        setFocusedVlinderData(data) {
            this.$store.dispatch('updateFocusedVlinderdata', data)
        }
    }
}