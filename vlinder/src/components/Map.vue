<template>
    <div id="d3-viz">
        <div id="map-div" class="svg-container"></div>
    </div>
</template>

<script>
    import * as d3 from 'd3'
    import "d3-selection-multi";
    // import * as topojson from "topojson-client";
    import VisualizationMixin from "../mixins/VisualizationMixin";
    import vlinderService from "../services/vlinderService";
    import belgium from "../local/belgium.geo.json.js"
    import test from "../d3components/continents.js"

    export default {
        name: "Map",
        mixins: [
            VisualizationMixin
        ],
        mounted () {

            const zoomed = () => {
                const t = d3.event.transform;
                map.attr('transform', t)
            };

            // Main
            const w = 1400, h = 700;

            const svg = d3.select("#map-div").append("svg").attrs({
                preserveAspectRatio: "xMinYMin meet",
                class: "map svg-content",
                viewBox: `0 0 ${w} ${h}`,
            });

            const map = svg.append("g");

            map.w = w; map.h = h;

            map.projection = d3.geoMercator();
            map.path = d3.geoPath().projection(map.projection);
            map.zoom = d3.zoom().scaleExtent([1, 12]).on("zoom", zoomed);

            svg.call(map.zoom).on("dblclick.zoom", null);
            vlinderService.getStations(d=>d).then((d) => {
                map.datum({regions:belgium,stations:d}).call(test)
            })

        }
    }
</script>

<style scoped>
 @import "../styles/map.css"
</style>
