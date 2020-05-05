<template>
    <div :id="id" style="height: 100%; width: 100%"></div>
</template>

<script>
    import VisualizationMixin from "../mixins/VisualizationMixin";
    import ResizeObserver from 'resize-observer-polyfill';
    import * as d3 from 'd3'
    import {uuidv4} from "../utils";

    export default {
        name: "LineChartVisualization",
        data: function () {
            return {
                id: "id" + uuidv4(),
                width: 0,
                height: 0,
                format: d3.timeFormat("%H:%M"),
                textSizeLegend: 12,
                titleSizeLegend: 16,
                paddingLegend: 5
            }
        },
        props: {

            "yAxisLabel": String,
            "xAxisUnit": String,
            "msgEmpty": String,
            "yAxisGetter": Function,
            "lineStrokeWidth": {
                type: Number,
                default: 1.5
            },
        },
        mixins: [
            VisualizationMixin
        ],
        watch: {
            focusedVlinderData() {
                    this.update_data(this.focusedVlinderData);
            }
        },
        mounted() {
            this.div = d3.select("#" + this.id);
            let observer = new ResizeObserver(this.create_graph);
            observer.observe(this.div.node());

            this.create_graph();
        },
        methods: {
            create_graph(){
                let div = d3.select("#" + this.id);

                this.div.selectAll("*").remove();

                let divBox = this.div.node().getBoundingClientRect();
                this.width = Math.max(divBox.width, 100);
                this.height = Math.max(divBox.height, 100);

                this.svg = div.append("svg", 0)
                    .attr("width", this.width)
                    .attr("height", this.height);

                // setup everything
                this.padding = {top: 20, left: 40, right: 20, bottom: 50};
                this.xScale = d3.scaleTime()
                    .range([this.padding.left + this.lineStrokeWidth / 2, this.width - this.padding.right]);

                this.yScale = d3.scaleLinear()
                    .range([this.height - this.padding.bottom, this.padding.top]);

                this.xAxis = d3.axisBottom()
                    .scale(this.xScale)
                    .ticks(24)
                    .tickFormat(this.format);

                this.yAxis = d3.axisLeft()
                    .scale(this.yScale)
                    .ticks(10);

                this.line = d3
                    .line()
                    .x(d => this.xScale(new Date(d.time)))
                    .y(d => this.yScale(this.yAxisGetter(d)));


                this.zoom = d3.zoom()
                    .translateExtent([[this.padding.left, this.padding.top], [this.width - this.padding.right - this.padding.left, this.height - this.padding.bottom - this.padding.top]])
                    .scaleExtent([1, Infinity])  // This control how much you can unzoom (x0.5) and zoom (x20)
                    .extent([[this.padding.left, this.padding.top], [this.width - this.padding.left - this.padding.right, this.height - this.padding.top - this.padding.bottom]])
                    .on("zoom", this.updateChart);

                this.clip = this.svg.append("defs").append("SVG:clipPath")
                    .attr("id", "clip" + this.id)
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

                this.tooltip_dots = d3.select({});  // Avoid errors when not data is selectd
                this.tooltip_line = this.svg.append("line")
                    .attr("x1", 50)
                    .attr("x2", 50)
                    .attr("y1", this.padding.top)
                    .attr("y2", this.yScale(0)) //TODO: checken wat dit geeft voor negatieve waarden
                    .style("opacity", 0)
                    .style("stroke", "gray");
                this.tooltip_box = this.svg
                    .append("g")
                    .style('display', 'none');
                this.tooltip_box.append("rect")
                    .attr("class", "legend-background")
                    .attr("fill", "#b3b3b3")
                    .attr("opacity", 0.6)
                    .attr("rx", '3')
                    .attr("ry", '3')
                    .attr('stroke', 'black');

                this.tooltip_box.append("text").attr("class", "title");

                this.svg.append("rect")
                    .attr("width", this.width - this.padding.left - this.padding.right)
                    .attr("height", this.height - this.padding.top - this.padding.bottom)
                    .style("fill", "none")
                    .style("pointer-events", "all")
                    .attr('transform', 'translate(' + this.padding.left + ',' + this.padding.top + ')')
                    .call(this.zoom)
                    .on("mouseover", this.showToolTips)
                    .on("mouseout", this.hideToolTips)
                    .on("mousemove", this.updateToolTips);

                if(this.current_data !== undefined){
                    this.update_data(this.current_data);
                }

            },
            update_data(data) {
                this.current_data = Array.from(data);
                let flattened_data = data.flat(1);

                // update scales
                let dates = flattened_data.map(x => new Date(x.time));
                let start = new Date(Math.min.apply(null, dates));
                let end = new Date(Math.max.apply(null, dates));

                this.xScale.domain([start, end]);
                let [min, max] = d3.extent(flattened_data, this.yAxisGetter);
                this.yScale.domain([min, min === max ? min + 1 : max]);

                this.xAxisGroup.call(this.xAxis)
                    .selectAll("text")
                    .style("text-anchor", "end")
                    .attr("dx", "-.8em")
                    .attr("dy", ".15em")
                    .attr("transform", "rotate(-45)");

                this.yAxisGroup.call(this.yAxis);

                this.selected = this.pathGroup
                    .selectAll("path")
                    .data(data);

                let path_data = this.selected
                    .enter()
                    .append("path")
                    .merge(this.selected);

                this.paths = path_data
                    .attr("clip-path", "url(#clip"+this.id+")")
                    .attr("stroke", (d, i) => this.colors[i])
                    .attr("fill", "white")
                    .attr("fill-opacity", 0)
                    .attr("stroke-width", this.lineStrokeWidth)
                    .attr("d", this.line);

                this.selected.exit().remove();

                // Add tooltip dots to graph
                this.tooltip_dots = this.svg
                    .selectAll(".tooltip-dots")
                    .data(data);
                this.tooltip_dots = this.tooltip_dots
                    .enter()
                    .append("circle")
                    .merge(this.tooltip_dots)
                    .attr("class", "tooltip-dots")
                    .attr("r", 3)
                    .attr("fill", (d, i) => this.colors[i])
                    .attr("stroke", "black")
                    .style("display", "none");
                this.tooltip_dots.exit().remove();
                // Add tooltip legend entries
                var legend_entries = this.tooltip_box
                    .selectAll("g.entry")
                    .data(data);
                legend_entries.exit().remove();
                var new_entries = legend_entries
                    .enter()
                    .append("g")
                    .attr("class", "entry")
                    .attr("height",20);
                new_entries.append("circle")
                    .attr("class", "color-dot")
                    .attr("r", 2);
                new_entries.append("text")
                    .attr("class", "y-value")
                    .attr("fill", "black");

                legend_entries.merge(new_entries)
                    .attr("transform", (d, i) => "translate(0, " + (i+1)*20 + ")");


                if(data && data.length> 0 && min===max){
                    this.svg
                        .append("text")
                        .attr("class", "empty")
                        .attr("y", this.height/2)
                        .text(this.msgEmpty)
                        .style("fill", "#95999c")
                        .style("font-size", "11px")
                        .attr("width", this.width)
                        .attr("x", this.width/2)
                        .style("text-anchor", "middle");
                } else {
                    this.svg.selectAll("text.empty").remove();
                }
            },
            showToolTips() {
                if (this.current_data && this.current_data.length > 0 && this.current_data[0].length > 0) {
                    this.tooltip_dots.style("display", null);
                    this.tooltip_line.style("opacity", 1);
                    this.tooltip_box.style("display", null);
                }
            },
            hideToolTips() {
                if (this.current_data && this.current_data.length > 0 && this.current_data[0].length > 0) {
                    this.tooltip_dots.style("display", "none");
                    this.tooltip_line.style("opacity", 0);
                    this.tooltip_box.style("display", "none");
                }
            },
            updateToolTips() {
                if (this.current_data && this.current_data.length > 0 && this.current_data[0].length > 0) {
                    // Update position of tooltip elements according to mouse position
                    //if ($.)
                    let mousePosition = d3.mouse(this.svg.node());
                    let currentXScale = this.xAxis.scale(); // Get zoomed scale
                    let mouseX = currentXScale.invert(mousePosition[0]); // waarde van x-as, hier dus datum
                    let bisectTime = d3.bisector(function (d) {
                        return new Date(d.time);
                    }).left;
                    let i = bisectTime(this.current_data[0], mouseX, 1); //hier zou punt muis moeten komen
                    let d0 = this.current_data[0][i - 1],
                        d1 = this.current_data[0][i];
                    let selectedIndex = (d1 !== undefined) && mouseX - d0.time > d1.time - mouseX ? i : i - 1;
                  //let selectedIndex = mouseX - new Date(d0.time) > new Date(d1.time) - mouseX ? i : i - 1;

                    let x_value = new Date(this.current_data[0][selectedIndex].time);
                    let toolTipX = currentXScale(x_value);
                    let y_values = this.current_data.map(d => this.yAxisGetter(d[selectedIndex]));

                    // Update tooltip dots
                    let self = this;
                    this.tooltip_dots
                        .attr("transform", function (d, i) {
                            let toolTipY = self.yScale(y_values[i]);
                            return "translate(" + toolTipX + ", " + toolTipY + ")";
                        });

                    // Update tooltip line
                    this.tooltip_line
                        .attr("x1", toolTipX)
                        .attr("x2", toolTipX);


                    this.tooltip_box
                        .selectAll("g.entry text.y-value")
                        .data(y_values)
                        .attr("fill", "black")
                        .attr("dx", 2*this.paddingLegend)
                        .style("font-size", this.textSizeLegend + "px")
                        .text(d => d+this.xAxisUnit);
                    this.tooltip_box
                        .selectAll("g.entry circle.color-dot")
                        .data(y_values)
                        .attr("r", 2)
                        .attr("transform", "translate(" + (1+this.paddingLegend) + ", "+ (1-this.paddingLegend) + ")")
                        .attr("fill", (d, i) => this.colors[i])
                        .attr("stroke", "black")
                    ;

                    // Update rectangle size
                    var textElements = this.tooltip_box
                        .selectAll("text.y-value");

                    var width_entries = d3.max(textElements.nodes(), y => y.getComputedTextLength()) + 3*this.paddingLegend;
                    var width_title = this.tooltip_box.select("text.title").node().getComputedTextLength() + 2*this.paddingLegend;
                    var width = Math.max(width_entries, width_title);

                    var height = (1+textElements.nodes().length)*20 + this.paddingLegend;

                    this.tooltip_box.select('rect')
                        .attr("y", -20)
                        .attr("x", 0)
                        .attr("height", height)
                        .attr("width", width);

                    // Update tooltip information box
                    let translate_x = mousePosition[0] + 5;
                    if (mousePosition[0] + 5 + width > this.width - this.padding.right){
                        translate_x = mousePosition[0] - 5 - width;
                    }
                    this.tooltip_box.attr("transform", "translate(" + (translate_x) + ", " + (mousePosition[1] - 100) + ")");

                    this.tooltip_box.select("text.title")
                        .text(this.format(new Date(x_value)))
                        .style("font-size", this.titleSizeLegend+"px")
                        .attr("dx", this.paddingLegend)
                        .attr("dy", 0)
                    ;

                }
            },
            updateChart() {
                if (this.current_data && this.current_data.length <= 0 || this.current_data[0].length <= 0){
                    return
                }

                // recover the new scale
                let newX = d3.event.transform.rescaleX(this.xScale);

                this.xAxis.scale(newX);

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
                this.updateToolTips();
            }


        }
    }
</script>

<style scoped>

</style>