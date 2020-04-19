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
            selectedStations: Array,
        },
        watch: {
            focusedVlinderData(){
                this.update_data()
            }
        },

        mounted() {
            let div = d3.select('#d3-viz-area');

            this.width = div.node().getBoundingClientRect()['width'];
            this.height = div.node().getBoundingClientRect()['height'];

            this.svg = div.append("svg", 0)
                .attr("width", this.width)
                .attr("height", this.height);

            // setup everything
            this.xLabels = ["0m", "20m", "50m", "100m", "250m", "500m"];
            this.padding = {top: 20, left: 45, right: 20, bottom: 30};

            this.xScale = d3.scaleLinear()
                .domain([0, this.xLabels.length])
                .range([this.padding.left, this.width - this.padding.right]);

            this.yScale = d3.scaleLinear()
                .domain([0, 1])
                .range([this.height - this.padding.bottom, this.padding.top]);

            this.dataScale = d3.scaleLinear()
                    .domain([0, 1])
                    .range([0, this.height- this.padding.bottom - this.padding.top]);

            this.xAxis = d3.axisBottom()
                .scale(this.xScale)
                .ticks(5)
                .tickFormat(d => this.xLabels[d]);

            this.yAxis = d3.axisLeft()
                .scale(this.yScale)
                .ticks(5);

            this.xAxisGroup = this.svg.append("g")
                .attr("class", "x axis")
                .attr("transform", `translate(0, ${this.height - this.padding.bottom})`);

            this.yAxisGroup = this.svg.append("g")
                .attr("class", "y axis")
                .attr("transform", `translate(${this.padding.left}, 0)`);

            this.svg.select(".y.axis")
                .append("text")
                .text('Landgebruik')
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

        },

        methods: {
            update_data() {
                this.svg.selectAll("rect").remove();

                if(this.selectedStations.length===0){
                    return ;
                }

                const filteredData = this.stations.filter(d => d['id'] === this.selectedStations[0]['value']);
                const landUse = filteredData[0]["landUse"];

                let showLabel = function(element, value, type){
                        d3.select(element).attr("stroke", "black");
                        d3.select('#d3-viz-area')
                            .select('svg')
                            .append("svg:title")
                            .text((100*value).toFixed(2)+ '% ' + type)
                }

                let removeLabel = function(element){
                    d3.select(element).attr("stroke", "none");
                    d3.select('#d3-viz-area')
                            .select('svg').selectAll("title").remove();
                }

                let bars = this.svg
                    .selectAll("rect")
                    .data(landUse)
                    .enter()
                    .append("g")
                    .classed('rect', true);

                const colors = ['lightskyblue', 'limegreen', 'saddlebrown'];
                const types = ['water', 'groen', 'verhard'];
                for(let k = 0; k < landUse[0]['usage'].length; k++){
                    bars.append("rect")
                    .attr("x", (d, i) => this.xScale(i + 0.6))
                    .attr("y", (d) => {
                        let y = this.padding.top;
                        for(let j = 0; j< k; j++){
                            y+=this.dataScale(d['usage'][j]['value'])}
                        return y;
                    })
                    .attr("width", this.width / (this.xLabels.length + 1) * 0.8)
                    .attr("height", d => this.dataScale(d['usage'][k]['value']))
                    .attr("fill", colors[k])
                    .on("mouseover", function (d) { showLabel(this, d['usage'][k]['value'], types[k]); })
                    .on("mouseout", function () { removeLabel(this); })
                ;
                }
                return this.svg.node();
            },

        }


    }
</script>

<style>

</style>