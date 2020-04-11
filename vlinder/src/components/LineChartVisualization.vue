<template>
    <div :id="id" style="display: inline-block"></div>
</template>

<script>
    import VisualizationMixin from "../mixins/VisualizationMixin";
    //import vlinderService from "../services/vlinderService";
    import * as d3 from 'd3'
    import {uuidv4} from "../utils";

    export default {
        name: "LineChartVisualization",
        data: function () {
            return {
                id: "id" + uuidv4(),
                width: 0,
                height: 0
            }
        },
        props: {
            "yAxisLabel": String,
            "yAxisGetter": Function,
            "lineStrokeWidth": {
                type: Number,
                default: 3
            },
            //"selectedStation": String,
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
            let div = d3.select("#" + this.id);

            this.width = div.node().getBoundingClientRect()['width'];
            this.height = div.node().getBoundingClientRect()['height'];

            this.svg = div.append("svg", 0)
                .attr("width", this.width)
                .attr("height", this.height);

            // start date to query
            this.start = new Date();
            this.start.setDate(this.start.getDate() - 1);
            // end date to query
            this.end = new Date();
            this.end.setDate(this.end.getDate());

            // setup everything
            this.padding = {top: 20, left: 40, right: 20, bottom: 50};
            this.xScale = d3.scaleTime()
                .range([this.padding.left + this.lineStrokeWidth / 2, this.width - this.padding.right]);

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

            this.zoom = d3.zoom()
                .translateExtent([[this.padding.left, this.padding.top], [this.width - this.padding.right - this.padding.left, this.height - this.padding.bottom - this.padding.top]])
                .scaleExtent([1, Infinity])  // This control how much you can unzoom (x0.5) and zoom (x20)
                .extent([[this.padding.left, this.padding.top], [this.width - this.padding.left - this.padding.right, this.height - this.padding.top - this.padding.bottom]])
                .on("zoom", this.updateChart);

            this.clip = this.svg.append("defs").append("SVG:clipPath")
                .attr("id", "clip")
                .append("rect")
                .attr("width", this.width - this.padding.right - this.padding.left)
                .attr("height", this.height - this.padding.bottom - this.padding.top)
                .attr("x", this.padding.left)
                .attr("y", this.padding.top);

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

            this.xAxisGroup.call(this.xAxis)
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-45)");

            this.yAxisGroup.call(this.yAxis);
            this.pathGroup = this.svg.append("g");

            this.svg.append("rect")
                .attr("width", this.width - this.padding.left - this.padding.right)
                .attr("height", this.height - this.padding.top - this.padding.bottom)
                .style("fill", "none")
                .style("pointer-events", "all")
                .attr('transform', 'translate(' + this.padding.left + ',' + this.padding.top + ')')
                .call(this.zoom);

        },
        watch: {
            selectedStations() {
                // This code is ran when selected station is changed => selectedStation is a variable bound on creation
                // of this component in Dashboard
                /*
                Promise.all(
                    this.selectedStations.map(
                        station => vlinderService.getVlinderData(station.value, this.start, this.end)
                    )
                )
                    .then(this.update_data)
                    .catch(console.log);
                 */
            },
            focusedVlinderData() {
                this.update_data([this.focusedVlinderData])
            }
        },
        methods: {
            update_data(data) {
                //data = data.map(x => x.data);
                let flattened_data = data.flat(1);

                // update scales
                this.xScale.domain([this.start, this.end]);
                let [min, max] = d3.extent(flattened_data, this.yAxisGetter);
                this.yScale.domain([min, min === max ? min + 1 : max]);

                this.xAxisGroup.call(this.xAxis)
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", "rotate(-45)");

                this.yAxisGroup.call(this.yAxis);
                //let groups = this.pathGroup.selectAll("g.data").data(data);

                this.selected = this.pathGroup
                    .selectAll("path")
                    .data(data);

                this.data = this.selected
                    .enter()
                    .append("path")
                    .merge(this.selected);

                this.paths = this.data
                    .attr("clip-path", "url(#clip)")
                    .attr("stroke", (d, i) => this.colors[i])
                    .attr("fill", "white")
                    .attr("fill-opacity", 0)
                    .attr("stroke-width", this.lineStrokeWidth)
                    .attr("d", this.line);

                this.selected.exit()
                    //.transition()
                    //     .duration(1000)
                    //    .ease(d3.easeLinear)
                    .remove();

                // delete all children
                //groups.selectAll("*").remove();

                //let entered = groups
                //    .enter()
                //    .append("g")
                //    .attr("class", "data")
                //    .attr("clip-path", "url(#clip)")
                //    .merge(groups);

                //this.path = entered
                //    .append("path")
                //    .attr("stroke", (d, i) => this.colors[i])
                //    .attr("fill", "white")
                //    .attr("fill-opacity", 0)
                //    .attr("stroke-width", this.lineStrokeWidth)
                //    .attr("d", this.line);

                //groups.exit().transition().remove();

            },
            updateChart() {

                // recover the new scale
                var newX = d3.event.transform.rescaleX(this.xScale);
                //var newY = d3.event.transform.rescaleY(this.yScale);

                this.xAxis.scale(newX);
                //let xAxis = d3.axisBottom()
                //    .scale(newX)
                //    .ticks(12)
                //    .tickFormat(d3.timeFormat("%H:%M"));

                // update axes with these new boundaries
                this.xAxisGroup.call(this.xAxis)

                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", "rotate(-45)");

                this.line = d3
                    .line()
                    .x(d => newX(new Date(d.time)))
                    .y(d => this.yScale(this.yAxisGetter(d)));
                this.paths.attr("d", this.line);
                //if (this.path)
                //    this.path.attr("d", this.line);
            }


        }
    }
</script>

<style scoped>

</style>