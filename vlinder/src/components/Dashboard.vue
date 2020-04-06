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
            <b-row>
                    <line-chart-visualization
                            v-bind:selected-station="selectedStation1"
                            y-axis-label="Neerslagsom"
                            :y-axis-getter="(d) => d.rainVolume"
                            :selected-stations="['jvy7zdAPZ5ymI2hydh6tvnmm', '0xwg6AsDvbnxXzB4S3c2BRyJ']"
                            :enable-area=true
                            :width="400"
                            :height="250"
                            style="padding: 5em"
                    />
            </b-row>

            <b-row>
                <b-col>
                    <line-chart-visualization
                            v-bind:selected-station="selectedStation1"
                            y-axis-label="Luchtdruk"
                            :y-axis-getter="(d) => d.pressure"
                            :selected-stations="['jvy7zdAPZ5ymI2hydh6tvnmm', '0xwg6AsDvbnxXzB4S3c2BRyJ']"
                            :width="400"
                            :height="250"
                            style="padding: 5em"
                    />
                </b-col>
            </b-row>

        </b-container>
    </div>
</template>

<script>
    import ExampleVisualization from "./ExampleVisualization";
    import vlinderService from "../services/vlinderService";
    import LineChartVisualization from "./LineChartVisualization";

    export default {
        name: "Dashboard",
        components: {
            LineChartVisualization,
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