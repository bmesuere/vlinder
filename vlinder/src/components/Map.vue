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
    import Popup from '../d3components/stationpopup.js'
    import '../utils/extentions.js'

    export default {
        name: "Map",
        mixins: [
            VisualizationMixin
        ],
        mounted() {
            const zoomed = () => {
                const t = d3.event.transform;
                this.map.attr('transform', t)
            };

            // Main
            const w = 1400, h = 700;

            const svg = d3.select("#map-div").append("svg").attrs({
                preserveAspectRatio: "xMinYMin meet",
                class: "map svg-content",
                viewBox: `0 0 ${w} ${h}`,
            });

            this.map = svg.append("g");

            this.map.w = w;
            this.map.h = h;

            this.map.projection = d3.geoMercator();
            this.map.path = d3.geoPath().projection(this.map.projection);
            this.map.zoom = d3.zoom().scaleExtent([1, 12]).on("zoom", zoomed);

            svg.call(this.map.zoom).on("dblclick.zoom", null);
        },
        data() {
            return {
                map: {},
                stations_component: {}
            }
        },
        watch: {
            stations() {
                this.addStationsToMap();
            },
            selectedStations () {
                let self = this;
                this.stations_component.join(enter => {
                    enter.select("circle")
                    .attr("selected", d => self.selectedStations.includes(d))
                });
            }
        },
        methods: {
            addStationsToMap() {
                let self = this;
                this.stations_component = new Stations();

                this.map.datum({regions: belgium, stations: this.stations});
                this.map.call(Regions);
                this.map.call(this.stations_component);

                this.stations_component.join(enter => {
                    enter.select("circle").on("click.select", function (d) {
                        let index = self.selectedStations.findIndex(el => el === d);
                        if (index !== -1) {
                            self.selectedStations.splice(index, 1);
                        } else {
                            self.selectedStations.push(d);
                        }
                    });
                });

                this.setSelectedStations([this.stations[0]]);

                this.stations_component.join(enter => {
                    Popup(enter.select("circle"));
                });
            }
        }
    }
</script>

<style scoped>
    @import "../styles/map.css";
</style>
