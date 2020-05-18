<template>
    <div id="timeline-div"/>
</template>

<script>
    import VisualizationMixin from "../mixins/VisualizationMixin";
    import * as d3 from "d3";
    import Popup from "../d3components/popup"
    import fillMissingData from "../utils/vlinderDataParse";
    import {customFormat} from "../utils";

    export default {
        name: "Timeline",
        mixins: [VisualizationMixin],
        props: {
            datas: Array,
            selection: Array
        },
        async mounted() {
            this.graph = d3
                .select("#timeline-div").append("svg").attr("id", "timeline-svg");

            this.xaxis = this.graph
                .append("g")
                .attr("id", "timeline-x-axis");

            this.yaxis = this.graph
                .append("g")
                .attr("id", "timeline-y-axis");

            this.popup = Popup(this.graph, 1);

            // the h_padding has to be less than the width because this is actually just
            // implemented as a border around the bar, but this off part of the actual bar
            this.bars = {width: 3, height: 40, h_padding: 1.5, v_padding: 1};
            this.padding = {left: 150, right: 50, top: 80, bottom: 70};

            this.width = 288 * this.bars.width;

            this.ticks = 20;


            this.xScale = d3
                .scaleTime()
                .range([this.padding.left + 3, this.width + this.padding.left - this.padding.right]);
            this.xScale.ticks(d3.timeMinute, 5);

            this.yScale = d3
                .scaleLinear();

            this.transitionLength = 500;
        },
        watch: {
            focusedVlinderData() {
                this.updateData(fillMissingData(this.focusedVlinderData));
            }
        },
        methods: {
            updateData(data) {
                let selectedIds = [];
                let selectedNames = [];
                for (let station of this.selection) {
                    selectedIds.push(station.value);
                    selectedNames.push(station.text);
                }
                this.construct_graph(data, selectedIds, selectedNames);
            },

            construct_graph(datas, selection, selectedNames) {
                const height = (selection.length + 1) * this.bars.height;

                this.updateXScale(datas);
                this.updateYScale(selection, height);

                this.rescaleViewBox(height);
                this.constructAxes(selectedNames, height);

                let status_bars = this.graph.selectAll("rect").data(datas);

                status_bars.exit()
                    .transition()
                    .duration(this.transitionLength)
                    .attrs({
                        height: 0,
                        y: this.padding.top
                    })
                    .remove();

                status_bars.enter()
                    .append("rect")
                    .attrs({
                        x: d => this.xScale(new Date(d.time)),
                        y: d => this.yScale(selection.indexOf(d.id)),
                        width: (this.bars.width + 1) - this.bars.h_padding,
                        height: 0,
                        class: "bar",
                        status: d => d.status
                    })
                    .merge(status_bars)
                    .on("mouseover", d => this.handleMouseOver(
                        d,
                        this.xScale(new Date(d.time)),
                        this.yScale(selection.indexOf(d.id)),
                        selectedNames[selection.indexOf(d.id)]
                        )
                    )
                    .on("mouseout", this.handleMouseOut)
                    .transition()
                    .attrs({
                        x: d => this.xScale(new Date(d.time)),
                        y: d => this.yScale(selection.indexOf(d.id)),
                        width: (this.bars.width + 1) - this.bars.h_padding,
                        height: this.bars.height - this.bars.v_padding,
                        class: "bar",
                        status: d => d.status,
                    })
                    .duration(this.transitionLength);
            },

            rescaleViewBox(height) {
                this.graph
                    .transition()
                    .duration(this.transitionLength)
                    .attrs({
                        viewBox: "0 0 " + (this.padding.left + this.padding.right + this.width) + " " + (height + this.padding.top + this.padding.bottom),
                        direction: "ltr"
                    })
            },

            constructAxes(selectedNames, height) {
                this.constructXAxis(height);
                this.constructYAxis(selectedNames, height);
            },

            constructXAxis(height) {
                const xAxis = d3.axisBottom() // create status_bars new bottom axis
                    .tickFormat(customFormat)
                    .scale(this.xScale); // that uses the domain of the xScale

                xAxis.ticks(this.ticks);

                this.xaxis
                    .transition()
                    .duration(this.transitionLength)
                    .attr("transform", `translate(0, ${this.padding.top + height - this.bars.height})`)
                    .call(xAxis)
                    .selectAll("text")
                    .attr("transform", "translate(-15,15)rotate(-45)");
            },

            constructYAxis(selectedNames, height) {
                var name_scale = d3.scaleBand()
                    .domain(selectedNames)         // This is what is written on the Axis: from 0 to 100
                    .range([0, height - this.bars.height]);

                this.yaxis
                    .transition()
                    .duration(this.transitionLength)
                    .attr("transform", `translate(${this.padding.left}, ${this.padding.top})`)
                    .call(d3.axisLeft(name_scale))
                    .selectAll("text")
                    .attr("transform", "translate(-5,-10)rotate(-45)");
            },

            updateXScale(datas) {
                let dates = this.getDateBoundaries(datas);
                let startDate = dates[0];
                let endDate = dates[1];

                this.xScale.domain([startDate, new Date(endDate.getTime() + 5 * 60000)]);

                return this.xScale;
            },

            updateYScale(selection, height) {
                this.yScale
                    .domain([0, selection.length + 1])
                    .range([this.padding.top, height + this.padding.top]);
            },

            getDateBoundaries(datas) {
                if (datas.length > 0) {
                    let dates = [];

                    for (let i = 0; i < datas.length; i++) {
                        dates.push(new Date(datas[i].time))
                    }

                    return [new Date(Math.min.apply(null, dates)), new Date(Math.max.apply(null, dates))];
                } else {
                    return [new Date(), new Date()]
                }
            },

            handleMouseOver(d, xpos, ypos, name) {
                let x = xpos - 120;
                let y = ypos;

                this.popup.set_offset(0, -60);
                this.popup.set_coordinates([x, y]);
                this.popup.set_title(name);
                this.popup.set_status(d.status);

                this.popup.add_lines(d3.timeFormat("%d/%m/%Y, %H:%M")(d.time ? new Date(d.time) : new Date()),
                    d.temp, d.humidity, d.windSpeed, d.windDirection);

                this.popup.display(true);

            },

            handleMouseOut() {
                this.popup.display(false)
            },
        }
    };
</script>

<style scoped>
    @import "../styles/timeline.css";
</style>
