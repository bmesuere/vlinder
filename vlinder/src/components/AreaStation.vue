<template>
    <div id="d3-viz-area" style="height: 100%; width: 100%">
    </div>
</template>


<script>
    import VisualizationMixin from "../mixins/VisualizationMixin";
    import ResizeObserver from 'resize-observer-polyfill';
    import * as d3 from 'd3'

    export default {
        name: "AreaStation",
        mixins: [
            VisualizationMixin
        ],
        watch: {
            focusedVlinderData() {
                this.update_data()
            }
        },

        mounted() {
            this.div = d3.select('#d3-viz-area');
            let observer = new ResizeObserver(this.create_area_chart);
            observer.observe(this.div.node());

            this.create_area_chart();
        },


        methods: {
            create_area_chart() {

                let divBox = this.div.node().getBoundingClientRect();
                this.width = Math.max(divBox.width, 100);
                this.height = Math.max(divBox.height, 100);

                this.div.selectAll("*").remove();

                this.svg = this.div.append("svg", 0)
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
                    .range([0, this.height - this.padding.bottom - this.padding.top]);

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
                    .on("mouseover", () => {this.info_box.raise();
                                            this.info_box.style("display", null)})
                    .on("mouseout", () => {this.info_box.style("display", "none")})
                    .attr("fill", "black");

                this.xAxisGroup.call(this.xAxis)
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", "rotate(-45)");

                this.yAxisGroup.call(this.yAxis);


            // infobox
            this.info_box = this.svg
                .append("g")
                .attr('y', this.height/2-20)
                .attr('x', this.width/2-50)
                .style('display', 'none');
            this.info_box.append("rect")
                .attr("class", "legend-background")
                .attr("fill", "#d3d3d3")
                .attr("opacity", 0.9)
                .attr("rx", '3')
                .attr("ry", '3')
                .attr('stroke', 'black');
            // add text
            this.info_box.append("text")
                .text(" Weergave van de omgeving rond het weerstation. ")
                .style("font-size", "11px")
                .attr('height', 10)
                .attr('width', 100)
                .attr('y', this.height/2-13)
                .attr('x', this.width/2-115);
            this.info_box.append("text")
                .text(" Op de x-as straal waarin gekeken wordt. De hoogte ")
                .style("font-size", "11px")
                .attr('height', 10)
                .attr('width', 100)
                .attr('y', this.height/2-3)
                .attr('x', this.width/2-115);
            this.info_box.append("text")
                .text(" van de rechthoek geeft weer hoeveel procent ervan ")
                .style("font-size", "11px")
                .attr('height', 10)
                .attr('width', 100)
                .attr('y', this.height/2+7)
                .attr('x', this.width/2-115);
            this.info_box.append("text")
                .text(" water, groen of verhard is. ")
                .style("font-size", "11px")
                .attr('height', 10)
                .attr('width', 100)
                .attr('y', this.height/2+17)
                .attr('x', this.width/2-115);
            // resize background box
            this.info_box.select("rect")
                .attr("x", this.info_box.node().getBBox().x-5)
                .attr("y", this.info_box.node().getBBox().y-3)
                .attr("width", this.info_box.node().getBBox().width+10)
                .attr("height", this.info_box.node().getBBox().height+7);


            this.update_data()


            },
            update_data() {
                this.svg.selectAll("rect.bar").remove();

                if (this.selectedStations === undefined
                    || this.selectedStations.length === 0
                    || this.stations === undefined
                    || this.stations.length === 0) {
                    return;
                }
                const landUse = this.selectedStations[0]["landUse"];

                let showLabel = function (element, value, type) {
                    d3.select(element).attr("stroke", "black");
                    d3.select('#d3-viz-area')
                        .select('svg')
                        .append("svg:title")
                        .text((100 * value).toFixed(2) + '% ' + type)
                };

                let removeLabel = function (element) {
                    d3.select(element).attr("stroke", "none");
                    d3.select('#d3-viz-area')
                        .select('svg').selectAll("title").remove();
                };

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

                return this.svg.node();
            },
        }
    }
</script>

<style>

</style>