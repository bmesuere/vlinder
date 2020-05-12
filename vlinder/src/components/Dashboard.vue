<template>
    <div>
        <div style="padding-boo: 4vh; display: flex; width: 100%">
            <Map style="width: 50%; height: 50%; float:left"/>
            <div style="float:right">
                <multiselect v-model="multiSelectValues" label="text" track-by="text" :clear-on-select="false"
                             :multiple="true" :options="options" :searchable="true" :close-on-select="false"
                             :max=5 :show-labels="false" placeholder="Selecteer een station">
                    <span slot="maxElements">Maximum aantal geselecteerd. Verwijder een station voor je een nieuw kan toevoegen.</span>
                </multiselect>
            </div>
        </div>

        <b-card style="height: auto; border-style: none; box-shadow: 0px 0px 0px 0px rgba(0,0,0,0);">
                    <row id="timeInput" style="height: 100%;" align-h="center" align-v="center" >
                        <div style="display: flex;">
                            <div>
                            <p style="margin-bottom: 0px">Van:</p>
                                <div style="z-index: 100;" class="calendarBox">
                                    <b-icon style="z-index:100" icon="calendar-fill" variant="calendar"></b-icon>
                                    <datetime style="background-color #000000; " v-model="selectedStartDateString" type="datetime"/>
                                </div>
                            </div>
                            <div style="margin-left: 20px">
                                <p style="margin-bottom: 0px">Tot:</p>
                                <div class="calendarBox">
                                    <b-icon style="z-index:100" icon="calendar-fill" variant="calendar"></b-icon>
                                    <datetime style="background-color #000000;" v-model="selectedEndDateString" type="datetime"/>
                                </div>
                            </div>
                        </div>
                        <div style="display: flex;">   
                            <b-button variant="info" @click="loadVlinderData">Selecteer</b-button>
                            <b-button style="margin-left: 20px" variant="outline-info" @click="downloadCsv">Download</b-button>
                        </div> 
                    </row>
                </b-card>

        <grid-layout :layout.sync="layout"
                     :is-draggable="true"
                     :is-resizable="true"
                     :vertical-compact="true"
                     :prevent-collision="false"
                     :use-css-transforms="true"
                     :breakpoints="breakpoints"
                     style="overflow-x: hidden"
                     :responsive="true"
                     >
            <grid-item
                    :x="layout[0].x"
                    :y="layout[0].y"
                    :w="layout[0].w"
                    :h="layout[0].h"
                    :i="layout[0].i"
                    :key="layout[0].i"
                    :min-w="3"
                    :min-h="2"
                    drag-ignore-from="svg rect">
                    <b-card style="height: 100%">
                            <b-row>
                                <b-col><h3>Temperatuur</h3></b-col>
                                <b-col>
                                    <b-button v-b-modal.temperature variant="info" class="float-right">
                                        <b-icon icon="info-circle"></b-icon>
                                    </b-button>
                                    <b-modal id=temperature hide-backdrop content-class="shadow" centered hide-footer title="Temperatuur">
                                        <p class="my-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut consectetur luctus nisl at facilisis. Ut euismod lorem et risus interdum, ac porttitor orci posuere.</p>
                                    </b-modal>
                                </b-col>
                            </b-row>
                        <b-row style="height: 90%">
                            <temperature v-if="this.selectedStations.length < 2" style="width: 100%; height: 100%"/>
                            <line-chart-visualization v-else
                                          ref="temperatureChart"
                                          y-axis-label="Temperatuur"
                                          x-axis-unit=" C°"
                                          msg-empty="De temperatuur was constant over deze periode."
                                          :y-axis-getter="(d) => d.temp"
                                          style="width: 100%; height: 100%"
                                />
                        </b-row>
                    </b-card>
            </grid-item>
            <grid-item
                    :x="layout[1].x"
                    :y="layout[1].y"
                    :w="layout[1].w"
                    :h="layout[1].h"
                    :i="layout[1].i"
                    :key="layout[1].i"
                    :min-w="3"
                    :min-h="2"
                    drag-ignore-from="svg">
                <WindRose v-bind:selectedStation="undefined" style="width: auto; height: 100%; padding-bottom: 10px;"/>
            </grid-item>
            <grid-item
                    :x="layout[2].x"
                    :y="layout[2].y"
                    :w="layout[2].w"
                    :h="layout[2].h"
                    :i="layout[2].i"
                    :key="layout[2].i"
                    :min-w="3"
                    :min-h="2"
                    drag-ignore-from="svg rect">
                    <b-card style="height: 100%">
                            <b-row>
                                <b-col><h3>Neerslagsom</h3></b-col>
                                <b-col>
                                    <b-button v-b-modal.rain variant="info" class="float-right">
                                        <b-icon icon="info-circle"></b-icon>
                                    </b-button>
                                    <b-modal hide-backdrop content-class="shadow" centered  id=rain hide-footer title="Neerslagsom">
                                        <p class="my-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut consectetur luctus nisl at facilisis. Ut euismod lorem et risus interdum, ac porttitor orci posuere.</p>
                                    </b-modal>
                                </b-col>
                            </b-row>
                        <b-row style="height: 90%">
                            <line-chart-visualization ref="rainChart"
                                                        y-axis-label="Neerslagsom"
                                                        x-axis-unit=" l/m²"
                                                        msg-empty="Er was geen neerslag in deze periode."
                                                        :y-axis-getter="(d) => d.rainVolume"
                                                        :enable-area=true
                                                        style="width: 100%; height: 100%; padding: 10px;"
                                />
                        </b-row>
                    </b-card>
                
            </grid-item>
            <grid-item
                    :x="layout[3].x"
                    :y="layout[3].y"
                    :w="layout[3].w"
                    :h="layout[3].h"
                    :i="layout[3].i"
                    :key="layout[3].i"
                    :min-w="2"
                    :min-h="1"
                    drag-ignore-from="svg">
                    <area-station style="height: 100%; width: 100%"/>
            </grid-item>
            <grid-item
                    :x="layout[4].x"
                    :y="layout[4].y"
                    :w="layout[4].w"
                    :h="layout[4].h"
                    :i="layout[4].i"
                    :key="layout[4].i"
                    :min-w="3"
                    :min-h="2"
                    drag-ignore-from="svg rect">
                    <b-card style="height: 100%">
                            <b-row>
                                <b-col><h3>Luchtdruk</h3></b-col>
                                <b-col>
                                    <b-button v-b-modal.pressure variant="info" class="float-right">
                                        <b-icon icon="info-circle"></b-icon>
                                    </b-button>
                                    <b-modal hide-backdrop content-class="shadow" centered id=pressure hide-footer title="Luchtdruk">
                                        <p class="my-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut consectetur luctus nisl at facilisis. Ut euismod lorem et risus interdum, ac porttitor orci posuere.</p>
                                    </b-modal>
                                </b-col>
                            </b-row>
                        <b-row style="height: 90%">
                            <line-chart-visualization 
                                              ref="pressureChart"
                                              y-axis-label="Luchtdruk"
                                              msg-empty="De luchtdruk was constant over deze periode."
                                              x-axis-unit=" hPa"
                                              :y-axis-getter="(d) => d.pressure"
                                              style="width: 100%; height: 100%; padding: 10px;"/>
                        </b-row>
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
    import vlinderDataToCsv from "../utils/vlinderDataToCsv";

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
                stationNames: {},
                layout: [
                    {"x": 0, "y": 0, "w": 6, "h": 3, "i": "0"},
                    {"x": 6, "y": 0, "w": 6, "h": 3, "i": "1"},
                    {"x": 0, "y": 3, "w": 6, "h": 2, "i": "2"},
                    {"x": 6, "y": 3, "w": 6, "h": 2, "i": "3"},
                    {"x": 0, "y": 6, "w": 6, "h": 3, "i": "4"},
                    //{"x": 0, "y": 1, "w": 5.5, "h": 3, "i": "5"},
                ],
                breakpoints: {
                    lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0
                },
                cols: {
                    lg: 12, md: 12, sm: 12, xs: 6, xxs: 6
                }

            }
        },
        computed: {
            stations() {
                this.$store.getters.stations.forEach(st => this.stationNames[st.id] = st.name);
                return this.$store.getters.stations;
            }
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
        },
        methods: {
            stationsToOptions() {
                let self = this;
                this.stations.forEach(station => {
                    self.options.push({value: station['id'], text: station['name']})
                });
            },
            loadVlinderData() {
                this.$store.dispatch('loadVlinderData', {
                        ids: this.selectedStations.map(x => x['id']),
                        start: new Date(this.selectedStartDateString),
                        end: new Date(this.selectedEndDateString)
                    }
                );
            },
            downloadCsv() {
                let csvString = vlinderDataToCsv(this.vlinderData);

                //Download the file as CSV
                let downloadLink = document.createElement("a");
                let blob = new Blob(["\ufeff", csvString]);
                downloadLink.href = URL.createObjectURL(blob);
                downloadLink.download = "vlinderdata.csv";
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
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
