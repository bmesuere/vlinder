<template>
    <div id="d3-viz-temperature" style="display: inline-block">
        <b-container style="width: 100%; height: 100%">
            <b-row align-h="center" align-v="start" style="height: 90%">
                <b-col style="height: 100%">
                <line-chart-visualization
                    ref="tempchart"
                    v-bind:selected-stations="selectedStations"
                    y-axis-label="Temperatuur"
                    :y-axis-getter="(d) => d.temp"
                    style="width: 100%; height: 100%"
                />
                </b-col>
            </b-row>
            <b-row align-v="end">
                <b-col>
                <input type="checkbox" id="perceived-checkbox" v-model="showPerceivedTemp"/>
                <label for="perceived-checkbox">Toon gevoelstemperatuur</label>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>


<script>
    import VisualizationMixin from "../mixins/VisualizationMixin";
    import LineChartVisualization from "./LineChartVisualization";

    // TODO change colors
    // TODO change linewith for perceived/avg temp
    export default {
        name: "Temperature",
        components: {LineChartVisualization},
        data: function() {
            return {
                showPerceivedTemp: false
            }
        },
        props: {
            "selectedStations": Array,
        },
        mixins: [
            VisualizationMixin
        ],
        watch: {
            focusedVlinderData() {
                this.updateLineChart();
            },
            showPerceivedTemp() {
                this.updateLineChart();
            }
        },
        mounted() {
            this.checkbox = this.$refs.perceivedcheckbox;
            this.temperature = this.$refs.tempchart;
            this.updateLineChart();
        },
        methods: {
            /**
             * Compute the perceived temperature based on the WCTI formula
             * source: https://www.meteo.be/nl/info/veelgestelde-vragen/metingen-en-meeteenheden/hoe-bereken-je-de-gevoelstemperatuur
             * @param T current measured temperature
             * @param V current measured wind speed
             * @returns {number}
             */
            computePerceivedTemperature(T, V) {
                const V0_16 = Math.pow(V, 0.16);
                return 13.12 + 0.6215 * T - 11.37 * V0_16 + 0.3965 * T * V0_16;
            },
            temperatureData(data) {
               if (this.showPerceivedTemp) {
                   let self = this;
                   let perceivedTemp = data.map(function (d) {
                       return {
                           "temp": self.computePerceivedTemperature(d['temp'], d['windSpeed']),
                           "time": d['time']
                       };
                   });
                   return [data, perceivedTemp];
               } else {
                   return [data];
               }
            },
            updateLineChart() {
                this.temperature.update_data(this.temperatureData(this.focusedVlinderData));
            }
        }
    }
</script>

<style scoped>
</style>