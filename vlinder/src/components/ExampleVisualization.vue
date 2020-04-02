<template>
    <div id="d3-viz">
        <div id="stationss"></div>
        <div id="latestt"></div>
        <div id="some-vlinders"></div>
    </div>
</template>

<script>
    import VisualizationMixin from "../mixins/VisualizationMixin";
    import vlinderService from "../services/vlinderService";
    import * as d3 from 'd3'

    export default {
        name: "ExampleVisualization",
        mixins: [
            VisualizationMixin
        ],
        mounted () {
            // This is code is ran on creation of the component
            let stationsDiv = d3.select('#stationss');
            vlinderService.getStations(d => stationsDiv.html(d.data['0xwg6AsDvbnxXzB4S3c2BRyJ']['VLINDER']));
            let latestDiv = d3.select('#latestt');
            vlinderService.getLatestVlinderData(d => latestDiv.html(d.data[0]['temp']));
            let vlinderDiv = d3.select('#some-vlinders');
            vlinderService.getVlinderData('jvy7zdAPZ5ymI2hydh6tvnmm',
                new Date(2020, 1, 14, 23, 33, 20, 0),
                new Date(2020, 1, 16, 10, 0, 0, 0),
                d => vlinderDiv.html(d.data[0]['temp']));
        }
    }
</script>

<style scoped>

</style>