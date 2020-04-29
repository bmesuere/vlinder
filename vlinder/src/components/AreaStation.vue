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

            // title in zelfde stijl als line charts
            /*this.svg.select(".y.axis")
                .append("text")
                .text('Landgebruik')
                .style("text-anchor", "end")
                .attr("dx", -this.padding.top)
                .attr("dy", "1em")
                .attr("transform", "rotate(-90)")
                .attr("fill", "black"); */

            this.xAxisGroup.call(this.xAxis)
                .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-45)");

            this.yAxisGroup.call(this.yAxis);

            // titel prominenter
            this.svg.append("text")
                .attr("class", 'title')
                .attr("x", (this.width / 2))
                .attr("y", 15)//this.padding.top)
                .attr("text-anchor", "middle")
                .style("font-size", "14px")
                .on("mouseover", () => {this.info_box.raise();
                                        this.info_box.style("display", null)})
                .on("mouseout", () => {this.info_box.style("display", "none")})
                .text("Landgebruik");


            // infobox
            this.info_box = this.svg
                .append("g")
                .attr('y', 20)
                .attr('x', this.width/2-50)
                .style('display', 'none');
            this.info_box.append("rect")
                .attr("class", "legend-background")
                .attr("fill", "#b6b6b6")
                .attr("opacity", 0.8)
                .attr("rx", '3')
                .attr("ry", '3')
                .attr('stroke', 'black');
            this.info_box.append("text")
                .text("** korte uitleg **")
                .style("font-size", "11px")
                .attr('height', 10)
                .attr('width', 100)
                .attr('y', 37)
                .attr('x', this.width/2-35);

            this.info_box.select("rect")
                .attr("x", this.info_box.node().getBBox().x)
                .attr("y", this.info_box.node().getBBox().y)
                .attr("width", this.info_box.node().getBBox().width)
                .attr("height", this.info_box.node().getBBox().height);
        },

        methods: {
            update_data() {
                this.svg.selectAll("rect.bar").remove();

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
                    .selectAll("rect.bar")
                    .data(landUse)
                    .enter()
                    .append("g")
                    .classed('rect', true);

                const colors = ['lightskyblue', 'limegreen', 'saddlebrown'];
                const types = ['water', 'groen', 'verhard'];
                for(let k = 0; k < landUse[0]['usage'].length; k++){
                    bars.append("rect")
                    .attr('class', 'bar')
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

                // update title
                this.svg.selectAll("text.title").remove();
                console.log(filteredData);
                this.svg.append("text")
                    .attr('class', 'title')
                    .attr("x", (this.width / 2))
                    .attr("y", 15)//this.padding.top)
                    .attr("text-anchor", "middle")
                    .style("font-size", "14px")
                    .on("mouseover", () => {this.info_box.raise();
                                            this.info_box.style("display", null)})
                    .on("mouseout", () => {this.info_box.style("display", "none")})
                    .text("Landgebruik - "+ filteredData[0].name);
                return this.svg.node();
            },

        }


    }
</script>

<style>

</style>