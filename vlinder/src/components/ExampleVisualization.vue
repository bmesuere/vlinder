<template>
    <div id="d3-viz">
        <div id="stations"></div>
        <div id="some-vlinder"></div>
        <div id="latest-vlinder"></div>
        <div id="selected-vlinder" style="font-size: larger"></div>
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
        props: {
            // Declare properties where a parent component can bind information to
            selectedStation: String
        },
        mounted() {
            // This is code is ran on creation of the component
            let stationsDiv = d3.select('#stations');
            vlinderService.getStations().then(d => stationsDiv.html(d.data[0]['name']));
        },
        watch: {
            latestVlinderData() {
                // This code is ran when there is new latestVlinderData
                let vlinderDiv = d3.select('#latest-vlinder');
                vlinderDiv.html(this.latestVlinderData[0]['temp']);
                console.log(this.latestVlinderData);
            },
            selectedStation() {
                // This code is ran when selected station is changed => selectedStation is a variable bound on creation
                // of this component in Dashboard
                if (this.selectedStation !== '') {
                    let vlinderDiv = d3.select('#latest-vlinder');
                    let nameDiv = d3.select('#selected-vlinder');
                    nameDiv.html('Selected Station: ' + this.selectedStation);
                    vlinderService.getVlinderData(this.selectedStation,
                        new Date(2020, 1, 14, 23, 33, 20, 0),
                        new Date(2020, 1, 16, 10, 0, 0, 0)
                    ).then(d => vlinderDiv.html(d.data[0]['temp']));
                }
            }
        }
    }
</script>

<style scoped>

</style>