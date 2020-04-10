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
            <!--<b-row>
                <example-visualization v-bind:selectedStations="selectedStations" style="padding: 5em"/>
                        -->
            <b-row>
            </b-row>
            <b-row>
                <line-chart-visualization
                        v-bind:selected-stations="selectedStations"
                        y-axis-label="Luchtdruk"
                        :y-axis-getter="(d) => d.pressure"
                        :width="400"
                        :height="250"
                />
                <line-chart-visualization
                        v-bind:selected-stations="selectedStations"
                        y-axis-label="Neerslagsom"
                        :y-axis-getter="(d) => d.rainVolume"
                        :enable-area=true
                        :width="400"
                        :height="250"
                />
                <WindRose v-bind:selectedStation="selectedStation1" style="padding: 5em"/>
            </b-row>
            <b-row align-v="center" style="height: 100%">
                <area-station v-bind:selectedStations="selectedStations" style="padding: 5em"/>
            </b-row>
        </b-container>
    </div>
</template>

<script>
    //    import ExampleVisualization from "./ExampleVisualization";
    import LineChartVisualization from "./LineChartVisualization";
    import WindRose from "./Wind";
    //import ExampleVisualization from "./ExampleVisualization";
    import vlinderService from "../services/vlinderService";
    import AreaStation from "./AreaStation";
    import Multiselect from 'vue-multiselect'

    export default {
        name: "Dashboard",
        components: {
            LineChartVisualization,
            WindRose,
            AreaStation,
            ExampleVisualization,
            Multiselect
        },
        created() {
            let self = this;
            vlinderService.getStations().then(
                d => {
                    d.data.forEach(station => {
                        self.options.push({value: station['id'], text: station['name']})
                    })
                }
            )
        },
        data() {
            return {
                selectedStations: [],
                options: []
            }
        }
    }
</script>
<style src="vue-multiselect/dist/vue-multiselect.min.css"/>
<style scoped>

</style>