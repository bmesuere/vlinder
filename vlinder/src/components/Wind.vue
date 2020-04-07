<template>
    <div id="d3-viz-windrose" style="width:auto">
        <div id="windrose-svg" style="width:auto"/>
        <div id="selected-vlinder" style="font-size: larger"></div>
    </div>
</template>

<script>
    import VisualizationMixin from "../mixins/VisualizationMixin";
    import vlinderService from "../services/vlinderService";
    import * as d3 from 'd3'

    export default {
        name: "Wind Rose",
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
                vlinderDiv.html(this.latestVlinderData[0]['temp'])
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
        },
        methods: {
            createPlot(data) {
                const padding = {top: 40, right: 80, bottom: 40, left: 40};
                const width = window.innerWidth * 0.8;
                const height = window.innerHeight * 0.8;
                const start = new Date();
                start.setDate(this.start.getDate() - 1);
                const end = new Date();
                end.setDate(this.end.getDate());

                const svg = d3.select("d3-viz-windrose")
                    .append("svg")
                    .attr("viewBox", `${-width / 2} ${-height / 2} ${width} ${height}`)
            }
        }
    }
</script>

<style scoped>

</style>