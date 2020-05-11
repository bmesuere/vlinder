export default {
    computed: {
        stations() {
            return this.$store.getters.stations
        },
        selectedStations() {
            return this.$store.getters.selectedStations
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
        },
        setSelectedStations(data) {
            this.$store.dispatch('updateSelectedStations', data)
        }
    }, props: {
            "colors": {
                type: Array,
                default: () => ['#5DBE55', '#926DA5', '#2580a7', '#e2d13a', '#be662b']
            },
    }
}