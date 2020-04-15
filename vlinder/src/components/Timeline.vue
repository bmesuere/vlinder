<template>
    <div id="timeline-div"/>
</template>

<script>
    import VisualizationMixin from "../mixins/VisualizationMixin";
    import * as d3 from "d3";

    const dist = 2;
    const ticks = 10;
    const stroke_width = 40;
    const horizontal_bar_padding = 1;
    const vertical_bar_padding = 1;
    const [paddingleft, paddingright, paddingtop, paddingbottom] = [70, 50, 50, 0];

    async function construct_graph(datas, selectedStations, selectedNames) {

        const graph = d3
            .select("#timeline-div #timeline-svg");

        const axis = d3.select("#timeline-div #timeline-svg #timeline-x-axis");

        const yaxis = d3.select("#timeline-div #timeline-svg #timeline-y-axis");

        let startDate, endDate;
        /*
        var datas = [];
        var promises = [];
        var i = 0;

        for (i = 0; i < selectedStations.length; i++) {
            promises.push(vlinderService.getVlinderData(
                selectedStations[i],
                startDate,
                endDate).then(
                d => {
                    var dataset = fillMissingData(d.data);
                    datas.push(...dataset)
                }
            ));
        }

        await Promise.all(promises);

         */
        let height = (selectedStations.length + 1) * stroke_width;


        graph
            .transition()
            .duration(500)
            .attr(
                "viewBox",
                "0 0 " + (paddingleft + paddingright + 288 * dist) + " " + (height + paddingtop + paddingbottom)
            )
            .attr("direction", "ltr");

        if (datas.length > 0) {
            let dates = [];

            for (let i = 0; i < datas.length; i++) {
                dates.push(new Date(datas[i].time))
            }

            startDate = new Date(Math.min.apply(null, dates));
            endDate = new Date(Math.max.apply(null, dates))
        }

        const xScale = d3
            .scaleTime()
            .domain([startDate, new Date(endDate.getTime() + 5 * 60000)])
            .range([paddingleft + 3, 288 * dist + paddingleft - paddingright]);

        const yScale = d3
            .scaleLinear()
            .domain([0, selectedStations.length + 1])
            .range([paddingtop, height + paddingtop]);

        xScale.ticks(d3.timeMinute, 5);

        const xAxis = d3.axisBottom() // create a new bottom axis
            .scale(xScale); // that uses the domain of the xScale
        xAxis.ticks(ticks);

        const yAxis = d3.axisLeft()
            .scale(yScale);
        yAxis.ticks(selectedStations.length + 1);
        var name_axis = d3.scaleBand()
            .domain(selectedNames)         // This is what is written on the Axis: from 0 to 100
            .range([0, height - stroke_width]);

        axis
            .transition()
            .duration(500)
            .attr("transform", `translate(0, ${paddingtop + height - stroke_width})`)
            .call(xAxis);

        yaxis
            .transition()
            .duration(500)
            .attr("transform", `translate(${paddingleft}, ${paddingtop})`)
            .call(d3.axisLeft(name_axis))
            .selectAll("text")
            .attr("transform", "translate(-5,-10)rotate(-45)");


        let a = graph.selectAll("rect").data(datas);

        a.exit()
            .transition()
            .duration(500)
            .attr("height", 0)
            .attr("y", paddingtop)
            .remove();

        a.transition()
            .attr("x", d => xScale(new Date(d.time)))
            .attr("y", d => yScale(selectedStations.indexOf(d.id)))
            .attr("width", (dist + 1) - horizontal_bar_padding)
            .attr("height", stroke_width - vertical_bar_padding)
            .attr("class", d => "bar " + getClass(d))
            .duration(500);

        a.on("mouseover",
            d => handleMouseOver(
                d,
                xScale(new Date(d.time)),
                yScale(selectedStations.indexOf(d.id)),
                selectedNames[selectedStations.indexOf(d.id)]))
            .on("mouseout", handleMouseOut);

        a.enter()
            .append("rect")
            .attr("x", d => xScale(new Date(d.time)))
            .attr("y", d => yScale(selectedStations.indexOf(d.id)))
            .attr("width", (dist + 1) - horizontal_bar_padding)
            .attr("height", 0)
            .attr("class", d => "bar " + getClass(d))
            .on("mouseover",
                d => handleMouseOver(
                    d,
                    xScale(new Date(d.time)),
                    yScale(selectedStations.indexOf(d.id)),
                    selectedNames[selectedStations.indexOf(d.id)]))
            .on("mouseout", handleMouseOut)
            .transition()
            .attr("height", stroke_width - vertical_bar_padding)
            .duration(700)
    }

    function updateData(datas, selectedStations) {
        let selectedIds = [];
        let selectedNames = [];
        for (let station of selectedStations) {
            selectedIds.push(station.value);
            selectedNames.push(station.text);
        }
        construct_graph(datas, selectedIds, selectedNames);
    }
/*
    function getBoundaries(date) {
        if (date === undefined) {
            date = new Date();
        }
        var start = new Date(date - 3600000);
        var end = new Date(start);
        end.setDate(start.getDate() + 1);
        return [start, end]
    }
 */

    function handleMouseOver(d, xpos, ypos, name) {
        let g = d3
            .select("#timeline-div #timeline-svg")
            .append("g")
            .attr("id", "temp")
            .attr("opacity", 0.5);

        let h = 50;
        let x = xpos - 60;
        let y = ypos - stroke_width + 4;
        g.append("rect")
            .attr("x", x - 3)
            .attr("y", y - 14)
            .attr("width", 140)
            .attr("height", h)
            .attr("fill", "white")
            .attr("stroke-width", 0.5)
            .attr("stroke", "black");

        g.append("text")
            .attr("x", x + 20)
            .attr("y", y)
            .text(name)
            .attr("font-size", "12px")
            .attr("font-family", "sans-serif");

        g.append("circle")
            .attr("cx", x + 5)
            .attr("cy", y - 4)
            .attr("r", 5)
            .attr("fill", "orange")
            .attr("class", getClass(d));

        g.append("text")
            .attr("x", x)
            .attr("y", y + 15)
            .text(new Date(d.time).toLocaleString())
            .attr("font-size", "12px")
            .attr("font-family", "sans-serif");

        if (d.status === "missing") {
            g.append("text")
                .attr("x", x)
                .attr("y", y + 30)
                .text("no data")
                .attr("font-size", "12px")
                .attr("font-family", "sans-serif")
        } else {
            g.append("text")
                .attr("x", x)
                .attr("y", y + 30)
                .text("🌡 " + d.temp + "°C\t" + "🌧️ " + d.humidity + "%")
                .attr("font-size", "12px")
                .attr("font-family", "sans-serif")
        }

        g.transition()
            .attr("opacity", 1)
            .duration(30)

    }

    function handleMouseOut() {
        d3.select("#timeline-div #timeline-svg")
            .selectAll("#temp")
            .transition()
            .attr("opacity", 0)
            .duration(30)
            .remove()
    }


    function getClass(d) {
        if (d.status === "Ok") return "ok";
        else if (d.status === "missing") return "missing";
        else return "niet-ok"
    }

    export default {
        name: "Timeline",
        mixins: [VisualizationMixin],
        props: {
            datas: Array,
            selectedStations: Array
        },
        async mounted() {
            const graph = d3
                .select("#timeline-div")
                .append("svg")
                .attr("id", "timeline-svg");

            graph
                .append("g")
                .attr("id", "timeline-x-axis");

            graph
                .append("g")
                .attr("id", "timeline-y-axis");
        },
        watch: {
            datas() {
                updateData(this.datas, this.selectedStations);
            }
        }
    };
</script>

<style>

    .a {
        fill: green;
    }

    .test {
        width: 300px;
        height: 146px;
    }

    .lol {
        border: 2px solid black;
        background-color: white;
    }

    .ok {
        fill: green;
    }

    #temp {
        pointer-events: none;
    }

    #stations-selector {
        width: 100px;
    }

    .missing {
        fill: rgb(128, 128, 128);
    }

    .bar.ok:hover {
        fill: lightgreen;
    }

    .bar.missing:hover {
        fill: lightgray
    }

    .dot.ok {
        fill: white;
        stroke: green;
        stroke-width: 4px;
    }

    .dot.ok:hover {
        fill: lightgreen;
    }

    .niet-ok {
        fill: red;
    }

    .dot.niet-ok {
        fill: white;
        stroke: red;
        stroke-width: 4px;
    }

    .dot.niet-ok:hover {
        fill: salmon;
    }

    .bar.niet-ok:hover {
        fill: salmon;
    }

    .dot:hover {
        cursor: pointer;
    }

    .bar:hover {
        cursor: pointer;
    }

    div #timeline-div {
        overflow: auto;
        direction: rtl;
        height: 500px;
        scrollbar-color: #ccdbee #eeeeff; /* thumb and track color */
        scrollbar-width: thin;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    #timeline-svg {
        height: 100%;
        width: 100%;
    }

    div.status {
        display: inline-block;
        width: 20px;
        height: 20px;
        margin: 1px;
        background-color: green;
    }
</style>