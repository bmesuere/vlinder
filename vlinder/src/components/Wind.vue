<template>
    <div id="d3-viz-windrose" style="height: 100%; width: 100%">
        <div id="windrose-svg" style="height: 100%; width: 100%; text-align: center"/>
    </div>
</template>

<script>
    import VisualizationMixin from "../mixins/VisualizationMixin";
    import * as d3 from 'd3'

    export default {
        name: "WindRose",
        mixins: [
            VisualizationMixin
        ],
        props: {
            selectedStation: String
        },
        watch: {
            focusedVlinderData() {
                this.createPlot(this.focusedVlinderData);
            }
        },
        mounted (){
            this.div = d3.select('#d3-viz-windrose');
            this.raw_data = [];
            let observer = new ResizeObserver(() => this.createPlot(this.raw_data));
            observer.observe(this.div.node());
            this.createPlot(this.raw_data);
        },
        methods: {
            createPlot(raw_data) {
                const tooltip = d3.select("body")
                    .append("div")
                    .style("position", "absolute")
                    .style("z-index", "10")
                    .style("visibility", "hidden")
                    .style("padding", "5px")
                    .style("border-radius", "10px")
                    .style("background", "#fff");

                this.raw_data = raw_data;
                // Convert data to format needed for the windrose
                const data_csv_format = this.convertData(raw_data);
                const data = d3.csvParse(data_csv_format, (d, _, columns) => {
                    let total = 0;
                    for (let i = 1; i < columns.length; i++) total += d[columns[i]] = +d[columns[i]];
                    d.total = total;
                    return d;
                });

                // Setup
                let divBox = d3.select('#d3-viz-windrose').node().getBoundingClientRect();
                const size = Math.min(divBox['height'], divBox['width']);
                const width = size;
                const height = size;
                const legendWidth = width/5;
                const legendMargin = legendWidth/3;
                const legendModifier = width/600; // trial and error
                const margin = {top: 40, right: 80, bottom: 40, left: 40};
                const innerRadius = 20;
                const chartWidth = width - margin.left - margin.right - legendWidth*legendModifier;
                const chartHeight = height - margin.top - margin.bottom - legendWidth*legendModifier;
                const outerRadius = (Math.min(chartWidth, chartHeight) / 2);

                d3.select('#windrose-svg').selectAll("svg").remove();
                const svg = d3.select("#windrose-svg")
                    .append("svg")
                    .style("width", width + 'px')
                    .style("height", height + 'px')
                    .style("font", "10px sans-serif");

                const g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

                const angle = d3.scaleLinear()
                    .range([0, 2 * Math.PI]);
                
                const radius = d3.scaleLinear()
                    .range([innerRadius, outerRadius]);

                const x = d3.scaleBand()
                    .range([0, 2 * Math.PI])
                    .align(0);

                const y = d3.scaleLinear() //you can try scaleRadial but it scales differently
                    .range([innerRadius, outerRadius]);

                const z = d3.scaleOrdinal()
                    .range(["#4242f4", "#42c5f4", "#42f4ce", "#42f456", "#adf442", "#f4e242", "#f4a142", "#f44242"]);

                // Insert data
                x.domain(data.map(function (d) {
                    return d.angle;
                }));
                y.domain([0, d3.max(data, function (d) {
                    return d.total;
                })]);
                z.domain(data.columns.slice(1));
                // Extend the domain slightly to match the range of [0, 2π].
                angle.domain([0, d3.max(data, function (d, i) {
                    return i + 1;
                })]);
                radius.domain([0, d3.max(data, function (d) {
                    return d.y0 + d.y;
                })]);
                const angleOffset = -360.0 / data.length / 2.0;
                g.append("g")
                    .selectAll("g")
                    .data(d3.stack().keys(data.columns.slice(1))(data))
                    .enter().append("g")
                    .attr("fill", function (d) {
                        return z(d.key);
                    })
                    .selectAll("path")
                    .data(function (d) {
                        return d;
                    })
                    .enter().append("path")
                    .attr("d", d3.arc()
                        .innerRadius(function (d) {
                            return y(d[0]);
                        })
                        .outerRadius(function (d) {
                            return y(d[1]);
                        })
                        .startAngle(function (d) {
                            return x(d.data.angle);
                        })
                        .endAngle(function (d) {
                            return x(d.data.angle) + x.bandwidth();
                        })
                        .padAngle(0.01)
                        .padRadius(innerRadius))
                    .attr("transform", function() {return "rotate("+ angleOffset + ")"})
                    .on("mouseover", function(d){ tooltip.text((Math.round(((d[1] - d[0]) + Number.EPSILON) * 100) / 100).toString() + "%"); return tooltip.style("visibility", "visible");})
                        .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
                        .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

                const label = g.append("g")
                    .selectAll("g")
                    .data(data)
                    .enter().append("g")
                    .attr("text-anchor", "middle")
                    .attr("transform", function (d) {
                        return "rotate(" + ((x(d.angle) + x.bandwidth() / 2) * 180 / Math.PI - (90 - angleOffset)) + ")translate(" + (outerRadius + 30) + ",0)";
                    });

                label.append("text")
                    .attr("transform", function (d) {
                        return (x(d.angle) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "rotate(90)translate(0,16)" : "rotate(-90)translate(0,-9)";
                    })
                    .text(function (d) {
                        return d.angle;
                    })
                    .style("font-size", 14);

                g.selectAll(".axis")
                    .data(d3.range(angle.domain()[1]))
                    .enter().append("g")
                    .attr("class", "axis")
                    .attr("transform", function (d) {
                        return "rotate(" + angle(d) * 180 / Math.PI + ")";
                    })
                    .call(d3.axisLeft()
                        .scale(radius.copy().range([-innerRadius, -(outerRadius + 10)])));

                const yAxis = g.append("g")
                    .attr("text-anchor", "middle");

                const yTick = yAxis
                    .selectAll("g")
                    .data(y.ticks(5).slice(1))
                    .enter().append("g");

                yTick.append("circle")
                    .attr("fill", "none")
                    .attr("stroke", "gray")
                    .attr("stroke-dasharray", "4,4")
                    .attr("r", y);

                yTick.append("text")
                    .attr("y", function (d) {
                        return -y(d);
                    })
                    .attr("dy", "-0.35em")
                    .attr("x", function () {
                        return -10;
                    })
                    .text(y.tickFormat(5, "s"))
                    .style("font-size", 14);


                const legend = g.append("g")
                    .selectAll("g")
                    .data(data.columns.slice(1).reverse())
                    .enter().append("g")
                    .attr("transform", function(d, i) { return "translate(" + (outerRadius+legendMargin) + "," + ((i - (data.columns.length - 1) / 2) * (20*legendModifier)) + ")"; });

                legend.append("rect")
                    .attr("width", 18*legendModifier)
                    .attr("height", 18*legendModifier)
                    .attr("dy", "100em")
                    .attr("fill", z);

                legend.append("text")
                    .attr("x", 24*legendModifier)
                    .attr("y", 9*legendModifier)
                    .attr("dy", "0.35em")
                    .text(function(d) { return d.toString() + " m/s"; })
                    .style("font-size",10*legendModifier);                

                return svg.node();
            },
            convertData(raw_data) {
                const wind_values = [
                    ['angle', '0-4', '4-8', '8-12', '12-16', '16-20', '20-24', '24-28', '28+'],
                    ['N', 0, 0, 0, 0, 0, 0, 0, 0], // 1
                    ['NNE', 0, 0, 0, 0, 0, 0, 0, 0], // 2
                    ['NE', 0, 0, 0, 0, 0, 0, 0, 0], // 3
                    ['ENE', 0, 0, 0, 0, 0, 0, 0, 0], // 4
                    ['E', 0, 0, 0, 0, 0, 0, 0, 0], // 5
                    ['ESE', 0, 0, 0, 0, 0, 0, 0, 0], // 6
                    ['SE', 0, 0, 0, 0, 0, 0, 0, 0], // 7
                    ['SSE', 0, 0, 0, 0, 0, 0, 0, 0], // 8
                    ['S', 0, 0, 0, 0, 0, 0, 0, 0], // 9
                    ['SSW', 0, 0, 0, 0, 0, 0, 0, 0], // 10
                    ['SW', 0, 0, 0, 0, 0, 0, 0, 0], // 11
                    ['WSW', 0, 0, 0, 0, 0, 0, 0, 0], // 12
                    ['W', 0, 0, 0, 0, 0, 0, 0, 0], // 13
                    ['WNW', 0, 0, 0, 0, 0, 0, 0, 0], // 14
                    ['NW', 0, 0, 0, 0, 0, 0, 0, 0], // 15
                    ['NNW', 0, 0, 0, 0, 0, 0, 0, 0], // 16
                ];
                const amountOfValues = raw_data.length;
                raw_data.forEach(element => wind_values[this.convertDegreeIntoAngle(element.windDirection)][this.convertWindSpeedIntoIndex(element.windSpeed)] += 1.0 / amountOfValues * 100);
                let csv_str = ""
                wind_values.forEach(row => csv_str = csv_str.concat(row.toString(), '\n'));
                return csv_str;
            },
            convertDegreeIntoAngle(degree) {
                // 360 degrees are divided into 16 'buckets'
                // N: (-11.25, 11.25)
                let index = Math.floor((parseFloat(degree) + 11.25) / 22.5) % 16;
                return index + 1;
            },
            convertWindSpeedIntoIndex(windSpeed) {
                const index = Math.min(Math.floor(windSpeed / 4), 7);
                return index + 1;
            },
            getHeighestPercentage(wind_values) {
                let heighestPercentage = 0;
                for (let key in wind_values) {
                    if (Math.max(wind_values[key]) > heighestPercentage)
                        heighestPercentage = Math.max(wind_values[key]);
                }
            }
        }
    }
</script>

<style scoped>

</style>