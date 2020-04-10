<template>
    <div id="d3-viz-area" style="width:auto">
        <div id="area-svg" style="width:auto"/>
    </div>
</template>


<script>
import VisualizationMixin from "../mixins/VisualizationMixin";
    import vlinderService from "../services/vlinderService";
    import * as d3 from 'd3'

    export default {
        name: "AreaStation",
                mixins: [
            VisualizationMixin
        ],
        props: {
            // Declare properties where a parent component can bind information to
            selectedStations: Array,
        },
        mounted() {
            // This is code is ran on creation of the component
            let stationsDiv = d3.select('#stations');
            vlinderService.getStations().then(d => stationsDiv.html(d.data[0]['name']));
        },

        watch: {
            latestVlinderData() {
                // This code is ran when there is new latestVlinderData
                let vlinderDiv = d3.select('#latest-vlinder');
                vlinderDiv.html(this.latestVlinderData[0]['temp'])
            },
            async selectedStations() {

                let promises = []
                let datas = []

                promises.push(
                    vlinderService.getStations().then(d => datas.push(d.data)));

                await Promise.all(promises);
                this.createPlot(datas);

            }
        },


        methods: {

            /**
             * Create a plot based on the given data
             */
            createPlot(data) {
                const filteredData = data[0].filter(d=>d['id']===this.selectedStations[0]['value']);
                const landUse = filteredData[0]["landUse"];
                const padding = {top: 20, left: 45, right: 40, bottom: 55};
                const width = window.innerWidth * 0.7;
                const height = window.innerHeight * 0.5;

                d3.select('#area-svg').selectAll("svg").remove();
                const graph = d3.select('#area-svg')
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("preserveAspectRatio", "xMinYMin meet");

                this.xLabels = ["0", "20", "50", "100", "250"];

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

                const yAxis = d3.axisLeft()
                    .scale(this.yScale)
                    .ticks(10);

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

                // todo fout in scale + synchr.
                let bars = graph
                    .selectAll("rect")
                    .data(landUse)
                    .enter()
                    .append("g")
                    .classed('rect', true);

                bars.append("rect")
                    .attr("x", (d, i) => padding.left + i*width/(this.xLabels.length+1) + 0.1 * width/this.xLabels.length)
                    .attr("y", padding.top)
                    .attr("width", width/(this.xLabels.length+1)*0.8)
                    .attr("height", 50)// + (d['usage'][0]['value']))//d=>d['value']*20 + 50)
                    .attr("fill", "lightskyblue");

                bars.append("rect")
                    .attr("x", (d, i) => padding.left + i*width/(this.xLabels.length+1) + 0.1 * width/this.xLabels.length)
                    .attr("y", padding.top + 50)
                    .attr("width", width/(this.xLabels.length+1)*0.8)
                    .attr("height", d => this.yScale((d['usage'][1]['value'])))
                    .attr("fill", "limegreen");

                bars.append("rect")
                    .attr("x", (d, i) => padding.left + i*width/(this.xLabels.length+1) + 0.1 * width/this.xLabels.length)
                    .attr("y", d => padding.top + 50 + this.yScale(d['usage'][1]['value']))
                    .attr("width", width/(this.xLabels.length+1)*0.8)
                    .attr("height", d => height - padding.bottom - padding.top - 50 - this.yScale(d['usage'][1]['value']))
                    .attr("fill", "saddlebrown");

                return graph.node();
            }
        }


    }
</script>

<style >

</style>