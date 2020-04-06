<template>
    <div>
        <b-container style="height: 100%">
            <b-row align-h="center" style="padding: 5em">
                <b-col>
                    First station selection:
                    <b-form-select v-model="selectedStation1" :options="options"/>
                </b-col>
                <b-col>
                    Second station selection:
                    <b-form-select v-model="selectedStation2" :options="options"/>
                </b-col>
            </b-row>
            <b-row>
                <example-visualization v-bind:selectedStation="selectedStation1" style="padding: 5em"/>
                        </b-row>
            <b-row align-v="center" style="height: 100%">
                <temperature v-bind:selectedStation="selectedStation1"/>
            </b-row>
        </b-container>
    </div>
</template>

<script>

    import ExampleVisualization from "./ExampleVisualization";
    import vlinderService from "../services/vlinderService";
    import Temperature from "./Temperature";

    export default {
        name: "Dashboard",
        components: {
            Temperature,
            ExampleVisualization
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
                selectedStation1: '',
                selectedStation2: '',
                options: []
            }
        }
    }
</script>

<style scoped>

</style>