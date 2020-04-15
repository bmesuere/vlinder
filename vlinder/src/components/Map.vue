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
    import belgium from "../local/belgium.geo.json.js";
    import Regions from "../d3components/continents.js";
    import Stations from "../d3components/stations.js";
    import '../utils/extentions.js'

    export default {
        name: "Map",
        mixins: [
            VisualizationMixin
        ],
        mounted() {
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

            map.w = w;
            map.h = h;

            map.projection = d3.geoMercator();
            map.path = d3.geoPath().projection(map.projection);
            map.zoom = d3.zoom().scaleExtent([1, 12]).on("zoom", zoomed);

            const selection = new Set();

            svg.call(map.zoom).on("dblclick.zoom", null);

            const stations_component = new Stations();

            map.datum({regions: belgium, stations: this.stations});
            map.call(Regions);
            map.call(stations_component);

            stations_component.join(enter => {
                enter.select("circle").on("click.select", function (d) {
                    const el = d3.select(this);
                    const cond = el.attr("selected") === "false";
                    selection.toggle(d, cond);
                    el.attr("selected", (cond))
                });
                enter.attr("debug", 1)
            })
        }
    }
</script>

<style scoped>
    @import "../styles/map.css"
</style>
