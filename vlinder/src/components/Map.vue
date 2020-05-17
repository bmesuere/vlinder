<template>
    <div id="d3-viz">
        <div id="map-div" class="svg-container"></div>
        <div id="legend-div" />
        <div id="radio">
            <div style="height:30%">
            <input type="radio" id="temp" v-bind:value='{"variable": "temp", "name": "Temperatuur", "unit": "°C",
                                    "min": -5, "max": 30}' v-model="legend_values">
            <label class="radio-label" for="temp">Temperatuur</label>
            </div>
            <div style="height:30%">
            <input type="radio" id="hum" v-bind:value='{"variable": "humidity", "name": "Luchtvochtigheid", "unit": "%",
                                    "min": 0, "max": 100}' v-model="legend_values">
            <label class="radio-label" for="hum">Luchtvochtigheid</label>
            </div>
            <div style="height:30%">
            <input type="radio" id="speed" v-bind:value='{"variable": "windSpeed", "name": "Windsnelheid", "unit": "m/s",
                                    "min": 0, "max": 35}' v-model="legend_values">
            <label class="radio-label" for="speed">Windsnelheid</label>
            </div>
        </div>
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
    import Popup from '../d3components/stationpopup.js';
    import '../utils/extentions.js';

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
            this.legend = d3.select("#legend-div").append("svg").attrs({
                preserveAspectRatio: "xMinYMin meet",
                viewBox: `0 0 200 200`
            })

            this.map.w = w;
            this.map.h = h;

            this.error = svg.append("text").attr("opacity",0).text("Maximum aantal stations geselecteerd").attrs({x:1100,y:670});

            this.map.projection = d3.geoMercator();
            this.map.path = d3.geoPath().projection(this.map.projection);
            this.map.zoom = d3.zoom().scaleExtent([1, 12]).on("zoom", zoomed);

            svg.call(this.map.zoom).on("dblclick.zoom", null);
        },
        data() {
            return {
                map: {},
                stations_component: {},
                legend_values: {"variable": "temp", "name": "Temperatuur", "unit": "°C",
                                "min": -5, "max": 30},
            }
        },
        props: {
            hovered: String,
        },
        watch: {
            legend_values() {
                this.make_colouring();
            },
            stations() {
                this.addStationsToMap();
            },
            selectedStations () {
                let self = this;
                this.stations_component.join(enter => {
                    enter.select("circle")
                    .attr("selected", d => self.selectedStations.includes(d))
                });
                this.make_colouring();
            },
            latestVlinderData() {
                if (this.stations_component.join) {
                    this.stations_component.join(enter => {
                        Popup(enter.select("circle"), this.map, this.latestVlinderData);
                    });
                }
                this.make_colouring();
            },
            hovered() {
                let self = this;
                this.stations_component.join(enter => {
                    enter.select("circle")
                    .attr("hovered", d => d.id == self.hovered)
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
                        } else if (self.selectedStations.length < 5) {
                            self.selectedStations.push(d);
                        } else {
                            self.error.transition().duration(400).attr("opacity",1).transition().duration(400).attr("opacity",0)
                        }
                    });
                });

                this.setSelectedStations([this.stations[0]]);

                this.stations_component.join(enter => {
                    Popup(enter.select("circle"), this.map, this.latestVlinderData);
                });
            },

            create_step_list(min_value, max_value, steps) {
                var step_size = (max_value - min_value)/steps
                var l = [];
                for (var i = 0; i <= steps; i++) {
                    l.push(min_value + (step_size * i))
                }
                return l;
            },

            add_legend(text, unit, min_value, max_value) {
                var i = 0;
                var offset = 8;
                var scale = d3.scaleLinear().range([min_value, max_value]).domain(0, 10)
                var values = this.create_step_list(min_value, max_value, 6);
                this.legend.selectAll("*").remove();
                this.legend.selectAll("rect")
                    .data([0, 1, 2, 3, 4, 5, 6])
                    .enter()
                    .append("rect")
                    .attrs({
                        "x": d => (d * 25) + 10,
                        "y": 60,
                        "fill": d => d3.interpolateSpectral(1 - (values[d] - min_value)/(max_value - min_value)),
                        "width": 25,
                        "height": 25
                    })

                this.legend.selectAll("text")
                    .data([0, 6])
                    .enter()
                    .append("text")
                    .attrs({
                        "x": d => (d * 25) + 10,
                        "y": 55,
                        "fill": d => d3.interpolateSpectral(1 - (values[d] - min_value)/(max_value - min_value)),
                        "font-size": "10px",
                    }).text(d => values[d] + unit)

                this.legend
                    .append("text")
                    .attrs({
                        "x": 440/text.length,
                        "y": 30,
                        "fill": "#35495e",
                        "font-size": "20px",
                    }).text(text)
            },
            colour_circles(variable, text, unit, min_value, max_value) {
                if (variable == null) {
                    variable = "temp";
                }

                if (unit == null) {
                    unit = "";
                }

                if (min_value == null) {
                    min_value = 0;
                }

                if (max_value == null) {
                    max_value = min_value + 1;
                }

                this.add_legend(text, unit, min_value, max_value)

                if (this.stations_component.join && this.latestVlinderData) {
                    var latestMap = {};
                    for (var latestVlinder of this.latestVlinderData) {
                        latestMap[latestVlinder.id] = latestVlinder;
                    }
                    this.stations_component.join(enter => {
                        enter.select("circle").style("fill", d => {
                            if (latestMap[d.id]) {
                                var t = 1 - ((latestMap[d.id][variable] - min_value)/(max_value - min_value));
                                return d3.interpolateSpectral(t);
                            }
                        });
                    });
                }
            },

            make_colouring() {
                console.log(this.legend_values);
                this.colour_circles(this.legend_values["variable"],
                    this.legend_values["name"],
                    this.legend_values["unit"],
                    this.legend_values["min"],
                    this.legend_values["max"]);
            }
        }
    }
</script>

<style scoped>
    @import "../styles/map.css";
</style>
