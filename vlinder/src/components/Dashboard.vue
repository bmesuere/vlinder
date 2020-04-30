<template>
    <div style="margin-left: 10%; margin-right: 10%; margin-top: 10px;">
        <div style="position: relative; display: flex;">
            <Map style="margin: auto;"/>
            <div style="position: absolute; z-index: 9; margin-left: auto; padding: 4vh">
                <multiselect v-model="multiSelectValues" label="text" track-by="text" :clear-on-select="false"
                             :multiple="true" :options="options" :searchable="true" :close-on-select="false"
                             :show-labels="false" placeholder="Selecteer een station"/>
            </div>
        </div>

        <grid-layout :layout.sync="layout"
                     :col-num="12"
                     :is-draggable="true"
                     :is-resizable="true"
                     :vertical-compact="true"
                     :prevent-collision="false"
                     :use-css-transforms="true"

                     :responsive="true"
                     style="width: 100%">

            <grid-item
                    :x="layout[0].x"
                    :y="layout[0].y"
                    :w="layout[0].w"
                    :h="layout[0].h"
                    :i="layout[0].i"
                    :key="layout[0].i" style="z-index: 8">
                <b-card style="height: 100%">
                    <b-row style="height: 100%" align-h="center" align-v="center">
                        <b-col>
                            <b-row style="padding: 1vh" align-v="center">
                                <b-col cols="2">Van:</b-col>
                                <b-col>
                                    <datetime v-model="selectedStartDateString" type="datetime"/>
                                </b-col>
                            </b-row>
                            <b-row style="padding: 1vh" align-v="center">
                                <b-col cols="2">Tot:</b-col>
                                <b-col>
                                    <datetime v-model="selectedEndDateString" type="datetime"/>
                                </b-col>
                            </b-row>
                        </b-col>
                        <b-col cols="3">
                            <b-button @click="loadVlinderData">Laad</b-button>
                        </b-col>
                    </b-row>
                </b-card>
            </grid-item>
            <grid-item
                    :x="layout[1].x"
                    :y="layout[1].y"
                    :w="layout[1].w"
                    :h="layout[1].h"
                    :i="layout[1].i"
                    :key="layout[1].i">
                <b-card style="height: 100%">
                    <area-station style="height: 100%; width: 100%"/>
                </b-card>
            </grid-item>
            <grid-item
                    :x="layout[2].x"
                    :y="layout[2].y"
                    :w="layout[2].w"
                    :h="layout[2].h"
                    :i="layout[2].i"
                    :key="layout[2].i"
                    drag-ignore-from="svg rect">
                <b-card style="height: 100%">
                    <line-chart-visualization ref="pressureChart"
                                              y-axis-label="Luchtdruk"
                                              x-axis-unit=" hPa"
                                              :y-axis-getter="(d) => d.pressure"
                                              style="width: 100%; height: 100%"/>
                </b-card>
            </grid-item>
            <grid-item
                    :x="layout[3].x"
                    :y="layout[3].y"
                    :w="layout[3].w"
                    :h="layout[3].h"
                    :i="layout[3].i"
                    :key="layout[3].i"
                    drag-ignore-from="svg rect">
                <b-card style="height: 100%">
                    <line-chart-visualization ref="rainChart"
                                              y-axis-label="Neerslagsom"
                                              x-axis-unit=" l/m²"
                                              :y-axis-getter="(d) => d.rainVolume"
                                              :enable-area=true
                                              style="width: 100%; height: 100%"
                    />
                </b-card>
            </grid-item>
            <grid-item
                    :x="layout[4].x"
                    :y="layout[4].y"
                    :w="layout[4].w"
                    :h="layout[4].h"
                    :i="layout[4].i"
                    :key="layout[4].i">
                <b-card id="windRoseCard" style="height: 100%;">
                    <WindRose v-bind:selectedStation="undefined" style="width: auto; height: 100%"/>
                </b-card>
            </grid-item>
            <grid-item
                    :x="layout[5].x"
                    :y="layout[5].y"
                    :w="layout[5].w"
                    :h="layout[5].h"
                    :i="layout[5].i"
                    :key="layout[5].i"
                    drag-ignore-from="svg rect">
                <b-card style="height: 100%">
                    <temperature style="width: 100%; height: 100%"/>
                </b-card>
            </grid-item>
        </grid-layout>

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
    import {Datetime} from "vue-datetime";
    import VueGridLayout from 'vue-grid-layout';

    export default {
        name: "Dashboard",
        components: {
            GridLayout: VueGridLayout.GridLayout,
            GridItem: VueGridLayout.GridItem,
            Temperature,
            LineChartVisualization,
            WindRose,
            AreaStation,
            Multiselect,
            Map,
            Datetime
        },
        mixins: [
            VisualizationMixin
        ],
        created() {
            this.stationsToOptions();

            let today = new Date();
            let yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);
            this.selectedStartDateString = yesterday.toISOString();
            this.selectedEndDateString = today.toISOString();
        },
        data() {
            return {
                multiSelectValues: [],
                options: [],
                selectedStartDateString: '',
                selectedEndDateString: '',
                layout: [
                    {"x": 0, "y": 0, "w": 6, "h": 1, "i": "0"},
                    {"x": 6, "y": 0, "w": 4, "h": 1, "i": "1"},
                    {"x": 6, "y": 1, "w": 4, "h": 2, "i": "2"},
                    {"x": 6, "y": 1, "w": 4, "h": 2, "i": "3"},
                    {"x": 1, "y": 4, "w": 4, "h": 2, "i": "4"},
                    {"x": 0, "y": 1, "w": 6, "h": 3, "i": "5"},
                ]

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
                let ids = this.selectedStations.map(x => x['id']);
                if (!ids.equals(this.multiSelectValues.map(x => x['value']))) {
                    this.multiSelectValues = this.selectedStations.map(x => {
                        return {value: x['id'], text: x['name']}
                    })
                }
                this.loadVlinderData();
            },
            multiSelectValues() {
                let ids = this.multiSelectValues.map(x => x['value']);
                if (!this.selectedStations.map(x => x['id']).equals(ids)) {
                    this.setSelectedStations(
                        this.stations.filter(x => ids.includes(x['id']))
                    )
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
            },
            updateLineCharts() {
                this.$refs.rainChart.update_data([this.focusedVlinderData]);
                this.$refs.pressureChart.update_data([this.focusedVlinderData]);
            },
            loadVlinderData() {
                if (this.selectedStations[0]) {
                    this.$store.dispatch('loadVlinderData', {
                            ids: this.selectedStations.map(x => x['id']),
                            start: new Date(this.selectedStartDateString),
                            end: new Date(this.selectedEndDateString)
                        }
                    );
                }
            }
        }
    }
</script>
<style src="vue-multiselect/dist/vue-multiselect.min.css"/>
<style scoped>
    #windRoseCard .card-body {
        padding: 0.5rem;
    }
</style>
