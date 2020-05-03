<template>
    <b-container>
        <b-row v-if="this.selectedStations.length > 1">
            <b-tabs>
                <b-tab  v-for="(station, index) in selectedStations" v-bind:key="station.name"
                        v-bind:title="station.name"
                        v-on:click="update_data(index)">
                </b-tab>
            </b-tabs>
        </b-row>
        <b-row style="height: 85%">
            <b-col cols="9" id="d3-viz-area" style="height: 100%; width: 80%"/>
            <b-col cols="3" id="d3-viz-area-legend" style="height: 100%; width: 20%"/>
        </b-row>
    </b-container>
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
            this.legend = d3.select('#d3-viz-area-legend');
            let observer = new ResizeObserver(this.create_area_chart);
            observer.observe(this.div.node());

            this.create_area_chart();
        },
        props: {
            "colors": {
                type: Array,
                default: () => ['#02bbfc', 'rgba(168,255,68,0.93)', 'saddlebrown']
            }
        },

        methods: {
            create_area_chart() {

                let divBox = this.div.node().getBoundingClientRect();
                this.width = divBox.width;
                this.height = divBox.height;

                this.div.selectAll("*").remove();

                this.svg = this.div.append("svg", 0)
                    .attr("width", this.width)
                    .attr("height", this.height);

                this.add_legend();

                // setup everything
                this.xLabels = ["0m", "20m", "50m", "100m", "250m", "500m"];
                this.padding = {top: 20, left: 45, right: 20, bottom: 32};

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
                    .text('Omgeving')
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
            // add text
            this.info_box.append("text")
                .text(" Weergave van de omgeving rond het weerstation. ")
                .style("font-size", "11px")
                .attr('height', 10)
                .attr('width', 100)
                .attr('y', this.height/2-13)
                .attr('x', this.width/2-105);
            this.info_box.append("text")
                .text(" Op de x-as staat de straal waarin gekeken wordt.")
                .style("font-size", "11px")
                .attr('height', 10)
                .attr('width', 100)
                .attr('y', this.height/2-3)
                .attr('x', this.width/2-105);
            this.info_box.append("text")
                .text(" De hoogte van de rechthoek geeft weer hoeveel ")
                .style("font-size", "11px")
                .attr('height', 10)
                .attr('width', 100)
                .attr('y', this.height/2+7)
                .attr('x', this.width/2-105);
            this.info_box.append("text")
                .text(" procent ervan water, groen of verhard is. ")
                .style("font-size", "11px")
                .attr('height', 10)
                .attr('width', 100)
                .attr('y', this.height/2+17)
                .attr('x', this.width/2-105);
            // resize background box

            this.info_box.append("rect")
                //.attr("class", "legend-background")
                .attr("fill", "#d3d3d3")
                .attr("opacity", 0.9)
                .attr("rx", '3')
                .attr("ry", '3')
                .attr('stroke', 'black')
                .attr("x", this.width/2-110)
                .attr("y", this.height/2-25)
                .attr("width", 250)
                .attr("height", 47);
            this.info_box.selectAll('text').raise();


            this.update_data()


            },
            update_data(index=0) {
                this.svg.selectAll("rect.bar").remove();

                if (this.selectedStations === undefined
                    || this.selectedStations.length === 0
                    || this.stations === undefined
                    || this.stations.length === 0) {
                    return;
                }
                const landUse = this.selectedStations[index]["landUse"];

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
                    .attr("fill", this.colors[k])
                    .on("mouseover", function (d) { showLabel(this, d['usage'][k]['value'], types[k]); })
                    .on("mouseout", function () { removeLabel(this); });
                }

                return this.svg.node();
            },

            add_legend(){
                let divBoxLegend = this.legend.node().getBoundingClientRect();
                let w = divBoxLegend.width;
                let h = divBoxLegend.height-20;

                this.padding = {top: 20, left: 45, right: 20, bottom: 30};
                this.legend.selectAll("*").remove();


                this.svg_legend = this.legend.append("svg", 0)
                    .attr("width", this.width)
                    .attr("height", this.height);


                // legend box
                this.legend_box = this.svg_legend
                    .append("g")
                    .attr('y', this.padding.top)
                    .attr('x', this.padding.left)
                    .attr('width', w)
                    .attr('height', h);
                this.legend_box.append("rect")
                    .attr("class", "legend")
                    .attr("fill", "none")
                    .attr("rx", '1')
                    .attr("ry", '1')
                    .attr('stroke', 'black');


                //add colored squares
                this.legend_box.append("rect")
                    .attr('height', 10)
                    .attr('width', 10)
                    .attr('y',h/2-25)
                    .attr('x', w/2-30)
                    .attr("rx", '1')
                    .attr("ry", '1')
                    .attr("fill", this.colors[0] );
                this.legend_box.append("rect")
                    .attr('height', 10)
                    .attr('width', 10)
                    .attr('y',h/2-5)
                    .attr('x', w/2-30)
                    .attr("rx", '1')
                    .attr("ry", '1')
                    .attr("fill", this.colors[1] );
                this.legend_box.append("rect")
                    .attr('height', 10)
                    .attr('width', 10)
                    .attr('y',h/2+15)
                    .attr('x', w/2-30)
                    .attr("rx", '1')
                    .attr("ry", '1')
                    .attr("fill", this.colors[2] );

                // add text
                this.legend_box.append("text")
                    .text(" water")
                    .style("font-size", "11px")
                    .attr('height', 10)
                    .attr('width', 100)
                    .attr('y',h/2-15)
                    .attr('x', w/2-15);
                this.legend_box.append("text")
                    .text(" groen")
                    .style("font-size", "11px")
                    .attr('height', 10)
                    .attr('width', 100)
                    .attr('y',h/2+5)
                    .attr('x', w/2-15);
                this.legend_box.append("text")
                    .text(" verhard")
                    .style("font-size", "11px")
                    .attr('height', 10)
                    .attr('width', 100)
                    .attr('y',h/2+25)
                    .attr('x', w/2-15);

                // resize background box
                this.legend_box.select("rect")
                    .attr("x", this.legend_box.node().getBBox().x - 5)
                    .attr("y", this.legend_box.node().getBBox().y - 3)
                    .attr("width", this.legend_box.node().getBBox().width + 10)
                    .attr("height", this.legend_box.node().getBBox().height + 7);
            }
        }
    }
</script>

<style>

</style>