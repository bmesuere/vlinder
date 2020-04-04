<template>
    <div id="d3-viz-temperature" style="width:auto">
        <div id="temperature-svg" style="width:auto"/>
        <input type="checkbox" id="perceivedTempCheckbox" checked="checked" value="showPerceivedTempCheckbox">
        <label for="perceivedTempCheckbox"> Gevoelstemperatuur **Only semi implemented**</label><br>
        <input type="checkbox" id="avgTempCheckbox" checked="checked" value="showAvgTempCheckbox">
        <label for="avgTempCheckbox"> Gemiddelde **Not implemented yet**</label><br>
    </div>
</template>


<script>
import VisualizationMixin from "../mixins/VisualizationMixin";
    import vlinderService from "../services/vlinderService";
    import * as d3 from 'd3'

    export default {
        name: "Temperature",
        mixins: [
            VisualizationMixin
        ],


        mounted () {
            // This is code is ran on creation of the component
            let stationsDiv = d3.select('#stations');
            vlinderService.getStations(d => stationsDiv.html(d.data['0xwg6AsDvbnxXzB4S3c2BRyJ']['VLINDER']));
            let latestDiv = d3.select('#latest');
            vlinderService.getLatestVlinderData(d => latestDiv.html(d.data[0]['temp']));
            vlinderService.getVlinderData('jvy7zdAPZ5ymI2hydh6tvnmm',
                new Date(2020, 1, 14, 12, 33, 20, 0), // todo use correct input date
                new Date(2020, 1, 14, 14, 0, 0, 0), // todo use correct input date
                dataset => this.createPlot(dataset.data));

        },

        methods: {
            /**
             * Compute the perceived temperature based on the WCTI formula
             * source: https://www.meteo.be/nl/info/veelgestelde-vragen/metingen-en-meeteenheden/hoe-bereken-je-de-gevoelstemperatuur
             * @param T current measured temperature
             * @param V current measured wind speed
             * @returns {number}
             */
            computePerceivedTemperature(T, V) {
                const V0_16 = Math.pow(V, 0.16);
                return 13.12 + 0.6215*T - 11.37 * V0_16 + 0.3965*T*V0_16;
            },

            /**
             * Adds a line to the plot that shows the perceived temperature of the data
             */
            addPerceivedTemperature(data, graph, xScale, yScale){
                const linePerceived = d3.line()
                    .x(d => xScale(new Date(d['time'])))
                    .y(d => yScale(this.computePerceivedTemperature(d['temp'], d['windSpeed'])));

                graph.append("path")
                    .datum(data)
                    .attr("class", "linePerceivedTemp")
                    .attr("d", linePerceived);
            },

            /**
             * Create a plot based on the given data
             */
            createPlot(data) {
                const padding = {top: 20, left: 45, right: 40, bottom: 55};
                const width = window.innerWidth * 0.7;
                const height = window.innerHeight * 0.5;
                const [startDateString, endDateString] = [data[0]['time'], data[data.length - 1]['time']];
                const startDate = new Date(startDateString);
                const endDate = new Date(endDateString);
                // set time formatting based on first and last date
                let formatTime = d3.timeFormat("%H:%M");
                if (startDate.getFullYear() !== endDate.getFullYear()) {
                    formatTime = d3.timeFormat("%e %b %y")
                } else if (startDate.getMonth() !== endDate.getMonth()) {
                    formatTime = d3.timeFormat("%e %b");
                } else if (startDate.getDay() !== endDate.getDay()) {
                    formatTime = d3.timeFormat("%e %b, %H:%M");
                }

                const graph = d3.select('#temperature-svg')
                    .append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .attr("preserveAspectRatio", "xMinYMin meet");

                //create x scale and axis
                const xScale = d3.scaleTime()
                    .domain([startDate, endDate])
                    .range([padding.left, width - padding.right]);

                const xAxis = d3.axisBottom()
                    .scale(xScale)
                    .ticks(10)
                    .tickFormat(formatTime);

                // create y scale and axis
                const yScale = d3.scaleLinear()
                    .domain([Math.min(0, d3.min(data, d => d['temp'] * 1.1)), d3.max(data, d => d['temp']) * 1.1])
                    .range([height - padding.bottom, padding.top]);

                const yAxis = d3.axisLeft()
                    .scale(yScale);

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

                // create and add data line to plot
                const lineReal = d3.line()
                    .x(d => xScale(new Date(d['time'])))
                    .y(d => yScale(d['temp']));

                graph.append("path")
                    .datum(data)
                    .attr("class", "lineRealTemp")
                    .attr("d", lineReal);

                // add perceived temperature line if checked
                if(document.getElementById('perceivedTempCheckbox').checked) {
                    this.addPerceivedTemperature(data, graph, xScale, yScale);
                }
                if(document.getElementById('avgTempCheckbox').checked) {
                    //todo
                }

                return graph.node();
            }
        }


    }
</script>

<style >
    .lineRealTemp {
        fill: none;
        stroke: #ff0000;
        stroke-width: 1.5;
    }
    .linePerceivedTemp {
        fill: none;
        stroke: #ffc6e0;
        stroke-width: 1;
    }
    .lineAvgTemp {
        fill: none;
        stroke: rgba(0, 0, 0, 0.24);
        stroke-width: 1;
    }
</style>