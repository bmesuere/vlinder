<template>
    <div id="d3-viz-windrose">
        <div id="windrose-svg" width="960" height="960" font-family="sans-serif" font-size="10"/>
        <div id="selected-vlinder" style="font-size: larger"></div>
    </div>
</template>

<script>
    import VisualizationMixin from "../mixins/VisualizationMixin";
    import vlinderService from "../services/vlinderService";
    import * as d3 from 'd3'

    export default {
        name: "WindRose",
        mixins: [
            VisualizationMixin
        ],
        props: {
            // Declare properties where a parent component can bind information to
            selectedStation: String
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
                vlinderDiv.html(this.latestVlinderData[0]['temp']);
            },
            selectedStation() {
                // This code is ran when selected station is changed => selectedStation is a variable bound on creation
                // of this component in Dashboard
                if (this.selectedStation !== '') {
                    // let vlinderDiv = d3.select('#latest-vlinder');
                    let nameDiv = d3.select('#selected-vlinder');
                    nameDiv.html('Selected Station: ' + this.selectedStation);
                    vlinderService.getVlinderData(this.selectedStation,
                        new Date(2020, 1, 14, 23, 33, 20, 0),
                        new Date(2020, 1, 16, 10, 0, 0, 0)
                    ).then(d => this.createPlot(d.data));
                }
            }
        },
        methods: {
            createPlot(raw_data) {
                // setup
                const data_csv_format = this.convertData(raw_data);
                const data = d3.csvParse(data_csv_format, (d, _, columns) => {
                    let total = 0;
                    for (let i = 1; i < columns.length; i++) total += d[columns[i]]= +d[columns[i]];
                    d.total = total;
                    return d;
                });
                const start = new Date();
                start.setDate(start.getDate() - 1);
                const end = new Date();
                end.setDate(end.getDate());

                const width = 975;
                const height = width;
                const margin = {top: 40, right: 80, bottom: 40, left: 40};
                const innerRadius = 20;
                const chartWidth = width - margin.left - margin.right;
                const chartHeight= height - margin.top - margin.bottom;
                const outerRadius = (Math.min(chartWidth, chartHeight) / 2);
                
                d3.select('#windrose-svg').selectAll("svg").remove();
                const svg = d3.select("#windrose-svg")
                    .append("svg")
                    .style("width", width)
                    .style("height", height)
                    .style("font", "10px sans-serif"),

                        g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

                    var angle = d3.scaleLinear()
                        .range([0, 2 * Math.PI]);

                    var radius = d3.scaleLinear()
                        .range([innerRadius, outerRadius]);

                    var x = d3.scaleBand()
                        .range([0, 2 * Math.PI])
                        .align(0);

                    var y = d3.scaleLinear() //you can try scaleRadial but it scales differently
                        .range([innerRadius, outerRadius]);

                    var z = d3.scaleOrdinal()
                        .range(["#4242f4", "#42c5f4", "#42f4ce", "#42f456", "#adf442", "#f4e242", "#f4a142", "#f44242"]);
                
                // Insert data
                x.domain(data.map(function(d) { return d.angle; }));
                y.domain([0, d3.max(data, function(d) { return d.total; })]);
                z.domain(data.columns.slice(1));
                // Extend the domain slightly to match the range of [0, 2π].
                angle.domain([0, d3.max(data, function(d,i) { return i + 1; })]);
                radius.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);
                const angleOffset = -360.0/data.length/2.0;
                g.append("g")
                    .selectAll("g")
                    .data(d3.stack().keys(data.columns.slice(1))(data))
                    .enter().append("g")
                    .attr("fill", function(d) { return z(d.key); })
                    .selectAll("path")
                    .data(function(d) { return d; })
                    .enter().append("path")
                    .attr("d", d3.arc()
                        .innerRadius(function(d) { return y(d[0]); })
                        .outerRadius(function(d) { return y(d[1]); })
                        .startAngle(function(d) { return x(d.data.angle); })
                        .endAngle(function(d) { return x(d.data.angle) + x.bandwidth(); })
                        .padAngle(0.01)
                        .padRadius(innerRadius))
                    .attr("transform", function() {return "rotate("+ angleOffset + ")"});

                var label = g.append("g")
                    .selectAll("g")
                    .data(data)
                    .enter().append("g")
                    .attr("text-anchor", "middle")
                    .attr("transform", function(d) { return "rotate(" + ((x(d.angle) + x.bandwidth() / 2) * 180 / Math.PI - (90-angleOffset)) + ")translate(" + (outerRadius+30) + ",0)"; });

                label.append("text")
                    .attr("transform", function(d) { return (x(d.angle) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "rotate(90)translate(0,16)" : "rotate(-90)translate(0,-9)"; })
                    .text(function(d) { return d.angle; })
                    .style("font-size",14);

                g.selectAll(".axis")
                    .data(d3.range(angle.domain()[1]))
                    .enter().append("g")
                    .attr("class", "axis")
                    .attr("transform", function(d) { return "rotate(" + angle(d) * 180 / Math.PI + ")"; })
                    .call(d3.axisLeft()
                        .scale(radius.copy().range([-innerRadius, -(outerRadius+10)])));

                var yAxis = g.append("g")
                    .attr("text-anchor", "middle");

                var yTick = yAxis
                    .selectAll("g")
                    .data(y.ticks(5).slice(1))
                    .enter().append("g");

                yTick.append("circle")
                    .attr("fill", "none")
                    .attr("stroke", "gray")
                    .attr("stroke-dasharray", "4,4")
                    .attr("r", y);

                yTick.append("text")
                    .attr("y", function(d) { return -y(d); })
                    .attr("dy", "-0.35em")
                    .attr("x", function() { return -10; })
                    .text(y.tickFormat(5, "s"))
                    .style("font-size",14);


                var legend = g.append("g")
                    .selectAll("g")
                    .data(data.columns.slice(1).reverse())
                    .enter().append("g")
                    .attr("transform", function(d, i) { return "translate(" + (outerRadius+0) + "," + (-outerRadius + 40 +(i - (data.columns.length - 1) / 2) * 20) + ")"; });

                legend.append("rect")
                    .attr("width", 18)
                    .attr("height", 18)
                    .attr("fill", z);

                legend.append("text")
                    .attr("x", 24)
                    .attr("y", 9)
                    .attr("dy", "0.35em")
                    .text(function(d) { return d; })
                    .style("font-size",8);

                

                return svg.node();

            },
            convertData(raw_data){
                // Arrays have 8 elements: 0-4,4-8,8-12,12-16,16-20,20-24,24-28,28+
                const wind_values = [
                    ['angle', '0-4' , '4-8' , '8-12', '12-16', '16-20', '20-24', '24-28', '28+'],
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
                raw_data.forEach(element => wind_values[this.convertDegreeIntoAngle(element.windDirection)][this.convertWindSpeedIntoIndex(element.windSpeed)] += 1.0/amountOfValues*100);
                let csv_str = ""
                wind_values.forEach(row => csv_str = csv_str.concat(row.toString(), '\n'));
                return csv_str;
            },
            convertDegreeIntoAngle(degree) {
                // 360 degrees are divided into 16 'buckets'
                // E: (-11.25, 11.25) 
                // % 16 is needed to fix degrees above 348.5, which resulted in index 16.
                // let index = Math.floor((parseFloat(degree)+11.25)/22.5) % 16;
                /* const degreeToAngleMapper = {
                    0: 'E',
                    1: 'ENE',
                    2: 'NE',
                    3: 'NNE',
                    4: 'N',
                    5: 'NNW',
                    6: 'NW',
                    7: 'WNW',
                    8: 'W',
                    9: 'WSW',
                    10: 'SW',
                    11: 'SSW',
                    12: 'S',
                    13: 'SSE',
                    14: 'SE',
                    15: 'ESE'
                }; */
                
                if (degree < 11.25 || degree > 348.75) return 5;
                if (degree < 33.75) return 4;
                if (degree < 56.25) return 3;
                if (degree < 78.75) return 2;
                if (degree < 101.25) return 1;
                if (degree < 123.75) return 16;
                if (degree < 145.25) return 15;
                if (degree < 168.75) return 14;
                if (degree < 191.25) return 13;
                if (degree < 213.75) return 12;
                if (degree < 236.25) return 11;
                if (degree < 258.75) return 10;
                if (degree < 281.25) return 9;
                if (degree < 303.75) return 8;
                if (degree < 326.25) return 7;
                if (degree < 348.75) return 6;
                
                // should never happen
                return 5;
            },
            convertWindSpeedIntoIndex(windSpeed){
                const index = Math.min(Math.floor(windSpeed/4), 7);
                /* const indexToSpeedMapper = {
                    0: '0-4',
                    1: '4-8',
                    2: '8-12',
                    3: '12-16',
                    4: '16-20',
                    5: '20-24',
                    6: '24-28',
                    7: '28+'
                } */
                return index+1; 
            },
            getHeighestPercentage(wind_values){
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