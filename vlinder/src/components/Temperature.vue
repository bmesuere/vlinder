<template>
    <div id="d3-viz-temperature" style="display: inline-block">
        <b-container style="width: 100%; height: 100%">
            <b-row align-h="center" align-v="start" style="height: 85%">
                <b-col style="height: 100%">
                <line-chart-visualization
                    ref="tempchart"
                    y-axis-label="Temperatuur"
                    x-axis-unit=" °C"
                    msg-empty="De temperatuur was constant over deze periode."
                    :y-axis-getter="(d) => d.temp"
                    style="width: 100%; height: 100%"
                />
                </b-col>
            </b-row>
            <b-row>
                <b-form-group style="padding-left: 7vh">
                    <b-form-radio-group
                        id="radio-group-1"
                        v-model="typePerceivedTemperature"
                        :options="options"
                        value-field="item"
                        text-field="name"
                        name="Gevoelstemperatuur"
                    ></b-form-radio-group>
                </b-form-group>
            </b-row>
        </b-container>
    </div>
</template>

this.padding = {top: 20, left: 40, right: 20, bottom: 50};

<script>
    import VisualizationMixin from "../mixins/VisualizationMixin";
    import LineChartVisualization from "./LineChartVisualization";

    export default {
        name: "Temperature",
        components: {
            LineChartVisualization,
        },
        data: function() {
            return {
                typePerceivedTemperature: 'Geen',
                options: [
                    { item: 'Geen', name: 'Geen',  },
                    { item: 'Humindex', name: 'Humindex' },
                    { item: 'WCTI', name: 'WCTI' },
                ]
            }
        },
        mixins: [
            VisualizationMixin
        ],
        watch: {
            focusedVlinderData() {
                this.updateLineChart();
            },
            typePerceivedTemperature() {
                this.updateLineChart();
            }
        },
        mounted() {
            this.temperature = this.$refs.tempchart;
            this.temperature.colors[0]='#ff0000';
            this.temperature.colors[1]='#ffc6e0';
            //this.updateLineChart();
        },
        methods: {
            /**
             * Compute the perceived temperature based on the WCTI formula
             * source: https://www.meteo.be/nl/info/veelgestelde-vragen/metingen-en-meeteenheden/hoe-bereken-je-de-gevoelstemperatuur
             * @param T current measured temperature in Celcius
             * @param V current measured wind speed in m/s
             * @returns {number}
             */
            computePerceivedTemperatureWCTI(T, V) {
                const V0_16 = Math.pow(V*3.6*1.5, 0.16);
                return Math.round(10*(13.12 + 0.6215 * T - 11.37 * V0_16 + 0.3965 * T * V0_16))/10;
            },

            /**
             * Compute the perceived temperature based on the humindex formula
             * source: https://en.wikipedia.org/wiki/Humidex
             * @param T current measured temperature in Celcius
             * @param H humidity
             * @returns {number}
             */
            computePerceivedTemperatureHumindex(T, H) {
                const tDew = this.dewPointTemperature(T, H);
                return Math.round(10*(T+ 5/9*(6.11 * Math.pow(Math.E, (5417.7530*(1/273.16 - 1/(273.15+tDew)))) -10)) )/10;
            },

            /**
             * Compute the dew point temperature based on the simple approximation on wikipedia
             * source: https://en.wikipedia.org/wiki/Dew_point#Calculating_the_dew_point
             * @param T current measured temperature in Celcius
             * @param H relative humidity // todo check whether given humidity is relative or how to find it
             * @returns {number} given dew point temperature based on temperature and humidity
             */
            dewPointTemperature(T, H) {
                return T - (100-H)/5; // only approximation
            },

            temperatureData(data) {
                if (this.typePerceivedTemperature || this.typePerceivedTemperature === 'Geen') {
                   let self = this;
                   let perceivedTemp;
                   if(this.typePerceivedTemperature === 'Humindex') {
                       perceivedTemp = data.map(function (d) {
                           return {
                               "temp": self.computePerceivedTemperatureHumindex(d['temp'], d['humidity']),
                               "time": d['time']
                           };
                       });
                   } else if (this.typePerceivedTemperature === 'WCTI') {
                       perceivedTemp = data.map(function (d) {
                           return {
                               "temp": self.computePerceivedTemperatureWCTI(d['temp'], d['windSpeed']),
                               "time": d['time']
                           };
                       });
                   } 
                   return [data, perceivedTemp];
                } else {
                    return [data];
                }
            },
            updateLineChart() {
                let data = this.focusedVlinderData;
                if (data && data.length === 1){

                    this.temperature.update_data(this.temperatureData(data[0]));
                } else if (!data || data.length===0){
                    this.typePerceivedTemperature = null;
                }
            }
        }
    }
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"/>

<style scoped>
</style>