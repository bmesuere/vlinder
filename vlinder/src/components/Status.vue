<template>
    <div>
        <b-container style="height: 100%">
            <b-row align-h="center" align-v="center" style="padding: 1em">
                <b-col>
                    <multiselect v-model="selectedStations" label="text" track-by="text" :clear-on-select="false"
                                 :multiple="true" :options="options" :searchable="true" :close-on-select="false"
                                 :show-labels="false" placeholder="No stations selected"/>
                </b-col>
                <b-col>
                    <b-form-datepickerorigin v-model="selectedDate" value-as-date/>
                </b-col>
            </b-row>
            <b-row align-h="center">
                <timeline v-bind:selectedStations="selectedStations" v-bind:selectedDate="selectedDate"
                          style="padding: 5px"/>
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
                options: [],
                selectedDate: new Date()
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
                });
                this.selectedStations = [this.options[0]]
            }
        }
    }
</script>

<style scoped>

</style>