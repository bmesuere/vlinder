<template>
    <b-card id="windRoseCard" style="height: 100%;">
        <b-row>
            <b-col><h3>Windroos</h3></b-col>
            <b-col>
                <b-button v-b-modal.modal-windrose variant="info" class="float-right">
                    <b-icon icon="info-circle"/>
                </b-button>
                <b-modal id="modal-windrose" hide-footer title="Windroos">
                    <p class="my-4">De windsnelheid en windrichting worden gemeten op een hoogte van ongeveer 2m
                        boven het oppervlak. Obstakels in de omgeving van het weerstation (bomen, gebouwen,...) zullen
                        een grote invloed hebben op de wind. Voor elke windrichting toont de windroos hoeveel procent
                        van de geselecteerde tijd de wind vanuit die richting waait, en hoe hard deze waait. Let op,
                        deze data werden niet gecontroleerd.</p>
                </b-modal>
            </b-col>
        </b-row>
        <b-row style="height: 100%">
            <b-col cols="2" v-if="this.selectedStations.length > 1" style="height: 100%">
                <b-tabs pills vertical>
                    <b-tab v-for="(station, index) in selectedStations" v-bind:key="station.name"
                           v-bind:title="station.name"
                           v-on:click="updateCurrentSelectedTab(station); update_data(index);">
                    </b-tab>
                </b-tabs>
            </b-col>
            <b-col v-bind:cols="this.selectedStations.length > 1 ? 7 : 9" id="d3-viz-windrose" style="height: 100%"/>
            <b-col v-bind:cols="this.selectedStations.length > 1 ? 3 : 3" id="d3-viz-windrose-legend"
                   style="height: 100%"/>
        </b-row>
    </b-card>
</template>

<script>
    import VisualizationMixin from "../mixins/VisualizationMixin";
    import * as d3 from 'd3'
    import ResizeObserver from 'resize-observer-polyfill';
    import _ from "lodash";

    export default {
        name: "WindRose",
        mixins: [
            VisualizationMixin
        ],
        props: {
            stationNames: {}
        },
        watch: {
            focusedVlinderData() {
                this.update_data()
            }
        },
        mounted() {
            this.div = d3.select('#d3-viz-windrose');
            this.legend = d3.select('#d3-viz-windrose-legend');
            let observer = new ResizeObserver(this.create_windrose);
            observer.observe(this.div.node());
            this.create_windrose();
            this.currentSelectedTab = undefined;
        },
        methods: {
            create_windrose() {
                let divBox = this.div.node().getBoundingClientRect();
                this.size = Math.min(divBox['height'], divBox['width']);
                this.width = this.size;
                this.height = this.size;
                this.margin = {top: 40, right: 80, bottom: 40, left: 40};
                this.innerRadius = 20;
                this.chartWidth = this.width - this.margin.left - this.margin.right;
                this.chartHeight = this.height - this.margin.top - this.margin.bottom;
                this.outerRadius = (Math.min(this.chartWidth, this.chartHeight) / 2);

                this.div.selectAll("*").remove();

                this.tooltip = d3.select("body")
                    .append("div")
                    .style("position", "absolute")
                    .style("z-index", "10")
                    .style("visibility", "hidden")
                    .style("padding", "5px")
                    .style("border-radius", "10px")
                    .style("background", "#fff");

                this.svg = this.div.append("svg", 0)
                    .style("width", this.width + 'px')
                    .style("height", this.height + 'px');

                this.g = this.svg.append("g").attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");

                this.angle = d3.scaleLinear()
                    .range([0, 2 * Math.PI]);

                this.radius = d3.scaleLinear()
                    .range([this.innerRadius, this.outerRadius]);

                this.x = d3.scaleBand()
                    .range([0, 2 * Math.PI])
                    .align(0);

                this.y = d3.scaleLinear() //you can try scaleRadial but it scales differently
                    .range([this.innerRadius, this.outerRadius]);
                this.z = d3.scaleOrdinal()
                    .range(["#3288bd", "#66c2a5", "#abdda4", "#e6f598", "#fee08b", "#fdae61", "#f46d43", "#d53e4f"]);

                this.add_legend();

                this.update_data()
            },
            updateCurrentSelectedTab(station) {
                this.currentSelectedTab = station;
            },
            update_data(index = 0) {
                if (this.selectedStations === undefined
                    || this.selectedStations.length === 0
                    || this.stations === undefined
                    || this.stations.length === 0
                    || this.focusedVlinderData === undefined
                    || this.focusedVlinderData.length === 0) {
                    return;
                }
                // Sort focusedVlinderData alphabetically, deep copy is needed to prevent infinite loop.
                let focusedVlinderCopy = _.cloneDeep(this.focusedVlinderData)
                var self = this;
                focusedVlinderCopy.sort( function(a, b) {
                    return self.stationNames[a[0]['id']] < self.stationNames[b[0]['id']]
                    });
                if (this.currentSelectedTab !== undefined && this.selectedStations.length > 1) {
                    index = this.selectedStations.findIndex(x => x === this.currentSelectedTab);
                    // when index is -1, the currentSelectedTab was deleted
                    if (index === -1) return;
                }
                this.g.selectAll("g").remove();

                // Convert data to format needed for the windrose
                const data_csv_format = this.convertData(focusedVlinderCopy[index]);
                const data = d3.csvParse(data_csv_format, (d, _, columns) => {
                    let total = 0;
                    for (let i = 1; i < columns.length; i++) total += d[columns[i]] = +d[columns[i]];
                    d.total = total;
                    return d;
                });

                this.x.domain(data.map((d) => {
                    return d.angle;
                }));

                this.y.domain([0, d3.max(data, (d) => {
                    return d.total;
                })]);

                this.z.domain(data.columns.slice(1));

                this.angle.domain([0, d3.max(data, (d, i) => {
                    return i + 1;
                })]);

                this.radius.domain([0, d3.max(data, (d) => {
                    return d.y0 + d.y;
                })]);

                this.angleOffset = -360.0 / data.length / 2.0;

                this.g.append("g")
                    .selectAll("g")
                    .data(d3.stack().keys(data.columns.slice(1))(data))
                    .enter().append("g")
                    .attr("fill", (d) => {
                        return this.z(d.key);
                    })
                    .selectAll("path")
                    .data((d) => {
                        return d;
                    })
                    .enter().append("path")
                    .attr("d", d3.arc()
                        .innerRadius((d) => {
                            return this.y(d[0]);
                        })
                        .outerRadius((d) => {
                            return this.y(d[1]);
                        })
                        .startAngle((d) => {
                            return this.x(d.data.angle);
                        })
                        .endAngle((d) => {
                            return this.x(d.data.angle) + this.x.bandwidth();
                        })
                        .padAngle(0.01)
                        .padRadius(this.innerRadius))
                    .attr("transform", () => {
                        return "rotate(" + this.angleOffset + ")"
                    })
                    .on("mouseover", (d) => {
                        this.tooltip.text((Math.round(((d[1] - d[0]) + Number.EPSILON) * 100) / 100).toString() + "%");
                        return this.tooltip.style("visibility", "visible");
                    })
                    .on("mousemove", () => {
                        return this.tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");
                    })
                    .on("mouseout", () => {
                        return this.tooltip.style("visibility", "hidden");
                    });

                const label = this.g.append("g")
                    .selectAll("g")
                    .data(data)
                    .enter().append("g")
                    .attr("text-anchor", "middle")
                    .attr("transform", (d) => {
                        return "rotate(" + ((this.x(d.angle) + this.x.bandwidth() / 2) * 180 / Math.PI - (90 - this.angleOffset)) + ")translate(" + (this.outerRadius + 30) + ",0)";
                    });

                label.append("text")
                    .attr("transform", (d) => {
                        return (this.x(d.angle) + this.x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "rotate(90)translate(0,16)" : "rotate(-90)translate(0,-9)";
                    })
                    .text((d) => {
                        return d.angle;
                    })
                    .style("font-size", 14);

                this.g.selectAll(".axis")
                    .data(d3.range(this.angle.domain()[1]))
                    .enter().append("g")
                    .attr("class", "axis")
                    .attr("transform", (d) => {
                        return "rotate(" + this.angle(d) * 180 / Math.PI + ")";
                    })
                    .call(d3.axisLeft()
                        .scale(this.radius.copy().range([-this.innerRadius, -(this.outerRadius + 10)])));

                this.yAxis = this.g.append("g")
                    .attr("text-anchor", "middle");

                this.yTick = this.yAxis
                    .selectAll("g")
                    .data(this.y.ticks(5).slice(1))
                    .enter().append("g");

                this.yTick.append("circle")
                    .attr("fill", "none")
                    .attr("stroke", "gray")
                    .attr("stroke-dasharray", "4,4")
                    .attr("r", this.y);

                this.yTick.append("text")
                    .attr("y", (d) => {
                        return -this.y(d);
                    })
                    .attr("dy", "-0.35em")
                    .attr("x", () => {
                        return -10;
                    })
                    .text(d => this.y.tickFormat(5, "s")(d) + '%')
                    .style("font-size", 14);

                return this.svg.node();
            },
            add_legend() {
                let divBoxLegend = this.legend.node().getBoundingClientRect();
                let w = divBoxLegend.width;
                let h = divBoxLegend.height;
                const scaling_factor = h / 300;
                this.legend.selectAll("*").remove();

                this.svg_legend = this.legend.append("svg")
                    .attr("width", w)
                    .attr("height", h);

                this.g_legend = this.svg_legend.append("g")
                    .selectAll("g")
                    .data(["0-4", "4-8", "8-12", "12-16", "16-20", "20-24", "24-28", "28+"])
                    .enter().append("g")
                    .attr("transform", (d, i) => {
                        return "translate(" + 0 + "," + ((((i - (8 - 1) / 2) * (20)) + h / 3) * scaling_factor) + ")";
                    });

                this.g_legend.append("rect")
                    .attr("width", 18 * scaling_factor)
                    .attr("height", 18 * scaling_factor)
                    .attr("dy", "100em")
                    .attr("fill", this.z);

                this.g_legend.append("text")
                    .attr("x", 24 * scaling_factor)
                    .attr("y", 9 * scaling_factor)
                    .attr("dy", "0.35em")
                    .text((d) => {
                        return d + " m/s";
                    })
                    .style("font-size", 10 * scaling_factor);
            },
            convertData(raw_data) {
                const wind_values = [
                    ['angle', '0-4', '4-8', '8-12', '12-16', '16-20', '20-24', '24-28', '28+'],
                    ['N', 0, 0, 0, 0, 0, 0, 0, 0],   // 1
                    ['NNO', 0, 0, 0, 0, 0, 0, 0, 0], // 2
                    ['NO', 0, 0, 0, 0, 0, 0, 0, 0],  // 3
                    ['ONO', 0, 0, 0, 0, 0, 0, 0, 0], // 4
                    ['O', 0, 0, 0, 0, 0, 0, 0, 0],   // 5
                    ['OZO', 0, 0, 0, 0, 0, 0, 0, 0], // 6
                    ['ZO', 0, 0, 0, 0, 0, 0, 0, 0],  // 7
                    ['ZZO', 0, 0, 0, 0, 0, 0, 0, 0], // 8
                    ['Z', 0, 0, 0, 0, 0, 0, 0, 0],   // 9
                    ['ZZW', 0, 0, 0, 0, 0, 0, 0, 0], // 10
                    ['ZW', 0, 0, 0, 0, 0, 0, 0, 0],  // 11
                    ['WZW', 0, 0, 0, 0, 0, 0, 0, 0], // 12
                    ['W', 0, 0, 0, 0, 0, 0, 0, 0],   // 13
                    ['WNW', 0, 0, 0, 0, 0, 0, 0, 0], // 14
                    ['NW', 0, 0, 0, 0, 0, 0, 0, 0],  // 15
                    ['NNW', 0, 0, 0, 0, 0, 0, 0, 0], // 16
                ];
                const amountOfValues = raw_data.length;
                raw_data.forEach(element => wind_values[this.convertDegreeIntoAngle(element.windDirection)][this.convertWindSpeedIntoIndex(element.windSpeed)] += 1.0 / amountOfValues * 100);
                let csv_str = "";
                wind_values.forEach(row => csv_str = csv_str.concat(row.toString(), '\n'));
                return csv_str;
            },
            convertDegreeIntoAngle(degree) {
                // 360 degrees are divided into 16 'buckets'
                // N: (-11.25, 11.25)
                let index = Math.floor((parseFloat(degree) + 11.25) / 22.5) % 16;
                return index + 1;
            },
            convertWindSpeedIntoIndex(windSpeed) {
                const index = Math.min(Math.floor(windSpeed / 4), 7);
                return index + 1;
            },
            getHeighestPercentage(wind_values) {
                let heighestPercentage = 0;
                for (let key in wind_values) {
                    if (Math.max(wind_values[key]) > heighestPercentage)
                        heighestPercentage = Math.max(wind_values[key]);
                }
            }
        }
    }
</script>

<style scoped>
    body {
        font-family: CircularStd, serif;
    }
</style>
