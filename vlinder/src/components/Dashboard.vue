<template>
    <div>
        <b-container style="height: 100%">
            <Map/>
            <b-row align-h="center" align-v="center" style="padding: 1em; height: 200px">
                <b-col cols="6">
                    Selected Station:
                    <multiselect v-model="selectedStations" label="text" track-by="text" :clear-on-select="false"
                                 :multiple="true" :options="options" :searchable="true" :close-on-select="false"
                                 :show-labels="false" placeholder="No stations selected"/>
                </b-col>
                <b-col cols="6" style="height: 100%">
                    <area-station v-bind:selectedStations="selectedStations"
                                  style="height: 100%; width: 100%"/>
                </b-col>
            </b-row>
            <b-row align-h="center" style="height: 250px">
                <b-col>
                    <line-chart-visualization
                            v-bind:selected-stations="selectedStations"
                            ref="pressureChart"
                            y-axis-label="Luchtdruk"
                            :y-axis-getter="(d) => d.pressure"
                            style="width: 100%; height: 100%"
                    />
                </b-col>
                <b-col>
                    <line-chart-visualization
                            v-bind:selected-stations="selectedStations"
                            ref="rainChart"
                            y-axis-label="Neerslagsom"
                            :y-axis-getter="(d) => d.rainVolume"
                            :enable-area=true
                            style="width: 100%; height: 100%"
                    />
                </b-col>
            </b-row>
            <b-row align-h="center" style="height: 400px">
                <b-col>
                    <WindRose v-bind:selectedStation="undefined" style="width: auto; height: 100%"/>
                </b-col>
                <b-col>
                    <temperature
                            v-bind:selected-stations="selectedStations"
                            style="width: 100%; height: 100%"
                    />
                    <!--<temperature v-bind:selectedStations="undefined" style="width: 100%; height: 100%"/>-->
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script>
    import LineChartVisualization from "./LineChartVisualization";
    import WindRose from "./Wind";
    import AreaStation from "./AreaStation";
    import Temperature from "./Temperature";
    import VisualizationMixin from "../mixins/VisualizationMixin";
    import Multiselect from 'vue-multiselect'
    import Map from "./Map";

    export default {
        name: "Dashboard",
        components: {
            Temperature,
            LineChartVisualization,
            WindRose,
            AreaStation,
            //Temperature,
            Multiselect,
            Map,
        },
        mixins: [
            VisualizationMixin
        ],
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
        mounted() {
            this.updateLineCharts();
        },
        watch: {
            stations() {
                this.stationsToOptions();
            },
            selectedStations() {
                if (this.selectedStations[0]) {
                    this.$store.dispatch('loadVlinderData', this.selectedStations[0].value);
                }
            },
            focusedVlinderData() {
                this.updateLineCharts();
            }
        },
        methods: {
            stationsToOptions() {
                let self = this;
                this.stations.forEach(station => {
                    self.options.push({value: station['id'], text: station['name']})
                });
                this.selectedStations = [this.options[0]]
            },
            updateLineCharts() {
                this.$refs.rainChart.update_data([this.focusedVlinderData]);
                this.$refs.pressureChart.update_data([this.focusedVlinderData]);
            }
        }
    }
</script>
<style src="vue-multiselect/dist/vue-multiselect.min.css"/>
<style scoped>

</style>
