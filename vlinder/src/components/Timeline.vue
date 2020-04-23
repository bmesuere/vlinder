<template>
    <div id="timeline-div"/>
</template>

<script>
    import VisualizationMixin from "../mixins/VisualizationMixin";
    import * as d3 from "d3";

    export default {
        name: "Timeline",
        mixins: [VisualizationMixin],
        props: {
            datas: Array,
            selectedStations: Array
        },
        async mounted() {
            let div = d3.select("#timeline-div")
            this.graph = d3
                .select("#timeline-div").append("svg").attr("id", "timeline-svg");

            this.xaxis = this.graph
                .append("g")
                .attr("id", "timeline-x-axis");

            this.yaxis = this.graph
                .append("g")
                .attr("id", "timeline-y-axis");

            this.bars = {width: 2, height: 40, h_padding: 1, v_padding: 1};
            this.padding = {left: 70, right: 50, top: 50, bottom: 0}

            this.width = 288 * this.bars.width;

            this.ticks = 10;


            this.xScale = d3
                        .scaleTime()
                        .range([this.padding.left + 3, this.width + this.padding.left - this.padding.right])
            this.xScale.ticks(d3.timeMinute, 5);

            this.yScale = d3
                        .scaleLinear()

            this.transitionLength = 500;
        },
        watch: {
            datas() {
                this.updateData();
            }
        },
        methods: {
                updateData() {
                    let selectedIds = [];
                    let selectedNames = [];
                    for (let station of this.selectedStations) {
                        selectedIds.push(station.value);
                        selectedNames.push(station.text);
                    }
                    this.construct_graph(this.datas, selectedIds, selectedNames);
                },

                construct_graph(datas, selectedStations, selectedNames) {
                    const height = (selectedStations.length + 1) * this.bars.height;

                    this.updateXScale(datas)
                    this.updateYScale(selectedStations, height)

                    this.rescaleViewBox(height)
                    this.constructAxes(selectedNames, height);

                    let status_bars = this.graph.selectAll("rect").data(datas);
                    
                    status_bars.exit()
                        .transition()
                        .duration(this.transitionLength)
                        .attr("height", 0)
                        .attr("y", this.padding.top)
                        .remove();

                    status_bars.enter()
                        .append("rect")
                        .attr("x", d => this.xScale(new Date(d.time)))
                        .attr("y", d => this.yScale(selectedStations.indexOf(d.id)))
                        .attr("width", (this.bars.width + 1) - this.bars.h_padding)
                        .attr("height", 0)
                        .attr("class", d => "bar " + this.getClass(d))
                        .merge(status_bars)
                        .on("mouseover", d => this.handleMouseOver(
                                            d,
                                            this.xScale(new Date(d.time)),
                                            this.yScale(selectedStations.indexOf(d.id)),
                                            selectedNames[selectedStations.indexOf(d.id)]
                                        )
                            )
                        .on("mouseout", this.handleMouseOut)
                        .transition()
                        .attr("x", d => this.xScale(new Date(d.time)))
                        .attr("y", d => this.yScale(selectedStations.indexOf(d.id)))
                        .attr("width", (this.bars.width + 1) - this.bars.h_padding)
                        .attr("height", this.bars.height - this.bars.v_padding)
                        .attr("class", d => "bar " + this.getClass(d))
                        .duration(this.transitionLength);
                    },

                    rescaleViewBox(height) {     
                        this.graph
                            .transition()
                            .duration(this.transitionLength)
                            .attr(
                                "viewBox",
                                "0 0 " + (this.padding.left + this.padding.right + this.width) + " " + (height + this.padding.top + this.padding.bottom)
                            )
                            .attr("direction", "ltr")
                    },

                    constructAxes(selectedNames, height) {
                        this.constructXAxis(height);
                        this.constructYAxis(selectedNames, height);
                    },

                    constructXAxis(height) {
                        const xAxis = d3.axisBottom() // create status_bars new bottom axis
                            .scale(this.xScale); // that uses the domain of the xScale
                        
                        xAxis.ticks(this.ticks);
                        
                        this.xaxis
                            .transition()
                            .duration(this.transitionLength)
                            .attr("transform", `translate(0, ${this.padding.top + height - this.bars.height})`)
                            .call(xAxis);
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

                        this.xScale.domain([startDate, new Date(endDate.getTime() + 5 * 60000)])

                        return this.xScale;
                    },

                    updateYScale(selectedStations, height) {
                        this.yScale
                            .domain([0, selectedStations.length + 1])
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
                        let g = d3
                            .select("#timeline-div #timeline-svg")
                            .append("g")
                            .attr("id", "temp")
                            .attr("opacity", 0.5);

                        let h = 50;
                        let x = xpos - 60;
                        let y = ypos - this.bars.height + 4;
                        g.append("rect")
                            .attr("x", x - 3)
                            .attr("y", y - 14)
                            .attr("width", 140)
                            .attr("height", h)
                            .attr("fill", "white")
                            .attr("stroke-width", 0.5)
                            .attr("stroke", "black");

                        g.append("text")
                            .attr("x", x + 20)
                            .attr("y", y)
                            .text(name)
                            .attr("font-size", "12px")
                            .attr("font-family", "sans-serif");

                        g.append("circle")
                            .attr("cx", x + 5)
                            .attr("cy", y - 4)
                            .attr("r", 5)
                            .attr("fill", "orange")
                            .attr("class", this.getClass(d));

                        g.append("text")
                            .attr("x", x)
                            .attr("y", y + 15)
                            .text(new Date(d.time).toLocaleString())
                            .attr("font-size", "12px")
                            .attr("font-family", "sans-serif");

                        if (d.status === "missing") {
                            g.append("text")
                                .attr("x", x)
                                .attr("y", y + 30)
                                .text("no data")
                                .attr("font-size", "12px")
                                .attr("font-family", "sans-serif")
                        } else {
                            g.append("text")
                                .attr("x", x)
                                .attr("y", y + 30)
                                .text("🌡 " + d.temp + "°C\t" + "🌧️ " + d.humidity + "%")
                                .attr("font-size", "12px")
                                .attr("font-family", "sans-serif")
                        }

                        g.transition()
                            .attr("opacity", 1)
                            .duration(30)

                    },

                    handleMouseOut() {
                        d3.select("#timeline-div #timeline-svg")
                            .selectAll("#temp")
                            .transition()
                            .attr("opacity", 0)
                            .duration(30)
                            .remove()
                    },

                    getClass(d) {
                        if (d.status === "Ok") return "ok";
                        else if (d.status === "missing") return "missing";
                        else return "niet-ok"
                    }
        }
    };
</script>

<style>

    .status_bars {
        fill: green;
    }

    .test {
        width: 300px;
        height: 146px;
    }

    .lol {
        border: 2px solid black;
        background-color: white;
    }

    .ok {
        fill: green;
    }

    #temp {
        pointer-events: none;
    }

    #stations-selector {
        width: 100px;
    }

    .missing {
        fill: rgb(128, 128, 128);
    }

    .bar.ok:hover {
        fill: lightgreen;
    }

    .bar.missing:hover {
        fill: lightgray
    }

    .dot.ok {
        fill: white;
        stroke: green;
        stroke-width: 4px;
    }

    .dot.ok:hover {
        fill: lightgreen;
    }

    .niet-ok {
        fill: red;
    }

    .dot.niet-ok {
        fill: white;
        stroke: red;
        stroke-width: 4px;
    }

    .dot.niet-ok:hover {
        fill: salmon;
    }

    .bar.niet-ok:hover {
        fill: salmon;
    }

    .dot:hover {
        cursor: pointer;
    }

    .bar:hover {
        cursor: pointer;
    }

    div #timeline-div {
        overflow: auto;
        direction: rtl;
        height: 500px;
        scrollbar-color: #ccdbee #eeeeff; /* thumb and track color */
        scrollbar-width: thin;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    #timeline-svg {
        height: 100%;
        width: 100%;
    }

    div.status {
        display: inline-block;
        width: 20px;
        height: 20px;
        margin: 1px;
        background-color: green;
    }
</style>