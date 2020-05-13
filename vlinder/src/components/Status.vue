<template>
    <div>
        <b-container style="height: 100%">
            <b-row align-h="center" align-v="center" style="padding: 1em">
                <b-col>
                    Weerstations:
                    <multiselect v-model="selection" label="label" track-by="text" :clear-on-select="false"
                                 :multiple="true" :options="options" :searchable="true" :close-on-select="false"
                                 :max=5 :show-labels="false" placeholder="Selecteer een station">
                              <template slot="option" slot-scope="props">
                                <div style="padding:4px 4px 4px 4px"
                                     class="option__desc">
                                    <span style="font-size: 20px">{{ props.option.text }}</span>
                                    <br>
                                    <span style="font-size: 14px">{{ props.option.location }}</span>
                                </div>
                            </template>
                    </multiselect>
                </b-col>
                <b-col>
                <b-card style="border-style: none; box-shadow: 0 0 0 0 rgba(0,0,0,0);">
                    <b-row id="timeInput" style="height: 100%;" align-h="center" align-v="center">
                        <b-col style="margin-left: 50px">
                            <b-row>
                                <p style="margin-bottom: 0">Van:</p>
                                <div class="calendarBox">
                                    <b-icon icon="calendar-fill" variant="calendar"/>
                                    <datetime style="background-color: #000000; " v-model="selectedStartDateString"
                                                type="datetime"/>
                                </div>
                            </b-row>
                            <b-row>
                                <p style="margin-bottom: 0">Tot:</p>
                                <div class="calendarBox">
                                    <b-icon icon="calendar-fill" variant="calendar"/>
                                    <datetime style="background-color: #000000;" v-model="selectedEndDateString"
                                                type="datetime"/>
                                </div>
                            </b-row>
                        </b-col>
                        <b-col style="margin-left: 50px">
                            <b-button variant="info" @click="loadData">Selecteer</b-button>
                        </b-col>
                    </b-row>
                </b-card>
                </b-col>
            </b-row>
            <b-row align-h="center">
                <timeline :datas="data" :selection="selection" style="padding: 5px"/>
            </b-row>
        </b-container>
    </div>
</template>

<script>
    import Multiselect from "vue-multiselect";
    import Timeline from "./Timeline";
    import VisualizationMixin from "../mixins/VisualizationMixin";
    import {Datetime} from "vue-datetime";
    import vlinderService from "../services/vlinderService";

    export default {
        name: "Status",
        components: {
            Multiselect,
            Timeline,
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
                selection: [],
                options: [],
                selectedStartDateString: '',
                selectedEndDateString: '',
                data: []
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
            },
            selection() {
                let ids = this.selection.map(x => x['value']);
                if (!this.selectedStations.map(x => x['id']).equals(ids)) {
                    this.setSelectedStations(
                        this.stations.filter(x => ids.includes(x['id']))
                    )
                }
                // don't load data since it would trigger twice with dashboard
            },
            selectedStations() {
                let ids = this.selectedStations.map(x => x['id']);
                if (!ids.equals(this.selection.map(x => x['value']))) {
                    this.selection = this.selectedStations.map(x => {
                        return {value: x['id'], text: x['given_name'], location: x['city'], label: "[" + x['name'] + "] " + x['given_name']}
                    })
                }
                // don't load data since it would trigger twice with dashboard
            },
        },
        methods: {
            stationsToOptions() {
                let self = this;
                this.stations.forEach(station => {
                    self.options.push({value: station['id'], text: station['given_name'], location: station['city'], label: "[" + station['name'] + "] " + station['given_name']})
                });
            },
            async loadData() {
                this.$store.dispatch('loadVlinderData', {
                        ids: this.selectedStations.map(x => x['id']),
                        start: new Date(this.selectedStartDateString),
                        end: new Date(this.selectedEndDateString)
                    }
                );
            }
        }
    }
</script>

<style scoped>

</style>