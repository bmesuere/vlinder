<template>
    <div :id="id" ></div>
</template>

<script>
    import VisualizationMixin from "../mixins/VisualizationMixin";
    //import vlinderService from "../services/vlinderService";
    import * as d3 from 'd3'
    import {generate_fake_data, uuidv4} from "../utils";

    export default {
        name: "LineChartVisualization",
        data: function () {
            return {id: "id" + uuidv4()}
        },
        props: {
            "width": Number,
            "height": Number,
            "yAxisLabel": String,
            "yAxisGetter": Function,
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
            // start date to query
            let start = new Date();
            start.setDate(start.getDate() - 1);
            // end date to query
            let end = new Date();
            end.setDate(end.getDate());

            // setup everything
            this.padding = {top: 20, left: 40, right: 40, bottom: 50};
            this.xScale = d3.scaleTime()
                .range([this.padding.left, this.width - this.padding.right]);

            this.yScale = d3.scaleLinear()
                .range([this.height - this.padding.bottom, this.padding.top]);

            this.xAxis = d3.axisBottom()
                .scale(this.xScale)
                .ticks(24)
                .tickFormat(d3.timeFormat("%H:%M"));

            this.yAxis = d3.axisLeft()
                .scale(this.yScale)
                .ticks(10);

            this.line = d3
                .line()
                .x(d => this.xScale(new Date(d.time)))
                .y(d => this.yScale(this.yAxisGetter(d)));

            this.area = d3.area()
                .x(d => this.xScale(new Date(d.time)))
                .y0(this.height - this.padding.bottom)
                .y1(d => this.yScale(this.yAxisGetter(d)));

            this.svg = d3.select("#" + this.id)
                .append("svg", 0)
                .attr("width", this.width)
                .attr("height", this.height);

            this.xAxisGroup = this.svg.append("g")
                .attr("class", "x axis")
                .attr("transform", `translate(0, ${this.height - this.padding.bottom})`)
                .attr("stroke-width", 1);

            this.yAxisGroup = this.svg.append("g")
                .attr("class", "y axis")
                .attr("transform", `translate(${this.padding.left}, 0)`)
                .attr("stroke-this.width", 1);

            this.svg.select(".y.axis")
                .append("text")
                .text(this.yAxisLabel)
                .style("text-anchor", "end")
                .attr("dx", -this.padding.top)
                .attr("dy", "1em")
                .attr("transform", "rotate(-90)")
                .attr("fill", "black");


            // fake data
            this.fake_data = generate_fake_data(24 * 12, start);
            this.update_data(
                [{"data": this.fake_data}]
            );

            setInterval(() => {
                let last_element = this.fake_data[this.fake_data.length - 1];
                let new_elements = generate_fake_data(1, last_element.time, last_element.pressure, last_element.rainVolume);
                this.fake_data.push(...new_elements);
                this.fake_data.shift();
                this.update_data([{"data": this.fake_data}]);
            }, 100)

            // real data
            //Promise.all(
            //    this.selectedStations.map(
            //        (station_id) => vlinderService.getVlinderDataPromise(station_id, start, end)
            //    )
            //).then(this.update_data)
            //    .catch(error => console.log(error));
        },
        methods: {
            update_data(data) {

                data = data.map(x => x.data);
                let flattened_data = data.flat(1);

                // update scales
                this.xScale.domain(d3.extent(flattened_data, d => new Date(d.time)));
                let [min, max] = d3.extent(flattened_data, this.yAxisGetter);
                this.yScale.domain([min, min === max ? min + 1 : max]);

                let groups = this.svg.selectAll("g.data").data(data);

                // delete all children
                groups.selectAll("*").remove();

                let entered = groups.enter().append("g").attr("class", "data").merge(groups);
                entered
                    .append("path")
                    .attr("stroke", (d, i) => this.colors[i])
                    .attr("fill", "white")
                    .attr("fill-opacity", 0)
                    .attr("stroke-width", 3)
                    .attr("d", this.line);

                // add an area under the chart if it's alone.
                if (this.enableArea) {
                    entered
                        .append("path")
                        .attr("fill", (d, i) => this.colors[i])
                        .attr("fill-opacity", 0.6)
                        .attr("d", this.area);
                }

                this.xAxisGroup.call(this.xAxis)
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", "rotate(-45)");

                this.yAxisGroup.call(this.yAxis);
            }
        }
    }
</script>

<style scoped>

</style>