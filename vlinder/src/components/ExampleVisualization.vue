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
            selectedStations: Array
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
            async selectedStations() {

                let promises = []
                let datas = []

                for (var i of this.selectedStations) {
                    promises.push(
                        vlinderService.getVlinderData(i.value,
                            new Date(2020, 1, 14, 23, 33, 20, 0),
                            new Date(2020, 1, 16, 10, 0, 0, 0)
                        ).then(d => datas.push(d.data[0])));
                }

                await Promise.all(promises);

                let nameDiv = d3.select('#selected-vlinder').selectAll('text').data(datas);
                nameDiv.exit().remove()
                nameDiv.transition().text(d => "the temperature at station " + d.id + " is " + d.temp + ", ")
                nameDiv.enter()
                       .append("text")
                       .text(d => "the temperature at station " + d.id + " is " + d.temp + ", ")
            }
        }
    }
</script>

<style scoped>

</style>