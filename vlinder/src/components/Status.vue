<template>
    <div>
        <b-container style="height: 100%">
            <b-row align-h="center" align-v="center" style="padding: 1em">
                <b-col>
                    Vlinderstations to display:
                    <multiselect v-model="selection" label="text" track-by="text" :clear-on-select="false"
                                 :multiple="true" :options="options" :searchable="true" :close-on-select="false"
                                 :show-labels="false" placeholder="No stations selected"/>
                </b-col>
                <b-col>
                    <b-row>
                        <b-col>
                            From:
                            <datetime v-model="selectedStartDateString" type="datetime"/>
                        </b-col>
                        <b-col>
                            Until:
                            <datetime v-model="selectedEndDateString" type="datetime"/>
                        </b-col>
                    </b-row>
                </b-col>
                <b-col cols="2">
                    <b-button @click="loadData">Load Data</b-button>
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
    import {Datetime} from "vue-datetime";
    import fillMissingData from "../utils/vlinderDataParse";
    import vlinderService from "../services/vlinderService";

    export default {
        name: "Status",
        components: {
            Multiselect,
            Timeline,
            Datetime
        },
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
                this.loadData();
            }
        },
        methods: {
            stationsToOptions() {
                let self = this;
                this.stations.forEach(station => {
                    self.options.push({value: station['id'], text: station['name']})
                });
                console.log(this.options);
                this.selection = [this.options[0]]
            },
            async loadData() {
                let self = this;
                let datas = [];
                let promises = [];
                for (let i = 0; i < self.selection.length; i++) {
                    promises.push(vlinderService.getVlinderData(
                        self.selection[i].value,
                        new Date(self.selectedStartDateString),
                        new Date(self.selectedEndDateString)).then(
                        d => {
                            let dataset = fillMissingData(d.data);
                            datas.push(...dataset)
                        }
                    ));
                }

                await Promise.all(promises);
                this.data = datas;
            }
        }
    }
</script>

<style scoped>

</style>