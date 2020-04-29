<template>
    <div id="d3-viz-area" style="height: 100%; width: 100%">
    </div>
</template>


<script>
    import VisualizationMixin from "../mixins/VisualizationMixin";
    import * as d3 from 'd3'

    export default {
        name: "AreaStation",
        mixins: [
            VisualizationMixin
        ],
        props: {
            selectedStations: Array
        },
        watch: {
            selectedStations() {
                this.createPlot();
            }
        },


        methods: {
            /**
             * Create a plot based on the given data
             */
            createPlot() {
                // Computer property from mixin
                let data = this.stations;

                let div = d3.select('#d3-viz-area');
                const filteredData = data.filter(d => d['id'] === this.selectedStations[0]['value']);
                const landUse = filteredData[0]["landUse"];
                const padding = {top: 20, left: 45, right: 40, bottom: 25};

                const width = div.node().getBoundingClientRect()['width'];
                const height = div.node().getBoundingClientRect()['height'];

                d3.select('#d3-viz-area').html('');
                const graph = d3.select('#d3-viz-area')
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height);

                this.xLabels = ["0", "20", "50", "100", "250", "500"];

                //create x scale and axis
                this.xScale = d3.scaleLinear()
                    .domain([0, landUse.length + 1])
                    .range([padding.left, width - padding.right]);

                const xAxis = d3.axisBottom()
                    .scale(this.xScale)
                    .ticks(5)
                    .tickFormat(d => this.xLabels[d]);

                // create y scale and axis
                this.yScale = d3.scaleLinear()
                    .domain([0, 1])
                    .range([height - padding.bottom, padding.top]);

                this.dataScale = d3.scaleLinear()
                    .domain([0, 1])
                    .range([0, height- padding.bottom - padding.top]);

                const yAxis = d3.axisLeft()
                    .scale(this.yScale)
                    .ticks(5);

                // add axes to plot
                graph.append("g")
                    .attr("class", "x axis")
                    .attr("transform", `translate(0, ${height - padding.bottom})`)
                    .call(xAxis)
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", "rotate(-45)");

                graph.append("g")
                    .attr("class", "y axis")
                    .attr("transform", `translate(${padding.left}, 0)`)
                    .call(yAxis);

                this.showLabel = function(element, value, type){{
                        d3.select(element).attr("stroke", "black");
                        graph
                            .append("svg:title")
                            .text(Math.round(100*value)+ '% ' + type) // todo afrondingsfouten waardoor som niet altijd 100 is
                    }
                }

                let bars = graph
                    .selectAll("rect")
                    .data(landUse)
                    .enter()
                    .append("g")
                    .classed('rect', true);

                bars.append("rect")
                    .attr("x", (d, i) => this.xScale(i + 0.6))
                    .attr("y", padding.top)
                    .attr("width", width / (this.xLabels.length + 1) * 0.8)
                    .attr("height", d => this.dataScale(d['usage'][0]['value']))
                    .attr("fill", "lightskyblue")
                    .on("mouseover", function (d) {
                        d3.select(this)
                            .attr("stroke", "black");
                        graph
                            .append("svg:title")
                            .text((100*d['usage'][0]['value']).toFixed(2)+ '% water')
                    })
                    .on("mouseout", function () {
                        d3.select(this).attr("stroke", "none");
                        graph.selectAll("title").remove();
                    });

                bars.append("rect")
                    .attr("x", (d, i) => this.xScale(i + 0.6))
                    .attr("y", d => padding.top + this.dataScale(d['usage'][0]['value']))
                    .attr("width", width / (this.xLabels.length + 1) * 0.8)
                    .attr("height", d => this.dataScale((d['usage'][1]['value'])))
                    .attr("fill", "limegreen")
                    .on("mouseover", function (d) {
                        d3.select(this)
                            .attr("stroke", "black");
                        graph
                            .append("svg:title")
                            .text((100*d['usage'][1]['value']).toFixed(2)+ '% groen')
                    })
                    .on("mouseout", function () {
                        d3.select(this).attr("stroke", "none");
                        graph.selectAll("title").remove();
                    })
                ;

                bars.append("rect")
                    .attr("x", (d, i) => this.xScale(i + 0.6))
                    .attr("y", d => padding.top + this.dataScale(d['usage'][0]['value']) + this.dataScale(d['usage'][1]['value']))
                    .attr("width", width / (this.xLabels.length + 1) * 0.8)
                    .attr("height", d => this.dataScale(d['usage'][2]['value']))
                    .attr("fill", "saddlebrown")
                    .on("mouseover", function (d) {
                        d3.select(this)
                            .attr("stroke", "black");
                        graph
                            .append("svg:title")
                            .text((100*d['usage'][2]['value']).toFixed(2)+ '% asfalt')
                    })
                    .on("mouseout", function () {
                        d3.select(this).attr("stroke", "none");
                        graph.selectAll("title").remove();
                    })
                ;

                return graph.node();
            }
        }


    }
</script>

<style>

</style>