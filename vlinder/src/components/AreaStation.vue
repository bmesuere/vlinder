<template>
    <b-card style="height: 100%">
            <b-row>
                <b-col>
                    <h3>Omgeving</h3>
                </b-col>
                <b-col>
                    <b-button v-b-modal.modal-areastation variant="info" class="float-right">
                        <b-icon icon="info-circle"></b-icon>
                    </b-button>
                    <b-modal id="modal-areastation" hide-footer title="Landgebruik">
                       <p class="my-4">Weergave van hoe de omgeving rond het weerstation eruitziet. Op de x-as staat
                           de straal waarin gekeken wordt. De hoogte van de rechthoek toont hoeveel procent van de
                           ruimte binnen die afstand groen is (park, bos, gras ... ), verhard is (gebouw, parking,
                           weg ... ) of water is. De omgeving omheen het weerstation zal een aanzienlijke invloed
                           hebben op de gemeten weersparameters.</p>
                    </b-modal>
                </b-col>
            </b-row>
        <b-row style="height: 90%">
            <b-col cols="2" v-if="this.selectedStations.length > 1" style="height: 100%">
               <b-tabs pills vertical>
                    <b-tab v-for="(station, index) in selectedStations" v-bind:key="station.name"
                            v-bind:title="station.name"
                            v-on:click="update_data(index)">
                    </b-tab>
                </b-tabs> 
            </b-col> 
            <b-col v-bind:cols="this.selectedStations.length > 1 ? 7 : 9" id="d3-viz-area" style="height: 100%"/>
            <b-col v-bind:cols="this.selectedStations.length > 1 ? 3 : 3" id="d3-viz-area-legend" style="height: 100%"/>
        </b-row>
    </b-card>
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
                default: () => ['#0666b3', 'rgb(113,189,72)', 'rgb(187,50,47)']
            },
            "types": {
                type: Array,
                default: () => ['water', 'groen', 'verhard']
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


                // setup everything
                this.xLabels = ["0m", "20m", "50m", "100m", "250m", "500m"];
                this.padding = {top: 20, left: 45, right: 20, bottom: 32};

                this.add_legend();

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
                    .attr("fill", "black");

                this.xAxisGroup.call(this.xAxis)
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", "rotate(-45)");

                this.yAxisGroup.call(this.yAxis);

                this.tooltip = d3.select("body")
                    .append("div")
                    .style("position", "absolute")
                    .style("visibility", "hidden")
                    .style("padding", "3px")
                    .style("border-radius", "2px")
                    .style("background", "rgb(196,196,196)");

                this.update_data()


            },
            update_data(index=0) {
                this.svg.selectAll("rect.area").remove();

                if (this.selectedStations === undefined
                    || this.selectedStations.length === 0
                    || this.stations === undefined
                    || this.stations.length === 0) {
                    return;
                }
                const landUse = this.selectedStations[index]["landUse"];

                let bars = this.svg
                    .selectAll("rect.area")
                    .data(landUse)
                    .enter()
                    .append("g")
                    .classed('rect', true);

                for(let k = 0; k < landUse[0]['usage'].length; k++){
                    let self = this;
                    bars.append("rect")
                    .attr('class', 'area')
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
                    .on("mouseover", function(d) {
                        d3.select(this).attr("stroke", "black");
                        self.tooltip.text((100 * d['usage'][k]['value']).toFixed(2) + '% ' + self.types[k]);
                        return self.tooltip.style("visibility", "visible");
                    })
                    .on("mousemove", () => {return this.tooltip.style("top", (d3.event.pageY - 10) + "px").style("left", (d3.event.pageX + 10) + "px");})
                    .on("mouseout", function (){
                        d3.select(this).attr("stroke", "none");
                        return self.tooltip.style("visibility", "hidden");
                    });
                }

                return this.svg.node();
            },

            add_legend() {
                let divBoxLegend = this.legend.node().getBoundingClientRect();
                let w = divBoxLegend.width;
                let h = divBoxLegend.height - this.padding.top;
                const scaling_factor = h / 300;
                this.legend.selectAll("*").remove();

                this.svg_legend = this.legend.append("svg")
                    .attr("width", w)
                    .attr("height", h);

                this.g_legend = this.svg_legend.append("g")
                    .selectAll("g")
                    .data(this.types)
                    .enter().append("g")
                    .attr("transform", (d, i) => {
                        return "translate(" + 0 + "," + ((((i - (3 - 1) / 2) * (20)) + h / 3) * scaling_factor) + ")";
                    });

                this.g_legend.append("rect")
                    .attr("width", 18 * scaling_factor)
                    .attr("height", 18 * scaling_factor)
                    .attr("dy", "100em")
                    .attr("fill", (d, i) => this.colors[i]);

                this.g_legend.append("text")
                    .attr("x", 24 * scaling_factor)
                    .attr("y", 9 * scaling_factor)
                    .attr("dy", "0.35em")
                    .text((d) => {
                        return " " + d;
                    })
                    .style("font-size", 10 * scaling_factor);
            },
        }
    }
</script>

<style scoped>
    body {
        font-family: CircularStd, serif;
    }
</style>