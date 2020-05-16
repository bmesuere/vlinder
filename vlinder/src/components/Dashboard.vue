<template>
    <div>
        <b-row style="padding: 4vh; display: flex; width: 100%">
            <b-col style="padding: 0">
                <Map :hovered="hovered" style="float:left;width:100%"/>
            </b-col>
            <b-col style="float: right; width: 100%">
                <b-row style="height: 100%">
                    <b-col style="height: 100%">
                        <multiselect class="dashboard_multiselect"
                                     style="width: 100%"
                                     v-model="multiSelectValues" label="label" track-by="text" :clear-on-select="false"
                                     :multiple="true" :options="options" :searchable="true" :internal-search="false" :close-on-select="false"
                                     :max=5 :show-labels="false" placeholder="Selecteer een station"
                                     @search-change="test">
                            <template slot="option" slot-scope="props">
                                <div @mouseenter="hovered = props.option.value"
                                     @mouseleave="hovered = null"
                                     style="padding:4px 4px 4px 4px"
                                     class="option__desc">
                                    <span style="font-size: 20px">{{ props.option.text }}</span>
                                    <br>
                                    <span style="font-size: 14px">{{ props.option.location }}</span>
                                </div>
                            </template>
                            <span slot="maxElements">
                        Maximum aantal geselecteerd. Verwijder een station voor je een nieuw kan toevoegen.
                    </span>
                        </multiselect>
                    </b-col>
                </b-row>
            </b-col>
        </b-row>

        <b-card style="height: auto; border-style: none; box-shadow: 0 0 0 0 rgba(0,0,0,0);">
            <b-row id="timeInput" style="height: 100%;" align-h="center" align-v="center">
                <b-col style="display: flex;">
                    <div>
                        <p style="margin-bottom: 0">Van:</p>
                        <div style="z-index: 100;" class="calendarBox">
                            <b-icon style="z-index:100" icon="calendar-fill" variant="calendar"/>
                            <datetime style="background-color: #000000; " v-model="selectedStartDateString"
                                      type="datetime"/>
                        </div>
                    </div>
                    <div style="margin-left: 20px">
                        <p style="margin-bottom: 0">Tot:</p>
                        <div class="calendarBox">
                            <b-icon style="z-index:100" icon="calendar-fill" variant="calendar"/>
                            <datetime style="background-color: #000000;" v-model="selectedEndDateString"
                                      type="datetime"/>
                        </div>
                    </div>
                </b-col>
                <b-col style="display: flex;">
                    <b-button variant="info" @click="loadVlinderData">Periode toepassen</b-button>
                    <b-button style="margin-left: 20px" variant="outline-info" @click="downloadCsv">Brondata downloaden</b-button>
                </b-col>
            </b-row>
        </b-card>

        <grid-layout :layout.sync="layout"
                     :is-draggable="true"
                     :is-resizable="true"
                     :vertical-compact="true"
                     :prevent-collision="false"
                     :use-css-transforms="true"
                     :breakpoints="breakpoints"
                     :autoSize="true"
                     style="overflow: hidden"
                     :responsive="true">
            <grid-item
                    :x="layout[0].x"
                    :y="layout[0].y"
                    :w="layout[0].w"
                    :h="layout[0].h"
                    :i="layout[0].i"
                    :key="layout[0].i"
                    :min-w="3"
                    :min-h="2"
                    drag-ignore-from="svg">
                <b-card style="height: 100%">
                    <b-row>
                        <b-col><h3>Temperatuur</h3></b-col>
                        <b-col>
                            <b-button v-b-modal.temperature variant="info" class="float-right">
                                <b-icon icon="info-circle"/>
                            </b-button>
                            <b-modal id=temperature hide-footer
                                     title="Temperatuur">
                                <p class="my-4">De temperatuur wordt gemeten elke 5 minuten op 1.5 hoogte boven
                                    oppervlak in een passief geventileerde stralingshut. De humidex-temperatuur houdt
                                    rekening met de temperatuur en de relatieve vochtigheid om het thermisch comfort
                                    in te schatten. Deze waarde is interessant tijdens warme episodes. Let op, deze
                                    data werden niet gecontroleerd. </p>
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
                                <b-icon icon="info-circle"/>
                            </b-button>
                            <b-modal id=rain hide-footer
                                     title="Neerslagsom">
                                <p class="my-4">De neerslag wordt gemeten met een zogenaamde tipping-bucket regenmeter.
                                    Hieronder vind je de totale neerslagsom doorheen de geselecteerde periode.
                                    Onderstaande data zijn meestal een beperkte onderschatting, zeker in het geval het
                                    weerstation in een dichtbebouwde of beboste omgeving staat. Let op, deze data werden
                                    niet gecontroleerd.</p>
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
                                <b-icon icon="info-circle"/>
                            </b-button>
                            <b-modal id=pressure hide-footer
                                     title="Luchtdruk">
                                <p class="my-4">Hier kan je de luchtdrukwaarden (gemeten elke 5 minuten) aflezen. De
                                    luchtdruk wordt niet alleen bepaald door het weer, maar ook door de hoogte boven
                                    zeeniveau van het weerstation. Hoe hoger de ligging van het weerstation, hoe
                                    lager de luchtdrukwaarde. Let op, deze data werden niet gecontroleerd.</p>
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

            <grid-item
                    :x="layout[5].x"
                    :y="layout[5].y"
                    :w="layout[5].w"
                    :h="layout[5].h"
                    :i="layout[5].i"
                    :key="layout[5].i"
                    :min-w="3"
                    :min-h="2"
                    drag-ignore-from="svg rect">
                <b-card style="width:100%;height:100%">
                    <b-row>
                        <b-col><h3>Locatie op kaart</h3></b-col>
                        <b-col>
                            <b-button v-b-modal.location variant="info" class="float-right">
                                <b-icon icon="info-circle"/>
                            </b-button>
                            <b-modal id=location hide-footer
                                     title="Locatie op kaart">
                                <p class="my-4">Op onderstaande kaartjes kan je de inplanting van het weerstation in
                                    de ruime omgeving zien.</p>
                            </b-modal>
                        </b-col>
                    </b-row>
                    <b-tabs pills vertical style="width:100%;height:100%">
                        <b-tab v-for="station in selectedStations" v-bind:key="station.name"
                               v-bind:title="station.name" class="square">
                            <b-img :src="`${publicPath}kaartjes/${station.name}_crop.png`" fluid-grow/>
                        </b-tab>
                    </b-tabs>
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
                isLoading: false,
                allOptions: [],
                selectedStartDateString: '',
                selectedEndDateString: '',
                stationNames: {},
                layout: [
                    {"x": 0, "y": 0, "w": 6, "h": 3, "i": "0"},
                    {"x": 6, "y": 0, "w": 6, "h": 3, "i": "1"},
                    {"x": 0, "y": 3, "w": 6, "h": 2, "i": "2"},
                    {"x": 6, "y": 3, "w": 6, "h": 2, "i": "3"},
                    {"x": 0, "y": 6, "w": 6, "h": 3, "i": "4"},
                    {"x": 6, "y": 6, "w": 6, "h": 3, "i": "5"},
                    //{"x": 0, "y": 1, "w": 5.5, "h": 3, "i": "5"},
                ],
                breakpoints: {
                    lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0
                },
                cols: {
                    lg: 12, md: 12, sm: 12, xs: 6, xxs: 6
                },
                hovered: null,
                publicPath: process.env.BASE_URL
            }
        },
        computed: {
            stations() {
                this.$store.getters.stations.forEach(st => this.stationNames[st.id] = st.name);
                return this.$store.getters.stations;
            }
        },
        watch: {
            allOptions () {
                this.options = this.allOptions.slice();
            },
            stations() {
                this.stationsToOptions();
            },
            selectedStations() {
                let ids = this.selectedStations.map(x => x['id']);
                if (!ids.equals(this.multiSelectValues.map(x => x['value']))) {
                    this.multiSelectValues = this.selectedStations.map(x => {
                        return {
                            value: x['id'],
                            text: x['given_name'],
                            location: x['city'],
                            label: "[" + x['name'] + "] " + x['given_name']
                        }
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
                    self.allOptions.push({
                        value: station['id'],
                        text: station['given_name'],
                        location: station['city'],
                        label: "[" + station['name'] + "] " + station['given_name']
                    })
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
            },
            async test(a) {
                this.isLoading = true;

                new Promise(_ => {
                    this.options = []
                    a = a.toLowerCase();
                    for (var i of this.allOptions) {
                        let l = i.label.toLowerCase();
                        let loc = i.location.toLowerCase();
                        if (l.includes(a) || loc.includes(a)) {
                            this.options.push(i)
                        }
                    }
                })
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

<style>
    .dashboard_multiselect .multiselect__tags {
        font-size: 1vw;
    }

    .dashboard_multiselect .multiselect__select {
        display: none;
    }

    .multiselect__tag {
        background-color: #6685f7;
        pointer-events: all;
    }

    .multiselect__option--highlight {
        background-color: white;
        color: #354968;
    }

    .multiselect__option:hover {
        background-color: #6685f7;
        color: white;
    }

    .multiselect__option.multiselect__option--selected {
        background-color: #f3f3f3;
        color: #35495e;

    }

    .multiselect__option--selected:hover {
        background-color: #ff6a76;
    }

    .dashboard_multiselect .multiselect__content-wrapper,
    .dashboard_multiselect .multiselect__content-wrapper.multiselect-leave-active.multiselect-leave-to,
    .dashboard_multiselect .multiselect__content-wrapper.multiselect-leave {
        display: block !important;
        visibility: visible !important;
        max-height: 15vw !important;
    }

    .dashboard_multiselect .multiselect__content-wrapper :-webkit-scrollbar {
        display: none;
        -ms-overflow-style: none;
    }

    .dashboard_multiselect .multiselect__tag-icon:hover {
        background-color: #ff6a76;
    }

    .dashboard_multiselect .multiselect__tag-icon {
        height: 5vw;
    }

    .modal-backdrop {
        opacity: 0.6;
    }

</style>
