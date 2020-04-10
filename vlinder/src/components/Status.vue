<template>
    <div>
        <b-container style="height: 100%">
            <b-row align-h="center" style="padding: 5em">
                <b-col>
                    <multiselect v-model="selectedStations" label="text" track-by="text" :clear-on-select="false"
                                 :multiple="true" :options="options" :searchable="true" :close-on-select="false"
                                 :show-labels="false" placeholder="No stations selected"/>
                </b-col>
            </b-row>
            <b-row align-h="center">
                <timeline v-bind:selectedStations="selectedStations" style="padding: 5px"/>
            </b-row>
        </b-container>
    </div>
</template>

<script>
    import Multiselect from "vue-multiselect";
    import Timeline from "./Timeline";

    export default {
        name: "Status",
        components: {
            Multiselect,
            Timeline
        },
        created() {
            this.stationsToOptions();
        },
        data() {
            return {
                selectedStations: [],
                options: []
            }
        },
        computed: {
            stations() {
                return this.$store.getters.stations;
            }
        },
        watch: {
            stations() {
                this.stationsToOptions();
            }
        },
        methods: {
            stationsToOptions() {
                let self = this;
                this.stations.forEach(station => {
                    self.options.push({value: station['id'], text: station['name']})
                })
            }
        }
    }
</script>

<style scoped>

</style>