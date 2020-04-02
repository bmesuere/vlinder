<template>
    <div id="line-chart"></div>
</template>

<script>
    import VisualizationMixin from "../mixins/VisualizationMixin";
    import vlinderService from "../services/vlinderService";
    import * as d3 from 'd3'

    export default {
        name: "LineChartVisualization",
        props: {
            "width": Number,
            "height": Number,
            "xAxisLabel": String,
            "yAxisLabel": String,
            "xAxis": String,
            "yAxis": String,
            "enableArea": {
                type: Boolean,
                default: false
            },
            "selectedStations": Array,
            "colors": {
                type: Array,
                default: () => ['#5DBE55', '#926DA5', '#2B92BE']
            },
        },
        mixins: [
            VisualizationMixin
        ],
        mounted() {
            let start = new Date();
            start.setDate(start.getDate() - 7);
            let end = new Date();
            end.setDate(end.getDate() - 6);
            Promise.all(
                this.selectedStations.map((station_id) => vlinderService.getVlinderDataPromise(station_id, start, end))
            ).then(this.handle_data)
                .catch(error => console.log(error));
        },
        methods: {
            handle_data(files) {
                files = files.map(x => x.data);
                let data = files.flat(1);

                const padding = {top: 20, left: 40, right: 40, bottom: 50};

                const xScale = d3.scaleTime()
                    .domain(d3.extent(data, d => new Date(d.time)))
                    .range([padding.left, this.width - padding.right]);

                const yScale = d3.scaleLinear()
                    .domain([0, d3.max(data, d => d.rainVolume)])
                    .range([this.height - padding.bottom, padding.top]);

                const xAxis = d3.axisBottom()
                    .scale(xScale)
                    .ticks(24)
                    .tickFormat(d3.timeFormat("%H:%M"));

                const yAxis = d3.axisLeft()
                    .scale(yScale)
                    .ticks(10);

                const line = d3
                    .line()
                    .x(d => xScale(new Date(d.time)))
                    .y(d => yScale(d.rainVolume));


                //files.sort(function (a, b) {
                //        let sum_a = d3.sum(a, d => d.rainVolume);
                //        let sum_b = d3.sum(b, d => d.rainVolume);
                //        return d3.descending(sum_a, sum_b);
                //    }
                //);

                let svg = d3.select("#line-chart")
                    .append("svg", 0)
                    .attr("width", this.width)
                    .attr("height", this.height);

                let groups = svg.selectAll("g")
                    .data(files)
                    .enter()
                    .append("g");

                groups
                    .append("path")
                    .attr("stroke", (d, i) => this.colors[i])
                    .attr("fill", "white")
                    .attr("fill-opacity", 0)
                    .attr("stroke-width", 3)
                    .attr("d", line)
                    .append("path");

                // add an area under the chart if it's alone.
                if (this.enableArea){
                    const area = d3.area()
                        .x(d => xScale(new Date(d.time)))
                        .y0(this.height - padding.bottom)
                        .y1(d => yScale(d.rainVolume));

                    groups
                        .append("path")
                        .attr("fill", (d, i) => this.colors[i])
                        .attr("fill-opacity", 0.6)
                        .attr("d", area);

                }

                svg.append("g")
                    .attr("class", "x axis")
                    .attr("transform", `translate(0, ${this.height - padding.bottom})`)
                    .attr("stroke-width", 1)
                    .call(xAxis)
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", "rotate(-45)");


                svg.append("g")
                    .attr("class", "y axis")
                    .attr("transform", `translate(${padding.left}, 0)`)
                    .attr("stroke-this.width", 1)
                    .call(yAxis);

                svg.select(".y.axis")
                    .append("text")
                    .text(this.yAxisLabel)
                    .style("text-anchor", "end")
                    .attr("dx", -padding.top)
                    .attr("dy", "1em")
                    .attr("transform", "rotate(-90)")
                    .attr("fill", "black");

            }
        }
    }
</script>

<style scoped>

</style>