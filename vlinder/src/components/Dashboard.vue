<template>
    <div>
        <b-container style="height: 100%">
            <b-row align-h="center" style="padding: 5em">
                <b-col>
                     <multiselect v-model="selectedStations" label="text" track-by="text" :clear-on-select="false" :multiple="true" :options="options" :searchable="true" :close-on-select="false" :show-labels="false" placeholder="No stations selected"></multiselect>
                </b-col>
            </b-row>
            <b-row>
                <example-visualization v-bind:selectedStations="selectedStations" style="padding: 5em"/>
            </b-row>
        </b-container>
    </div>
</template>

<script>
    import ExampleVisualization from "./ExampleVisualization";
    import vlinderService from "../services/vlinderService";
    import Multiselect from 'vue-multiselect'

    export default {
        name: "Dashboard",
        components: {
            ExampleVisualization,
            Multiselect
        },
        created() {
            this.$store.dispatch('fetchLatestVlinderData');
            setInterval(() => {
                this.$store.dispatch('fetchLatestVlinderData')
            }, 300000);

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
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style scoped>

</style>